import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';

import { getBalance, makeTransfer } from '../../services/api';
import StripePay from "./StripePay";

interface BankingAssistantProps {
  language: 'fr' | 'ar' | 'en';
  highContrast: boolean;
  transcript: string;
  onVoiceResponse: (message: string) => void;
  onResetTranscript: () => void;
  onGoHome: () => void;
}

type BankingState =
  | 'idle'
  | 'checking-balance'
  | 'transfer-amount'
  | 'transfer-recipient'
  | 'transfer-confirm'
  | 'stripe-confirm'
  | 'stripe-offer'
| 'stripe-paying';

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
    instructions:
      'Dites "solde" pour consulter votre solde, ou "virement" pour faire un virement.',
    amountPrompt:
      'Quel montant voulez-vous transférer? Dites le montant en dinars.',
    recipientPrompt:
      'À qui voulez-vous envoyer cet argent? Dites le nom du destinataire.',
    confirmPrompt: 'Confirmez-vous le virement de',
    to: 'vers',
    sayYesOrNo: 'Dites "oui" pour confirmer ou "non" pour annuler.',
    reassurance: 'Ne vous inquiétez pas, je vous guide étape par étape.',
    secure: 'Vos informations sont sécurisées.',
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
    instructions:
      'قل "رصيد" للتحقق من رصيدك، أو "تحويل" لإجراء تحويل.',
    amountPrompt:
      'ما هو المبلغ الذي تريد تحويله؟ قل المبلغ بالدينار.',
    recipientPrompt:
      'لمن تريد إرسال هذا المبلغ؟ قل اسم المستلم.',
    confirmPrompt: 'هل تؤكد تحويل',
    to: 'إلى',
    sayYesOrNo: 'قل "نعم" للتأكيد أو "لا" للإلغاء.',
    reassurance: 'لا تقلق، سأرشدك خطوة بخطوة.',
    secure: 'معلوماتك آمنة.',
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
    instructions:
      'Say "balance" to check your balance, or "transfer" to make a transfer.',
    amountPrompt:
      'What amount would you like to transfer? Say the amount in dinars.',
    recipientPrompt:
      'Who would you like to send this money to? Say the recipient name.',
    confirmPrompt: 'Do you confirm the transfer of',
    to: 'to',
    sayYesOrNo: 'Say "yes" to confirm or "no" to cancel.',
    reassurance: "Don't worry, I will guide you step by step.",
    secure: 'Your information is secure.',
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

  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(false);

  const t = translations[language];

  // ======= CHARGER SOLDE RÉEL =======
  useEffect(() => {
    onVoiceResponse(t.title + '. ' + t.instructions);

    async function load() {
      const data = await getBalance();
      setBalance(data.balance);
    }

    load();
  }, []);

  // ======= GESTION VOCALE =======
  useEffect(() => {
    if (!transcript) return;

    const text = transcript.toLowerCase();

    // 🔹 CONSULTATION SOLDE
    if (
      state === 'idle' &&
      (text.includes('solde') ||
        text.includes('balance') ||
        text.includes('رصيد'))
    ) {
      setState('checking-balance');

      (async () => {
        const data = await getBalance();
        setBalance(data.balance);

        const msg = `${t.currentBalance} ${data.balance} ${t.dinars}`;
        onVoiceResponse(msg);
      })();

      onResetTranscript();

      setTimeout(() => {
        setState('idle');
        onVoiceResponse(t.instructions);
      }, 3000);
    }

    // 🔹 DÉBUT VIREMENT
    if (
      state === 'idle' &&
      (text.includes('virement') ||
        text.includes('transfer') ||
        text.includes('تحويل'))
    ) {
      setState('transfer-amount');
      onVoiceResponse(t.amountPrompt);
      onResetTranscript();
    }

    // 🔹 MONTANT
    if (state === 'transfer-amount') {
      const numbers = text.match(/\d+/g);

      if (numbers) {
        setTransferAmount(numbers[0]);
        setState('transfer-recipient');
        onVoiceResponse(t.recipientPrompt);
        onResetTranscript();
      }
    }

    // 🔹 DESTINATAIRE
    if (state === 'transfer-recipient' && transcript.length > 2) {
      setTransferRecipient(transcript.trim());
      setState('transfer-confirm');

      const msg = `${t.confirmPrompt} ${transferAmount} ${t.dinars} ${t.to} ${transcript.trim()}. ${t.sayYesOrNo}`;
      onVoiceResponse(msg);

      onResetTranscript();
    }

    // 🔹 CONFIRMATION
    // 🔹 CONFIRMATION VIREMENT CLASSIQUE
if (state === 'transfer-confirm') {
  if (
    text.includes('oui') ||
    text.includes('yes') ||
    text.includes('نعم')
  ) {
    setState('stripe-offer');

    onVoiceResponse(
      `Voulez-vous effectuer le virement de ${transferAmount} dinars avec Stripe ?`
    );

    onResetTranscript();
  }

  if (
    text.includes('non') ||
    text.includes('no') ||
    text.includes('لا')
  ) {
    cancelTransfer();
  }
}

// ======= ICI TU METS TON CODE =======

// 🔹 CONFIRM STRIPE
if (state === 'stripe-offer') {

  if (
    text.includes('oui') ||
    text.includes('yes') ||
    text.includes('نعم')
  ) {

    setState('stripe-paying');

    onVoiceResponse(
      language === "ar"
        ? "تم الدفع بنجاح"
        : language === "en"
        ? "Payment completed successfully"
        : "Paiement effectué avec succès"
    );

    // 🔥 ICI LE PAIEMENT SE LANCE
    window.triggerStripePay?.();

    onResetTranscript();
  }
}

  }, [transcript, state, transferAmount, t]);

  // ======= FONCTIONS BACK =======

  async function confirmTransfer() {
    setLoading(true);

    const res = await makeTransfer(
      transferRecipient,
      parseFloat(transferAmount)
    );

    if (!res.error) {
      const data = await getBalance();
      setBalance(data.balance);

      setShowSuccess(true);
      onVoiceResponse(t.transferSuccess);
    } else {
      onVoiceResponse(res.message || t.transferCanceled);
    }

    setLoading(false);

    setTimeout(() => {
      setShowSuccess(false);
      setState('idle');
      setTransferAmount('');
      setTransferRecipient('');
    }, 3000);
  }

  function cancelTransfer() {
    setState('idle');
    setTransferAmount('');
    setTransferRecipient('');

    onVoiceResponse(
      t.transferCanceled + '. ' + t.instructions
    );
  }

  // ======= UI =======
  return (
    <div>
      <h2 className="text-4xl mb-6">{t.title}</h2>

      <div className="p-10 rounded-2xl bg-blue-600 text-white">
        <h3 className="text-3xl mb-4">{t.balance}</h3>

        <p className="text-7xl font-bold">
          {balance.toFixed(2)}
        </p>

        <p className="text-3xl">TND</p>
      </div>
      {/* STRIPE RECHARGE */}
      <div className="mb-6">
        <h3 className="text-2xl mb-2">Recharger le compte</h3>

       <StripePay
  amount={Number(transferAmount)}
  onSuccess={async () => {
    const data = await getBalance();
    setBalance(data.balance);

    onVoiceResponse("Paiement effectué et solde mis à jour");
    setState("idle");
  }}
/>
        <button
          className="mt-2 bg-green-600 text-white px-4 py-2 rounded"
          onClick={async () => {
            const data = await getBalance();
            setBalance(data.balance);
          }}
        >
          Actualiser solde
        </button>
      </div>

      {/* SUCCESS */}
      {showSuccess && (
        <div className="mt-6 p-6 bg-green-100 border-4 border-green-500">
          <CheckCircle className="w-12 h-12 text-green-600" />
          <p className="text-3xl">Virement réussi</p>
        </div>
      )}
    </div>
  );
}
