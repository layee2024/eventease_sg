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
const isOrganiser = ref(false)
const loading = ref(false)

const firstName = ref("")
const lastName = ref("")
const email = ref("")
const password = ref("")

// Organiser
const organisationName = ref("")
const contactNumber = ref("")
const category = ref("")

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
          is_organiser: isOrganiser.value
        }
      }
    })

    if (error) throw error

    const user = data.user
    if (!user) return

    if (!isOrganiser.value) {
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
    } else {
      // Organiser registration
      const { error: orgError } = await supabase.from("organiser_details").insert({
        id: user.id,
        organisation_name: organisationName.value,
        contact_number: contactNumber.value,
        email: email.value,
        category: category.value,
        verified: false
      })
      if (orgError) console.error("Organiser insert error:", orgError)
    }

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
        <CardTitle class="text-xl">Register</CardTitle>
        <CardDescription>
          Register as a <b>{{ isOrganiser ? 'Organiser' : 'User' }}</b>.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <!-- Toggle Buttons -->
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

          <!-- Organiser Fields -->
          <div v-if="isOrganiser" class="grid grid-cols-1 md:grid-cols-2 gap-4 md:col-span-2">
            <div class="grid gap-2">
              <Label for="organisationName">Organisation Name</Label>
              <Input id="organisationName" v-model="organisationName" required />
            </div>

            <div class="grid gap-2">
              <Label for="contactNumber">Contact Number</Label>
              <Input id="contactNumber" v-model="contactNumber" required />
            </div>

            <div class="grid gap-2 md:col-span-2">
              <Label for="category">Category</Label>
              <Input id="category" v-model="category" placeholder="e.g. Events, Charity, University" required />
            </div>
          </div>

          <!-- Submit Button -->
          <Button
            type="submit"
            class="cursor-pointer w-full md:col-span-2"
            :disabled="loading"
          >
            {{ loading ? "Creating..." : isOrganiser ? "Register as Organiser" : "Register as User" }}
          </Button>
        </form>

        <!-- Footer -->
        <div class="mt-4 text-center text-sm">
          Already have an account?
          <RouterLink to="/login" class="cursor-pointer underline">Login</RouterLink>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
