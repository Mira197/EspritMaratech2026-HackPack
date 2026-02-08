// src/app/components/ShoppingListAssistant.tsx

import React, { useState, useEffect } from 'react';
import { ArrowLeft, ShoppingCart, Trash2, Plus } from 'lucide-react';
import { getArticles, getTotal } from "../../services/api";
import StripePay from "./StripePay";

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

type ShoppingState = 'idle' | 'add-item' | 'add-quantity' | 'remove-item'  | 'checkout-offer'
  | 'checkout-paying';

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
const API_BASE_URL = 'http://localhost:8000'; // URL de votre backend FastAPI

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

// Fonction pour nettoyer le nom
function cleanName(text: string) {
  return text
    .replace(/ajouter/gi, "")
    .replace(/retirer/gi, "")
    .replace(/supprimer/gi, "")
    .replace(/add/gi, "")
    .replace(/remove/gi, "")
    .replace(/delete/gi, "")
    .replace(/إضافة/gi, "")
    .replace(/إزالة/gi, "")
    .replace(/حذف/gi, "")
    .replace(/dinars/gi, "")
    .replace(/دينار/gi, "")
    .replace(/tnd/gi, "")
    .trim();
}

// Fonctions d'API réelles qui communiquent avec le backend
const addArticle = async (name: string, price: number, quantity: number): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/shopping/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        price,
        quantity
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to add article');
    }
    
    await response.json();
  } catch (error) {
    console.error('Error adding article:', error);
    throw error;
  }
};

const removeArticle = async (name: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/shopping/remove/${encodeURIComponent(name)}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Failed to remove article');
    }
    
    await response.json();
  } catch (error) {
    console.error('Error removing article:', error);
    throw error;
  }
};



const refreshTotal = async (): Promise<void> => {
  // Cette fonction est maintenant intégrée dans getTotal
  return;
};

