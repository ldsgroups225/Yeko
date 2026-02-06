# Plan de refactorisation performance requêtes (apps/core|school|teacher + packages/data-ops)

## Objectif

Améliorer la vitesse perçue et réelle des requêtes/mutations en standardisant les patterns TanStack Query, en réduisant les requêtes inutiles, et en optimisant les accès DB dans `@repo/data-ops`.

## Constat rapide (exemples observés)

1. Requêtes dérivées faites en `useQuery` séparé alors qu'elles peuvent être calculées depuis les données déjà en cache.
2. Répétition de clés ou options non centralisées pour certains écrans.
3. Mutations sans optimisme UI, ce qui ralentit la perception utilisateur.
4. `getPayments` / `getEnrollments` font un double aller-retour (data + count) à chaque page.
5. Plusieurs pages refetchent sans granularité (`invalidateQueries` sans `refetchType` ni `queryKey` précis).

## Principes directeurs

1. Centraliser toutes les queries via `queryOptions` factories.
2. Utiliser des clés de query dédiées (key factories) partout.
3. Exploiter `useMutationState` pour l’optimisme UI sans manipulation de cache complexe.
4. Limiter les `invalidateQueries` au scope exact (key + `refetchType`).
5. Réduire les doubles requêtes côté DB (fenêtre analytique ou count conditionnel).

## Plan d’actions (par zones)

### A. Standardisation TanStack Query (apps)

1. **Créer/renforcer des factories `queryOptions`** dans chaque app:
   - `apps/core/src/lib/queries/*`
   - `apps/school/src/lib/queries/*`
   - `apps/teacher/src/lib/queries/*`
2. **Remplacer les `useQuery` ad-hoc** par imports de ces factories.
3. **Normaliser `staleTime`, `gcTime`, `placeholderData`** par type d’écran (listing vs détail).
4. **Ajouter `queryKey` factories** pour éviter les invalidations globales.

### B. Optimisme UI (mutations)

1. **Attendance (teacher)**:
   - Utiliser `useMutationState` pour afficher les statuts en attente en temps réel.
   - Éviter le double `invalidateQueries` quand le payload retourne la nouvelle roster.
2. **Bulk actions (imports, batch updates)**:
   - Optimiser la perception avec affichage des éléments “pending” via `useMutationState`.
3. **Standardiser callbacks mutation v5** (signature à 4 paramètres).

### C. Éviter les requêtes dérivées inutiles

1. **Exemple attendance counts**:
   - Remplacer `useQuery` secondaire par un `select` sur la query roster.
2. **Listes paginées**:
   - `placeholderData: keepPreviousData` pour éviter les clignotements.

### D. Data-ops (DB / Drizzle)

1. **Pagination optimisée**:
   - Remplacer `count + data` par une unique requête avec `COUNT(*) OVER()` quand possible.
2. **Indexation DB (à planifier)**:
   - `enrollments.schoolYearId`, `enrollments.status`, `students.schoolId`, `payments.schoolId`, `payments.paymentDate`.
3. **Batch & bulk**:
   - Préparer les données en mémoire puis insérer en batch (déjà en place, à généraliser).
4. **Limiter les joins**:
   - Extraire seulement les colonnes nécessaires, éviter `select()` sans projection.

### E. Caching & invalidation

