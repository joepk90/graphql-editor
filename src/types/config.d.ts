export {};

declare global {
  interface Window {
    __RUNTIME_ENV__: {
      [key: string]: any;
    };
  }
}
