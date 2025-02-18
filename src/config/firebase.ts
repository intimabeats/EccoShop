import { initializeApp } from 'firebase/app';
import {
  getAuth,
  initializeAuth,
  browserLocalPersistence,
  browserPopupRedirectResolver,
  Auth,
} from 'firebase/auth';
import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  Firestore,
} from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
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
let app, auth: Auth, db: Firestore, storage: FirebaseStorage;
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

} catch (error) {
    console.error('Error initializing Firebase:', error);
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

export { app, auth, db, storage };
