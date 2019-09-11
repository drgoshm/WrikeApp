<template>
  <div class="row h-100">
    <webview id="wrike-oauth-webview" :src="getOAuthAuthrizeURL()" 
    @did-finish-load="webviewDidFinishLoad" 
    @did-fail-load="webviewDidFailLoad"
    @will-navigate="webviewWillNavigate"
    v-if="!stateGetToken"
    partition="electron" class="w-100 h-100"></webview>
    <div v-if="stateGetToken">Get Accessing</div>
  </div>
</template>
<script>
  import { mapState, mapActions } from 'vuex'

  export default {
    data: function () {
      return {
        HookCSS: ''
      }
    },
    computed: mapState({
      ClientID: state => state.OAuth.ClientID
    }),
    methods: {
      ...mapActions([
        'get_new_token'
      ]),
      getOAuthAuthrizeURL () {
        return `https://www.wrike.com/oauth2/authorize/v4?client_id=${this.ClientID}&response_type=code`
      },
      webviewDidFinishLoad (event) {
        const webview = event.target
        // webview.openDevTools()
        webview.insertCSS(this.HookCSS)
        const url = webview.getURL()
        if (url.includes('wrikeapp/auth?code=')) {
          let match = /^https:\/\/wrikeapp\/auth\?code=(.*)/g.exec(url)
          if (match[1]) {
            this.get_new_token(match[1]).then((state) => {
              this.$router.push('/workspace')
            })
          }
        }
        console.log('did finish load: ' + webview.getURL())
      },
      webviewWillNavigate (event) {
        const webview = event.target
        if (!event.url.includes('https://www.wrike.com/ui/login_continue')) {
          require('electron').shell.openExternal(event.url)
          webview.loadURL(this.getOAuthAuthrizeURL())
        }
      },
      webviewDidFailLoad (event) {
        console.log(event)
        this.$store.commit('PUSH_NOTIFICATION', `${event.errorDescription} (${event.errorCode})`)
        const webview = event.target
        console.log(webview.getURL())
      }
    }

  }
</script>
<style>

</style>
