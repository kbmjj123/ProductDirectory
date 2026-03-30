<script setup lang="ts">
definePageMeta({ middleware: 'admin', layout: false })

const { triggerDeploy } = useGithubApi()

const status = ref<'idle' | 'pushing' | 'success' | 'error'>('idle')
const errorMsg = ref('')
const lastDeployTime = ref<string | null>(null)
const countdown = ref(0)
let timer: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  lastDeployTime.value = localStorage.getItem('lastDeployTime')
})

async function handleDeploy() {
  status.value = 'pushing'
  errorMsg.value = ''

  try {
    await triggerDeploy()
    status.value = 'success'
    const now = new Date().toLocaleString('zh-CN')
    lastDeployTime.value = now
    localStorage.setItem('lastDeployTime', now)

    // 倒计时提示
    countdown.value = 120
    timer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0 && timer) {
        clearInterval(timer)
        timer = null
      }
    }, 1000)
  }
  catch (e: unknown) {
    status.value = 'error'
    errorMsg.value = e instanceof Error ? e.message : '部署触发失败'
  }
}

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<template>
  <AdminLayout>
    <div class="p-8 max-w-2xl">
      <h1 class="text-xl font-semibold text-gray-900 mb-2">一键部署</h1>
      <p class="text-sm text-gray-400 mb-8">向 GitHub 推送触发 commit，Cloudflare Pages 将自动构建并发布最新内容。</p>

      <!-- 部署卡片 -->
      <div class="bg-white rounded-2xl border border-gray-100 p-8 text-center">
        <!-- 图标 -->
        <div class="w-16 h-16 mx-auto mb-5 rounded-2xl flex items-center justify-center"
          :class="{
            'bg-gray-100': status === 'idle',
            'bg-brand-100 animate-pulse': status === 'pushing',
            'bg-green-100': status === 'success',
            'bg-red-100': status === 'error',
          }"
        >
          <svg v-if="status === 'idle' || status === 'pushing'" class="w-7 h-7"
            :class="status === 'idle' ? 'text-gray-400' : 'text-brand-600'"
            fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
          <svg v-else-if="status === 'success'" class="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          <svg v-else class="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>

        <!-- 状态文字 -->
        <div v-if="status === 'idle'">
          <h2 class="text-lg font-semibold text-gray-900 mb-1">准备部署</h2>
          <p class="text-sm text-gray-400">点击下方按钮触发构建，约 1-2 分钟后内容上线。</p>
        </div>
        <div v-else-if="status === 'pushing'">
          <h2 class="text-lg font-semibold text-gray-900 mb-1">正在推送...</h2>
          <p class="text-sm text-gray-400">正在向 GitHub 推送触发 commit</p>
        </div>
        <div v-else-if="status === 'success'">
          <h2 class="text-lg font-semibold text-green-700 mb-1">部署已触发 ✓</h2>
          <p class="text-sm text-gray-400">
            Cloudflare Pages 构建中，预计
            <span class="font-medium text-gray-600">{{ countdown > 0 ? `${countdown} 秒` : '约 2 分钟' }}</span>
            后上线
          </p>
        </div>
        <div v-else>
          <h2 class="text-lg font-semibold text-red-600 mb-1">触发失败</h2>
          <p class="text-sm text-red-400">{{ errorMsg }}</p>
        </div>

        <!-- 按钮 -->
        <button
          class="mt-6 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-medium px-8 py-3 rounded-xl transition"
          :disabled="status === 'pushing'"
          @click="handleDeploy"
        >
          {{ status === 'pushing' ? '部署中...' : status === 'success' ? '再次部署' : '🚀  一键部署' }}
        </button>
      </div>

      <!-- 上次部署时间 -->
      <div v-if="lastDeployTime" class="mt-4 text-center text-xs text-gray-400">
        上次部署时间：{{ lastDeployTime }}
      </div>

      <!-- 说明 -->
      <div class="mt-8 bg-gray-50 rounded-xl p-5 text-sm text-gray-500 space-y-2">
        <p class="font-medium text-gray-700">部署流程说明</p>
        <ol class="list-decimal list-inside space-y-1 text-xs leading-relaxed">
          <li>向 GitHub 仓库 main 分支推送一个更新 <code class="bg-gray-100 px-1 rounded">.deploy-trigger</code> 文件的 commit</li>
          <li>Cloudflare Pages 检测到 main 分支变动，自动触发构建</li>
          <li>执行 <code class="bg-gray-100 px-1 rounded">nuxt generate</code> 生成最新静态文件</li>
          <li>构建完成后推送到全球 CDN，用户刷新即可看到最新内容</li>
        </ol>
      </div>
    </div>
  </AdminLayout>
</template>
