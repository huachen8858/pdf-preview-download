<template>
  <div v-if="props.pdfUrl" class="pdf-preview">
    <iframe
      :src="pdfUrl"
      width="100%"
      height="100%"
      style="border: none"
    ></iframe>
  </div>
  <div v-else>
    <p>Loading preview...</p>
  </div>
</template>

<script setup>
import { onMounted } from "vue";

const props = defineProps({
  pdfUrl: {
    type: String,
    require: true,
  },
});

onMounted(() => {
});
</script>

<style scoped>
.pdf-preview{
  width: 100%;
  height: 100%;
}
</style>
