<script setup lang="ts">
definePageMeta({
  layout: false, // 登录页不使用后台 layout
})

const { isAuthenticated, login } = useAuth()

// 已登录则跳转后台首页
if (import.meta.client && isAuthenticated.value) {
  navigateTo('/admin')
}

const form = reactive({
  username: '',
  password: '',
  token: '',
})

const loading = ref(false)
const error = ref<string | null>(null)

async function handleLogin() {
  error.value = null
  loading.value = true
  try {
    const err = await login(form.username, form.password, form.token)
    if (err) {
      error.value = err
    }
    else {
      navigateTo('/admin')
    }
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center px-4">
    <div class="w-full max-w-md">
      <!-- Logo / 标题 -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-brand-600 rounded-2xl mb-4">
          <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
        <h1 class="text-2xl font-bold text-gray-900">产品目录管理系统</h1>
        <p class="text-gray-500 text-sm mt-1">Product Catalog Admin</p>
      </div>

      <!-- 登录表单 -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <form @submit.prevent="handleLogin" class="space-y-5">
          <!-- 用户名 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">用户名</label>
            <input
              v-model="form.username"
              type="text"
              required
              autocomplete="username"
              placeholder="admin"
              class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
            >
          </div>

          <!-- 密码 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">密码</label>
            <input
              v-model="form.password"
              type="password"
              required
              autocomplete="current-password"
              placeholder="••••••••"
              class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
            >
          </div>

          <!-- GitHub Token -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">
              GitHub Token
              <span class="text-gray-400 font-normal text-xs ml-1">（每次登录手动输入，不会保存到代码）</span>
            </label>
            <input
              v-model="form.token"
              type="password"
              required
              autocomplete="off"
              placeholder="github_pat_..."
              class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
            >
          </div>

          <!-- 错误提示 -->
          <div v-if="error" class="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600">
            <svg class="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
            {{ error }}
          </div>

          <!-- 登录按钮 -->
          <button
            type="submit"
            :disabled="loading"
            class="w-full bg-brand-600 hover:bg-brand-700 disabled:bg-brand-300 text-white font-medium py-2.5 px-4 rounded-lg text-sm transition flex items-center justify-center gap-2"
          >
            <svg v-if="loading" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            {{ loading ? '验证中...' : '登录' }}
          </button>
        </form>

        <!-- 提示说明 -->
        <p class="text-xs text-gray-400 text-center mt-6 leading-relaxed">
          Token 仅在当前会话中使用，关闭标签页后自动清除。
          <br>需要 GitHub Fine-grained Token，开启 Contents 读写权限。
        </p>
      </div>
    </div>
  </div>
</template>
