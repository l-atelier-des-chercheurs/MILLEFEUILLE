<template>
  <g>
    <rect 
      x="0" 
      y="0" 
      :width="width" 
      :height="height" 
      stroke="#b9b9b9"
      stroke-width="2"
      fill="transparent"
    />
    <image 
      v-if="$root.previewURL(layer, 2200)"
      :xlink:href="$root.previewURL(layer, 2200)" 
      x="0" 
      y="0" 
      :width="width" 
      :height="height" />


    <transition-group name="slideUp">
      <g
        v-for="(media, key) in layer.medias"
        v-if="media.hasOwnProperty('latitude') && media.hasOwnProperty('longitude')"
        :transform="getCoordinates(media)"
        :key="key"      
      >
        <!-- <circle cx="0" cy="0" r="15" 
          fill="#ff00ff"
        /> -->
        <path 
          fill="#000"
          transform="translate(-10,-10)"
          d="M10.292,4.229c-1.487,0-2.691,1.205-2.691,2.691s1.205,2.691,2.691,2.691s2.69-1.205,2.69-2.691
                  S11.779,4.229,10.292,4.229z M10.292,8.535c-0.892,0-1.615-0.723-1.615-1.615S9.4,5.306,10.292,5.306
                  c0.891,0,1.614,0.722,1.614,1.614S11.184,8.535,10.292,8.535z M10.292,1C6.725,1,3.834,3.892,3.834,7.458
                  c0,3.567,6.458,10.764,6.458,10.764s6.458-7.196,6.458-10.764C16.75,3.892,13.859,1,10.292,1z M4.91,7.525
                  c0-3.009,2.41-5.449,5.382-5.449c2.971,0,5.381,2.44,5.381,5.449s-5.381,9.082-5.381,9.082S4.91,10.535,4.91,7.525z" />
        <foreignObject x="-10" y="-10" width="20" height="20">
          <div xmlns="http://www.w3.org/1999/xhtml"
            :style="`--main-value: ${Math.random() * 10}px`"
          >
          </div>
        </foreignObject>
      </g>

    </transition-group>

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
  props: ['layer', 'index', 'width', 'height', 'map_projection'],
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
      // return `transform: translate3d(${this.index * this.$root.settings.perspective_stretch}px, ${this.index * this.$root.settings.perspective_stretch}px, 0px)`;   
    }
  },
  methods: {
    imgStyle(layer) {
      return { opacity: layer.opacity }
    },
    getCoordinates(media) {
      if(!this.map_projection) {
        return '';
      }
      const [x,y] = this.map_projection([media.longitude, media.latitude]);

      if(x < 0 || x > this.width || y < 0 || y > this.height) {
        this.$alertify
          .closeLogOnClick(true)
          .delay(4000)
          .error(this.$t('notifications.data_position_outside_map'));
        return;
      }

      return `translate(${x}, ${y})`
    },
    mercator(x, y) {
        return [x, Math.log(Math.tan(Math.PI / 4 + y / 2))];
    }
  }
}
</script>