const env = {
  firebase: {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
  },
  abacatePay: {
    apiKey: import.meta.env.VITE_ABACATE_PAY_API_KEY,
    apiUrl: import.meta.env.VITE_ABACATE_PAY_API_URL,
  },
  app: {
    name: import.meta.env.VITE_APP_NAME,
    url: import.meta.env.VITE_APP_URL,
    env: import.meta.env.VITE_APP_ENV,
  },
} as const;

export { env };
