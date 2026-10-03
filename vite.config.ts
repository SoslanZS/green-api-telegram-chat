import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
	// GitHub Pages serves the app from /<repo>/, locally it's /
	base: process.env.GITHUB_ACTIONS ? '/green-api-telegram-chat/' : '/',
	plugins: [react()],
	resolve: {
		alias: {
			'@': fileURLToPath(new URL('./src', import.meta.url)),
		},
	},
	css: {
		preprocessorOptions: {
			scss: {
				api: 'modern',
				// variables and mixins are available in every .scss file without manual imports
				additionalData: '@use "@/styles/base/variables" as *;\n@use "@/styles/base/mixins" as *;\n',
			},
		},
	},
	test: {
		environment: 'node',
	},
});
