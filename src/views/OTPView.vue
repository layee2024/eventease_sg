<script setup>
import { toTypedSchema } from "@vee-validate/zod"
import { useForm } from "vee-validate"
import { h } from "vue"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  PinInput,
  PinInputGroup,
  PinInputSlot,
} from "@/components/ui/pin-input"
import { toast } from "vue-sonner"

const formSchema = toTypedSchema(z.object({
  pin: z.array(z.coerce.string()).length(6, { message: "Invalid input" }),
}))

const { handleSubmit, setFieldValue } = useForm({
  validationSchema: formSchema,
})

const onSubmit = handleSubmit(({ pin }) => {
  toast({
    title: "You submitted the following values:",
    description: h("pre", { class: "mt-2 w-[340px] rounded-md bg-slate-950 p-4" }, h("code", { class: "text-white" }, JSON.stringify(pin.join(""), null, 2))),
  })
})

const handleComplete = (e) => console.log(e.join(""))
</script>

<template>
  <Card class="mx-auto max-w-sm">
    <CardHeader>
      <CardTitle class="text-xl">
        Verification Code
      </CardTitle>
      <CardDescription>
        Please key in the 6 digit code that was sent to your email
      </CardDescription>
    </CardHeader>
    <CardContent>
      <form class="space-y-6" @submit="onSubmit">
        <FormField v-slot="{ componentField, value }" name="pin">
          <FormItem>
            <FormLabel>OTP</FormLabel>
            <FormControl>
              <PinInput
                id="pin-input"
                :model-value="value"
                placeholder="○"
                class="flex gap-2 items-center mt-1"
                otp
                type="number"
                :name="componentField.name"
                @complete="handleComplete"
                @update:model-value="(arrStr) => {
                  setFieldValue('pin', arrStr)
                }"
              >
                <PinInputGroup>
                  <PinInputSlot
                    v-for="(id, index) in 6"
                    :key="id"
                    :index="index"
                  />
                </PinInputGroup>
              </PinInput>
            </FormControl>
            <FormDescription>
              Allows users to input a sequence of one-character alphanumeric inputs.
            </FormDescription>
            <FormMessage />
          </FormItem>
        </FormField>

        <Button>Submit</Button>
      </form>
    </CardContent>
  </Card>
</template>