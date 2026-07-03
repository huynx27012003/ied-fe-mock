import { createRouter, createWebHistory } from 'vue-router'
import store from '../store'

// Lazy load components
const Layout = () => import(/* webpackChunkName: "layout" */ '../layout/index.vue')
const Login = () => import(/* webpackChunkName: "auth" */ '../views/Login.vue')
const treeNavigation = () => import(/* webpackChunkName: "main" */ '../views/MainScreenView/treeNavigation.vue')
const routes = [
  {
    path: '/',
    component: Layout,
    children: [
      {
        path: '',
        redirect: { name: 'tree' }
      },
      {
        path: 'login',
        name: 'login',
        component: Login
      },
      {
        path: 'home',
        name: 'tree',
        meta: { requiresAuth: true },
        component: treeNavigation
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

const TEMP_BYPASS_LOGIN = true

// Navigation Guard
router.beforeEach((to, from, next) => {
  if (TEMP_BYPASS_LOGIN) {
    if (to.name === 'login') {
      next({ name: 'tree' })
      return
    }
    next()
    return
  }

  const isAuth = store.state.isAuthenticated

  if (to.meta.requiresAuth && !isAuth) {
    next({ name: 'login' })
  } else if (to.name === 'login' && isAuth) {
    next({ name: 'tree' })
  } else {
    next()
  }
})

export default router
