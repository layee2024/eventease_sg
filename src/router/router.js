import { createRouter, createWebHistory } from 'vue-router';
import LoginView from '@/views/LoginView.vue';
import RegisterView from '../views/RegisterView.vue';
import VerifyView from '../views/VerifyView.vue';
import HomeView from '../views/HomeView.vue';
import MapView from '../views/MapView.vue';
import SavedView from '../views/SavedView.vue';
import FriendsView from '../views/FriendsView.vue';
import ProfileView from '../views/ProfileView.vue';
import EventsView from '../views/EventsView.vue';


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
    path: '/events',
    name: 'EventsView',
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
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;