<script setup>
import { ref, onMounted } from "vue"
import { useRouter } from "vue-router"
import { supabase } from "../../utils/supabase"
import { Button } from "@/components/ui/button"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"

const router = useRouter()
const isLoggedIn = ref(false)

onMounted(async () => {
  const { data: { session } } = await supabase.auth.getSession()
  isLoggedIn.value = !!session

  supabase.auth.onAuthStateChange((_event, session) => {
    isLoggedIn.value = !!session
  })
})

async function logout() {
  await supabase.auth.signOut()
  isLoggedIn.value = false
  router.push("/login")
}
</script>

<template>
  <nav
    class="w-full bg-white shadow-sm py-3 px-6 flex items-center justify-between font-poppins"
  >
    <!-- Logo -->
    <router-link to="/" class="flex items-center space-x-2">
      <div
        class="flex items-center justify-center bg-black text-white rounded-md w-7 h-7 font-bold"
      >
        <span>E</span>
      </div>
      <span class="font-bold text-base text-gray-800">EventEase SG</span>
    </router-link>

    <!-- Navigation Menu -->
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Home</NavigationMenuTrigger>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Map</NavigationMenuTrigger>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Friends</NavigationMenuTrigger>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Saved</NavigationMenuTrigger>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>

    <!-- Right Side -->
    <div class="flex items-center space-x-3">
      <!-- If NOT logged in -->
      <template v-if="!isLoggedIn">
        <Button
          variant="outline"
          @click="router.push('/register')"
          class="px-4 py-1.5 font-medium"
        >
          Register
        </Button>
        <Button
          @click="router.push('/login')"
          class="px-4 py-1.5 font-medium"
        >
          Login
        </Button>
      </template>

      <!-- If logged in -->
      <template v-else>
        <Button
          @click="router.push('/profile')"
          class="px-4 py-1.5 font-medium"
        >
          Profile
        </Button>
        <Button variant="ghost" @click="logout" class="px-4 py-1.5 font-medium">
          Logout
        </Button>
      </template>
    </div>
  </nav>
</template>

<style scoped>
.font-poppins {
  font-family: "Poppins", sans-serif;
}
</style>
