import { defineCollection, defineContentConfig, z } from '@nuxt/content'

// 多语言字段结构
const multiLang = z.object({
  en: z.string().default(''),
  zh: z.string().default(''),
  es: z.string().default(''),
  fr: z.string().default(''),
})

// 产品图片结构
const productImage = z.object({
  url: z.string(),
    thumb: z.string().default(''),
})

export default defineContentConfig({
  collections: {
    // 分类集合：读取 content/categories.json
    categories: defineCollection({
      type: 'data',
      source: 'categories.json',
      schema: z.object({
        categories: z.array(
          z.object({
            id: z.string(),
            slug: z.string(),
            order: z.number().default(0),
            name: multiLang,
          }),
        ).default([]),
      }),
    }),

    // 产品集合：读取 content/products/*.md
    products: defineCollection({
      type: 'page',
      source: 'products/*.md',
      schema: z.object({
        id: z.string(),
        slug: z.string(),
        categoryId: z.string().default(''),
        published: z.boolean().default(false),
        createdAt: z.string().default(''),
        updatedAt: z.string().default(''),
        images: z.array(productImage).default([]),
        title: multiLang,
        description: multiLang,
      }),
    }),
  },
})