// @ts-check
import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import reactPlugin from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import jsxA11y from 'eslint-plugin-jsx-a11y'

export default [
	{
		ignores: ['node_modules/**', 'dist/**', 'dist-server/**', 'public/**', '**/*.d.ts'],
	},
	js.configs.recommended,
	...tseslint.configs.recommended,
	reactPlugin.configs.flat.recommended,
	{
		name: 'base',
		languageOptions: {
			ecmaVersion: 2022,
			sourceType: 'module',
			globals: { ...globals.browser, ...globals.node },
		},
		settings: { react: { version: 'detect' } },
		plugins: { 'react-hooks': reactHooks, 'jsx-a11y': jsxA11y },
			rules: {
			'react/react-in-jsx-scope': 'off',
			'react/jsx-uses-react': 'off',
			'react/prop-types': 'off',
			'react-hooks/rules-of-hooks': 'error',
			'react-hooks/exhaustive-deps': 'warn',
				'react/no-unknown-property': 'off',
			eqeqeq: ['error', 'always'],
			'no-alert': 'warn',
			'no-eval': 'error',
			'no-implied-eval': 'error',
				'no-console': ['warn', { allow: ['error', 'warn', 'info'] }],
				'@typescript-eslint/no-explicit-any': 'warn',
				'no-empty': ['error', { allowEmptyCatch: true }],
		},
	},
]
