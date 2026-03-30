/**
 * useGithubApi — GitHub REST API 封装
 *
 * 封装文件的读取、创建、更新、删除操作。
 * 所有写操作均需要 GitHub Token（从 useAuth 获取）。
 */

interface GithubFile {
  name: string
  path: string
  sha: string
  content: string // Base64 编码
  encoding: 'base64'
}

interface GithubWriteResult {
  commit: { sha: string }
  content: { sha: string; path: string }
}

export function useGithubApi() {
  const config = useRuntimeConfig()
  const { getToken } = useAuth()

  const base = computed(() =>
    `https://api.github.com/repos/${config.public.githubOwner}/${config.public.githubRepo}/contents`,
  )

  /** 构造请求头 */
  function headers(): Record<string, string> {
    const token = getToken()
    if (!token) throw new Error('未登录或 Token 已失效，请重新登录')
    return {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
    }
  }

  /** 读取文件（返回内容字符串 + sha） */
  async function getFile(path: string): Promise<{ content: string; sha: string } | null> {
    const res = await fetch(
      `${base.value}/${path}?ref=${config.public.githubBranch}`,
      { headers: headers() },
    )
    if (res.status === 404) return null
    if (!res.ok) throw new Error(`获取文件失败: ${res.status} ${await res.text()}`)

    const data: GithubFile = await res.json()
    // GitHub 返回的 content 包含换行符，需清理后再 decode
    const content = atob(data.content.replace(/\n/g, ''))
    return { content, sha: data.sha }
  }

  /**
   * 写入文件（创建或更新）
   * @param path    文件路径（相对仓库根）
   * @param content 文件内容（字符串）
   * @param message commit message
   * @param sha     已有文件的 SHA（更新时必须传入）
   */
  async function putFile(
    path: string,
    content: string,
    message: string,
    sha?: string,
  ): Promise<GithubWriteResult> {
    const body: Record<string, string> = {
      message,
      content: btoa(unescape(encodeURIComponent(content))), // UTF-8 → Base64
      branch: config.public.githubBranch,
    }
    if (sha) body.sha = sha

    const res = await fetch(`${base.value}/${path}`, {
      method: 'PUT',
      headers: headers(),
      body: JSON.stringify(body),
    })

    if (!res.ok) throw new Error(`写入文件失败: ${res.status} ${await res.text()}`)
    return res.json()
  }

  /** 删除文件 */
  async function deleteFile(path: string, message: string, sha: string): Promise<void> {
    const res = await fetch(`${base.value}/${path}`, {
      method: 'DELETE',
      headers: headers(),
      body: JSON.stringify({
        message,
        sha,
        branch: config.public.githubBranch,
      }),
    })
    if (!res.ok) throw new Error(`删除文件失败: ${res.status} ${await res.text()}`)
  }

  /** 列出目录下的文件 */
  async function listFiles(dir: string): Promise<Array<{ name: string; path: string; sha: string }>> {
    const res = await fetch(
      `${base.value}/${dir}?ref=${config.public.githubBranch}`,
      { headers: headers() },
    )
    if (res.status === 404) return []
    if (!res.ok) throw new Error(`列出目录失败: ${res.status}`)
    return res.json()
  }

  // ─────────────────────────────────────────────
  // 高层封装：分类 & 产品
  // ─────────────────────────────────────────────

  const CATEGORIES_PATH = 'content/categories.json'

  /** 读取所有分类 */
  async function getCategories() {
    const file = await getFile(CATEGORIES_PATH)
    if (!file) return { categories: [], sha: undefined }
    const data = JSON.parse(file.content)
    return { categories: data.categories ?? [], sha: file.sha }
  }

  /** 保存所有分类 */
  async function saveCategories(categories: Category[], sha?: string) {
    const content = JSON.stringify({ categories }, null, 2)
    return putFile(CATEGORIES_PATH, content, 'chore: update categories', sha)
  }

  /** 读取单个产品（Markdown 文件） */
  async function getProduct(slug: string) {
    return getFile(`content/products/${slug}.md`)
  }

  /** 保存产品（Markdown 文件） */
  async function saveProduct(slug: string, markdown: string, sha?: string) {
    return putFile(
      `content/products/${slug}.md`,
      markdown,
      `chore: update product ${slug}`,
      sha,
    )
  }

  /** 删除产品 */
  async function deleteProduct(slug: string, sha: string) {
    return deleteFile(
      `content/products/${slug}.md`,
      `chore: delete product ${slug}`,
      sha,
    )
  }

  /** 列出所有产品文件 */
  async function listProducts() {
    return listFiles('content/products')
  }

  /** 触发部署（更新 .deploy-trigger 文件） */
  async function triggerDeploy() {
    const existing = await getFile('.deploy-trigger')
    const content = `Deployed at: ${new Date().toISOString()}\n`
    return putFile(
      '.deploy-trigger',
      content,
      `chore: trigger deployment ${new Date().toISOString()}`,
      existing?.sha,
    )
  }

  return {
    getFile,
    putFile,
    deleteFile,
    listFiles,
    getCategories,
    saveCategories,
    getProduct,
    saveProduct,
    deleteProduct,
    listProducts,
    triggerDeploy,
  }
}
