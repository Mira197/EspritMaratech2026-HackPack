import React from 'react';
import { AlertCircle, Settings, Mic } from 'lucide-react';

interface PermissionAlertProps {
  permissionStatus: 'granted' | 'denied' | 'prompt' | 'checking';
  error: string | null;
  language: 'fr' | 'ar' | 'en';
  highContrast: boolean;
  onDismiss: () => void;
  onTryAgain: () => void;
}

const permissionMessages = {
  fr: {
    title: 'Microphone désactivé',
    deniedMessage: 'Pas de souci ! Vous pouvez continuer à utiliser l\'application avec les boutons.',
    howToEnable: 'Pour activer la voix :',
    step1: 'Cliquez sur l\'icône 🔒 dans la barre d\'adresse',
    step2: 'Autorisez le microphone',
    step3: 'Cliquez sur "Réessayer"',
    tryAgain: 'Réessayer avec la voix',
    continueWithout: 'Continuer sans la voix',
    reassurance: 'Tout fonctionne avec les boutons également',
  },
  ar: {
    title: 'الميكروفون معطل',
    deniedMessage: 'لا مشكلة! يمكنك الاستمرار في استخدام التطبيق بالأزرار.',
    howToEnable: 'لتفعيل الصوت:',
    step1: 'انقر على أيقونة 🔒 في شريط العنوان',
    step2: 'اسمح بالوصول للميكروفون',
    step3: 'انقر على "حاول مرة أخرى"',
    tryAgain: 'حاول مرة أخرى بالصوت',
    continueWithout: 'المتابعة بدون صوت',
    reassurance: 'كل شيء يعمل بالأزرار أيضًا',
  },
  en: {
    title: 'Microphone disabled',
    deniedMessage: 'No problem! You can continue using the app with buttons.',
    howToEnable: 'To enable voice:',
    step1: 'Click the 🔒 icon in the address bar',
    step2: 'Allow microphone access',
    step3: 'Click "Try again"',
    tryAgain: 'Try again with voice',
    continueWithout: 'Continue without voice',
    reassurance: 'Everything works with buttons too',
  },
};

export function PermissionAlert({ permissionStatus, error, language, highContrast, onDismiss, onTryAgain }: PermissionAlertProps) {
  const t = permissionMessages[language];

  // Show alert only if permission is denied or there's a not-allowed error
  if (permissionStatus !== 'denied' && error !== 'not-allowed') {
    return null;
  }

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`fixed bottom-6 ${language === 'ar' ? 'left-6' : 'right-6'} z-50 max-w-md w-full mx-auto md:mx-0`}
    >
      <div
        className={`p-6 rounded-2xl shadow-2xl ${
          highContrast
            ? 'bg-black border-4 border-yellow-400 text-white'
            : 'bg-white border-l-8 border-blue-500'
        }`}
      >
        {/* Header */}
        <div className="flex items-start gap-4 mb-4">
          <Mic
            className={`w-8 h-8 flex-shrink-0 ${highContrast ? 'text-yellow-400' : 'text-blue-600'}`}
            aria-hidden="true"
          />
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-1">{t.title}</h2>
            <p className="text-xl opacity-90">{t.deniedMessage}</p>
          </div>
        </div>

        {/* Reassurance */}
        <div className={`p-4 rounded-xl mb-4 ${highContrast ? 'bg-gray-900' : 'bg-green-50'}`}>
          <p className="text-lg text-center font-medium">✓ {t.reassurance}</p>
        </div>

        {/* Instructions */}
        <div className={`p-4 rounded-xl mb-4 ${highContrast ? 'bg-gray-900' : 'bg-blue-50'}`}>
          <h3 className="text-lg font-bold mb-2">{t.howToEnable}</h3>
          <ol className="space-y-1 text-base">
            <li>1. {t.step1}</li>
            <li>2. {t.step2}</li>
            <li>3. {t.step3}</li>
          </ol>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onTryAgain}
            className={`flex-1 py-3 px-4 rounded-xl text-lg font-bold transition-all focus:outline-none focus:ring-4 ${
              highContrast
                ? 'bg-yellow-400 text-black hover:bg-yellow-500 focus:ring-yellow-400'
                : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-300'
            }`}
            aria-label={t.tryAgain}
          >
            {t.tryAgain}
          </button>
          <button
            onClick={onDismiss}
            className={`flex-1 py-3 px-4 rounded-xl text-lg font-bold transition-all focus:outline-none focus:ring-4 ${
              highContrast
                ? 'bg-gray-800 border-2 border-white hover:bg-gray-700 focus:ring-white'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200 focus:ring-gray-300'
            }`}
            aria-label={t.continueWithout}
          >
            {t.continueWithout}
          </button>
        </div>
      </div>
    </div>
  );
}