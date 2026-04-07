<script setup lang="ts">
const { locale, locales, setLocale } = useI18n()
const localePath = useLocalePath()
const route = useRoute()

const mobileMenuOpen = ref(false)

// 从 Nuxt Content 读取分类 — 'categories' 是 data 类型集合
const { data: categoriesData } = await useAsyncData('header-categories', () =>
  queryCollection('categories').first(),
)
const categories = computed(() => categoriesData.value?.categories ?? [])

// 当前分类（用于高亮）
const activeCategory = computed(() => {
  const seg = route.path.split('/').filter(Boolean)
  return seg[seg.length - 1] ?? ''
})
</script>

<template>
  <header class="bg-white border-b border-gray-100 sticky top-0 z-40">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center h-16 gap-6">
        <!-- Logo -->
        <NuxtLink :to="localePath('/')" class="flex items-center gap-2 flex-shrink-0">
          <div class="w-7 h-7 bg-brand-600 rounded-lg flex items-center justify-center">
            <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <span class="font-semibold text-gray-900 text-sm">Product Catalog</span>
        </NuxtLink>

        <!-- 分类导航（桌面） -->
        <nav class="hidden md:flex items-center gap-1 flex-1 overflow-x-auto">
          <NuxtLink
            v-for="cat in categories"
            :key="cat.id"
            :to="localePath(`/${cat.slug}`)"
            :class="[
              'px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition',
              activeCategory === cat.slug
                ? 'bg-brand-50 text-brand-700 font-medium'
                : 'text-gray-50 hover:text-gray-900 hover:bg-gray-50',
            ]"
          >
            {{ cat.name[locale] || cat.name.en }}
          </NuxtLink>
        </nav>

        <div class="ml-auto flex items-center gap-2">
          <!-- 语言切换 -->
          <LangSwitcher />

          <!-- 移动端菜单按钮 -->
          <button
            class="md:hidden p-2 rounded-lg text-gray-400 hover:bg-gray-50 transition-colors"
            @click="mobileMenuOpen = !mobileMenuOpen"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                :d="mobileMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </header>

  <!-- 🔥 升级后的移动端遮罩菜单（全屏覆盖 + 动画） -->
  <div
    v-if="mobileMenuOpen"
    class="fixed inset-0 z-30 md:hidden"
  >
    <!-- 遮罩层 -->
    <div 
      class="absolute inset-0 bg-black/25 backdrop-blur-sm"
      @click="mobileMenuOpen = false"
    ></div>

    <!-- 菜单内容 -->
    <div 
      class="absolute top-16 inset-x-0 bg-white shadow-lg border-t border-gray-100 transform transition-transform duration-300 ease-out"
      :class="mobileMenuOpen ? 'translate-y-0' : '-translate-y-full'"
    >
      <div class="px-4 py-3 space-y-1">
        <NuxtLink
          v-for="cat in categories"
          :key="cat.id"
          :to="localePath(`/${cat.slug}`)"
          class="block px-3 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
          @click="mobileMenuOpen = false"
        >
          {{ cat.name[locale] || cat.name.en }}
        </NuxtLink>
      </div>
    </div>
  </div>
</template>