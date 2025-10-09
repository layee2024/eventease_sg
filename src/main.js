import './style.css'

import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'

import { createApp } from 'vue'
import App from './App.vue'
import router from './routes/routes.js'

const app = createApp(App)
app.use(router).mount('#app')


