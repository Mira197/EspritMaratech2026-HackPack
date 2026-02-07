import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';

interface BankingAssistantProps {
  language: 'fr' | 'ar' | 'en';
  highContrast: boolean;
  transcript: string;
  onVoiceResponse: (message: string) => void;
  onResetTranscript: () => void;
  onGoHome: () => void;
}

type BankingState = 'idle' | 'checking-balance' | 'transfer-amount' | 'transfer-recipient' | 'transfer-confirm';

const mockAccounts = {
  checking: { balance: 2450.75, name: 'Compte Courant' },
  savings: { balance: 15320.50, name: 'Compte Épargne' },
};

const translations = {
  fr: {
    title: 'Assistant Bancaire',
    goBack: 'Retour',
    balance: 'Solde',
    checkBalance: 'Consulter le solde',
    makeTransfer: 'Faire un virement',
    currentBalance: 'Votre solde actuel est de',
    dinars: 'dinars',
    transferAmount: 'Montant du virement',
    transferRecipient: 'Destinataire',
    confirm: 'Confirmer',
    cancel: 'Annuler',
    transferSuccess: 'Virement effectué avec succès',
    transferCanceled: 'Virement annulé',
    instructions: 'Dites \"solde\" pour consulter votre solde, ou \"virement\" pour faire un virement.',
    amountPrompt: 'Quel montant voulez-vous transférer? Dites le montant en dinars. Prenez votre temps.',
    recipientPrompt: 'À qui voulez-vous envoyer cet argent? Dites le nom du destinataire calmement.',
    confirmPrompt: 'Confirmez-vous le virement de',
    to: 'vers',
    sayYesOrNo: 'Dites \"oui\" pour confirmer ou \"non\" pour annuler. Pas de précipitation.',
    reassurance: 'Ne vous inquiétez pas, je vous guide étape par étape.',
    secure: 'Vos informations sont sécurisées.',
    helpText: 'À tout moment, dites \"annuler\" pour arrêter ou \"aide\" pour plus d\'informations.',
  },
  ar: {
    title: 'المساعد المصرفي',
    goBack: 'رجوع',
    balance: 'الرصيد',
    checkBalance: 'التحقق من الرصيد',
    makeTransfer: 'إجراء تحويل',
    currentBalance: 'رصيدك الحالي هو',
    dinars: 'دينار',
    transferAmount: 'مبلغ التحويل',
    transferRecipient: 'المستلم',
    confirm: 'تأكيد',
    cancel: 'إلغاء',
    transferSuccess: 'تم التحويل بنجاح',
    transferCanceled: 'تم إلغاء التحويل',
    instructions: 'قل \"رصيد\" للتحقق من رصيدك، أو \"تحويل\" لإجراء تحويل.',
    amountPrompt: 'ما هو المبلغ الذي تريد تحويله؟ قل المبلغ بالدينار. خذ وقتك.',
    recipientPrompt: 'لمن تريد إرسال هذا المبلغ؟ قل اسم المستلم بهدوء.',
    confirmPrompt: 'هل تؤكد تحويل',
    to: 'إلى',
    sayYesOrNo: 'قل \"نعم\" للتأكيد أو \"لا\" للإلغاء. لا تتعجل.',
    reassurance: 'لا تقلق، سأرشدك خطوة بخطوة.',
    secure: 'معلوماتك آمنة.',
    helpText: 'في أي وقت، قل \"إلغاء\" للتوقف أو \"مساعدة\" لمزيد من المعلومات.',
  },
  en: {
    title: 'Banking Assistant',
    goBack: 'Back',
    balance: 'Balance',
    checkBalance: 'Check Balance',
    makeTransfer: 'Make Transfer',
    currentBalance: 'Your current balance is',
    dinars: 'dinars',
    transferAmount: 'Transfer Amount',
    transferRecipient: 'Recipient',
    confirm: 'Confirm',
    cancel: 'Cancel',
    transferSuccess: 'Transfer completed successfully',
    transferCanceled: 'Transfer canceled',
    instructions: 'Say \"balance\" to check your balance, or \"transfer\" to make a transfer.',
    amountPrompt: 'What amount would you like to transfer? Say the amount in dinars. Take your time.',
    recipientPrompt: 'Who would you like to send this money to? Say the recipient\'s name calmly.',
    confirmPrompt: 'Do you confirm the transfer of',
    to: 'to',
    sayYesOrNo: 'Say \"yes\" to confirm or \"no\" to cancel. No rush.',
    reassurance: 'Don\'t worry, I will guide you step by step.',
    secure: 'Your information is secure.',
    helpText: 'At any time, say \"cancel\" to stop or \"help\" for more information.',
  },
};

