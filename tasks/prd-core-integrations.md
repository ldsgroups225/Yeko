# PRD - Intégrations des Services Noyaux (Core)

## 1. Introduction/Overview

Ce document définit les exigences pour la transition des fonctionnalités critiques des applications **Teacher** et **School** de leurs versions simulées (mocks) vers des intégrations réelles. L'objectif est de stabiliser les flux de données essentiels (sessions de cours, notes, stockage) tout en assurant une expérience utilisateur fluide grâce à une synchronisation intelligente.

## 2. Goals

- Remplacer les soumissions fictives de sessions par des appels API réels.
- Implémenter un système de synchronisation automatique et résilient.
- Activer une gestion sécurisée et auditée du stockage cloud (R2).
- Mettre en place l'infrastructure d'envoi d'emails (Resend + React Email).

## 3. User Stories

- **En tant qu'enseignant**, je veux que mes sessions de cours et mes notes soient enregistrées sur le serveur automatiquement dès que je retrouve une connexion internet. (Non ! c'est au professeur li meme de publier ses notes et non pas par une synchronisation)
- **En tant qu'administrateur**, je veux que les fichiers supprimés soient marqués pour suppression (soft-delete) afin de pouvoir les récupérer en cas d'erreur, tout en gardant une trace de qui a effectué l'action.
- **En tant qu'utilisateur**, je veux recevoir des emails clairs (ex: réinitialisation de mot de passe) envoyés via un service fiable.

## 4. Functional Requirements

### 4.1. Sessions et Notes (Teacher App)

1. Le système doit appeler la fonction serveur `completeSession` lors de la validation du formulaire de fin de cours dans `class.$classId.tsx`.
2. Les statistiques de classe (moyennes, etc.) doivent être récupérées depuis le serveur via `getClassStats` au lieu d'utiliser des données statiques.
3. Les erreurs de soumission d'API doivent être notifiées à l'utilisateur via des "Toasts" explicatifs (ex: Sonner).

### 4.2. Synchronisation Automatique (`useSync`)

1. Le hook `useAutoSync` doit écouter l'événement navigateur `online` pour déclencher immédiatement une tentative de synchronisation des données en attente.
2. Une tâche de fond doit tenter une synchronisation à intervalles réguliers (ex: toutes les 5 minutes) si des éléments sont en attente.
3. La synchronisation doit être "silencieuse" (background) pour ne pas bloquer l'interface utilisateur.

### 4.3. Stockage et Soft-Delete (School App)

1. La fonction `deletePhoto` dans `storage.ts` doit implémenter un "Soft-Delete" : marquer l'entrée comme supprimée en base de données.
2. L'action de suppression doit être auditée (log de l'utilisateur et de l'horodatage).
3. L'appel réel de suppression physique sur Cloudflare R2 doit être planifié via le client `getR2Client`.

### 4.4. Communication (Emailing)

1. Intégrer **Resend** comme fournisseur d'envoi d'emails.
2. Utiliser **React Email** pour la création de templates d'emails typés et maintenables.
3. **Comportement Dev** : En mode développement, les emails ne doivent pas être envoyés mais loggués de manière détaillée dans la console.

## 5. Non-Goals (Out of Scope)

- Création réelle des comptes d'authentification dans `users.ts:109` (reporté).
- Refonte de l'interface utilisateur (UI/UX).
- Mise en place de webhooks complexes pour la synchronisation.

## 6. Technical Considerations

- **Architecture** : Utiliser les `createServerFn` de TanStack Start pour les appels API.
- **Offline-first** : S'appuyer sur la file d'attente PGlite existante pour le stockage local avant la synchronisation.
- **Emails** : Configurer la clé API Resend via les variables d'environnement (`RESEND_API_KEY`).

## 7. Success Metrics

- 100% des sessions de cours soumises avec succès au serveur (en ligne).
- Zéro perte de données lors du passage hors-ligne -> en-ligne constaté lors des tests.
- Temps de réponse des suppressions (soft-delete) inférieur à 200ms pour l'utilisateur.

## 8. Open Questions

- Quel est le délai de rétention souhaité pour les fichiers en "soft-delete" sur R2 avant suppression physique définitive ?
