<script setup>
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"
import { useFormField } from "./useFormField"

const { error, formItemId } = useFormField()
const props = defineProps({
  class: {
    type: String,
    required: false
  }
})
</script>

<template>
  <Label
    :class="cn(
      error && 'text-destructive',
      props.class,
    )"
    :for="formItemId"
  >
    <slot />
  </Label>
</template>