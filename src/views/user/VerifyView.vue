<script setup>
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "vue-router"

const router = useRouter()

function handleContinue() {
  router.push("/login")
}
</script>

<template>
  <div class="min-h-[90vh] flex items-center justify-center px-4 h-full">
    <Card class="max-w-sm w-full text-center">
      <CardHeader>
        <CardTitle>Email Verification</CardTitle>
        <CardDescription>We've sent a confirmation link to your email.</CardDescription>
      </CardHeader>
      <CardContent class="space-y-6">
        <p class="text-gray-600 text-sm">
          Please check your inbox for a message from us. Once verified, you can log in to your account.
        </p>
        <Button class="w-full" @click="handleContinue">Continue to Login</Button>
      </CardContent>
    </Card>
  </div>
</template>
