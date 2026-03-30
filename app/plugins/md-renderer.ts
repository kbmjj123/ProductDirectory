/**
 * 极简 Markdown 渲染插件
 * 支持：标题、粗体、斜体、行内代码、无序列表、有序列表、段落、换行
 * 不引入额外依赖；如需完整渲染可替换为 marked 或 markdown-it
 */
function renderMarkdown(md: string): string {
  if (!md) return ''

  let html = md
    // 标题
    .replace(/^### (.+)$/gm, '<h3 class="text-lg font-semibold mt-5 mb-2">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold mt-6 mb-3">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold mt-6 mb-3">$1</h1>')
    // 粗体 / 斜体
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // 行内代码
    .replace(/`(.+?)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">$1</code>')
    // 无序列表
    .replace(/^\s*[-*+] (.+)$/gm, '<li class="ml-4 list-disc">$1</li>')
    // 有序列表
    .replace(/^\s*\d+\. (.+)$/gm, '<li class="ml-4 list-decimal">$1</li>')
    // 段落（空行分隔）
    .replace(/\n\n+/g, '</p><p class="mb-3">')
    // 换行
    .replace(/\n/g, '<br>')

  return `<p class="mb-3">${html}</p>`
}

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.provide('mdRenderer', renderMarkdown)
})
