import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import reactHooks from 'eslint-plugin-react-hooks';
import storybook from 'eslint-plugin-storybook';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist', 'storybook-static', 'coverage', '!.storybook'] },
  js.configs.recommended,
  tseslint.configs.strict,
  reactHooks.configs.flat['recommended-latest'],
  jsxA11y.flatConfigs.recommended,
  storybook.configs['flat/recommended'],
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
    rules: {
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
  // Contracts: docs/contracts/component-styling.md#no-inline-style,
  // docs/contracts/client-directive.md#use-client-for-hooks
  {
    files: ['src/components/**/*.{ts,tsx}'],
    ignores: ['src/components/**/*.stories.tsx', 'src/components/**/*.test.tsx'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: 'JSXAttribute[name.name="style"]',
          message:
            'No inline styles in components — see docs/contracts/component-styling.md#no-inline-style',
        },
        {
          selector:
            'Program:not(:has(ExpressionStatement[directive="use client"])) CallExpression:matches([callee.name=/^(use|use[A-Z][A-Za-z0-9]*|createContext)$/], [callee.property.name=/^(use|use[A-Z][A-Za-z0-9]*|createContext)$/])',
          message:
            "Hook/createContext call needs 'use client' at the top of the module — see docs/contracts/client-directive.md#use-client-for-hooks",
        },
      ],
    },
  },
  prettier,
);
