import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from '@/utils/supabase'
import LoginView from '@/views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'

// User
import VerifyView from '../views/user/VerifyView.vue'
import HomeView from '../views/user/HomeView.vue'
import MapView from '../views/user/MapView.vue'
import SavedView from '../views/user/SavedView.vue'
import FriendsView from '../views/user/FriendsView.vue'
import ProfileView from '../views/user/ProfileView.vue'
import EventsView from '../views/user/events/EventsView.vue'
import EventDetails from '../views/user/events/EventDetails.vue'
import ShuffleView from '../views/user/ShuffleView.vue'
import OnboardingView from '../views/user/Onboarding.vue'
// import ScheduleView from '../views/user/scheduleView.vue'
  


// Organiser
import DashboardView from '../views/organiser/DashboardView.vue'
import PlannerView from '../views/user/PlannerView.vue'


const routes = [
  // User
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
    path: '/onboarding',
    name: 'OnboardingView',
    component: OnboardingView,
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
    path: "/event/:id",
    name: "EventDetails",
    component: EventDetails,
  },
  {
    path: '/map',
    name: 'MapView',
    component: MapView,
  },
  {
    path: '/planner',
    name: 'PlannerView',
    component: PlannerView,
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
  // {
  //   path: '/schedule',
  //   name: 'schedule',
  //   component: ScheduleView,
  // },



  // Organiser
  {
    path: '/dashboard',
    name: 'DashboardView',
    component: DashboardView,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

router.beforeEach(async (to, from, next) => {
  if (to.path === '/onboarding') {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return next('/login')
    }

    const { data: prefs, error } = await supabase
      .from('user_preferences')
      .select('onboarding')
      .eq('id', user.id)
      .maybeSingle()

    if (error) {
      console.error('Error fetching onboarding status:', error)
      return next('/')
    }

    // If onboarding already done, redirect home
    if (prefs?.onboarding === true) {
      return next('/')
    }
  }

  // Allow navigation normally
  next()
})

export default router