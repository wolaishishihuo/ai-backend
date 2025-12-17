import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';

export default tseslint.config(
  // 全局忽略
  {
    ignores: ['dist/**', 'node_modules/**', '*.config.mjs', '*.config.js']
  },

  // 基础配置
  eslint.configs.recommended,

  // TypeScript 配置
  ...tseslint.configs.recommended,

  // Prettier 配置
  eslintPluginPrettierRecommended,

  // 项目配置
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest
      },
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname
      }
    },
    rules: {
      '@typescript-eslint/interface-name-prefix': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off'
    }
  }
);
