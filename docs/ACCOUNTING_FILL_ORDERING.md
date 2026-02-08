# ACCOUNTING_FILL_ORDERING

## 1. **Configuration initiale (Début de l’année scolaire)**

Cette phase permet de préparer le système comptable pour la nouvelle année. L'ordre des étapes est crucial pour respecter les dépendances de la base de données.

### a. **Étape 0 : Pré-requis (Structure Académique)**

* **Table : `schoolYears`**
* **Dépendances :** `schools`, `schoolYearTemplates`
* **Qui remplit ?** L’administrateur lors de l'ouverture de l'année scolaire.
* **Pourquoi ?** Base temporelle indispensable. Toutes les données financières (frais, paiements, budgets) sont rattachées à une année scolaire active.

### b. **Étape 1 : Configuration des Comptes (Chart of Accounts)**

* **Table : `accounts`**
* **Dépendances :** `schools`
* **Qui remplit ?** L’administrateur ou le comptable.
* **Pourquoi ?** C’est la base de toute la comptabilité (Plan Comptable). On définit les comptes d'actifs, de passifs, de revenus (ex: `701 - Frais de Scolarité`) et de créances (ex: `411 - Élèves`).
* **Note :** Certains comptes "Système" peuvent être pré-remplis automatiquement.

### c. **Étape 2 : Configuration des Années Fiscales**

