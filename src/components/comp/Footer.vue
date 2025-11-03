<script>
export default {
  methods: {
    navigateToAboutUs() {
      if (this.$route.path === '/' || this.$route.name === 'home') {
        this.scrollToSection('about-us-section');
      } else {
        this.$router.push({ path: '/', hash: '#about-us-section' });
      }
    },
    navigateToEvents() {
      this.$router.push('/events');
    },
    navigateToWork() {
      if (this.$route.path === '/' || this.$route.name === 'home') {
        this.scrollToSection('how-it-works-section');
      } else {
        this.$router.push({ path: '/', hash: '#how-it-works-section' });
      }
    },
    scrollToSection(sectionId) {
      this.$nextTick(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          const yOffset = -80;
          const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      });
    }
  }
}
</script>

<template>

  <footer class="relative w-full overflow-hidden" style="background-color: #111729;">

   

    <div class="relative max-w-7xl mx-auto px-6 md:px-16 lg:px-24 py-16">
      <!-- Main Footer Content -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
        <!-- Column 1: About & Brand -->
        <div class="space-y-6">
          <!-- Logo/Brand -->
          <div>
            <h3
              class="text-3xl font-bold text-white mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              EventEase SG
            </h3>
            <p class="text-gray-300 text-base leading-relaxed">
              Your go-to platform for discovering and planning amazing events across Singapore
            </p>
          </div>

          <div class="flex items-start gap-3 p-4 rounded-lg bg-white/5 border border-white/10">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
              stroke="currentColor" class="w-6 h-6 text-purple-400 flex-shrink-0 mt-0.5">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
            </svg>
            <div>
              <p class="text-white font-medium text-sm">Discover. Save. Plan.</p>
              <p class="text-gray-400 text-xs mt-1">Your perfect event awaits</p>
            </div>
          </div>
        </div>

        <div class="space-y-6">
          <h4 class="text-xl font-bold text-white">Quick Links</h4>

          <nav class="space-y-3">
            <a @click.prevent="navigateToAboutUs" href="#about-us-section"
              class="footer-link text-gray-300 hover:text-white transition-all duration-300 flex items-center group cursor-pointer">
              <span
                class="w-0 group-hover:w-2 h-0.5 bg-purple-400 mr-0 group-hover:mr-2 transition-all duration-300"></span>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                stroke="currentColor"
                class="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M11.25 4.5l7.5 7.5-7.5 7.5m-6-15l7.5 7.5-7.5 7.5" />
              </svg>
              About Us
            </a>

            <a @click.prevent="navigateToEvents" href="#"
              class="footer-link text-gray-300 hover:text-white transition-all duration-300 flex items-center group cursor-pointer">
              <span
                class="w-0 group-hover:w-2 h-0.5 bg-purple-400 mr-0 group-hover:mr-2 transition-all duration-300"></span>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                stroke="currentColor"
                class="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M11.25 4.5l7.5 7.5-7.5 7.5m-6-15l7.5 7.5-7.5 7.5" />
              </svg>
              Browse Events
            </a>

            <a @click.prevent="navigateToWork" href="#how-it-works-section"
              class="footer-link text-gray-300 hover:text-white transition-all duration-300 flex items-center group">
              <span
                class="w-0 group-hover:w-2 h-0.5 bg-purple-400 mr-0 group-hover:mr-2 transition-all duration-300"></span>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                stroke="currentColor"
                class="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M11.25 4.5l7.5 7.5-7.5 7.5m-6-15l7.5 7.5-7.5 7.5" />
              </svg>
              How It Works
            </a>
          </nav>

          <div class="pt-4">
            <h5 class="text-sm font-semibold text-gray-400 mb-3">Support</h5>
            <nav class="space-y-2">
              <a href="#" class="text-sm text-gray-400 hover:text-purple-400 transition-colors duration-300 block">Help
                Center</a>
              <a href="#"
                class="text-sm text-gray-400 hover:text-purple-400 transition-colors duration-300 block">Privacy
                Policy</a>
              <a href="#" class="text-sm text-gray-400 hover:text-purple-400 transition-colors duration-300 block">Terms
                of Service</a>
            </nav>
          </div>
        </div>

        <div class="space-y-6">
          <h4 class="text-xl font-bold text-white">Connect With Us</h4>

          <!-- Social Media Icons -->
          <div class="flex flex-wrap gap-3">
            <!-- Instagram -->
            <a href="https://www.instagram.com/eventease_sg"
              class="social-icon-box group relative w-12 h-12 flex items-center justify-center rounded-lg bg-white/5 border border-white/10 hover:bg-gradient-to-br hover:from-purple-500 hover:to-pink-500 hover:border-transparent transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-purple-500/50">
              <svg class="w-5 h-5 text-gray-300 group-hover:text-white transition-colors duration-300"
                fill="currentColor" viewBox="0 0 24 24">
                <path
                  d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </a>

            <!-- Facebook -->
            <a href="#"
              class="social-icon-box group relative w-12 h-12 flex items-center justify-center rounded-lg bg-white/5 border border-white/10 hover:bg-blue-600 hover:border-transparent transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-blue-500/50 disabled">
              <svg class="w-5 h-5 text-gray-300 group-hover:text-white transition-colors duration-300"
                fill="currentColor" viewBox="0 0 24 24">
                <path
                  d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </a>

            <!-- Twitter/X -->
            <a href="#"
              class="social-icon-box group relative w-12 h-12 flex items-center justify-center rounded-lg bg-white/5 border border-white/10 hover:bg-black hover:border-transparent transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-gray-500/50 disabled">
              <svg class="w-5 h-5 text-gray-300 group-hover:text-white transition-colors duration-300"
                fill="currentColor" viewBox="0 0 24 24">
                <path
                  d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>

            <!-- LinkedIn -->
            <a href="#"
              class="social-icon-box group relative w-12 h-12 flex items-center justify-center rounded-lg bg-white/5 border border-white/10 hover:bg-blue-700 hover:border-transparent transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-blue-600/50 disabled">
              <svg class="w-5 h-5 text-gray-300 group-hover:text-white transition-colors duration-300"
                fill="currentColor" viewBox="0 0 24 24">
                <path
                  d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </a>
          </div>

          <!-- Contact Info -->
          <div class="space-y-4 pt-2">
            <div
              class="flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-white/10 hover:border-purple-400/50 transition-colors duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                stroke="currentColor" class="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
              <div>
                <p class="text-xs text-gray-400 mb-1">Email Us</p>
                <a href="mailto:support@eventeasesg.com"
                  class="text-gray-300 hover:text-white transition-colors duration-300 text-sm">
                  support@eventeasesg.com
                </a>
              </div>
            </div>

            <div class="flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                stroke="currentColor" class="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
              <div>
                <p class="text-xs text-gray-400 mb-1">Location</p>
                <p class="text-gray-300 text-sm">Singapore</p>
              </div>
            </div>
          </div>

          <!-- Made in Singapore Badge -->
          <div class="pt-4">
            <div
              class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-red-500/20 to-white/20 border border-white/20">
              <span class="text-2xl">🇸🇬</span>
              <div class="text-left">
                <p class="text-white font-semibold text-sm">Made in Singapore</p>
                <p class="text-gray-400 text-xs">For students, by students</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Divider -->
      <div class="border-t border-white/10 mb-8"></div>

      <!-- Bottom Bar -->
      <div class="flex flex-col md:flex-row justify-between items-center gap-4">
        <p class="text-gray-400 text-sm">
          © 2025 EventEase SG. All rights reserved.
        </p>

        <div class="flex items-center gap-6 text-sm">
          <a href="#" class="text-gray-400 hover:text-purple-400 transition-colors duration-300">Sitemap</a>
          <span class="text-gray-600">•</span>
          <a href="#" class="text-gray-400 hover:text-purple-400 transition-colors duration-300">Accessibility</a>
          <span class="text-gray-600">•</span>
          <a href="#" class="text-gray-400 hover:text-purple-400 transition-colors duration-300">Cookies</a>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
@keyframes blob {
  0% {
    transform: translate(0px, 0px) scale(1);
  }

  33% {
    transform: translate(30px, -50px) scale(1.1);
  }

  66% {
    transform: translate(-20px, 20px) scale(0.9);
  }

  100% {
    transform: translate(0px, 0px) scale(1);
  }
}

.animate-blob {
  animation: blob 7s infinite;
}

.animation-delay-2000 {
  animation-delay: 2s;
}

.animation-delay-4000 {
  animation-delay: 4s;
}

.disabled {
    pointer-events: none;
    color: gray; 
    text-decoration: none;  
  }
</style>