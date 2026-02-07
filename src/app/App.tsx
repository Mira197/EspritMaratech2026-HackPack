import React, { useState, useEffect, useRef } from 'react';
import { Volume2, Mic, MicOff, RefreshCw, Settings, HelpCircle } from 'lucide-react';
import { BankingAssistant } from './components/BankingAssistant';
import { ShoppingListAssistant } from './components/ShoppingListAssistant';
import { VoiceControls } from './components/VoiceControls';
import { HelpModal } from './components/HelpModal';
import { PermissionAlert } from './components/PermissionAlert';
import { MicrophonePermissionBanner } from './components/MicrophonePermissionBanner';
import { GlobalNavigation } from './components/GlobalNavigation';
import { useVoiceRecognition } from './hooks/useVoiceRecognition';
import { useTextToSpeech } from './hooks/useTextToSpeech';

type Language = 'fr' | 'ar' | 'en';
type Screen = 'home' | 'banking' | 'shopping';

const translations = {
  fr: {
    appTitle: 'Assistant Vocal Accessible',
    welcome: 'Bienvenue. Dites "banque" pour la banque ou "courses" pour la liste de courses.',
    listening: 'Écoute en cours...',
    notListening: 'Appuyez sur le micro ou dites "écouter"',
    processing: 'Traitement en cours...',
    speaking: 'En train de parler...',
    idle: 'Prêt à écouter',
    bankingModule: 'Module bancaire',
    shoppingModule: 'Liste de courses',
    repeat: 'Répéter',
    settings: 'Paramètres',
    highContrast: 'Contraste élevé',
    slowMode: 'Mode lent',
    language: 'Langue',
    voiceStatus: 'État vocal',
    goHome: 'Retour accueil',
    help: 'Aide',
    lastAction: 'Dernière action',
    voiceCommands: 'Commandes disponibles',
    exampleCommands: ['Dites "banque" pour accéder aux services bancaires', 'Dites "courses" pour votre liste de courses', 'Dites "aide" pour obtenir de l\'aide', 'Dites "passer en anglais" pour changer de langue'],
    languageSwitched: 'Langue changée en français',
    errorDidntUnderstand: 'Je n\'ai pas compris. Voulez-vous répéter ou obtenir de l\'aide ?',
    helpHome: 'Vous êtes sur l\'écran d\'accueil. Vous pouvez dire "banque" pour les services bancaires, "courses" pour la liste de courses, "aide" pour l\'aide, ou "répéter" pour réentendre le message.',
    onboarding: 'Bienvenue dans votre assistant vocal accessible. Utilisez des commandes vocales simples pour naviguer. Dites "aide" à tout moment pour obtenir de l\'aide.',
  },
  ar: {
    appTitle: 'المساعد الصوتي الشامل',
    welcome: 'مرحبا. قل "بنك" للخدمات المصرفية أو "تسوق" لقائمة التسوق.',
    listening: 'جاري الاستماع...',
    notListening: 'اضغط على الميكروفون أو قل "استمع"',
    processing: 'جاري المعالجة...',
    speaking: 'جاري التحدث...',
    idle: 'جاهز للاستماع',
    bankingModule: 'الخدمات المصرفية',
    shoppingModule: 'قائمة التسوق',
    repeat: 'كرر',
    settings: 'الإعدادات',
    highContrast: 'تباين عالي',
    slowMode: 'الوضع البطيء',
    language: 'اللغة',
    voiceStatus: 'حالة الصوت',
    goHome: 'العودة للرئيسية',
    help: 'مساعدة',
    lastAction: 'آخر إجراء',
    voiceCommands: 'الأوامر المتاحة',
    exampleCommands: ['قل "بنك" للخدمات المصرفية', 'قل "تسوق" لقائمة التسوق', 'قل "مساعدة" للحصول على المساعدة', 'قل "حول إلى الإنجليزية" لتغيير اللغة'],
    languageSwitched: 'تم تغيير اللغة إلى العربية',
    errorDidntUnderstand: 'لم أفهم. هل تريد تكرار أو الحصول على المساعدة؟',
    helpHome: 'أنت في الشاشة الرئيسية. يمكنك قول "بنك" للخدمات المصرفية، "تسوق" لقائمة التسوق، "مساعدة" للمساعدة، أو "كرر" لإعادة سماع الرسالة.',
    onboarding: 'مرحبًا بك في مساعدك الصوتي الشامل. استخدم أوامر صوتية بسيطة للتنقل. قل "مساعدة" في أي وقت للحصول على المساعدة.',
  },
  en: {
    appTitle: 'Accessible Voice Assistant',
    welcome: 'Welcome. Say "bank" for banking or "shopping" for the shopping list.',
    listening: 'Listening...',
    notListening: 'Press the microphone or say "listen"',
    processing: 'Processing...',
    speaking: 'Speaking...',
    idle: 'Ready to listen',
    bankingModule: 'Banking',
    shoppingModule: 'Shopping List',
    repeat: 'Repeat',
    settings: 'Settings',
    highContrast: 'High Contrast',
    slowMode: 'Slow Mode',
    language: 'Language',
    voiceStatus: 'Voice Status',
    goHome: 'Go Home',
    help: 'Help',
    lastAction: 'Last Action',
    voiceCommands: 'Available Commands',
    exampleCommands: ['Say "bank" to access banking services', 'Say "shopping" for your shopping list', 'Say "help" to get assistance', 'Say "switch to French" to change language'],
    languageSwitched: 'Language switched to English',
    errorDidntUnderstand: 'I didn\'t understand. Would you like to repeat or get help?',
    helpHome: 'You are on the home screen. You can say "bank" for banking services, "shopping" for shopping list, "help" for assistance, or "repeat" to hear the message again.',
    onboarding: 'Welcome to your accessible voice assistant. Use simple voice commands to navigate. Say "help" at any time for assistance.',
  },
};

