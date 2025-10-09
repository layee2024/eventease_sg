<script setup>
import { ref, onMounted } from "vue"
import { useRouter } from "vue-router"
import { supabase } from "../../utils/supabase"
import { Button } from "@/components/ui/button"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from '@/components/ui/navigation-menu'

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
  <nav class="w-full bg-white shadow-sm py-3 px-6 flex items-center justify-between font-poppins">
    <!-- Logo -->
    <router-link to="/" class="flex items-center space-x-2">
      <div class="flex items-center justify-center bg-black text-white rounded-md w-7 h-7 font-bold">
        <span>E</span>
      </div>
      <span class="font-bold text-base text-gray-800">EventEase SG</span>
    </router-link>
    
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

    <!-- Right side buttons -->
    <div class="flex items-center space-x-3">
      <!-- If NOT logged in -->
      <template v-if="!isLoggedIn">
        <router-link 
          to="/login" 
          class="border border-blue-600 text-blue-600 hover:bg-blue-50 font-medium px-4 py-1.5 rounded-md transition-colors"
        >
          Login
        </router-link>
        <router-link 
          to="/register" 
          class="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-1.5 rounded-md transition-colors"
        >
          Register
        </router-link>
      </template>

      <!-- If logged in -->
      <template v-else>
        <router-link 
          to="/profile"
          class="border border-gray-400 text-gray-700 hover:bg-gray-100 font-medium px-4 py-1.5 rounded-md transition-colors"
        >
          Profile
        </router-link>
        <Button variant="outline" @click="logout">Logout</Button>
      </template>
    </div>
  </nav>
</template>

<style scoped>
    .font-poppins {
    font-family: 'Poppins', sans-serif;
    }
</style>
