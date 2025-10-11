<script setup>
import { ref, onMounted, onUnmounted } from "vue"
import Typewriter from "../components/comp/Typewriter.vue"
import { Button } from "@/components/ui/button"

const problem = ref(null)
const isVisible = ref(false)

onMounted(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          isVisible.value = true
          observer.disconnect() // run animation once
        }
      })
    },
    { threshold: 0.7 } // trigger
  )

  if (problem.value) observer.observe(problem.value)
})

const scrollToNext = () => {
  if (problem.value) {
    problem.value.scrollIntoView({ behavior: "smooth" })
  }
}

onUnmounted(() => {
  if (problem.value) observer.unobserve(problem.value)
})
</script>

<template>
  <main class="relative w-full">
    <!-- Hero -->
    <section class="relative w-full h-[93vh]">
      <img
        src="../assets/cover.png"
        alt="Singapore Events Crowd"
        class="absolute inset-0 w-full h-full object-cover"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>

      <div class="relative z-10 flex flex-col justify-center w-full h-full px-6 md:px-16">
        <h1 class="text-3xl sm:text-5xl md:text-6xl font-extrabold text-white leading-tight">
          Discover Amazing <br />
          <Typewriter
            text="Events in Singapore"
            classes="text-yellow-400"
            cursorColor="bg-yellow-400"
          />
        </h1>
        <p class="mt-6 text-lg text-gray-100 leading-relaxed max-w-2xl">
          Find events that match your mood, budget, and interests — all in one place.
          Connect with friends and never miss out on the best experiences.
        </p>
        <RouterLink to="/events">
          <Button variant="secondary" class="mt-4">Start Exploring</Button>
        </RouterLink>
        <div
          class="absolute bottom-10 left-1/2 transform -translate-x-1/2 cursor-pointer animate-bounce text-white hover:text-yellow-400 transition-colors duration-300"
          @click="scrollToNext"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-8 h-8">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </section>

    <!-- Solutions Section -->
    <section
      ref="problem"
      class="h-[93vh] min-h-min flex items-center justify-center relative w-full bg-gradient-to-tl from-indigo-200 via-red-200 to-yellow-100 py-20 px-6 md:px-16 lg:px-24"
    >
      <div
        class="max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-2 gap-10 xl:items-start 
        transition-all duration-1000 ease-out transform"
        :class="isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'"
      >
        <!-- Left Side -->
        <div class="flex flex-col justify-center items-center xl:items-start h-full">
          <h2 class="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-4">
            We Built EventEase SG to
            <span class="gradient-text">Solve Real Problems</span>
          </h2>
          <p class="text-slate-800 text-lg leading-relaxed xl:max-w-lg">
            EventEase SG is your all-in-one platform for discovering and experiencing Singapore's most exciting events. 
            From live concerts to art markets, workshops, and nightlife happenings, EventEase helps you find events that 
            match your mood, interests, and budget — and makes planning effortless.
          </p>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div
            class="flex flex-col"
            v-for="(card, i) in [
              {
                title: 'Discover Effortlessly',
                text: 'Browse curated events across categories — music, art, food, sports, and more. Filter by budget, distance, or date to find what fits your vibe instantly.',
                icon: `<path stroke-linecap='round' stroke-linejoin='round' d='M21 21l-5.2-5.2m0 0A7.5 7.5 0 105.2 5.2a7.5 7.5 0 0010.6 10.6z' />`
              },
              {
                title: 'Smart Recommendations',
                text: 'Get personalized event suggestions powered by your interests, past searches, and trending activities nearby — so you spend less time scrolling and more time exploring.',
                icon: `<path stroke-linecap='round' stroke-linejoin='round' d='M9 12h6m2 9H7a2 2 0 01-2-2V5a2 2 0 012-2h6l6 6v10a2 2 0 01-2 2z' />`
              },
              {
                title: 'Social Planning Made Easy',
                text: 'Coordinate with friends seamlessly. Save events, share plans, and sync calendars to make group outings simple and spontaneous.',
                icon: `<path stroke-linecap='round' stroke-linejoin='round' d='M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z' />`

              },
              {
                title: 'Real-time Updates',
                text: 'Stay in the loop with live event alerts, last-minute ticket drops, and venue updates. EventEase ensures you\'re always one step ahead.',
                icon: `<path stroke-linecap='round' stroke-linejoin='round' d='M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' />`
              }
            ]"
            :key="i"
            :style="{ transitionDelay: `${i * 150}ms` }"
            :class="[
              'p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-1000 ease-out transform border border-gray-100 bg-white/70 backdrop-blur-sm',
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            ]"
          >
            <div class="flex items-center space-x-3">
              <div class="flex items-center justify-center w-10 h-10 rounded-full bg-violet-100 text-violet-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="2.2"
                  stroke="currentColor"
                  v-html="card.icon"
                  class="w-6 h-6"
                />
              </div>
              <h3 class="font-semibold text-lg text-gray-900">{{ card.title }}</h3>
            </div>
            <p class="text-gray-600 text-sm mt-3">{{ card.text }}</p>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
  @media (min-width: 768px) {
    .-mt-10 {
      margin-top: -2.5rem;
    }
  }

  @property --color-1 {
  syntax: "<color>";
  inherits: false;
  initial-value: hsl(98 100% 62%);
}

@property --color-2 {
  syntax: "<color>";
  inherits: false;
  initial-value: hsl(204 100% 59%);
}

@keyframes gradient-shift {
  to {
    --color-1: hsl(210 100% 59%);
    --color-2: hsl(310 100% 59%);
  }
}

.gradient-text {
  animation: gradient-shift 3s ease-in-out infinite alternate;
  background: linear-gradient(to right in oklch, var(--color-1), var(--color-2));
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  -webkit-text-fill-color: transparent;
}
</style>
