# Core Integrations Tasks

## Relevant Files

- `apps/teacher/src/routes/_auth/app/schools.$schoolId.class.$classId.tsx` - Interface utilisateur principale pour la soumission des sessions et l'affichage des statistiques.
- `apps/teacher/src/teacher/functions/sessions.ts` - Fonctions serveur pour la finalisation des sessions.
- `apps/teacher/src/hooks/useSync.ts` - Hook gérant la logique d'auto-synchronisation.
- `apps/teacher/src/lib/services/sync-service.ts` - Service de synchronisation traitant les opérations CRUD locales vers le distant.
- `apps/school/src/school/functions/storage.ts` - Logique de suppression des fichiers (Soft-Delete) et intégration R2.
- `apps/school/src/server.ts` - Point d'entrée pour la configuration de l'infrastructure d'emailing (Resend).

### Notes

- Les tests unitaires doivent être placés à côté des fichiers de code (ex: `my-file.test.ts`).
- Utilisez `pnpm test` pour exécuter la suite de tests ou `npx vitest` pour un fichier spécifique.
- Assurez-vous que les variables d'environnement (`RESEND_API_KEY`, etc.) sont configurées localement.

## Instructions for Completing Tasks

**IMPORTANT:** Au fur et à mesure que vous complétez chaque tâche, vous devez la cocher dans ce fichier markdown en changeant `- [ ]` en `- [x]`.

## Tasks

- [x] 0.0 Create feature branch
  - [x] 0.1 Créer et basculer sur une nouvelle branche `feature/core-integrations` (`git checkout -b feature/core-integrations`)
- [x] 1.0 Intégration des Sessions et Statistiques (Teacher App)
  - [x] 1.1 Remplacer la soumission fictive par un appel réel à `completeSession` dans `class.$classId.tsx`.
  - [x] 1.2 Mettre à jour le mémo `classStats` pour consommer les données de `classStatsQueryOptions`.
  - [x] 1.3 Gérer les états de chargement (`isSubmitting`) et les notifications de succès/erreur via des Toasts.
- [x] 2.0 Automatisation de la Synchronisation (Sync System)
  - [x] 2.1 Implémenter un déclencheur basé sur un intervalle (ex: 5 min) dans `useAutoSync` pour appeler `processSyncQueue`.
  - [x] 2.2 Ajouter un écouteur sur l'événement `online` du navigateur pour déclencher une sync immédiate.
  - [x] 2.3 Mettre à jour `syncService.processSyncItem` pour supporter l'opération `delete` sur les notes et détails.
- [x] 3.0 Mise en œuvre du Soft-Delete et Audit (Storage System)
  - [x] 3.1 Modifier `deletePhoto` dans `storage.ts` pour marquer l'enregistrement comme "supprimé" en DB au lieu de supprimer immédiatement.
  - [x] 3.2 Ajouter la capture des données d'audit (qui a supprimé et quand).
  - [x] 3.3 Implémenter l'appel de suppression physique vers Cloudflare R2 via le client `getR2Client`.
- [x] 4.0 Configuration de l'Infrastructure d'Emailing (Resend + React Email)
  - [x] 4.1 Configurer le client Resend avec les variables d'environnement.
  - [x] 4.2 Créer un template de base avec React Email pour tester l'infrastructure.
  - [x] 4.3 Implémenter la logique de condition : envoyer via Resend en production, logguer dans la console en développement.
- [x] 5.0 Tests d'Intégration et Validation Finale
  - [x] 5.1 Exécuter les tests d'intégration existants pour les fonctions serveur du teacher (`server-functions.test.ts`).
  - [x] 5.2 Vérifier manuellement le passage du mode hors-ligne à en-ligne et la synchronisation automatique associée.
  - [x] 5.3 Valider que les emails apparaissent correctement dans la console en mode dev.
