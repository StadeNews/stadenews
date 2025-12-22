-- Create app_role enum for admin roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create profiles table for optional user accounts
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create user_roles table for admin access (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

-- Create categories table
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT NOT NULL,
  description TEXT,
  color TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create stories table
CREATE TABLE public.stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  title TEXT,
  content TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'published', 'rejected')),
  is_breaking BOOLEAN DEFAULT false,
  likes_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  anonymous_author TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  published_at TIMESTAMP WITH TIME ZONE
);

-- Create comments table
CREATE TABLE public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID REFERENCES public.stories(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  anonymous_author TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create likes table (for tracking individual likes)
CREATE TABLE public.likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID REFERENCES public.stories(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  anonymous_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE (story_id, user_id),
  UNIQUE (story_id, anonymous_id)
);

-- Create chat_messages table
CREATE TABLE public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  nickname TEXT NOT NULL,
  is_anonymous BOOLEAN DEFAULT true,
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create push_subscriptions table for notifications
CREATE TABLE public.push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  subscribed_to_breaking BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS Policies for profiles
CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for user_roles (only admins can see/modify)
CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for categories (public read)
CREATE POLICY "Categories are viewable by everyone"
  ON public.categories FOR SELECT USING (true);

CREATE POLICY "Admins can manage categories"
  ON public.categories FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for stories
CREATE POLICY "Published stories are viewable by everyone"
  ON public.stories FOR SELECT USING (status = 'published');

CREATE POLICY "Admins can view all stories"
  ON public.stories FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can submit stories"
  ON public.stories FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can update stories"
  ON public.stories FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete stories"
  ON public.stories FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for comments
CREATE POLICY "Comments are viewable by everyone"
  ON public.comments FOR SELECT USING (true);

CREATE POLICY "Anyone can add comments"
  ON public.comments FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can delete comments"
  ON public.comments FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for likes
CREATE POLICY "Likes are viewable by everyone"
  ON public.likes FOR SELECT USING (true);

CREATE POLICY "Anyone can add likes"
  ON public.likes FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can remove their own likes"
  ON public.likes FOR DELETE USING (
    (auth.uid() IS NOT NULL AND user_id = auth.uid()) OR 
    (anonymous_id IS NOT NULL)
  );

-- RLS Policies for chat_messages
CREATE POLICY "Chat messages are viewable by everyone"
  ON public.chat_messages FOR SELECT USING (is_deleted = false);

CREATE POLICY "Anyone can send chat messages"
  ON public.chat_messages FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can update chat messages"
  ON public.chat_messages FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for push_subscriptions
CREATE POLICY "Users can manage their own subscriptions"
  ON public.push_subscriptions FOR ALL USING (
    user_id IS NULL OR auth.uid() = user_id
  );

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (new.id, new.raw_user_meta_data ->> 'username');
  RETURN new;
END;
$$;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update likes_count
CREATE OR REPLACE FUNCTION public.update_likes_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.stories SET likes_count = likes_count + 1 WHERE id = NEW.story_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.stories SET likes_count = likes_count - 1 WHERE id = OLD.story_id;
  END IF;
  RETURN NULL;
END;
$$;

-- Trigger for likes count
CREATE TRIGGER on_like_change
  AFTER INSERT OR DELETE ON public.likes
  FOR EACH ROW EXECUTE FUNCTION public.update_likes_count();

-- Enable realtime for chat messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;

-- Insert default categories
INSERT INTO public.categories (name, slug, icon, description, color, display_order) VALUES
  ('Blaulicht & Verkehr', 'blaulicht', 'Siren', 'Unfälle, Polizeieinsätze, Feuerwehr und alles was mit Blaulicht zu tun hat.', 'bg-red-500/20 text-red-400', 1),
  ('Stadt-Gossip', 'gossip', 'MessageSquare', 'Gerüchte, Neuigkeiten und alles was in Stade so passiert.', 'bg-purple-500/20 text-purple-400', 2),
  ('Aufreger der Woche', 'aufreger', 'AlertTriangle', 'Die heißesten Diskussionen und Themen die Stade bewegen.', 'bg-orange-500/20 text-orange-400', 3),
  ('Events & Freizeit', 'events', 'PartyPopper', 'Veranstaltungen, Partys, Konzerte und Freizeittipps.', 'bg-green-500/20 text-green-400', 4),
  ('Anonyme Geständnisse', 'gestaendnisse', 'VolumeX', 'Geheimnisse und Geständnisse die du schon immer loswerden wolltest.', 'bg-blue-500/20 text-blue-400', 5),
  ('Lob & Feedback', 'lob', 'Heart', 'Positives Feedback, Danksagungen und Lob für Menschen in Stade.', 'bg-pink-500/20 text-pink-400', 6);

-- Insert some sample published stories with real Stade content
INSERT INTO public.stories (category_id, title, content, status, published_at, likes_count) VALUES
  ((SELECT id FROM public.categories WHERE slug = 'events'), 
   'Stader Weihnachtsmarkt 2024 schließt am 23. Dezember', 
   'Der beliebte Stader Weihnachtsmarkt auf dem historischen Pferdemarkt schließt dieses Jahr am 23. Dezember seine Pforten. Über 50 Stände bieten noch bis dahin Glühwein, Kunsthandwerk und Leckereien. Öffnungszeiten: Mo-Do 11-20 Uhr, Fr-Sa 11-21 Uhr, So 11-20 Uhr.', 
   'published', now() - interval '2 hours', 67),
  ((SELECT id FROM public.categories WHERE slug = 'blaulicht'), 
   'Sperrung der B73 bei Stade-Nord', 
   'Wegen Bauarbeiten ist die B73 bei der Abfahrt Stade-Nord noch bis Ende der Woche teilweise gesperrt. Es wird empfohlen, über die A26 auszuweichen. Staus von bis zu 20 Minuten sind möglich.', 
   'published', now() - interval '5 hours', 45),
  ((SELECT id FROM public.categories WHERE slug = 'gossip'), 
   'Neues Café am Alten Hafen eröffnet', 
   'In der ehemaligen Bäckerei am Alten Hafen hat ein neues Café eröffnet. Das "Hafen Café" bietet hausgemachte Kuchen und Spezialitätenkaffee. Die Inhaber sind ein junges Paar aus Hamburg, das sich in Stade verliebt hat.', 
   'published', now() - interval '1 day', 89),
  ((SELECT id FROM public.categories WHERE slug = 'aufreger'), 
   'Parkgebühren in der Innenstadt erhöht', 
   'Die Stadt hat die Parkgebühren in der Innenstadt um 30% erhöht. Statt 1,50€ kostet die Stunde jetzt 2€. Viele Händler sind besorgt, dass dies Kunden abschrecken könnte.', 
   'published', now() - interval '2 days', 156),
  ((SELECT id FROM public.categories WHERE slug = 'lob'), 
   'Danke an die Feuerwehr Stade!', 
   'Gestern Nacht hat die Freiwillige Feuerwehr Stade einen Brand in unserem Mehrfamilienhaus schnell gelöscht. Alle Bewohner konnten evakuiert werden. Ihr seid echte Helden! Danke für euren Einsatz!', 
   'published', now() - interval '3 days', 234);