import { createRouter, createWebHistory } from 'vue-router';
import LoginView from '@/views/LoginView.vue';
import RegisterView from '../views/RegisterView.vue';
import OTPView from '../views/OTPView.vue';


const routes = [
  {
    path: '/login',
    name: 'LoginView',
    component: LoginView,
  },
  {
    path: '/register',
    name: 'RegisterView',
    component: RegisterView,
  },
  {
    path: '/otp',
    name: 'OTPView',
    component: OTPView,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;