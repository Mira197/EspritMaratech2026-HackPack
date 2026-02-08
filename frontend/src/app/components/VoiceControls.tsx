//app/components/VoiceControls.tsx
import React from 'react';
import { Mic, MicOff, AlertCircle } from 'lucide-react';

interface VoiceControlsProps {
  isListening: boolean;
  onStartListening: () => void;
  onStopListening: () => void;
  highContrast: boolean;
  language: 'fr' | 'ar' | 'en';
  permissionStatus: 'granted' | 'denied' | 'prompt' | 'checking';

  // ➜ AJOUTE ÇA
  isProcessing?: boolean;
}


export function VoiceControls({
  isListening,
  onStartListening,
  onStopListening,
  highContrast,
  language,
  permissionStatus = 'prompt',
}: VoiceControlsProps) {
  const handleClick = () => {
    // Don't start if permission is denied
    if (permissionStatus === 'denied') {
      return;
    }
    
    if (isListening) {
      onStopListening();
    } else {
      onStartListening();
    }
  };

  const label = isListening 
    ? (language === 'fr' ? 'Arrêter l\'écoute' : language === 'ar' ? 'إيقاف الاستماع' : 'Stop listening')
    : permissionStatus === 'denied'
    ? (language === 'fr' ? 'Microphone désactivé' : language === 'ar' ? 'الميكروفون معطل' : 'Microphone disabled')
    : (language === 'fr' ? 'Commencer l\'écoute' : language === 'ar' ? 'بدء الاستماع' : 'Start listening');

  const instructions = permissionStatus === 'denied'
    ? (language === 'fr' 
      ? 'Le microphone est désactivé. Utilisez les boutons ci-dessous.'
      : language === 'ar'
      ? 'الميكروفون معطل. استخدم الأزرار أدناه.'
      : 'Microphone is disabled. Use the buttons below.')
    : (language === 'fr' 
      ? 'Appuyez sur le bouton ou dites vos commandes. Commandes vocales: "banque", "courses", "accueil", "répéter"'
      : language === 'ar'
      ? 'اضغط على الزر أو قل الأوامر. الأوامر الصوتية: "بنك"، "تسوق"، "رئيسية"، "كرر"'
      : 'Press the button or say your commands. Voice commands: "bank", "shopping", "home", "repeat"');

  return (
    <div className="flex flex-col items-center gap-6">
      <button
        onClick={handleClick}
        disabled={permissionStatus === 'denied'}
        className={`w-64 h-64 rounded-full flex items-center justify-center transition-all transform focus:outline-none focus:ring-8 ${
          permissionStatus === 'denied'
            ? highContrast
              ? 'bg-gray-800 border-8 border-gray-600 opacity-50 cursor-not-allowed'
              : 'bg-gray-400 shadow-xl opacity-60 cursor-not-allowed'
            : isListening
            ? highContrast
              ? 'bg-red-900 border-8 border-white focus:ring-white animate-pulse hover:scale-110'
              : 'bg-red-500 shadow-2xl focus:ring-red-300 animate-pulse hover:scale-110'
            : highContrast
            ? 'bg-blue-900 border-8 border-white focus:ring-white hover:scale-110'
            : 'bg-blue-500 shadow-2xl focus:ring-blue-300 hover:scale-110'
        }`}
        aria-label={label}
        aria-pressed={isListening}
        aria-disabled={permissionStatus === 'denied'}
        role="switch"
      >
        {permissionStatus === 'denied' ? (
          <AlertCircle className="w-32 h-32 text-white" aria-hidden="true" />
        ) : isListening ? (
          <Mic className="w-32 h-32 text-white" aria-hidden="true" />
        ) : (
          <MicOff className="w-32 h-32 text-white" aria-hidden="true" />
        )}
      </button>

      <p 
        className="text-3xl text-center"
        aria-live="polite"
        aria-atomic="true"
      >
        {label}
      </p>

      <p className="text-2xl text-center opacity-70 max-w-2xl">
        {instructions}
      </p>
    </div>
  );
}