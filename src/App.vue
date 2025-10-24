<script setup>
import { ref, onMounted, computed } from "vue"
import { RouterView } from "vue-router"
import { Toaster } from "@/components/ui/sonner"
import NavBar from "@/components/comp/user/UserNavBar.vue"
import Footer from "@/components/comp/Footer.vue"
import { supabase } from "@/utils/supabase"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  useInviteWatcher,
  newInviteModalOpen,
  newInvites,
  newFriendRequests,
} from "./utils/inviteWatcher"

import "vue-sonner/style.css"

const user = ref(null)
const { start: startWatcher, stop: stopWatcher } = useInviteWatcher()

// Tabs
const activeTab = ref("invites")

// Pagination
const invitePage = ref(1)
const friendPage = ref(1)
const perPage = 4

const totalInvitePages = computed(() => Math.ceil(newInvites.value.length / perPage) || 1)
const totalFriendPages = computed(() => Math.ceil(newFriendRequests.value.length / perPage) || 1)
const currentInvite = computed(() =>
  newInvites.value.slice((invitePage.value - 1) * perPage, invitePage.value * perPage)
)
const currentFriend = computed(() =>
  newFriendRequests.value.slice((friendPage.value - 1) * perPage, friendPage.value * perPage)
)

const fallbackAvatar = (name) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name || "User")}&background=E5E7EB&color=111827`

onMounted(async () => {
  const { data } = await supabase.auth.getUser()
  if (data?.user) {
    user.value = data.user
    startWatcher(user.value.id)
  }
  supabase.auth.onAuthStateChange((_e, session) => {
    if (session?.user) {
      user.value = session.user
      startWatcher(user.value.id)
    } else {
      user.value = null
      stopWatcher()
    }
  })
})
</script>

<template>
  <div id="app" class="flex flex-col min-h-screen bg-white text-gray-900">
    <NavBar />
    <div class="fixed top-[5%] right-0 z-[100] flex max-h-screen w-full translate-y-[-5%] p-4 sm:right-0 sm:flex-col md:max-w-[420px]">
      <Toaster position="top-right" closeButton />
    </div>

    <main class="">
      <RouterView v-slot="{ Component }">
        <Transition name="fade-slide" mode="out-in">
          <component :is="Component" />
        </Transition>
      </RouterView>
    </main>

    <Footer class="fixed bottom-0 left-0 w-full z-50 border-t border-gray-200" />

    <!-- Notifications Modal -->
    <Dialog v-model:open="newInviteModalOpen">
      <DialogContent class="max-w-2xl">
        <DialogHeader class="mb-4">
          <DialogTitle class="text-xl font-semibold">Your Notifications</DialogTitle>
        </DialogHeader>

        <!-- Tabs -->
        <div class="flex justify-center items-center mb-2">
          <div class="flex space-x-6">
            <button
              class="pb-1 font-medium border-b-2 transition-colors duration-200 cursor-pointer"
              :class="activeTab === 'invites'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'"
              @click="activeTab = 'invites'"
            >
              Event Invites ({{ newInvites.length }})
            </button>
            <button
              class="pb-1 font-medium border-b-2 transition-colors duration-200 cursor-pointer"
              :class="activeTab === 'friends'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'"
              @click="activeTab = 'friends'"
            >
              Friend Requests ({{ newFriendRequests.length }})
            </button>
          </div>
        </div>

        <section v-if="activeTab === 'invites'" class="space-y-3">
          <div
            v-for="inv in currentInvite"
            :key="inv.event_id + '-' + inv.from"
            class="flex justify-between items-start bg-gray-50 rounded-lg p-4 border border-gray-200"
          >
            <div class="flex items-start gap-3">
              <img
                :src="inv.inviterAvatar || fallbackAvatar(inv.inviterName)"
                alt="Inviter avatar"
                class="w-8 h-8 rounded-full object-cover border border-gray-200"
              />
              <p class="font-medium text-gray-900">
                <span class="text-blue-600">{{ inv.inviterName }}</span> invited you to
                <span class="font-semibold">“{{ inv.eventTitle }}”</span>
              </p>
            </div>
          </div>

          <!-- Pagination -->
          <div v-if="totalInvitePages > 1" class="flex justify-center mt-4 space-x-2">
            <span
              v-for="n in totalInvitePages"
              :key="'invite-dot-' + n"
              class="w-3 h-3 rounded-full cursor-pointer transition-all duration-300"
              :class="invitePage === n ? 'bg-blue-600 scale-110' : 'bg-gray-400 opacity-50'"
              @click="invitePage = n"
            />
          </div>
        </section>

        <section v-else class="space-y-3">
          <div
            v-for="req in currentFriend"
            :key="req.id"
            class="flex justify-between items-start bg-gray-50 rounded-lg p-4 border border-gray-200"
          >
            <div class="flex items-start gap-3">
              <img
                :src="req.profile_picture || fallbackAvatar(req.name)"
                alt="Requester avatar"
                class="w-8 h-8 rounded-full object-cover border border-gray-200"
              />
              <p class="font-medium text-gray-900">
                <span class="text-blue-600">{{ req.name }}</span> sent you a friend request
              </p>
            </div>
          </div>

          <!-- Pagination -->
          <div v-if="totalFriendPages > 1" class="flex justify-center mt-4 space-x-2">
            <span
              v-for="n in totalFriendPages"
              :key="'friend-dot-' + n"
              class="w-3 h-3 rounded-full cursor-pointer transition-all duration-300"
              :class="friendPage === n ? 'bg-blue-600 scale-110' : 'bg-gray-400 opacity-50'"
              @click="friendPage = n"
            />
          </div>
        </section>

        <!-- Bottom Button -->
        <div v-if="newInvites.length || newFriendRequests.length" class="text-center mt-6">
          <RouterLink
            to="/friends"
            class="text-sm font-medium text-blue-600 hover:underline cursor-pointer"
            @click="newInviteModalOpen = false"
          >
            Go to Friends to Accept →
          </RouterLink>
        </div>

        <p v-if="!newInvites.length && !newFriendRequests.length" class="text-gray-500 text-center py-4">
          You have no new notifications.
        </p>
      </DialogContent>
    </Dialog>
  </div>
</template>

<style>
.fade-slide-enter-active,
.fade-slide-leave-active { transition: all 0.4s ease; }
.fade-slide-enter-from { opacity: 0; transform: translateY(30px); }
.fade-slide-leave-to   { opacity: 0; transform: translateY(-30px); }
main { padding-bottom: 5rem; }
</style>
