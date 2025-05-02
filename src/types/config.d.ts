export {};

declare global {
  interface Window {
    __RUNTIME_CONFIG__: {
      VITE_API_URL?: string;
      [key: string]: any;
    };
  }
}
