<script setup>
  import { RouterView } from 'vue-router';
  import { Toaster } from '@/components/ui/sonner';
  import NavBar from './components/comp/NavBar.vue';
  import 'vue-sonner/style.css'

</script>

<template>
  <div id="app" class="min-h-screen h-full">
    <NavBar />
    <Toaster position="bottom-right" />
    <div class="h-[90vh] w-screen">
      <RouterView class="router-view" v-slot="{ Component }">
        <Transition name="page-slide" mode="out-in" >
          <component :is="Component" />
        </Transition>
      </RouterView>
    </div>
  </div>
</template>

<style>
  .page-slide-enter-active,
  .page-slide-leave-active {
    transition: 600ms ease all;
  }

  .page-slide-enter-from,
  .page-slide-leave-to {
    opacity: 0;
    transform: translateY(60px);
  }
</style>
