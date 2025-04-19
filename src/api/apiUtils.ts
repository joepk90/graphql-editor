export const NotFoundError = '404 (Not found)';

export const isNotFoundError = (error: unknown) => (error as Error)?.message === NotFoundError;
