<template>
    <nav class="navbar navbar-expand-lg bg-body-tertiary poppins-regular min-vw-100">
        <div class="container-fluid px-4">
            <!-- Logo -->
            <router-link to="/" class="navbar-brand poppins-bold d-flex align-items-center">
                <div class="d-flex bg-black align-items-center justify-content-center rounded-2 me-2" 
                    style="width: 28px; height: 28px">
                <span style="color: white">E</span>
                </div>
                <span class="fw-bold fs-6">EventEase SG</span>
            </router-link>

            <!-- Tabs -->
            <div class="d-flex align-items-center gap-4 w-full">
              <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav flex-row gap-2">
                  <li class="nav-item">
                    <router-link to="/friends" class="nav-link d-flex align-items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="icon">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
                      </svg>
                      Friends
                    </router-link>
                  </li>
                  <li>
                    <router-link to="/map" class="nav-link d-flex align-items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="icon">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z" />
                      </svg>
                      Map
                    </router-link>
                  </li>
                </ul>
              </div>
            </div>

            <!-- Login / register / profile -->
            <div class="d-flex">
                <router-link v-if="!isLoggedIn" to="/login" class="btn btn-outline-primary me-2">
                    Login
                </router-link>
                <router-link v-if="!isLoggedIn" to="/register" class="btn btn-primary">
                    Register
                </router-link>
                <router-link v-if="isLoggedIn" to="/profile" class="btn btn-outline-secondary">
                    Profile
                </router-link>
            </div>
        </div>
    </nav>
</template>

<script>
    
    export default {
        props: ["isLoggedIn"],
        data() {
            return {
            
            }
        },
        methods: {
            
        }
    }
</script>


<style scoped>
    .icon {
        width: 20px; 
        height: 20px;
    }
</style>
  