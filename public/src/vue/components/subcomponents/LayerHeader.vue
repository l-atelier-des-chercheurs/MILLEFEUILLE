<template>
  <div class="card draggable-item margin-sides-small padding-small"
    :class="{ 'is--visible' : opts.visibility }" 
  >
    <div class="card--header card--header_layer cursor-pointer"
      @click="$root.openLayer(slugLayerName)"
    >
      <span class="column-drag-handle" @mouseup.stop="" v-if="opts.visibility">
        &#x2630;
      </span>
      <button type="button" class="visibility_picto"
        @click.stop="opts.visibility = !opts.visibility" 
        :class="{ 'is--active' : opts.visibility }" 
      > 
        <img v-if="$root.previewURL(layer,50)" :src="$root.previewURL(layer,50)" />
        <svg 
          viewBox="0 0 20 20"
        >
          <path d="M10,12.3c-1.2,0-2.3-1-2.3-2.3s1-2.3,2.3-2.3s2.3,1,2.3,2.3C12.3,11.3,11.3,12.3,10,12.3 M18.4,9.7l-1.6-1.6
            C15,6.3,12.6,5.3,10,5.3s-5,1-6.8,2.8L1.6,9.7c-0.1,0.1-0.1,0.4,0,0.5l1.6,1.6c1.8,1.8,4.2,2.8,6.8,2.8s5-1,6.8-2.8l1.6-1.6
            C18.5,10.1,18.5,9.9,18.4,9.7"/>
        </svg>
      </button>

      <span class="titre">
        {{ layer.name }}
      </span>
      <button type="button" 
      >
        ►
      </button>
    </div>
    <div class="m_layeredit " v-if="opts.visibility">
      <span class="switch switch-verysmall">
        <input type="checkbox" class="switch" :id="`editlayer_${slugLayerName}`" v-model="opts.editing">
        <label :for="`editlayer_${slugLayerName}`">mise en forme</label>
      </span>

      <template v-if="opts.editing">
<!-- Opacity -->
        <div 
          class="margin-bottom-small" 
        >
          <label>{{ $t('opacity') }}</label><br>
          <input type="range" min="10" max="100" v-model="opts.opacity" :readonly="read_only">
        </div>

  <!-- Mode de fusion -->
        <div 
          class="margin-bottom-small" 
        >
          <label>
            {{ $t('fusion_mode') }}<br>
          </label>
          <select v-model="opts.fusion_mode">
            <option v-for="opt in 'normal | multiply | screen | overlay | darken | lighten | color-dodge | color-burn | hard-light | soft-light | difference | exclusion | hue | saturation | color | luminosity'.split(' | ')" 
              :value="opt" 
              :key="opt"
            >
              {{ opt }}
            </option>
          </select>          
        </div>

<!-- pin_mode_media_type -->
        <div 
          class="margin-bottom-small" 
        >
          <label>{{ $t('pin_mode_media_type') }}</label><br>
          <input type="checkbox" v-model="opts.pin_mode_media_type" :readonly="read_only">
        </div>

<!-- pin_color -->
        <div 
          class="margin-bottom-small" 
        >
          <label>{{ $t('pin_mode_media_type') }}</label><br>
          <input type="color" v-model="opts.pin_color" :readonly="read_only">
        </div>
      </template>
    </div>
    {{ opts2 }}

  </div>
</template>
<script>


export default {
  props: {
    layer: Object,
    slugLayerName: String,
    opts2: {
      type: Object,
      default: {}
    }
  },
  components: {
  },
  data() {
    return {
      opts: this.opts2
    }
  },
  
  created() {
    Object.keys(this.opts).map(type => {
      if(!!this.$root.config_getLayerOption(this.slugLayerName, type)) {
        this.opts[type] = this.$root.config_getLayerOption(this.slugLayerName, type);
      }
    })
  },
  mounted() {
  },
  beforeDestroy() {
  },

  watch: {
    'computedOptions': {
      handler(val, oldVal) {
        Object.keys(val).map(v => {
          if(oldVal.hasOwnProperty(v) && val[v] !== oldVal[v]) {
            this.$root.config_setLayerOption(this.slugLayerName, v, val[v]);
          }
        })
      },
      deep: true,
    }
  },
  computed: {
    // watch the entire as a new object
    computedOptions: function() {
        return Object.assign({}, this.opts);
    }
  },
  methods: {
  }
}
</script>
<style>

</style>