<script setup>
import { ref, onMounted, onUnmounted, nextTick } from "vue"
import { useRouter } from "vue-router"
import Typewriter from "../../components/comp/user/Typewriter.vue"
import GithubGlobe from "../../components/comp/user/GithubGlobe.vue"
import { Button } from "@/components/ui/button"
import { supabase } from "@/utils/supabase"
import { toast } from "vue-sonner"

const router = useRouter()
const problem = ref(null)
const isVisible = ref(false)
const searchQuery = ref("")
const heroElementsVisible = ref(false)
const globeSection = ref(null)
const globeVisible = ref(false)
const howItWorksSection = ref(null)
const howItWorksVisible = ref(false)

const colors = ["#9333ea", "#ec4899", "#3b82f6", "#f59e0b"]
const globeData = [
  { order: 1, startLat: 1.3521, startLng: 103.8198, endLat: 35.6762, endLng: 139.6503, arcAlt: 0.3, color: colors[0] },
  { order: 1, startLat: 1.3521, startLng: 103.8198, endLat: 51.5072, endLng: -0.1276, arcAlt: 0.5, color: colors[1] },
  { order: 2, startLat: 1.3521, startLng: 103.8198, endLat: 40.7128, endLng: -74.006, arcAlt: 0.6, color: colors[2] },
  { order: 2, startLat: 1.3521, startLng: 103.8198, endLat: -33.8688, endLng: 151.2093, arcAlt: 0.4, color: colors[3] },
  { order: 3, startLat: 1.3521, startLng: 103.8198, endLat: 22.3193, endLng: 114.1694, arcAlt: 0.2, color: colors[0] },
  { order: 3, startLat: 1.3521, startLng: 103.8198, endLat: 3.139, endLng: 101.6869, arcAlt: 0.1, color: colors[1] },
  { order: 4, startLat: 1.3521, startLng: 103.8198, endLat: -6.2088, endLng: 106.8456, arcAlt: 0.2, color: colors[2] },
  { order: 4, startLat: 1.3521, startLng: 103.8198, endLat: 13.7563, endLng: 100.5018, arcAlt: 0.2, color: colors[3] },
]

const globeConfig = {
  pointSize: 2,
  globeColor: "#3730a3",
  showAtmosphere: true,
  atmosphereColor: "#FFFFFF",
  atmosphereAltitude: 0.15,
  emissive: "#4c1d95",
  emissiveIntensity: 0.3,
  shininess: 0.9,
  polygonColor: "rgba(255,255,255,0.8)",
  ambientLight: "#ffffff",
  directionalLeftLight: "#ffffff",
  directionalTopLight: "#ffffff",
  pointLight: "#ffffff",
  arcTime: 3000,
  arcLength: 0.9,
  rings: 2,
  maxRings: 3,
  initialPosition: { lat: 1.3521, lng: 103.8198 },
  autoRotate: true,
  autoRotateSpeed: 0.5,
}

// Onboarding check
async function checkOnboarding() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { data: prefs, error } = await supabase
    .from("user_preferences")
    .select("onboarding")
    .eq("id", user.id)
    .maybeSingle()

  if (error) {
    console.error("Error checking onboarding:", error)
    return
  }

  if (!prefs || prefs.onboarding === false) {
    toast.info("Let's set up your preferences first!")
    router.push("/onboarding")
  }
}

