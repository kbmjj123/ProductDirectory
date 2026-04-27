<script setup lang="ts">
import type { Category, Product, ProductImage } from '~/composables/useProduct'
import type { UploadResult } from '~/composables/useImageUpload'

definePageMeta({ middleware: 'admin', layout: false })

const route = useRoute()
const slug = computed(() => route.params.slug as string)
const isNew = computed(() => slug.value === 'new')

const { getCategories, getProduct, saveProduct } = useGithubApi()
const { generateId, toSlug, productToMarkdown, parseProductMarkdown } = await import('~/composables/useProduct')

const categories = ref<Category[]>([])
const currentSha = ref<string | undefined>()
const loading = ref(true)
const saving = ref(false)
const toast = ref<{ msg: string; type: 'success' | 'error' } | null>(null)

// 表单
const form = ref<Product>({
  id: '',
  slug: '',
  categoryId: '',
  published: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  images: [],
  title: { en: '', zh: '', es: '', fr: '' },
  description: { en: '', zh: '', es: '', fr: '' },
})

onMounted(async () => {
  const [{ categories: cats }, existing] = await Promise.all([
    getCategories(),
    isNew.value ? Promise.resolve(null) : getProduct(slug.value),
  ])
  categories.value = cats

  if (!isNew.value && existing) {
    try {
      const parsed = parseProductMarkdown(existing.content)
      form.value = parsed
      currentSha.value = existing.sha
    }
    catch (e) {
      showToast('解析产品数据失败', 'error')
    }
  }
  else if (isNew.value) {
    form.value.id = generateId()
  }

  loading.value = false
})

// 英文标题 → 自动填充 slug（仅新建时）
watch(() => form.value.title.en, (val) => {
  if (isNew.value && val) {
    form.value.slug = toSlug(val)
  }
})

// 图片双向绑定适配（UploadResult → ProductImage）
const images = computed<UploadResult[]>({
  get: () => {
		if(typeof form.value.images === 'object'){
			return [{ url: form.value.images.url,   thumb: form.value.images.thumb }]
		}else 
		return (form.value.images || []).map(img => ({ url: img.url,   thumb: img.thumb }))
	},
  set: (val) => {
    form.value.images = val.map(v => ({ url: v.url,   thumb: v.thumb }))
  },
})

async function handleSave() {
  if (!form.value.title.en) return showToast('英文标题不能为空', 'error')
  if (!form.value.slug) return showToast('Slug 不能为空', 'error')
  if (!form.value.categoryId) return showToast('请选择分类', 'error')

  saving.value = true
  form.value.updatedAt = new Date().toISOString()

  try {
    const markdown = productToMarkdown(form.value)
    await saveProduct(form.value.slug, markdown, currentSha.value)
    showToast('保存成功', 'success')
    setTimeout(() => navigateTo('/admin/products'), 1000)
  }
  catch (e: unknown) {
    showToast(e instanceof Error ? e.message : '保存失败', 'error')
  }
  finally {
    saving.value = false
  }
}

function showToast(msg: string, type: 'success' | 'error') {
  toast.value = { msg, type }
  setTimeout(() => toast.value = null, 3000)
}

const langTabs = [
  { key: 'en', label: 'English' },
  { key: 'zh', label: '中文' }
]
const activeLang = ref<'en' | 'zh'>('en')
</script>

<template>
  <AdminLayout>
    <div class="p-8 max-w-4xl">
      <!-- 标题 -->
      <div class="flex items-center gap-4 mb-6">
        <NuxtLink to="/admin/products" class="text-gray-400 hover:text-gray-600">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </NuxtLink>
        <h1 class="text-xl font-semibold text-gray-900">{{ isNew ? '新增产品' : '编辑产品' }}</h1>
      </div>

      <div v-if="loading" class="text-center py-16 text-gray-400 text-sm">加载中...</div>

      <div v-else class="space-y-6">
        <!-- 基本信息 -->
        <div class="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
          <h2 class="font-medium text-gray-900 text-sm">基本信息</h2>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <!-- 分类 -->
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1.5">分类 *</label>
              <select
                v-model="form.categoryId"
                class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="">请选择分类</option>
                <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name.en }}</option>
              </select>
            </div>

            <!-- Slug -->
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1.5">Slug（URL标识）*</label>
              <input
                v-model="form.slug"
                type="text"
                placeholder="wireless-headphones"
                :disabled="!isNew"
                class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:bg-gray-50 disabled:text-gray-400"
              >
            </div>
          </div>

          <!-- 发布状态 -->
          <label class="flex items-center gap-2 cursor-pointer">
            <input v-model="form.published" type="checkbox" class="rounded border-gray-300 text-brand-600">
            <span class="text-sm text-gray-700">立即发布</span>
          </label>
        </div>

        <!-- 多语言内容 -->
        <div class="bg-white rounded-xl border border-gray-100 p-6">
          <h2 class="font-medium text-gray-900 text-sm mb-4">多语言内容</h2>

          <!-- 语言 Tab -->
          <div class="flex gap-1 mb-5 border-b border-gray-100">
            <button
              v-for="tab in langTabs"
              :key="tab.key"
              :class="[
                'px-4 py-2 text-sm font-medium transition border-b-2 -mb-px',
                activeLang === tab.key
                  ? 'border-brand-600 text-brand-600'
                  : 'border-transparent text-gray-400 hover:text-gray-600',
              ]"
              @click="activeLang = tab.key as typeof activeLang"
            >
              {{ tab.label }}
            </button>
          </div>

          <div class="space-y-4">
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1.5">标题 *（{{ activeLang }}）</label>
              <input
                v-model="form.title[activeLang]"
                type="text"
                :placeholder="activeLang === 'en' ? 'Wireless Headphones Pro' : activeLang === 'zh' ? '无线耳机 Pro' : ''"
                class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1.5">描述（{{ activeLang }}）— 支持 Markdown</label>
              <textarea
                v-model="form.description[activeLang]"
                rows="8"
                :placeholder="activeLang === 'en' ? 'Full product description in English...' : activeLang === 'zh' ? '产品中文详细描述...' : ''"
                class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-500 resize-y"
              />
            </div>
          </div>
        </div>

        <!-- 图片上传 -->
        <div class="bg-white rounded-xl border border-gray-100 p-6">
          <h2 class="font-medium text-gray-900 text-sm mb-4">产品图片</h2>
          <ImageUploader v-model="images" />
        </div>

        <!-- 操作栏 -->
        <div class="flex justify-end gap-3">
          <NuxtLink
            to="/admin/products"
            class="text-sm text-gray-500 hover:text-gray-700 px-5 py-2.5 rounded-lg border border-gray-200 hover:border-gray-300 transition"
          >
            取消
          </NuxtLink>
          <button
            :disabled="saving"
            class="bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-sm font-medium px-6 py-2.5 rounded-lg transition"
            @click="handleSave"
          >
            {{ saving ? '保存中...' : '保存产品' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Toast -->
    <div
      v-if="toast"
      :class="[
        'fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl text-sm font-medium shadow-lg',
        toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white',
      ]"
    >
      {{ toast.msg }}
    </div>
  </AdminLayout>
</template>
