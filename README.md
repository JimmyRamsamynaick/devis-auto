# 🚀 Auto Devis - Solution de Gestion de Facturation Moderne

![Auto Devis Banner](https://via.placeholder.com/1200x400?text=Auto+Devis+Dashboard)

**Auto Devis** est une application web complète et performante conçue pour simplifier la gestion des devis, factures et clients pour les freelances et PME. Développée avec les dernières technologies web, elle offre une expérience utilisateur fluide, rapide et intuitive.

---

## ✨ Fonctionnalités Clés

### 📊 Tableau de Bord Intelligent
- **Vue d'ensemble** : Suivez votre chiffre d'affaires, le nombre de devis et factures en un coup d'œil.
- **Statistiques** : Indicateurs clés de performance en temps réel.

### 📝 Gestion des Devis (Quotes)
- **Création Intuitive** : Éditeur de devis simple et puissant.
- **Génération PDF** : Exportez vos devis en PDF professionnels instantanément.
- **Envoi par Email** : Envoyez vos devis directement depuis l'application.
- **Vue Client** : Lien public sécurisé permettant à vos clients d'accepter ou refuser le devis en ligne.
- **Conversion** : Transformez un devis validé en facture en un clic.

### 💰 Facturation (Invoices)
- **Suivi des Paiements** : Gérez les statuts de vos factures (Payée, En attente, En retard).
- **Génération PDF** : Documents conformes et professionnels.
- **Automatisation** : Création automatique depuis les devis.

### 📦 Bons de Commande (Purchase Orders)
- **Gestion des Commandes** : Créez et suivez vos bons de commande fournisseurs ou clients.
- **PDF & Email** : Génération et envoi simplifiés.

### 👥 Gestion Clients (CRM)
- **Base de Données** : Centralisez toutes les informations de vos clients.
- **Historique** : Accédez rapidement à tous les documents liés à un client.

### 🛠️ Catalogue de Services
- **Bibliothèque** : Enregistrez vos prestations et produits récurrents pour accélérer la création de documents.

---

## 🛠️ Stack Technique

Ce projet est propulsé par une architecture moderne et robuste :

- **Framework** : [Next.js 15+](https://nextjs.org/) (App Router) - Performance et SEO optimisés.
- **Langage** : [TypeScript](https://www.typescriptlang.org/) - Code sécurisé et maintenable.
- **Base de Données** : [MongoDB](https://www.mongodb.com/) via [Prisma ORM](https://www.prisma.io/) - Flexibilité et puissance.
- **Styling** : [Tailwind CSS](https://tailwindcss.com/) - Design moderne et responsive.
- **Authentification** : [NextAuth.js](https://next-auth.js.org/) - Sécurisation des accès.
- **PDF** : [React-PDF](https://react-pdf.org/) - Génération de documents haute fidélité.
- **Emails** : [Nodemailer](https://nodemailer.com/) - Service d'envoi fiable.

---

## 🚀 Installation & Démarrage

### Prérequis
- Node.js 18+
- MongoDB Database (URL de connexion)

### Installation

1. **Cloner le dépôt**
   ```bash
   git clone https://github.com/votre-username/auto-devis.git
   cd auto-devis
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Configuration**
   Renommez `.env.example` en `.env` et configurez vos variables :
   ```env
   DATABASE_URL="votre_mongodb_url"
   NEXTAUTH_SECRET="votre_secret_super_securise"
   NEXTAUTH_URL="http://localhost:3000"
   SMTP_HOST="smtp.example.com"
   SMTP_USER="user@example.com"
   SMTP_PASS="password"
   ```

4. **Démarrer en développement**
   ```bash
   npm run dev
   ```
   L'application sera accessible sur `http://localhost:3000`.

---

## 🌐 Déploiement (VPS)

L'application est optimisée pour un déploiement sur VPS (Ubuntu/Debian) avec **PM2** et **Nginx**.

### Étapes rapides :
1. **Build de l'application** : `npm run build`
2. **Lancement avec PM2** :
   ```bash
   pm2 start npm --name "auto-devis" -- start -- -p 3210
   ```
3. **Configuration Nginx** (Reverse Proxy) :
   Redirigez le trafic du port 80/443 vers le port `3210` local.

---

## 🔒 Sécurité & Performance

- **Authentification forte** : Protection des routes sensibles.
- **Optimisation** : Utilisation de `force-dynamic` pour des données toujours à jour.
- **Cache Control** : Gestion fine du cache pour éviter les données obsolètes.

---

## 📄 Licence

Distribué sous la licence MIT. Voir `LICENSE` pour plus d'informations.

---

*Développé avec ❤️ pour simplifier votre business.*
