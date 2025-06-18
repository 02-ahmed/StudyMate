// French translations

const fr = {
  // Navigation
  nav: {
    home: "Accueil",
    flashcards: "Cartes",
    practice: "Pratique",
    studyChat: "Chat d'Étude",
    review: "Révision",
    settings: "Paramètres",
    signOut: "Déconnexion",
    signIn: "Connexion",
    dashboard: "Tableau de Bord",
    generate: "Générer",
    saved: "Sauvegardés",
    getStarted: "Commencer",
    pricing: "Tarifs",
    learningJourney: "Votre Parcours d'Apprentissage",
  },

  // Generate page
  generateSummaryNotes: "Générer des Cartes Mémoire",
  viewNotes: "Voir les Cartes",
  typeOrPaste: "Taper ou Coller",
  uploadFile: "Télécharger un Fichier",
  enterTextBelow:
    "Entrez votre texte ci-dessous pour générer des cartes mémoire",
  enterText: "Entrez du texte...",
  selectFile: "Sélectionner un Fichier",
  dragAndDrop: "Glissez-déposez ou cliquez pour parcourir",
  supportedFileTypes:
    "Types de fichiers pris en charge : Uniquement PDF, fichiers texte et images (PNG, JPEG, GIF, WebP). Taille maximale de fichier : 2MB. Les fichiers plus volumineux peuvent provoquer des erreurs de traitement, envisagez de les diviser en morceaux plus petits si nécessaire.",
  generate: "Générer des Cartes Mémoire",

  // Generate page loading messages
  generatePage: {
    loadingMessages: {
      generating: "Génération de vos cartes mémoire...",
      breaking: "Décomposition du contenu en petits morceaux...",
      creating: "Création de matériels d'étude complets...",
      didYouKnow:
        "Le saviez-vous ? La récupération active via les cartes mémoire est l'une des méthodes d'étude les plus efficaces !",
      organizing: "Presque terminé ! Organisation de vos cartes mémoire...",
      proTip:
        "Conseil : La révision régulière des cartes aide à transférer l'information dans la mémoire à long terme",
      capturing:
        "Nous nous assurons de capturer tous les concepts importants...",
      funFact:
        "Fait amusant : La répétition espacée peut améliorer la rétention jusqu'à 200% !",
      stillWorking:
        "Toujours en cours... Les sujets complexes prennent du temps à traiter correctement",
      connections: "Création de connexions entre les concepts...",
    },
  },

  // Practice tab
  practiceTestGenerator: "Générateur de Tests d'Entraînement",
  createCustomTest:
    "Créez un test d'entraînement personnalisé à partir de vos ensembles de cartes",
  selectFlashcardSet: "Sélectionner un ensemble de cartes",
  questionTypes: "Types de questions",
  multipleChoice: "Choix multiple",
  trueFalse: "Vrai/Faux",
  fillInBlank: "Texte à trous",
  numberOfQuestions: "Nombre de questions",
  maxQuestionsNote:
    "Maximum 15 questions par test pour des performances optimales",
  generatePracticeTest: "Générer un Test d'Entraînement",
  practice: {
    generatingQuestions: "Génération de questions d'entraînement...",
    loadingMessages: {
      analyzing: "Analyse de vos cartes mémoire...",
      creating: "Création de questions d'entraînement stimulantes...",
      varying: "Variation des types de questions et niveaux de difficulté...",
      personalizing: "Personnalisation de votre test d'entraînement...",
      finishing: "Presque prêt ! Finalisation de votre test...",
    },
    testResults: "Résultats du Test",
    excellent: "Excellent !",
    goodEffort: "Bon effort !",
    keepPracticing: "Continuez à pratiquer !",
    questionReview: "Révision des Questions :",
    question: "Question",
    yourAnswer: "Votre réponse :",
    correctAnswer: "Réponse correcte :",
    notAnswered: "Sans réponse",
    retryTest: "Recommencer le Test",
    practiceTest: "Test d'Entraînement",
    questionCount: "Question {current} sur {total}",
    true: "Vrai",
    false: "Faux",
    typeAnswer: "Type votre réponse",
    multipleChoice: "Choix multiple",
    trueFalse: "Vrai/Faux",
    fillInBlank: "Texte à trous",
  },

  // Saved tab
  savedReviews: "Révisions Enregistrées",
  accessSavedGuides: "Accédez à vos guides d'étude enregistrés",
  reviewGuide: "Guide de Révision",
  viewReview: "Voir la Révision",
  created: "Créé le",

  // Study Chat tab
  flashcardSet: "Ensemble de cartes",
  poweredBy: "Propulsé par",
  sendMessage: "Envoyer un message",

  // Study Chat additional translations
  chat: {
    sendMessage: "Envoyer un message...",
    clearHistory: "Effacer l'Historique de Chat",
    messageLimitReached:
      "Vous avez atteint la longueur maximale de conversation",
    continueMessage:
      "Pour continuer à discuter efficacement et éviter les problèmes de mémoire, veuillez effacer l'historique de la conversation en utilisant le bouton ci-dessous.",
    premiumComing:
      "Bientôt disponible : Notre abonnement premium permettra des conversations illimitées et l'accès à votre historique de chat complet !",
    askQuestionsDescription:
      "Posez des questions sur vos cartes mémoire, obtenez des explications sur des concepts, recevez des conseils d'étude et de mémorisation, ou apprenez sur des sujets connexes. Pour tester vos connaissances, utilisez la fonction Tests Pratiques.",
    welcomeMessage:
      "Bonjour ! Je suis votre assistant d'étude pour l'ensemble de cartes \"{setName}\". Je peux vous aider à comprendre des concepts, fournir un contexte supplémentaire ou offrir des conseils d'étude liés à ces cartes. Qu'aimeriez-vous apprendre davantage ?",
    historyClearedMessage:
      "L'historique de conversation a été effacé. Nous pouvons continuer à discuter de l'ensemble de cartes {setName}. Que souhaitez-vous savoir ?",
  },

  // Dashboard specific
  dashboard: {
    welcome: {
      title: "Bienvenue sur StudyMate AI",
      subtitle:
        "Créez des cartes mémoire personnalisées, passez des quizze et suivez vos progrès avec des outils d'apprentissage alimentés par l'IA.",
      createNotes: "Créer des Notes",
      viewNotes: "Voir les Notes",
      takeQuiz: "Passer un Quiz",
    },
    stats: {
      title: "Statistiques des Tests",
      averageScore: "Score Moyen",
      testsCompleted: "Tests Complétés",
      timePracticed: "Temps Pratiqué",
      recentHistory: "Historique Récent",
      date: "Date",
      score: "Score",
      questions: "Questions",
      time: "Temps",
      flashcardSet: "Ensemble de Cartes",
    },
    performance: {
      title: "Analyse de Performance",
      areasForImprovement: "Zones d'Amélioration",
      recommendations: "Recommandations Personnalisées",
      accuracy: "précision",
      studyNow: "Étudier Maintenant",
      reviewTopics: "Révisez ces sujets fréquemment manqués",
      topicsToReview: "Sujets à revoir",
      practiceMore: "Pratiquez plus de questions de type {type}",
      focusOn:
        "Concentrez-vous sur la révision de {topic} ({accuracy}% de précision)",
      streak: {
        title: "Série de {count} jours !",
        subtitle: "Continuez comme ça ! Vous êtes en feu ! 🔥",
      },
      enhancedLearning: "Apprentissage Amélioré",
      question: "Question",
      correctAnswer: "Réponse Correcte",
      aiExplanation: "Explication IA",
      relatedArticles: "Articles Liés",
      videoResources: "Ressources Vidéo",
      duration: "Durée: {duration}",
      topicDetails: "Détails du Sujet: {topic}",
      answer: "Réponse:",
      accuracy: "Précision:",
    },
  },

  // Common buttons
  buttons: {
    create: "Créer",
    save: "Enregistrer",
    delete: "Supprimer",
    cancel: "Annuler",
    edit: "Modifier",
    back: "Retour",
    next: "Suivant",
    previous: "Précédent",
    submit: "Soumettre",
    clearChatHistory: "Effacer l'Historique",
    clearHistory: "Effacer l'Historique",
    continue: "Continuer",
    startPractice: "Commencer la Pratique",
    showAnswer: "Afficher la Réponse",
    hideAnswer: "Masquer la Réponse",
    retry: "Réessayer",
    exploreMoreLanguages: "Explorer Plus de Langues",
    createNotes: "CRÉER DES CARTES",
    viewNotes: "VOIR LES CARTES",
    takeQuiz: "FAIRE UN QUIZ",
    viewFullPage: "Voir la Page Complète",
    read: "Lire",
    watch: "Regarder",
    viewDeletedNotes: "Voir les Cartes Supprimées",
    takeAction: "Agir",
    studyNow: "Étudier Maintenant",
    practiceThisTopic: "Pratiquer Ce Sujet",
    backToSavedReviews: "Retour aux Révisions Sauvegardées",
  },

  // Page titles
  titles: {
    dashboard: "Tableau de Bord",
    flashcards: "Cartes Mémoire",
    createFlashcards: "Créer des Cartes",
    editFlashcards: "Modifier des Cartes",
    practice: "Mode Pratique",
    studyChat: "Chat d'Étude",
    review: "Contenu de Révision",
    settings: "Paramètres",
    performance: "Analyse de Performance",
    quickActions: "Actions Rapides",
    studyAchievement: "Réussite d'Étude",
    studyGuide: "Guide d'Étude",
    detailedNotes: "Notes Détaillées",
    inDepthExplanations: "Explications Approfondies",
    studyResources: "Ressources d'Étude",
    videoResources: "Ressources Vidéo",
    practiceMaterials: "Matériels de Pratique",
    myFlashcards: "Mes Cartes",
  },

  // Flashcards specific
  flashcards: {
    editSet: "Modifier l'Ensemble",
    updateNameAndTags: "Mettre à jour le Nom et les Étiquettes",
    setName: "Nom de l'Ensemble",
    addTags: "Ajouter des Étiquettes",
    typeAndPressEnter: "Tapez et appuyez sur Entrée",
    created: "Créé le",
    confirmHide:
      "Êtes-vous sûr de vouloir masquer cet ensemble de cartes mémoire ?",
    hideFailed:
      "Échec du masquage de l'ensemble de cartes mémoire. Veuillez réessayer.",
    enterName: "Veuillez saisir un nom pour votre ensemble de cartes mémoire.",
    nameExists:
      "Un ensemble de cartes mémoire avec ce nom existe déjà. Veuillez choisir un nom différent.",
    invalidFormat: "Format de carte mémoire invalide. Veuillez réessayer.",
    updateFailed:
      "Échec de la mise à jour de l'ensemble de cartes mémoire. Veuillez réessayer.",
    cards: "cartes",
    noMatching: "Aucun ensemble de cartes mémoire correspondant trouvé",
    adjustSearch: "Essayez d'ajuster votre recherche ou vos filtres",
    backToNotes: "Retour aux Cartes",
    noFlashcardsFound: "Aucune carte mémoire trouvée dans cette collection",
    untitledSet: "Ensemble sans titre",
    cardCount: "Carte {current} de {total}",
  },

  // Common messages
  messages: {
    loading: "Chargement...",
    noResults: "Aucun résultat trouvé",
    confirmDelete: "Êtes-vous sûr de vouloir supprimer cet élément ?",
    saved: "Enregistré avec succès !",
    error: "Une erreur s'est produite. Veuillez réessayer.",
    welcome: "Bienvenue dans l'Application de Cartes Mémoire",
    selectFlashcardSet:
      "Sélectionnez un ensemble de cartes et commencez une conversation",
    emptyState: "Rien ici pour l'instant. Créez votre premier élément !",
    noteSetsCreated: "Ensembles de Cartes Créés",
    betaFeature:
      "Cette fonctionnalité est en version bêta. La génération de contenu est expérimentale et pourrait ne pas toujours produire des résultats parfaits.",
    searchNotes: "Rechercher des notes...",
  },

  // Common
  loading: "Chargement...",
  save: "Enregistrer",
  cancel: "Annuler",
  back: "Retour",
  next: "Suivant",
  previous: "Précédent",
  finish: "Terminer",

  // Study guide loading messages
  studyGuide: {
    loadingMessages: {
      analyzing: "Analyse du sujet et génération de notes complètes...",
      creating: "Création d'explications détaillées et d'exemples...",
      finding: "Recherche de ressources d'étude et de vidéos pertinentes...",
      preparing: "Préparation de matériels de pratique...",
      finishing: "Presque terminé ! Assemblage de tout le contenu...",
    },
  },

  // Review specific
  review: {
    description:
      "Plongez en profondeur dans les concepts que vous devez améliorer",
    introduction: "Introduction",
    mainConcept: "Concept Principal",
    relatedConcepts: "Concepts Connexes",
    relatedArticles: "Articles Connexes",
    videoResources: "Ressources Vidéo",
  },

  // Landing page
  landing: {
    hero: {
      title: "Comprenez Tout Avec Facilité",
      subtitle:
        "Libérez votre potentiel avec des cartes mémoire alimentées par l'IA, des notes intelligentes, des analyses d'apprentissage personnalisées et plus encore",
      getStarted: "Commencer",
      signUp: "Inscription Gratuite",
    },
    features: {
      title: "Fonctionnalités de Pointe",
      smartNotes: {
        title: "Notes Intelligentes",
        description:
          "La génération de notes alimentée par l'IA crée des supports d'étude concis et percutants.",
      },
      adaptiveReview: {
        title: "Révision Adaptative",
        description:
          "Les calendriers d'apprentissage personnalisés maximisent la rétention et l'efficacité.",
      },
      deepAnalytics: {
        title: "Analyses Approfondies",
        description:
          "Des informations exploitables suivent les progrès et optimisent l'accent mis sur l'étude.",
      },
    },
    blueprint: {
      title: "Votre Plan d'Apprentissage",
      steps: [
        {
          number: "01",
          title: "Saisie de Contenu",
          description:
            "Téléchargez du texte, des PDF ou des images sans effort avec notre interface intuitive.",
        },
        {
          number: "02",
          title: "Transformation par IA",
          description:
            "L'IA avancée convertit votre contenu en ressources d'étude optimisées.",
        },
        {
          number: "03",
          title: "Maîtriser les Concepts",
          description:
            "Apprenez plus intelligemment avec des sessions de révision adaptatives et personnalisées.",
        },
      ],
    },
    testimonials: {
      title: "Voix du Succès",
      people: [
        {
          name: "James Blay",
          role: "Étudiant en Ingénierie",
          quote:
            "Cette plateforme a transformé ma routine d'étude, doublant mon efficacité !",
        },
        {
          name: "Gina Lucy",
          role: "Responsable RH d'une Entreprise",
          quote:
            "Les cartes mémoire IA ont rationalisé notre processus de formation des employés, rendant l'intégration plus rapide et plus engageante.",
        },
        {
          name: "Duvor William",
          role: "Professionnel en Activité",
          quote:
            "Équilibrer travail et perfectionnement était difficile, mais cet outil a rendu l'apprentissage efficace et flexible.",
        },
      ],
    },
    cta: {
      title: "Parcours de Mémorisation",
      description:
        "Rejoignez des milliers d'apprenants qui révolutionnent leurs compétences de mémorisation avec nos outils d'IA de pointe. Commencez aujourd'hui et libérez tout votre potentiel !",
      button: "Lancez Votre Réussite",
    },
  },

  // Accessibility features
  accessibility: {
    textToSpeech: {
      listen: "Écouter",
      stopListening: "Arrêter",
      notSupported:
        "La synthèse vocale n'est pas prise en charge par ce navigateur",
      speakFront: "Lire la question",
      speakBack: "Lire la réponse",
    },
  },
};

export default fr;
