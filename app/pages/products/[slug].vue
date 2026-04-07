<script setup lang="ts">
const { locale } = useI18n()
const localePath = useLocalePath()
const route = useRoute()
const slug = computed(() => route.params.slug as string)

// 读取产品数据
const { data: product } = await useAsyncData(`product-${slug.value}`, () =>
  queryCollection('products')
    .where('slug', '=', slug.value)
    .first(),
)

if (!product.value) {
  throw createError({ statusCode: 404, statusMessage: 'Product not found' })
}

// 读取分类信息（用于面包屑）
const { data: categoriesData } = await useAsyncData('detail-categories', () =>
  queryCollection('categories').first(),
)
const category = computed(() =>
  categoriesData.value?.categories?.find((c: any) => c.id === product.value?.categoryId),
)

// 当前语言的内容
const title = computed(() =>
  product.value?.title[locale.value] || product.value?.title.en || '',
)
const description = computed(() =>
  product.value?.description[locale.value] || product.value?.description.en || '',
)

// SEO
useHead({
  title: computed(() => `${title.value} — Product Catalog`),
  meta: [
    { name: 'description', content: computed(() => description.value.slice(0, 160)) },
  ],
})

// 图片画廊
const activeImage = ref(0)
const images = computed(() => product.value?.images ?? [])
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
    <!-- 面包屑 -->
    <nav class="flex items-center gap-2 text-sm text-gray-400 mb-8">
      <NuxtLink :to="localePath('/')" class="hover:text-gray-600 transition">Home</NuxtLink>
      <span>/</span>
      <NuxtLink
        v-if="category"
        :to="localePath(`/${category.slug}`)"
        class="hover:text-gray-600 transition"
      >
        {{ category.name[locale] || category.name.en }}
      </NuxtLink>
      <span v-if="category">/</span>
      <span class="text-gray-700 font-medium truncate">{{ title }}</span>
    </nav>

    <!-- 产品主体 -->
    <div class="lg:grid lg:grid-cols-2 lg:gap-14">
      <!-- 图片区域 -->
      <div class="mb-8 lg:mb-0">
        <!-- 主图 -->
        <div class="aspect-square rounded-2xl overflow-hidden bg-gray-50 mb-3">
          <img
            v-if="images[activeImage]"
            :src="images[activeImage].url"
            :alt="title"
            class="w-full h-full object-cover"
          >
          <div v-else class="w-full h-full flex items-center justify-center text-gray-200">
            <svg class="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1"
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </div>

        <!-- 缩略图列 -->
        <div v-if="images.length > 1" class="flex gap-2 overflow-x-auto pb-1">
          <button
            v-for="(img, idx) in images"
            :key="img.url"
            :class="[
              'flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition',
              activeImage === idx ? 'border-brand-500' : 'border-transparent hover:border-gray-200',
            ]"
            @click="activeImage = idx"
          >
            <img :src="img.thumb || img.url" :alt="`Image ${idx + 1}`" class="w-full h-full object-cover">
          </button>
        </div>
      </div>

      <!-- 产品信息 -->
      <div>
        <!-- 分类标签 -->
        <div v-if="category" class="mb-3">
          <NuxtLink
            :to="localePath(`/${category.slug}`)"
            class="inline-block text-xs font-medium text-brand-600 bg-brand-50 px-3 py-1 rounded-full hover:bg-brand-100 transition"
          >
            {{ category.name[locale] || category.name.en }}
          </NuxtLink>
        </div>

        <!-- 标题 -->
        <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
          {{ title }}
        </h1>

        <!-- 描述（支持 Markdown 渲染） -->
        <div
          class="prose prose-sm prose-gray max-w-none text-gray-600"
          v-html="$mdRenderer(description)"
        />
      </div>
    </div>
  </div>
</template>
