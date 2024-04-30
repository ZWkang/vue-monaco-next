# vue-monaco-next

api is currently unstable, please do not use it in production immediately as there may be breaking changes.

a simple vue3 monaco editor component

## Try it now

```bash
pnpm install vue-monaco-next
# or
yarn add vue-monaco-next
# or
npm install vue-monaco-next
```

```typescript
import { createApp } from 'vue'
import App from './App.vue'
import MonacoEditor from 'vue-monaco-next'

createApp(App)
  .component('monaco-editor', MonacoEditor)
  .mount('#app')
```

```vue
<script setup>
import { ref } from 'vue'
import MonacoEditor from 'vue-monaco-next'

const code = ref('const a = 1')
</script>

<template>
  <MonacoEditor v-model="code" />
</template>
```

## example

[example](./example)

## LICENSE

[MIT](./LICENSE) License © 2022 [zwkang](https://github.com/zwkang)
