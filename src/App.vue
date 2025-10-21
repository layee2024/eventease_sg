<script setup>
  import { RouterView } from 'vue-router'
  import { Toaster } from '@/components/ui/sonner'
  import NavBar from './components/comp/user/UserNavBar.vue'
  import Footer from './components/comp/Footer.vue'
  import 'vue-sonner/style.css'

</script>

<template>
  <div id="app" class="min-h-screen flex flex-col">
  <NavBar />
  <div class="fixed top-[5%] right-0 z-[100] flex max-h-screen w-full translate-y-[-5%] p-4 sm:right-0 sm:flex-col md:max-w-[420px]">
    <Toaster position="top-right" />
  </div>

  <main class="flex-1 overflow-y-auto">
    <RouterView v-slot="{ Component }">
      <Transition name="page-slide" mode="out-in">
        <component :is="Component" />
      </Transition>
    </RouterView>
  </main>

  <Footer class="fixed bottom-0 left-0 w-full z-50" />
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
