const es = {
  // Navigation
  nav: {
    home: "Inicio",
    flashcards: "Tarjetas",
    practice: "Práctica",
    studyChat: "Chat de Estudio",
    review: "Repaso",
    settings: "Configuración",
    signOut: "Cerrar Sesión",
    signIn: "Iniciar Sesión",
    dashboard: "Panel",
    generate: "Generar",
    saved: "Guardados",
    getStarted: "Comenzar",
    pricing: "Precios",
    learningJourney: "Tu Viaje de Aprendizaje",
  },

  // Generate page
  generateSummaryNotes: "Generar Resumen de Notas",
  viewNotes: "Ver Notas",
  typeOrPaste: "Escribir o Pegar",
  uploadFile: "Subir Archivo",
  enterTextBelow:
    "Ingrese su texto a continuación para generar notas de resumen",
  enterText: "Ingrese texto...",
  selectFile: "Seleccionar Archivo",
  dragAndDrop: "Arrastre y suelte o haga clic para navegar",
  supportedFileTypes:
    "Tipos de archivo compatibles: Solo PDF, archivos de texto e imágenes (PNG, JPEG, GIF, WebP). Tamaño máximo de archivo: 10MB",
  generate: "Generar Resumen de Notas",

  // Generate page loading messages
  generatePage: {
    loadingMessages: {
      generating: "Generando tus tarjetas de estudio...",
      breaking: "Dividiendo el contenido en piezas pequeñas...",
      creating: "Creando materiales de estudio completos...",
      didYouKnow:
        "¿Sabías? ¡El recuerdo activo a través de tarjetas es uno de los métodos de estudio más efectivos!",
      organizing: "¡Casi listo! Organizando tus tarjetas...",
      proTip:
        "Consejo: La revisión regular de tarjetas ayuda a mover información a la memoria a largo plazo",
      capturing: "Asegurándonos de capturar todos los conceptos importantes...",
      funFact:
        "¡Dato curioso: La repetición espaciada puede mejorar la retención hasta en un 200%!",
      stillWorking:
        "Seguimos trabajando... Los temas complejos toman tiempo para procesarse adecuadamente",
      connections: "Creando conexiones entre conceptos...",
    },
  },

  // Practice tab
  practiceTestGenerator: "Generador de Pruebas de Práctica",
  createCustomTest:
    "Crea una prueba de práctica personalizada a partir de tus conjuntos de tarjetas",
  selectFlashcardSet: "Seleccionar conjunto de tarjetas",
  questionTypes: "Tipos de preguntas",
  multipleChoice: "Opción múltiple",
  trueFalse: "Verdadero/Falso",
  fillInBlank: "Completar el espacio en blanco",
  numberOfQuestions: "Número de preguntas",
  maxQuestionsNote: "Máximo 15 preguntas por prueba para un rendimiento óptimo",
  generatePracticeTest: "Generar Prueba de Práctica",
  practice: {
    generatingQuestions: "Generando preguntas de práctica...",
    loadingMessages: {
      analyzing: "Analizando tus tarjetas de estudio...",
      creating: "Creando preguntas de práctica desafiantes...",
      varying: "Variando tipos de preguntas y niveles de dificultad...",
      personalizing: "Personalizando tu prueba de práctica...",
      finishing: "¡Casi listo! Finalizando tu prueba...",
    },
    testResults: "Resultados del Test",
    excellent: "¡Excelente!",
    goodEffort: "¡Buen esfuerzo!",
    keepPracticing: "¡Sigue practicando!",
    questionReview: "Revisión de Preguntas:",
    question: "Pregunta",
    yourAnswer: "Tu respuesta:",
    correctAnswer: "Respuesta correcta:",
    notAnswered: "Sin responder",
    retryTest: "Reintentar Test",
    practiceTest: "Test de Práctica",
    questionCount: "Pregunta {current} de {total}",
    true: "Verdadero",
    false: "Falso",
    typeAnswer: "Escriba su respuesta",
    multipleChoice: "Opción múltiple",
    trueFalse: "Verdadero/Falso",
    fillInBlank: "Completar el espacio en blanco",
  },

  // Saved tab
  savedReviews: "Reseñas Guardadas",
  accessSavedGuides: "Accede a tus guías de estudio guardadas",
  reviewGuide: "Guía de Repaso",
  viewReview: "Ver Repaso",
  created: "Creado",

  // Study Chat tab
  flashcardSet: "Conjunto de tarjetas",
  poweredBy: "Desarrollado por",
  sendMessage: "Enviar un mensaje",

  // Study Chat additional translations
  chat: {
    sendMessage: "Enviar un mensaje...",
    clearHistory: "Borrar Historial de Chat",
    messageLimitReached: "Has alcanzado la longitud máxima de conversación",
    continueMessage:
      "Para seguir chateando de manera efectiva y evitar problemas de memoria, borra el historial de conversación usando el botón a continuación.",
    premiumComing:
      "¡Próximamente: Nuestra suscripción premium permitirá conversaciones ilimitadas y acceso a tu historial completo de chat!",
    askQuestionsDescription:
      "Haz preguntas sobre tus tarjetas, obtén explicaciones de conceptos, recibe consejos de estudio y retención, o aprende sobre temas relacionados. Para evaluar tu conocimiento, utiliza la función de Exámenes de Práctica.",
    welcomeMessage:
      '¡Hola! Soy tu asistente de estudio para el conjunto de tarjetas "{setName}". Puedo ayudarte a entender conceptos, proporcionar contexto adicional u ofrecer consejos de estudio relacionados con estas tarjetas. ¿Sobre qué te gustaría aprender más?',
    historyClearedMessage:
      "El historial de conversación ha sido borrado. Podemos continuar discutiendo el conjunto de tarjetas {setName}. ¿Qué te gustaría saber?",
  },

  // Dashboard specific
  dashboard: {
    welcome: {
      title: "Bienvenido a StudyMate AI",
      subtitle:
        "Crea tarjetas de estudio personalizadas, realiza cuestionarios y sigue tu progreso con herramientas de aprendizaje potenciadas por IA.",
      createNotes: "Crear Notas",
      viewNotes: "Ver Notas",
      takeQuiz: "Hacer Cuestionario",
    },
    stats: {
      title: "Estadísticas de Pruebas",
      averageScore: "Puntuación Media",
      testsCompleted: "Pruebas Completadas",
      timePracticed: "Tiempo Practicado",
      recentHistory: "Historial Reciente",
      date: "Fecha",
      score: "Puntuación",
      questions: "Preguntas",
      time: "Tiempo",
      flashcardSet: "Conjunto de Tarjetas",
    },
    performance: {
      title: "Análisis de Rendimiento",
      areasForImprovement: "Áreas de Mejora",
      recommendations: "Recomendaciones Personalizadas",
      accuracy: "precisión",
      studyNow: "Estudiar Ahora",
      reviewTopics: "Revisa estos temas frecuentemente fallados",
      topicsToReview: "Temas para revisar",
      practiceMore: "Practica más preguntas de tipo {type}",
      focusOn: "Concéntrate en repasar {topic} ({accuracy}% de precisión)",
      streak: {
        title: "¡Racha de {count} días!",
        subtitle: "¡Sigue así! ¡Estás en racha! 🔥",
      },
      enhancedLearning: "Aprendizaje Mejorado",
      question: "Pregunta",
      correctAnswer: "Respuesta Correcta",
      aiExplanation: "Explicación de IA",
      videoResources: "Recursos de Video",
      topicDetails: "Detalles del Tema: {topic}",
    },
  },

  // Common buttons
  buttons: {
    create: "Crear",
    save: "Guardar",
    delete: "Eliminar",
    cancel: "Cancelar",
    edit: "Editar",
    back: "Volver",
    next: "Siguiente",
    previous: "Anterior",
    submit: "Enviar",
    clearChatHistory: "Borrar Historial de Chat",
    clearHistory: "Borrar Historial",
    continue: "Continuar",
    startPractice: "Iniciar Práctica",
    showAnswer: "Mostrar Respuesta",
    hideAnswer: "Ocultar Respuesta",
    retry: "Intentar de Nuevo",
    exploreMoreLanguages: "Explorar Más Idiomas",
    createNotes: "CREAR NOTAS",
    viewNotes: "VER NOTAS",
    takeQuiz: "HACER CUESTIONARIO",
    viewFullPage: "Ver Página Completa",
    read: "Leer",
    watch: "Ver",
    viewDeletedNotes: "Ver Notas Eliminadas",
    takeAction: "Tomar Acción",
    studyNow: "Estudiar Ahora",
    practiceThisTopic: "Practicar Este Tema",
    backToSavedReviews: "Volver a Reseñas Guardadas",
  },

  // Page titles
  titles: {
    dashboard: "Panel de Control",
    flashcards: "Tarjetas de Estudio",
    createFlashcards: "Crear Tarjetas",
    editFlashcards: "Editar Tarjetas",
    practice: "Modo de Práctica",
    studyChat: "Chat de Estudio",
    review: "Contenido de Repaso",
    settings: "Configuración",
    performance: "Análisis de Rendimiento",
    quickActions: "Acciones Rápidas",
    studyAchievement: "Logros de Estudio",
    studyGuide: "Guía de Estudio",
    detailedNotes: "Notas Detalladas",
    inDepthExplanations: "Explicaciones en Profundidad",
    studyResources: "Recursos de Estudio",
    videoResources: "Recursos de Video",
    practiceMaterials: "Materiales de Práctica",
    myNotes: "Mis Notas",
  },

  // Flashcards specific
  flashcards: {
    editSet: "Editar Conjunto",
    updateNameAndTags: "Actualizar Nombre y Etiquetas",
    setName: "Nombre del Conjunto",
    addTags: "Añadir Etiquetas",
    typeAndPressEnter: "Escriba y presione Enter",
    created: "Creado",
    confirmHide:
      "¿Estás seguro de que quieres ocultar este conjunto de tarjetas?",
    hideFailed:
      "No se pudo ocultar el conjunto de tarjetas. Por favor, inténtalo de nuevo.",
    enterName: "Por favor, introduce un nombre para tu conjunto de tarjetas.",
    nameExists:
      "Ya existe un conjunto de tarjetas con este nombre. Por favor, elige un nombre diferente.",
    invalidFormat:
      "Formato de tarjeta inválido. Por favor, inténtalo de nuevo.",
    updateFailed:
      "No se pudo actualizar el conjunto de tarjetas. Por favor, inténtalo de nuevo.",
    cards: "tarjetas",
    noMatching: "No se encontraron conjuntos de tarjetas coincidentes",
    adjustSearch: "Intenta ajustar tu búsqueda o filtros",
    backToNotes: "Volver a Notas",
    noFlashcardsFound: "No se encontraron tarjetas en esta colección",
    untitledSet: "Conjunto sin título",
    cardCount: "Tarjeta {current} de {total}",
  },

  // Common messages
  messages: {
    loading: "Cargando...",
    noResults: "No se encontraron resultados",
    confirmDelete: "¿Estás seguro de que quieres eliminar este elemento?",
    saved: "¡Guardado con éxito!",
    error: "Se produjo un error. Por favor, inténtalo de nuevo.",
    welcome: "Bienvenido a la App de Tarjetas",
    selectFlashcardSet:
      "Selecciona un conjunto de tarjetas e inicia una conversación",
    emptyState: "Aún no hay nada aquí. ¡Crea tu primer elemento!",
    noteSetsCreated: "Conjuntos de Notas Creados",
    betaFeature:
      "Esta función está en beta. La generación de contenido es experimental y puede no siempre producir resultados perfectos.",
    searchNotes: "Buscar notas...",
  },

  // Common
  loading: "Cargando...",
  save: "Guardar",
  cancel: "Cancelar",
  back: "Atrás",
  next: "Siguiente",
  previous: "Anterior",
  finish: "Finalizar",

  // Study guide loading messages
  studyGuide: {
    loadingMessages: {
      analyzing: "Analizando el tema y generando notas completas...",
      creating: "Creando explicaciones detalladas y ejemplos...",
      finding: "Buscando recursos de estudio y videos relevantes...",
      preparing: "Preparando materiales de práctica...",
      finishing: "¡Casi terminado! Ensamblando todo el contenido...",
    },
  },

  // Review specific
  review: {
    description: "Profundiza en los conceptos que necesitas mejorar",
    introduction: "Introducción",
    mainConcept: "Concepto Principal",
    relatedConcepts: "Conceptos Relacionados",
    relatedArticles: "Artículos Relacionados",
    videoResources: "Recursos de Video",
  },

  // Landing page
  landing: {
    hero: {
      title: "Comprende Todo con Facilidad",
      subtitle:
        "Libera tu potencial con tarjetas de estudio potenciadas por IA, notas inteligentes, análisis de aprendizaje personalizados y más",
      getStarted: "Comenzar",
      signUp: "Regístrate Gratis",
    },
    features: {
      title: "Características de Vanguardia",
      smartNotes: {
        title: "Notas Inteligentes",
        description:
          "La generación de notas impulsada por IA crea materiales de estudio concisos e impactantes.",
      },
      adaptiveReview: {
        title: "Repaso Adaptativo",
        description:
          "Los horarios de aprendizaje personalizados maximizan la retención y la eficiencia.",
      },
      deepAnalytics: {
        title: "Análisis Profundo",
        description:
          "Información procesable que rastrea el progreso y optimiza el enfoque de estudio.",
      },
    },
    blueprint: {
      title: "Tu Plan de Aprendizaje",
      steps: [
        {
          number: "01",
          title: "Introducir Contenido",
          description:
            "Sube texto, PDFs o imágenes sin esfuerzo con nuestra intuitiva interfaz.",
        },
        {
          number: "02",
          title: "Transformación con IA",
          description:
            "La IA avanzada convierte tu contenido en recursos de estudio optimizados.",
        },
        {
          number: "03",
          title: "Dominar Conceptos",
          description:
            "Aprende de manera más inteligente con sesiones de repaso adaptativas y personalizadas.",
        },
      ],
    },
    testimonials: {
      title: "Voces de Éxito",
      people: [
        {
          name: "James Blay",
          role: "Estudiante de Ingeniería",
          quote:
            "¡Esta plataforma transformó mi rutina de estudio, duplicando mi eficiencia!",
        },
        {
          name: "Gina Lucy",
          role: "Gerente de RRHH de una Empresa",
          quote:
            "Las tarjetas de estudio con IA agilizaron nuestro proceso de capacitación de empleados, haciendo la incorporación más rápida y atractiva.",
        },
        {
          name: "Duvor William",
          role: "Profesional en Activo",
          quote:
            "Equilibrar el trabajo y la mejora de habilidades era difícil, pero esta herramienta hizo que el aprendizaje fuera eficiente y flexible.",
        },
      ],
    },
    cta: {
      title: "Viaje de Memorización",
      description:
        "¡Únete a miles de estudiantes que están revolucionando sus habilidades de memorización con nuestras herramientas de IA de vanguardia. ¡Comienza hoy y desbloquea todo tu potencial!",
      button: "Inicia Tu Éxito",
    },
  },

  // Accessibility features
  accessibility: {
    textToSpeech: {
      listen: "Escuchar",
      stopListening: "Detener",
      notSupported: "La síntesis de voz no es compatible con este navegador",
      speakFront: "Leer pregunta",
      speakBack: "Leer respuesta",
    },
  },
};

export default es;
