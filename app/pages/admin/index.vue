<script setup lang="ts">
definePageMeta({ middleware: 'admin', layout: false })

const { listProducts, getCategories } = useGithubApi()

const stats = ref({ products: 0, categories: 0 })
const loading = ref(true)

onMounted(async () => {
  try {
    const [products, { categories }] = await Promise.all([
      listProducts(),
      getCategories(),
    ])
    stats.value = { products: products.length, categories: categories.length }
  }
  finally {
    loading.value = false
  }
})
</script>

<template>
  <AdminLayout>
    <div class="p-8">
      <h1 class="text-xl font-semibold text-gray-900 mb-6">概览</h1>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <!-- 产品数 -->
        <div class="bg-white rounded-xl border border-gray-100 p-6">
          <p class="text-sm text-gray-500 mb-1">产品总数</p>
          <p class="text-3xl font-bold text-gray-900">
            <span v-if="loading" class="text-gray-300">—</span>
            <span v-else>{{ stats.products }}</span>
          </p>
        </div>
        <!-- 分类数 -->
        <div class="bg-white rounded-xl border border-gray-100 p-6">
          <p class="text-sm text-gray-500 mb-1">分类数</p>
          <p class="text-3xl font-bold text-gray-900">
            <span v-if="loading" class="text-gray-300">—</span>
            <span v-else>{{ stats.categories }}</span>
          </p>
        </div>
        <!-- 快捷操作 -->
        <div class="bg-brand-600 rounded-xl p-6 text-white">
          <p class="text-sm opacity-75 mb-1">快捷操作</p>
          <NuxtLink to="/admin/products/new" class="text-sm font-medium underline underline-offset-2">
            + 新增产品
          </NuxtLink>
        </div>
      </div>

      <!-- 快捷入口 -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <NuxtLink
          v-for="item in [
            { to: '/admin/categories', label: '管理分类', desc: '增删改产品分类' },
            { to: '/admin/products', label: '管理产品', desc: '增删改产品信息与图片' },
            { to: '/admin/deploy', label: '一键部署', desc: '发布最新内容到线上' },
          ]"
          :key="item.to"
          :to="item.to"
          class="bg-white rounded-xl border border-gray-100 p-5 hover:border-brand-200 hover:shadow-sm transition group"
        >
          <p class="font-medium text-gray-900 group-hover:text-brand-600 transition">{{ item.label }}</p>
          <p class="text-sm text-gray-400 mt-0.5">{{ item.desc }}</p>
        </NuxtLink>
      </div>
    </div>
  </AdminLayout>
</template>
