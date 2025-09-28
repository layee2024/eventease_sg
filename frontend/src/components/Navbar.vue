<template>
    <nav class="navbar navbar-expand-lg bg-body-tertiary poppins-regular">
        <div class="container-fluid px-4">
            <router-link to="/" class="navbar-brand poppins-bold">
                <img src="/logo.png" alt="EventEase SG" width="110" height="35">
            </router-link>
        
            <div class="collapse navbar-collapse">
                <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                    <li class="nav-item">
                        <div class="input-group">
                            <span class="input-group-text border-end-0" style="background-color: #f2c3b9;">
                                <!-- Search Icon -->
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" 
                                    stroke-width="1.5" stroke="currentColor" class="icon">
                                    <path stroke-linecap="round" stroke-linejoin="round" 
                                    d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                                </svg>
                            </span>
                            <input id="search" type="search" class="form-control border-start-0" placeholder="Search events" />
                        </div>
                    </li>
                </ul>
        
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
        </div>
    </nav>
</template>

<script>
    export default {
    props: ["isLoggedIn"],
    };
</script>

<style scoped>
    #search {
        font-size: 14px;
    }

    .icon {
        width: 20px; 
        height: 20px;
    }
</style>
  