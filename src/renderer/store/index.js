import Vue from 'vue'
import Vuex from 'vuex'

import modules from './modules'
import plugins from './plugins'

import {oauthCookies} from './modules/OAuth'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    cookies: {
      pull: {
        ...oauthCookies.pull
      },
      push: {
        ...oauthCookies.push
      }
    },
    Notifications: []
  },
  mutations: {
    PUSH_NOTIFICATION (state, message) {
      state.Notifications.push(message)
    },
    REMOVE_NOTIFICATION (state, index) {
      state.Notifications.splice(index, 1)
    }
  },
  modules,
  plugins,
  strict: process.env.NODE_ENV !== 'production'
})
