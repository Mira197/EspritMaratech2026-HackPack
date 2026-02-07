import React, { useState, useEffect } from 'react';
import { ArrowLeft, ShoppingCart, Trash2, Plus } from 'lucide-react';

interface ShoppingAssistantProps {
  language: 'fr' | 'ar' | 'en';
  highContrast: boolean;
  transcript: string;
  onVoiceResponse: (message: string) => void;
  onResetTranscript: () => void;
  onGoHome: () => void;
}

interface ShoppingItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

type ShoppingState = 'idle' | 'add-item' | 'add-quantity' | 'remove-item';

// Mock price database
const mockPrices: Record<string, number> = {
  'pain': 0.4,
  'lait': 1.2,
  'œufs': 3.5,
  'tomates': 1.8,
  'poulet': 12.5,
  'riz': 2.3,
  'huile': 4.5,
  'sucre': 2.0,
  'café': 8.5,
  'fromage': 6.0,
  
  // Arabic items
  'خبز': 0.4,
  'حليب': 1.2,
  'بيض': 3.5,
  'طماطم': 1.8,
  'دجاج': 12.5,
  'أرز': 2.3,
  'زيت': 4.5,
  'سكر': 2.0,
  'قهوة': 8.5,
  'جبن': 6.0,

  // English items
  'bread': 0.4,
  'milk': 1.2,
  'eggs': 3.5,
  'tomatoes': 1.8,
  'chicken': 12.5,
  'rice': 2.3,
  'oil': 4.5,
  'sugar': 2.0,
  'coffee': 8.5,
  'cheese': 6.0,
};

const BUDGET_LIMIT = 50; // Budget warning threshold

const translations = {
  fr: {
    title: 'Liste de Courses',
    goBack: 'Retour',
    addItem: 'Ajouter un article',
    removeItem: 'Retirer un article',
    total: 'Total',
    dinars: 'dinars',
    items: 'articles',
    instructions: 'Dites \"ajouter\" suivi du nom de l\'article, ou \"retirer\" suivi du nom pour le supprimer.',
    whatToAdd: 'Quel article voulez-vous ajouter?',
    howMany: 'Combien voulez-vous en ajouter?',
    itemAdded: 'Article ajouté',
    itemRemoved: 'Article retiré',
    listEmpty: 'Votre liste est vide. Commencez par dire \"ajouter\" suivi du nom d\'un article.',
    quantity: 'Quantité',
    price: 'Prix',
    unitPrice: 'Prix unitaire',
    notFound: 'Prix non disponible',
    budgetWarning: 'Attention, votre total dépasse le budget suggéré de',
    suggestion: 'Vous achetez souvent du lait, voulez-vous l\'ajouter?',
  },
  ar: {
    title: 'قائمة التسوق',
    goBack: 'رجوع',
    addItem: 'إضافة عنصر',
    removeItem: 'إزالة عنصر',
    total: 'المجموع',
    dinars: 'دينار',
    items: 'عناصر',
    instructions: 'قل \"إضافة\" متبوعًا باسم العنصر، أو \"إزالة\" متبوعًا بالاسم لحذفه.',
    whatToAdd: 'ما هو العنصر الذي تريد إضافته؟',
    howMany: 'كم تريد إضافة؟',
    itemAdded: 'تمت الإضافة',
    itemRemoved: 'تمت الإزالة',
    listEmpty: 'قائمتك فارغة. ابدأ بقول \"إضافة\" متبوعًا باسم عنصر.',
    quantity: 'الكمية',
    price: 'السعر',
    unitPrice: 'سعر الوحدة',
    notFound: 'السعر غير متوفر',
    budgetWarning: 'تنبيه، المجموع يتجاوز الميزانية المقترحة',
    suggestion: 'عادة ما تشتري الحليب، هل تريد إضافته؟',
  },
  en: {
    title: 'Shopping List',
    goBack: 'Back',
    addItem: 'Add Item',
    removeItem: 'Remove Item',
    total: 'Total',
    dinars: 'dinars',
    items: 'items',
    instructions: 'Say \"add\" followed by the item name, or \"remove\" followed by the name to delete it.',
    whatToAdd: 'What item would you like to add?',
    howMany: 'How many would you like to add?',
    itemAdded: 'Item added',
    itemRemoved: 'Item removed',
    listEmpty: 'Your list is empty. Start by saying \"add\" followed by an item name.',
    quantity: 'Quantity',
    price: 'Price',
    unitPrice: 'Unit Price',
    notFound: 'Price not available',
    budgetWarning: 'Warning, your total exceeds the suggested budget of',
    suggestion: 'You usually buy milk, would you like to add it?',
  },
};

