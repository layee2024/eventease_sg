import { createRouter, createWebHistory } from 'vue-router';
import LoginView from '@/views/LoginView.vue';
import RegisterView from '../views/RegisterView.vue';

// User
import VerifyView from '../views/user/VerifyView.vue';
import HomeView from '../views/user/HomeView.vue';
import MapView from '../views/user/MapView.vue';
import SavedView from '../views/user/SavedView.vue';
import FriendsView from '../views/user/FriendsView.vue';
import ProfileView from '../views/user/ProfileView.vue';
import EventsView from '../views/user/events/EventsView.vue';
import ShuffleView from '../views/user/ShuffleView.vue';

// Organiser
import DashboardView from '../views/organiser/DashboardView.vue'


const routes = [
  {
    path: '/',
    name: 'HomeView',
    component: HomeView,
  },
  {
    path: '/login',
    name: 'LoginView',
    component: LoginView,
  },
  {
    path: '/shuffle',
    name: 'ShuffleView',
    component: ShuffleView,
  },
  {
    path: '/register',
    name: 'RegisterView',
    component: RegisterView,
  },
  {
    path: '/verify',
    name: 'VerifyView',
    component: VerifyView,
  },
  {
    path: "/events",
    name: "events",
    component: EventsView,
  },
  {
    path: '/map',
    name: 'MapView',
    component: MapView,
  },
  {
    path: '/saved',
    name: 'SavedView',
    component: SavedView,
  },
  {
    path: '/friends',
    name: 'FriendsView',
    component: FriendsView,
  },
  {
    path: '/profile',
    name: 'ProfileView',
    component: ProfileView,
  },
  {
    path: '/shuffle',
    name: 'ShuffleView',
    component: ShuffleView,
  },
  {
    path: '/dashboard',
    name: 'DashboardView',
    component: DashboardView,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
});

export default router;