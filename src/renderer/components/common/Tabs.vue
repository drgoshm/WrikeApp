<template>
  <div class="tabs-container">
    <span v-for="tab in tabs" :key="tab.id" @click="onTabClick">{{tab.title}}<span @click="onTabClose">x</span></span>
  </div>
</template>
<script>
  export default {
    name: '',
    data: function () {
      return {
        activeTab: undefined
      }
    },
    methods: {
      onTabClick () {
        console.log(this)
      },
      onTabClose () {
        console.log(this)
      }
    },
    props: {
      tabs: {
        type: Array,
        required: false
      },
      tabSwitch: {
        type: Function
      }
    }
  }
</script>
<style scoped>

</style>
