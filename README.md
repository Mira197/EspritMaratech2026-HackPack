# 🎙️ BASIRA – بصيرة  
## Assistant Vocal Accessible  
### #MaraTechEsprit2026

![BASIRA Logo](./assets/logo-basira.png)

---

## 🌍 Présentation du projet

**BASIRA** est une **application web inclusive assistée par la voix**, développée lors du **Hackathon MaraTech 2026 (6–8 février 2026)**, visant à renforcer l’**autonomie numérique des personnes malvoyantes, non-voyantes et seniors**.

L’application permet aux utilisateurs d’accéder à des **services essentiels (banque, courses)** **sans utiliser l’écran**, **uniquement par la voix**, grâce à une interface conforme aux normes d’accessibilité internationales.

---

## 🤝 Association bénéficiaire

### Association IBSAR  
**Association pour la Culture et les Loisirs des Non et Malvoyants – Tunis**

IBSAR œuvre pour :
- l’inclusion sociale,
- l’autonomie numérique,
- le renforcement des capacités des personnes en situation de handicap visuel.

👉 **BASIRA** a été conçue spécifiquement pour répondre aux besoins exprimés par l’association IBSAR, dans le cadre du cahier des charges officiel du hackathon.

---

## 🎯 Problématique

Les outils numériques actuels (applications bancaires, e-commerce, services en ligne) :
- sont fortement dépendants de l’interface visuelle,
- manquent de compatibilité avec les lecteurs d’écran,
- créent une dépendance envers des tiers,
- exposent les utilisateurs à des risques de sécurité.

---

## ✅ Objectif de BASIRA

Développer une **plateforme web accessible**, pilotée par une **IA vocale**, permettant :

- une **navigation 100 % mains libres**
- une **interaction simple, naturelle et sécurisée**
- une **autonomie totale de l’utilisateur**

---

## 👥 Équipe

**Nom de l’équipe :** HackPack  

**Membres :**
- Aya Ben Fraj  
- Nour Badreddine  
- Amira Ouechtati  

---

## 🚀 Fonctionnalités principales

### 🎤 1. Assistant vocal intelligent (MVP)
- Compréhension du langage naturel (NLP)
- Commandes vocales simples
- Dialogue guidé étape par étape

---

### 🏦 2. Module Bancaire (Simulation)
- Consultation du solde par la voix
- Paiement avec **confirmation vocale**
- Feedback audio clair après chaque action  

⚠️ *Les transactions sont simulées dans le cadre du hackathon.*

---

### 🛒 3. Module Courses
- Création et gestion d’une liste de courses
- Ajout / suppression d’articles par la voix
- Calcul automatique du total
- Lecture vocale des prix

---

## 🗣️ Exemples de commandes vocales

### Navigation
| Français | العربية | Action |
|--------|--------|-------|
| banque | بنك | Accéder au module bancaire |
| courses | تسوق | Liste de courses |
| accueil | رئيسية | Retour accueil |
| répéter | كرر | Répéter le message |

### Paiement (simulation)
- “payer” / “pay” / “نخلّص”
- “oui” / “نعم” pour confirmer

---

## ♿ Accessibilité (Priorité du projet)

BASIRA est conçue selon les normes :

- ✅ **WCAG 2.1 – niveau AA**
- ✅ Compatibilité lecteurs d’écran :
  - NVDA
  - JAWS
  - VoiceOver
- ✅ Navigation clavier complète
- ✅ Mode contraste élevé
- ✅ Zones ARIA et annonces vocales dynamiques

---

## 🛠️ Technologies utilisées
- React 18
- TypeScript
- Vite
- Tailwind CSS
- Web Speech API
- Speech Synthesis API
- Python
- FastAPI


---

## 📁 Project Structure
```
BASIRA/
│
├── backend/                      # Backend FastAPI
│   ├── main.py                   # Point d’entrée de l’API
│   ├── database.py               # Configuration base de données (locale)
│   ├── requirements.txt          # Dépendances Python
│   ├── routes/                   # Endpoints API
│   │   ├── banking.py             # Logique bancaire (simulation)
│   │   ├── shopping.py            # Gestion des courses
│   │   └── voice.py               # Traitement commandes vocales
│   ├── services/                 # Logique métier
│   │   ├── payment_service.py     # Paiement (simulation)
│   │   └── speech_service.py      # Interaction vocale
│   └── models/                   # Modèles de données
│
├── frontend/                     # Application web accessible
│   ├── public/                   # Assets publics
│   │   └── logo-basira.png        # Logo du projet
│   ├── src/
│   │   ├── app/
│   │   │   └── App.tsx            # Composant principal
│   │   ├── components/            # Composants UI accessibles
│   │   │   ├── BankingAssistant.tsx
│   │   │   ├── ShoppingListAssistant.tsx
│   │   │   └── VoiceControls.tsx
│   │   ├── hooks/                 # Hooks personnalisés
│   │   │   ├── useVoiceRecognition.ts
│   │   │   └── useTextToSpeech.ts
│   │   ├── services/              # Communication avec le backend
│   │   │   └── paymentService.ts
│   │   └── styles/                # Styles et accessibilité
│   ├── index.html
│   ├── package.json
│   └── vite.config.ts
│
├── ACCESSIBILITY.md               # Documentation accessibilité
├── README.md                      # Documentation principale
├── .gitignore
└── package-lock.json
```




### ✨ Caractéristiques principales

