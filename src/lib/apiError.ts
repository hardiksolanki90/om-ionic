import { isAxiosError } from 'axios';

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (isAxiosError(error)) {
    const data = error.response?.data as { message?: string } | string | undefined;
    if (typeof data === 'string' && data.length > 0) {
      return data;
    }
    if (data && typeof data === 'object' && typeof data.message === 'string') {
      return data.message;
    }
    if (error.response?.status === 404) {
      return 'API route not found. Confirm om-laravel is running and reporting routes are deployed.';
    }
    if (error.response?.status === 401) {
      return 'Session expired. Please sign in again.';
    }
    if (error.response?.status === 500) {
      return 'Server error — usually the reporting migration has not been applied. Run: php artisan migrate';
    }
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
}
