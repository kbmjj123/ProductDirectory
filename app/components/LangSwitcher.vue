<script setup lang="ts">
const { locale, locales } = useI18n()
const switchLocalePath = useSwitchLocalePath()
import { onClickOutside } from '@vueuse/core'
const open = ref(false)
const dropdownRef = ref<HTMLElement>()

const availableLocales = computed(() =>
  locales.value.filter(l => typeof l === 'object') as Array<{ code: string; name: string }>
)

function close() { open.value = false }

// 点击外部关闭
onClickOutside(dropdownRef, close)

const currentLocale = computed(() =>
  availableLocales.value.find(l => l.code === locale.value)
)
</script>

<template>
  <div ref="dropdownRef" class="relative">
    <button
      class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition"
      @click="open = !open"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
      </svg>
      {{ currentLocale?.name }}
      <svg class="w-3.5 h-3.5 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <!-- 下拉菜单 -->
    <div
      v-if="open"
      class="absolute right-0 top-full mt-1 w-36 bg-white border border-gray-100 rounded-xl shadow-lg py-1 z-50"
    >
      <NuxtLink
        v-for="l in availableLocales"
        :key="l.code"
        :to="switchLocalePath(l.code)"
        :class="[
          'flex items-center justify-between px-4 py-2 text-sm transition',
          l.code === locale.value
            ? 'text-brand-600 font-medium bg-brand-50'
            : 'text-gray-600 hover:bg-gray-50',
        ]"
        @click="close"
      >
        {{ l.name }}
        <svg v-if="l.code === locale.value" class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
        </svg>
      </NuxtLink>
    </div>
  </div>
</template>
