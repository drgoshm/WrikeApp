<template>
  <li class="browser-item">
    <div class="browser-item-title w-100" :style="{paddingLeft: 20+deep*10+'px'}" :class="isActive() ? 'active' : ''" @click="doActivate">
      <span v-if="hasChildren" class="fa" :class="isReleased('fa-caret-down', 'fa-caret-right')" @click="doToggle"></span><!--
      --><span>{{title}}</span>
    </div>
    <ul v-if="hasChildren" :class="isReleased('', 'd-none')">
      <folder v-for="childId in children" :folderId="childId" :deep="1+deep" v-bind:key="childId"></folder>
    </ul>
  </li>
</template>
<script>
import { mapState } from 'vuex'
export default {
  data () {
    return {
      toggle: false,
      active: false
    }
  },
  methods: {
    isReleased (trueClass, falseClass) {
      return this.toggle ? trueClass : falseClass
    },
    isActive () {
      return this.folderId === this.CurrentFolder
    },
    deepClass (prefix) {
      return prefix + (this.deep ? this.deep : 0)
    },
    doToggle () {
      this.toggle = !this.toggle
    },
    doActivate () {
      this.active = true
      this.$store.commit('SET_CURRENT_FOLDER', this.folderId)
    }
  },
  name: 'folder',
  computed: {
    ...mapState({
      Folders: state => state.ProjectBrowser.Folders,
      CurrentFolder: state => state.ProjectBrowser.CurrentFolder
    }),
    title () {
      return this.Folders[this.folderId].title
    },
    hasChildren () {
      return this.Folders[this.folderId].childIds && this.Folders[this.folderId].childIds.length
    },
    children () {
      return this.Folders[this.folderId].childIds
    }
  },
  props: {
    folderId: String,
    deep: {default: 0}
  }
}
</script>
<style>
.browser-item {
  opacity: 1;
}
.browser-item .fa {
    width: 20px;
    margin-left: -20px;
    text-align: center;
}
.browser-item .browser-item-title {
  max-height: 2em;
  cursor: pointer;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.browser-item ul {
opacity: 1;
}
</style>

