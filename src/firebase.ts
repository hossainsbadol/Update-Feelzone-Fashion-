import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager, 
  memoryLocalCache, 
  clearIndexedDbPersistence 
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);

let firestoreInstance: any;
let cacheStrategyUsed = 'persistent';

// Highly advanced cellular and iframe fail-safe:
// Some mobile browsers on mobile networks (Grameenphone, Robi, Teletalk, Banglalink) under strict environments
// or inside iframes (third-party storage partitioning in iOS Safari / Chrome) block IndexedDB, which causes 
// Firestore's persistent cache to loop indefinitely or crash the application.
// We auto-detect this and fallback seamlessly to high-speed memoryLocalCache.
let preferMemoryCache = false;
if (typeof window !== 'undefined') {
  const inIframe = window.self !== window.top;
  let hasIndexedDB = false;
  try {
    hasIndexedDB = !!window.indexedDB;
  } catch (e) {
    hasIndexedDB = false;
  }
  
  if (inIframe || !hasIndexedDB) {
    preferMemoryCache = true;
  }
}

if (!preferMemoryCache) {
  try {
    firestoreInstance = initializeFirestore(app, {
      experimentalForceLongPolling: true,
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager()
      })
    }, firebaseConfig.firestoreDatabaseId);
    cacheStrategyUsed = 'persistent';
  } catch (e) {
    console.warn("Firestore persistent local cache boot failed. Falling back to memoryLocalCache.", e);
  }
}

if (!firestoreInstance) {
  try {
    firestoreInstance = initializeFirestore(app, {
      experimentalForceLongPolling: true,
      localCache: memoryLocalCache()
    }, firebaseConfig.firestoreDatabaseId);
    cacheStrategyUsed = 'memory';
  } catch (e) {
    console.error("Firestore memory local cache boot failed, trying default fallback configuration.", e);
    firestoreInstance = initializeFirestore(app, {}, firebaseConfig.firestoreDatabaseId);
    cacheStrategyUsed = 'default';
  }
}

export const db = firestoreInstance; /* CRITICAL: The app will break without this line */

// Self-healing: If there was a previous write-exhaustion state, force-clear the IndexedDB once.
if (typeof window !== 'undefined') {
  const cacheKey = 'feelzone_clear_cache_v2';
  try {
    if (localStorage.getItem(cacheKey) !== 'true') {
      localStorage.setItem(cacheKey, 'true');
      clearIndexedDbPersistence(db).then(() => {
        console.log('⚡ Firestore IndexedDB cleared successfully to prevent queue exhaustion.');
      }).catch((err) => {
        console.warn('Failed to clear Firestore IndexedDB:', err);
      });
    }
  } catch (e) {
    console.error('Local cache clearance failed:', e);
  }
}

export const auth = getAuth();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  // DO NOT THROW here! Throwing an exception on snapshot listeners or unresolved promises has a high chance of crashing/halting the react render loop on poor mobile connectivity.
  // Instead, we log it and fail-safe gracefully so that offline/cached memory takes over perfectly.
}
