<script setup>
import { ref, computed, watch } from "vue";
import { supabase } from "@/utils/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { Heart } from "lucide-vue-next";
import { toast } from "vue-sonner";

const props = defineProps({
  id: String,
  title: String,
  category: String,
  categoryColor: String,
  location: String,
  price: String,
  date: String,
  crowd: String,
  image: String,
  liked: { type: Boolean, default: false },
});

const emit = defineEmits(["update-saved"]);
const isLiked = ref(props.liked);

watch(
  () => props.liked,
  (val) => (isLiked.value = val)
);

async function toggleLike() {
  isLiked.value = !isLiked.value;
  emit("update-saved", { id: props.id, liked: isLiked.value });

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { data: pref } = await supabase
    .from("preferences")
    .select("saved")
    .eq("id", user.id)
    .single();

  let updated = pref?.saved || [];
  if (isLiked.value) {
    if (!updated.includes(props.id)) updated.push(props.id);
    toast.success(`${props.title} added to saved events`);
  } else {
    updated = updated.filter((x) => x !== props.id);
    toast.error(`${props.title} removed from saved events`);
  }

  await supabase
    .from("preferences")
    .update({ saved: updated })
    .eq("id", user.id);
}

const crowdColor = computed(() => {
  const level = (props.crowd || "").toLowerCase();
  if (level.includes("low") || level.includes("quiet")) return "bg-green-500";
  if (level.includes("moderate") || level.includes("medium"))
    return "bg-orange-400";
  if (level.includes("high") || level.includes("busy")) return "bg-red-500";
  return "bg-gray-400";
});
</script>

<template>
  <Card
    class="relative overflow-hidden rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-lg hover:-translate-y-1 duration-300"
  >
    <div class="relative">
      <img
        :src="image"
        :alt="title"
        class="w-full h-52 object-cover transition-transform duration-500 group-hover:scale-105"
      />

      <div
        class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"
      />

      <button
        @click.stop="toggleLike"
        class="absolute top-3 right-3 bg-white/90 hover:bg-red-100 text-red-500 rounded-full p-2 shadow-md transition"
      >
        <Heart
          class="w-5 h-5 transition-transform duration-200"
          :class="isLiked ? 'fill-red-500 scale-110' : 'fill-none scale-100'"
        />
      </button>

      <!-- Category -->
      <span
        class="absolute top-3 left-3 text-xs font-medium text-white px-3 py-1 rounded-full"
        :class="categoryColor"
      >
        {{ category }}
      </span>

      <!-- Crowd -->
      <span
        class="absolute bottom-3 right-3 text-xs font-medium text-white bg-black/50 backdrop-blur-sm px-2.5 py-1 rounded-full flex items-center gap-1"
      >
        <span :class="['w-2 h-2 rounded-full', crowdColor]" />
        {{ crowd }}
      </span>
    </div>

    <!-- Card content -->
    <CardContent class="p-4">
      <h3 class="font-semibold text-gray-900 text-base truncate mb-1">
        {{ title }}
      </h3>
      <p class="text-sm text-gray-500 truncate">{{ location }}</p>

      <div class="flex justify-between items-center mt-3">
        <span
          class="text-sm font-medium"
          :class="{
            'text-green-600': price.toLowerCase() === 'free',
            'text-blue-600': price.toLowerCase() !== 'free',
          }"
        >
          {{ price }}
        </span>
        <span class="text-sm text-gray-400">{{ date }}</span>
      </div>
    </CardContent>
  </Card>
</template>
