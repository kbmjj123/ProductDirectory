<script setup lang="ts">
import type { Category } from '~/composables/useProduct'

definePageMeta({ middleware: 'admin', layout: false })

const { getCategories, saveCategories } = useGithubApi()
const { generateId, toSlug } = await import('~/composables/useProduct')

const categories = ref<Category[]>([])
const currentSha = ref<string | undefined>()
const loading = ref(true)
const saving = ref(false)
const toast = ref<{ msg: string; type: 'success' | 'error' } | null>(null)

// 弹窗状态
const dialog = ref<{ open: boolean; mode: 'add' | 'edit'; data: Partial<Category> }>({
  open: false,
  mode: 'add',
  data: {},
})

onMounted(async () => {
  await loadCategories()
})

async function loadCategories() {
  loading.value = true
  try {
    const result = await getCategories()
    categories.value = result.categories
    currentSha.value = result.sha
  }
  finally {
    loading.value = false
  }
}

function openAdd() {
  dialog.value = {
    open: true,
    mode: 'add',
    data: { name: { en: '', zh: '', es: '', fr: '' }, slug: '', order: categories.value.length + 1 },
  }
}

function openEdit(cat: Category) {
  dialog.value = { open: true, mode: 'edit', data: { ...cat, name: { ...cat.name } } }
}

function closeDialog() {
  dialog.value.open = false
}

async function saveDialog() {
  const d = dialog.value.data as Category
  if (!d.name?.en) return showToast('英文名称不能为空', 'error')
  if (!d.slug) d.slug = toSlug(d.name.en)

  saving.value = true
  try {
    if (dialog.value.mode === 'add') {
      d.id = `cat-${generateId().slice(0, 8)}`
      categories.value.push(d)
    }
    else {
      const idx = categories.value.findIndex(c => c.id === d.id)
      if (idx !== -1) categories.value[idx] = d
    }

    const result = await saveCategories(categories.value, currentSha.value)
    currentSha.value = result.content.sha
    showToast('保存成功', 'success')
    closeDialog()
  }
  catch (e: unknown) {
    showToast(e instanceof Error ? e.message : '保存失败', 'error')
  }
  finally {
    saving.value = false
  }
}

async function deleteCategory(cat: Category) {
  if (!confirm(`确认删除分类「${cat.name.en}」？此操作不可撤销。`)) return
  saving.value = true
  try {
    categories.value = categories.value.filter(c => c.id !== cat.id)
    const result = await saveCategories(categories.value, currentSha.value)
    currentSha.value = result.content.sha
    showToast('删除成功', 'success')
  }
  catch (e: unknown) {
    showToast(e instanceof Error ? e.message : '删除失败', 'error')
  }
  finally {
    saving.value = false
  }
}

function showToast(msg: string, type: 'success' | 'error') {
  toast.value = { msg, type }
  setTimeout(() => toast.value = null, 3000)
}

// 根据英文名自动生成 slug
watch(() => dialog.value.data.name?.en, (val) => {
  if (dialog.value.mode === 'add' && val) {
    dialog.value.data.slug = toSlug(val)
  }
})
</script>

<template>
  <AdminLayout>
    <div class="p-8">
      <!-- 标题行 -->
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-xl font-semibold text-gray-900">分类管理</h1>
        <button
          class="bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
          @click="openAdd"
        >
          + 新增分类
        </button>
      </div>

      <!-- 加载中 -->
      <div v-if="loading" class="text-center py-16 text-gray-400 text-sm">加载中...</div>

      <!-- 空状态 -->
      <div v-else-if="!categories.length" class="text-center py-16 text-gray-400 text-sm">
        还没有分类，点击「新增分类」开始添加
      </div>

      <!-- 分类列表 -->
      <div v-else class="bg-white rounded-xl border border-gray-100 divide-y divide-gray-50">
        <div
          v-for="cat in categories.sort((a, b) => a.order - b.order)"
          :key="cat.id"
          class="flex items-center gap-4 px-5 py-4"
        >
          <div class="flex-1 min-w-0">
            <p class="font-medium text-gray-900 text-sm">{{ cat.name.en }}</p>
            <p class="text-xs text-gray-400 mt-0.5">
              <span class="mr-3">zh: {{ cat.name.zh || '—' }}</span>
              <span class="mr-3">es: {{ cat.name.es || '—' }}</span>
              <span>fr: {{ cat.name.fr || '—' }}</span>
            </p>
          </div>
          <div class="text-xs text-gray-400 hidden sm:block">
            /{{ cat.slug }}
          </div>
          <div class="flex gap-2">
            <button
              class="text-xs text-brand-600 hover:text-brand-700 px-3 py-1.5 rounded-lg hover:bg-brand-50 transition"
              @click="openEdit(cat)"
            >编辑</button>
            <button
              class="text-xs text-red-500 hover:text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50 transition"
              @click="deleteCategory(cat)"
            >删除</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 弹窗 -->
    <div v-if="dialog.open" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div class="bg-white rounded-2xl w-full max-w-lg shadow-xl">
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 class="font-semibold text-gray-900">{{ dialog.mode === 'add' ? '新增分类' : '编辑分类' }}</h2>
          <button class="text-gray-400 hover:text-gray-600" @click="closeDialog">✕</button>
        </div>
        <div class="p-6 space-y-4">
          <!-- 多语言名称 -->
          <div v-for="lang in ['en', 'zh', 'es', 'fr']" :key="lang">
            <label class="block text-xs font-medium text-gray-500 mb-1.5 uppercase">{{ lang }}</label>
            <input
              v-model="(dialog.data.name as Record<string, string>)[lang]"
              type="text"
              :placeholder="lang === 'en' ? 'Electronics' : lang === 'zh' ? '电子产品' : ''"
              class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
          </div>
          <!-- Slug -->
          <div>
            <label class="block text-xs font-medium text-gray-500 mb-1.5">SLUG</label>
            <input
              v-model="dialog.data.slug"
              type="text"
              placeholder="electronics"
              class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
          </div>
          <!-- 排序权重 -->
          <div>
            <label class="block text-xs font-medium text-gray-500 mb-1.5">排序权重（越小越靠前）</label>
            <input
              v-model.number="dialog.data.order"
              type="number"
              min="1"
              class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
          </div>
        </div>
        <div class="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button class="text-sm text-gray-500 hover:text-gray-700 px-4 py-2" @click="closeDialog">取消</button>
          <button
            class="bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-5 py-2 rounded-lg transition disabled:opacity-50"
            :disabled="saving"
            @click="saveDialog"
          >
            {{ saving ? '保存中...' : '保存' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Toast -->
    <div
      v-if="toast"
      :class="[
        'fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl text-sm font-medium shadow-lg transition-all',
        toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white',
      ]"
    >
      {{ toast.msg }}
    </div>
  </AdminLayout>
</template>
