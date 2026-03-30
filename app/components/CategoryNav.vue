<script setup lang="ts">
defineProps<{
  categories: Array<{ id: string; slug: string; name: Record<string, string> }>
  activeSlug?: string
}>()

const { locale } = useI18n()
const localePath = useLocalePath()
</script>

<template>
  <nav class="space-y-0.5">
    <NuxtLink
      v-for="cat in categories"
      :key="cat.id"
      :to="localePath(`/${cat.slug}`)"
      :class="[
        'flex items-center px-3 py-2 rounded-lg text-sm transition',
        activeSlug === cat.slug
          ? 'bg-brand-50 text-brand-700 font-medium'
          : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900',
      ]"
    >
      {{ cat.name[locale] || cat.name.en }}
    </NuxtLink>
  </nav>
</template>
