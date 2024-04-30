<script setup lang="ts">
import { ref } from 'vue'

const inputValue = ref('')

function handleChange({ value }: { value: string | undefined }) {
  inputValue.value = value || ''
}
</script>

<template>
  <div class=" w-full h-screen flex flex-row">
    <div class="w-[300px] h-full">
      <monaco-editor
        :value="inputValue" class-name="h-full w-full" :style="{
          width: '100%',
          height: '100%',
        }"

        @change="handleChange"
      />
    </div>

    <div class="flex-1 h-full flex flex-col">
      <p class="p-[10px] border-[1px] border-back border-solid">
        查看左右侧内容是否一致 check left/right value
      </p>
      <textarea v-model="inputValue" class="w-full flex-1 min-h-0" />
    </div>
  </div>
</template>

<style scoped>
</style>
