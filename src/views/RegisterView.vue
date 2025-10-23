<script setup>
import { ref, onMounted } from "vue"
import { useRouter } from "vue-router"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { supabase } from "../utils/supabase"
import { toast } from "vue-sonner"

const router = useRouter()
const loading = ref(false)

const firstName = ref("")
const lastName = ref("")
const email = ref("")
const password = ref("")

onMounted(async () => {
  const { data: { session } } = await supabase.auth.getSession()
  if (session) router.push("/")
})

// Register
async function register() {
  try {
    loading.value = true

    const { data, error } = await supabase.auth.signUp({
      email: email.value,
      password: password.value,
      options: {
        data: {
          first_name: firstName.value,
          last_name: lastName.value,
        }
      }
    })

    if (error) throw error

    const user = data.user
    // User registration
    const { error: insertError } = await supabase.from("user_preferences").insert({
      id: user.id,
      name: firstName.value + " " + lastName.value,
      email: email.value,
      interests: [],
      budget: "all",
      transport_mode: [],
      saved: [],
      onboarding: false,
      going: [],
      friends: []
    })
    if (insertError) console.error("User pref insert error:", insertError)

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
  <div class="min-h-[93vh] flex items-center justify-center px-4 py-10">
    <Card class="mx-auto max-w-lg md:max-w-2xl w-full">
      <CardHeader>
        <CardTitle class="text-xl text-center">Register</CardTitle>
      </CardHeader>

      <CardContent>
        <!-- Registration Form -->
        <form @submit.prevent="register" class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- First & Last Name -->
          <div class="grid md:grid-cols-2 gap-4 md:col-span-2">
            <div class="grid gap-2">
              <Label for="first-name">First name</Label>
              <Input id="first-name" v-model="firstName" required />
            </div>
            <div class="grid gap-2">
              <Label for="last-name">Last name</Label>
              <Input id="last-name" v-model="lastName" required />
            </div>
          </div>

          <!-- Email -->
          <div class="grid gap-2">
            <Label for="email">Email</Label>
            <Input id="email" type="email" v-model="email" required />
          </div>

          <!-- Password -->
          <div class="grid gap-2">
            <Label for="password">Password</Label>
            <Input id="password" type="password" v-model="password" required />
          </div>

          <!-- Submit Button -->
          <Button
            type="submit"
            class="cursor-pointer w-full md:col-span-2"
            :disabled="loading"
          >
            Register
          </Button>
        </form>

        <!-- Footer -->
        <div class="mt-4 text-center text-sm">
          Already have an account?
          <RouterLink to="/login" class="cursor-pointer underline">Login here</RouterLink>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
