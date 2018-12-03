<template>
  <image :xlink:href="$root.previewURL(layer, 1600)" :x="0" :y="0" :width="width" :height="height" />
  <!-- <div class="box" :style="layerStyles">
    <div class="face" v-if="previewURL"
      :style="boxStyle(0)"
    >
      <img 
        :src="previewURL"
        :style="imgStyle(layer)"
      >
    </div> 
  </div>       -->
</template>
<script>


export default {
  props: ['layer', 'index', 'width', 'height'],
  components: {
  },
  data() {
    return {
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
    layerStyles() {
      return `transform: translate3d(${this.index * 10}px, ${this.index * 10}px, 0px)`;   
    }
  },
  methods: {
    boxStyle(index) {
      if(this.$root.is_persp) {
        return { transform: `translate3d( 0, -${0 + 40 * index}px, 0) scale(0.8)` };
      }
      return '';
    },
    imgStyle(layer) {
      return { opacity: layer.opacity }
    }
  }
}
</script>