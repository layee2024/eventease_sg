<script setup>
import { ref } from "vue"
import { useRouter } from "vue-router"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { supabase } from "../utils/supabase"
import { toast } from "vue-sonner"

const router = useRouter()

const firstName = ref("")
const lastName = ref("")
const email = ref("")
const password = ref("")
const loading = ref(false)

async function handleRegister() {
  try {
    loading.value = true

    const { data, error } = await supabase.auth.signUp({
      email: email.value,
      password: password.value,
      options: {
        data: {
          first_name: firstName.value,
          last_name: lastName.value
        }
      }
    })

    if (error) throw error

    toast.success("Account created! Check your email for verification link.")
    setTimeout(() => router.push("/verify"), 1500)

  } catch (err) {
    console.error(err)
    toast.error(err.message || "Registration failed. Please try again.")
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex items-center justify-center px-4 h-full">
    <Card class="mx-auto max-w-sm w-full">
      <CardHeader>
        <CardTitle class="text-xl">Register</CardTitle>
        <CardDescription>Enter your information to create an account</CardDescription>
      </CardHeader>
      <CardContent>
        <form @submit.prevent="handleRegister" class="grid gap-4">
          <div class="grid grid-cols-2 gap-4">
            <div class="grid gap-2">
              <Label for="first-name">First name</Label>
              <Input id="first-name" v-model="firstName" required />
            </div>
            <div class="grid gap-2">
              <Label for="last-name">Last name</Label>
              <Input id="last-name" v-model="lastName" required />
            </div>
          </div>

          <div class="grid gap-2">
            <Label for="email">Email</Label>
            <Input id="email" type="email" v-model="email" required />
          </div>

          <div class="grid gap-2">
            <Label for="password">Password</Label>
            <Input id="password" type="password" v-model="password" required />
          </div>

          <Button type="submit" class="w-full" :disabled="loading">
            {{ loading ? "Creating..." : "Create an account" }}
          </Button>
        </form>

        <div class="mt-4 text-center text-sm">
          Already have an account?
          <RouterLink to="/login" class="underline">Login</RouterLink>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
