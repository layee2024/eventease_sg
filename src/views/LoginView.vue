<script setup>
  import { ref, onMounted } from "vue"
  import { useRouter, useRoute } from "vue-router"
  import { Button } from "@/components/ui/button"
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
  import { Input } from "@/components/ui/input"
  import { Label } from "@/components/ui/label"
  import { supabase } from "../utils/supabase"
  import { toast } from "vue-sonner"

  const router = useRouter()
  const route = useRoute()
  const email = ref("")
  const password = ref("")
  const loading = ref(false)

  onMounted(() => {
    const type = route.query.type
    if (type === "signup") {
      toast.success("Your email has been verified! You can now log in.")
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
      router.push("/")

    } catch (err) {
      toast.error("Login failed. Try again.")
    } finally {
      loading.value = false
    }
  }
</script>

<template>
  <div class="flex items-center justify-center px-4 h-full">
    
    <Card class="mx-auto max-w-sm w-full">
      <CardHeader>
        <CardTitle class="text-xl">Login</CardTitle>
        <CardDescription>Welcome back! Sign in to continue.</CardDescription>
      </CardHeader>
      <CardContent>
        <form @submit.prevent="handleLogin" class="grid gap-4">
          <div class="grid gap-2">
            <Label for="email">Email</Label>
            <Input id="email" type="email" v-model="email" required />
          </div>

          <div class="grid gap-2">
            <Label for="password">Password</Label>
            <Input id="password" type="password" v-model="password" required />
            <a href="#" class="ml-auto inline-block text-sm underline">
              Forgot your password?
            </a>
          </div>
          
          <Button type="submit" class="w-full" :disabled="loading">
            {{ loading ? "Logging in..." : "Login" }}
          </Button>
          <div class="mt-4 text-center text-sm">
            Don't have an account?
            <RouterLink to="/register" class="underline">
              Register here
            </RouterLink>
          </div>
        </form>
      </CardContent>
    </Card>
  </div>
</template>
