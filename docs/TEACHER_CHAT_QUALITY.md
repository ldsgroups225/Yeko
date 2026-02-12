# Spécification Technique : Qualité de la Communication Parent-Professeur (PTCQ)

## 1. Vue d'Ensemble

Dans l'écosystème **Yeko**, la communication entre les parents et les enseignants est essentielle mais peut générer une surcharge mentale pour le corps enseignant, en particulier pour les **Professeurs Principaux (Homeroom Teachers)**.

L'objectif de cette spécification est d'implémenter un système de messagerie régulé, structuré et assisté par IA pour garantir des échanges de haute qualité tout en préservant le temps des enseignants.

## 2. État Actuel & Alignement Architecture

Le système actuel repose sur les bases suivantes dans `@repo/data-ops` et `apps/teacher` :

* **Table `teacher_messages`** : Gère les échanges simples entre types `teacher` et `parent`.
* **Table `message_templates`** : Stocke des modèles prédéfinis par catégorie (absence, notes, comportement).
* **Rôle "Professeur Principal"** : Identifié via `classes.homeroom_teacher_id`.

## 3. Nouvelles Fonctionnalités de Régulation

### 3.1 Sessions de Communication & Quotas

Pour éviter le "spam" et les fils de discussion interminables :

* **Concept de Session** : Un fil de discussion est lié à un contexte spécifique (Élève + Matière ou Général).
* **Quota de Messages** : Limite stricte de **10 messages par session**. Une fois le quota atteint, la session est verrouillée.
* **Quota Hebdomadaire** : Un parent ne peut ouvrir que **3 sessions actives** par semaine.
* **Validation côté Serveur** : Utilisation de Zod et de Server Functions pour rejeter tout message dépassant ces quotas.

### 3.2 Utilisation Obligatoire de Templates

Pour initier une nouvelle session, le parent doit :

1. Sélectionner une catégorie (ex: *Absence*, *Résultats Académiques*).
2. Choisir ou s'inspirer d'un **Message Template** existant.
3. Compléter les variables (placeholders) pour structurer sa demande.

### 3.3 Assistant IA (Yeko-AI)

Intégration d'un service d'analyse (ex: via OpenAI ou Anthropic) :

* **Détection de FAQ** : Avant l'envoi au professeur, l'IA analyse le message du parent. Si la réponse est disponible dans le règlement ou les notes de l'élève (ex: "Quand est le prochain examen ?"), l'IA propose la réponse immédiatement.
* **Modération de Ton** : Analyse du sentiment pour s'assurer que les échanges restent respectueux.
* **Résumé pour le Professeur** : L'IA génère un résumé des points clés pour les fils de discussion longs.

## 4. Modèle de Données (Évolutions)

### Table `teacher_messages` (Mise à jour)

* Ajout d'un flag `is_ai_replied` (boolean).
* Liaison renforcée avec `thread_id`.

### Table `communication_sessions` (Nouvelle)

* `id` (PK)
* `school_id`
* `parent_id`
* `teacher_id`
* `student_id`
* `status` (active, locked, archived)
* `message_count` (int, default 0)
* `expires_at` (timestamp)

## 5. Flux Opérationnel (Workflow)

1. **Parent** : Tente d'écrire un message. Le système vérifie `communication_sessions` pour le quota hebdo.
2. **Parent** : Rédige via un template.
3. **Système** : Interception par l'IA. Si réponse auto possible, interruption du flux et proposition de réponse.
4. **Teacher** : Reçoit une notification uniquement si l'IA ne peut pas répondre.
5. **Teacher** : Répond via l'interface `apps/teacher/chat`. Le compteur `message_count` s'incrémente.
6. **Verrouillage** : À 10 messages, le bouton "Répondre" devient inactif et suggère un rendez-vous physique.

## 6. Contraintes & Standards

* **Language** : Interface et IA exclusivement en **Français** (`i18n-react`).
* **Pattern `byethrow`** : Toutes les opérations de quota et d'envoi doivent retourner un `ResultAsync`.
* **Sécurité RLS** : Isolation stricte par `school_id` et `student_id`.

---

## 7. Équipe d'Implémentation (Agents Pairs)

Pour mener à bien ce chantier technique, les cinq agents suivants collaboreront en mode peer-to-peer :

### 7.1 Architecte Core & Types

* **Agent** : `02-language-specialists/typescript-pro.md`
* **Rôle** : Architecte en chef. Définit les schémas Zod pour les quotas, implémente les patterns `ResultAsync` et assure la cohérence des types partagés entre `@repo/data-ops` et les apps.

### 7.2 Spécialiste Données & Quotas

* **Agent** : `05-data-ai/postgres-pro.md`
* **Rôle** : Database Designer. Implémente la table `communication_sessions`, les triggers PostgreSQL pour l'incrémentation des compteurs et optimise les vues de reporting pour l'administration.

### 7.3 Ingénieur IA & Automatisation

* **Agent** : `05-data-ai/data-engineer.md`
* **Rôle** : AI Specialist. Configure l'intégration avec l'API LLM pour la détection de FAQ et la modération. Met en place les fonctions de "prompt engineering" spécifiques au contexte scolaire local.

### 7.4 Développeur Interface Mobile (PWA)

* **Agent** : `07-specialized-domains/mobile-app-developer.md`
* **Rôle** : Frontend Expert. Implémente l'interface de chat dans `apps/teacher`, la sélection de templates et les indicateurs visuels de quota (progress bars de messages restant).

### 7.5 Gardien de la Qualité & Tests PBT

* **Agent** : `04-quality-security/qa-expert.md`
* **Rôle** : QA Strategist. Met en place des **Property-Based Tests (PBT)** pour valider les limites de quotas et les scénarios de débordement. Garantit que le verrouillage des sessions est inviolable.

---
> *Version du Document : 1.1 (Spécification Technique Alignée)*
