/**
 * French error messages for data operations
 * These messages are used by the @repo/data-ops package
 */
const fr_errors = {
  errors: {
    generic: 'Une erreur s\'est produite',
    notFound: 'Ressource non trouvée',
    unauthorized: 'Non autorisé',
    forbidden: 'Accès interdit',
    serverError: 'Erreur serveur',
    networkError: 'Erreur réseau',
    validationError: 'Erreur de validation',
    conflict: 'Conflit de données',
    internalError: 'Erreur interne',

    database: {
      connectionFailed: 'Échec de la connexion à la base de données',
      queryFailed: 'Échec de l\'exécution de la requête',
      transactionFailed: 'Échec de la transaction',
      constraintViolation: 'Violation de contrainte de données',
      uniqueConstraint: 'Une ressource avec ces informations existe déjà',
      foreignKeyConstraint: 'Référence invalide à une ressource liée',
      notNullConstraint: 'Champ requis manquant',
    },

    students: {
      notFound: 'Élève non trouvé',
      alreadyExists: 'Un élève avec ces informations existe déjà',
      matriculeExists: 'Ce matricule est déjà utilisé',
      invalidData: 'Données de l\'élève invalides',
      createFailed: 'Échec de la création de l\'élève',
      updateFailed: 'Échec de la mise à jour de l\'élève',
      deleteFailed: 'Échec de la suppression de l\'élève',
      importFailed: 'Échec de l\'importation des élèves',
      exportFailed: 'Échec de l\'exportation des élèves',
    },

    parents: {
      notFound: 'Parent non trouvé',
      alreadyExists: 'Un parent avec ce numéro de téléphone existe déjà',
      invalidData: 'Données du parent invalides',
      createFailed: 'Échec de la création du parent',
      updateFailed: 'Échec de la mise à jour du parent',
      deleteFailed: 'Échec de la suppression du parent',
      linkFailed: 'Échec du lien parent-élève',
      unlinkFailed: 'Échec de la suppression du lien',
      invitationFailed: 'Échec de l\'envoi de l\'invitation',
      invalidToken: 'Token d\'invitation invalide ou expiré',
      noEmail: 'Le parent n\'a pas d\'adresse email',
      noChildren: 'Aucun enfant lié au parent',
    },

    enrollments: {
      notFound: 'Inscription non trouvée',
      alreadyExists: 'L\'élève est déjà inscrit pour cette année scolaire',
      invalidData: 'Données d\'inscription invalides',
      createFailed: 'Échec de la création de l\'inscription',
      confirmFailed: 'Échec de la confirmation de l\'inscription',
      cancelFailed: 'Échec de l\'annulation de l\'inscription',
      transferFailed: 'Échec du transfert de l\'élève',
      bulkReenrollFailed: 'Échec de la réinscription en masse',
    },

    classes: {
      notFound: 'Classe non trouvée',
      alreadyExists: 'Une classe avec ce nom existe déjà',
      invalidData: 'Données de la classe invalides',
      createFailed: 'Échec de la création de la classe',
      updateFailed: 'Échec de la mise à jour de la classe',
      deleteFailed: 'Échec de la suppression de la classe',
      capacityExceeded: 'Capacité maximale de la classe atteinte',
    },

    teachers: {
      notFound: 'Enseignant non trouvé',
      alreadyExists: 'Cet utilisateur est déjà un enseignant',
      invalidData: 'Données de l\'enseignant invalides',
      createFailed: 'Échec de la création de l\'enseignant',
      updateFailed: 'Échec de la mise à jour de l\'enseignant',
      deleteFailed: 'Échec de la suppression de l\'enseignant',
      assignFailed: 'Échec de l\'attribution de la matière',
    },

    subjects: {
      notFound: 'Matière non trouvée',
      alreadyExists: 'Une matière avec ce code existe déjà',
      invalidData: 'Données de la matière invalides',
      createFailed: 'Échec de la création de la matière',
      updateFailed: 'Échec de la mise à jour de la matière',
      deleteFailed: 'Échec de la suppression de la matière',
      inUse: 'La matière est utilisée et ne peut pas être supprimée',
    },

    finance: {
      payment: {
        notFound: 'Paiement non trouvé',
        createFailed: 'Échec de la création du paiement',
        cancelFailed: 'Échec de l\'annulation du paiement',
        invalidAmount: 'Montant de paiement invalide',
        receiptExists: 'Un reçu avec ce numéro existe déjà',
        allocationFailed: 'Échec de l\'allocation du paiement',
      },
      refund: {
        notFound: 'Remboursement non trouvé',
        createFailed: 'Échec de la création du remboursement',
        approveFailed: 'Échec de l\'approbation du remboursement',
        rejectFailed: 'Échec du rejet du remboursement',
        processFailed: 'Échec du traitement du remboursement',
        cancelFailed: 'Échec de l\'annulation du remboursement',
        insufficientBalance: 'Solde insuffisant pour le remboursement',
      },
      account: {
        notFound: 'Compte non trouvé',
        alreadyExists: 'Un compte avec ce code existe déjà',
        createFailed: 'Échec de la création du compte',
        updateFailed: 'Échec de la mise à jour du compte',
        deleteFailed: 'Échec de la suppression du compte',
        hasTransactions: 'Le compte a des transactions et ne peut pas être supprimé',
      },
      transaction: {
        notFound: 'Transaction non trouvée',
        createFailed: 'Échec de la création de la transaction',
        unbalanced: 'La transaction n\'est pas équilibrée',
        invalidLines: 'Lignes de transaction invalides',
        fiscalYearClosed: 'L\'exercice fiscal est clôturé',
      },
      fee: {
        notFound: 'Frais non trouvés',
        alreadyExists: 'Des frais avec ce code existent déjà',
        createFailed: 'Échec de la création des frais',
        updateFailed: 'Échec de la mise à jour des frais',
        deleteFailed: 'Échec de la suppression des frais',
        assignFailed: 'Échec de l\'attribution des frais',
      },
      installment: {
        notFound: 'Versement non trouvé',
        createFailed: 'Échec de la création du versement',
        waiveFailed: 'Échec de la remise du versement',
        alreadyPaid: 'Le versement est déjà payé',
      },
      paymentPlan: {
        notFound: 'Plan de paiement non trouvé',
        createFailed: 'Échec de la création du plan de paiement',
        updateFailed: 'Échec de la mise à jour du plan de paiement',
        cancelFailed: 'Échec de l\'annulation du plan de paiement',
        alreadyExists: 'Un plan de paiement existe déjà pour cet élève',
      },
    },

    attendance: {
      notFound: 'Enregistrement de présence non trouvé',
      createFailed: 'Échec de la création de la présence',
      updateFailed: 'Échec de la mise à jour de la présence',
      deleteFailed: 'Échec de la suppression de la présence',
      alreadyExists: 'Un enregistrement de présence existe déjà pour cette date',
      invalidStatus: 'Statut de présence invalide',
      bulkCreateFailed: 'Échec de la création en masse des présences',
    },

    grades: {
      notFound: 'Note non trouvée',
      createFailed: 'Échec de la création de la note',
      updateFailed: 'Échec de la mise à jour de la note',
      deleteFailed: 'Échec de la suppression de la note',
      invalidValue: 'Valeur de note invalide',
      outOfRange: 'La note est hors de la plage autorisée',
      coefficientNotFound: 'Coefficient non trouvé pour cette matière',
    },

    timetables: {
      notFound: 'Emploi du temps non trouvé',
      createFailed: 'Échec de la création de l\'emploi du temps',
      updateFailed: 'Échec de la mise à jour de l\'emploi du temps',
      deleteFailed: 'Échec de la suppression de l\'emploi du temps',
      conflict: 'Conflit d\'horaire détecté',
      teacherConflict: 'L\'enseignant a déjà un cours à cette heure',
      classroomConflict: 'La salle est déjà occupée à cette heure',
    },

    school: {
      notFound: 'École non trouvée',
      alreadyExists: 'Une école avec ce nom existe déjà',
      invalidData: 'Données de l\'école invalides',
      createFailed: 'Échec de la création de l\'école',
      updateFailed: 'Échec de la mise à jour de l\'école',
      deleteFailed: 'Échec de la suppression de l\'école',
    },

    schoolYear: {
      notFound: 'Année scolaire non trouvée',
      alreadyExists: 'Une année scolaire avec ce nom existe déjà',
      invalidData: 'Données de l\'année scolaire invalides',
      createFailed: 'Échec de la création de l\'année scolaire',
      updateFailed: 'Échec de la mise à jour de l\'année scolaire',
      deleteFailed: 'Échec de la suppression de l\'année scolaire',
      hasEnrollments: 'L\'année scolaire a des inscriptions et ne peut pas être supprimée',
    },

    users: {
      notFound: 'Utilisateur non trouvé',
      alreadyExists: 'Un utilisateur avec cet email existe déjà',
      invalidData: 'Données de l\'utilisateur invalides',
      createFailed: 'Échec de la création de l\'utilisateur',
      updateFailed: 'Échec de la mise à jour de l\'utilisateur',
      deleteFailed: 'Échec de la suppression de l\'utilisateur',
      emailExists: 'Cet email est déjà utilisé',
    },

    roles: {
      notFound: 'Rôle non trouvé',
      alreadyExists: 'Un rôle avec ce nom existe déjà',
      invalidData: 'Données du rôle invalides',
      createFailed: 'Échec de la création du rôle',
      updateFailed: 'Échec de la mise à jour du rôle',
      deleteFailed: 'Échec de la suppression du rôle',
      systemRole: 'Les rôles système ne peuvent pas être modifiés ou supprimés',
    },

    permissions: {
      denied: 'Permission refusée',
      insufficient: 'Permissions insuffisantes pour cette action',
      invalidScope: 'Portée de permission invalide',
    },

    auth: {
      invalidCredentials: 'Identifiants invalides',
      sessionExpired: 'Session expirée',
      tokenInvalid: 'Token invalide',
      unauthorized: 'Non autorisé',
      forbidden: 'Accès interdit',
      noSchoolContext: 'Aucun contexte d\'école',
      invalidSchoolContext: 'Contexte d\'école invalide',
    },

    validation: {
      required: 'Ce champ est requis',
      invalidFormat: 'Format invalide',
      invalidType: 'Type de données invalide',
      tooShort: 'Trop court (minimum {min} caractères)',
      tooLong: 'Trop long (maximum {max} caractères)',
      invalidEmail: 'Adresse email invalide',
      invalidPhone: 'Numéro de téléphone invalide',
      invalidDate: 'Date invalide',
      futureDate: 'La date doit être dans le futur',
      pastDate: 'La date doit être dans le passé',
      invalidNumber: 'Nombre invalide',
      negativeNumber: 'Le nombre ne peut pas être négatif',
      zeroNotAllowed: 'La valeur ne peut pas être zéro',
    },

    file: {
      notFound: 'Fichier non trouvé',
      tooLarge: 'Fichier trop volumineux',
      invalidType: 'Type de fichier invalide',
      uploadFailed: 'Échec du téléversement',
      downloadFailed: 'Échec du téléchargement',
      parseFailed: 'Échec de l\'analyse du fichier',
    },

    import: {
      failed: 'Échec de l\'importation',
      invalidFormat: 'Format de fichier invalide',
      missingColumns: 'Colonnes requises manquantes',
      noValidRows: 'Aucune ligne valide trouvée',
      partialSuccess: 'Importation partiellement réussie',
    },

    export: {
      failed: 'Échec de l\'exportation',
      noData: 'Aucune donnée à exporter',
      formatFailed: 'Échec de la génération du fichier',
    },

    bulk: {
      failed: 'Échec de l\'opération en masse',
      partialSuccess: 'Opération partiellement réussie',
      noItems: 'Aucun élément sélectionné',
    },
  },
} as const

export type ErrorTranslations = typeof fr_errors
export default fr_errors
