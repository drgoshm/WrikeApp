
import requestPromise from 'request-promise'
// import Axios from 'axios'

export const oauthCookies = {
  pull: {
    START_TOKEN: [
      {
        name: 'OAuth/AccessToken',
        commit: 'SET_TOKEN'
      },
      {
        name: 'OAuth/RefreshToken',
        commit: 'SET_REFRESH_TOKEN'
      },
      {
        name: 'OAuth/TokenType',
        commit: 'SET_TOKEN_TYPE'
      },
      {
        name: 'OAuth/Host',
        commit: 'SET_HOST'
      }
    ]
  },
  push: {
    UPDATE_TOKEN: [
      {
        name: 'OAuth/AccessToken',
        options: (store) => {
          return {
            expires: store.state.OAuth.AccessTokenExpires
          }
        }
      },
      {
        name: 'OAuth/RefreshToken',
        options: {
          expires: 86400
        }
      },
      {
        name: 'OAuth/TokenType',
        options: {
          expires: 86400
        }
      },
      {
        name: 'OAuth/Host',
        options: {
          expires: 86400
        }
      }
    ]
  }
}

export default {
  state: {
    ClientID: '2xZZWnxo',
    ClienSecret: '8nQUsG4JsQzBDZDlgSCXOULgXQKFzNDAhjhNYs5kKKVJfIMMQ28d8YnrdAFgT9Au',
    AccessToken: undefined,
    RefreshToken: undefined,
    TokenType: undefined,
    AccessTokenExpires: undefined,
    Host: undefined,
    IsPermanentToken: false,
    stateGetToken: false
  },
  mutations: {
    SET_TOKEN (state, token) {
      if (typeof token === 'object') {
        state.AccessToken = token.AccessToken
        state.AccessTokenExpires = token.AccessTokenExpires || state.AccessTokenExpires
        state.RefreshToken = token.RefreshToken || state.RefreshToken
        state.TokenType = token.TokenType || state.TokenType
        state.Host = token.Host || state.Host
      } else {
        state.AccessToken = token
      }
    },
    SET_REFRESH_TOKEN (state, token) {
      state.RefreshToken = token
    },
    SET_TOKEN_TYPE (state, type) {
      state.TokenType = type
    },
    SET_HOST (state, host) {
      state.Host = host
    },
    UPDATE_TOKEN () {
      // TODO: push into cookies
    },
    START_TOKEN () {
      // TODO: pull from cookies
    }
  },
  actions: {
    get_new_token ({state, commit}, code) {
      return new Promise((resolve, reject) => {
        /* eslint-disable */
        requestPromise({
          method: 'POST',
          headers: {
            'User-Agent': 'wrikeapp',
            'Content-type': 'application/x-www-form-urlencoded'
          },
          uri: 'https://www.wrike.com/oauth2/token',
          formData: {
            client_id: state.ClientID,
            client_secret: state.ClienSecret,
            grant_type: 'authorization_code',
            code: code
          }
        })
          .then((res) => {
            const parsedRes = JSON.parse(res)
            commit('SET_TOKEN', {
              AccessToken: parsedRes.access_token,
              RefreshToken: parsedRes.refresh_token,
              AccessTokenExpires: new Date(new Date().getTime() + parsedRes.expires_in*1000),
              TokenType: parsedRes.token_type,
              Host: parsedRes.host
            })
            commit('UPDATE_TOKEN')
            resolve(state)
          })
          .catch((err) => {
            console.log(err)
            reject(err)
          })
          
      })
    },
    refresh_token ({state, getters, commit}) {
      return new Promise((resolve, reject) => {
        if(!state.RefreshToken) {
          reject({name: 'RefreshTokenUndefined', message: 'Refresh token is undefined'})
        }
        if (getters.hasActiveToken) {
          resolve();
          return;
        }
        /* eslint-disable */
        requestPromise({
          method: 'POST',
          headers: {
            'User-Agent': 'wrikeapp',
            'Content-type': 'application/x-www-form-urlencoded'
          },
          uri: 'https://www.wrike.com/oauth2/token',
          formData: {
            client_id: state.ClientID,
            client_secret: state.ClienSecret,
            grant_type: 'refresh_token',
            refresh_token: state.RefreshToken
          }
        })
          .then((res) => {
            const parsedRes = JSON.parse(res)
            const refreshTokenExpires = new Date(new Date().getTime() + 86400000)
            commit('SET_TOKEN', {
              AccessToken: parsedRes.access_token,
              RefreshToken: parsedRes.refresh_token,
              AccessTokenExpires: new Date(new Date().getTime() + parsedRes.expires_in*1000),
              TokenType: parsedRes.token_type,
              Host: parsedRes.host
            })
            commit('UPDATE_TOKEN')
            resolve(state)
          })
          .catch((err) => {
            console.log(err)
            reject(err)
          })
          
      })
    },
    upload_token (context) {

      console.log(context)
    }
  },
  getters: {
    hasActiveToken(state) {
      return state.AccessToken && (state.AccessTokenExpires - (new Date) > 0) 
    },
    hasRefreshToken(state) {
      return state.RefreshToken !== undefined
    }
  },
}
