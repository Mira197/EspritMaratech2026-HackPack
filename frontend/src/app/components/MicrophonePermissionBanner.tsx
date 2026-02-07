import React from 'react';
import { AlertCircle, Mic } from 'lucide-react';

interface MicrophonePermissionBannerProps {
  permissionStatus: 'granted' | 'denied' | 'prompt' | 'checking';
  language: 'fr' | 'ar' | 'en';
  highContrast: boolean;
}

const messages = {
  fr: {
    prompt: 'Cliquez sur le microphone pour commencer. Vous devrez autoriser l\'accès au microphone.',
    checking: 'Vérification des autorisations du microphone...',
  },
  ar: {
    prompt: 'انقر على الميكروفون للبدء. ستحتاج إلى السماح بالوصول إلى الميكروفون.',
    checking: 'جاري التحقق من أذونات الميكروفون...',
  },
  en: {
    prompt: 'Click the microphone to begin. You will need to allow microphone access.',
    checking: 'Checking microphone permissions...',
  },
};

export function MicrophonePermissionBanner({ permissionStatus, language, highContrast }: MicrophonePermissionBannerProps) {
  const t = messages[language];

  // Only show for prompt or checking states
  if (permissionStatus === 'granted' || permissionStatus === 'denied') {
    return null;
  }

  return (
    <div
      className={`mb-6 p-6 rounded-xl flex items-start gap-4 ${
        highContrast
          ? 'bg-gray-800 border-2 border-blue-400'
          : 'bg-blue-50 border-2 border-blue-200'
      }`}
      role="status"
      aria-live="polite"
    >
      <Mic
        className={`w-8 h-8 flex-shrink-0 mt-1 ${highContrast ? 'text-blue-400' : 'text-blue-600'}`}
        aria-hidden="true"
      />
      <p className="text-xl flex-1">
        {permissionStatus === 'checking' ? t.checking : t.prompt}
      </p>
    </div>
  );
}
