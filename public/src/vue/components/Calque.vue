<template>
  <g>
    <image 
      class="calque_image"
      v-if="$root.previewURL(layer, background_res)"
      :xlink:href="$root.previewURL(layer, background_res)" 
      style="image-rendering:pixelated; mix-blend-mode: multiplyyyyyy;"
      x="0" 
      y="0" 
      :width="width" 
      :height="height" 
    />
    <rect 
      class="calque_bg"
      x="0" 
      y="0" 
      :width="width" 
      :height="height" 
      stroke="#333"
      stroke-width="1"
      fill="transparent"
    />

    <transition-group name="slideUp" tag="g">
      <g
        v-for="(media, key) in layer.medias"
        v-if="media.hasOwnProperty('latitude') && media.hasOwnProperty('longitude')"
        :transform="getCoordinates(media)"
        :key="key"      
        class="pins"
        :fill="pinColor"
        :class="[media.type, { 'is--highlighted' : media.metaFileName === $root.settings.highlight_media || media.metaFileName === $root.media_modal.current_metaFileName }]"
        @mouseover="$root.settings.highlight_media = media.metaFileName"
        @mouseleave="$root.settings.highlight_media = ''"
        @click="$root.openMedia({ slugLayerName, metaFileName: media.metaFileName })"
      >
        <!-- <circle cx="0" cy="0" r="2" fill="#ff00ff" /> -->
        <g :style="pinStyle()" class="pins--group">
          <g transform="translate(-10,-20) scale(2)" >
            <template v-if="pinModePictoMediaType && ['image', 'video', 'audio'].includes(media.type)">
              <template v-if="media.type === 'image'">
                <rect x="1.8" y="5" class="st0" width="16.4" height="10.7"/>
                <polygon class="st0" points="14.6,8.8 5.5,8.8 6.8,3.7 13.3,3.7 "/>
                <circle class="st1" fill="#fff" cx="10" cy="10.4" r="2.6"/>
              </template>
              <template v-else-if="media.type === 'video'">
                <rect x="1.2" y="5.3" class="st0" width="14.2" height="10.3"/>
                <polygon class="st0" points="18.8,13.8 12,11.6 12,9.2 18.8,7.1 "/>
                <polygon class="st1" fill="#fff" points="8,7.2 10.9,10.1 8,12.9 "/>
              </template>
              <template v-else-if="media.type === 'audio'">
                <rect x="1.2" y="5.3" class="st0" width="14.2" height="10.3"/>
                <polygon class="st0" points="18.8,13.8 12,11.6 12,9.2 18.8,7.1 "/>
                <polygon class="st1" fill="#fff" points="8,7.2 10.9,10.1 8,12.9 "/>
              </template>

              <!-- <foreignObject x="-10" y="-10" width="20" height="20">
                <div xmlns="http://www.w3.org/1999/xhtml"
                  :style="`--main-value: ${Math.random() * 10}px`"
                >
                  {{ media.value }}
                </div>
              </foreignObject> -->
            </template>
            <template v-else>              
              <path d="M5,4.4c-0.5,0-0.8-0.4-0.8-0.8S4.5,2.8,5,2.8c0.5,0,0.8,0.4,0.8,0.8S5.5,4.4,5,4.4z M5,0.5C3.1,0.5,1.6,2,1.6,3.9
	C1.6,5.7,5,9.5,5,9.5s3.4-3.8,3.4-5.6C8.4,2,6.9,0.5,5,0.5z"/>
            </template>
          </g>
        </g>
      </g>

    </transition-group>

  </g>
</template>
<script>


      // <svg
      //   xmlns="http://www.w3.org/2000/svg"
      //   width="20"
      //   height="20"
      // >   
      //           <path 
      //             d="M10.292,4.229c-1.487,0-2.691,1.205-2.691,2.691s1.205,2.691,2.691,2.691s2.69-1.205,2.69-2.691
      //                     S11.779,4.229,10.292,4.229z M10.292,8.535c-0.892,0-1.615-0.723-1.615-1.615S9.4,5.306,10.292,5.306
      //                     c0.891,0,1.614,0.722,1.614,1.614S11.184,8.535,10.292,8.535z M10.292,1C6.725,1,3.834,3.892,3.834,7.458
      //                     c0,3.567,6.458,10.764,6.458,10.764s6.458-7.196,6.458-10.764C16.75,3.892,13.859,1,10.292,1z M4.91,7.525
      //                     c0-3.009,2.41-5.449,5.382-5.449c2.971,0,5.381,2.44,5.381,5.449s-5.381,9.082-5.381,9.082S4.91,10.535,4.91,7.525z" />
      // </svg>

export default {
  props: ['layer', 'slugLayerName', 'index', 'width', 'height', 'map_projection'],
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
    pinColor() {
      const pin_color = this.$root.config_getLayerOption(this.slugLayerName, 'pin_color');
      if(!!pin_color) {
        return pin_color
      }
      return '#ff2719';      
    },
    background_res() {
      return this.$root.settings.sidebar.view === 'Layers' ? 1400 : 2200
    },
    pinModePictoMediaType() {
      return true;
    }
  },
  methods: {
    pinStyle() {
      if(this.$root.settings.mode_perspective) {
        return 'transform: rotateX(0deg) rotate(45deg) scale(1, 1.4);';
      }
      return 'transform: rotateX(0deg) rotate(0deg) scale(1,1);';
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

      if(x !== 0 && y !== 0) {
        return `translate(${x}, ${y})`
      }
      return;
    },
    mercator(x, y) {
        return [x, Math.log(Math.tan(Math.PI / 4 + y / 2))];
    }
  }
}
</script>