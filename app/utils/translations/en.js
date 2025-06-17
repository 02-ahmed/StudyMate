// English translations

const en = {
  // Navigation
  nav: {
    home: "Home",
    flashcards: "Flashcards",
    practice: "Practice",
    studyChat: "Study Chat",
    review: "Review",
    settings: "Settings",
    signOut: "Sign Out",
    signIn: "Sign In",
    dashboard: "Dashboard",
    generate: "Generate",
    saved: "Saved",
    getStarted: "Get Started",
    pricing: "Pricing",
    learningJourney: "Your Learning Journey",
  },

  // Generate page
  generateSummaryNotes: "Generate Summary Notes",
  viewNotes: "View Notes",
  typeOrPaste: "Type or Paste",
  uploadFile: "Upload File",
  enterTextBelow: "Enter your text below to generate summary notes",
  enterText: "Enter text...",
  selectFile: "Select File",
  dragAndDrop: "Drag and drop or click to browse",
  supportedFileTypes:
    "Supported file types: Only PDF, text files, and images (PNG, JPEG, GIF, WebP) are supported. Maximum file size: 1MB",
  generate: "Generate Summary Notes",

  // Generate page loading messages
  generatePage: {
    loadingMessages: {
      generating: "Generating your flashcards...",
      breaking: "Breaking down the content into bite-sized pieces...",
      creating: "Creating comprehensive study materials...",
      didYouKnow:
        "Did you know? Active recall through flashcards is one of the most effective study methods!",
      organizing: "Almost there! Organizing your flashcards...",
      proTip:
        "Pro tip: Regular review of flashcards helps move information to long-term memory",
      capturing: "Making sure we capture all the important concepts...",
      funFact:
        "Fun fact: Spaced repetition can improve retention by up to 200%!",
      stillWorking:
        "Still working... Complex topics take time to process properly",
      connections: "Creating connections between concepts...",
    },
  },

  // Practice tab
  practiceTestGenerator: "Practice Test Generator",
  createCustomTest: "Create a custom practice test from your flashcard sets",
  selectFlashcardSet: "Select flashcard set",
  questionTypes: "Question Types",
  multipleChoice: "Multiple Choice",
  trueFalse: "True/False",
  fillInBlank: "Fill in the Blank",
  numberOfQuestions: "Number of questions",
  maxQuestionsNote: "Maximum 15 questions per test for optimal performance",
  generatePracticeTest: "Generate Practice Test",
  practice: {
    generatingQuestions: "Generating practice questions...",
    loadingMessages: {
      analyzing: "Analyzing your flashcards...",
      creating: "Creating challenging practice questions...",
      varying: "Varying question types and difficulty levels...",
      personalizing: "Personalizing your practice test...",
      finishing: "Almost ready! Finalizing your test...",
    },
    testResults: "Test Results",
    excellent: "Excellent!",
    goodEffort: "Good effort!",
    keepPracticing: "Keep practicing!",
    questionReview: "Question Review:",
    question: "Question",
    yourAnswer: "Your answer:",
    correctAnswer: "Correct answer:",
    notAnswered: "Not answered",
    retryTest: "Retry Test",
    practiceTest: "Practice Test",
    questionCount: "Question {current} of {total}",
    true: "True",
    false: "False",
    typeAnswer: "Type your answer",
    multipleChoice: "Multiple Choice",
    trueFalse: "True/False",
    fillInBlank: "Fill in Blank",
  },

  // Saved tab
  savedReviews: "Saved Reviews",
  accessSavedGuides: "Access your saved study guides",
  reviewGuide: "Review Guide",
  viewReview: "View Review",
  created: "Created",

  // Study Chat tab
  flashcardSet: "Flashcard set",
  poweredBy: "Powered by",
  sendMessage: "Send a message",

  // Study Chat additional translations
  chat: {
    sendMessage: "Send a message...",
    clearHistory: "Clear Chat History",
    messageLimitReached: "You've reached the maximum conversation length",
    continueMessage:
      "To continue chatting effectively and avoid memory issues, please clear the conversation history using the button below.",
    premiumComing:
      "Coming soon: Our premium subscription will allow for longer conversations and access to your complete chat history!",
    askQuestionsDescription:
      "Ask questions about your flashcards, get explanations for concepts, receive study and retention tips, or learn about related topics. For testing your knowledge, use the Practice Tests feature.",
    welcomeMessage:
      'Hi! I am your study assistant for the "{setName}" flashcard set. I can help you understand concepts, provide additional context, or offer study tips related to these cards. What would you like to learn more about?',
    historyClearedMessage:
      "The conversation history has been cleared. We can continue discussing the {setName} flashcard set. What would you like to know?",
  },

  // Dashboard specific
  dashboard: {
    welcome: {
      title: "Welcome to StudyMate AI",
      subtitle:
        "Create personalized flashcards, take quizzes, and track your progress with AI-powered learning tools.",
      createNotes: "Create Notes",
      viewNotes: "View Notes",
      takeQuiz: "Take a Quiz",
    },
    stats: {
      title: "Practice Test Statistics",
      averageScore: "Average Score",
      testsCompleted: "Tests Completed",
      timePracticed: "Time Practiced",
      recentHistory: "Recent Test History",
      date: "Date",
      score: "Score",
      questions: "Questions",
      time: "Time",
      flashcardSet: "Flashcard Set",
    },
    performance: {
      title: "Performance Insights",
      areasForImprovement: "Areas for Improvement",
      recommendations: "Personalized Recommendations",
      accuracy: "accuracy",
      studyNow: "Study Now",
      reviewTopics: "Review these frequently missed topics",
      topicsToReview: "Topics to review",
      practiceMore: "Practice more {type} questions",
      focusOn: "Focus on reviewing {topic} ({accuracy}% accuracy)",
      streak: {
        title: "{count}-day Streak!",
        subtitle: "Keep up the great work! You're on fire! 🔥",
      },
      enhancedLearning: "Enhanced Learning",
      question: "Question",
      correctAnswer: "Correct Answer",
      aiExplanation: "AI Explanation",
      videoResources: "Video Resources",
      topicDetails: "Topic Details: {topic}",
    },
  },

  // Common buttons
  buttons: {
    create: "Create",
    save: "Save",
    delete: "Delete",
    cancel: "Cancel",
    edit: "Edit",
    back: "Back",
    next: "Next",
    previous: "Previous",
    submit: "Submit",
    clearChatHistory: "Clear Chat History",
    clearHistory: "Clear History",
    continue: "Continue",
    startPractice: "Start Practice",
    showAnswer: "Show Answer",
    hideAnswer: "Hide Answer",
    retry: "Try Again",
    exploreMoreLanguages: "Explore More Languages",
    createNotes: "CREATE NOTES",
    viewNotes: "VIEW NOTES",
    takeQuiz: "TAKE A QUIZ",
    viewFullPage: "View Full Page",
    read: "Read",
    watch: "Watch",
    viewDeletedNotes: "View Deleted Notes",
    takeAction: "Take Action",
    studyNow: "Study Now",
    practiceThisTopic: "Practice This Topic",
  },

  // Page titles
  titles: {
    dashboard: "Dashboard",
    flashcards: "Flashcards",
    createFlashcards: "Create Flashcards",
    editFlashcards: "Edit Flashcards",
    practice: "Practice Mode",
    studyChat: "Study Chat",
    review: "Review Content",
    settings: "Settings",
    performance: "Performance Analytics",
    quickActions: "Quick Actions",
    studyAchievement: "Study Achievement",
    studyGuide: "Study Guide",
    detailedNotes: "Detailed Notes",
    inDepthExplanations: "In-Depth Explanations",
    studyResources: "Study Resources",
    videoResources: "Video Resources",
    practiceMaterials: "Practice Materials",
    myNotes: "My Notes",
  },

  // Flashcards specific
  flashcards: {
    editSet: "Edit Set",
    updateNameAndTags: "Update Name and Tags",
    setName: "Set Name",
    addTags: "Add Tags",
    typeAndPressEnter: "Type and press Enter",
    created: "Created",
    confirmHide: "Are you sure you want to hide this flashcard set?",
    hideFailed: "Failed to hide flashcard set. Please try again.",
    enterName: "Please enter a name for your flashcard set.",
    nameExists:
      "A flashcard set with this name already exists. Please choose a different name.",
    invalidFormat: "Invalid flashcard format. Please try again.",
    updateFailed: "Failed to update flashcard set. Please try again.",
    cards: "cards",
    noMatching: "No matching flashcard sets found",
    adjustSearch: "Try adjusting your search or filters",
    backToNotes: "Back to Notes",
    noFlashcardsFound: "No flashcards found in this collection",
    untitledSet: "Untitled Set",
    cardCount: "Card {current} of {total}",
  },

  // Common messages
  messages: {
    loading: "Loading...",
    noResults: "No results found",
    confirmDelete: "Are you sure you want to delete this item?",
    saved: "Successfully saved!",
    error: "An error occurred. Please try again.",
    welcome: "Welcome to Flashcards App",
    selectFlashcardSet: "Select a flashcard set and start a conversation",
    emptyState: "Nothing here yet. Create your first item!",
    noteSetsCreated: "Note Sets Created",
    betaFeature:
      "This feature is in beta. The content generation is experimental and may not always produce perfect results.",
    searchNotes: "Search notes...",
  },

  // Common
  loading: "Loading...",
  save: "Save",
  cancel: "Cancel",
  back: "Back",
  next: "Next",
  previous: "Previous",
  finish: "Finish",

  // Study guide loading messages
  studyGuide: {
    loadingMessages: {
      analyzing: "Analyzing topic and generating comprehensive notes...",
      creating: "Creating detailed explanations and examples...",
      finding: "Finding relevant study resources and videos...",
      preparing: "Preparing practice materials...",
      finishing: "Almost there! Putting everything together...",
    },
  },

  // Review specific
  review: {
    description: "Deep dive into concepts you need to improve",
    introduction: "Introduction",
    mainConcept: "Main Concept",
    relatedConcepts: "Related Concepts",
    relatedArticles: "Related Articles",
    videoResources: "Video Resources",
  },

  // Landing page
  landing: {
    hero: {
      title: "Understand Anything With Ease",
      subtitle:
        "Unleash your potential with AI-powered flashcards, smart notes, personalized learning analytics & more",
      getStarted: "Get Started",
      signUp: "Sign Up For Free",
    },
    features: {
      title: "Cutting-Edge Features",
      smartNotes: {
        title: "Smart Notes",
        description:
          "AI-driven note generation creates concise, impactful study materials.",
      },
      adaptiveReview: {
        title: "Adaptive Review",
        description:
          "Personalized learning schedules maximize retention and efficiency.",
      },
      deepAnalytics: {
        title: "Deep Analytics",
        description:
          "Actionable insights track progress and optimize study focus.",
      },
    },
    blueprint: {
      title: "Your Learning Blueprint",
      steps: [
        {
          number: "01",
          title: "Input Content",
          description:
            "Upload text, PDFs, or images effortlessly with our intuitive interface.",
        },
        {
          number: "02",
          title: "AI Transformation",
          description:
            "Advanced AI converts your content into optimized study resources.",
        },
        {
          number: "03",
          title: "Master Concepts",
          description:
            "Learn smarter with adaptive, personalized review sessions.",
        },
      ],
    },
    testimonials: {
      title: "Voices of Success",
      people: [
        {
          name: "James Blay",
          role: "Engineering Student",
          quote:
            "This platform transformed my study routine, doubling my efficiency!",
        },
        {
          name: "Gina Lucy",
          role: "HR Manager of a Company",
          quote:
            "AI flashcards streamlined our employee training process, making onboarding faster and more engaging.",
        },
        {
          name: "Duvor William",
          role: "Working Professional",
          quote:
            "Balancing work and upskilling was tough, but this tool made learning efficient and flexible.",
        },
      ],
    },
    cta: {
      title: "Memorization Journey",
      description:
        "Join thousands of learners revolutionizing their memorization skills with our cutting-edge AI tools. Start today and unlock your full potential!",
      button: "Launch Your Success",
    },
  },
};

export default en;
