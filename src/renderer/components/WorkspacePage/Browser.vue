<template>
    <span id="browser-container" ref="browser-container" class="h-100 color-browser-panel" :style="{width: width + 'px'}" unselectable="on"
 onselectstart="return false;">
        <caption class="d-block w-100 p-1"><i class="fa fa-project-diagram"></i>Projects</caption>
        <ul v-if="foldersUpdated">
          <Folder v-for="folder in rootList(true)" :folder-id="folder" v-bind:key="folder"></Folder>
        </ul>
        <caption class="d-block w-100 p-1"><i class="fa fa-folder"></i>Folders</caption>
        <ul v-if="foldersUpdated">
          <Folder v-for="folder in rootList(false)" :folder-id="folder" v-bind:key="folder" ></Folder>
        </ul>
        <caption class="d-block w-100 p-1"><i class="fa fa-recycle"></i>Recycle Bin</caption>
        <ul v-if="foldersUpdated">
          <Folder v-for="folder in recycleBinList()" :folder-id="folder" v-bind:key="folder"></Folder>
        </ul>
    </span>
</template>
<script>
  import { mapState, mapActions } from 'vuex'
  import Folder from './Folder.vue'
  import Sash from '../common/Sash.vue'
  export default {
    data () {
      return {
        foldersUpdated: false,
        currntScroll: 'Projects',
        width: 300
      }
    },
    computed: {
      ...mapState({
        Items: state => state.ProjectBrowser.Folders
      })
    },
    methods: {
      rootList (isProjects) {
        let _items = []
        if (this.Items.Root) {
          for (let index in this.Items.Root.childIds) {
            let ID = this.Items.Root.childIds[index]
            if (this.Items[ID] && isProjects === this.Items[ID].hasOwnProperty('project')) {
              _items.push(ID)
            }
          }
        }
        return _items
      },
      recycleBinList () {
        return this.Items.RecycleBin ? this.Items.RecycleBin.childIds : []
      },
      ...mapActions([
        'getFolders'
      ])
    },
    created () {
      this.getFolders().then((res) => {
        this.foldersUpdated = true
      }).catch(err => {
        this.$store.commit('PUSH_NOTIFICATION', err)
      })
    },
    components: { Folder, Sash }
  }
</script>
<style>
#browser-container {
    order: 0;
    flex: 0 1 auto;
    align-self: stretch;
    overflow-y: scroll;
    position: relative;
}
#browser-container:after {
  content: '';
  width: 1px;
  height: 100%;
  background-color: brown;
}
#browser-container caption {
    display: block;
}
#browser-container caption i{
    line-height: 0.8em;
    margin-right: .5em;
    margin-left: .5em;
}
#browser-container ul {
      list-style: none;
}
</style>
