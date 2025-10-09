import { createWebHistory, createRouter } from 'vue-router'

import Home from '../components/home/Home.vue'
import Login from '../components/onboarding/Login.vue'
import Register from '../components/onboarding/Register.vue'
import Friends from '../components/friends/Friends.vue'
import EventDetail from '../components/events/EventDetails.vue'

const history = createWebHistory()

const routes = [
  {
    path: '/',
    component: Home,
  },
  {
    path: '/login',
    component: Login,
  },
  {
    path: '/register',
    component: Register,
  },
  {
    path: '/friends',
    component: Friends,
  },
  {
    path: '/eventDetail',
    component: EventDetail,
  },
]

const router = createRouter({
  history,
  routes,
})

export default router
