# 🎙️ Assistant Vocal Accessible - المساعد الصوتي الشامل

**Une Progressive Web App (PWA) inclusive et accessible pour les personnes malvoyantes et seniors**

---

## 🌟 Vue d'ensemble

Cette application est conçue pour être utilisable **entièrement par la voix** et compatible avec tous les principaux lecteurs d'écran (NVDA, JAWS, VoiceOver). Elle offre une interface accessible WCAG 2.1 AA avec support complet du français et de l'arabe.

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

### Installation en tant que PWA

1. Ouvrir l'application dans Chrome, Edge ou Safari
2. Cliquer sur "Installer" dans la barre d'adresse
3. L'application sera disponible hors ligne

---

## 🛠️ Technologies

- **React 18** - Framework UI
- **TypeScript** - Type safety
- **Tailwind CSS v4** - Styling
- **Web Speech API** - Reconnaissance vocale
- **Speech Synthesis API** - Synthèse vocale
- **Vite** - Build tool
- **Lucide Icons** - Iconographie accessible

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
