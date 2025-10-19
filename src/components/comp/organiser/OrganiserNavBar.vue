<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { supabase } from "../../utils/supabase";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const router = useRouter();
const route = useRoute();
const user = ref(null);
const isLoggedIn = ref(false);
const mobileMenuOpen = ref(false);

onMounted(async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  isLoggedIn.value = !!session;

  supabase.auth.onAuthStateChange((_event, session) => {
    isLoggedIn.value = !!session;
  });

  if (session?.user) {
    user.value = session.user;
  }

  const handleResize = () => {
    if (window.innerWidth >= 768) {
      mobileMenuOpen.value = false;
    }
  };
  window.addEventListener("resize", handleResize);
  onUnmounted(() => window.removeEventListener("resize", handleResize));
});

async function logout() {
  await supabase.auth.signOut();
  isLoggedIn.value = false;
  router.push("/login");
}

function isActive(path) {
  return route.path === path;
}
</script>

<template>
  <nav class="sticky top-0 z-50 bg-white shadow-sm w-full">
    <div class="flex items-center justify-between py-3 px-6">
      <!-- Logo -->
      <router-link to="/" class="flex items-center space-x-2">
        <div class="flex justify-center items-center">
          <img
            src="../../assets/logo.png"
            alt="EventEase Logo"
            class="h-10 w-auto"
          />
          <span class="font-semibold text-sm">EventEase SG (Organiser)</span>
        </div>
      </router-link>

      <!-- Desktop Nav Links -->
      <div class="hidden lg:flex items-center space-x-6">
        <router-link
          to="/organiser/home"
          class="flex items-center gap-1 font-medium hover:text-blue-600 transition"
          :class="{ 'text-blue-600 border-b-2 border-blue-600': isActive('/organiser/home') }"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-4">
            <path d="M11.47 3.841a.75.75 0 0 1 1.06 0l8.69 8.69a.75.75 0 1 0 1.06-1.061l-8.689-8.69a2.25 2.25 0 0 0-3.182 0l-8.69 8.69a.75.75 0 1 0 1.061 1.06l8.69-8.689Z"/>
            <path d="m12 5.432 8.159 8.159v6.198a1.875 1.875 0 0 1-1.875 1.875H5.625A1.875 1.875 0 0 1 3.75 19.79v-6.198L12 5.432Z"/>
          </svg>
          Home
        </router-link>

        <router-link
          to="/organiser/dashboard"
          class="flex items-center gap-1 font-medium hover:text-blue-600 transition"
          :class="{ 'text-blue-600 border-b-2 border-blue-600': isActive('/organiser/dashboard') }"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" class="size-4">
            <path fill-rule="evenodd" d="M2.25 13.5A.75.75 0 0 1 3 12.75h18a.75.75 0 0 1 0 1.5H3a.75.75 0 0 1-.75-.75Zm0-6A.75.75 0 0 1 3 6.75h18a.75.75 0 0 1 0 1.5H3a.75.75 0 0 1-.75-.75Zm0 12A.75.75 0 0 1 3 18.75h18a.75.75 0 0 1 0 1.5H3a.75.75 0 0 1-.75-.75Z" clip-rule="evenodd"/>
          </svg>
          Dashboard
        </router-link>

        <router-link
          to="/organiser/myevents"
          class="flex items-center gap-1 font-medium hover:text-blue-600 transition"
          :class="{ 'text-blue-600 border-b-2 border-blue-600': isActive('/organiser/myevents') }"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" class="size-4">
            <path d="M4.5 4.5h15a.75.75 0 0 1 .75.75V21a.75.75 0 0 1-1.085.67L12 18.09l-7.165 3.58A.75.75 0 0 1 3.75 21V5.25a.75.75 0 0 1 .75-.75Zm.75 1.5v13.68l6.415-3.205a.75.75 0 0 1 .67 0L18.75 19.68V6H5.25Z"/>
          </svg>
          My Events
        </router-link>
      </div>

      <!-- Account Menu -->
      <div class="hidden lg:flex items-center space-x-3">
        <template v-if="!isLoggedIn">
          <Button variant="outline" @click="router.push('/register')" class="font-medium">Register</Button>
          <Button @click="router.push('/login')" class="font-medium">Login</Button>
        </template>

        <template v-else>
          <DropdownMenu>
            <DropdownMenuTrigger as-child>
              <Button variant="outline" class="font-medium flex items-center gap-1 cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-4">
                  <path fill-rule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.75 20.1a8.25 8.25 0 0 1 16.5 0 .75.75 0 0 1-.43.7A18.6 18.6 0 0 1 12 22.5a18.6 18.6 0 0 1-7.82-1.7.75.75 0 0 1-.43-.7Z" clip-rule="evenodd"/>
                </svg>
                Account
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" class="w-44">
              <DropdownMenuItem @click="router.push('/organiser/profile')" class="cursor-pointer">Profile</DropdownMenuItem>
              <DropdownMenuItem @click="router.push('/organiser/myevents')" class="cursor-pointer">My Events</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem @click="logout" class="text-red-600 cursor-pointer">Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </template>
      </div>

      <!-- Mobile Hamburger -->
      <button
        @click="mobileMenuOpen = !mobileMenuOpen"
        class="lg:hidden flex flex-col justify-center items-center space-y-1.5"
      >
        <span class="block w-6 h-0.5 bg-gray-700"></span>
        <span class="block w-6 h-0.5 bg-gray-700"></span>
        <span class="block w-6 h-0.5 bg-gray-700"></span>
      </button>
    </div>

    <!-- Mobile Menu -->
    <transition name="slide-fade">
      <div
        v-if="mobileMenuOpen"
        class="flex flex-col px-6 py-4 border-t border-gray-200 bg-white space-y-4 lg:hidden"
      >
        <router-link
          to="/organiser/home"
          class="font-medium"
          :class="{ 'text-blue-600': isActive('/organiser/home') }"
          @click="mobileMenuOpen = false"
        >Home</router-link>

        <router-link
          to="/organiser/dashboard"
          class="font-medium"
          :class="{ 'text-blue-600': isActive('/organiser/dashboard') }"
          @click="mobileMenuOpen = false"
        >Dashboard</router-link>

        <router-link
          to="/organiser/myevents"
          class="font-medium"
          :class="{ 'text-blue-600': isActive('/organiser/myevents') }"
          @click="mobileMenuOpen = false"
        >My Events</router-link>

        <div class="border-t border-gray-200 my-2"></div>

        <template v-if="!isLoggedIn">
          <Button variant="outline" @click="router.push('/register'); mobileMenuOpen = false;" class="w-full font-medium">Register</Button>
          <Button @click="router.push('/login'); mobileMenuOpen = false;" class="w-full font-medium">Login</Button>
        </template>

        <template v-else>
          <Button @click="router.push('/organiser/profile'); mobileMenuOpen = false;" class="w-full">Profile</Button>
          <Button @click="router.push('/organiser/myevents'); mobileMenuOpen = false;" class="w-full">My Events</Button>
          <Button @click="logout" class="w-full bg-red-500 text-white hover:bg-red-600">Logout</Button>
        </template>
      </div>
    </transition>
  </nav>
</template>

<style scoped>
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.25s ease;
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
