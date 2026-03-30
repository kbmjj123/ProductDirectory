<script setup lang="ts">
const { locale } = useI18n()
const localePath = useLocalePath()
const route = useRoute()
const categorySlug = computed(() => route.params.category as string)

// 读取分类信息 — 'categories' 是 data 类型集合，对应 content/categories.json
const { data: categoriesData } = await useAsyncData('all-categories', () =>
  queryCollection('categories').first(),
)
const allCategories = computed(() =>
  (categoriesData.value?.categories ?? []).sort((a: any, b: any) => a.order - b.order),
)
const currentCategory = computed(() =>
  allCategories.value.find((c: any) => c.slug === categorySlug.value),
)

// 读取该分类下的产品 — 'products' 是 page 类型集合，对应 content/products/*.md
const { data: products } = await useAsyncData(`products-${categorySlug.value}`, () =>
  queryCollection('products')
    .where('published', '=', true)
    .where('categoryId', '=', currentCategory.value?.id ?? '')
    .all(),
)

// SEO
useHead({
  title: computed(() =>
    currentCategory.value
      ? `${currentCategory.value.name[locale.value] || currentCategory.value.name.en} — Product Catalog`
      : 'Product Catalog',
  ),
})

// 404 处理
if (!currentCategory.value) {
  throw createError({ statusCode: 404, statusMessage: 'Category not found' })
}
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
    <div class="lg:grid lg:grid-cols-[220px_1fr] lg:gap-10">
      <!-- 侧边分类导航（桌面） -->
      <aside class="hidden lg:block">
        <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">分类</p>
        <CategoryNav :categories="allCategories" :active-slug="categorySlug" />
      </aside>

      <!-- 主内容 -->
      <div>
        <!-- 面包屑 -->
        <nav class="flex items-center gap-2 text-sm text-gray-400 mb-6">
          <NuxtLink :to="localePath('/')" class="hover:text-gray-600 transition">Home</NuxtLink>
          <span>/</span>
          <span class="text-gray-700 font-medium">
            {{ currentCategory?.name[locale] || currentCategory?.name.en }}
          </span>
        </nav>

        <!-- 标题 -->
        <h1 class="text-2xl font-bold text-gray-900 mb-6">
          {{ currentCategory?.name[locale] || currentCategory?.name.en }}
        </h1>

        <!-- 空状态 -->
        <div v-if="!products?.length" class="text-center py-20 text-gray-400 text-sm">
          该分类暂无产品
        </div>

        <!-- 产品网格：移动端1列 → 平板2列 → 桌面3-4列 -->
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          <ProductCard
            v-for="product in products"
            :key="product.id"
            :product="product"
          />
        </div>
      </div>
    </div>
  </div>
</template>