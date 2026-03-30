<script setup lang="ts">
import type { UploadProgress, UploadResult } from '~/composables/useImageUpload'

const props = defineProps<{
  modelValue: UploadResult[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: UploadResult[]]
}>()

const { uploadImages } = useImageUpload()

const fileInputRef = ref<HTMLInputElement>()
const progress = ref<UploadProgress[]>([])
const isDragging = ref(false)

/** 触发文件选择 */
function openFilePicker() {
  fileInputRef.value?.click()
}

/** 处理文件选择 / 拖拽 */
async function handleFiles(files: FileList | File[]) {
  const fileArr = Array.from(files).filter(f => f.type.startsWith('image/'))
  if (!fileArr.length) return

  const results = await uploadImages(fileArr, (p) => {
    progress.value = p
  })

  // 追加到已有图片列表
  emit('update:modelValue', [...props.modelValue, ...results])
  progress.value = []
}

function onInputChange(e: Event) {
  const input = e.target as HTMLInputElement
  if (input.files) handleFiles(input.files)
  input.value = '' // 允许重复选择同一文件
}

function onDrop(e: DragEvent) {
  isDragging.value = false
  if (e.dataTransfer?.files) handleFiles(e.dataTransfer.files)
}

/** 移除图片 */
function removeImage(index: number) {
  const newVal = [...props.modelValue]
  newVal.splice(index, 1)
  emit('update:modelValue', newVal)
}

const isUploading = computed(() => progress.value.some(p => ['converting', 'uploading'].includes(p.status)))
</script>

<template>
  <div class="space-y-3">
    <!-- 已上传图片预览 -->
    <div v-if="modelValue.length" class="grid grid-cols-3 sm:grid-cols-4 gap-3">
      <div
        v-for="(img, idx) in modelValue"
        :key="img.url"
        class="relative group aspect-square rounded-lg overflow-hidden border border-gray-200"
      >
        <img :src="img.thumb || img.url" alt="" class="w-full h-full object-cover">
        <button
          class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white"
          type="button"
          @click="removeImage(idx)"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>

    <!-- 上传进度 -->
    <div v-if="progress.length" class="space-y-2">
      <div
        v-for="item in progress"
        :key="item.file"
        class="flex items-center gap-3 text-sm"
      >
        <div class="w-5 h-5 flex-shrink-0">
          <svg v-if="item.status === 'done'" class="text-green-500 w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
          </svg>
          <svg v-else-if="item.status === 'error'" class="text-red-500 w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
          <svg v-else class="animate-spin text-brand-500 w-5 h-5" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
        <span class="flex-1 truncate text-gray-600">{{ item.file }}</span>
        <span :class="{
          'text-green-600': item.status === 'done',
          'text-red-500': item.status === 'error',
          'text-brand-500': ['converting', 'uploading'].includes(item.status),
          'text-gray-400': item.status === 'pending',
        }">
          {{ { pending: '等待中', converting: '转换 WebP...', uploading: '上传中...', done: '完成', error: item.error || '失败' }[item.status] }}
        </span>
      </div>
    </div>

    <!-- 拖拽上传区域 -->
    <div
      :class="[
        'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition',
        isDragging ? 'border-brand-400 bg-brand-50' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50',
        isUploading ? 'pointer-events-none opacity-60' : '',
      ]"
      @click="openFilePicker"
      @dragover.prevent="isDragging = true"
      @dragleave="isDragging = false"
      @drop.prevent="onDrop"
    >
      <svg class="w-8 h-8 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      <p class="text-sm text-gray-500">
        <span class="text-brand-600 font-medium">点击上传</span>
        或拖拽图片到这里
      </p>
      <p class="text-xs text-gray-400 mt-1">支持 JPG、PNG、GIF、WebP，自动转换为 WebP 格式</p>
    </div>

    <input
      ref="fileInputRef"
      type="file"
      accept="image/*"
      multiple
      class="hidden"
      @change="onInputChange"
    >
  </div>
</template>
