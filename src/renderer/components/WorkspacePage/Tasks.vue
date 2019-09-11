<template>
  <span id="tasks_container" >
    <div v-if="!loaded"> 
      Choose the folder or project
    </div>
    <div v-if="loaded">
      <div>
        <div class="w-100" v-for="taskId in tasksByCurrentFolder()" v-bind:key="taskId">{{Tasks[taskId].title}}</div>
      </div>
    </div>
  </span>
</template>
<script>
import {mapState, mapActions, mapGetters} from 'vuex'
export default {
  data () {
    return {
      loaded: false
    }
  },
  computed: {
    ...mapState({
      CurrentFolder: state => state.ProjectBrowser.CurrentFolder,
      Folders: state => state.ProjectBrowser.Folders,
      Tasks: state => state.ProjectBrowser.Tasks
    })
  },
  methods: {
    ...mapActions(['getTasks']),
    ...mapGetters(['tasksByCurrentFolder'])
  },
  watch: {
    CurrentFolder () {
      this.loaded = false
      this.getTasks(this.CurrentFolder)
        .then(() => {
          this.loaded = true
        })
      console.log('Selected folder: ' + this.CurrentFolder) // FIXME: Debug log
    }
  }
}
</script>
<style>
#tasks_container {
  order: 2;
  flex: 1 1 auto;
  align-self: stretch;
  overflow: -webkit-paged-x;
}
</style>
