import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../config/firebase';

export const uploadImage = async (
  file: File,
  path: string
): Promise<string> => {
  try {
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw new Error('Falha ao fazer upload da imagem');
  }
};

export const deleteImage = async (path: string): Promise<void> => {
  try {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
  } catch (error) {
    console.error('Error deleting image:', error);
    throw new Error('Falha ao deletar imagem');
  }
};

export const getImagePath = (url: string): string => {
  try {
    const decodedUrl = decodeURIComponent(url);
    const pathRegex = /o\/(.*?)\?/;
    const match = decodedUrl.match(pathRegex);
    return match ? match[1] : '';
  } catch (error) {
    console.error('Error getting image path:', error);
    return '';
  }
};

export const isValidImageType = (file: File): boolean => {
  const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  return validTypes.includes(file.type);
};

export const isValidImageSize = (file: File, maxSizeInMB: number = 5): boolean => {
  const maxSize = maxSizeInMB * 1024 * 1024; // Convert MB to bytes
  return file.size <= maxSize;
};
