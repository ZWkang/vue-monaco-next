import { createApp } from 'vue'
import './style.css'
import MonacoEditor from '../../'
import App from './App.vue'

const app = createApp(App)
app.component('monaco-editor', MonacoEditor)
app.mount('#app')
