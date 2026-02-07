// src/app/hooks/useTextToSpeech.ts
import { useState, useCallback, useRef, useEffect } from 'react';

export function useTextToSpeech(language: 'fr' | 'ar' | 'en' = 'fr', slowMode: boolean = false) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const lastMessageRef = useRef('');
  const isMountedRef = useRef(true);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const speechQueueRef = useRef<{ text: string; onEnd?: () => void }[]>([]);
  const isProcessingQueueRef = useRef(false);
  const isSpeakingRef = useRef(false);

  useEffect(() => {
    isMountedRef.current = true;
    isSpeakingRef.current = isSpeaking;
    
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
      isSpeakingRef.current = false;
      stopSpeaking();
      
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, [language]);

  // Fonction pour traiter la file d'attente de parole
  const processQueue = useCallback(() => {
    if (isProcessingQueueRef.current || speechQueueRef.current.length === 0) {
      return;
    }

    isProcessingQueueRef.current = true;
    const nextItem = speechQueueRef.current[0];

    console.log('Processing speech from queue:', nextItem.text.substring(0, 50) + '...');

    // Fonction pour passer à l'élément suivant dans la file
    const processNext = () => {
      // Retirer l'élément traité
      speechQueueRef.current = speechQueueRef.current.slice(1);
      isProcessingQueueRef.current = false;
      
      // Exécuter le callback de fin si fourni
      if (nextItem.onEnd) {
        setTimeout(() => {
          nextItem.onEnd?.();
        }, 100);
      }
      
      // Traiter l'élément suivant s'il y en a
      if (speechQueueRef.current.length > 0) {
        setTimeout(() => {
          processQueue();
        }, 300); // Petit délai entre les messages
      }
    };

    // Vérifier que la synthèse vocale est disponible
    if (!nextItem.text || typeof window === 'undefined' || !window.speechSynthesis) {
      console.warn('Speech synthesis not available');
      processNext();
      return;
    }

    // Annuler toute parole en cours
    if (window.speechSynthesis.speaking || currentUtteranceRef.current) {
      window.speechSynthesis.cancel();
      currentUtteranceRef.current = null;
    }

    lastMessageRef.current = nextItem.text;

    const utterance = new SpeechSynthesisUtterance(nextItem.text);
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
        console.log('Speech started:', nextItem.text.substring(0, 50) + '...');
        setIsSpeaking(true);
        isSpeakingRef.current = true;
      }
    };

    utterance.onend = () => {
      if (isMountedRef.current) {
        console.log('Speech ended');
        setIsSpeaking(false);
        isSpeakingRef.current = false;
        currentUtteranceRef.current = null;
        
        // Attendre un peu avant de passer au suivant
        setTimeout(() => {
          processNext();
        }, 200);
      }
    };

    utterance.onerror = (event: SpeechSynthesisErrorEvent) => {
      // Ignorer l'erreur "interrupted" qui est normale lors de l'annulation
      if (event.error === 'interrupted' || event.error === 'canceled') {
        console.log('Speech was interrupted (normal when cancelling)');
        if (isMountedRef.current) {
          setIsSpeaking(false);
          isSpeakingRef.current = false;
          currentUtteranceRef.current = null;
          processNext();
        }
        return;
      }

      console.error('Speech synthesis error:', {
        error: event.error,
        type: event.type,
        text: nextItem.text.substring(0, 30) + '...'
      });

      if (isMountedRef.current) {
        setIsSpeaking(false);
        isSpeakingRef.current = false;
        currentUtteranceRef.current = null;
        processNext();
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
          const chunks = nextItem.text.match(/.{1,150}/g);
          if (chunks && chunks.length > 0) {
            // Réinsérer les morceaux dans la file
            const newItems = chunks.map((chunk, index) => ({
              text: chunk,
              onEnd: index === chunks.length - 1 ? nextItem.onEnd : undefined
            }));
            
            // Remplacer l'élément actuel par les morceaux
            speechQueueRef.current = [
              ...newItems,
              ...speechQueueRef.current.slice(1)
            ];
            
            isProcessingQueueRef.current = false;
            setTimeout(() => {
              processQueue();
            }, 100);
          } else {
            processNext();
          }
          break;
        default:
          console.error('Erreur inconnue de synthèse vocale');
      }
    };

    // Démarrer la synthèse
    try {
      window.speechSynthesis.speak(utterance);
      console.log('Attempting to speak:', nextItem.text.substring(0, 30) + '...');
    } catch (error) {
      console.error('Failed to start speech synthesis:', error);
      if (isMountedRef.current) {
        setIsSpeaking(false);
        isSpeakingRef.current = false;
        currentUtteranceRef.current = null;
        processNext();
      }
    }
  }, [language, slowMode]);

  const speak = useCallback((text: string, onEnd?: () => void) => {
    if (!text || typeof window === 'undefined' || !window.speechSynthesis) {
      console.warn('Speech synthesis not available');
      if (onEnd) setTimeout(onEnd, 0);
      return;
    }

    // Ajouter à la file d'attente
    speechQueueRef.current.push({ text, onEnd });
    
    console.log('Added to speech queue:', text.substring(0, 50) + '...', 'Queue length:', speechQueueRef.current.length);
    
    // Démarrer le traitement si pas déjà en cours
    if (!isProcessingQueueRef.current && !isSpeakingRef.current) {
      processQueue();
    }
  }, [processQueue]);

  const repeatLastMessage = useCallback(() => {
    if (lastMessageRef.current) {
      speak(lastMessageRef.current);
    }
  }, [speak]);

  const stopSpeaking = useCallback(() => {
    console.log('stopSpeaking called');
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (isMountedRef.current) {
      setIsSpeaking(false);
      isSpeakingRef.current = false;
      currentUtteranceRef.current = null;
      
      // Vider la file d'attente
      const pendingCallbacks = speechQueueRef.current
        .filter(item => item.onEnd)
        .map(item => item.onEnd);
      
      speechQueueRef.current = [];
      isProcessingQueueRef.current = false;
      
      // Exécuter les callbacks en attente
      pendingCallbacks.forEach(callback => {
        if (callback) setTimeout(callback, 0);
      });
    }
  }, []);

  // Fonction pour vérifier si on peut parler immédiatement
  const canSpeakNow = useCallback(() => {
    return !isSpeakingRef.current && speechQueueRef.current.length === 0;
  }, []);

  // Fonction pour vider la file d'attente
  const clearQueue = useCallback(() => {
    console.log('Clearing speech queue');
    const pendingCallbacks = speechQueueRef.current
      .filter(item => item.onEnd)
      .map(item => item.onEnd);
    
    speechQueueRef.current = [];
    isProcessingQueueRef.current = false;
    
    // Exécuter les callbacks en attente
    pendingCallbacks.forEach(callback => {
      if (callback) setTimeout(callback, 0);
    });
  }, []);

  // Fonction pour obtenir l'état de la file d'attente
  const getQueueStatus = useCallback(() => {
    return {
      isSpeaking: isSpeakingRef.current,
      queueLength: speechQueueRef.current.length,
      isProcessingQueue: isProcessingQueueRef.current,
      currentMessage: lastMessageRef.current
    };
  }, []);

  return {
    speak,
    isSpeaking,
    repeatLastMessage,
    stopSpeaking,
    canSpeakNow,
    clearQueue,
    getQueueStatus
  };
}