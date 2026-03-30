/**
 * admin.ts — 后台路由守卫
 *
 * 所有 /admin/* 路由（除 /admin/login）均需要登录态。
 * 未登录时跳转到登录页。
 */
export default defineNuxtRouteMiddleware((to) => {
  // 仅客户端执行
  if (import.meta.server) return

  const { isAuthenticated } = useAuth()

  if (to.path === '/admin/login') return

  if (!isAuthenticated.value) {
    return navigateTo('/admin/login')
  }
})
