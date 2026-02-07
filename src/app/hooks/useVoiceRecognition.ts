import { useState, useEffect, useRef, useCallback } from 'react';

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

// Définir les types pour les timeouts
type Timeout = ReturnType<typeof setTimeout>;

export function useVoiceRecognition(language: 'fr' | 'ar' | 'en' = 'fr') {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<'granted' | 'denied' | 'prompt' | 'checking'>('checking');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const recognitionRef = useRef<ISpeechRecognition | null>(null);
  const lastTranscriptRef = useRef('');
  const silenceTimeoutRef = useRef<Timeout | null>(null);
  const restartTimeoutRef = useRef<Timeout | null>(null);
  const isUserSpeakingRef = useRef(false);

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
    
    // IMPORTANT: Configuration pour éviter les répétitions
    recognition.continuous = false; // Pas en mode continu - s'arrête après chaque phrase
    recognition.interimResults = false; // Pas de résultats intermédiaires pour simplifier
    recognition.maxAlternatives = 1; // Une seule alternative
    recognition.lang = language === 'fr' ? 'fr-FR' : language === 'ar' ? 'ar-TN' : 'en-US';

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      // Ne pas traiter si déjà en traitement
      if (isProcessing) return;
      
      setIsProcessing(true);
      
      if (event.results.length > 0 && event.results[0].length > 0) {
        const result = event.results[0][0];
        const finalTranscript = result.transcript.trim().toLowerCase();
        
        console.log('Speech recognition result:', finalTranscript);
        
        // Vérifier si c'est un nouveau texte (pas un doublon récent)
        if (finalTranscript && finalTranscript !== lastTranscriptRef.current) {
          lastTranscriptRef.current = finalTranscript;
          setTranscript(finalTranscript);
          
          // Arrêter l'écoute immédiatement après avoir reçu une commande
          try {
            recognition.stop();
          } catch (e) {
            // Ignorer les erreurs d'arrêt
          }
        }
      }
      
      setIsProcessing(false);
    };

    recognition.onspeechstart = () => {
      isUserSpeakingRef.current = true;
      console.log('User started speaking');
    };

    recognition.onspeechend = () => {
      isUserSpeakingRef.current = false;
      console.log('User stopped speaking');
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.log('Speech recognition error:', event.error);
      setIsListening(false);
      setIsProcessing(false);
      isUserSpeakingRef.current = false;
      
      // Gérer les erreurs spécifiques
      switch (event.error) {
        case 'no-speech':
          // Pas d'erreur pour silence, redémarrer normalement
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
      console.log('Speech recognition ended');
      setIsListening(false);
      setIsProcessing(false);
      isUserSpeakingRef.current = false;
      
      // Nettoyer les timeouts
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
        silenceTimeoutRef.current = null;
      }
      
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
        restartTimeoutRef.current = null;
      }
      
      // Redémarrer après un délai, mais seulement si permission accordée
      if (permissionStatus === 'granted' && !isProcessing) {
        restartTimeoutRef.current = setTimeout(() => {
          console.log('Auto-restarting recognition');
          try {
            if (recognitionRef.current) {
              recognitionRef.current.start();
            }
          } catch (e) {
            console.log('Error auto-restarting:', e);
          }
        }, 1000); // Délai plus long pour éviter les boucles
      }
    };

    recognition.onstart = () => {
      console.log('Speech recognition started');
      setIsListening(true);
      setError(null);
      lastTranscriptRef.current = ''; // Réinitialiser à chaque démarrage
      setTranscript('');
      setInterimTranscript('');
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
      
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
        silenceTimeoutRef.current = null;
      }
      
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
        restartTimeoutRef.current = null;
      }
    };
  }, [language, permissionStatus, isProcessing]);

  // Fonction pour démarrer l'écoute de manière sécurisée
  const startListening = useCallback(() => {
    console.log('startListening called, permission:', permissionStatus, 'isListening:', isListening, 'isProcessing:', isProcessing);
    
    if (permissionStatus === 'denied') {
      console.log('Microphone permission denied');
      setError('not-allowed');
      return;
    }

    if (recognitionRef.current && !isListening && !isProcessing) {
      try {
        // Nettoyer les états précédents
        setTranscript('');
        setInterimTranscript('');
        setError(null);
        lastTranscriptRef.current = '';
        
        // Démarrer la reconnaissance
        recognitionRef.current.start();
        console.log('Recognition started successfully');
        
      } catch (error: any) {
        console.error('Error starting recognition:', error);
        
        if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
          setPermissionStatus('denied');
          setError('not-allowed');
        } else if (error.name === 'InvalidStateError') {
          console.log('Recognition already started or not ready');
        } else {
          setError('failed-to-start');
        }
      }
    } else {
      console.log('Cannot start: isListening=', isListening, 'isProcessing=', isProcessing);
    }
  }, [isListening, permissionStatus, isProcessing]);

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
    setInterimTranscript('');
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
    const restartTimeout = setTimeout(() => {
      startListening();
    }, 500);
    
    // Stocker le timeout pour nettoyage
    restartTimeoutRef.current = restartTimeout;
  }, [stopListening, startListening]);

  return {
    isListening,
    transcript,
    finalTranscript: transcript,
    interimTranscript,
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