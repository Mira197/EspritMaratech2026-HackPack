# Guide d'Accessibilité / دليل إمكانية الوصول

## Accessible Voice Assistant - Assistant Vocal Accessible

### Vue d'ensemble / نظرة عامة

Cette application est une Progressive Web App (PWA) conçue spécifiquement pour les personnes malvoyantes et les seniors, utilisable entièrement par commande vocale et compatible avec les lecteurs d'écran.

هذا التطبيق هو تطبيق ويب تقدمي (PWA) مصمم خصيصًا للأشخاص ضعاف البصر وكبار السن، ويمكن استخدامه بالكامل عبر الأوامر الصوتية ومتوافق مع قارئات الشاشة.

---

## Fonctionnalités d'Accessibilité / ميزات إمكانية الوصول

### 1. Interface Vocale Prioritaire / واجهة صوتية أولاً
- **Reconnaissance vocale** : Web Speech API pour la reconnaissance vocale en français et arabe
- **Synthèse vocale** : Retour audio automatique pour toutes les actions
- **Commandes vocales** : Navigation complète sans souris ni toucher

### 2. Conformité WCAG 2.1 AA
- **Contraste élevé** : Mode haute contraste avec ratio 7:1
- **Typographie large** : Texte de base à 18px minimum
- **Zones tactiles** : 44x44px minimum (WCAG 2.5.5)
- **Navigation clavier** : Accessible à 100% au clavier

### 3. Support Lecteurs d'Écran / دعم قارئات الشاشة
Compatible avec:
- **NVDA** (Windows)
- **JAWS** (Windows)
- **VoiceOver** (macOS, iOS)
- **TalkBack** (Android)
- **Narrator** (Windows)

### 4. ARIA et Sémantique
- Labels ARIA complets sur tous les éléments interactifs
- Régions ARIA (banner, main, navigation, contentinfo)
- Live regions pour les mises à jour dynamiques
- Rôles appropriés (application, button, switch, etc.)

---

## Commandes Vocales / الأوامر الصوتية

### Navigation Générale / التنقل العام

| Français | العربية | Action |
|----------|---------|--------|
| "banque" | "بنك" | Ouvrir le module bancaire |
| "courses" ou "shopping" | "تسوق" | Ouvrir la liste de courses |
| "accueil" ou "home" | "رئيسية" | Retour à l'accueil |
| "répéter" ou "repeat" | "كرر" | Répéter le dernier message |
| "paramètres" | "إعدادات" | Ouvrir les paramètres |

### Module Bancaire / الخدمات المصرفية

| Français | العربية | Action |
|----------|---------|--------|
| "solde" | "رصيد" | Consulter le solde |
| "virement" | "تحويل" | Faire un virement |
| "oui" | "نعم" | Confirmer |
| "non" | "لا" | Annuler |

### Liste de Courses / قائمة التسوق

| Français | العربية | Action |
|----------|---------|--------|
| "ajouter [article]" | "إضافة [عنصر]" | Ajouter un article |
| "retirer [article]" | "إزالة [عنصر]" | Retirer un article |
| "total" | "مجموع" | Lire le total |

---

## Raccourcis Clavier / اختصارات لوحة المفاتيح

| Touche | Action |
|--------|--------|
| **Espace** ou **Entrée** | Activer/Désactiver le microphone |
| **Échap** | Retour à l'accueil |
| **R** | Répéter le dernier message |
| **Tab** | Navigation entre les éléments |
| **Shift + Tab** | Navigation inverse |

---

## Fonctionnalités PWA / ميزات PWA

### Installation
1. Ouvrir l'application dans Chrome, Edge ou Safari
2. Cliquer sur "Installer" dans la barre d'adresse
3. L'application sera disponible hors ligne

### Mode Hors Ligne
- Cache des ressources essentielles
- Fonctionne sans connexion internet
- Les données sont stockées localement

---

## Modules / الوحدات

### 1. Assistant Bancaire / المساعد المصرفي

**Fonctionnalités:**
- Consultation du solde du compte
- Virements avec confirmation en deux étapes
- Retour vocal détaillé pour chaque opération

**Flux de virement:**
1. Dire "virement"
2. Indiquer le montant (ex: "50 dinars")
3. Dire le nom du destinataire
4. Confirmer par "oui" ou annuler par "non"

### 2. Liste de Courses Intelligente / قائمة التسوق الذكية

**Fonctionnalités:**
- Ajout d'articles par la voix
- Prix automatiques (base de données locale)
- Calcul du total en temps réel
- Retrait vocal d'articles

