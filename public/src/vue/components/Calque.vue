<template>
  <g>
    <rect 
      x="0" 
      y="0" 
      :width="width" 
      :height="height" 
      stroke="#000"
      fill="#fff"
    />
    <image 
      :xlink:href="$root.previewURL(layer, 1600)" 
      x="0" 
      y="0" 
      :width="width" 
      :height="height" />
  </g>
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
    imgStyle(layer) {
      return { opacity: layer.opacity }
    }
  }
}
</script>