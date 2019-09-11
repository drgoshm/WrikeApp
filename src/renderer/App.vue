<template>
  <div class="container-fluid wrapper" id="app">
    <router-view></router-view>
    <StatusBar></StatusBar>
  </div>
</template>
<script>
  import StatusBar from './components/common/StatusBar'
  export default {
    name: 'wrikeapp',
    components: {StatusBar}
  }
</script>
<style>
  /* CSS */

 @import "~/static/css/bootstrap.min.css";
 @import "~/static/css/darkTheme.css";
 @import "~/static/css/all.min.css";

  body {
    overflow: hidden;
  }

  .wrapper {
    height: 100vh;
    width: 100vw;
  }
</style>
