<template>
  <span id="actions-panel" class="h-100 color-actions-panel">
    <button class="fa fa-folder-open color-actions-panel-hover" title="Browser"></button>
    <button class="fa fa-newspaper color-actions-panel-hover" title="News"></button>
    <button class="fa fa-tasks color-actions-panel-hover" title="Tasks"></button>
  </span>
</template>
<script>
export default {
}
</script>
<style>
#actions-panel {
  width: 42px;
  padding: 8px;
}

#actions-panel button {
  width: 26px;
  height: 26px;
  margin-bottom: 8px;
  background-color: inherit;
  border: none;
  font-size: x-large;
  cursor: pointer;
}
</style>
