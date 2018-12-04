<template>
  <div class="m_pattern"
  >
    <div class="m_svgpattern" ref="patternContainer">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        :width="900"
        :height="900"
        ref="pattern"
        class=""
        :class="{ 'has--grid' : grid.enabled && !$root.settings.mode_perspective }"
      >      
        <g id="shapes" ref="shapes"
        >
          <g
            :style="moveUpLayers(0)"
            class="m_svgpattern--layer m_svgpattern--layer_persp"
          >
            <rect 
              x="0"
              y="0"
              :width="width"
              :height="height"
              fill="white"
              stroke="#333"
            ></rect>
          </g>
          <Calque 
            v-for="(layer, slugLayerName, index) in layers" 
            v-if="$root.settings.sidebar.view === 'Layers' || ($root.settings.sidebar.view === 'Layer' && slugLayerName === $root.settings.sidebar.layer_viewed)"
            :key="slugLayerName"
            :index="index"
            :layer="layer"
            :width="width"
            :height="height"
            :style="moveUpLayers(index+1)"
            class="m_svgpattern--layer m_svgpattern--layer_persp"
            :map_projection="map_projection"
          />

          <g
            v-if="!!current_position.latitude"
            :style="placeMyPosition"
            class="m_svgpattern--layer m_svgpattern--layer_persp"
          >
            <circle cx="0" cy="0" r="15" 
              fill="#ff00ff"
            />
          </g>
        </g>
      </svg>
      <div class="m_svgpattern--buttons padding-sides-small">  
        <button type="button" class="btn_small" @click="zoom.zoomOut()">-</button>
        <button type="button" class="btn_small" @click="zoom.zoomIn()">+</button>
        <button type="button" class="btn_small" @click="zoom.resetZoom()">RESET</button>
        <button type="button" class="btn_small" :class="{ 'active' : $root.settings.mode_perspective }"  @click="$root.settings.mode_perspective = !$root.settings.mode_perspective">perspective</button>
        <button type="button" class="btn_small" :disabled="$root.settings.mode_perspective" :class="{ 'active' : grid.enabled && !$root.settings.mode_perspective }" @click="grid.enabled = !grid.enabled">GRILLE</button>
        <button type="button" class="btn_small" @click="localizeMe()" v-if="!$root.state.is_electron">
          MA POSITION
          <span class="loader loader-small" v-if="current_position.location_is_loading" />
        </button>
        <div v-if="$root.settings.mode_perspective" class="popup_perspective">
          <input type="range" min="0" max="250" v-model="$root.settings.perspective_stretch" />
        </div>

      </div>
    </div>
  </div>
</template>
<script>
import Calque from './Calque.vue'
import * as d3 from 'd3';

