// src/app/hooks/useVoiceRecognition.ts
import { useState, useEffect, useRef, useCallback } from 'react';
import { useSoundFeedback } from './useSoundFeedback';

// Définir l'interface pour SpeechRecognitionResult
interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
  length: number;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult;
  length: number;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface ISpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
  onspeechstart: (() => void) | null;
  onspeechend: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition: new () => ISpeechRecognition;
    webkitSpeechRecognition: new () => ISpeechRecognition;
  }
}

export function useVoiceRecognition(language: 'fr' | 'ar' | 'en' = 'fr') {
  const { playBeep } = useSoundFeedback();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<'granted' | 'denied' | 'prompt' | 'checking'>('checking');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const recognitionRef = useRef<ISpeechRecognition | null>(null);
  const lastTranscriptRef = useRef('');
  const isMountedRef = useRef(true);

  // Check microphone permissions
  useEffect(() => {
    const checkPermissions = async () => {
      try {
        if (navigator.permissions && navigator.permissions.query) {
          const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });
          setPermissionStatus(result.state as 'granted' | 'denied' | 'prompt');
          
          result.onchange = () => {
            setPermissionStatus(result.state as 'granted' | 'denied' | 'prompt');
          };
        } else {
          setPermissionStatus('prompt');
        }
      } catch (err) {
        console.log('Permission API not available, will request on first use');
        setPermissionStatus('prompt');
      }
    };

    checkPermissions();

    // Set mounted ref
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Initialize and manage speech recognition
  useEffect(() => {
    // Check if browser supports Speech Recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.warn('Speech Recognition not supported in this browser');
      setError('Speech Recognition not supported in this browser');
      return;
    }

    const recognition = new SpeechRecognition();
    
    // Configuration simplifiée
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.lang = language === 'fr' ? 'fr-FR' : language === 'ar' ? 'ar-TN' : 'en-US';

    recognition.onresult = (event: SpeechRecognitionEvent) => {
  if (!isMountedRef.current) return;

  let finalText = '';

  for (let i = event.resultIndex; i < event.results.length; i++) {
    const result = event.results[i];

    if (result.isFinal) {
      finalText += result[0].transcript + ' ';
    }
  }

  finalText = finalText.trim().toLowerCase();

  if (!finalText) return;

  console.log('Speech recognition result FINAL:', finalText);

  // 🟢 On attend la FIN RÉELLE de la phrase
  if (finalText !== lastTranscriptRef.current) {
    lastTranscriptRef.current = finalText;

    // → On met d’abord le texte
    setTranscript(finalText);

    // → On arrête APRÈS un micro délai pour laisser finir la capture
    setTimeout(() => {
      try {
        recognitionRef.current?.stop();
      } catch {}
    }, 300);
  }
};

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.log('Speech recognition error:', event.error);
      if (!isMountedRef.current) return;
      
      setIsListening(false);
      setIsProcessing(false);
      
      // Gérer les erreurs spécifiques
      switch (event.error) {
        case 'no-speech':
          setError(null);
          break;
          
        case 'not-allowed':
        case 'permission-denied':
          setPermissionStatus('denied');
          setError('not-allowed');
          break;
          
        case 'audio-capture':
          setError('audio-capture');
          break;
          
        case 'network':
          setError('network');
          break;
          
        default:
          setError(event.error);
      }
    };

    recognition.onend = () => {
        playBeep('stop');   // ça c’est OK après
  console.log('Speech recognition ended');

  playBeep('stop');   // 🔥 signal fermeture micro

      if (!isMountedRef.current) return;
      
      setIsListening(false);
      setIsProcessing(false);
      
      // Ne pas redémarrer automatiquement - laissé à App.tsx
    };

    recognition.onstart = () => {
  console.log('Speech recognition started');

  playBeep('start');   // 🔥 ICI LE SIGNAL SONORE

  if (!isMountedRef.current) return;

  setIsListening(true);

      setError(null);
      lastTranscriptRef.current = '';
      setTranscript('');
    };

    recognitionRef.current = recognition;

    // Cleanup function
    return () => {
      console.log('Cleaning up speech recognition');
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
          recognitionRef.current.stop();
        } catch (e) {
          // Ignorer les erreurs de nettoyage
        }
        recognitionRef.current = null;
      }
    };
  }, [language, isProcessing]);

  // Fonction pour démarrer l'écoute de manière sécurisée
  const startListening = useCallback(() => {
  console.log('startListening called', { permissionStatus, isListening, isProcessing });

  if (permissionStatus === 'denied') {
    setError('not-allowed');
    return;
  }

  if (!recognitionRef.current) return;
  if (isListening || isProcessing) {
    console.log('Already listening → skip start()');
    return;
  }

  try {
    // 🟢 1. D'abord le signal sonore
    playBeep('start');

    // 🟢 2. Petit délai AVANT d’ouvrir le micro
    setTimeout(() => {

      setTranscript('');
      setError(null);
      lastTranscriptRef.current = '';

      recognitionRef.current?.start();
      console.log('Recognition started AFTER beep');

    }, 300);   // ← délai parfait pour malvoyants

  } catch (error: any) {
    if (error.name === 'InvalidStateError') {
      console.log('Recognition already started (ignored)');
      return;
    }

    console.error('Start error:', error);

    if (error.name === 'NotAllowedError') {
      setPermissionStatus('denied');
      setError('not-allowed');
    } else {
      setError('failed-to-start');
    }
  }
}, [isListening, isProcessing, permissionStatus, playBeep]);


  // Fonction pour arrêter l'écoute
  const stopListening = useCallback(() => {
    console.log('stopListening called');
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
        console.log('Recognition stopped successfully');
      } catch (e) {
        console.log('Error stopping recognition:', e);
      }
    }
  }, [isListening]);

  // Réinitialiser la transcription
  const resetTranscript = useCallback(() => {
    setTranscript('');
    lastTranscriptRef.current = '';
  }, []);

  // Effacer les erreurs
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Fonction pour forcer un redémarrage
  const restartListening = useCallback(() => {
    console.log('Restarting listening manually');
    stopListening();
    
    // Attendre un peu avant de redémarrer
    setTimeout(() => {
      startListening();
    }, 500);
  }, [stopListening, startListening]);

  return {
    isListening,
    transcript,
    finalTranscript: transcript,
    error,
    permissionStatus,
    isProcessing,
    startListening,
    stopListening,
    restartListening,
    resetTranscript,
    clearError,
  };
}