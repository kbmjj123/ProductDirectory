// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2026-01-01',
  devtools: { enabled: true },

  modules: [
    '@nuxt/content',
    '@nuxtjs/i18n',
    '@nuxtjs/tailwindcss',
  ],
	tailwindcss: {
    cssPath: "~/app/assets/css/tailwind.css"
  },
  // SSG 静态站点生成
  ssr: true,

  nitro: {
		preset: "static",
		static: true,
		prerender: {
			autoSubfolderIndex: false
		}
	},

  // 运行时配置（环境变量）
  runtimeConfig: {
    public: {
      adminUsername: process.env.NUXT_PUBLIC_ADMIN_USERNAME || '',
      adminPasswordHash: process.env.NUXT_PUBLIC_ADMIN_PASSWORD_HASH || '',
      githubOwner: process.env.NUXT_PUBLIC_GITHUB_OWNER || '',
      githubRepo: process.env.NUXT_PUBLIC_GITHUB_REPO || '',
      githubBranch: process.env.NUXT_PUBLIC_GITHUB_BRANCH || 'main',
      imgbbApiKey: process.env.NUXT_PUBLIC_IMGBB_API_KEY || '',
    },
  },

  // Nuxt Content 配置
  content: {
    sources: {
      content: {
        driver: 'fs',
        prefix: '/content',
        base: './content',
      },
    },
  },

  // i18n 配置
  i18n: {
    strategy: 'prefix_except_default',
    defaultLocale: 'en',
    locales: [
      { code: 'en', language: 'en-US', name: 'English', file: 'en.json' },
      { code: 'zh', language: 'zh-CN', name: '中文', file: 'zh.json' },
      { code: 'es', language: 'es-ES', name: 'Español', file: 'es.json' },
      { code: 'fr', language: 'fr-FR', name: 'Français', file: 'fr.json' },
    ],
    langDir: 'locales/',
		detectBrowserLanguage: {
			useCookie: true,
			cookieKey: 'i18n_redirected',
			redirectOn: 'root'
		},
		compilation: { strictMessage: false, escapeHtml: false }
  },

  // 路由规则：后台页面不参与 SSG
  routeRules: {
    '/admin/**': { ssr: false },
  },

  app: {
    head: {
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
    },
  },
	vite: {
    optimizeDeps: {
      include: []
    }
  }
})