const fetchCartItems = async (): Promise<ShoppingItem[]> => {
  try {
    // Note: Votre backend n'a pas encore d'endpoint pour récupérer tous les articles
    // Pour l'instant, on garde la synchronisation locale
    return [];
  } catch (error) {
    console.error('Error fetching cart items:', error);
    return [];
  }
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
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const t = translations[language];

  useEffect(() => {
    // Announce module on entry
    onVoiceResponse(t.title + '. ' + t.instructions);
    
    // Charger le total initial depuis le backend
    loadInitialData();
  }, []);

 const loadInitialData = async () => {
  try {
    setIsLoading(true);

    const totalData = await getTotal();
    setTotal(totalData.total);

    const articles = await getArticles("amira");

    const mapped = articles.map((a: any) => ({
      id: a._id,
      name: a.name,
      quantity: a.quantity,
      price: a.price,
    }));

    setItems(mapped);

  } catch (error) {
    console.error(error);
  } finally {
    setIsLoading(false);
  }
};


  const getPrice = (itemName: string): number => {
    const normalizedName = itemName.toLowerCase().trim();
    return mockPrices[normalizedName] || 2.5; // Default price if not found
  };

  const calculateLocalTotal = (): number => {
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  useEffect(() => {
    // Synchroniser le total local avec le backend
    const syncTotal = async () => {
      try {
        const backendTotal = await getTotal();
        if (Math.abs(backendTotal.total - total) > 0.01) {
          setTotal(backendTotal.total);
        }
      } catch (error) {
        console.error('Error syncing total:', error);
      }
    };

    syncTotal();
  }, [items]);

  useEffect(() => {
    if (!transcript) return;

    const lowerTranscript = transcript.toLowerCase();
    // ================= PAIEMENT PANIER =================

// 🔹 DEMANDE DE PAIEMENT PANIER
if (
  state === "idle" &&
  (
    lowerTranscript.includes("payer") ||
    lowerTranscript.includes("checkout") ||
    lowerTranscript.includes("خلص") ||
    lowerTranscript.includes("دفع")
  )
) {

  let resume = items
    .map(i => `${i.quantity} ${i.name}`)
    .join(", ");

  onVoiceResponse(
    language === "fr"
      ? `Votre panier contient : ${resume}. Total ${total} dinars. Voulez-vous payer maintenant ?`
      : language === "ar"
      ? `سلتك تحتوي على : ${resume}. المجموع ${total} دينار. هل تريد الدفع الآن؟`
      : `Your cart contains: ${resume}. Total ${total} dinars. Do you want to pay now?`
  );

  setState("checkout-offer");
  onResetTranscript();
  return;
}
// 🔹 CONFIRMATION PAIEMENT
if (state === "checkout-offer") {

  if (
    lowerTranscript.includes("oui") ||
    lowerTranscript.includes("yes") ||
    lowerTranscript.includes("نعم")
  ) {

    setState("checkout-paying");

    onVoiceResponse(
      language === "fr"
        ? "Très bien, je lance le paiement sécurisé Stripe."
        : language === "ar"
        ? "حسناً، سأبدأ الدفع عبر سترايب."
        : "Okay, starting secure Stripe payment."
    );

    // 👉 DÉCLENCHER STRIPE
    // @ts-ignore
    window.triggerStripePay?.();

    onResetTranscript();
    return;
  }

  if (
    lowerTranscript.includes("non") ||
    lowerTranscript.includes("no") ||
    lowerTranscript.includes("لا")
  ) {

    setState("idle");

    onVoiceResponse(
      language === "fr"
        ? "D'accord, paiement annulé. Que voulez-vous faire ?"
        : language === "ar"
        ? "حسناً، تم إلغاء الدفع. ماذا تريد أن تفعل؟"
        : "Okay, payment canceled. What would you like to do?"
    );

    onResetTranscript();
    return;
  }
}


    // Add item command
    if (
      state === 'idle' &&
      (lowerTranscript.includes('ajouter') ||
       lowerTranscript.includes('add') ||
       lowerTranscript.includes('إضافة'))
    ) {
      // ON FORCE LA DEMANDE DU NOM
      setState('add-item');
      setCurrentItemName("");

      onVoiceResponse(t.whatToAdd);
      onResetTranscript();
      return;
    }

    // Remove item command
    if (state === 'idle' && (lowerTranscript.includes('retirer') || lowerTranscript.includes('remove') || lowerTranscript.includes('supprimer') || lowerTranscript.includes('إزالة'))) {
      const cleanedName = cleanName(transcript);
      if (cleanedName) {
        // Traitement direct si le nom est déjà fourni
        setIsLoading(true);
        removeArticle(cleanedName)
          .then(async () => {
            const itemToRemove = items.find(item => 
              item.name.toLowerCase().includes(cleanedName.toLowerCase())
            );
            if (itemToRemove) {
              setItems(prev => prev.filter(item => item.id !== itemToRemove.id));
              const data = await getTotal();
              setTotal(data.total);
              onVoiceResponse(`${cleanedName} ${t.itemRemoved}`);
            } else {
              onVoiceResponse(language === 'fr' ? 'Article non trouvé' : 'العنصر غير موجود');
            }
            setTimeout(() => {
              onVoiceResponse(t.instructions);
            }, 2000);
          })
          .catch(error => {
            onVoiceResponse(language === 'fr' ? 'Erreur lors de la suppression' : 'خطأ أثناء الإزالة');
            console.error('Error removing item:', error);
          })
          .finally(() => {
            setIsLoading(false);
          });
        onResetTranscript();
      } else {
        setState('remove-item');
        onVoiceResponse(language === 'fr' ? 'Quel article voulez-vous retirer?' : 'ما هو العنصر الذي تريد إزالته؟');
        onResetTranscript();
      }
    }

    // Capture item name to add
    if (state === 'add-item') {
      const name = cleanName(transcript);

      // Ignore bruit ".", " ", etc
      if (!name || name.length < 2) {
        onResetTranscript();
        return;
      }

      setCurrentItemName(name);
      setState('add-quantity');

      onVoiceResponse(
        language === 'fr'
          ? `Combien pour ${name} ?`
          : language === 'ar'
          ? `كم الكمية ل ${name} ؟`
          : `How many for ${name}?`
      );

      onResetTranscript();
      return;
    }

    // Capture quantity and price
    if (state === 'add-quantity') {
      const matchQty = transcript.match(/\d+/);
      const qty = matchQty ? parseInt(matchQty[0]) : 1;

      // Extraire prix s'il existe dans la transcription
      const matchPrice = transcript.match(/(\d+(\.\d+)?)/g);
      const price = matchPrice && matchPrice.length > 1
        ? parseFloat(matchPrice[1])
        : getPrice(currentItemName);

      setIsLoading(true);
      addArticle(currentItemName, price, qty)
        .then(async () => {
          await refreshTotal();
          await loadInitialData();
          const data = await getTotal();
          setTotal(data.total);

          // Ajouter à la liste locale
          const newItem: ShoppingItem = {
            id: Date.now().toString(),
            name: currentItemName,
            quantity: qty,
            price,
          };
          setItems(prev => [...prev, newItem]);

          const message = language === 'fr' 
            ? `${qty} ${currentItemName} ajouté à ${price} dinars. Total actuel = ${data.total} dinars`
            : language === 'ar'
            ? `تمت إضافة ${qty} ${currentItemName} بسعر ${price} دينار. المجموع الحالي = ${data.total} دينار`
            : `${qty} ${currentItemName} added at ${price} dinars. Current total = ${data.total} dinars`;

          onVoiceResponse(message);
          setState("idle");
          setCurrentItemName("");

          setTimeout(() => {
            onVoiceResponse(t.instructions);
          }, 2000);
        })
        .catch(error => {
          onVoiceResponse(language === 'fr' ? 'Erreur lors de l\'ajout' : 'خطأ أثناء الإضافة');
          console.error('Error adding item:', error);
        })
        .finally(() => {
          setIsLoading(false);
        });

      onResetTranscript();
      return;
    }

    // Remove item by name
    if (state === 'remove-item' && transcript.trim().length > 1) {
      const name = cleanName(transcript);
      setIsLoading(true);

      removeArticle(name)
        .then(async () => {
          const itemToRemove = items.find(item => 
            item.name.toLowerCase().includes(name.toLowerCase())
          );
          if (itemToRemove) {
            setItems(prev => prev.filter(item => item.id !== itemToRemove.id));
            const data = await getTotal();
            setTotal(data.total);

            const message = language === 'fr'
              ? `${name} retiré du panier`
              : language === 'ar'
              ? `تمت إزالة ${name} من السلة`
              : `${name} removed from cart`;

            onVoiceResponse(message);
          } else {
            onVoiceResponse(language === 'fr' ? 'Article non trouvé' : 'العنصر غير موجود');
          }
          setState("idle");

          setTimeout(() => {
            onVoiceResponse(t.instructions);
          }, 2000);
        })
        .catch(error => {
          onVoiceResponse(language === 'fr' ? 'Erreur lors de la suppression' : 'خطأ أثناء الإزالة');
          console.error('Error removing item:', error);
        })
        .finally(() => {
          setIsLoading(false);
        });

      onResetTranscript();
      return;
    }
// 🔹 CONFIRMATION PAIEMENT
if (state === "checkout-offer") {

  if (
    lowerTranscript.includes("oui") ||
    lowerTranscript.includes("yes") ||
    lowerTranscript.includes("نعم")
  ) {
    setState("checkout-paying");

    onVoiceResponse(
      language === "fr"
        ? "Paiement du panier en cours"
        : language === "ar"
        ? "جاري دفع السلة"
        : "Processing cart payment"
    );

    // 👉 déclenche Stripe global
    // @ts-ignore
    window.triggerStripePay?.();

    onResetTranscript();
    return;
  }

  if (
    lowerTranscript.includes("non") ||
    lowerTranscript.includes("no") ||
    lowerTranscript.includes("لا")
  ) {
    setState("idle");

    onVoiceResponse(
      language === "fr"
        ? "Paiement annulé"
        : language === "ar"
        ? "تم إلغاء الدفع"
        : "Payment canceled"
    );

    onResetTranscript();
    return;
  }
}


    // Read total command
    if (state === 'idle' && (lowerTranscript.includes('total') || lowerTranscript.includes('مجموع'))) {
      const currentTotal = calculateLocalTotal();
      const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
      const message = `${t.total}: ${currentTotal.toFixed(2)} ${t.dinars}. ${itemCount} ${t.items}`;
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

 const handleRemoveItem = async (id: string) => {

  const item = items.find(i => i.id === id);
  if (!item) return;

  try {
    // 1️⃣ SUPPRIMER DANS LA BASE
    await removeArticle(item.name);

    // 2️⃣ SUPPRIMER EN LOCAL
    setItems(prev => prev.filter(i => i.id !== id));

    // 3️⃣ METTRE À JOUR LE TOTAL DEPUIS BACK
    const data = await getTotal();
    setTotal(data.total);

    // 4️⃣ MESSAGE VOCAL
    onVoiceResponse(`${item.name} supprimé du panier`);

  } catch (err) {
    console.error(err);
    onVoiceResponse("Erreur lors de la suppression");
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
          disabled={isLoading}
        >
          <ArrowLeft className="w-8 h-8" aria-hidden="true" />
          <span>{t.goBack}</span>
        </button>

        <h2 className="text-4xl" tabIndex={0}>{t.title}</h2>
        {isLoading && (
          <div className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg">
            {language === 'fr' ? 'Chargement...' : language === 'ar' ? 'جار التحميل...' : 'Loading...'}
          </div>
        )}
      </div>

      {/* Total Display */}
      <div 
        className={`mb-8 p-10 rounded-2xl ${
          total > BUDGET_LIMIT
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
              {total.toFixed(2)}
            </p>
            <p className="text-3xl opacity-90">{language === 'fr' ? 'TND' : language === 'ar' ? 'دينار تونسي' : 'TND'}</p>
          </div>
          <div className="relative">
            <ShoppingCart className="w-32 h-32 opacity-80" aria-hidden="true" />
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-50 rounded-full">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600"></div>
              </div>
            )}
          </div>
        </div>
        <div className="mt-6 flex items-center justify-between">
          <p className="text-2xl opacity-90">
            {items.reduce((sum, item) => sum + item.quantity, 0)} {t.items}
          </p>
          {total <= BUDGET_LIMIT && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-400 bg-opacity-50">
              <span className="text-xl">✓ {language === 'fr' ? 'Dans le budget' : language === 'ar' ? 'ضمن الميزانية' : 'Within budget'}</span>
            </div>
          )}
        </div>
      </div>

      {/* Budget Warning Alert */}
      {total > BUDGET_LIMIT && (
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
                  ? `Vous dépassez de ${(total - BUDGET_LIMIT).toFixed(2)} dinars` 
                  : language === 'ar'
                  ? `لقد تجاوزت بمقدار ${(total - BUDGET_LIMIT).toFixed(2)} دينار`
                  : `You are over by ${(total - BUDGET_LIMIT).toFixed(2)} dinars`}
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
          disabled={isLoading}
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
              💬 {language === 'fr' ? 'Dites: "ajouter lait"' : language === 'ar' ? 'قل: "إضافة حليب"' : 'Say: "add milk"'}
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
          disabled={isLoading}
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
              💬 {language === 'fr' ? 'Dites: "retirer lait"' : language === 'ar' ? 'قل: "إزالة حليب"' : 'Say: "remove milk"'}
            </p>
          </div>
        </button>

        <button
          onClick={async () => {
            try {
              setIsLoading(true);
              const totalData = await getTotal();
              const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
              const message = `${t.total}: ${totalData.total.toFixed(2)} ${t.dinars}. ${itemCount} ${t.items}`;
              onVoiceResponse(message);
            } catch (error) {
              onVoiceResponse(language === 'fr' ? 'Erreur de connexion' : 'خطأ في الاتصال');
            } finally {
              setIsLoading(false);
            }
          }}
          className={`p-8 rounded-2xl text-left transition-all hover:scale-105 focus:scale-105 focus:outline-none focus:ring-8 ${
            highContrast 
              ? 'bg-gray-900 border-4 border-white focus:ring-white' 
              : 'bg-white shadow-xl focus:ring-blue-300'
          }`}
          aria-label={language === 'fr' ? 'Lire le total' : language === 'ar' ? 'قراءة المجموع' : 'Read total'}
          disabled={isLoading}
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
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-3xl">{t.title}</h3>
          <button
            onClick={loadInitialData}
            className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200"
            disabled={isLoading}
          >
            {language === 'fr' ? 'Actualiser' : language === 'ar' ? 'تحديث' : 'Refresh'}
          </button>
        </div>
        
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
                    disabled={isLoading}
                  >
                    <Trash2 className="w-8 h-8" aria-hidden="true" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      {/* 🔥 PAIEMENT PANIER */}
{state === "checkout-paying" && (
  <StripePay
    amount={total}
    onSuccess={async (newBalance: number) => {

      // 1️⃣ Vider le panier côté back
      for (const item of items) {
        await removeArticle(item.name);
      }

      // 2️⃣ Reset local
      setItems([]);
      setTotal(0);

      // 3️⃣ Message vocal
      onVoiceResponse(
        language === "fr"
          ? `Paiement réussi. Nouveau solde : ${newBalance} dinars`
          : language === "ar"
          ? `تم الدفع. رصيدك الجديد ${newBalance} دينار`
          : `Payment successful. New balance ${newBalance} dinars`
      );

      setState("idle");
    }}
  />
)}


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
                  <p className="text-xl mt-2 opacity-70">
                    {language === 'fr' 
                      ? 'Vous pouvez aussi dire un prix, ex: "ajouter lait 1.4 dinars 2"'
                      : language === 'ar'
                      ? 'يمكنك أيضا قول السعر، مثال: "إضافة حليب 1.4 دينار 2"'
                      : 'You can also say a price, ex: "add milk 1.4 dinars 2"'}
                  </p>
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
        <p className="text-xl text-center mt-4 opacity-70">
          {language === 'fr'
            ? 'Exemples: "ajouter lait 1.4 dinars 2", "retirer pain", "total"'
            : language === 'ar'
            ? 'أمثلة: "إضافة حليب 1.4 دينار 2", "إزالة خبز", "مجموع"'
            : 'Examples: "add milk 1.4 dinars 2", "remove bread", "total"'}
        </p>
        <p className="text-lg text-center mt-2 opacity-50">
          {language === 'fr'
            ? 'Données sauvegardées dans MongoDB'
            : language === 'ar'
            ? 'البيانات محفوظة في MongoDB'
            : 'Data saved in MongoDB'}
        </p>
      </div>
    </div>
  );
}