* **Table : `fiscalYears`**
* **Dépendances :** `schools`, `schoolYears`
* **Qui remplit ?** Le comptable ou l’administrateur.
* **Pourquoi ?** Définit la période comptable pour le reporting (souvent alignée sur l'année scolaire, mais pas toujours). Toutes les transactions seront liées à une année fiscale.

### d. **Étape 3 : Définition des Types de Frais**

* **Table : `feeTypes`**
* **Dépendances :** `schools`, `accounts` (Recette et Créance), `feeTypeTemplates` (optionnel)
* **Qui remplit ?** L’administrateur ou le responsable financier.
* **Pourquoi ?** Catégoriser les frais (Scolarité, Cantine, Transport).
* **Important :** Chaque type de frais doit être lié à un compte de revenus (`revenueAccountId`) et un compte de créances (`receivableAccountId`) pour automatiser les écritures comptables.

### e. **Étape 4 : Définition des Structures de Frais (Tarifs)**

* **Table : `feeStructures`**
* **Dépendances :** `schools`, `schoolYears`, `feeTypes`, `grades`, `series` (optionnel)
* **Qui remplit ?** L’administrateur.
* **Pourquoi ?** Fixer les montants pour chaque niveau/série (Ex: 50.000 FCFA pour la 6ème en Scolarité). C'est ici qu'on définit le lien entre la structure scolaire et financière.

### f. **Étape 5 : Définition des Réductions (Politiques)**

* **Table : `discounts`**
* **Dépendances :** `schools`
* **Qui remplit ?** L’administrateur.
* **Pourquoi ?** Créer les règles de réduction (Fratrie, Boursier, Enfant du personnel) et leurs types de calcul (Pourcentage ou Montant fixe).

### g. **Étape 6 : Modèles de Plans de Paiement**

* **Table : `paymentPlanTemplates`**
* **Dépendances :** `schools`, `schoolYears`
* **Qui remplit ?** Le comptable.
* **Pourquoi ?** Définir les échéanciers standards (ex: "3 tranches", "Mensuel"). Cela servira de modèle pour générer automatiquement les plans de paiement des élèves.

---

## 2. **Utilisation quotidienne (Flux opérationnel)**

### a. **Étape 7 : Inscription et Génération des Frais**

* **Tables :** `enrollments` -> déclenche création de `studentFees`
* **Dépendances :** `students`, `classes`, `schoolYears`, `feeStructures`
* **Qui remplit ?** Personnel administratif (Inscription).
* **Automatisme :** À l'inscription, le système cherche les `feeStructures` correspondant à la classe/niveau de l'élève et génère les lignes de `studentFees` (ex: montant total de la scolarité due).

### b. **Étape 8 : Attribution des Plans de Paiement**

* **Tables :** `paymentPlans` et `installments`
* **Dépendances :** `students`, `schoolYears`, `paymentPlanTemplates`
* **Qui remplit ?** Comptable ou Admin (Automatique ou Manuel).
* **Action :** On associe un élève à un modèle de paiement (ex: "3 tranches").
* **Résultat :** Le système crée un enregistrement `paymentPlan` unique pour l'élève et génère les `installments` (échéances individuelles) avec les dates et montants dus.

### c. **Étape 9 : Application des Réductions (Cas par cas)**

* **Table : `studentDiscounts`**
* **Dépendances :** `students`, `discounts`, `schoolYears`
* **Qui remplit ?** Admin.
* **Action :** Associer une réduction spécifique à un élève. Cela mettra à jour le solde restant dans `studentFees`.

### d. **Étape 10 : Encaissement (Paiements)**

* **Table : `payments`**
* **Dépendances :** `students`, `paymentPlans` (optionnel), `schools`
* **Qui remplit ?** Caissier / Comptable.
* **Action :** Enregistrer un versement.
* **Automatisme (CRITIQUE) :**
    1. Création de **`paymentAllocations`** : Le paiement est automatiquement réparti (lettré) sur les `installments` (les plus anciens d'abord) et les `studentFees`.
    2. Génération de **`receipts`** : Un reçu officiel est généré pour le parent.
    3. Génération de **`transactions`** : Les écritures comptables (Débit Caisse / Crédit Élève) sont passées automatiquement.

---

## 3. **Vue d'ensemble des Automatismes (Back-end)**

L'architecture est conçue pour minimiser la saisie manuelle comptable. Voici la cascade d'événements :

* **Action : Inscription (`enrollments`)**
  * Effet : Création `studentFees` (Dette initiale de l'élève)

* **Action : Choix Plan Paiement**
  * Effet : Création `paymentPlans` (Plan élève) + `installments` (Échéances)

* **Action : Paiement (`payments`)**
  * Effet : Création `receipts` (Preuve)
  * Effet : Création `paymentAllocations` (Lettrage automatique)
  * Effet : Création `transactions` + `transactionLines` (Écritures comptables)

* **Action : Annulation Paiement**
  * Effet : Annulation `receipts`
  * Effet : Annulation `paymentAllocations` (Contre-passation)
  * Effet : Création `transactions` d'annulation (Contre-passation)

## 4. **Comptabilité Générale (`transactions`)**

Le journal comptable est alimenté de deux façons :

### a. **Automatique (Opérationnel)**

La majorité des écritures proviennent des opérations de scolarité :

* **Facturation (Optionnel/Avancé)** : Débit Compte Tiers (Élève) / Crédit Compte Produit (Scolarité) - *Au moment de l'inscription ou de la facturation.*
* **Encaissement** : Débit Compte Trésorerie (Caisse/Banque) / Crédit Compte Tiers (Élève).

### b. **Manuel (Ajustements)**

* **Tables : `transactions` et `transactionLines`**
* **Qui ?** Le comptable.
* **Quoi ?** Opérations diverses (OD), régularisations, saisie des charges (achat de matériel, factures fournisseurs), paiement des salaires, amortissements.
* **Contrôle :** Le système doit empêcher la suppression directe de transactions validées ("posted") provenant du module automatique.

---

## 5. **Status de l'implémentation (Apps/School)**

Dernière analyse : 2026-02-07

### ✅ Implémenté et Disponible

Ces modules sont présents dans le code et accessibles via la barre latérale.

* **Étape 3 : Types de Frais** (`/accounting/fee-types`)
* **Étape 4 : Structures de Frais** (`/accounting/fee-structures`)
* **Étape 7 : Frais des Élèves** (`/accounting/student-fees`) - *Vue de suivi seulement*
* **Étape 8 : Plans de Paiement (Élèves)** (`/accounting/payment-plans`) - *Gestion des plans assignés*
* **Étape 10 : Paiements** (`/accounting/payments`)

### ⚠️ Implémenté mais Non Accessible (Sidebar manquante)

Ces modules existent techniquement (`routes/...`) mais ne sont pas liés dans le menu de navigation.

* **Étape 1 : Objets Comptes** (`/accounting/accounts`) -> *Critique : Impossible de configurer les comptes sans lien direct.*
* **Étape 5 : Réductions** (`/accounting/discounts`)

### ❌ Manquant (À développer)

Ces modules n'ont pas été trouvés dans le code source scanné.

* **Étape 2 : Années Fiscales** (`fiscalYears`) -> *Aucune route ou interface trouvée.*
* **Étape 6 : Modèles de Plans de Paiement** (`paymentPlanTemplates`) -> *L'interface actuelle `/accounting/payment-plans` gère les instances élèves, pas les modèles de configuration (ex: "Mensuel", "Trimestriel").*

### 🔄 Flux & UX

* **Pas de Wizard de Configuration :** L'utilisateur doit naviguer manuellement entre les pages pour configurer l'ordre (Comptes -> Frais -> Tarifs).
* **Risque de blocage :** Sans accès facile aux `Comptes` (Step 1), la création de `Types de Frais` (Step 3) risque d'échouer ou d'être incohérente si les comptes liés n'existent pas.

---

## 6. **Équipe d'Agents Suggérée (Synchro/Peer)**

Pour implémenter correctement ce flux complexe et combler les manques identifiés, voici les 5 sous-agents spécialisés recommandés (basés sur `.claude/agents`) :

1. **Product Manager** (`08-business-product/product-manager.md`)
   * **Rôle :** Chef d'orchestre du flux utilisateur.
   * **Tâche :** Concevoir le "Wizard de Configuration Comptable" qui guide l'utilisateur étape par étape (1 à 6) sans possibilité d'erreur. Définir les règles de validation métier pour chaque écran.

2. **Fintech Engineer** (`07-specialized-domains/fintech-engineer.md`)
   * **Rôle :** Expert Domaine.
   * **Tâche :** Valider la logique comptable (Double-entrée, cohérence des Comptes vs Types de Frais). S'assurer que le modèle de données respecte les normes comptables (ex: immuabilité des transactions validées).

3. **Backend Developer** (`01-core-development/backend-developer.md`)
   * **Rôle :** Architecte API & Data.
   * **Tâche :** Implémenter les verrous API (empêcher la création de Frais si Compte inexistant). Créer les endpoints manquants pour `fiscalYears` et `paymentPlanTemplates`. Gérer les triggers de base de données pour l'intégrité référentielle.

4. **Frontend Developer** (`01-core-development/frontend-developer.md`)
   * **Rôle :** Intégrateur UI.
   * **Tâche :** Ajouter les entrées manquantes dans la Sidebar (`/accounting/accounts`, `/discounts`). Créer les formulaires React manquants et intégrer le Wizard conçu par le Product Manager.

5. **Test Automator** (`04-quality-security/test-automator.md`)
   * **Rôle :** Gardien de la Qualité.
   * **Tâche :** Écrire des tests E2E (Playwright) qui tentent de briser l'ordre de remplissage (ex: créer un élève sans année scolaire, payer sans plan). Valider que le "Fill Ordering" est techniquement impossible à contourner.
