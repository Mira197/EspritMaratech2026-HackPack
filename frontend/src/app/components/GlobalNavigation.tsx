import React from 'react';
import { Home, ArrowLeft, RefreshCw, HelpCircle } from 'lucide-react';

interface GlobalNavigationProps {
  language: 'fr' | 'ar' | 'en';
  highContrast: boolean;
  currentScreen: 'home' | 'banking' | 'shopping';
  onGoHome: () => void;
  onGoBack: () => void;
  onRepeat: () => void;
  onHelp: () => void;
}

const translations = {
  fr: {
    home: 'Accueil',
    back: 'Retour',
    repeat: 'Répéter',
    help: 'Aide',
  },
  ar: {
    home: 'الرئيسية',
    back: 'رجوع',
    repeat: 'كرر',
    help: 'مساعدة',
  },
  en: {
    home: 'Home',
    back: 'Back',
    repeat: 'Repeat',
    help: 'Help',
  },
};

export function GlobalNavigation({
  language,
  highContrast,
  currentScreen,
  onGoHome,
  onGoBack,
  onRepeat,
  onHelp,
}: GlobalNavigationProps) {
  const t = translations[language];
  const isRTL = language === 'ar';

  return (
    <nav
      className={`fixed top-20 ${isRTL ? 'left-4' : 'right-4'} z-40 flex flex-col gap-2`}
      role="navigation"
      aria-label={language === 'fr' ? 'Navigation globale' : language === 'ar' ? 'التنقل الرئيسي' : 'Global navigation'}
    >
      {currentScreen !== 'home' && (
        <>
          <button
            onClick={onGoHome}
            className={`p-4 rounded-xl flex items-center gap-3 transition-all shadow-lg hover:scale-105 focus:scale-105 focus:outline-none focus:ring-4 ${
              highContrast
                ? 'bg-black border-2 border-white text-white focus:ring-white'
                : 'bg-white text-gray-800 focus:ring-blue-300'
            }`}
            aria-label={`${t.home} (Échap)`}
            title={t.home}
          >
            <Home className="w-6 h-6" aria-hidden="true" />
            <span className="text-lg font-medium">{t.home}</span>
          </button>

          <button
            onClick={onGoBack}
            className={`p-4 rounded-xl flex items-center gap-3 transition-all shadow-lg hover:scale-105 focus:scale-105 focus:outline-none focus:ring-4 ${
              highContrast
                ? 'bg-black border-2 border-white text-white focus:ring-white'
                : 'bg-white text-gray-800 focus:ring-blue-300'
            }`}
            aria-label={t.back}
            title={t.back}
          >
            <ArrowLeft className="w-6 h-6" aria-hidden="true" />
            <span className="text-lg font-medium">{t.back}</span>
          </button>
        </>
      )}

      <button
        onClick={onRepeat}
        className={`p-4 rounded-xl flex items-center gap-3 transition-all shadow-lg hover:scale-105 focus:scale-105 focus:outline-none focus:ring-4 ${
          highContrast
            ? 'bg-black border-2 border-white text-white focus:ring-white'
            : 'bg-white text-gray-800 focus:ring-blue-300'
        }`}
        aria-label={`${t.repeat} (R)`}
        title={t.repeat}
      >
        <RefreshCw className="w-6 h-6" aria-hidden="true" />
        <span className="text-lg font-medium">{t.repeat}</span>
      </button>

      <button
        onClick={onHelp}
        className={`p-4 rounded-xl flex items-center gap-3 transition-all shadow-lg hover:scale-105 focus:scale-105 focus:outline-none focus:ring-4 ${
          highContrast
            ? 'bg-yellow-400 text-black focus:ring-yellow-400'
            : 'bg-blue-600 text-white focus:ring-blue-300'
        }`}
        aria-label={t.help}
        title={t.help}
      >
        <HelpCircle className="w-6 h-6" aria-hidden="true" />
        <span className="text-lg font-medium">{t.help}</span>
      </button>
    </nav>
  );
}
