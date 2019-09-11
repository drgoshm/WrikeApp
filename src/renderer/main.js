import Vue from 'vue'
import axios from 'axios'

import App from './App'
import router from './router'
import store from './store'
import cookies from '../plugins/common/cookies'

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.http = Vue.prototype.$http = axios
Vue.config.productionTip = false

Vue.use(cookies)

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  data: {},
  methods: {},
  template: '<App />',
  created () {
    this.$store.commit('START_TOKEN')
    if (this.$store.getters.hasActiveToken || this.$store.getters.hasRefreshToken) {
      this.$router.push('/workspace')
    }
  }
}).$mount('#app')
