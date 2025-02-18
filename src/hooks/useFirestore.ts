import { useState, useEffect } from 'react';
import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  QueryConstraint,
  DocumentData,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useLoading } from '../contexts/LoadingContext';
import { useNotification } from '../contexts/NotificationContext';
import { handleApiError } from '../utils/errorHandler';

interface UseFirestoreOptions {
  collectionName: string;
  queries?: QueryConstraint[];
  dependencies?: any[];
}

export function useFirestore<T = DocumentData>({
  collectionName,
  queries = [],
  dependencies = [],
}: UseFirestoreOptions) {
  const [data, setData] = useState<T[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const { showLoading, hideLoading } = useLoading();
  const { showNotification } = useNotification();

  useEffect(() => {
    const fetchData = async () => {
      try {
        showLoading();
        const q = query(collection(db, collectionName), ...queries);
        const querySnapshot = await getDocs(q);
        const documents = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as T[];
        setData(documents);
        setError(null);
      } catch (err) {
        const errorMessage = await handleApiError(err);
        setError(new Error(errorMessage));
        showNotification(errorMessage, 'error');
      } finally {
        hideLoading();
      }
    };

    fetchData();
  }, [...dependencies]);

  return { data, error };
}

// Usage example:
// const { data: products, error } = useFirestore<Product>({
//   collectionName: 'products',
//   queries: [orderBy('createdAt', 'desc'), limit(10)],
//   dependencies: [],
// });
