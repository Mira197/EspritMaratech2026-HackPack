// src/app/hooks/useTextToSpeech.ts
import { useState, useCallback, useRef, useEffect } from 'react';

export function useTextToSpeech(language: 'fr' | 'ar' | 'en' = 'fr', slowMode: boolean = false) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const lastMessageRef = useRef('');
  const isMountedRef = useRef(true);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    isMountedRef.current = true;
    
    // Fonction pour charger les voix
    const loadVoices = () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        const voices = window.speechSynthesis.getVoices();
        console.log('Voices disponibles:', voices.map(v => `${v.lang} - ${v.name}`));
      }
    };

    if (typeof window !== 'undefined' && window.speechSynthesis) {
      // Écouter le chargement des voix
      window.speechSynthesis.onvoiceschanged = loadVoices;
      loadVoices(); // Charger immédiatement si déjà disponible
    }

    return () => {
      isMountedRef.current = false;
      stopSpeaking();
      
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, [language]);

  const speak = useCallback((text: string) => {
    if (!text || typeof window === 'undefined' || !window.speechSynthesis) {
      console.warn('Speech synthesis not available');
      return;
    }

    // Annuler toute parole en cours
    if (window.speechSynthesis.speaking || currentUtteranceRef.current) {
      window.speechSynthesis.cancel();
    }

    lastMessageRef.current = text;

    const utterance = new SpeechSynthesisUtterance(text);
    currentUtteranceRef.current = utterance;
    
    // Configuration de base
    utterance.lang = language === 'fr' ? 'fr-FR' : 
                    language === 'ar' ? 'ar-SA' : 
                    'en-US';
    
    utterance.rate = slowMode ? 0.75 : 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // Sélection automatique de la voix
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      const voices = window.speechSynthesis.getVoices();
      
      // Chercher une voix pour la langue spécifiée
      let selectedVoice = voices.find(voice => 
        language === 'fr' ? voice.lang.startsWith('fr') :
        language === 'ar' ? voice.lang.startsWith('ar') :
        voice.lang.startsWith('en')
      );

      // Fallback: utiliser la première voix disponible
      if (!selectedVoice && voices.length > 0) {
        selectedVoice = voices[0];
        console.log(`Using fallback voice: ${selectedVoice.name} (${selectedVoice.lang})`);
      }

      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
    }

    // Gestionnaires d'événements
    utterance.onstart = () => {
      if (isMountedRef.current) {
        console.log('Speech started:', text.substring(0, 50) + '...');
        setIsSpeaking(true);
      }
    };

    utterance.onend = () => {
      if (isMountedRef.current) {
        console.log('Speech ended');
        setIsSpeaking(false);
        currentUtteranceRef.current = null;
      }
    };

    utterance.onerror = (event: SpeechSynthesisErrorEvent) => {
      // Ignorer l'erreur "interrupted" qui est normale lors de l'annulation
      if (event.error === 'interrupted' || event.error === 'canceled') {
        console.log('Speech was interrupted (normal when cancelling)');
        if (isMountedRef.current) {
          setIsSpeaking(false);
          currentUtteranceRef.current = null;
        }
        return;
      }

      console.error('Speech synthesis error:', {
        error: event.error,
        type: event.type
      });

      if (isMountedRef.current) {
        setIsSpeaking(false);
        currentUtteranceRef.current = null;
      }

      // Gestion des autres erreurs
      switch (event.error) {
        case 'audio-busy':
        case 'audio-hardware':
          console.error('Problème matériel audio');
          break;
        case 'network':
          console.error('Erreur réseau');
          break;
        case 'synthesis-unavailable':
        case 'synthesis-failed':
          console.error('Synthèse vocale non disponible');
          break;
        case 'language-unavailable':
          console.error(`Langue ${language} non disponible`);
          // Essayer avec l'anglais comme fallback
          if (language !== 'en') {
            console.log('Tentative avec l\'anglais comme fallback');
            utterance.lang = 'en-US';
            try {
              window.speechSynthesis.speak(utterance);
            } catch (err) {
              console.error('Fallback also failed:', err);
            }
          }
          break;
        case 'text-too-long':
          console.error('Texte trop long');
          // Diviser le texte en morceaux plus petits
          const chunks = text.match(/.{1,150}/g);
          if (chunks && chunks.length > 0) {
            setTimeout(() => {
              speak(chunks[0]);
              if (chunks.length > 1) {
                setTimeout(() => {
                  speak(chunks.slice(1).join(' '));
                }, 2000);
              }
            }, 500);
          }
          break;
        default:
          console.error('Erreur inconnue de synthèse vocale');
      }
    };

    // Démarrer la synthèse
    try {
      window.speechSynthesis.speak(utterance);
      console.log('Attempting to speak:', text.substring(0, 30) + '...');
    } catch (error) {
      console.error('Failed to start speech synthesis:', error);
      if (isMountedRef.current) {
        setIsSpeaking(false);
        currentUtteranceRef.current = null;
      }
    }
  }, [language, slowMode]);

  const repeatLastMessage = useCallback(() => {
    if (lastMessageRef.current) {
      speak(lastMessageRef.current);
    }
  }, [speak]);

  const stopSpeaking = useCallback(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (isMountedRef.current) {
      setIsSpeaking(false);
      currentUtteranceRef.current = null;
    }
  }, []);

  return {
    speak,
    isSpeaking,
    repeatLastMessage,
    stopSpeaking,
  };
}