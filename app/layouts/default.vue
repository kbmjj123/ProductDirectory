<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <TheHeader />
    <main class="flex-1">
      <slot />
    </main>
    <footer class="border-t border-gray-100 bg-white mt-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p class="text-xs text-gray-400 text-center">
          © {{ new Date().getFullYear() }} Product Catalog. All rights reserved.
        </p>
      </div>
    </footer>
  </div>
</template>
