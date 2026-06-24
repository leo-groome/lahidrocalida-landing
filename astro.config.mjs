// @ts-check
import { defineConfig } from 'astro/config';
import vue from '@astrojs/vue';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  integrations: [vue(), sitemap()],
  // TODO: cambiar a https://lahidrocalida.mx cuando el dominio esté activo
  site: 'https://lahidrocalida-landing.vercel.app',
});
