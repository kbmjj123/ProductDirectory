import matter from 'gray-matter'

export interface ProductImage {
  url: string
    thumb: string
}

export interface MultiLang {
  en: string
  zh: string
  es: string
  fr: string
}

export interface Product {
  id: string
  slug: string
  categoryId: string
  published: boolean
  createdAt: string
  updatedAt: string
  images: ProductImage[]
  title: MultiLang
  description: MultiLang
}

export interface Category {
  id: string
  slug: string
  order: number
  name: MultiLang
}

/**
 * 解析产品 Markdown 文件为对象（使用 gray-matter 升级）
 */
export function parseProductMarkdown(raw: string): Product {
  const result = matter(raw)
  
  // 兼容原有逻辑：没有 frontmatter 时抛出错误
  if (Object.keys(result.data).length === 0) {
    throw new Error('无效的产品文件格式')
  }
	console.info(result)
  return result.data as Product
}

/**
 * 将产品对象序列化为 Markdown（gray-matter 提供标准 YAML 输出）
 */
export function productToMarkdown(product: Product): string {
  return matter.stringify('', product)
}

/** 生成 UUID v4 */
export function generateId(): string {
  return crypto.randomUUID()
}

/** 将字符串转换为 URL 友好的 slug */
export function toSlug(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/[^\w-]/g, '')
    .replace(/--+/g, '-')
}