<script setup lang="ts">
definePageMeta({ middleware: 'admin', layout: false })

const { listProducts, getCategories, getProduct, deleteProduct } = useGithubApi()
const { parseProductMarkdown } = await import('~/composables/useProduct')
import type { Category, Product } from '~/composables/useProduct'

const products = ref<(Product & { sha: string })[]>([])
const categories = ref<Category[]>([])
const loading = ref(true)
const filterCategory = ref('')
const toast = ref<{ msg: string; type: 'success' | 'error' } | null>(null)

onMounted(async () => {
  await loadData()
})

async function loadData() {
  loading.value = true
  try {
    const [files, { categories: cats }] = await Promise.all([
      listProducts(),
      getCategories(),
    ])
    categories.value = cats

    // 并行读取所有产品文件
    const productData = await Promise.allSettled(
      files.map(f => getProduct(f.name.replace('.md', ''))),
    )

    products.value = productData
      .map((r, i) => {
        if (r.status === 'fulfilled' && r.value) {
          try {
            const p = parseProductMarkdown(r.value.content)
            return { ...p, sha: r.value.sha }
          }
          catch { return null }
        }
        return null
      })
      .filter(Boolean) as (Product & { sha: string })[]
  }
  finally {
    loading.value = false
  }
}

const filteredProducts = computed(() => {
  if (!filterCategory.value) return products.value
  return products.value.filter(p => p.categoryId === filterCategory.value)
})

function categoryName(id: string) {
  return categories.value.find(c => c.id === id)?.name.en || id
}

async function handleDelete(product: Product & { sha: string }) {
  if (!confirm(`确认删除产品「${product.title.en}」？`)) return
  try {
    await deleteProduct(product.slug, product.sha)
    products.value = products.value.filter(p => p.id !== product.id)
    showToast('删除成功', 'success')
  }
  catch (e: unknown) {
    showToast(e instanceof Error ? e.message : '删除失败', 'error')
  }
}

function showToast(msg: string, type: 'success' | 'error') {
  toast.value = { msg, type }
  setTimeout(() => toast.value = null, 3000)
}
</script>

<template>
  <AdminLayout>
    <div class="p-8">
      <!-- 标题行 -->
      <div class="flex flex-wrap items-center gap-3 justify-between mb-6">
        <h1 class="text-xl font-semibold text-gray-900">产品管理</h1>
        <div class="flex items-center gap-3">
          <!-- 分类筛选 -->
          <select
            v-model="filterCategory"
            class="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">全部分类</option>
            <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name.en }}</option>
          </select>
          <NuxtLink
            to="/admin/products/new"
            class="bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
          >
            + 新增产品
          </NuxtLink>
        </div>
      </div>

      <!-- 加载中 -->
      <div v-if="loading" class="text-center py-16 text-gray-400 text-sm">加载中...</div>

      <!-- 空状态 -->
      <div v-else-if="!filteredProducts.length" class="text-center py-16 text-gray-400 text-sm">
        没有产品，点击「新增产品」开始添加
      </div>

      <!-- 产品列表 -->
      <div v-else class="bg-white rounded-xl border border-gray-100 divide-y divide-gray-50">
        <div
          v-for="product in filteredProducts"
          :key="product.id"
          class="flex items-center gap-4 px-5 py-4"
        >
          <!-- 图片 -->
          <div class="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
            <img
              v-if="product.images[0]"
              :src="product.images[0].thumb || product.images[0].url"
              alt=""
              class="w-full h-full object-cover"
            >
          </div>

          <!-- 信息 -->
          <div class="flex-1 min-w-0">
            <p class="font-medium text-gray-900 text-sm truncate">{{ product.title.en }}</p>
            <p class="text-xs text-gray-400 mt-0.5">
              <span class="mr-3">{{ categoryName(product.categoryId) }}</span>
              <span
                :class="product.published ? 'text-green-600' : 'text-gray-400'"
              >{{ product.published ? '已发布' : '草稿' }}</span>
            </p>
          </div>

          <!-- 操作 -->
          <div class="flex gap-2 flex-shrink-0">
            <NuxtLink
              :to="`/admin/products/${product.slug}`"
              class="text-xs text-brand-600 hover:text-brand-700 px-3 py-1.5 rounded-lg hover:bg-brand-50 transition"
            >编辑</NuxtLink>
            <button
              class="text-xs text-red-500 hover:text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50 transition"
              @click="handleDelete(product)"
            >删除</button>
          </div>
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
