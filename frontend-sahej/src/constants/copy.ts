export const copy = {
  home: {
    title: "Sahej",
    subtitle: "Pause before you proceed.",
    placeholder: "What are you about to say, send, or do?",
    primaryAction: "Reflect",
    validation: "Please enter a thought before continuing.",
    footer: "A calm check-in before action."
  },
  reflect: {
    eyebrow: "Step 2",
    title: "Hold for a breath.",
    subtitle: "Stillness helps the mirror see more clearly.",
    countdownLabel: "Breathe...",
    listeningLabel: "Listening...",
    stillnessTitle: "Calm down",
    stillnessBody: "It's okay. Let's slow down together.",
    unsupportedSensors: "Stillness sensing is unavailable on this device. The pause will continue without it.",
    missingThoughtTitle: "Nothing to reflect yet.",
    missingThoughtBody: "Return home, enter a thought, and begin again.",
    missingThoughtAction: "Back to home"
  },
  result: {
    eyebrow: "Step 3",
    title: "Your mirror",
    subtitle: "A reflection after the pause.",
    fallbackTitle: "Connection softened",
    missingTitle: "No reflection available yet.",
    missingBody: "Return home and begin a fresh reflection to see your mirror.",
    primaryAction: "Back to home",
    journalAction: "Open history"
  },
  journal: {
    title: "History Logs",
    subtitle: "Your timeline of reflections and feeling logs.",
    topEmotion: "Top recent emotion",
    topPattern: "Top recent pattern",
    emptyTitle: "No entries yet.",
    emptyBody: "Complete a reflection or log a feeling to start your history.",
    logBadge: "feeling",
    reflectBadge: "reflect",
    detailAction: "Expand into note"
  },
  logFeeling: {
    title: "Log Feeling",
    subtitle: "How are you feeling right now?",
    pickEmotion: "Primary emotion",
    pickIntensity: "Intensity",
    notePlaceholder: "Optional note...",
    saveAction: "Save feeling",
    viewJournalAction: "View journal",
    savedMessage: "Feeling logged. You can revisit it in History Logs."
  },
  graph: {
    title: "Thought Map",
    subtitle: "A visual memory of reflections and notes.",
    emptyTitle: "No nodes yet.",
    emptyBody: "As reflections build up, your map appears here.",
    reflectionLegend: "Reflection node",
    noteLegend: "Note node"
  },
  notes: {
    title: "Notes",
    subtitle: "Your calm second-brain workspace.",
    newAction: "New note",
    emptyTitle: "No notes yet.",
    emptyBody: "Create your first note or expand a reflection into one.",
    linkedPrefix: "Linked reflection:"
  },
  noteEditor: {
    titlePlaceholder: "Note title",
    bodyPlaceholder: "Write your reflection, insight, or plan...",
    tagsPlaceholder: "Tags (comma separated)",
    saveAction: "Save note",
    deleteAction: "Delete note",
    linkedHint: "Pre-filled from journal reflection."
  },
  settings: {
    title: "Settings",
    subtitle: "Tune the app to your pace.",
    themeTitle: "Appearance",
    themeBody: "Switch between dark and light modes.",
    toggleAction: "Toggle theme",
    hapticsTitle: "Haptics check",
    hapticsBody: "Use this tiny tester on a real phone to verify vibration intensity.",
    hapticsCalmAction: "Test Calm",
    hapticsStrongAction: "Test Strong",
    hapticsLightAction: "Test Light",
    demoSeedTitle: "Demo data reset",
    demoSeedBody: "Clear current local data, then seed rich History Logs, Graph, Notes, and Emotions demo content.",
    demoSeedAction: "Reset and seed demo data"
  },
  shared: {
    capturedThought: "Captured thought"
  }
} as const;
