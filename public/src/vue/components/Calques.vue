<template>
  <div class="m_pattern"
  >
    <div class="m_svgpattern" ref="patternContainer">
      <svg
        
        xmlns="http://www.w3.org/2000/svg"
        :width="900"
        :height="900"
        ref="pattern"
        :class="{ 'has--grid' : grid.enabled && !$root.settings.mode_perspective }"
      >      
        <g id="shapes" ref="shapes"
        >

          <!-- <g
            v-if="$root.settings.sidebar.view === 'Layers'"
            :style="layerOptions(0)"
            class="m_svgpattern--layer m_svgpattern--layer_persp"
          >
            <rect 
              x="0"
              y="0"
              :width="width"
              :height="height"
              fill="white"
              stroke="#b9b9b9"
              stroke-width="2"
            ></rect>
          </g> -->

          <transition-group name="enableMode" tag="g" :duration="600">
            <Calque 
              v-for="(layer, index) in layers_shown" 
              :key="layer.slugFolderName"
              :index="index"
              :layer="layer"
              :width="width"
              :height="height"
              :style="layerOptions(layer, index+1)"
              class="m_svgpattern--layer m_svgpattern--layer_persp"
              :map_projection="map_projection"
            />
          </transition-group>

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
        <button type="button" class="btn_small" @click="mode_advanced = !mode_advanced">
          EXPORT ↓
        </button>

        <div v-if="mode_advanced">
          <button type="button" class="btn_small" @click="saveSVG()">
            SVG
          </button>
          <button type="button" class="btn_small" disabled @click="saveGeoJSON()">
            GEOJSON
          </button>
        </div>

        <div v-if="$root.settings.mode_perspective" class="popup_perspective">
          <input type="range" min="0" max="250" v-model="$root.settings.perspective_stretch" />
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import Calque from './Calque.vue'
import * as d3 from 'd3'


function getFormattedTime() {
  var today = new Date();
  var y = today.getFullYear();
  var month = today.getMonth() + 1;
  var d = today.getDate();
  var h = today.getHours();
  var min = today.getMinutes();
  var s = today.getSeconds();
  return `${y}${month}${d}-${h}${min}${s}`;
}
function saveSVGToFile(svgEl, name) {
  let svg_clone = svgEl.cloneNode(true);
  svg_clone.setAttribute("version", "1.1");
  svg_clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  svg_clone.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
  svg_clone.getElementById('shapes').setAttribute('transform','');

  var svgData = svg_clone.outerHTML;

  var preface = '<?xml version="1.0" encoding="UTF-8" standalone="no"?>\r\n';

  var svgBlob = new Blob([preface, svgData], {type:"image/svg+xml;charset=utf-8"});
  var svgUrl = URL.createObjectURL(svgBlob);
  var downloadLink = document.createElement("a");
  downloadLink.href = svgUrl;
  downloadLink.download = name;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
}

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
        enabled: false
      },
      mode_advanced: false,

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
      const index = Object.keys(this.layers_shown).length;

      if(x < 0 || x > this.width || y < 0 || y > this.height) {
        this.$alertify
          .closeLogOnClick(true)
          .delay(4000)
          .error(this.$t('notifications.your_position_outside_map'));
      }

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

    },
    layers_shown() {
      // return this.$root.config.layers;
      if(this.$root.settings.sidebar.view === 'Layers') {
        return this.$root.sortedLayers.filter(l => this.$root.config_getLayerOption(l.slugFolderName, 'visibility') === true).reverse();
      }
      if(this.$root.settings.sidebar.view === 'Layer') {
        return this.$root.sortedLayers.filter(l => l.slugFolderName === this.$root.settings.sidebar.layer_viewed);
      }
    }
  },
  methods: {
    saveSVG() {
      const fileName = `millefeuille_export-${getFormattedTime()}.svg`;
      saveSVGToFile(this.$refs.pattern, fileName);
    },
    localizeMe() {
      if(navigator.geolocation) {
        this.current_position.latitude = false;
        this.current_position.longitude = false;
        navigator.geolocation.getCurrentPosition(this.onGeoSuccess, this.onGeoError);  
        this.current_position.location_is_loading = true;
      } else {
        this.$alertify
          .closeLogOnClick(true)
          .delay(4000)
          .error(this.$t('notifications.your_device_cant_geoloc'));

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
      this.$alertify
        .closeLogOnClick(true)
        .delay(4000)
        .error(this.$t('notifications.geoloc_failed') + ' ' + this.$t('error_code') + event.code + ". " + event.message);
    
    },
    handleResize() {
      this.globalCanvasSize.width = this.$refs.patternContainer.offsetWidth;
      this.globalCanvasSize.height = this.$refs.patternContainer.offsetHeight;
    },
    layerOptions(layer, index) {
      console.log('PatternSvg / layerOptions');   

      let opts = {};
      opts['transform-origin'] = `${this.width/2}px ${this.height/2}px`;
      
      const opacity = this.$root.config_getLayerOption(layer.slugFolderName, 'opacity')/100;
      if(!!opacity && opacity !== 1) {
        opts['opacity'] = opacity;
      }

      if(this.$root.settings.mode_perspective) {
        const move_layer_up_based_on_index = (index * this.$root.settings.perspective_stretch) - (this.layers_shown.length * this.$root.settings.perspective_stretch)/2;
        const stretch_factor = this.$root.settings.sidebar.view === 'Layers' ? move_layer_up_based_on_index : this.$root.settings.perspective_stretch;

        opts['transform'] = `rotateX(45deg) rotate(-45deg) scale(1) translate3d(0px, 0px, ${stretch_factor}px)`;
      }

      return opts;
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

      const top_left = this.map_projection.invert([0, 0]);
      const bottom_right = this.map_projection.invert([this.globalCanvasSize.width, this.globalCanvasSize.height]);
      
      var x = d3.scaleLinear()
          .domain([top_left[0], bottom_right[0]])
          .range([0, this.globalCanvasSize.width])
          ;

      var y = d3.scaleLinear()
          .domain([top_left[1], bottom_right[1]])
          .range([0, this.globalCanvasSize.height])
          ;

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
        this.$root.settings.perspective_stretch = 50;
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