export default function App() {
  const [language, setLanguage] = useState<Language>('fr');
  const [highContrast, setHighContrast] = useState(false);
  const [slowMode, setSlowMode] = useState(false);
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [lastMessage, setLastMessage] = useState('');
  const [lastAction, setLastAction] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [isFirstVisit, setIsFirstVisit] = useState(true);
  const [errorCount, setErrorCount] = useState(0);
  const [shouldListen, setShouldListen] = useState(true);
  const [isProcessingCommand, setIsProcessingCommand] = useState(false);
  
  const { 
    isListening, 
    transcript, 
    startListening, 
    stopListening, 
    resetTranscript, 
    error, 
    permissionStatus, 
    clearError,
    isProcessing: isVoiceProcessing,
    restartListening
  } = useVoiceRecognition(language);
  
  const { speak, isSpeaking, repeatLastMessage, stopSpeaking } = useTextToSpeech(language, slowMode);
  
  const t = translations[language];
  const isRTL = language === 'ar';

  // Références pour gérer les timeouts
  const restartTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const processTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Voice status derived from states
  const voiceStatus = isSpeaking ? 'speaking' : isListening ? 'listening' : 'idle';

  // Nettoyer les timeouts
  const clearTimeouts = () => {
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }
    if (processTimeoutRef.current) {
      clearTimeout(processTimeoutRef.current);
      processTimeoutRef.current = null;
    }
  };

  // Nettoyage à la fin
  useEffect(() => {
    return () => {
      clearTimeouts();
      stopSpeaking();
    };
  }, [stopSpeaking]);

  // Announce welcome message on first load with onboarding
  useEffect(() => {
    clearTimeouts();
    
    const hasVisited = localStorage.getItem('hasVisited');
    setShouldListen(false); // Arrêter d'écouter pendant le message initial
    
    if (!hasVisited) {
      const timer = setTimeout(() => {
        speak(t.onboarding + ' ' + t.welcome);
        setLastMessage(t.onboarding);
        setLastAction('App started - First visit');
        localStorage.setItem('hasVisited', 'true');
        
        // Redémarrer l'écoute après le message
        restartTimeoutRef.current = setTimeout(() => {
          setShouldListen(true);
        }, 4000); // Plus long pour le premier message
      }, 1500);
      
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        speak(t.welcome);
        setLastMessage(t.welcome);
        setLastAction('App started');
        
        // Redémarrer l'écoute après le message
        restartTimeoutRef.current = setTimeout(() => {
          setShouldListen(true);
        }, 2500);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  // Gérer l'écoute automatique quand shouldListen change
  useEffect(() => {
    if (shouldListen && !isListening && !isSpeaking && !isProcessingCommand && permissionStatus === 'granted') {
      console.log('Auto-starting listening');
      restartTimeoutRef.current = setTimeout(() => {
        startListening();
      }, 800);
    }
    
    return () => {
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
      }
    };
  }, [shouldListen, isListening, isSpeaking, isProcessingCommand, permissionStatus, startListening]);

  // Voice command processing avec protection contre les conflits
  useEffect(() => {
    if (transcript && !isProcessingCommand && shouldListen) {
      const lowerTranscript = transcript.trim().toLowerCase();
      let commandRecognized = false;
      
      console.log('Processing transcript:', lowerTranscript);
      
      // Arrêter d'écouter pendant le traitement
      setIsProcessingCommand(true);
      setShouldListen(false);
      
      if (isListening) {
        stopListening();
      }
      
      // Language switching commands
      if (lowerTranscript.includes('passer en français') || lowerTranscript.includes('français')) {
        setLanguage('fr');
        setTimeout(() => {
          speak(translations.fr.languageSwitched);
          setLastMessage(translations.fr.languageSwitched);
          setLastAction('Language switched to French');
        }, 500);
        resetTranscript();
        commandRecognized = true;
        setErrorCount(0);
      } else if (lowerTranscript.includes('حول إلى العربية') || lowerTranscript.includes('عربي')) {
        setLanguage('ar');
        setTimeout(() => {
          speak(translations.ar.languageSwitched);
          setLastMessage(translations.ar.languageSwitched);
          setLastAction('Language switched to Arabic');
        }, 500);
        resetTranscript();
        commandRecognized = true;
        setErrorCount(0);
      } else if (lowerTranscript.includes('switch to english') || lowerTranscript.includes('english')) {
        setLanguage('en');
        setTimeout(() => {
          speak(translations.en.languageSwitched);
          setLastMessage(translations.en.languageSwitched);
          setLastAction('Language switched to English');
        }, 500);
        resetTranscript();
        commandRecognized = true;
        setErrorCount(0);
      }
      
      // Navigation commands
      else if (lowerTranscript.includes('banque') || lowerTranscript.includes('bank') || lowerTranscript.includes('بنك')) {
        setCurrentScreen('banking');
        const msg = language === 'fr' ? 'Module bancaire ouvert' : 
                    language === 'ar' ? 'تم فتح الخدمات المصرفية' : 
                    'Banking module opened';
        
        setTimeout(() => {
          speak(msg);
          setLastMessage(msg);
          setLastAction('Navigated to Banking');
        }, 800);
        
        resetTranscript();
        commandRecognized = true;
        setErrorCount(0);
      } else if (lowerTranscript.includes('course') || lowerTranscript.includes('shopping') || lowerTranscript.includes('تسوق')) {
        setCurrentScreen('shopping');
        const msg = language === 'fr' ? 'Liste de courses ouverte' : 
                    language === 'ar' ? 'تم فتح قائمة التسوق' : 
                    'Shopping list opened';
        
        setTimeout(() => {
          speak(msg);
          setLastMessage(msg);
          setLastAction('Navigated to Shopping');
        }, 800);
        
        resetTranscript();
        commandRecognized = true;
        setErrorCount(0);
      } else if (lowerTranscript.includes('accueil') || lowerTranscript.includes('home') || lowerTranscript.includes('رئيسية')) {
        setCurrentScreen('home');
        
        setTimeout(() => {
          speak(t.welcome);
          setLastMessage(t.welcome);
          setLastAction('Navigated to Home');
        }, 800);
        
        resetTranscript();
        commandRecognized = true;
        setErrorCount(0);
      } else if (lowerTranscript.includes('répéter') || lowerTranscript.includes('repeat') || lowerTranscript.includes('كرر')) {
        setTimeout(() => {
          repeatLastMessage();
          setLastAction('Repeated last message');
        }, 800);
        resetTranscript();
        commandRecognized = true;
        setErrorCount(0);
      } else if (lowerTranscript.includes('aide') || lowerTranscript.includes('help') || lowerTranscript.includes('مساعدة')) {
        let helpMessage = t.helpHome;
        
        setTimeout(() => {
          speak(helpMessage);
          setLastMessage(helpMessage);
          setLastAction('Help requested');
          setShowHelp(true);
        }, 800);
        
        resetTranscript();
        commandRecognized = true;
        setErrorCount(0);
      } else if (lowerTranscript.includes('paramètre') || lowerTranscript.includes('settings') || lowerTranscript.includes('إعدادات')) {
        setShowSettings(!showSettings);
        resetTranscript();
        commandRecognized = true;
        setErrorCount(0);
      } else if (lowerTranscript.includes('écouter') || lowerTranscript.includes('listen') || lowerTranscript.includes('استمع')) {
        // Commande pour démarrer manuellement l'écoute
        setTimeout(() => {
          const msg = language === 'fr' ? 'Je vous écoute' :
                      language === 'ar' ? 'أنا أستمع' :
                      'I am listening';
          speak(msg);
          setLastMessage(msg);
          setLastAction('Manual listening started');
          startListening();
        }, 500);
        resetTranscript();
        commandRecognized = true;
        setErrorCount(0);
      }

      // Si commande non reconnue
      if (!commandRecognized && lowerTranscript.length > 2) {
        setErrorCount(prev => prev + 1);
        if (errorCount >= 1) {
          setTimeout(() => {
            speak(t.errorDidntUnderstand);
            setLastMessage(t.errorDidntUnderstand);
            setLastAction('Error - Command not understood');
          }, 800);
        }
      }

      // Redémarrer l'écoute après un délai
      const restartDelay = commandRecognized ? 3000 : 1500;
      processTimeoutRef.current = setTimeout(() => {
        setIsProcessingCommand(false);
        if (!isSpeaking) {
          setShouldListen(true);
        }
      }, restartDelay);
    }
  }, [transcript, language, currentScreen, isProcessingCommand, shouldListen, isListening, isSpeaking]);

  // Arrêter d'écouter quand le système parle
  useEffect(() => {
    if (isSpeaking && isListening) {
      stopListening();
      setShouldListen(false);
    }
    
    // Redémarrer l'écoute quand le système arrête de parler
    if (!isSpeaking && shouldListen && !isProcessingCommand) {
      restartTimeoutRef.current = setTimeout(() => {
        setShouldListen(true);
      }, 1000);
    }
    
    return () => {
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
      }
    };
  }, [isSpeaking, isListening, shouldListen, isProcessingCommand, stopListening]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Space or Enter to toggle listening
      if (e.key === ' ' || e.key === 'Enter') {
        if (e.target === document.body) {
          e.preventDefault();
          
          if (isListening) {
            stopListening();
            setShouldListen(false);
          } else {
            if (permissionStatus !== 'denied') {
              setShouldListen(true);
              setTimeout(() => {
                startListening();
              }, 300);
            }
          }
        }
      }
      // Escape to go home
      if (e.key === 'Escape') {
        setCurrentScreen('home');
        setTimeout(() => {
          speak(t.welcome);
          setLastMessage(t.welcome);
        }, 300);
      }
      // R to repeat
      if (e.key === 'r' || e.key === 'R') {
        repeatLastMessage();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isListening, permissionStatus, t, startListening, stopListening, speak, repeatLastMessage]);

  const handleVoiceResponse = (message: string) => {
    // Arrêter d'écouter avant de parler
    if (isListening) {
      stopListening();
      setShouldListen(false);
    }
    
    setTimeout(() => {
      speak(message);
      setLastMessage(message);
      
      // Redémarrer l'écoute après avoir parlé
      restartTimeoutRef.current = setTimeout(() => {
        setShouldListen(true);
      }, 2000);
    }, 500);
  };

  const handleManualListen = () => {
    if (isListening) {
      stopListening();
      setShouldListen(false);
    } else {
      setShouldListen(true);
      setTimeout(() => {
        startListening();
      }, 300);
    }
  };

  return (
    <div 
      className={`min-h-screen ${highContrast ? 'bg-black text-white' : 'bg-gradient-to-br from-blue-50 to-green-50'}`}
      dir={isRTL ? 'rtl' : 'ltr'}
      role="application"
      aria-label={t.appTitle}
    >
      {/* Skip to main content link for screen readers */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-6 focus:py-3 focus:bg-primary focus:text-primary-foreground focus:rounded-lg"
        aria-label="Aller au contenu principal"
      >
        Skip to main content
      </a>

      {/* Header */}
      <header 
        className={`${highContrast ? 'bg-gray-900 border-white' : 'bg-white shadow-sm'} border-b-4`}
        role="banner"
      >
        <div className="max-w-4xl mx-auto px-6 py-6">
          <h1 className="text-4xl text-center" tabIndex={0}>
            {t.appTitle}
          </h1>
        </div>
      </header>

      {/* Voice Status Bar */}
      <div 
        className={`${highContrast ? 'bg-gray-800' : 'bg-blue-100'} py-4 border-b-4 ${highContrast ? 'border-white' : 'border-blue-200'}`}
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        <div className="max-w-4xl mx-auto px-6 flex items-center justify-center gap-4">
          {isSpeaking ? (
            <>
              <Volume2 className="w-8 h-8 animate-pulse text-green-600" aria-hidden="true" />
              <span className="text-2xl">{t.speaking}</span>
            </>
          ) : isListening ? (
            <>
              <Mic className="w-8 h-8 animate-pulse text-red-600" aria-hidden="true" />
              <span className="text-2xl">{t.listening}</span>
            </>
          ) : (
            <>
              <MicOff className="w-8 h-8" aria-hidden="true" />
              <span className="text-2xl">{t.idle}</span>
            </>
          )}
          
          {isProcessingCommand && (
            <span className="text-xl text-yellow-600">
              {t.processing}
            </span>
          )}
        </div>
      </div>

      {/* Main Content */}
      <main 
        id="main-content"
        className="max-w-4xl mx-auto px-6 py-8"
        role="main"
        tabIndex={-1}
      >
        {/* Audio Feedback Area */}
        <div 
          className={`mb-8 p-8 rounded-2xl ${highContrast ? 'bg-gray-900 border-4 border-white' : 'bg-white shadow-lg'}`}
          role="region"
          aria-label="Zone de retour audio"
        >
          <div className="flex items-start gap-4">
            <Volume2 className="w-10 h-10 flex-shrink-0 mt-1" aria-hidden="true" />
            <div className="flex-1">
              <h2 className="text-3xl mb-4">
                {language === 'fr' ? 'Message audio' : language === 'ar' ? 'رسالة صوتية' : 'Audio Message'}
              </h2>
              <p 
                className="text-3xl leading-relaxed"
                aria-live="assertive"
                aria-atomic="true"
                tabIndex={0}
              >
                {lastMessage || t.welcome}
              </p>
            </div>
          </div>
        </div>

        {/* Home Screen */}
        {currentScreen === 'home' && (
          <div className="space-y-8">
            {/* Microphone Permission Banner */}
            <MicrophonePermissionBanner
              permissionStatus={permissionStatus}
              language={language}
              highContrast={highContrast}
            />

            {/* Large Microphone Button */}
            <VoiceControls
              isListening={isListening}
              onStartListening={handleManualListen}
              onStopListening={() => {
                stopListening();
                setShouldListen(false);
              }}
              highContrast={highContrast}
              language={language}
              permissionStatus={permissionStatus}
              //isProcessing={isProcessingCommand}
            />

            {/* Module Selection */}
            <div 
              className="grid md:grid-cols-2 gap-6"
              role="navigation"
              aria-label="Modules principaux"
            >
              <button
                onClick={() => {
                  setCurrentScreen('banking');
                  const msg = language === 'fr' ? 'Module bancaire ouvert' : language === 'ar' ? 'تم فتح الخدمات المصرفية' : 'Banking module opened';
                  handleVoiceResponse(msg);
                }}
                className={`p-12 rounded-2xl text-left transition-all hover:scale-105 focus:scale-105 focus:outline-none focus:ring-8 ${
                  highContrast 
                    ? 'bg-gray-900 border-4 border-white focus:ring-white' 
                    : 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-xl focus:ring-blue-300'
                }`}
                aria-label={t.bankingModule}
              >
                <h3 className="text-4xl mb-3">{t.bankingModule}</h3>
                <p className="text-2xl opacity-90">
                  {language === 'fr' ? 'Consulter solde, virements' : language === 'ar' ? 'التحقق من الرصيد، التحويلات' : 'Check balance, transfers'}
                </p>
              </button>

              <button
                onClick={() => {
                  setCurrentScreen('shopping');
                  const msg = language === 'fr' ? 'Liste de courses ouverte' : language === 'ar' ? 'تم فتح قائمة التسوق' : 'Shopping list opened';
                  handleVoiceResponse(msg);
                }}
                className={`p-12 rounded-2xl text-left transition-all hover:scale-105 focus:scale-105 focus:outline-none focus:ring-8 ${
                  highContrast 
                    ? 'bg-gray-900 border-4 border-white focus:ring-white' 
                    : 'bg-gradient-to-br from-green-500 to-green-600 text-white shadow-xl focus:ring-green-300'
                }`}
                aria-label={t.shoppingModule}
              >
                <h3 className="text-4xl mb-3">{t.shoppingModule}</h3>
                <p className="text-2xl opacity-90">
                  {language === 'fr' ? 'Ajouter articles, voir total' : language === 'ar' ? 'إضافة عناصر، عرض المجموع' : 'Add items, view total'}
                </p>
              </button>
            </div>
          </div>
        )}

        {/* Banking Module */}
        {currentScreen === 'banking' && (
          <BankingAssistant
            language={language}
            highContrast={highContrast}
            transcript={transcript}
            onVoiceResponse={handleVoiceResponse}
            onResetTranscript={resetTranscript}
            onGoHome={() => {
              setCurrentScreen('home');
              handleVoiceResponse(t.welcome);
            }}
          />
        )}

        {/* Shopping Module */}
        {currentScreen === 'shopping' && (
          <ShoppingListAssistant
            language={language}
            highContrast={highContrast}
            transcript={transcript}
            onVoiceResponse={handleVoiceResponse}
            onResetTranscript={resetTranscript}
            onGoHome={() => {
              setCurrentScreen('home');
              handleVoiceResponse(t.welcome);
            }}
          />
        )}

        {/* Control Panel */}
        <div 
          className={`mt-8 p-8 rounded-2xl ${highContrast ? 'bg-gray-900 border-4 border-white' : 'bg-white shadow-lg'}`}
          role="region"
          aria-label="Panneau de contrôle"
        >
          <div className="grid md:grid-cols-4 gap-6">
            <button
              onClick={repeatLastMessage}
              className={`p-6 rounded-xl flex flex-col items-center gap-3 transition-all hover:scale-105 focus:scale-105 focus:outline-none focus:ring-8 ${
                highContrast 
                  ? 'bg-gray-800 border-2 border-white focus:ring-white' 
                  : 'bg-blue-50 hover:bg-blue-100 focus:ring-blue-300'
              }`}
              aria-label={t.repeat + ' (Appuyez sur R)'}
            >
              <RefreshCw className="w-12 h-12" aria-hidden="true" />
              <span className="text-2xl">{t.repeat}</span>
            </button>

            <button
              onClick={() => setHighContrast(!highContrast)}
              className={`p-6 rounded-xl flex flex-col items-center gap-3 transition-all hover:scale-105 focus:scale-105 focus:outline-none focus:ring-8 ${
                highContrast 
                  ? 'bg-gray-800 border-2 border-white focus:ring-white' 
                  : 'bg-yellow-50 hover:bg-yellow-100 focus:ring-yellow-300'
              }`}
              aria-label={t.highContrast}
              aria-pressed={highContrast}
            >
              <Settings className="w-12 h-12" aria-hidden="true" />
              <span className="text-2xl">{t.highContrast}</span>
            </button>

            <button
              onClick={() => {
                setSlowMode(!slowMode);
                const msg = language === 'fr' ? (slowMode ? 'Mode normal activé' : 'Mode lent activé') : 
                            language === 'ar' ? (slowMode ? 'تم تفعيل الوضع العادي' : 'تم تفعيل الوضع البطيء') :
                            (slowMode ? 'Normal mode activated' : 'Slow mode activated');
                speak(msg);
                setLastMessage(msg);
              }}
              className={`p-6 rounded-xl flex flex-col items-center gap-3 transition-all hover:scale-105 focus:scale-105 focus:outline-none focus:ring-8 ${
                highContrast 
                  ? 'bg-gray-800 border-2 border-white focus:ring-white' 
                  : 'bg-purple-50 hover:bg-purple-100 focus:ring-purple-300'
              }`}
              aria-label={t.slowMode}
              aria-pressed={slowMode}
            >
              <span className="text-4xl" aria-hidden="true">🐢</span>
              <span className="text-2xl">{t.slowMode}</span>
            </button>

            <button
              onClick={() => {
                const nextLang: Language = language === 'fr' ? 'ar' : language === 'ar' ? 'en' : 'fr';
                setLanguage(nextLang);
                const msg = nextLang === 'fr' ? translations.fr.languageSwitched :
                            nextLang === 'ar' ? translations.ar.languageSwitched :
                            translations.en.languageSwitched;
                speak(msg);
                setLastMessage(msg);
              }}
              className={`p-6 rounded-xl flex flex-col items-center gap-3 transition-all hover:scale-105 focus:scale-105 focus:outline-none focus:ring-8 ${
                highContrast 
                  ? 'bg-gray-800 border-2 border-white focus:ring-white' 
                  : 'bg-green-50 hover:bg-green-100 focus:ring-green-300'
              }`}
              aria-label={`${t.language}: ${language === 'fr' ? 'Français' : language === 'ar' ? 'العربية' : 'English'}`}
            >
              <span className="text-4xl" aria-hidden="true">
                {language === 'fr' ? '🇫🇷' : language === 'ar' ? '🇹🇳' : '🇬🇧'}
              </span>
              <span className="text-2xl">{language === 'fr' ? 'FR' : language === 'ar' ? 'AR' : 'EN'}</span>
            </button>
          </div>
        </div>

        {/* Transcript Display for debugging */}
        {transcript && (
          <div 
            className="mt-4 p-4 bg-gray-100 rounded-lg"
            role="log"
            aria-live="polite"
            aria-label="Transcription vocale"
          >
            <p className="text-xl">
              <strong>
                {language === 'fr' ? 'Vous avez dit:' : language === 'ar' ? 'قلت:' : 'You said:'}
              </strong> {transcript}
            </p>
          </div>
        )}
      </main>

      {/* Footer with keyboard shortcuts */}
      <footer 
        className={`mt-12 py-6 ${highContrast ? 'bg-gray-900 border-t-4 border-white' : 'bg-white border-t'}`}
        role="contentinfo"
      >
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-xl opacity-70">
            {language === 'fr' 
              ? 'Raccourcis: Espace/Entrée = Micro • Échap = Accueil • R = Répéter' 
              : language === 'ar'
              ? 'اختصارات: مسافة/إدخال = ميكروفون • هروب = الرئيسية • R = كرر'
              : 'Shortcuts: Space/Enter = Mic • Esc = Home • R = Repeat'}
          </p>
        </div>
      </footer>

      {/* Global Navigation */}
      <GlobalNavigation
        language={language}
        highContrast={highContrast}
        currentScreen={currentScreen}
        onGoHome={() => {
          setCurrentScreen('home');
          handleVoiceResponse(t.welcome);
        }}
        onGoBack={() => {
          setCurrentScreen('home');
          handleVoiceResponse(t.welcome);
        }}
        onRepeat={repeatLastMessage}
        onHelp={() => {
          setShowHelp(true);
          const helpMessage = t.helpHome;
          speak(helpMessage);
          setLastMessage(helpMessage);
        }}
      />

      {/* Help Modal */}
      <HelpModal
        isOpen={showHelp}
        onClose={() => setShowHelp(false)}
        language={language}
        highContrast={highContrast}
      />

      {/* Permission Alert */}
      <PermissionAlert
        permissionStatus={permissionStatus}
        error={error}
        language={language}
        highContrast={highContrast}
        onDismiss={clearError}
        onTryAgain={() => {
          setShouldListen(true);
          setTimeout(() => {
            startListening();
          }, 500);
        }}
      />
    </div>
  );
}