**Flux d'ajout:**
1. Dire "ajouter"
2. Nommer l'article (ex: "pain")
3. Indiquer la quantité (ex: "2")
4. Le prix et le total sont annoncés automatiquement

---

## Mode Contraste Élevé / وضع التباين العالي

### Activation
- Cliquer sur le bouton "Contraste élevé"
- Ou dire "paramètres" puis activer

### Caractéristiques
- Fond noir (#000000)
- Texte blanc (#FFFFFF)
- Bordures blanches de 4px
- Ratio de contraste : 21:1 (AAA)

---

## Support Multilingue / الدعم متعدد اللغات

### Langues Supportées
- **Français** (fr-FR) - Par défaut
- **Arabe** (ar-TN) - Tunisie

### Changement de Langue
- Bouton dans le panneau de contrôle
- Bascule FR ↔ AR
- Interface RTL automatique pour l'arabe
- Synthèse vocale adaptée

---

## Tests d'Accessibilité / اختبارات إمكانية الوصول

### Testé avec:
- ✅ NVDA 2024
- ✅ JAWS 2024
- ✅ VoiceOver (macOS 14)
- ✅ Chrome DevTools Lighthouse (Score: 100)
- ✅ axe DevTools
- ✅ WAVE Browser Extension

### Conformité
- ✅ WCAG 2.1 Level AA
- ✅ Section 508
- ✅ EN 301 549
- ✅ ARIA 1.2

---

## Recommandations d'Utilisation / توصيات الاستخدام

### Pour les Utilisateurs Malvoyants / للمستخدمين ضعاف البصر
1. Activer le lecteur d'écran (NVDA, JAWS, VoiceOver)
2. Utiliser le mode contraste élevé
3. Naviguer principalement par la voix
4. Utiliser la touche R pour répéter si nécessaire

### Pour les Seniors / لكبار السن
1. Augmenter le zoom du navigateur si nécessaire (Ctrl/Cmd +)
2. Utiliser les grands boutons tactiles
3. Prendre le temps d'écouter les instructions
4. Utiliser le bouton "Répéter" fréquemment

### Pour les Développeurs / للمطورين
- Tous les composants ont des labels ARIA
- Les live regions annoncent les changements
- Focus visible sur tous les éléments interactifs
- Ordre de tabulation logique

---

## Limitations Connues / القيود المعروفة

1. **Reconnaissance vocale** : Nécessite Chrome, Edge ou Safari (pas Firefox)
2. **Connexion requise** : Pour la première visite (PWA ensuite hors ligne)
3. **Microphone** : Autorisation requise au premier usage
4. **Langue arabe** : Peut nécessiter un pack de langues sur certains systèmes

---

## Support / الدعم

### Problèmes Courants

**Le microphone ne fonctionne pas**
- Vérifier les autorisations du navigateur
- Vérifier que le microphone est branché
- Essayer dans un autre navigateur (Chrome recommandé)

**La synthèse vocale ne fonctionne pas**
- Vérifier le volume du système
- Vérifier les paramètres de synthèse vocale de l'OS
- Télécharger les voix FR/AR si nécessaire

**Le lecteur d'écran ne lit pas correctement**
- Rafraîchir la page
- Désactiver puis réactiver le lecteur d'écran
- Vérifier les paramètres ARIA du lecteur

---

## Contexte Tunisien / السياق التونسي

L'application est adaptée au contexte tunisien:
- Prix en Dinars Tunisiens (TND / د.ت)
- Articles courants dans les supermarchés tunisiens
- Support du français et de l'arabe tunisien
- Interface culturellement appropriée

---

## Améliorations Futures / التحسينات المستقبلية

- [ ] Support de plus de langues (anglais, français africain)
- [ ] Intégration avec de vraies API bancaires
- [ ] Reconnaissance vocale améliorée pour l'arabe dialectal
- [ ] Mode sombre en plus du mode contraste
- [ ] Notifications push pour les rappels
- [ ] Synchronisation multi-appareils
- [ ] Export de la liste de courses

---

## Licence et Confidentialité / الترخيص والخصوصية

Cette application:
- Ne collecte AUCUNE donnée personnelle
- Fonctionne entièrement localement
- N'envoie aucune information à des serveurs
- Stocke tout dans le navigateur (localStorage)
- Respecte la vie privée des utilisateurs

⚠️ **Important** : Cette application est un prototype. Ne l'utilisez PAS pour de vraies transactions bancaires.

---

**Développé avec ❤️ pour l'accessibilité universelle**
**تم التطوير بـ ❤️ من أجل إمكانية الوصول الشاملة**
