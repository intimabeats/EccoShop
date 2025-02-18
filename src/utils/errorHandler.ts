import { FirebaseError } from 'firebase/app';

export const getErrorMessage = (error: unknown): string => {
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        return 'Email ou senha incorretos';
      case 'auth/too-many-requests':
        return 'Muitas tentativas de login. Tente novamente mais tarde';
      case 'auth/email-already-in-use':
        return 'Este email já está em uso';
      default:
        return 'Ocorreu um erro. Tente novamente';
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Ocorreu um erro inesperado';
};

export const handleApiError = async (error: unknown) => {
  // Log error to monitoring service (e.g., Sentry)
  console.error('API Error:', error);

  // Handle specific API errors
  if (error instanceof Response) {
    try {
      const data = await error.json();
      return data.message || 'Erro na requisição';
    } catch {
      return `Erro ${error.status}: ${error.statusText}`;
    }
  }

  return getErrorMessage(error);
};
