<template>
  <div class="box" :style="layerStyles">
    <div class="face" v-if="previewURL"
      :style="boxStyle(0)"
    >
      <img 
        :src="previewURL"
        :style="imgStyle(layer)"
      >
    </div> 
  </div>      
</template>
<script>


export default {
  props: ['layer', 'index'],
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
    previewURL() {
      if(!this.layer.hasOwnProperty('preview') || this.layer.preview === '') {
        return false;
      }
      const thumb = this.layer.preview.filter(p => p.size === 800);
      if(thumb.length > 0) { return `${thumb[0].path}?${(new Date()).getTime()}` }
      return false;
    },
    layerStyles() {
      debugger;
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