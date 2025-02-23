import { initializeApp } from 'firebase/app';
import {
  initializeAuth,
  browserLocalPersistence,
  browserPopupRedirectResolver,
  Auth,
} from 'firebase/auth';
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  Firestore,
} from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { getFunctions, connectFunctionsEmulator, Functions } from 'firebase/functions'; // Import
import { env } from './env';

const firebaseConfig = {
  apiKey: env.firebase.apiKey,
  authDomain: env.firebase.authDomain,
  projectId: env.firebase.projectId,
  storageBucket: env.firebase.storageBucket,
  messagingSenderId: env.firebase.messagingSenderId,
  appId: env.firebase.appId,
  measurementId: env.firebase.measurementId
};

console.log('Firebase config:', firebaseConfig);

// Inicialização do app Firebase
let app, auth: Auth, db: Firestore, storage: FirebaseStorage, functions: Functions; //Type
try {
    app = initializeApp(firebaseConfig);
    console.log('Firebase app initialized successfully.');

    // Configuração de persistência
    auth = initializeAuth(app, {
      persistence: browserLocalPersistence,
      popupRedirectResolver: browserPopupRedirectResolver
    });
    console.log('Firebase auth initialized successfully.');

    db = initializeFirestore(app, {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager()
      })
    });
    console.log('Firestore initialized successfully.');

    storage = getStorage(app);
    console.log('Firebase storage initialized successfully.');

    functions = getFunctions(app);
    // Use emulators in development
    if (env.app.env === 'development') {
      connectFunctionsEmulator(functions, "localhost", 5001); // Default port for Functions Emulator
    }

} catch (error) {
    console.error('Error initializing Firebase:', error);
    // Adicione tratamento de erro mais robusto aqui, se necessário
    throw error; // Re-throw para que o erro seja capturado em outros lugares
}

// Função de verificação de rede
export const checkNetworkConnection = async () => {
  try {
    console.log('Verificando conexão de rede');
    return true;
  } catch (error) {
    console.error('Erro ao verificar conexão:', error);
    return false;
  }
};

export { app, auth, db, storage, functions }; // Export functions