export function BankingAssistant({
  language,
  highContrast,
  transcript,
  onVoiceResponse,
  onResetTranscript,
  onGoHome,
}: BankingAssistantProps) {
  const [state, setState] = useState<BankingState>('idle');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferRecipient, setTransferRecipient] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const t = translations[language];

  useEffect(() => {
    // Announce module on entry
    onVoiceResponse(t.title + '. ' + t.instructions);
  }, []);

  useEffect(() => {
    if (!transcript) return;

    const lowerTranscript = transcript.toLowerCase();

    // Check balance command
    if (state === 'idle' && (lowerTranscript.includes('solde') || lowerTranscript.includes('balance') || lowerTranscript.includes('رصيد'))) {
      setState('checking-balance');
      const message = `${t.currentBalance} ${mockAccounts.checking.balance} ${t.dinars}`;
      onVoiceResponse(message);
      onResetTranscript();
      setTimeout(() => {
        setState('idle');
        onVoiceResponse(t.instructions);
      }, 3000);
    }

    // Transfer command
    if (state === 'idle' && (lowerTranscript.includes('virement') || lowerTranscript.includes('transfer') || lowerTranscript.includes('تحويل'))) {
      setState('transfer-amount');
      onVoiceResponse(t.amountPrompt);
      onResetTranscript();
    }

    // Capture transfer amount
    if (state === 'transfer-amount') {
      const numbers = lowerTranscript.match(/\d+/g);
      if (numbers && numbers.length > 0) {
        const amount = numbers[0];
        setTransferAmount(amount);
        setState('transfer-recipient');
        onVoiceResponse(t.recipientPrompt);
        onResetTranscript();
      }
    }

    // Capture recipient name
    if (state === 'transfer-recipient' && transcript.trim().length > 2) {
      setTransferRecipient(transcript.trim());
      setState('transfer-confirm');
      const message = `${t.confirmPrompt} ${transferAmount} ${t.dinars} ${t.to} ${transcript.trim()}. ${t.sayYesOrNo}`;
      onVoiceResponse(message);
      onResetTranscript();
    }

    // Confirmation
    if (state === 'transfer-confirm') {
      if (lowerTranscript.includes('oui') || lowerTranscript.includes('yes') || lowerTranscript.includes('نعم')) {
        setShowSuccess(true);
        onVoiceResponse(t.transferSuccess);
        onResetTranscript();
        setTimeout(() => {
          setShowSuccess(false);
          setState('idle');
          setTransferAmount('');
          setTransferRecipient('');
          onVoiceResponse(t.instructions);
        }, 3000);
      } else if (lowerTranscript.includes('non') || lowerTranscript.includes('no') || lowerTranscript.includes('لا')) {
        setState('idle');
        setTransferAmount('');
        setTransferRecipient('');
        onVoiceResponse(t.transferCanceled + '. ' + t.instructions);
        onResetTranscript();
      }
    }
  }, [transcript, state]);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={onGoHome}
          className={`flex items-center gap-3 px-6 py-4 rounded-xl text-2xl transition-all hover:scale-105 focus:scale-105 focus:outline-none focus:ring-8 ${
            highContrast 
              ? 'bg-gray-800 border-2 border-white focus:ring-white' 
              : 'bg-white shadow-lg focus:ring-blue-300'
          }`}
          aria-label={t.goBack}
        >
          <ArrowLeft className="w-8 h-8" aria-hidden="true" />
          <span>{t.goBack}</span>
        </button>

        <h2 className="text-4xl" tabIndex={0}>{t.title}</h2>
      </div>

      {/* Account Balance Display */}
      <div 
        className={`mb-8 p-10 rounded-2xl ${highContrast ? 'bg-gray-900 border-4 border-white' : 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-xl'}`}
        role="region"
        aria-label={t.balance}
      >
        <h3 className="text-3xl mb-6 opacity-90">{mockAccounts.checking.name}</h3>
        <p className="text-7xl font-bold mb-3" tabIndex={0}>
          {mockAccounts.checking.balance.toFixed(2)}
        </p>
        <p className="text-3xl opacity-90">{language === 'fr' ? 'TND' : language === 'ar' ? 'دينار تونسي' : 'TND'}</p>
        
        {/* Security badge */}
        <div className={`mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-lg ${highContrast ? 'bg-gray-800' : 'bg-blue-400 bg-opacity-50'}`}>
          <span className="text-xl">🔒 {t.secure}</span>
        </div>
      </div>

      {/* Reassurance Message */}
      <div className={`mb-8 p-6 rounded-xl text-center ${highContrast ? 'bg-gray-800 border-2 border-green-400' : 'bg-green-50 border-2 border-green-300'}`}>
        <p className="text-2xl">
          <span className="text-3xl mr-2">✓</span>
          {t.reassurance}
        </p>
      </div>

      {/* Quick Actions with Step Indicators */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <button
          onClick={() => {
            setState('checking-balance');
            const message = `${t.currentBalance} ${mockAccounts.checking.balance} ${t.dinars}`;
            onVoiceResponse(message);
            setTimeout(() => {
              setState('idle');
              onVoiceResponse(t.instructions);
            }, 3000);
          }}
          className={`p-10 rounded-2xl text-left transition-all hover:scale-105 focus:scale-105 focus:outline-none focus:ring-8 ${
            highContrast 
              ? 'bg-gray-900 border-4 border-white focus:ring-white' 
              : 'bg-white shadow-xl focus:ring-blue-300'
          }`}
          aria-label={t.checkBalance}
        >
          <div className="flex items-start gap-4 mb-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold ${highContrast ? 'bg-white text-black' : 'bg-blue-100 text-blue-600'}`}>
              1
            </div>
            <div className="flex-1">
              <h4 className="text-3xl font-bold mb-2">{t.checkBalance}</h4>
              <p className="text-xl opacity-70 mb-3">
                {language === 'fr' ? 'Action rapide et simple' : language === 'ar' ? 'إجراء سريع وبسيط' : 'Quick and simple action'}
              </p>
            </div>
          </div>
          <div className={`p-4 rounded-lg ${highContrast ? 'bg-gray-800' : 'bg-blue-50'}`}>
            <p className="text-2xl">
              💬 {language === 'fr' ? 'Dites: "solde"' : language === 'ar' ? 'قل: "رصيد"' : 'Say: "balance"'}
            </p>
          </div>
        </button>

        <button
          onClick={() => {
            setState('transfer-amount');
            onVoiceResponse(t.amountPrompt);
          }}
          className={`p-10 rounded-2xl text-left transition-all hover:scale-105 focus:scale-105 focus:outline-none focus:ring-8 ${
            highContrast 
              ? 'bg-gray-900 border-4 border-white focus:ring-white' 
              : 'bg-white shadow-xl focus:ring-blue-300'
          }`}
          aria-label={t.makeTransfer}
        >
          <div className="flex items-start gap-4 mb-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold ${highContrast ? 'bg-white text-black' : 'bg-green-100 text-green-600'}`}>
              3
            </div>
            <div className="flex-1">
              <h4 className="text-3xl font-bold mb-2">{t.makeTransfer}</h4>
              <p className="text-xl opacity-70 mb-3">
                {language === 'fr' ? 'En 3 étapes guidées' : language === 'ar' ? 'في 3 خطوات مرشدة' : 'In 3 guided steps'}
              </p>
            </div>
          </div>
          <div className={`p-4 rounded-lg ${highContrast ? 'bg-gray-800' : 'bg-green-50'}`}>
            <p className="text-2xl">
              💬 {language === 'fr' ? 'Dites: "virement"' : language === 'ar' ? 'قل: "تحويل"' : 'Say: "transfer"'}
            </p>
          </div>
        </button>
      </div>

      {/* Transfer Flow */}
      {(state === 'transfer-amount' || state === 'transfer-recipient' || state === 'transfer-confirm') && (
        <div 
          className={`p-8 rounded-2xl ${highContrast ? 'bg-gray-900 border-4 border-yellow-400' : 'bg-yellow-50 border-4 border-yellow-400 shadow-xl'}`}
          role="region"
          aria-live="polite"
          aria-atomic="true"
        >
          <div className="flex items-start gap-4 mb-6">
            <AlertCircle className="w-12 h-12 text-yellow-600 flex-shrink-0" aria-hidden="true" />
            <div>
              <h3 className="text-3xl mb-4">{t.makeTransfer}</h3>
              
              {state === 'transfer-amount' && (
                <p className="text-2xl">{t.amountPrompt}</p>
              )}
              
              {state === 'transfer-recipient' && (
                <div>
                  <p className="text-2xl mb-4">{t.transferAmount}: <strong>{transferAmount} {t.dinars}</strong></p>
                  <p className="text-2xl">{t.recipientPrompt}</p>
                </div>
              )}
              
              {state === 'transfer-confirm' && (
                <div>
                  <p className="text-2xl mb-4">
                    <strong>{t.transferAmount}:</strong> {transferAmount} {t.dinars}
                  </p>
                  <p className="text-2xl mb-4">
                    <strong>{t.transferRecipient}:</strong> {transferRecipient}
                  </p>
                  <p className="text-3xl mb-4">{t.sayYesOrNo}</p>
                  <div className="flex gap-4">
                    <button
                      onClick={() => {
                        setShowSuccess(true);
                        onVoiceResponse(t.transferSuccess);
                        setTimeout(() => {
                          setShowSuccess(false);
                          setState('idle');
                          setTransferAmount('');
                          setTransferRecipient('');
                          onVoiceResponse(t.instructions);
                        }, 3000);
                      }}
                      className="px-8 py-4 bg-green-600 text-white rounded-xl text-2xl hover:bg-green-700 focus:ring-8 focus:ring-green-300 focus:outline-none"
                      aria-label={t.confirm}
                    >
                      {t.confirm}
                    </button>
                    <button
                      onClick={() => {
                        setState('idle');
                        setTransferAmount('');
                        setTransferRecipient('');
                        onVoiceResponse(t.transferCanceled + '. ' + t.instructions);
                      }}
                      className="px-8 py-4 bg-red-600 text-white rounded-xl text-2xl hover:bg-red-700 focus:ring-8 focus:ring-red-300 focus:outline-none"
                      aria-label={t.cancel}
                    >
                      {t.cancel}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Success Message */}
      {showSuccess && (
        <div 
          className={`mt-6 p-8 rounded-2xl ${highContrast ? 'bg-gray-900 border-4 border-green-400' : 'bg-green-100 border-4 border-green-500 shadow-xl'}`}
          role="alert"
          aria-live="assertive"
        >
          <div className="flex items-center gap-4">
            <CheckCircle className="w-12 h-12 text-green-600" aria-hidden="true" />
            <p className="text-3xl text-green-800">{t.transferSuccess}</p>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div 
        className={`mt-8 p-6 rounded-xl ${highContrast ? 'bg-gray-800' : 'bg-blue-50'}`}
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