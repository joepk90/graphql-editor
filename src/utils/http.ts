export const plainTextHeader = { 'Content-Type': 'text/plain' };
export const jsonHeader = { 'Content-Type': 'application/json' };
export const NotFoundError = '404 (Not found)';

export const isNotFoundError = (error: unknown) => (error as Error)?.message === NotFoundError;
