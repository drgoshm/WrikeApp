<template>
  <span>
    <input id="notice-control" type="checkbox" class="pl-1 pr-1" v-model="toggle"/>
    <label for="notice-control" class="fas fa-bell pl-1 pr-1 color-statusbar color-statusbar-hover"></label>
    <div id="notice-container" :class="toggleVisible()" class="w-25">
      <div class="notice-box color-box-body mh-25 w-100" v-for="(Notif,index) in Notifications" v-bind:key="index">
        <div class="notice-box-header color-box-header pr-2 pt-1 pb-1 row">
          <span class="col-11">{{Notif.name}}</span>
          <span class="fas fa-times float-right pt-1 color-box-header-texthover" @click="closeNotifBox(index)"></span>
        </div>
        <div class="notice-box-body p-3">{{Notif.message}}</div>
      </div>
      <div id="notice-empty" 
        class="color-box-body pt-1 pb-1 pl-2 pr-2" 
        v-if="Notifications.length === 0">
        No new notices
      </div>
    </div>
  </span>
</template>
<script>
  import {mapState, mapActions} from 'vuex'
  export default {
    data () {
      return { toggle: false }
    },
    computed: mapState({
      Notifications: state => state.Notifications
    }),
    methods: {
      ...mapActions([
        'getFolders'
      ]),
      toggleVisible () {
        return this.toggle ? '' : 'd-none'
      },
      closeNotifBox (index) {
        this.$store.commit('REMOVE_NOTIFICATION', index)
      }
    },
    watch: {
      Notifications (value) {
        this.toggle = value.length > 0
      }
    }
  }
</script>
<style scoped>
#notice-container {
  position: absolute;
  bottom: 28px;
}
#notice-empty, .notice-box  {
  margin-top: 20px;
  border: 1px solid #111;
  box-shadow: 0px 0px 18px #111;
}
.notice-box-header {
  margin: 1px;
}
.notice-box-header span:first-child {
  overflow: hidden;
  text-overflow: ellipsis;
}

.notice-box-header .fas {
  cursor: pointer;
}
.notice-box-body {
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
