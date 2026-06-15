export const SYMPTOM_CATEGORIES = [
  { id: 'flow', label: 'Flow', icon: '💧' },
  { id: 'pain', label: 'Pain', icon: '😫' },
  { id: 'mood', label: 'Mood', icon: '🎭' },
  { id: 'energy', label: 'Sleep', icon: '😴' },
  { id: 'body', label: 'Body', icon: '🎈' },
  { id: 'sex', label: 'Sex', icon: '❤️' },
];

export const SYMPTOMS_BY_CATEGORY: Record<string, any[]> = {
  flow: [
    { id: 0, label: 'None', icon: '⚪' },
    { id: 1, label: 'Spotting', icon: '💧' },
    { id: 2, label: 'Light', icon: '💧💧' },
    { id: 3, label: 'Medium', icon: '💧💧💧' },
    { id: 4, label: 'Heavy', icon: '🩸' },
  ],
  pain: [
    { id: 'cramps', label: 'Cramps', icon: '😫' },
    { id: 'headache', label: 'Headache', icon: '🤕' },
    { id: 'backache', label: 'Backache', icon: '🦴' },
    { id: 'tender_breasts', label: 'Tender Breasts', icon: '👙' },
  ],
  mood: [
    { id: 'balanced', label: 'Balanced', icon: '⚖️' },
    { id: 'anxious', label: 'Anxious', icon: '😰' },
    { id: 'sad', label: 'Sad', icon: '😢' },
    { id: 'irritable', label: 'Irritable', icon: '😠' },
    { id: 'high_energy', label: 'High Energy', icon: '⚡' },
  ],
  energy: [
    { id: 'deep_sleep', label: 'Deep Sleep', icon: '🌙' },
    { id: 'insomnia', label: 'Insomnia', icon: '👁️' },
    { id: 'exhausted', label: 'Exhausted', icon: '🔋' },
    { id: 'restless', label: 'Restless', icon: '🏃' },
  ],
  body: [
    { id: 'bloating', label: 'Bloating', icon: '🎈' },
    { id: 'nausea', label: 'Nausea', icon: '🤢' },
    { id: 'cravings_sweet', label: 'Sweet Cravings', icon: '🍫' },
    { id: 'cravings_salty', label: 'Salty Cravings', icon: '🥨' },
  ],
  sex: [
    { id: 'unprotected', label: 'Unprotected', icon: '🔓' },
    { id: 'protected', label: 'Protected', icon: '🔒' },
    { id: 'no_sex', label: 'No Sex', icon: '🚫' },
    { id: 'high_libido', label: 'High Libido', icon: '🔥' },
  ],
};

export const PAIN_LEVELS = [
  { id: 1, label: 'Mild', color: '#FFF5F5' },
  { id: 2, label: 'Moderate', color: '#FED7D7' },
  { id: 3, label: 'Severe', color: '#FEB2B2' },
];

export const PHASE_COLORS: Record<string, string> = {
  'Menstrual': '#FF7675',
  'Follicular': '#A29BFE',
  'Ovulatory': '#FAB1A0',
  'Luteal': '#55E6C1',
};

export const PHASE_INSIGHTS: Record<string, { title: string, desc: string }> = {
  'Menstrual': {
    title: 'Rest and Recharge',
    desc: 'Your hormone levels are at their lowest. It is a great time for gentle movement and extra sleep.'
  },
  'Follicular': {
    title: 'Energy levels are rising',
    desc: 'Estrogen is increasing, which often leads to higher energy, better mood, and increased creativity.'
  },
  'Ovulatory': {
    title: 'Peak Social Energy',
    desc: 'You are likely feeling most confident and social right now. Great for important meetings or dates.'
  },
  'Luteal': {
    title: 'Turning Inward',
    desc: 'Progesterone is rising. You might feel more introverted. Focus on self-care and finishing tasks.'
  },
};
