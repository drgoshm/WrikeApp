<template>
  <span><button @click="onClick" class="pl-1 pr-1">Test</button></span>
</template>
<script>
export default {
  methods: {
    onClick () {
      this.$store.dispatch('getTasks')
        .then(() => {
          this.$store.commit('PUSH_NOTIFICATION', {name: 'Tasks', message: 'Tasks updated'})
        })
    }
  }
}
</script>
