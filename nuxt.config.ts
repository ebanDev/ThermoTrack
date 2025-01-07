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
      registerType: 'autoUpdate',
      manifest: {
        name: "ThermoTrack",
        short_name: "ThermoTrack",
        description: "ThermoTrack is a thermal contraception tracking PWA",
        theme_color: "#e9ecef",
        background_color: "#f3f3f3",
        lang: "fr",
        display: "standalone",
        start_url: "/",
        icons: [
          {
            src: "/favicon.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
      workbox: {
        cleanupOutdatedCaches: true,
        navigateFallback: '/en-US',
        globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
        globIgnores: ['storybook/**.*', 'storybook/**/**.*'],
      },
      client: {
        installPrompt: true,
        periodicSyncForUpdates: 3600,
      },
      devOptions: {
        enabled: false,
        type: 'module',
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
