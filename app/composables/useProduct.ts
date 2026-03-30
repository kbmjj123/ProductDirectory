/**
 * useProduct — 产品 Markdown 与对象互转
 */

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

/** 解析产品 Markdown 文件为对象 */
export function parseProductMarkdown(raw: string): Product {
  // 提取 frontmatter（--- 之间的部分）
  const match = raw.match(/^---\n([\s\S]*?)\n---/)
  if (!match) throw new Error('无效的产品文件格式')

  // 简单的 YAML 解析（避免引入额外依赖）
  const yaml = match[1]
  return parseSimpleYaml(yaml) as Product
}

/** 将产品对象序列化为 Markdown */
export function productToMarkdown(product: Product): string {
  const yaml = stringifySimpleYaml(product)
  return `---\n${yaml}---\n`
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

// ─── 简单 YAML 序列化（满足本项目结构即可） ───

function stringifySimpleYaml(obj: Record<string, unknown>, indent = 0): string {
  const pad = '  '.repeat(indent)
  let out = ''

  for (const [key, val] of Object.entries(obj)) {
    if (val === null || val === undefined) continue

    if (typeof val === 'boolean' || typeof val === 'number') {
      out += `${pad}${key}: ${val}\n`
    }
    else if (typeof val === 'string') {
      // 多行字符串或包含特殊字符时用引号
      if (val.includes('\n') || val.includes(':') || val.includes('"')) {
        out += `${pad}${key}: "${val.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n')}"\n`
      }
      else {
        out += `${pad}${key}: ${val}\n`
      }
    }
    else if (Array.isArray(val)) {
      if (val.length === 0) {
        out += `${pad}${key}: []\n`
      }
      else if (typeof val[0] === 'object') {
        out += `${pad}${key}:\n`
        for (const item of val) {
          const lines = stringifySimpleYaml(item as Record<string, unknown>, indent + 1).split('\n')
          // 第一项以 "- " 开头
          out += `${pad}  - ${lines[0].trimStart()}\n`
          for (let i = 1; i < lines.length - 1; i++) {
            out += `${pad}    ${lines[i].trimStart()}\n`
          }
        }
      }
      else {
        out += `${pad}${key}:\n`
        for (const item of val) {
          out += `${pad}  - ${item}\n`
        }
      }
    }
    else if (typeof val === 'object') {
      out += `${pad}${key}:\n`
      out += stringifySimpleYaml(val as Record<string, unknown>, indent + 1)
    }
  }

  return out
}

function parseSimpleYaml(yaml: string): Record<string, unknown> {
  // 此处使用 Nuxt Content 自带的解析，生产中直接 queryCollection
  // 这个函数仅在后台写入时做基础校验用
  const lines = yaml.split('\n')
  const result: Record<string, unknown> = {}
  let i = 0

  while (i < lines.length) {
    const line = lines[i]
    const colonIdx = line.indexOf(':')
    if (colonIdx === -1) { i++; continue }

    const key = line.slice(0, colonIdx).trim()
    const rest = line.slice(colonIdx + 1).trim()

    if (rest === '' || rest === '|' || rest === '>') {
      // 对象或多行 — 递归解析子级（简化实现）
      const childLines: string[] = []
      i++
      const baseIndent = lines[i]?.match(/^(\s*)/)?.[1].length ?? 2
      while (i < lines.length && (lines[i].match(/^(\s*)/)?.[1].length ?? 0) >= baseIndent) {
        childLines.push(lines[i].slice(baseIndent))
        i++
      }
      result[key] = parseSimpleYaml(childLines.join('\n'))
    }
    else {
      result[key] = rest.replace(/^["']|["']$/g, '')
      i++
    }
  }

  return result
}
