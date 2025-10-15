<script setup>
import { ref, onMounted } from "vue"
import { useRouter } from "vue-router"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { supabase } from "../utils/supabase"
import { toast } from "vue-sonner"

const router = useRouter()
const email = ref("")
const password = ref("")
const loading = ref(false)
const isOrganiser = ref(false)

onMounted(async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (session) {
    router.push("/") // TODO: adjust later for admin/organiser
    return
  }
})

async function handleLogin() {
  try {
    loading.value = true

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value,
    })

    if (error) {
      if (error.message.includes("Email not confirmed")) {
        toast.error("Please verify your email before logging in.")
      } else {
        toast.error("Invalid credentials.")
      }
      return
    }

    toast.success("Welcome back!")

    // Get user ID
    const user = data.user
    if (!user) {
      toast.error("No user session found.")
      return
    }

    // Fetch onboarding status
    const { data: prefs, error: prefsError } = await supabase
      .from("user_preferences")
      .select("onboarding")
      .eq("id", user.id)
      .maybeSingle()

    if (prefsError) {
      console.error(prefsError)
      toast.error("Error checking onboarding status.")
      return
    }

    if (isOrganiser.value) {
      router.push("/dashboard")
    } else if (!prefs || prefs.onboarding === false) {
      router.push("/onboarding") // send new user to onboarding
    } else {
      router.push("/")
    }
  } catch (err) {
    console.error(err)
    toast.error("Login failed. Try again.")
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex items-center justify-center px-4 py-10 h-full">
    <Card class="mx-auto max-w-md w-full">
      <CardHeader>
        <CardTitle class="text-xl">Login</CardTitle>
        <CardDescription>
          Toggle below to login as a
          <b>{{ isOrganiser ? "Organiser" : "User" }}</b>.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div class="relative flex bg-gray-100 rounded-xl p-1 mb-6">
          <button
            class="w-1/2 py-2 rounded-lg font-medium transition-all duration-300"
            :class="isOrganiser ? 'text-gray-500' : 'bg-black text-white'"
            @click="isOrganiser = false"
          >
            User
          </button>
          <button
            class="w-1/2 py-2 rounded-lg font-medium transition-all duration-300"
            :class="isOrganiser ? 'bg-black text-white' : 'text-gray-500'"
            @click="isOrganiser = true"
          >
            Organiser
          </button>
        </div>

        <form @submit.prevent="handleLogin" class="grid gap-4">
          <div class="grid gap-2">
            <Label for="email">Email</Label>
            <Input id="email" type="email" v-model="email" required />
          </div>

          <div class="grid gap-2">
            <Label for="password">Password</Label>
            <Input id="password" type="password" v-model="password" required />
          </div>

          <Button
            type="submit"
            class="cursor-pointer w-full"
            :disabled="loading"
          >
            {{ loading ? "Logging in..." : "Login" }}
          </Button>

          <div class="mt-4 text-center text-sm">
            Don't have an account?
            <RouterLink to="/register" class="cursor-pointer underline">
              Register here
            </RouterLink>
          </div>
        </form>
      </CardContent>
    </Card>
  </div>
</template>
