import React from 'react';
import { X, Mic, Keyboard, Volume2, Contrast } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'fr' | 'ar' | 'en';
  highContrast: boolean;
}

const helpContent = {
  fr: {
    title: 'Guide d\'utilisation',
    close: 'Fermer',
    sections: {
      voice: {
        title: 'Commandes Vocales',
        icon: Mic,
        items: [
          'Dites "banque" pour ouvrir le module bancaire',
          'Dites "courses" pour la liste de courses',
          'Dites "accueil" pour revenir à l\'accueil',
          'Dites "répéter" pour réentendre le message',
          'Dites "solde" dans le module bancaire',
          'Dites "virement" pour faire un transfert',
          'Dites "ajouter" + nom de l\'article pour la liste',
          'Dites "passer en anglais" ou "français" ou "arabe" pour changer de langue',
        ],
      },
      keyboard: {
        title: 'Raccourcis Clavier',
        icon: Keyboard,
        items: [
          'Espace ou Entrée : Activer/Arrêter le micro',
          'Échap : Retour à l\'accueil',
          'R : Répéter le dernier message',
          'Tab : Navigation entre les éléments',
        ],
      },
      audio: {
        title: 'Retour Audio',
        icon: Volume2,
        items: [
          'Toutes les actions sont annoncées vocalement',
          'Utilisez le bouton "Répéter" si besoin',
          'Le volume se règle dans votre système',
        ],
      },
      contrast: {
        title: 'Accessibilité',
        icon: Contrast,
        items: [
          'Mode contraste élevé disponible',
          'Mode lent pour personnes âgées',
          'Compatible lecteurs d\'écran',
          'Typographie large et claire',
          'Navigation 100% au clavier',
        ],
      },
    },
  },
  ar: {
    title: 'دليل الاستخدام',
    close: 'إغلاق',
    sections: {
      voice: {
        title: 'الأوامر الصوتية',
        icon: Mic,
        items: [
          'قل "بنك" لفتح الخدمات المصرفية',
          'قل "تسوق" لقائمة التسوق',
          'قل "رئيسية" للعودة للصفحة الرئيسية',
          'قل "كرر" لإعادة سماع الرسالة',
          'قل "رصيد" في الخدمات المصرفية',
          'قل "تحويل" لإجراء تحويل',
          'قل "إضافة" + اسم العنصر للقائمة',
          'قل "حول إلى الإنجليزية" أو "فرنسي" أو "عربي" لتغيير اللغة',
        ],
      },
      keyboard: {
        title: 'اختصارات لوحة المفاتيح',
        icon: Keyboard,
        items: [
          'مسافة أو إدخال: تشغيل/إيقاف الميكروفون',
          'Escape: العودة للرئيسية',
          'R: كرر الرسالة الأخيرة',
          'Tab: التنقل بين العناصر',
        ],
      },
      audio: {
        title: 'الملاحظات الصوتية',
        icon: Volume2,
        items: [
          'يتم الإعلان عن جميع الإجراءات صوتيًا',
          'استخدم زر "كرر" إذا لزم الأمر',
          'يتم ضبط مستوى الصوت في نظامك',
        ],
      },
      contrast: {
        title: 'إمكانية الوصول',
        icon: Contrast,
        items: [
          'وضع التباين العالي متاح',
          'الوضع البطيء لكبار السن',
          'متوافق مع قارئات الشاشة',
          'طباعة كبيرة وواضحة',
          'التنقل 100٪ عبر لوحة المفاتيح',
        ],
      },
    },
  },
  en: {
    title: 'User Guide',
    close: 'Close',
    sections: {
      voice: {
        title: 'Voice Commands',
        icon: Mic,
        items: [
          'Say "bank" to open the banking module',
          'Say "shopping" for the shopping list',
          'Say "home" to return to the home screen',
          'Say "repeat" to hear the message again',
          'Say "balance" in the banking module',
          'Say "transfer" to make a transfer',
          'Say "add" + item name for the list',
          'Say "switch to English" or "French" or "Arabic" to change language',
        ],
      },
      keyboard: {
        title: 'Keyboard Shortcuts',
        icon: Keyboard,
        items: [
          'Space or Enter: Toggle microphone',
          'Escape: Return to home',
          'R: Repeat last message',
          'Tab: Navigate between elements',
        ],
      },
      audio: {
        title: 'Audio Feedback',
        icon: Volume2,
        items: [
          'All actions are announced vocally',
          'Use the "Repeat" button if needed',
          'Volume is controlled by your system',
        ],
      },
      contrast: {
        title: 'Accessibility',
        icon: Contrast,
        items: [
          'High contrast mode available',
          'Slow mode for seniors',
          'Screen reader compatible',
          'Large and clear typography',
          '100% keyboard navigation',
        ],
      },
    },
  },
};

export function HelpModal({ isOpen, onClose, language, highContrast }: HelpModalProps) {
  if (!isOpen) return null;

  const content = helpContent[language];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
      role="dialog"
      aria-modal="true"
      aria-labelledby="help-title"
      onClick={onClose}
    >
      <div
        className={`max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-2xl p-8 ${
          highContrast ? 'bg-black border-4 border-white' : 'bg-white shadow-2xl'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-8">
          <h2 id="help-title" className="text-5xl">
            {content.title}
          </h2>
          <button
            onClick={onClose}
            className={`p-4 rounded-xl hover:scale-110 focus:scale-110 focus:outline-none focus:ring-8 ${
              highContrast
                ? 'bg-gray-800 border-2 border-white focus:ring-white'
                : 'bg-gray-100 hover:bg-gray-200 focus:ring-gray-300'
            }`}
            aria-label={content.close}
          >
            <X className="w-10 h-10" aria-hidden="true" />
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {Object.entries(content.sections).map(([key, section]) => {
            const IconComponent = section.icon;
            return (
              <div
                key={key}
                className={`p-6 rounded-xl ${
                  highContrast ? 'bg-gray-900 border-2 border-white' : 'bg-blue-50'
                }`}
              >
                <div className="flex items-center gap-4 mb-4">
                  <IconComponent className="w-10 h-10" aria-hidden="true" />
                  <h3 className="text-3xl">{section.title}</h3>
                </div>
                <ul className="space-y-3" role="list">
                  {section.items.map((item, index) => (
                    <li key={index} className="text-2xl flex items-start gap-2">
                      <span aria-hidden="true">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={onClose}
            className={`px-12 py-6 rounded-xl text-3xl hover:scale-105 focus:scale-105 focus:outline-none focus:ring-8 ${
              highContrast
                ? 'bg-white text-black focus:ring-white'
                : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-300'
            }`}
            aria-label={content.close}
          >
            {content.close}
          </button>
        </div>
      </div>
    </div>
  );
}