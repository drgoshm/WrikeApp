<template>
  <footer id="statusbar" class="toolbar toolbar-footer color-statusbar pl-2 pr-2">
    <Notifier></Notifier>
    <Test></Test>
  </footer>
</template>
<script>
  // import {mapState, mapActions} from 'vuex'
  import Notifier from './Notifier.vue'
  import Test from './Test.vue'
  export default {
    components: {
      Notifier,
      Test
    }
  }
</script>
<style>

#statusbar {
    max-height: 22px;
    position: absolute;
    height: 18px;
    left: 0px;
    right: 0px;
    display: block;
    bottom: 0px;
    font-size: 0.8em;
    z-index: 999;
}

#statusbar button {
    background: inherit;
    border: none;
    height: 18px;
    cursor: pointer;
}

#statusbar input[type=checkbox] {
    opacity: 0;
    cursor: pointer;
    position: relative;
    z-index: 1000;
}

#statusbar input[type=checkbox]:checked+label:after {
  content: "";
  -webkit-clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
  clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
  height: 6px;
  width: 10px;
  position: absolute;
  margin-top: -6px;
  background: inherit;
  margin-left: -5px;
  left: 50%;
}

#statusbar input[type=checkbox]+label {
  border: none;
  line-height: 18px;
  cursor: pointer;
  margin-left: -13px;
  position: relative;
  z-index: 1001;
}


</style>