onMounted(async () => {
  await nextTick()
  initStarAnimation()

  setTimeout(() => {
    heroElementsVisible.value = true
  }, 100)

  const video = document.querySelector("video")
  if (video) video.play().catch(() => {})

  // Intersection Observers
  const observer = new IntersectionObserver(
    (entries) => entries.forEach((entry) => {
      if (entry.isIntersecting) {
        isVisible.value = true
        observer.disconnect()
      }
    }),
    { threshold: 0.5 }
  )

  const globeObserver = new IntersectionObserver(
    (entries) => entries.forEach((entry) => {
      if (entry.isIntersecting) {
        globeVisible.value = true
        globeObserver.disconnect()
      }
    }),
    { threshold: 0.3 }
  )

  const howItWorksObserver = new IntersectionObserver(
    (entries) => entries.forEach((entry) => {
      if (entry.isIntersecting) {
        howItWorksVisible.value = true
        howItWorksObserver.disconnect()
      }
    }),
    { threshold: 0.3 }
  )

  if (problem.value) observer.observe(problem.value)
  if (globeSection.value) globeObserver.observe(globeSection.value)
  if (howItWorksSection.value) howItWorksObserver.observe(howItWorksSection.value)

  setTimeout(checkOnboarding, 800)
})

onUnmounted(() => {
  if (problem.value) observer?.unobserve(problem.value)
})

// Scroll
const scrollToNext1 = () => problem.value?.scrollIntoView({ behavior: "smooth" })
const scrollToNext2 = () => globeSection.value?.scrollIntoView({ behavior: "smooth" })
const scrollToNext3 = () => howItWorksSection.value?.scrollIntoView({ behavior: "smooth" })

// Search
const handleSearch = () => {
  const query = searchQuery.value.trim()
  router.push(query ? { path: "/events", query: { search: query } } : "/events")
}

const handleSearchKeypress = (e) => {
  if (e.key === "Enter") handleSearch()
}

// Star animation
function initStarAnimation() {
  let index = 0
  const interval = 1000
  const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min

  const animate = (star) => {
    star.style.setProperty("--star-left", `${rand(-10, 100)}%`)
    star.style.setProperty("--star-top", `${rand(-40, 80)}%`)
    star.style.animation = "none"
    star.offsetHeight
    star.style.animation = ""
  }

  const stars = document.getElementsByClassName("stars")
  for (const star of stars) {
    setTimeout(() => {
      animate(star)
      setInterval(() => animate(star), interval)
    }, index++ * (interval / 3))
  }
}
</script>

