<template>
  <div class="m_pattern"
    :class="{ 'is_persp' : $root.is_persp }"
  >
    <div class="m_svgpattern" ref="patternContainer">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        :width="900"
        :height="900"
        ref="pattern"
        class=""
        :class="{ 'has--grid' : grid.enabled }"
      >      
        <g id="shapes" ref="shapes">
          <rect 
            id="background_rect"
            x="0"
            y="0"
            :width="width"
            :height="height"
            fill="white"
            stroke="#333"
          ></rect>
          <Calque 
            v-for="(layer, slugFolderName, index) in layers" 
            :key="slugFolderName"
            :index="index"
            :layer="layer"
            :width="width"
            :height="height"
          />
        </g>
      </svg>
      <div class="m_svgpattern--buttons padding-sides-small">  
        <button type="button" class="btn_small" @click="zoom.zoomOut()">-</button>
        <button type="button" class="btn_small" @click="zoom.zoomIn()">+</button>
        <button type="button" class="btn_small" @click="zoom.resetZoom()">RESET</button>
        <button type="button" class="btn_small" :class="{ 'active' : grid.enabled }" @click="grid.enabled = !grid.enabled">GRID</button>
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
      baseUrl: process.env.BASE_URL,
      current_shapes: [],
      d3svg: '',
      custom_path: undefined,
      grid: {
        increment: 25,
        enabled: false
      },

      width: 100 * 14,
      height: 70.7 * 14,
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

  watch: {
  },
  computed: {
  },
  methods: {
    handleResize() {
      this.globalCanvasSize.width = this.$refs.patternContainer.offsetWidth;
      this.globalCanvasSize.height = this.$refs.patternContainer.offsetHeight;
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
        shapes.attr("transform", d3.event.transform);
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
        svg.transition().duration(250).call(
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
.calques {
  margin: auto;

  position: relative;
  overflow: visible;
  width: 100%;
  height: 100%;

  display: flex;
  justify-content: center;
  align-items: center;
  // margin-top: 10em;

  &.is_persp {
    .face, .shadow {
      transform: rotateX(45deg) rotateZ(-45deg);
      transform-style: preserve-3d;  
      z-index: -1;
      // box-shadow: -60px 60px 15px #eee;    
    }

  }  

}

.box {
  position: absolute;
  width: 90%;

  transform-origin: center 100%;
  transform: translate3d(0,0px,0) scale(1);
  transition: all 0.6s ease-in-out;

  // opacity: .4;

  &::before {
    content: '';
    display: block;
    position: relative;
    width: 100%;
    padding-bottom: 70.7%;
  }

  .face,
  .shadow {
    position: absolute;
    top: 0;
    width: 100%;
    // border: 1px solid #ccc;
    transform: rotateX(0) rotateZ(0) scale(1);
    transition: all 0.6s ease-in-out;      
  }

  img {
    width: 100%;
  }
  
  .shadow {
    box-shadow: 0 0 15px #ccc;    
  }
  
}

.shadow {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: transparent;
}

.face {
  
  @thickness: 5px;
  @color: #ff0000;
  
  position: absolute;
  top: 0;
  width: 100%;
  height: 100%;
  // background-color: #ccc;
  background-color: rgba(255,255,255,.2);
  margin: 0 auto;  

  img {
    object-fit: contain;
  }
  
  // &:before {
  //   content: "";
  //   position: absolute;
  //   bottom: -@thickness / 2;
  //   left: 0;
  //   background-color: @color;
  //   width: 100%;
  //   height: @thickness;
  //   display: block;
  //   transform: rotateX(90deg) translateY(-@thickness / 2);
  // }
  
  // &:after {
  //   content: "";
  //   position: absolute;
  //   top: 0;
  //   left: -@thickness / 2;
  //   width: @thickness;
  //   height: 100%;
  //   background-color: darken(@color, 10%);
  //   transform: rotateY(90deg) translateX(@thickness / 2);
  // }
}
</style>