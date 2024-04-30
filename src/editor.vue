<script lang="ts" setup>
import { useEventListener } from '@vueuse/core'
import * as monaco from 'monaco-editor'
import type {
  CSSProperties,
} from 'vue'
import {
  computed,
  defineEmits,
  defineExpose,
  defineProps,
  onMounted,
  onUnmounted,
  ref,
  shallowRef,
  toRefs,
  watch,
  withDefaults,
} from 'vue'

// Define the props for the component
interface IProps {
  value: string
  theme: string
  readOnly: boolean

  width: number
  height: number

  autoResize: boolean
  defaultValue: string
  language: string
  className: string
  style: CSSProperties

  overrideServices?: monaco.editor.IEditorOverrideServices
  options?: monaco.editor.IStandaloneEditorConstructionOptions
  uri?: (arg: typeof monaco) => monaco.Uri
}

// Set default values for the props
const props = withDefaults(defineProps<IProps>(), {
  theme: 'vs',
  className: '',
  style: () => ({}),
  autoResize: false,
  readOnly: false,
})

// Define the events emitted by the component
const emits = defineEmits(['editorDidMount', 'change'])

// Create a ref for the Monaco editor element
const monacoEditorRef = ref<HTMLElement>()

// Create a shallow ref for the subscription to model content changes
const subscription = shallowRef<ReturnType<monaco.editor.IStandaloneCodeEditor['onDidChangeModelContent']>>()

// Destructure the width and height props
const { width, height } = toRefs(props)

// Create a shallow ref for the Monaco editor instance
const editor = shallowRef<monaco.editor.IStandaloneCodeEditor>()

// Compute the style object for the editor element
const style = computed(() => {
  const obj: CSSProperties = {}
  if (width.value)
    obj.width = `${width.value}px`
  if (height.value)
    obj.height = `${height.value}px`

  return {
    ...obj,
    ...props.style,
  }
})

// Function called when the editor is mounted
function handleDidMount(editorInstance?: monaco.editor.IStandaloneCodeEditor) {
  emits('editorDidMount', editorInstance)

  // Subscribe to model content changes
  subscription.value = editor.value!.onDidChangeModelContent((event) => {
    const value = editor.value?.getValue()
    emits('change', {
      value,
      event,
    })
  })
}

// Function called to initialize Monaco
function initialMonaco() {
  const _value = props.value !== null ? props.value : props.defaultValue
  if (monacoEditorRef.value) {
    const monacoOptions = props.options ?? null
    const modelUri = props.uri?.(monaco)
    let _model = modelUri && monaco.editor.getModel(modelUri)

    // If the model exists, update its value and language
    if (_model) {
      _model.setValue(_value)
      monaco.editor.setModelLanguage(_model, props.language)
    }
    // If the model doesn't exist, create a new one
    else {
      _model = monaco.editor.createModel(_value, props.language, modelUri)
    }

    // Create the Monaco editor instance
    editor.value = monaco.editor.create(
      monacoEditorRef.value,
      {
        model: _model,
        theme: props.theme,
        ...monacoOptions,
        ...{ extraEditorClassName: props.className ? props.className : '' },
      },
      props.overrideServices,
    )

    // Call the handleDidMount function
    handleDidMount(editor.value)
  }
}

// Function called to resize the editor
function resize() {
  editor.value?.layout()
}

// Listen for the resize event and call the resize function
useEventListener('resize', () => {
  if (props.autoResize)
    resize()
})

// Call the initialMonaco function when the component is mounted
onMounted(initialMonaco)

// Watch for changes in the language prop and update the editor's language
watch(
  () => props.language,
  (newLanguage) => {
    if (editor.value && newLanguage) {
      const editorModel = editor.value.getModel()
      if (editorModel)
        monaco.editor.setModelLanguage(editorModel, newLanguage!)
    }
  },
)

// Watch for changes in the theme prop and update the editor's theme
watch(
  () => props.theme,
  (newTheme) => {
    if (editor.value && newTheme)
      monaco.editor.setTheme(newTheme)
  },
)

// Watch for changes in the className prop and update the editor's options
watch(() => props.className, (cls) => {
  if (editor.value) {
    editor.value.updateOptions({
      extraEditorClassName: cls || '',
    })
  }
})

// Watch for changes in the options prop and update the editor's options
watch(() => props.options, (data) => {
  if (!editor.value)
    return
  if (data) {
    const { model: _model, ...rest } = data
    editor.value.updateOptions(rest)
  }
})

// Watch for changes in the value prop and update the editor's value
watch(
  () => props.value,
  (newValue) => {
    if (newValue === editor.value?.getValue())
      return

    if (!editor.value)
      return
    const _model = editor.value.getModel()
    editor.value.pushUndoStop()
    _model!.pushEditOperations(
      [],
      [
        {
          range: _model!.getFullModelRange(),
          text: newValue,
        },
      ],
      undefined as any,
    )
    editor.value.pushUndoStop()
  },
)

// Watch for changes in the width and height props and call the resize function
watch(
  () => [props.width, props.height],
  () => {
    resize()
  },
)

// Clean up the editor and subscription when the component is unmounted
onUnmounted(() => {
  if (editor.value)
    editor.value.dispose()

  subscription.value?.dispose()
})

// Expose the resize function to the parent component
defineExpose({
  resize,
})
</script>

<template>
  <div ref="monacoEditorRef" :style="style">
    <slot />
  </div>
</template>
