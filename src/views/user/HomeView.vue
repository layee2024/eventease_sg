<script setup>
  import { ref, onMounted, onUnmounted, nextTick } from "vue"
  import { useRouter } from "vue-router"
  import Typewriter from "../../components/comp/Typewriter.vue"
  import { Button } from "@/components/ui/button"

  const router = useRouter()
  const problem = ref(null)
  const isVisible = ref(false)
  const searchQuery = ref("")
  const heroElementsVisible = ref(false)
  const statsSection = ref(null)
  const statsVisible = ref(false)
  const howItWorksSection = ref(null)
  const howItWorksVisible = ref(false)

  onMounted(async () => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            isVisible.value = true
            observer.disconnect()
          }
        })
      },
      { threshold: 0.5 }
    )

    const statsObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            statsVisible.value = true
            statsObserver.disconnect()
          }
        })
      },
      { threshold: 0.5 }
    )

    const howItWorksObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            howItWorksVisible.value = true
            howItWorksObserver.disconnect()
          }
        })
      },
      { threshold: 0.3 }
    )

    if (problem.value) observer.observe(problem.value)
    if (statsSection.value) statsObserver.observe(statsSection.value)
    if (howItWorksSection.value) howItWorksObserver.observe(howItWorksSection.value)

    await nextTick()
    initStarAnimation()

    // Trigger hero animations
    setTimeout(() => {
      heroElementsVisible.value = true
    }, 100)

    // Ensure video plays on mount
    const video = document.querySelector('video')
    if (video) {
      video.play().catch(err => console.log('Video autoplay prevented:', err))
    }
  })

  const scrollToNext = () => {
    if (problem.value) {
      problem.value.scrollIntoView({ behavior: "smooth" })
    }
  }

  const handleSearch = () => {
    if (searchQuery.value.trim()) {
      router.push({
        path: '/events',
        query: { search: searchQuery.value.trim() }
      })
    } else {
      router.push('/events')
    }
  }

  const handleSearchKeypress = (event) => {
    if (event.key === 'Enter') {
      handleSearch()
    }
  }

  onUnmounted(() => {
    if (problem.value) observer.unobserve(problem.value)
  })

  // Star animation
  function initStarAnimation() {
    let index = 0
    const interval = 1000

    const rand = (min, max) =>
      Math.floor(Math.random() * (max - min + 1)) + min

    const animate = (star) => {
      star.style.setProperty("--star-left", `${rand(-10, 100)}%`)
      star.style.setProperty("--star-top", `${rand(-40, 80)}%`)

      // reset animation
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
          Join <span class="text-yellow-400 font-bold">5,000+ students</span> discovering
          <span class="text-yellow-400 font-bold">200+ events</span> across Singapore's universities
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
            <button
              @click="handleSearch"
              class="absolute right-2 px-6 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-full transition-all duration-300 hover:shadow-lg"
            >
              Search
            </button>
          </div>
        </div>

        <!-- Scroll Arrow -->
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
            class="flex flex-col group relative overflow-hidden p-6 rounded-xl shadow-md transition-all duration-500 ease-out transform border border-gray-100 bg-white/70 backdrop-blur-sm hover:-translate-y-2 hover:shadow-2xl hover:border-violet-300 hover:bg-white/90"
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
                ></svg>
              </div>
              <h3 class="font-semibold text-lg text-gray-900 group-hover:text-violet-600">{{ card.title }}</h3>
            </div>
            <p class="text-gray-600 text-sm mt-3 group-hover:text-gray-800">{{ card.text }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Stats/Social Proof Section -->
    <section
      ref="statsSection"
      class="relative w-full bg-white py-20 px-6 md:px-16 lg:px-24"
    >
      <div class="max-w-7xl mx-auto">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          <!-- Stat Card 1: Total Events -->
          <div
            class="stat-card group relative overflow-hidden p-8 rounded-2xl transition-all duration-700 ease-out transform"
            :class="statsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'"
            :style="{ transitionDelay: '0ms' }"
          >
            <div class="relative z-10">
              <div class="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 text-purple-600 group-hover:from-purple-200 group-hover:to-blue-200 group-hover:scale-110 transition-all duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-8 h-8">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
              </div>
              <div class="text-center">
                <div class="stat-number text-4xl md:text-5xl font-extrabold mb-2 group-hover:scale-105 transition-transform duration-300">200+</div>
                <div class="text-gray-600 text-sm md:text-base font-medium">Total Events</div>
              </div>
            </div>
          </div>

          <!-- Stat Card 2: Active Students -->
          <div
            class="stat-card group relative overflow-hidden p-8 rounded-2xl transition-all duration-700 ease-out transform"
            :class="statsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'"
            :style="{ transitionDelay: '150ms' }"
          >
            <div class="relative z-10">
              <div class="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-600 group-hover:from-blue-200 group-hover:to-indigo-200 group-hover:scale-110 transition-all duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-8 h-8">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                </svg>
              </div>
              <div class="text-center">
                <div class="stat-number text-4xl md:text-5xl font-extrabold mb-2 group-hover:scale-105 transition-transform duration-300">5,000+</div>
                <div class="text-gray-600 text-sm md:text-base font-medium">Active Students</div>
              </div>
            </div>
          </div>

          <!-- Stat Card 3: Event Categories -->
          <div
            class="stat-card group relative overflow-hidden p-8 rounded-2xl transition-all duration-700 ease-out transform"
            :class="statsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'"
            :style="{ transitionDelay: '300ms' }"
          >
            <div class="relative z-10">
              <div class="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-pink-100 to-red-100 text-pink-600 group-hover:from-pink-200 group-hover:to-red-200 group-hover:scale-110 transition-all duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-8 h-8">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                </svg>
              </div>
              <div class="text-center">
                <div class="stat-number text-4xl md:text-5xl font-extrabold mb-2 group-hover:scale-105 transition-transform duration-300">15</div>
                <div class="text-gray-600 text-sm md:text-base font-medium">Event Categories</div>
              </div>
            </div>
          </div>

          <!-- Stat Card 4: Universities -->
          <div
            class="stat-card group relative overflow-hidden p-8 rounded-2xl transition-all duration-700 ease-out transform"
            :class="statsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'"
            :style="{ transitionDelay: '450ms' }"
          >
            <div class="relative z-10">
              <div class="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-yellow-100 to-orange-100 text-yellow-600 group-hover:from-yellow-200 group-hover:to-orange-200 group-hover:scale-110 transition-all duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-8 h-8">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
                </svg>
              </div>
              <div class="text-center">
                <div class="stat-number text-4xl md:text-5xl font-extrabold mb-2 group-hover:scale-105 transition-transform duration-300">10+</div>
                <div class="text-gray-600 text-sm md:text-base font-medium">Universities</div>
              </div>
            </div>
          </div>
        </div>
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
            <div class="step-badge absolute -top-3 -right-3 flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 text-white font-bold text-lg shadow-lg">
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
            <div class="step-badge absolute -top-3 -right-3 flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-pink-500 to-pink-600 text-white font-bold text-lg shadow-lg">
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
            <div class="step-badge absolute -top-3 -right-3 flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white font-bold text-lg shadow-lg">
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

    <!-- Footer Section -->
    <footer class="relative w-full" style="background-color: #111729;">
      <div class="max-w-7xl mx-auto px-6 md:px-16 lg:px-24 py-16">
        <!-- Main Footer Content -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
          <!-- Column 1: About & Navigation -->
          <div class="space-y-6">
            <!-- Logo/Brand -->
            <div>
              <h3 class="text-3xl font-bold text-white mb-2">EventEase SG</h3>
              <p class="text-gray-300 text-lg">Discover, Save, and Plan Your Perfect Events</p>
            </div>

            <!-- Navigation Links -->
            <nav class="flex flex-col space-y-3">
              <a href="#" class="footer-link text-gray-300 hover:text-white transition-colors duration-300 inline-flex items-center group">
                <span class="w-0 group-hover:w-2 h-0.5 bg-purple-400 mr-0 group-hover:mr-2 transition-all duration-300"></span>
                About Us
              </a>
              <a href="#" class="footer-link text-gray-300 hover:text-white transition-colors duration-300 inline-flex items-center group">
                <span class="w-0 group-hover:w-2 h-0.5 bg-purple-400 mr-0 group-hover:mr-2 transition-all duration-300"></span>
                Contact
              </a>
              <a href="#" class="footer-link text-gray-300 hover:text-white transition-colors duration-300 inline-flex items-center group">
                <span class="w-0 group-hover:w-2 h-0.5 bg-purple-400 mr-0 group-hover:mr-2 transition-all duration-300"></span>
                FAQ
              </a>
              <a href="#" class="footer-link text-gray-300 hover:text-white transition-colors duration-300 inline-flex items-center group">
                <span class="w-0 group-hover:w-2 h-0.5 bg-purple-400 mr-0 group-hover:mr-2 transition-all duration-300"></span>
                Privacy Policy
              </a>
              <a href="#" class="footer-link text-gray-300 hover:text-white transition-colors duration-300 inline-flex items-center group">
                <span class="w-0 group-hover:w-2 h-0.5 bg-purple-400 mr-0 group-hover:mr-2 transition-all duration-300"></span>
                Terms of Service
              </a>
            </nav>
          </div>

          <!-- Column 2: Social Media & Contact -->
          <div class="space-y-6 md:text-right">
            <!-- Social Media Section -->
            <div>
              <h4 class="text-xl font-bold text-white mb-4">Connect With Us</h4>

              <!-- Social Media Icons -->
              <div class="flex flex-wrap gap-3 mb-8 md:justify-end">
                <!-- Instagram -->
                <a href="#" class="social-icon-box group relative w-12 h-12 flex items-center justify-center rounded-lg bg-white/5 border border-white/10 hover:bg-gradient-to-br hover:from-purple-500 hover:to-pink-500 hover:border-transparent transition-all duration-300 hover:scale-110">
                  <svg class="w-5 h-5 text-gray-300 group-hover:text-white transition-colors duration-300" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>

                <!-- Facebook -->
                <a href="#" class="social-icon-box group relative w-12 h-12 flex items-center justify-center rounded-lg bg-white/5 border border-white/10 hover:bg-gradient-to-br hover:from-blue-500 hover:to-blue-600 hover:border-transparent transition-all duration-300 hover:scale-110">
                  <svg class="w-5 h-5 text-gray-300 group-hover:text-white transition-colors duration-300" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>

                <!-- Twitter/X -->
                <a href="#" class="social-icon-box group relative w-12 h-12 flex items-center justify-center rounded-lg bg-white/5 border border-white/10 hover:bg-gradient-to-br hover:from-gray-700 hover:to-gray-900 hover:border-transparent transition-all duration-300 hover:scale-110">
                  <svg class="w-5 h-5 text-gray-300 group-hover:text-white transition-colors duration-300" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>

                <!-- LinkedIn -->
                <a href="#" class="social-icon-box group relative w-12 h-12 flex items-center justify-center rounded-lg bg-white/5 border border-white/10 hover:bg-gradient-to-br hover:from-blue-600 hover:to-blue-700 hover:border-transparent transition-all duration-300 hover:scale-110">
                  <svg class="w-5 h-5 text-gray-300 group-hover:text-white transition-colors duration-300" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>

                <!-- TikTok -->
                <a href="#" class="social-icon-box group relative w-12 h-12 flex items-center justify-center rounded-lg bg-white/5 border border-white/10 hover:bg-gradient-to-br hover:from-pink-500 hover:to-cyan-500 hover:border-transparent transition-all duration-300 hover:scale-110">
                  <svg class="w-5 h-5 text-gray-300 group-hover:text-white transition-colors duration-300" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                  </svg>
                </a>
              </div>

              <!-- Contact Section -->
              <div class="space-y-4">
                <!-- Question Prompt -->
                <p class="text-gray-400 text-sm font-medium md:text-right">Have questions? Reach out to us:</p>

                <!-- Contact Email -->
                <div class="flex items-center gap-3 text-gray-300 md:justify-end">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 text-purple-400 md:order-2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                  <a href="mailto:support@eventeasesg.com" class="hover:text-white transition-colors duration-300 md:order-1">
                    support@eventeasesg.com
                  </a>
                </div>

                <!-- Made in Singapore -->
                <div class="pt-4 space-y-1 md:text-right">
                  <p class="text-white font-medium">Made with ❤️ in Singapore</p>
                  <p class="text-gray-500 text-sm">For students, by students</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Divider -->
        <div class="border-t border-white/10 mb-8"></div>

        <!-- Bottom Bar: Copyright and Links -->
        <div class="flex flex-col md:flex-row justify-between items-center gap-4">
          <p class="text-gray-400 text-sm">
            © 2025 EventEase SG. All rights reserved.
          </p>

          <!-- Footer Links -->
          <div class="flex items-center gap-6 text-sm">
            <a href="#" class="text-gray-400 hover:text-white transition-colors duration-300">Sitemap</a>
            <span class="text-gray-600">•</span>
            <a href="#" class="text-gray-400 hover:text-white transition-colors duration-300">Accessibility</a>
            <span class="text-gray-600">•</span>
            <a href="#" class="text-gray-400 hover:text-white transition-colors duration-300">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
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
    background: white;
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