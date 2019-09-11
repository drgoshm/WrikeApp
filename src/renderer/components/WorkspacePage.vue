<template>
  <div class="h-100 pb-3 row">
    <ActionsPanel @selectActions="changeAction"></ActionsPanel>
    <div class="workspace-container">
      <Browser v-if="CurrentAction === 'Browser'" ></Browser>
      <Sash target="#browser-container" style="right:0"></Sash>
      <Tabs />
      <Tasks v-if="CurrentAction==='Browser'"></Tasks>
    </div>
    <Workflows v-if="CurrentAction==='Workflows'"></Workflows>
  </div>
</template>
<script>
  import ActionsPanel from './WorkspacePage/ActionsPanel.vue'
  import Browser from './WorkspacePage/Browser'
  import Tasks from './WorkspacePage/Tasks'
  import Workflows from './WorkspacePage/Workflows'
  import Sash from './common/Sash.vue'
  import Tabs from './common/Tabs.vue'
  export default {
    name: 'workspace-page',
    components: { Workflows, Browser, ActionsPanel, Tasks, Sash, Tabs },
    methods: {
      changeAction (action) {
        this.CurrentAction = action
      }
    },
    data () {
      return {
        CurrentAction: 'Browser'
      }
    }
  }
</script>
<style scoped>
  * {
    color: #AAA;
  }
  .workspace-container {
    width: 100%;
    height: 100%;
    padding-left: 42px;
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    justify-content: flex-start;
    align-content: stretch;
    align-items: flex-start;
    margin-left: -42px;
  }

</style>
