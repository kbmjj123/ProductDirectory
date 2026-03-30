<script setup lang="ts">
const { locale, t } = useI18n()
const localePath = useLocalePath()

// 读取分类 — categories 是 data 类型集合，返回单个 JSON 对象
const { data: categoriesData } = await useAsyncData('home-categories', () =>
  queryCollection('categories').first(),
)
const categories = computed(() =>
  (categoriesData.value?.categories ?? []).sort((a: any, b: any) => a.order - b.order),
)

// 读取已发布产品（最多12个，作为精选展示）
const { data: featuredProducts } = await useAsyncData('home-products', () =>
  queryCollection('products')
    .where('published', '=', true)
    .limit(12)
    .all(),
)

// SEO
useHead({
  title: 'Product Catalog',
  meta: [
    { name: 'description', content: 'Browse our product catalog' },
  ],
})
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
    <!-- Hero -->
    <div class="text-center mb-12">
      <h1 class="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
        {{ $t('home.title') }}
      </h1>
      <p class="text-gray-400 text-sm sm:text-base max-w-xl mx-auto">
        {{ $t('home.subtitle') }}
      </p>
    </div>

    <!-- 分类入口 -->
    <section class="mb-14">
      <h2 class="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-5">
        {{ $t('home.categories') }}
      </h2>
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <NuxtLink
          v-for="cat in categories"
          :key="cat.id"
          :to="localePath(`/${cat.slug}`)"
          class="group bg-white border border-gray-100 rounded-xl p-5 hover:border-brand-200 hover:shadow-sm transition-all"
        >
          <p class="font-medium text-gray-900 group-hover:text-brand-600 transition-colors">
            {{ cat.name[locale] || cat.name.en }}
          </p>
          <p class="text-xs text-gray-400 mt-1">
            {{ $t('home.viewAll') }} →
          </p>
        </NuxtLink>
      </div>
    </section>

    <!-- 精选产品 -->
    <section v-if="featuredProducts.length">
      <h2 class="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-5">
        {{ $t('home.featured') }}
      </h2>
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <ProductCard
          v-for="product in featuredProducts"
          :key="product.id"
          :product="product"
        />
      </div>
    </section>
  </div>
</template>