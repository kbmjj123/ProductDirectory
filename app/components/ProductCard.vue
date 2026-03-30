<script setup lang="ts">
import type { Product } from '~/composables/useProduct'

const props = defineProps<{
  product: Product
}>()

const { locale } = useI18n()
const localePath = useLocalePath()

const title = computed(() =>
  props.product.title[locale.value as keyof typeof props.product.title]
  || props.product.title.en
)

const thumb = computed(() => props.product.images[0]?.thumb || props.product.images[0]?.url || '')
</script>

<template>
  <NuxtLink
    :to="localePath(`/products/${product.slug}`)"
    class="group block bg-white rounded-xl border border-gray-100 overflow-hidden hover:border-gray-200 hover:shadow-md transition-all"
  >
    <!-- 图片 -->
    <div class="aspect-square overflow-hidden bg-gray-50">
      <img
        v-if="thumb"
        :src="thumb"
        :alt="title"
        loading="lazy"
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
      >
      <div v-else class="w-full h-full flex items-center justify-center text-gray-200">
        <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1"
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    </div>

    <!-- 信息 -->
    <div class="p-4">
      <h3 class="text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-brand-600 transition-colors">
        {{ title }}
      </h3>
    </div>
  </NuxtLink>
</template>
