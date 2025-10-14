<script setup>
  import { ref, onMounted, onUnmounted, nextTick } from "vue"
  import { useRouter } from "vue-router"
  import Typewriter from "../components/comp/Typewriter.vue"
  import { Button } from "@/components/ui/button"

  const router = useRouter()
  const problem = ref(null)
  const isVisible = ref(false)
  const searchQuery = ref("")
  const heroElementsVisible = ref(false)
  const statsSection = ref(null)
  const statsVisible = ref(false)

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
      { threshold: 0.7 }
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
      { threshold: 0.3 }
    )

    if (problem.value) observer.observe(problem.value)
    if (statsSection.value) statsObserver.observe(statsSection.value)

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
        <source src="../assets/pikaso-project-2025-10-14.mp4" type="video/mp4" />
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
</style>
