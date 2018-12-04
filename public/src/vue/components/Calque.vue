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
      v-if="$root.previewURL(layer, 1600)"
      :xlink:href="$root.previewURL(layer, 1600)" 
      x="0" 
      y="0" 
      :width="width" 
      :height="height" />

    <g v-for="(media, key) in layer.medias"
      v-if="media.hasOwnProperty('latitude') && media.hasOwnProperty('longitude')"
      :transform="getCoordinates(media)"
      :key="key"
    >
      <circle cx="0" cy="0" r="15" 
        fill="#ff00ff"
      />
      <path 
        fill="#ff00ff"
        d="M10,1.375c-3.17,0-5.75,2.548-5.75,5.682c0,6.685,5.259,11.276,5.483,11.469c0.152,0.132,0.382,0.132,0.534,0c0.224-0.193,5.481-4.784,5.483-11.469C15.75,3.923,13.171,1.375,10,1.375 M10,17.653c-1.064-1.024-4.929-5.127-4.929-10.596c0-2.68,2.212-4.861,4.929-4.861s4.929,2.181,4.929,4.861C14.927,12.518,11.063,16.627,10,17.653 M10,3.839c-1.815,0-3.286,1.47-3.286,3.286s1.47,3.286,3.286,3.286s3.286-1.47,3.286-3.286S11.815,3.839,10,3.839 M10,9.589c-1.359,0-2.464-1.105-2.464-2.464S8.641,4.661,10,4.661s2.464,1.105,2.464,2.464S11.359,9.589,10,9.589"
      />
    </g>
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
    },
    getCoordinates(media) {
      return '';
      // coordonnées connues : 
      // 70 / 696 = 47.199467, -1.574420
      // 1362 / 176 = 47.215823, -1.514057

      // const lat_percent = (media.latitude - 47.199467) / (47.215823 - 47.199467);

      // const merc = this.mercator(media.latitude, media.longitude);
      // return  `translate(${merc[0]}, ${merc[1]})`;

      // const px_to_lat = (47.215823 - 47.199467) / (1362 - 70);
      // const px_to_long = (-1.514057 - -1.574420) / (176 - 696);

      // const posX_from_left_ref = (media.latitude - 47.199467) / px_to_lat - 70;
      // const posY_from_left_ref = (media.longitude - -1.574420) / px_to_long - 696;

      // return  `translate(${posX_from_left_ref}, ${posY_from_left_ref})`;
    },
    mercator(x, y) {
        return [x, Math.log(Math.tan(Math.PI / 4 + y / 2))];
    }
  }
}
</script>