export function ShoppingListAssistant({
  language,
  highContrast,
  transcript,
  onVoiceResponse,
  onResetTranscript,
  onGoHome,
}: ShoppingAssistantProps) {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [state, setState] = useState<ShoppingState>('idle');
  const [currentItemName, setCurrentItemName] = useState('');

  const t = translations[language];

  useEffect(() => {
    // Announce module on entry
    onVoiceResponse(t.title + '. ' + t.instructions);
  }, []);

  const getPrice = (itemName: string): number => {
    const normalizedName = itemName.toLowerCase().trim();
    return mockPrices[normalizedName] || 2.5; // Default price if not found
  };

  const calculateTotal = (): number => {
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  useEffect(() => {
    if (!transcript) return;

    const lowerTranscript = transcript.toLowerCase();

    // Add item command
    if (state === 'idle' && (lowerTranscript.includes('ajoute') || lowerTranscript.includes('add') || lowerTranscript.includes('إضافة'))) {
      setState('add-item');
      onVoiceResponse(t.whatToAdd);
      onResetTranscript();
    }

    // Remove item command
    if (state === 'idle' && (lowerTranscript.includes('retir') || lowerTranscript.includes('remove') || lowerTranscript.includes('supprim') || lowerTranscript.includes('إزالة'))) {
      setState('remove-item');
      onVoiceResponse(language === 'fr' ? 'Quel article voulez-vous retirer?' : 'ما هو العنصر الذي تريد إزالته؟');
      onResetTranscript();
    }

    // Capture item name to add
    if (state === 'add-item' && transcript.trim().length > 1) {
      setCurrentItemName(transcript.trim());
      setState('add-quantity');
      onVoiceResponse(t.howMany);
      onResetTranscript();
    }

    // Capture quantity
    if (state === 'add-quantity') {
      const numbers = lowerTranscript.match(/\d+/g);
      if (numbers && numbers.length > 0) {
        const quantity = parseInt(numbers[0]);
        const price = getPrice(currentItemName);
        const newItem: ShoppingItem = {
          id: Date.now().toString(),
          name: currentItemName,
          quantity,
          price,
        };
        setItems(prev => [...prev, newItem]);
        const total = calculateTotal() + (price * quantity);
        const message = `${t.itemAdded}: ${quantity} ${currentItemName}. ${t.price}: ${(price * quantity).toFixed(2)} ${t.dinars}. ${t.total}: ${total.toFixed(2)} ${t.dinars}`;
        onVoiceResponse(message);
        setState('idle');
        setCurrentItemName('');
        onResetTranscript();
        setTimeout(() => {
          onVoiceResponse(t.instructions);
        }, 2000);
      }
    }

    // Remove item
    if (state === 'remove-item' && transcript.trim().length > 1) {
      const itemToRemove = items.find(item => 
        item.name.toLowerCase().includes(transcript.toLowerCase())
      );
      if (itemToRemove) {
        setItems(prev => prev.filter(item => item.id !== itemToRemove.id));
        onVoiceResponse(`${t.itemRemoved}: ${itemToRemove.name}`);
      } else {
        onVoiceResponse(language === 'fr' ? 'Article non trouvé' : 'العنصر غير موجود');
      }
      setState('idle');
      onResetTranscript();
      setTimeout(() => {
        onVoiceResponse(t.instructions);
      }, 2000);
    }

    // Read total command
    if (state === 'idle' && (lowerTranscript.includes('total') || lowerTranscript.includes('مجموع'))) {
      const total = calculateTotal();
      const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
      const message = `${t.total}: ${total.toFixed(2)} ${t.dinars}. ${itemCount} ${t.items}`;
      onVoiceResponse(message);
      onResetTranscript();
    }
  }, [transcript, state]);

  const handleAddItem = (name: string, quantity: number = 1) => {
    const price = getPrice(name);
    const newItem: ShoppingItem = {
      id: Date.now().toString(),
      name,
      quantity,
      price,
    };
    setItems(prev => [...prev, newItem]);
    onVoiceResponse(`${t.itemAdded}: ${quantity} ${name}`);
  };

  const handleRemoveItem = (id: string) => {
    const item = items.find(i => i.id === id);
    setItems(prev => prev.filter(item => item.id !== id));
    if (item) {
      onVoiceResponse(`${t.itemRemoved}: ${item.name}`);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={onGoHome}
          className={`flex items-center gap-3 px-6 py-4 rounded-xl text-2xl transition-all hover:scale-105 focus:scale-105 focus:outline-none focus:ring-8 ${
            highContrast 
              ? 'bg-gray-800 border-2 border-white focus:ring-white' 
              : 'bg-white shadow-lg focus:ring-green-300'
          }`}
          aria-label={t.goBack}
        >
          <ArrowLeft className="w-8 h-8" aria-hidden="true" />
          <span>{t.goBack}</span>
        </button>

        <h2 className="text-4xl" tabIndex={0}>{t.title}</h2>
      </div>

      {/* Total Display */}
      <div 
        className={`mb-8 p-10 rounded-2xl ${
          calculateTotal() > BUDGET_LIMIT
            ? (highContrast ? 'bg-gray-900 border-4 border-red-400' : 'bg-gradient-to-br from-red-500 to-red-600 text-white shadow-xl')
            : (highContrast ? 'bg-gray-900 border-4 border-white' : 'bg-gradient-to-br from-green-500 to-green-600 text-white shadow-xl')
        }`}
        role="region"
        aria-label={t.total}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-3xl mb-4 opacity-90">{t.total}</h3>
            <p className="text-7xl font-bold mb-2" tabIndex={0}>
              {calculateTotal().toFixed(2)}
            </p>
            <p className="text-3xl opacity-90">{language === 'fr' ? 'TND' : language === 'ar' ? 'دينار تونسي' : 'TND'}</p>
          </div>
          <ShoppingCart className="w-32 h-32 opacity-80" aria-hidden="true" />
        </div>
        <div className="mt-6 flex items-center justify-between">
          <p className="text-2xl opacity-90">
            {items.reduce((sum, item) => sum + item.quantity, 0)} {t.items}
          </p>
          {calculateTotal() <= BUDGET_LIMIT && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-400 bg-opacity-50">
              <span className="text-xl">✓ {language === 'fr' ? 'Dans le budget' : language === 'ar' ? 'ضمن الميزانية' : 'Within budget'}</span>
            </div>
          )}
        </div>
      </div>

      {/* Budget Warning Alert */}
      {calculateTotal() > BUDGET_LIMIT && (
        <div 
          className={`mb-8 p-6 rounded-xl ${highContrast ? 'bg-gray-900 border-4 border-red-400' : 'bg-red-50 border-4 border-red-400'}`}
          role="alert"
          aria-live="polite"
        >
          <div className="flex items-start gap-4">
            <span className="text-4xl" aria-hidden="true">⚠️</span>
            <div>
              <h3 className="text-2xl font-bold mb-2" style={{color: highContrast ? '#ff6b6b' : '#dc2626'}}>
                {t.budgetWarning} {BUDGET_LIMIT} {t.dinars}
              </h3>
              <p className="text-xl" style={{color: highContrast ? '#ff6b6b' : '#dc2626'}}>
                {language === 'fr' 
                  ? `Vous dépassez de ${(calculateTotal() - BUDGET_LIMIT).toFixed(2)} dinars` 
                  : language === 'ar'
                  ? `لقد تجاوزت بمقدار ${(calculateTotal() - BUDGET_LIMIT).toFixed(2)} دينار`
                  : `You are over by ${(calculateTotal() - BUDGET_LIMIT).toFixed(2)} dinars`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions with Icons */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <button
          onClick={() => {
            setState('add-item');
            onVoiceResponse(t.whatToAdd);
          }}
          className={`p-8 rounded-2xl text-left transition-all hover:scale-105 focus:scale-105 focus:outline-none focus:ring-8 ${
            highContrast 
              ? 'bg-gray-900 border-4 border-white focus:ring-white' 
              : 'bg-white shadow-xl focus:ring-green-300'
          }`}
          aria-label={t.addItem}
        >
          <div className="flex items-start gap-4 mb-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${highContrast ? 'bg-white text-black' : 'bg-green-100'}`}>
              <Plus className="w-6 h-6 text-green-600" aria-hidden="true" />
            </div>
            <div className="flex-1">
              <h4 className="text-3xl font-bold mb-2">{t.addItem}</h4>
            </div>
          </div>
          <div className={`p-4 rounded-lg ${highContrast ? 'bg-gray-800' : 'bg-green-50'}`}>
            <p className="text-xl">
              💬 {language === 'fr' ? 'Dites: "ajouter" + nom' : language === 'ar' ? 'قل: "إضافة" + الاسم' : 'Say: "add" + name'}
            </p>
          </div>
        </button>

        <button
          onClick={() => {
            setState('remove-item');
            onVoiceResponse(language === 'fr' ? 'Quel article voulez-vous retirer?' : language === 'ar' ? 'ما هو العنصر الذي تريد إزالته؟' : 'Which item would you like to remove?');
          }}
          className={`p-8 rounded-2xl text-left transition-all hover:scale-105 focus:scale-105 focus:outline-none focus:ring-8 ${
            highContrast 
              ? 'bg-gray-900 border-4 border-white focus:ring-white' 
              : 'bg-white shadow-xl focus:ring-red-300'
          }`}
          aria-label={t.removeItem}
        >
          <div className="flex items-start gap-4 mb-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${highContrast ? 'bg-white text-black' : 'bg-red-100'}`}>
              <Trash2 className="w-6 h-6 text-red-600" aria-hidden="true" />
            </div>
            <div className="flex-1">
              <h4 className="text-3xl font-bold mb-2">{t.removeItem}</h4>
            </div>
          </div>
          <div className={`p-4 rounded-lg ${highContrast ? 'bg-gray-800' : 'bg-red-50'}`}>
            <p className="text-xl">
              💬 {language === 'fr' ? 'Dites: "retirer" + nom' : language === 'ar' ? 'قل: "إزالة" + الاسم' : 'Say: "remove" + name'}
            </p>
          </div>
        </button>

        <button
          onClick={() => {
            const total = calculateTotal();
            const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
            const message = `${t.total}: ${total.toFixed(2)} ${t.dinars}. ${itemCount} ${t.items}`;
            onVoiceResponse(message);
          }}
          className={`p-8 rounded-2xl text-left transition-all hover:scale-105 focus:scale-105 focus:outline-none focus:ring-8 ${
            highContrast 
              ? 'bg-gray-900 border-4 border-white focus:ring-white' 
              : 'bg-white shadow-xl focus:ring-blue-300'
          }`}
          aria-label={language === 'fr' ? 'Lire le total' : language === 'ar' ? 'قراءة المجموع' : 'Read total'}
        >
          <div className="flex items-start gap-4 mb-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${highContrast ? 'bg-white text-black' : 'bg-blue-100'}`}>
              <ShoppingCart className="w-6 h-6 text-blue-600" aria-hidden="true" />
            </div>
            <div className="flex-1">
              <h4 className="text-3xl font-bold mb-2">
                {language === 'fr' ? 'Lire le total' : language === 'ar' ? 'قراءة المجموع' : 'Read total'}
              </h4>
            </div>
          </div>
          <div className={`p-4 rounded-lg ${highContrast ? 'bg-gray-800' : 'bg-blue-50'}`}>
            <p className="text-xl">
              💬 {language === 'fr' ? 'Dites: "total"' : language === 'ar' ? 'قل: "مجموع"' : 'Say: "total"'}
            </p>
          </div>
        </button>
      </div>

      {/* Shopping List */}
      <div 
        className={`p-8 rounded-2xl ${highContrast ? 'bg-gray-900 border-4 border-white' : 'bg-white shadow-lg'}`}
        role="region"
        aria-label={t.title}
      >
        <h3 className="text-3xl mb-6">{t.title}</h3>
        
        {items.length === 0 ? (
          <p className="text-2xl text-center py-12 opacity-70">{t.listEmpty}</p>
        ) : (
          <ul className="space-y-4" role="list">
            {items.map((item, index) => (
              <li
                key={item.id}
                className={`p-6 rounded-xl border-4 ${highContrast ? 'border-white bg-gray-800' : 'border-green-200 bg-green-50'}`}
                role="listitem"
                aria-label={`${item.name}, ${t.quantity}: ${item.quantity}, ${t.price}: ${(item.price * item.quantity).toFixed(2)} ${t.dinars}`}
                tabIndex={0}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h4 className="text-3xl mb-2">{item.name}</h4>
                    <div className="text-2xl opacity-70">
                      <p>{t.quantity}: {item.quantity}</p>
                      <p>{t.unitPrice}: {item.price.toFixed(2)} {language === 'fr' ? 'TND' : 'د.ت'}</p>
                      <p className="mt-2">
                        <strong>{t.total}: {(item.price * item.quantity).toFixed(2)} {language === 'fr' ? 'TND' : 'د.ت'}</strong>
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    className={`p-4 rounded-xl transition-all hover:scale-110 focus:scale-110 focus:outline-none focus:ring-4 ${
                      highContrast 
                        ? 'bg-red-900 text-white focus:ring-white' 
                        : 'bg-red-100 text-red-600 hover:bg-red-200 focus:ring-red-300'
                    }`}
                    aria-label={`${t.removeItem} ${item.name}`}
                  >
                    <Trash2 className="w-8 h-8" aria-hidden="true" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Add Item Flow */}
      {(state === 'add-item' || state === 'add-quantity') && (
        <div 
          className={`mt-8 p-8 rounded-2xl ${highContrast ? 'bg-gray-900 border-4 border-blue-400' : 'bg-blue-50 border-4 border-blue-400 shadow-xl'}`}
          role="region"
          aria-live="polite"
          aria-atomic="true"
        >
          <div className="flex items-start gap-4">
            <Plus className="w-12 h-12 text-blue-600 flex-shrink-0" aria-hidden="true" />
            <div>
              <h3 className="text-3xl mb-4">{t.addItem}</h3>
              
              {state === 'add-item' && (
                <p className="text-2xl">{t.whatToAdd}</p>
              )}
              
              {state === 'add-quantity' && (
                <div>
                  <p className="text-2xl mb-4">
                    <strong>{language === 'fr' ? 'Article:' : 'العنصر:'}</strong> {currentItemName}
                  </p>
                  <p className="text-2xl">{t.howMany}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div 
        className={`mt-8 p-6 rounded-xl ${highContrast ? 'bg-gray-800' : 'bg-green-50'}`}
        role="region"
        aria-label="Instructions"
      >
        <p className="text-2xl text-center">
          {t.instructions}
        </p>
      </div>
    </div>
  );
}