<template>
    <!-- TODO: implement -->
    <div class="container mt-5" style="max-width: 400px;">
      <h2 class="mb-4">Register</h2>
      <form @submit.prevent="registerUser">
        <div class="mb-3">
          <label for="name" class="form-label">Full Name</label>
          <input v-model="name" type="text" id="name" class="form-control" required />
        </div>
  
        <div class="mb-3">
          <label for="email" class="form-label">Email address</label>
          <input v-model="email" type="email" id="email" class="form-control" required />
        </div>
  
        <div class="mb-3">
          <label for="password" class="form-label">Password</label>
          <input v-model="password" type="password" id="password" class="form-control" required />
        </div>
  
        <button type="submit" class="btn btn-success w-100">Register</button>
      </form>
  
      <p class="mt-3">
        Already have an account?
        <router-link to="/login">Login here</router-link>
      </p>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        name: "",
        email: "",
        password: "",
      };
    },
    methods: {
      registerUser() {
        // 🔑 Replace with real auth (Firebase/Supabase/etc.)
        console.log("Registering user:", this.name, this.email);
        alert("Registration successful (stub). Redirecting...");
        this.$router.push("/login"); // redirect to login page
      },
    },
  };
  </script>
  