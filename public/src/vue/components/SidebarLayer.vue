<template>
  <div class="draggable-item">
    <span class="column-drag-handle" :style="`background-image: url(${baseUrl}layers/${layer.filename})`">
      &#x2630;
    </span>
    <input type="checkbox" v-model="layer.active" />
    <span class="item-name" v-html="layer.name" />
    <input type="range" v-if="layer.active" v-model="layer.opacity" min=0 max=1 step=0.01 />
  </div>
</template>
<script>


export default {
  props: ['layer'],
  components: {
  },
  data() {
    return {
      showEditProjectModal: false
    }
  },
  
  created() {
  },
  mounted() {
  },
  beforeDestroy() {
  },

  watch: {
  },
  computed: {
  },
  methods: {
  }
}
</script>
<style>

</style>