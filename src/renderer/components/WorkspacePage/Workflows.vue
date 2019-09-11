<template>
    <div class="">
        <ul>
          <li v-for="wf in Workflows" :key="wf.id">{{ wf.name }}</li>
        </ul>
    </div>    
</template>
<script>
  import { mapState, mapActions } from 'vuex'
  export default {
    computed: mapState({
      Workflows: state => state.ProjectBrowser.Workflows
    }),
    methods: {
      ...mapActions([
        'getWorkflows'
      ])
    },
    created () {
      this.getWorkflows().then((res) => {
      })
        .catch(err => {
          this.$store.commit('PUSH_NOTIFICATION', err)
        })
    }
  }
</script>