1. **Invalidations ciblées**:
   - Utiliser les clés exactes (pas `['schools']` global quand on peut cibler), donc créer des clés de query dédiées (key factories du genre `schoolsKeys.all` et `schoolsKeys.list()` sous forme d'enum).
2. **`refetchType: 'all'`** uniquement quand on a un vrai besoin de rafraîchir les queries inactives.
3. **Préfetch** pour transitions majeures (list → détail).

## Exemples concrets proposés

1. **Attendance (teacher)**:
   - Roster query + `select` pour counts.
   - `useMutationState` pour afficher un statut “pending” sans attendre la réponse serveur.
2. **Schools (core)**:
   - Remplacer `useQuery` pour le total par un endpoint dédié “count” ou un champ `total` déjà exposé.
3. **Payments (data-ops)**:
   - Requête unique avec `COUNT(*) OVER()` si compatible avec la DB.
   - Colonnes explicitement listées pour éviter `select()` large.

## Audit additionnel (round 2)

Tous les points ci-dessous sont maintenant traites (voir "Avancement").

### Core (Audit)

1. [apps/core/src/components/schools/school-form.tsx](file:///home/darius-kassi/Projects/Yeko/apps/core/src/components/schools/school-form.tsx#L35-L42)
   - Query ad-hoc pour `storage-config`. A factoriser dans `queryOptions` + key factory. Termine.
2. [apps/core/src/routes/_auth/app/analytics/index.tsx](file:///home/darius-kassi/Projects/Yeko/apps/core/src/routes/_auth/app/analytics/index.tsx#L47-L55)
   - Multiples queries ad-hoc (overview, usage, perf). Centraliser dans `analyticsOptions` + keys dediees. Termine.

### School (Audit)

1. [apps/school/src/routes/_auth/grades/entry.tsx](file:///home/darius-kassi/Projects/Yeko/apps/school/src/routes/_auth/grades/entry.tsx#L52-L92)
   - 5 queries en ligne (classes, subjects, terms, enrollments, grades). Centraliser dans `queries/*` + keys. Termine.
2. [apps/school/src/routes/_auth/grades/statistics.tsx](file:///home/darius-kassi/Projects/Yeko/apps/school/src/routes/_auth/grades/statistics.tsx#L34-L51)
   - Queries en ligne + `enabled` local. Centraliser + reduire les re-renders via `select`. Termine.
3. [apps/school/src/routes/_auth/settings/school-years.tsx](file:///home/darius-kassi/Projects/Yeko/apps/school/src/routes/_auth/settings/school-years.tsx#L79-L112)
   - Keys "string literals" (`school-years`, `school-year-templates`). Ajouter key factory pour invalidation ciblee. Termine.
4. [apps/school/src/routes/_auth/grades/validations.tsx](file:///home/darius-kassi/Projects/Yeko/apps/school/src/routes/_auth/grades/validations.tsx#L88-L114)
   - `invalidateQueries({ queryKey: gradesKeys.all })` trop large. Utiliser `gradesKeys.pending(schoolId)` + `refetchType` si besoin. Termine.

### Teacher (Audit)

1. [apps/teacher/src/routes/_auth/app/schools.$schoolId.class.$classId.tsx](file:///home/darius-kassi/Projects/Yeko/apps/teacher/src/routes/_auth/app/schools.$schoolId.class.$classId.tsx#L181-L249)
   - Bloc massif de queries en ligne (class, students, stats, schools, term, notes). Creer un module `queries/class-detail` + `queryOptions` + `select` pour derives. Termine.
2. [apps/teacher/src/routes/_auth/app/chat.$messageId.tsx](file:///home/darius-kassi/Projects/Yeko/apps/teacher/src/routes/_auth/app/chat.$messageId.tsx#L37-L41)
   - Invalidation large `['teacher','messages']` sur lecture d'un message. Optimiser par `messagesKeys.detail(messageId)` + `messagesKeys.list(teacherId)`. Termine.

## Avancement (implémenté)

### Data-ops

1. Pagination optimisée via `COUNT(*) OVER()` pour:
   - `getPayments` ([packages/data-ops/src/queries/payments.ts](file:///home/darius-kassi/Projects/Yeko/packages/data-ops/src/queries/payments.ts#L58-L101))
   - `getEnrollments` ([packages/data-ops/src/queries/enrollments.ts](file:///home/darius-kassi/Projects/Yeko/packages/data-ops/src/queries/enrollments.ts#L95-L165))
   - `getStudents` ([packages/data-ops/src/queries/students.ts](file:///home/darius-kassi/Projects/Yeko/packages/data-ops/src/queries/students.ts#L162-L236))
   - `getSchools` ([packages/data-ops/src/queries/schools.ts](file:///home/darius-kassi/Projects/Yeko/packages/data-ops/src/queries/schools.ts#L64-L94))

### Core

1. Suppression du double fetch `schools` pour stats, remplacement par `schoolsPerformanceQueryOptions`.
2. Ajout `schoolsKeys` + invalidations ciblées sur:
   - [apps/core/src/routes/_auth/app/schools/index.tsx](file:///home/darius-kassi/Projects/Yeko/apps/core/src/routes/_auth/app/schools/index.tsx#L52-L88)
   - [apps/core/src/routes/_auth/app/schools/$schoolId.tsx](file:///home/darius-kassi/Projects/Yeko/apps/core/src/routes/_auth/app/schools/%24schoolId.tsx#L109-L152)
   - [apps/core/src/routes/_auth/app/schools/$schoolId_.edit.tsx](file:///home/darius-kassi/Projects/Yeko/apps/core/src/routes/_auth/app/schools/%24schoolId_.edit.tsx#L29-L46)
3. **User Management**: centralisation via `platformUsersQueryOptions` et `platformRolesQueryOptions` avec key factory `platformUsersKeys`.
4. Export: refetch dédié sans polluer le cache principal.

### School

1. Centralisation `classSubjectsOptions` utilisée dans `grades/entry`.
2. `grades/validations` invalidation ciblée `gradesKeys.pending`.
3. **Settings**: refactorisation `school-years.tsx` et `profile.tsx` avec query options et key factories (`schoolYearsKeys`, `schoolProfileKeys`).
4. **Grades Entry & Statistics**: refactorisation vers des `queryOptions` standardisées et nettoyage des desctructurations `success`.
5. **Optimisme UI**: implémentation sur l'activation de l'année scolaire (`setActiveMutation`).

### Teacher

1. **Class Detail**: refactorisation complète de `schools.$schoolId.class.$classId.tsx` vers des `queryOptions` centralisées (classes, students, stats).
2. **Dashboard & Schedule**: passage aux key factories `scheduleKeys` et `schoolsKeys` pour une gestion granulaire du cache.
3. **Chat & Messages**: Key factory `messagesKeys` centralisée, standardisation des queries de liste/détail et optimisme UI sur le statut "Lu" dans `chat.$messageId.tsx`.
4. **Drafts**: centralisation de la persistance locale via `localNotesKeys`.
5. **Attendance**: refactorisation complète de `attendance.tsx` et `attendance.ts` (query options, key factory `attendanceKeys`, consolidation des counts via `useMemo` et optimisme UI sur les mutations individuelles et en lot).

## Workflow de refactorisation

### Règles

1. Toujours utiliser `queryOptions` / key factories.
2. Éviter `invalidateQueries()` sans `queryKey`.
3. Préférer `select` / `useMutationState` pour l’optimisme UI.
4. `COUNT(*) OVER()` pour pagination quand supporté.
5. Ne pas casser la policy `ResultAsync` (data-ops).

### Procédure

1. Identifier les queries ad-hoc.
2. Créer/étendre keys + options.
3. Migrer les composants à ces options.
4. Ajuster invalidations + refetch ciblés.
5. Vérifier les écrans critiques (grades, schools, attendance).

## Dépendances et risques

1. Certaines optimisations DB nécessitent un plan de migration (index).
2. L’optimisme UI demande une gestion claire des erreurs (rollback visuel si échec).
3. Les améliorations doivent rester compatibles avec la politique “No-Throw” et `ResultAsync`.

## Étapes proposées

1. Audit détaillé de tous les fichiers listés par query/mutation.
2. Mise en place des factories `queryOptions` manquantes.
3. Ajout des optimismes UI sur flux critiques (attendance, bulk import, notes/grades).
4. Optimisations DB dans `packages/data-ops`.
5. Validation fonctionnelle + perf (profilage des requêtes).

## Validation (critères)

1. Diminution des requêtes doublons (counts, dérivées).
2. Temps de réponse perçu amélioré sur les actions clés.
3. Aucun contournement de la politique `ResultAsync`.
4. Aucun hardcode de strings UI (i18n ok).

## Restant a traiter

1. Planifier et appliquer l'indexation DB proposee (migration + validation perf).
   - Constat: les indexes cibles sont deja presents dans le schema Drizzle.
   - References:
     - `students.school_id`, `students.status`, `students.admission_date` deja indexes.
     - `enrollments.school_year_id`, `enrollments.status`, `enrollments.class_id` deja indexes.
     - `payments.school_id`, `payments.payment_date`, `payments.status` deja indexes.
   - Prochaine etape: verifier la prod (EXPLAIN) et ajouter un index composite si les filtres `school_id + status + payment_date` sont dominants dans `getPayments`.
2. Normaliser `placeholderData: keepPreviousData` sur les listes paginees restantes (audit global).
3. Generaliser l'optimisme UI via `useMutationState` sur les actions bulk/imports encore non couvertes.
4. Ajouter les prefetchs sur les transitions majeures (liste -> detail) selon les ecrans critiques.
5. Continuer l'audit des ecrans non listes ici pour detecter les queries ad-hoc restantes.

### Mises a jour recentes

1. Ajout de `placeholderData: keepPreviousData` sur les listes paginees suivantes:
   - [apps/core/src/integrations/tanstack-query/schools-options.ts](file:///home/darius-kassi/Projects/Yeko/apps/core/src/integrations/tanstack-query/schools-options.ts#L27-L35)
   - [apps/core/src/integrations/tanstack-query/programs-options.ts](file:///home/darius-kassi/Projects/Yeko/apps/core/src/integrations/tanstack-query/programs-options.ts#L88-L101)
   - [apps/core/src/integrations/tanstack-query/platform-users-options.ts](file:///home/darius-kassi/Projects/Yeko/apps/core/src/integrations/tanstack-query/platform-users-options.ts#L11-L16)
   - [apps/core/src/integrations/tanstack-query/catalogs-options.ts](file:///home/darius-kassi/Projects/Yeko/apps/core/src/integrations/tanstack-query/catalogs-options.ts#L162-L174)
   - [apps/school/src/lib/queries/students.ts](file:///home/darius-kassi/Projects/Yeko/apps/school/src/lib/queries/students.ts#L34-L48)
   - [apps/school/src/lib/queries/payments.ts](file:///home/darius-kassi/Projects/Yeko/apps/school/src/lib/queries/payments.ts#L30-L42)
   - [apps/school/src/lib/queries/refunds.ts](file:///home/darius-kassi/Projects/Yeko/apps/school/src/lib/queries/refunds.ts#L26-L38)
   - [apps/school/src/lib/queries/enrollments.ts](file:///home/darius-kassi/Projects/Yeko/apps/school/src/lib/queries/enrollments.ts#L26-L38)
   - [apps/school/src/lib/queries/parents.ts](file:///home/darius-kassi/Projects/Yeko/apps/school/src/lib/queries/parents.ts#L24-L36)
   - [apps/school/src/lib/queries/conduct-records.ts](file:///home/darius-kassi/Projects/Yeko/apps/school/src/lib/queries/conduct-records.ts#L19-L42)
   - [apps/teacher/src/lib/queries/sessions.ts](file:///home/darius-kassi/Projects/Yeko/apps/teacher/src/lib/queries/sessions.ts#L32-L49)
   - [apps/teacher/src/lib/queries/homework.ts](file:///home/darius-kassi/Projects/Yeko/apps/teacher/src/lib/queries/homework.ts#L14-L30)
   - [apps/teacher/src/lib/queries/messages.ts](file:///home/darius-kassi/Projects/Yeko/apps/teacher/src/lib/queries/messages.ts#L28-L42)
   - [apps/teacher/src/lib/queries/attendance.ts](file:///home/darius-kassi/Projects/Yeko/apps/teacher/src/lib/queries/attendance.ts#L56-L70)
