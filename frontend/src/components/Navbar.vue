<template>
    <nav class="navbar navbar-expand-lg bg-body-tertiary poppins-regular">
        <div class="container-fluid px-4">
            <!-- Logo -->
            <router-link to="/" class="navbar-brand poppins-bold d-flex align-items-center">
                <div class="d-flex bg-black align-items-center justify-content-center rounded-2 me-2" 
                    style="width: 28px; height: 28px">
                <span style="color: white">E</span>
                </div>
                <span class="fw-bold fs-6">EventEase SG</span>
            </router-link>

            <div class="d-flex align-items-center">
                <!-- Search Bar -->
                <form @submit.prevent="handleSearch" class="flex-grow-1 mx-3" style="max-width: 500px; min-width: 300px;">
                    <div class="position-relative">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" 
                            stroke-width="1.5" stroke="currentColor" 
                            class="icon position-absolute top-50 start-0 translate-middle-y ms-3">
                            <path stroke-linecap="round" stroke-linejoin="round" 
                            d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                        </svg>
                    <input
                        type="search"
                        class="form-control ps-5"
                        placeholder="Search events or activities"
                        v-model="searchQuery"
                    />
                    </div>
                </form>

                <!-- Location -->
                <div class="d-none d-md-flex align-items-center me-3">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="icon me-1">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                        <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                    </svg>

                    <div class="dropdown">
                        <button 
                            class="btn btn-link text-decoration-none p-0 dropdown-toggle text-black" 
                            type="button" 
                            data-bs-toggle="dropdown"
                        >
                            {{ currentLocation }}
                        </button>
                        <ul class="dropdown-menu">
                            <li><h6 class="dropdown-header">Select location</h6></li>
                            <li v-for="location in locations" :key="location">
                            <button 
                                class="dropdown-item" 
                                :class="{ active: currentLocation === location }"
                                @click="selectLocation(location)"
                            >
                                {{ location }}
                            </button>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

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
        locations: [
            "All", "Central", "North", "Northeast", "East", "West"
        ],
        currentLocation: "All",
        searchQuery: ""
        }
    },
    methods: {
        selectLocation(location) {
            this.currentLocation = location
        },
    }
    }
</script>


<style scoped>
    .icon {
        width: 20px; 
        height: 20px;
    }
</style>
  