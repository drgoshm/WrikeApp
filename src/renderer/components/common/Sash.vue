<template>
  <div class="sash" :class="type" @mousedown="onDragStart" @mouseup="onDragStop"></div>
</template>
<script>
export default {
  data () {
    return {
      $target: undefined,
      dragging: false,
      value: 0,
      dragPos: 0
    }
  },
  methods: {
    onDragStart (event) {
      this.dragging = true
      this.dragPos = this.type === 'vertical' ? event.screenX : event.screenY
      this.value = parseInt(this.type === 'vertical' ? this.$target.style.width : this.$target.style.height)
    },
    onDrag (event) {
      if (this.dragging) {
        let delta = (this.type === 'vertical' ? event.screenX : event.screenY) - this.dragPos
        this.$target.style = `${this.type === 'vertical' ? 'width' : 'height'}:${this.value + delta}px;`
      }
    },
    onDragStop (event) {
      this.dragging = false
      this.value = parseInt(this.type === 'vertical' ? this.$target.style.width : this.$target.style.height)
    }
  },
  props: {
    type: {default: 'vertical'},
    target: String
  },
  mounted () {
    this.$target = document.querySelector(this.target)
    document.body.addEventListener('mousemove', this.onDrag)
    document.body.addEventListener('mouseup', this.onDragStop)
    document.body.addEventListener('mouseleave', this.onDragStop)
    this.value = parseInt(this.type === 'vertical' ? this.$target.style.width : this.$target.style.height)
  }
}
</script>
<style>
.sash.vertical {
    cursor: ew-resize;
    top: 0;
    width: 4px;
    height: 100%;
    margin-left: -2px;
}

.sash.horizontal {
    cursor: ns-resize;
    left: 0;
    width: 100%;
    height: 4px;
    margin-top: -2px;
}
.sash {
    z-index: 90;
    touch-action: none;
}
</style>
