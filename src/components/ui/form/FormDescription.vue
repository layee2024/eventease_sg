<script setup>
import { cn } from "@/lib/utils"
import { useFormField } from "./useFormField"

const { formDescriptionId } = useFormField()
const props = defineProps({
  class: {
    type: String,
    required: false
  }
})
</script>

<template>
  <p
    :id="formDescriptionId"
    :class="cn('text-sm text-muted-foreground', props.class)"
  >
    <slot />
  </p>
</template>