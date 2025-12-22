import { useState, useEffect } from 'react';

const ANON_PREF_KEY = 'stade_news_prefer_anonymous';

export const useAnonymousPreference = () => {
  const [preferAnonymous, setPreferAnonymous] = useState<boolean | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(ANON_PREF_KEY);
    if (stored !== null) {
      setPreferAnonymous(stored === 'true');
    }
  }, []);

  const savePreference = (value: boolean) => {
    localStorage.setItem(ANON_PREF_KEY, String(value));
    setPreferAnonymous(value);
  };

  const clearPreference = () => {
    localStorage.removeItem(ANON_PREF_KEY);
    setPreferAnonymous(null);
  };

  return { preferAnonymous, savePreference, clearPreference };
};
