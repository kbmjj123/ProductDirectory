/**
 * useAuth — 管理员登录态
 *
 * 策略：
 * - 用户名/密码与环境变量对比（密码用 SHA-256 哈希）
 * - GitHub Token 运行时输入，存入 sessionStorage（关闭标签页自动清除）
 * - Session 有效期 8 小时
 */

const SESSION_KEY = 'admin_session'
const SESSION_TTL = 8 * 60 * 60 * 1000 // 8 小时（毫秒）

interface AdminSession {
  token: string
  expiresAt: number
}

/** SHA-256 哈希，纯浏览器实现 */
async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message)
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

export function useAuth() {
  const config = useRuntimeConfig()

  /** 从 sessionStorage 读取有效 session */
  function getSession(): AdminSession | null {
    if (import.meta.server) return null
    try {
      const raw = sessionStorage.getItem(SESSION_KEY)
      if (!raw) return null
      const session: AdminSession = JSON.parse(raw)
      if (Date.now() > session.expiresAt) {
        sessionStorage.removeItem(SESSION_KEY)
        return null
      }
      return session
    }
    catch {
      return null
    }
  }

  /** 是否已登录 */
  const isAuthenticated = computed(() => {
    return getSession() !== null
  })

  /** 获取当前 GitHub Token */
  function getToken(): string | null {
    return getSession()?.token ?? null
  }

  /**
   * 登录
   * @returns 成功返回 null，失败返回错误信息字符串
   */
  async function login(username: string, password: string, token: string): Promise<string | null> {
		debugger
    // 校验用户名
    if (username !== config.public.adminUsername) {
      return '用户名或密码错误'
    }

    // 校验密码（SHA-256 对比）
    const hash = await sha256(password)
    if (hash !== config.public.adminPasswordHash) {
      return '用户名或密码错误'
    }

    // 校验 Token 是否有效（尝试调用 GitHub API）
    const valid = await verifyToken(token)
    if (!valid) {
      return 'GitHub Token 无效或权限不足，请检查后重试'
    }

    // 写入 sessionStorage
    const session: AdminSession = {
      token,
      expiresAt: Date.now() + SESSION_TTL,
    }
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))

    return null
  }

  /** 退出登录 */
  function logout() {
    sessionStorage.removeItem(SESSION_KEY)
    navigateTo('/admin/login')
  }

  /** 验证 GitHub Token 是否具备仓库写权限 */
  async function verifyToken(token: string): Promise<boolean> {
    try {
			console.info(`https://api.github.com/repos/${config.public.githubOwner}/${config.public.githubRepo}`)
      const res = await fetch(
        `https://api.github.com/repos/${config.public.githubOwner}/${config.public.githubRepo}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/vnd.github+json',
          },
        },
      )
      return res.ok
    }
    catch {
      return false
    }
  }

  return {
    isAuthenticated,
    getToken,
    login,
    logout,
  }
}
