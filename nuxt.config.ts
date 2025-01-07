// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    compatibilityDate: '2024-04-03',
    devtools: { enabled: false },
    modules: [
        "@nuxt/icon",
        "@nuxtjs/google-fonts",
        "@pinia/nuxt",
        "@pinia-plugin-persistedstate/nuxt",
        "nuxt-swiper",
        '@nuxtjs/pwa',
    ],
    css: ["~/static/css/base.css", "~/static/css/tailwind.css"],

    pwa: {
        icon: {
            source: "~/public/favicon.png",
        },

        manifest: {
            name: "ThermoTrack",
            short_name: "ThermoTrack",
            description: "ThermoTrack is a thermal contraception tracking PWA",
            theme_color: "#e9ecef",
            lang: "fr",
            background_color: "#e9ecef",
            scope: "/",
            icons: [
                {
                    src: "/favicon.png",
                    sizes: "512x512",
                    type: "image/png",
                },
            ],
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
