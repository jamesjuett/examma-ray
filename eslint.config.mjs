import eslint from '@eslint/js';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';

export default defineConfig(
  {
    ignores: ['dist/**', 'node_modules/**', 'cypress/**', 'docs/**', 'docs-src/**', 'template/**'],
  },
  // eslint.configs.recommended,
  // tseslint.configs.recommendedTypeChecked,
  // tseslint,
  tseslint.configs.base,
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.mts', '**/*.cts'],
    rules: {
      "@typescript-eslint/restrict-template-expressions": ["error", {
        "allowNumber": false,
        "allowBoolean": true,
      }],
    },
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
);