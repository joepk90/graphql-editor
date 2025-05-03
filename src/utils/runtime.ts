const isBrowser = () => typeof window !== 'undefined';
const hasRuntimeObject = () => window?.__RUNTIME_ENV__;

export const getRuntimeEnvVar = (key: string): string | undefined => {
  const isBrowserActive = isBrowser();
  const isRuntimeActive = hasRuntimeObject();

  if (!isBrowserActive || !isRuntimeActive) {
    return undefined;
  }

  const hasKey = Object.prototype.hasOwnProperty.call(window.__RUNTIME_ENV__, key);

  if (!hasKey) {
    return undefined;
  }

  return window.__RUNTIME_ENV__[key];
};
