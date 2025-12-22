import { useState } from "react";

const CATEGORY_EMOJIS = [
  // Allgemein
  "📝", "📰", "💬", "💡", "⭐", "🔥", "❤️", "✨",
  // Orte & Gebäude
  "🏠", "🏢", "🏫", "🏥", "🏪", "🏭", "⛪", "🏰",
  // Menschen & Gemeinschaft
  "👥", "👨‍👩‍👧‍👦", "🤝", "👋", "🎭", "🎪", "🎉", "🎊",
  // Verkehr & Transport
  "🚗", "🚌", "🚲", "🚶", "🛤️", "🚧", "🚦", "✈️",
  // Natur & Wetter
  "🌳", "🌻", "🌊", "☀️", "🌧️", "❄️", "🌈", "🐕",
  // Sport & Freizeit
  "⚽", "🏃", "🎾", "🏊", "🎣", "🎮", "🎬", "🎵",
  // Essen & Trinken
  "🍕", "🍔", "☕", "🍺", "🍰", "🛒", "👨‍🍳", "🍽️",
  // Arbeit & Bildung
  "💼", "📚", "🎓", "💻", "📊", "🔧", "⚙️", "🏗️",
  // Warnung & Info
  "⚠️", "🚨", "📢", "ℹ️", "❓", "🔔", "📌", "🎯",
  // Sonstiges
  "🎁", "💰", "🏆", "🌟", "💪", "🙏", "👍", "🤔"
];

interface EmojiPickerProps {
  selectedEmoji: string;
  onSelect: (emoji: string) => void;
}

export const EmojiPicker = ({ selectedEmoji, onSelect }: EmojiPickerProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 flex items-center justify-center bg-secondary border border-border rounded-lg text-2xl hover:bg-secondary/80 transition-colors"
      >
        {selectedEmoji}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 mt-2 z-50 bg-card border border-border rounded-xl p-3 shadow-lg w-64 max-h-48 overflow-y-auto">
            <div className="grid grid-cols-8 gap-1">
              {CATEGORY_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => {
                    onSelect(emoji);
                    setIsOpen(false);
                  }}
                  className={`w-7 h-7 flex items-center justify-center rounded hover:bg-secondary transition-colors text-lg ${
                    selectedEmoji === emoji ? "bg-primary/20 ring-1 ring-primary" : ""
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