- 🎤 **Interface vocale prioritaire** - Navigation complète par commande vocale
- 👓 **Compatible lecteurs d'écran** - NVDA, JAWS, VoiceOver, TalkBack
- 🌐 **Bilingue FR/AR** - Français et Arabe (Tunisie) avec RTL
- 🎨 **Mode contraste élevé** - Ratio 21:1 pour WCAG AAA
- ⌨️ **Navigation clavier complète** - Raccourcis accessibles
- 📱 **PWA** - Installation et mode hors ligne
- 🔊 **Synthèse vocale** - Retour audio pour toutes les actions
- ✅ **WCAG 2.1 AA** - Conforme aux normes d'accessibilité

---

## 🏦 Modules

### 1. Assistant Bancaire
- Consultation du solde
- Virements avec confirmation vocale
- Dialogue étape par étape

### 2. Liste de Courses Intelligente
- Ajout d'articles par voix
- Calcul automatique des prix
- Total en temps réel

---

## 🎯 Commandes Vocales

### Navigation
| Français | العربية | Action |
|----------|---------|--------|
| "banque" | "بنك" | Module bancaire |
| "courses" | "تسوق" | Liste de courses |
| "accueil" | "رئيسية" | Retour accueil |
| "répéter" | "كرر" | Répéter message |

### Banque
| Français | العربية | Action |
|----------|---------|--------|
| "solde" | "رصيد" | Consulter solde |
| "virement" | "تحويل" | Faire un virement |
| "oui" / "non" | "نعم" / "لا" | Confirmer/Annuler |

### Courses
| Français | العربية | Action |
|----------|---------|--------|
| "ajouter [article]" | "إضافة [عنصر]" | Ajouter article |
| "retirer [article]" | "إزالة [عنصر]" | Retirer article |
| "total" | "مجموع" | Lire total |

---

## ⌨️ Raccourcis Clavier

- **Espace** ou **Entrée** : Activer/Désactiver le microphone
- **Échap** : Retour à l'accueil
- **R** : Répéter le dernier message
- **Tab** / **Shift+Tab** : Navigation

---

## 🚀 Installation

### Prérequis
- Node.js 18+
- npm ou pnpm

### Démarrage

```bash
# Installer les dépendances
npm install
# ou
pnpm install

# Lancer en développement
npm run dev
# ou
pnpm dev

# Build pour production
npm run build
# ou
pnpm build
```
## ▶️ Utilisation

1. Autoriser l’accès au microphone au premier lancement.
2. Cliquer sur le bouton microphone ou appuyer sur **Espace**.
3. Prononcer une commande vocale (ex : “banque”, “courses”).
4. Suivre les instructions vocales de l’assistant.

### Installation en tant que PWA

1. Ouvrir l'application dans Chrome, Edge ou Safari
2. Cliquer sur "Installer" dans la barre d'adresse
3. L'application sera disponible hors ligne

---

## ♿ Accessibilité

### Conformité
- ✅ WCAG 2.1 Level AA
- ✅ Section 508
- ✅ EN 301 549
- ✅ ARIA 1.2

### Testée avec
- NVDA 2024+
- JAWS 2024+
- VoiceOver (macOS/iOS)
- Chrome DevTools Lighthouse (Score: 100)
- axe DevTools
- WAVE Browser Extension

### Fonctionnalités d'accessibilité
- Labels ARIA complets
- Live regions pour annonces dynamiques
- Régions sémantiques (banner, main, navigation, contentinfo)
- Focus visible sur tous les éléments
- Ordre de tabulation logique
- Zones tactiles 44x44px minimum
- Typographie 18px minimum
- Contraste 21:1 en mode haute contraste

---

## 📱 PWA Features

- ✅ Manifeste web
- ✅ Service Worker
- ✅ Mode hors ligne
- ✅ Icônes adaptatives
- ✅ Installation sur appareil
- ✅ Raccourcis d'application

---

## 🌍 Contexte Tunisien

L'application est adaptée au contexte tunisien :
- Monnaie en Dinars Tunisiens (TND / د.ت)
- Articles de supermarché locaux
- Support français et arabe dialectal
- Interface culturellement appropriée

---

## 🔒 Confidentialité

- ❌ Aucune collecte de données
- ✅ Fonctionnement 100% local
- ✅ Aucun serveur externe
- ✅ localStorage uniquement
- ⚠️ **Application de démonstration** - Ne pas utiliser pour de vraies transactions

---

## 📚 Documentation

Consultez [ACCESSIBILITY.md](./ACCESSIBILITY.md) pour le guide complet d'accessibilité en français et arabe.

---

## 🤝 Contribution

Les contributions sont les bienvenues ! Veuillez vous assurer que :
- Le code respecte WCAG 2.1 AA
- Tous les éléments ont des labels ARIA
- Les tests d'accessibilité passent
- La navigation clavier fonctionne

---
## 🚧 Statut du projet

Ce projet a été développé en 48h dans le cadre du Hackathon MaraTech 2026.
Il s’agit d’un prototype fonctionnel (MVP) destiné à démontrer la faisabilité
et l’impact de la solution.

## 📄 Licence

MIT License - Libre d'utilisation et de modification

---

## 🙏 Remerciements

Développé avec ❤️ pour l'accessibilité universelle et l'inclusion numérique.

**Fait pour les utilisateurs malvoyants, les seniors, et tous ceux qui bénéficient d'une meilleure accessibilité.**

---

## 🐛 Problèmes connus

1. **Reconnaissance vocale** : Nécessite Chrome, Edge ou Safari (Web Speech API)
2. **Arabe dialectal** : La reconnaissance peut varier selon le système
3. **Première visite** : Connexion Internet requise (PWA ensuite hors ligne)
4. **Autorisations** : Le microphone doit être autorisé

---

## 📞 Support

Pour toute question ou problème d'accessibilité, veuillez ouvrir une issue GitHub.

---

**Made accessible for everyone. صُنع ليكون متاحًا للجميع.**
#MaraTechEsprit2026
