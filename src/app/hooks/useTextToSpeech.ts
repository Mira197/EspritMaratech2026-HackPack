import { useState, useCallback, useRef } from 'react';

export function useTextToSpeech(language: 'fr' | 'ar' | 'en' = 'fr', slowMode: boolean = false) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const lastMessageRef = useRef('');
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const speak = useCallback((text: string, priority: 'high' | 'normal' = 'normal') => {
    if (!text) return;

    // Cancel any ongoing speech if high priority
    if (priority === 'high' && window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }

    lastMessageRef.current = text;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === 'fr' ? 'fr-FR' : language === 'ar' ? 'ar-TN' : 'en-US';
    utterance.rate = slowMode ? 0.75 : 0.9; // Slower rate for slow mode
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      setIsSpeaking(false);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [language, slowMode]);

  const repeatLastMessage = useCallback(() => {
    if (lastMessageRef.current) {
      speak(lastMessageRef.current, 'high');
    }
  }, [speak]);

  const stopSpeaking = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  return {
    speak,
    isSpeaking,
    repeatLastMessage,
    stopSpeaking,
  };
}