export default {
  props: ['layers'],
  components: {
    Calque
  },
  data() {
    return {
      map_projection: undefined,
      d3svg: '',
      custom_path: undefined,
      grid: {
        increment: 25,
        enabled: false
      },

      current_position: {
        latitude: false,
        longitude: false,
        location_is_loading: false
      },

      width: 1400,
      height: 990,
      globalCanvasSize: {
        width: 900,
        height: 900
      },
      zoom: {
        zoomIn: ()=>{},
        zoomOut:  ()=>{},
        resetZoom: ()=>{}
      }
    }
  },
  created() {
  },
  mounted() {
    this.handleResize();
    this.setupPanZoom();
    window.addEventListener('resize', this.handleResize)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize)
  },

  computed: {
    placeMyPosition() {
      console.log('PatternSvg / placeMyPosition');      
      const [x,y] = this.map_projection([this.current_position.longitude, this.current_position.latitude]);
      const index = Object.keys(this.layers).length;

      if(this.$root.settings.mode_perspective) {
        return {
          'transform': `rotateX(45deg) rotate(-45deg) scale(1) translate3d(${x}px, ${y}px, ${index * 80}px)`,
          'transform-origin': `${this.width/2}px ${this.height/2}px`
        };
      } else {
        return {
          'transform': `translate3d(${x}px, ${y}px, 0px)`,
          'transform-origin': `${this.width/2}px ${this.height/2}px`
        };
      }

    }
  },
  methods: {
    localizeMe() {
      if(navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(this.onGeoSuccess, this.onGeoError);  
        this.current_position.location_is_loading = true;
      } else {
        alert("Your browser or device doesn't support Geolocation");
      }
    },
    onGeoSuccess(event) {
      this.current_position.latitude = event.coords.latitude; 
      this.current_position.longitude = event.coords.longitude;
      this.current_position.location_is_loading = false;

      // this.current_position.latitude = 47.216050; 
      // this.current_position.longitude = -1.513528;
    },
    onGeoError(event) {
      this.current_position.location_is_loading = false;
      alert("La localisation n’a pas pu avoir lieu. Error code " + event.code + ". " + event.message);
    },
    handleResize() {
      this.globalCanvasSize.width = this.$refs.patternContainer.offsetWidth;
      this.globalCanvasSize.height = this.$refs.patternContainer.offsetHeight;
    },
    moveUpLayers(index) {
      console.log('PatternSvg / moveUpLayers');      
      if(this.$root.settings.mode_perspective) {
        return {
          'transform': `rotateX(45deg) rotate(-45deg) scale(1) translate3d(0px, 0px, ${index * this.$root.settings.perspective_stretch}px)`,
          'transform-origin': `${this.width/2}px ${this.height/2}px`
        };
      } else {
        return {
          'transform-origin': `${this.width/2}px ${this.height/2}px`
        };
      }
    },
    setupPanZoom() {
      // this.d3svg exists to make sure we don’t reload d3 for each change
      // but only setup once, then recreate it when pattern width and height changes
      if(this.d3svg === 'loaded') { return; }
      this.d3svg = 'loaded';

      console.log('PatternSvg / setupPanZoom');

      let _zoom = d3.zoom();
      let svg = d3.select(this.$refs.pattern);
      let shapes = d3.select(this.$refs.shapes);

      svg.select('.axis--x').remove();
      svg.select('.axis--y').remove();
 
      this.map_projection = d3.geoMercator()
        // .scale(width / 2 / Math.PI)
        .scale(1189000)
        .center([-1.544730, 47.2057287])
        .translate([this.width / 2, this.height / 2])

      // rouge
      var bottomleft_ref = [-1.574420, 47.199467];
      // bleu
      var topright_ref = [-1.514057, 47.215823];

      var middle_ref = [-1.546236, 47.204049];
      var stereolux = [-1.563454, 47.205163];
      var lu = [-1.545169, 47.215575];

      // add circles to svg
      // shapes.selectAll("circle")
      //   .data([bottomleft_ref, topright_ref, middle_ref, stereolux, lu]).enter()
      //   .append("g")
      //   .attr("transform", (d) => `translate(${this.map_projection(d)})`)
      //   .append("circle")
      //   .attr("r", "8px")
      //   .attr("fill", (d, index) => { 
      //     return ['#ff0000', '#0000ff', '#00ff00', '#09606F', '#999'][index]
      //   })

      var x = d3.scaleLinear()
          .domain([-1, this.globalCanvasSize.width + 1])
          .range([-1, this.globalCanvasSize.width + 1]);

      var y = d3.scaleLinear()
          .domain([-1, this.globalCanvasSize.height + 1])
          .range([-1, this.globalCanvasSize.height + 1]);

      var xAxis = d3.axisBottom(x)
          .ticks((this.globalCanvasSize.width + 2) / (this.globalCanvasSize.height + 2) * 10)
          .tickSize(this.globalCanvasSize.height)
          .tickPadding(8 - this.globalCanvasSize.height);

      var yAxis = d3.axisRight(y)
          .ticks(10)
          .tickSize(this.globalCanvasSize.width)
          .tickPadding(8 - this.globalCanvasSize.width);

      var gX = svg
          .insert('g', '#shapes + *')
          .attr("class", `grid axis axis--x`)
          .attr("id", "grid_x")
          .attr(this.$options._scopeId, '')
          .style("text-anchor", "start")
          // .style("transform-origin", "50% 50% 0")
          .call(xAxis);

      var gY = svg
          .insert('g', '#shapes + *')
          .attr("class", "grid axis axis--y")
          .attr("id", "grid_y")
          .attr(this.$options._scopeId, '')
          .style("text-anchor", "start")
          // .style("transform-origin", "50% 50% 0")
          .call(yAxis);
            
      // shapes_and_palette.style("transform-origin", "50% 50% 0");

  

      // calculate necessary scale
      let margins = 200;
      let minimumScale = Math.min(this.globalCanvasSize.height / (this.height + margins*2), this.globalCanvasSize.width / (this.width + margins*2));

      svg.call(
        _zoom
          .scaleExtent([minimumScale/2, 50])
          .translateExtent([[0 - margins, 0 - margins], [this.width + margins, this.height + margins]])
          .on("zoom", zoomed)
      );

      function zoomed() {
        shapes.attr("transform", [d3.event.transform]);
        // shapes.attr("transform", " rotate(-45)");
        gX.call(xAxis.scale(d3.event.transform.rescaleX(x)));
        gY.call(yAxis.scale(d3.event.transform.rescaleY(y)));
      }

      this.zoom.zoomIn = () => {
        svg.transition().duration(250).call(
          _zoom.scaleBy, 
          2
        );
      };
      this.zoom.zoomOut = () => {
        svg.transition().duration(250).call(
          _zoom.scaleBy,
          .5
        );
      };

      let moveToX = (this.globalCanvasSize.width - this.width * minimumScale)/2;
      let moveToY = (this.globalCanvasSize.height - this.height * minimumScale)/2;

      this.zoom.resetZoom = () => {
        svg.transition().duration(1250).call(
          _zoom.transform, 
          d3.zoomIdentity.translate(moveToX, moveToY).scale(minimumScale)
        );
      }

      this.zoom.resetZoom();
    },
    zoomIn() {
    },
    zoomOut() {
    }
  }
}
</script>
<style lang="less">

</style>