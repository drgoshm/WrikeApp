import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'loading-page',
      component: require('@/components/LoadingPage').default
    },
    {
      path: '/auth',
      name: 'auth-page',
      component: require('@/components/AuthPage').default
    },
    {
      path: '/workspace',
      name: 'workspace-page',
      component: require('@/components/WorkspacePage').default
    },
    {
      path: '/settings',
      name: 'settings-page',
      component: require('@/components/SettingsPage').default
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})
