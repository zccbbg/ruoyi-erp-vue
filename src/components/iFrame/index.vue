<template>
  <div v-loading="loading" :style="'height:' + height">
    <iframe 
      :src="safeSrc" 
      frameborder="no" 
      style="width: 100%; height: 100%" 
      scrolling="auto" />
  </div>
</template>

<script setup>
const props = defineProps({
  src: {
    type: String,
    required: true
  }
})

const height = ref(document.documentElement.clientHeight - 94.5 + "px;")
const loading = ref(true)
/**
 * 方法用途：判断 iframe 地址是否为当前站点的内部路径。
 * 参数：url 为待校验的 iframe 地址。
 * 返回值：内部路径时返回 true，否则返回 false。
 */
function isInternalPath(url) {
  return typeof url === "string" && url.startsWith("/") && !url.startsWith("//");
}

// 仅允许同站点内部页面嵌入，外部地址统一替换为空白页。
const safeSrc = computed(() => isInternalPath(props.src) ? props.src : "about:blank")

onMounted(() => {
  setTimeout(() => {
    loading.value = false;
  }, 300);
  window.onresize = function temp() {
    height.value = document.documentElement.clientHeight - 94.5 + "px;";
  };
})
</script>
