import type { SystemAction } from '@repo/data-ops'

export const RESOURCES = [
  // École (Nouveau MVP)
  { id: 'teachers', name: 'Personnel Enseignant', category: 'École' },
  { id: 'students', name: 'Élèves & Étudiants', category: 'École' },
  { id: 'parents', name: 'Parents d\'Élèves', category: 'École' },
  { id: 'classes', name: 'Classes & Groupes', category: 'École' },
  { id: 'classrooms', name: 'Salles & Infrastructure', category: 'École' },
  { id: 'grades', name: 'Notes & Évaluations', category: 'École' },
  { id: 'attendance', name: 'Suivi des Présences', category: 'École' },
  { id: 'conduct', name: 'Vie Scolaire & Discipline', category: 'École' },
  { id: 'finance', name: 'Finances & Inscriptions', category: 'École' },
  { id: 'reports', name: 'Bulletins & Rapports', category: 'École' },
  { id: 'settings', name: 'Paramètres École', category: 'École' },
  { id: 'school_subjects', name: 'Matières & Programmes', category: 'École' },
  { id: 'coefficients', name: 'Coefficients & Pondération', category: 'École' },
  { id: 'teacher_assignments', name: 'Attributions de Cours', category: 'École' },
  // Système
  { id: 'schools', name: 'Gestion des Établissements', category: 'Système' },
  { id: 'users', name: 'Comptes Utilisateurs', category: 'Système' },
  { id: 'system_monitoring', name: 'Supervison Système', category: 'Système' },
  { id: 'global_settings', name: 'Configuration Globale', category: 'Système' },
]

export const RESOURCE_MAP = Object.fromEntries(RESOURCES.map(r => [r.id, r.name]))

export const ACTIONS: { id: SystemAction, name: string }[] = [
  { id: 'view', name: 'Voir' },
  { id: 'create', name: 'Créer' },
  { id: 'edit', name: 'Modifier' },
  { id: 'delete', name: 'Supprimer' },
  { id: 'manage', name: 'Gérer (Tout)' },
]