<template>
  <main class="relative w-full">
    <!-- Hero -->
    <section class="relative w-full h-[93vh] overflow-hidden">
      <!-- Background Video -->
      <video
        autoplay
        loop
        muted
        playsinline
        class="absolute inset-0 w-full h-full object-cover"
      >
        <source src="../../assets/pikaso-project-2025-10-14.mp4" type="video/mp4" />
      </video>
      <!-- Subtle Black Overlay -->
      <div class="absolute inset-0 bg-black/50"></div>
      <!-- Gradient Overlay for text readability -->
      <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/30"></div>

      <div class="relative z-10 flex flex-col justify-center w-full h-full px-6 md:px-16">
        <!-- Main Headline with animation -->
        <h1
          class="text-3xl sm:text-5xl md:text-6xl font-extrabold text-white leading-tight transition-all duration-700 ease-out"
          :class="heroElementsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'"
        >
          Discover Amazing <br />
          <Typewriter
            text="Events in Singapore"
            classes="text-yellow-400"
            cursorColor="bg-yellow-400"
          />
        </h1>

        <!-- Subheadline with Stats -->
        <p
          class="mt-4 text-base sm:text-lg text-gray-300/90 font-medium transition-all duration-700 ease-out delay-150"
          :class="heroElementsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'"
        >
          Join <span class="hero-gradient-text font-bold">5,000+ students</span> discovering
          <span class="hero-gradient-text font-bold">200+ events</span> across Singapore's universities
        </p>

        <!-- Description -->
        <p
          class="mt-6 text-base sm:text-lg text-gray-100 leading-relaxed max-w-2xl transition-all duration-700 ease-out delay-300"
          :class="heroElementsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'"
        >
          Find events that match your mood, budget, and interests — all in one place.
          Connect with friends and never miss out on the best experiences.
        </p>

        <!-- Search Bar -->
        <div
          class="mt-8 max-w-2xl transition-all duration-700 ease-out delay-500"
          :class="heroElementsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'"
        >
          <div class="relative flex items-center">
            <div class="absolute left-4 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.2-5.2m0 0A7.5 7.5 0 105.2 5.2a7.5 7.5 0 0010.6 10.6z" />
              </svg>
            </div>
            <input
              v-model="searchQuery"
              @keypress="handleSearchKeypress"
              type="text"
              placeholder="Search for events, categories, or venues..."
              class="w-full pl-12 pr-32 py-4 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all duration-300 focus:bg-white/20 focus:shadow-xl"
            />
            <Button
              variant="primary"
              size="lg"
              @click="handleSearch"
              class="absolute right-2 px-6 py-2.5 text-white cursor-pointer rounded-full hover:bg-[#dbe1e3] hover:text-gray-700"
            >
              Search
            </Button>
          </div>
        </div>

        <!-- Scroll Arrow -->
        <div
          class="absolute bottom-10 left-1/2 transform -translate-x-1/2 cursor-pointer animate-bounce text-white hover:text-yellow-400 transition-colors duration-300"
          @click="scrollToNext1"
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
      class="h-[93vh] min-h-min lg:min-h-screen flex items-center justify-center relative w-full bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-20 px-6 md:px-16 lg:px-24"
    >
      <div
        class="max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-2 gap-10 xl:items-start
        transition-all duration-700 ease-out transform"
        :class="isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'"
      >
        <!-- Left Side -->
        <div class="flex flex-col justify-center items-center xl:items-start h-full">
          <h2 class="text-center md:text-start text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-4">
            We Built EventEase SG to
            <span class="stars-animation">
              <span class="stars">
                <svg viewBox="0 0 512 512">
                  <path d="M512 255.1c0 11.34-7.406 20.86-18.44 23.64l-171.3 42.78l-42.78 171.1C276.7 504.6 267.2 512 255.9 512s-20.84-7.406-23.62-18.44l-42.66-171.2L18.47 279.6C7.406 276.8 0 267.3 0 255.1c0-11.34 7.406-20.83 18.44-23.61l171.2-42.78l42.78-171.1C235.2 7.406 244.7 0 256 0s20.84 7.406 23.62 18.44l42.78 171.2l171.2 42.78C504.6 235.2 512 244.6 512 255.1z" />
                </svg>
              </span>
              <span class="stars">
                <svg viewBox="0 0 512 512">
                  <path d="M512 255.1c0 11.34-7.406 20.86-18.44 23.64l-171.3 42.78l-42.78 171.1C276.7 504.6 267.2 512 255.9 512s-20.84-7.406-23.62-18.44l-42.66-171.2L18.47 279.6C7.406 276.8 0 267.3 0 255.1c0-11.34 7.406-20.83 18.44-23.61l171.2-42.78l42.78-171.1C235.2 7.406 244.7 0 256 0s20.84 7.406 23.62 18.44l42.78 171.2l171.2 42.78C504.6 235.2 512 244.6 512 255.1z" />
                </svg>
              </span>
              <span class="stars">
                <svg viewBox="0 0 512 512">
                <path d="M512 255.1c0 11.34-7.406 20.86-18.44 23.64l-171.3 42.78l-42.78 171.1C276.7 504.6 267.2 512 255.9 512s-20.84-7.406-23.62-18.44l-42.66-171.2L18.47 279.6C7.406 276.8 0 267.3 0 255.1c0-11.34 7.406-20.83 18.44-23.61l171.2-42.78l42.78-171.1C235.2 7.406 244.7 0 256 0s20.84 7.406 23.62 18.44l42.78 171.2l171.2 42.78C504.6 235.2 512 244.6 512 255.1z" />
                </svg>
              </span>
              <span class="stars-animation-text">Solve Real Problems</span>
            </span>
          </h2>
          <p class="text-slate-800 text-lg leading-relaxed xl:max-w-lg">
            EventEase SG is your all-in-one platform for discovering and experiencing Singapore's most exciting events. 
            From live concerts to art markets, workshops, and nightlife happenings, EventEase helps you find events that 
            match your mood, interests, and budget — and makes planning effortless.
          </p>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div
            class="flex flex-col group relative overflow-hidden p-6 rounded-2xl shadow-md transition-all duration-700 ease-out transform border border-white/20 bg-white/80 backdrop-blur-lg hover:-translate-y-2 hover:shadow-2xl hover:border-violet-300 hover:bg-white/90"
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
              'p-6 rounded-2xl shadow-md hover:shadow-lg transition-all duration-700 ease-out transform border border-white/20 bg-white/80 backdrop-blur-lg',
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            ]"
          >
            <div class="flex items-center space-x-3">
              <div class="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-violet-100 to-violet-200 text-violet-600 group-hover:from-violet-200 group-hover:to-violet-300 transition-all duration-300">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="2.2"
                  stroke="currentColor"
                  v-html="card.icon"
                  class="w-6 h-6"
                ></svg>
              </div>
              <h3 class="font-semibold text-lg text-gray-900 group-hover:text-violet-600">{{ card.title }}</h3>
            </div>
            <p class="text-gray-600 text-sm mt-3 group-hover:text-gray-800">{{ card.text }}</p>
          </div>
        </div>
      </div>
      <!-- Scroll Arrow -->
      <div
        class="absolute bottom-10 left-1/2 transform -translate-x-1/2 cursor-pointer animate-bounce text-gray-700 hover:text-yellow-400 transition-colors duration-300"
        @click="scrollToNext2"
        >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-8 h-8">
          <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </section>


    <!-- Globe Section -->
    <section
      ref="globeSection"
      class="relative w-full min-h-screen flex items-center py-20 px-6 md:px-16 lg:px-24 overflow-hidden"
      style="background: linear-gradient(135deg, #0a0a1a 0%, #1a1a2e 50%, #16213e 100%);"
    >
      <div class="max-w-7xl mx-auto w-full">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          <!-- Left Side: Globe -->
          <div
            class="globe-wrapper relative transition-all duration-1000 ease-out flex items-center justify-center order-2 lg:order-1"
            :class="globeVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'"
            style="height: 600px;"
          >
            <GithubGlobe
              :globe-config="globeConfig"
              :data="globeData"
              class="w-full h-full"
            />
          </div>

          <!-- Right Side: Content -->
          <div
            class="flex flex-col justify-center items-center lg:items-start text-center lg:text-start space-y-6 order-1 lg:order-2"
            :class="globeVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'"
            style="transition: all 1s ease-out;"
          >
            <!-- Badge -->
            <div
              class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 w-fit"
              :style="{ transitionDelay: '200ms' }"
            >
              <div class="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></div>
              <span class="text-purple-300 text-sm font-medium">Global Event Network</span>
            </div>

            <!-- Main Heading -->
            <h2
              class="text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight"
              :style="{ transitionDelay: '300ms' }"
            >
              Events that connect
              <span class="block mt-2 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                across borders
              </span>
            </h2>

            <!-- Description -->
            <p
              class="text-lg md:text-xl text-gray-300 leading-relaxed max-w-xl"
              :style="{ transitionDelay: '400ms' }"
            >
              From Singapore to the world. EventEase SG brings you local events with global impact,
              connecting students and communities across Asia-Pacific and beyond.
            </p>

            <!-- Stats Grid -->
            <div
              class="grid grid-cols-2 md:grid-cols-4 gap-6 pt-4"
              :style="{ transitionDelay: '500ms' }"
            >
              <div class="space-y-2">
                <div class="text-3xl md:text-4xl font-bold text-white">8+</div>
                <div class="text-sm text-gray-400">Countries Connected</div>
              </div>
              <div class="space-y-2">
                <div class="text-3xl md:text-4xl font-bold text-white">50+</div>
                <div class="text-sm text-gray-400">Partner Cities</div>
              </div>
              <div class="space-y-2">
                <div class="text-3xl md:text-4xl font-bold text-white">200+</div>
                <div class="text-sm text-gray-400">Global Events</div>
              </div>
              <div class="space-y-2">
                <div class="text-3xl md:text-4xl font-bold text-white">24/7</div>
                <div class="text-sm text-gray-400">Live Updates</div>
              </div>
            </div>

            <!-- CTA Button -->
            <div
              class="pt-4"
              :style="{ transitionDelay: '600ms' }"
            >
              <button
                @click="router.push('/events')"
                class="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 hover:from-purple-700 hover:via-pink-700 hover:to-blue-700 text-white font-semibold rounded-full transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/50 hover:scale-105"
              >
                Explore Global Events
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </button>
            </div>

            <!-- Interactive Hint -->
            <p
              class="text-sm text-gray-500 flex items-center gap-2"
              :style="{ transitionDelay: '700ms' }"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zM12 2.25V4.5m5.834.166l-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243l-1.59-1.59" />
              </svg>
              Drag to rotate the globe and explore connections
            </p>
          </div>

        </div>
      </div>
      <!-- Scroll Arrow -->
      <div
        class="absolute bottom-10 left-1/2 transform -translate-x-1/2 cursor-pointer animate-bounce text-white hover:text-yellow-400 transition-colors duration-300"
        @click="scrollToNext3"
        >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-8 h-8">
          <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </section>

    <!-- How It Works Section -->
    <section
      ref="howItWorksSection"
      class="relative w-full bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-20 px-6 md:px-16 lg:px-24"
    >
      <div class="max-w-7xl mx-auto">
        <!-- Section Header -->
        <div
          class="text-center mb-16 transition-all duration-700 ease-out"
          :class="howItWorksVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'"
        >
          <h2 class="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p class="text-lg text-gray-600 max-w-2xl mx-auto">
            Getting started is simple
          </p>
        </div>

        <!-- Steps Container -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 lg:gap-12 relative">
          <!-- Connecting Lines (Desktop Only) -->
          <div class="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-300 via-pink-300 to-blue-300 opacity-30" style="width: calc(100% - 180px); margin: 0 90px;"></div>

          <!-- Step 1: Browse -->
          <div
            class="how-it-works-card group relative p-8 rounded-2xl transition-all duration-700 ease-out transform"
            :class="howItWorksVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'"
            :style="{ transitionDelay: '0ms' }"
          >
            <!-- Step Badge - Top Right -->
            <div class="step-badge absolute -top-3 -left-3 flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 text-white font-bold text-lg shadow-lg">
              01
            </div>

            <div class="relative z-10 text-center">
              <!-- Icon -->
              <div class="flex items-center justify-center w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-100 to-purple-200 text-purple-600 group-hover:scale-110 group-hover:from-purple-200 group-hover:to-purple-300 transition-all duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-10 h-10">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.2-5.2m0 0A7.5 7.5 0 105.2 5.2a7.5 7.5 0 0010.6 10.6z" />
                </svg>
              </div>

              <!-- Content -->
              <h3 class="text-2xl font-bold text-gray-900 mb-3 group-hover:text-purple-600 transition-colors duration-300">
                Browse Events
              </h3>
              <p class="text-gray-600 leading-relaxed">
                Explore curated events across categories. Filter by your interests, budget, and schedule to find the perfect match.
              </p>
            </div>
          </div>

          <!-- Step 2: Save -->
          <div
            class="how-it-works-card group relative p-8 rounded-2xl transition-all duration-700 ease-out transform"
            :class="howItWorksVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'"
            :style="{ transitionDelay: '150ms' }"
          >
            <!-- Step Badge - Top Right -->
            <div class="step-badge absolute -top-3 -left-3 flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-pink-500 to-pink-600 text-white font-bold text-lg shadow-lg">
              02
            </div>

            <div class="relative z-10 text-center">
              <!-- Icon -->
              <div class="flex items-center justify-center w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-pink-100 to-pink-200 text-pink-600 group-hover:scale-110 group-hover:from-pink-200 group-hover:to-pink-300 transition-all duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-10 h-10">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
                </svg>
              </div>

              <!-- Content -->
              <h3 class="text-2xl font-bold text-gray-900 mb-3 group-hover:text-pink-600 transition-colors duration-300">
                Save Your Favorites
              </h3>
              <p class="text-gray-600 leading-relaxed">
                Bookmark events you love and get personalized recommendations based on your preferences.
              </p>
            </div>
          </div>

          <!-- Step 3: Plan with Friends -->
          <div
            class="how-it-works-card group relative p-8 rounded-2xl transition-all duration-700 ease-out transform"
            :class="howItWorksVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'"
            :style="{ transitionDelay: '300ms' }"
          >
            <!-- Step Badge - Top Right -->
            <div class="step-badge absolute -top-3 -left-3 flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white font-bold text-lg shadow-lg">
              03
            </div>

            <div class="relative z-10 text-center">
              <!-- Icon -->
              <div class="flex items-center justify-center w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 text-blue-600 group-hover:scale-110 group-hover:from-blue-200 group-hover:to-blue-300 transition-all duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-10 h-10">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                </svg>
              </div>

              <!-- Content -->
              <h3 class="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors duration-300">
                Plan with Friends
              </h3>
              <p class="text-gray-600 leading-relaxed">
                Coordinate with your friends, share plans, and sync calendars to never miss out together.
              </p>
            </div>
          </div>
        </div>

        <!-- Call to Action -->
        <div
          class="mt-16 text-center transition-all duration-700 ease-out"
          :class="howItWorksVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'"
          :style="{ transitionDelay: '450ms' }"
        >
          <p class="text-xl md:text-2xl text-gray-700 font-semibold mb-6">
            Ready to discover amazing events?
          </p>
          <button
            @click="router.push('/events')"
            class="cta-button group relative inline-flex items-center gap-3 px-10 py-5 text-lg font-bold text-white rounded-full overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl"
          >
            <!-- Gradient Background -->
            <span class="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-size-200 bg-pos-0 group-hover:bg-pos-100 transition-all duration-500"></span>

            <!-- Button Content -->
            <span class="relative z-10 flex items-center gap-3">
              Get Started Now
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-6 h-6 group-hover:translate-x-1 transition-transform duration-300">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </span>

            <!-- Shine Effect -->
            <span class="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out bg-gradient-to-r from-transparent via-white/30 to-transparent"></span>
          </button>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
  /* Search input autofill styling */
  input:-webkit-autofill,
  input:-webkit-autofill:hover,
  input:-webkit-autofill:focus {
    -webkit-text-fill-color: white;
    -webkit-box-shadow: 0 0 0px 1000px rgba(255, 255, 255, 0.1) inset;
    transition: background-color 5000s ease-in-out 0s;
  }

  /* Hero gradient text */
  .hero-gradient-text {
    background: linear-gradient(
      135deg,
      rgb(234, 179, 8),
      rgb(251, 146, 60),
      rgb(244, 114, 182)
    );
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  /* Responsive search bar */
  @media (max-width: 640px) {
    input[type="text"] {
      padding-right: 100px;
      font-size: 14px;
    }

    button {
      padding-left: 1rem;
      padding-right: 1rem;
      font-size: 14px;
    }
  }

  .group::before {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: inherit;
    opacity: 0;
    transition: opacity 0.4s ease-in-out;
    z-index: 0;
  }

  .group:hover::before {
    opacity: 1;
    filter: blur(20px);
  }

  .group:hover {
  box-shadow: 0 10px 25px rgba(139, 92, 246, 0.2), 0 0 10px rgba(244, 143, 177, 0.15);
  }

  @keyframes background-pan {
    from {
      background-position: 0% center;
    }
    
    to {
      background-position: -200% center;
    }
  }

  @keyframes scale {
    from, to {
      transform: scale(0);
    }
    
    50% {
      transform: scale(1);
    }
  }

  @keyframes rotate {
    from {
      transform: rotate(0deg);
    }
    
    to {
      transform: rotate(180deg);
    }
  }

  .stars-animation {
    display: inline-block;
    position: relative;
  }

  .stars-animation > .stars {
    
    animation: scale 700ms ease forwards;
    display: block;
    height: clamp(20px, 1.5vw, 30px);
    left: var(--star-left);
    position: absolute;
    top: var(--star-top);
    width: clamp(20px, 1.5vw, 30px);
  }

  .stars-animation > .stars > svg {
    animation: rotate 1000ms linear infinite;
    display: block;
    opacity: 0.7;
  }

  .stars-animation > .stars > svg > path {
    fill: rgb(103, 58, 183);
  }

  .stars-animation > .stars-animation-text {
    animation: background-pan 3s linear infinite;
    background: linear-gradient(
      to right,
      rgb(123, 31, 162),
      rgb(103, 58, 183),
      rgb(244, 143, 177),
      rgb(123, 31, 162)
    );
    background-size: 200%;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    white-space: nowrap;
  }

  /* Stats Card Styling */
  .stat-card {
    background: linear-gradient(135deg, #ffffff 0%, #faf5ff 100%);
    border: 1px solid #e5e7eb;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  }

  .stat-card:hover {
    border-color: rgba(139, 92, 246, 0.3);
    transform: translateY(-8px);
    box-shadow: 0 20px 40px rgba(139, 92, 246, 0.2), 0 10px 20px rgba(244, 143, 177, 0.15);
  }

  /* Gradient text for stat numbers */
  .stat-number {
    background: linear-gradient(
      135deg,
      rgb(123, 31, 162),
      rgb(103, 58, 183),
      rgb(244, 143, 177)
    );
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  /* How It Works Card Styling */
  .how-it-works-card {
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.5);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    overflow: visible;
  }

  .how-it-works-card:hover {
    background: rgba(255, 255, 255, 0.95);
    border-color: rgba(139, 92, 246, 0.3);
    transform: translateY(-8px);
    box-shadow: 0 20px 40px rgba(139, 92, 246, 0.25), 0 10px 20px rgba(244, 143, 177, 0.2);
  }

  .step-badge {
    transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    z-index: 20;
    border: 3px solid rgba(255, 255, 255, 0.9);
  }

  .how-it-works-card:hover .step-badge {
    transform: scale(1.15) rotate(5deg);
    box-shadow: 0 10px 25px rgba(139, 92, 246, 0.5), 0 5px 15px rgba(244, 143, 177, 0.3);
    border-color: rgba(255, 255, 255, 1);
  }

  /* CTA Button Styling */
  .cta-button {
    box-shadow: 0 10px 30px rgba(139, 92, 246, 0.3), 0 5px 15px rgba(244, 143, 177, 0.2);
    cursor: pointer;
  }

  .cta-button:hover {
    box-shadow: 0 20px 50px rgba(139, 92, 246, 0.5), 0 10px 25px rgba(244, 143, 177, 0.4);
  }

  .cta-button:active {
    transform: scale(0.98);
  }

  /* Custom background size and position utilities */
  .bg-size-200 {
    background-size: 200%;
  }

  .bg-pos-0 {
    background-position: 0%;
  }

  .group:hover .bg-pos-100 {
    background-position: 100%;
  }

  /* Footer Styling */
  .footer-link {
    font-size: 1rem;
    position: relative;
  }

  .footer-link:hover {
    transform: translateX(4px);
  }

  .social-icon-box {
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
  }

  .social-icon-box:hover {
    box-shadow: 0 8px 16px rgba(139, 92, 246, 0.4), 0 4px 8px rgba(0, 0, 0, 0.2);
  }
</style>