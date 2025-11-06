import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from '@/utils/supabase'
import LoginView from '@/views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import { toast } from 'vue-sonner'

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
import ScheduleView from '../views/user/scheduleView.vue'
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
  {
    path: '/ScheduleView',
    name: 'ScheduleView',
    component: ScheduleView,
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

router.beforeEach(async (to, from, next) => {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Only logged in users
  if (to.path === '/onboarding') {
    if (!user) return next('/login')

    const { data: prefs, error } = await supabase
      .from('user_preferences')
      .select('onboarding')
      .eq('id', user.id)
      .maybeSingle()

    if (error) {
      console.error('Error fetching onboarding status:', error)
      return next('/')
    }

    if (prefs?.onboarding === true) return next('/')
  }

  // Guard Profile, Saved, Friends
  const protectedPaths = ['/profile', '/saved', '/friends']
  if (protectedPaths.includes(to.path) && !user) {
    toast.error('Please login first')
    return next('/login')
  }

  // Default allow navigation
  next()
})

export default router