<script setup>
import { ref, onMounted } from "vue"

const props = defineProps({
  text: {
    type: String,
    required: true
  },
  classes: {
    type: String,
    default: ""
  },
  cursorColor: {
    type: String,
    default: "bg-white"
  }
})

const typedText = ref("")
const cursorBlink = ref(true)
let charIndex = 0
const speed = 100

const type = () => {
  if (charIndex < props.text.length) {
    cursorBlink.value = false
    typedText.value += props.text.charAt(charIndex)
    charIndex++
    setTimeout(type, speed)
  } else {
    cursorBlink.value = true
  }
}

onMounted(() => {
    setTimeout(type, 500)
})
</script>

<template>
  <p class="inline-flex items-center">
    <span :class="props.classes">{{ typedText }}</span>
    <span class="cursor" :class="[cursorBlink ? 'blink' : '', props.cursorColor]">&nbsp;</span>
  </p>
</template>

<style scoped>
.cursor {
  display: inline-block;
  width: 3px;
  margin-left: 4px;
}

.cursor.blink {
  animation: blink 1s ease-in-out infinite;
}

@keyframes blink {
  0%, 100% {
    opacity: 1;
  }
  40%, 50% {
    opacity: 0;
  }
}
</style>
