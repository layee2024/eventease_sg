<script setup>
import { computed } from "vue"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"

const props = defineProps({
  label: { type: String, required: true },
  options: { type: Array, required: true },
  modelValue: { type: Array, default: () => [] },
  open: { type: Boolean, default: false },
})

const emit = defineEmits(["update:modelValue", "update:open"])

const nonAllLabels = computed(() =>
  props.options.filter(o => o.label !== "All").map(o => o.label)
)

const isAllChecked = computed(() =>
  props.modelValue.length === nonAllLabels.value.length
)

function toggleAll() {
  if (isAllChecked.value) {
    emit("update:modelValue", [])
  } else {
    emit("update:modelValue", [...nonAllLabels.value])
  }
}

function toggleValue(label) {
  const next = new Set(props.modelValue)
  next.has(label) ? next.delete(label) : next.add(label)
  const asArray = Array.from(next)

  emit("update:modelValue", asArray)
}

const summaryText = computed(() => {
  const count = props.modelValue.length
  if (count === nonAllLabels.value.length) return "All"
  if (count > 1) return `${count} Selected`
  if (count === 1) return props.modelValue[0]
  return props.label
})
</script>

<template>
  <Popover :open="open" @update:open="v => emit('update:open', v)">
    <PopoverTrigger as-child>
      <Button
        variant="outline"
        role="combobox"
        class="cursor-pointer w-full justify-between rounded-xl border-gray-200 text-neutral-500 hover:bg-gray-100 hover:text-black"
      >
        {{ summaryText }}
        <svg xmlns="http://www.w3.org/2000/svg" class="ml-2 h-4 w-4 shrink-0 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </Button>
    </PopoverTrigger>

    <PopoverContent align="start" class="w-[220px] p-1 bg-white shadow-md rounded-xl border border-gray-200">
      <div class="flex flex-col divide-y divide-gray-200">
        <!-- All -->
        <div class="py-1">
          <label class="flex items-center space-x-2 rounded-md px-3 py-2 cursor-pointer transition-colors hover:bg-gray-100">
            <input
              type="checkbox"
              class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              :checked="isAllChecked"
              @change="toggleAll"
            />
            <span class="text-sm text-gray-700 font-medium">All</span>
          </label>
        </div>

        <!-- Others -->
        <div class="flex flex-col py-1">
          <label
            v-for="opt in options.filter(o => o.label !== 'All')"
            :key="opt.value"
            class="flex items-center space-x-2 rounded-md px-3 py-2 cursor-pointer transition-colors hover:bg-gray-100"
          >
            <input
              type="checkbox"
              class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              :checked="modelValue.includes(opt.label)"
              @change="toggleValue(opt.label)"
            />
            <span
              class="text-sm text-gray-700"
              :class="{ 'font-medium text-gray-900': modelValue.includes(opt.label) }"
            >
              {{ opt.label }}
            </span>
          </label>
        </div>
      </div>
    </PopoverContent>
  </Popover>
</template>
