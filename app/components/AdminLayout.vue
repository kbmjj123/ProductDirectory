<script setup lang="ts">
const { logout } = useAuth()
const route = useRoute()

const navItems = [
  { path: '/admin', label: '概览', icon: 'home', exact: true },
  { path: '/admin/categories', label: '分类管理', icon: 'tag' },
  { path: '/admin/products', label: '产品管理', icon: 'package' },
  { path: '/admin/deploy', label: '一键部署', icon: 'rocket' },
]

function isActive(item: { path: string; exact?: boolean }) {
  return item.exact ? route.path === item.path : route.path.startsWith(item.path)
}

const sidebarOpen = ref(false)
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex">
    <!-- 移动端遮罩 -->
    <div
      v-if="sidebarOpen"
      class="fixed inset-0 z-20 bg-black/40 lg:hidden"
      @click="sidebarOpen = false"
    />

    <!-- 侧边栏 -->
    <aside
      :class="[
        'fixed inset-y-0 left-0 z-30 w-60 bg-white border-r border-gray-100 flex flex-col transform transition-transform lg:translate-x-0 lg:static lg:z-auto',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full',
      ]"
    >
      <!-- Logo -->
      <div class="flex items-center gap-3 px-6 h-16 border-b border-gray-100 flex-shrink-0">
        <div class="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
          <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
        <span class="font-semibold text-gray-900 text-sm">产品目录</span>
        <span class="text-xs text-gray-400 ml-auto">Admin</span>
      </div>

      <!-- 导航 -->
      <nav class="flex-1 py-4 overflow-y-auto">
        <ul class="space-y-0.5 px-3">
          <li v-for="item in navItems" :key="item.path">
            <NuxtLink
              :to="item.path"
              :class="[
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition',
                isActive(item)
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
              ]"
              @click="sidebarOpen = false"
            >
              <!-- 图标 -->
              <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path v-if="item.icon === 'home'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                <path v-if="item.icon === 'tag'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                <path v-if="item.icon === 'package'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                <path v-if="item.icon === 'rocket'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              {{ item.label }}
            </NuxtLink>
          </li>
        </ul>
      </nav>

      <!-- 底部退出 -->
      <div class="p-3 border-t border-gray-100 flex-shrink-0">
        <button
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-700 w-full transition"
          @click="logout"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          退出登录
        </button>
      </div>
    </aside>

    <!-- 主内容区 -->
    <div class="flex-1 flex flex-col min-w-0">
      <!-- 顶部栏 -->
      <header class="h-16 bg-white border-b border-gray-100 flex items-center px-6 gap-4 flex-shrink-0">
        <button
          class="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
          @click="sidebarOpen = !sidebarOpen"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div class="flex-1" />
        <a
          href="/"
          target="_blank"
          class="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1 transition"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          查看前台
        </a>
      </header>

      <!-- 页面内容 -->
      <main class="flex-1 overflow-y-auto">
        <slot />
      </main>
    </div>
  </div>
</template>
