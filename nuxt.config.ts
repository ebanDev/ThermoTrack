// https://nuxt.com/docs/api/configuration/nuxt-config
import process from 'node:process'

const sw = process.env.SW === 'true'

export default defineNuxtConfig({
    compatibilityDate: '2024-04-03',
    devtools: { enabled: false },
    modules: [
      "@nuxt/icon",
      "@nuxtjs/google-fonts",
      "@pinia/nuxt",
      "@pinia-plugin-persistedstate/nuxt",
      "nuxt-swiper",
      "@vite-pwa/nuxt",
    ],
    css: ["~/static/css/base.css", "~/static/css/tailwind.css"],

    pwa: {
        strategies: sw ? 'injectManifest' : 'generateSW',
        srcDir: sw ? 'service-worker' : undefined,
        filename: sw ? 'sw.ts' : undefined,
        registerType: 'autoUpdate',
        manifest: {
          name: 'ThermoTrack',
          short_name: 'ThermoTrack',
          theme_color: '#e9ecef',
          icons: [
            {
              src: 'favicon.png',
              sizes: '192x192',
              type: 'image/png',
            },
            {
              src: 'favicon.png',
              sizes: '512x512',
              type: 'image/png',
            },
            {
              src: 'favicon.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable',
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
        },
        injectManifest: {
          globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
        },
        client: {
          installPrompt: true,
        },
    },

    app: {
        head: {
            title: "ThermoTrack",
            meta: [
                {
                    charset: "utf-8",
                },
                {
                    name: "viewport",
                    content: "width=device-width, initial-scale=1",
                },
                {
                    name: "description",
                    content: "ThermoTrack is a thermal contraception tracking PWA",
                },
                {
                    name: "theme-color",
                    content: "#e9ecef",
                }
            ],
            link: [
                { rel: "apple-touch-icon", href: "/favicon.png" },
                { rel: "manifest", href: "/manifest.json" },
            ]
        },

        pageTransition: {
            name: 'page', mode: 'out-in'
        },
    },

    googleFonts: {
        families: {
            Inter: [400, 500, 600, 700, 800],
        }
    },

    ssr: false,

    piniaPersistedstate: {
        storage: 'localStorage',
    },

    postcss: {
        plugins: {
            tailwindcss: {},
            autoprefixer: {},
        },
    },

    build: {
        transpile: ['konsta'],
    },
})
