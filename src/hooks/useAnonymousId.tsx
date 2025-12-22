import { useState, useEffect } from 'react';

const ANONYMOUS_ID_KEY = 'stade_news_anonymous_id';

export const useAnonymousId = () => {
  const [anonymousId, setAnonymousId] = useState<string>('');

  useEffect(() => {
    let id = localStorage.getItem(ANONYMOUS_ID_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(ANONYMOUS_ID_KEY, id);
    }
    setAnonymousId(id);
  }, []);

  return anonymousId;
};

// Random nickname generator for anonymous users
const adjectives = ["Mysteriöser", "Anonymer", "Stille", "Nachtaktive", "Geheimer", "Unsichtbare", "Mutige", "Kluge", "Neugierige", "Schnelle"];
const nouns = ["Stader", "Vogel", "Schatten", "Beobachter", "Erzähler", "Wanderer", "Insider", "Geist", "Fuchs", "Eule"];

export const generateNickname = () => {
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const num = Math.floor(Math.random() * 99) + 1;
  return `${adj}${noun}${num}`;
};
