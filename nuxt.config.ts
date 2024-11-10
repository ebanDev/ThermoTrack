// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    compatibilityDate: '2024-04-03',
    devtools: { enabled: false },
    modules: [
        "@nuxt/icon",
        "@nuxtjs/google-fonts",
        "@pinia/nuxt",
        "@pinia-plugin-persistedstate/nuxt",
    ],
    css: ["~/static/css/base.css"],

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
                    content: "Mimi is a couple app",
                },
                {
                    name: "theme-color",
                    content: "#ba6296",
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
})
