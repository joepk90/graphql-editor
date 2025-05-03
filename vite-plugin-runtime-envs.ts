import { Plugin } from 'vite';

/**
 * runetimeEnvPlugin
 *
 * This plugin makes specified environment variables available at run time.
 *
 * At build a env.runtime.js is created with the spefified environment variables, and
 * the script is injected into the index.html file.
 *
 * An entrypoint.js script is then used to serve the applicationn and replaces the specified environment variables
 * with environemnt variables defined at run time.
 *
 *
 * TODO: This should be converted into an npm plugin
 */

interface PluginOptions {
  publicEnvKeys: string[];
  outputFile?: string;
}

export default function runtimeEnvPlugin({
  publicEnvKeys = [],
  outputFile = 'env.runtime.js',
}: PluginOptions): Plugin {
  return {
    name: 'vite-plugin-runtime-env',

    transformIndexHtml(html) {
      if (process.env.NODE_ENV !== 'production') {
        return html; // No-op during dev
      }

      return html.replace('</head>', `  <script src=\"/${outputFile}\"></script>\n</head>`);
    },

    generateBundle(_, bundle) {
      const filteredEnv: Record<string, string> = {};

      publicEnvKeys.forEach((key) => {
        filteredEnv[key] = `__${key}__`;
      });

      const output = `window.__RUNTIME_ENV__ = ${JSON.stringify(filteredEnv, null, 2)};`;

      // Inject env.runtime.js directly into the output bundle
      bundle[outputFile] = {
        fileName: outputFile,
        type: 'asset',
        source: output,
        name: outputFile,
        needsCodeReference: false,
      } as import('rollup').OutputAsset;
    },
  };
}
