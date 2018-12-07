<template>
  <div class="card draggable-item margin-sides-small padding-small"
    :class="{ 'is--visible' : layerVisilibity }" 
  >
    <div class="card--header card--header_layer cursor-pointer"
      @click="$root.openLayer(slugLayerName)"
    >
      <span class="column-drag-handle" @mouseup.stop="" v-if="layerVisilibity">
        &#x2630;
      </span>
      <button type="button" class="visibility_picto"
        @click.stop="is_visible = !is_visible" 
        :class="{ 'is--active' : layerVisilibity }" 
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
    <div class="m_layeredit " v-if="layerVisilibity">
      <span class="switch switch-verysmall">
        <input type="checkbox" class="switch" :id="`editlayer_${slugLayerName}`" v-model="is_editing">
        <label :for="`editlayer_${slugLayerName}`">mise en forme</label>
      </span>

      <template v-if="layerEditing">
<!-- Opacity -->
        <div 
          class="margin-bottom-small" 
        >
          <label>{{ $t('opacity') }}</label><br>
          <input type="range" min="10" max="100" v-model.lazy="layer_opacity" :readonly="read_only">
        </div>

<!-- Mode de fusion -->
        <div 
          class="margin-bottom-small" 
        >
          <label>
            {{ $t('fusion_mode') }}<br>
            <small></small>
          </label>
          <select v-model="fusion_mode">
            <option v-for="opt in 'normal | multiply | screen | overlay | darken | lighten | color-dodge | color-burn | hard-light | soft-light | difference | exclusion | hue | saturation | color | luminosity'.split(' | ')" 
              :value="opt" 
              :key="opt"
            >
              {{ opt }}
            </option>
          </select>          
        </div>

      </template>
    </div>



  </div>
  </template>
<script>


export default {
  props: {
    layer: Object,
    slugLayerName: String
  },
  components: {
  },
  data() {
    return {
      is_visible: false,
      is_editing: false,
      layer_opacity: 100,
      fusion_mode: 'normal',

      timer: ''
    }
  },
  
  created() {
    // const idx = this.$root.config.layers_options.findIndex(
    //   l => l.slugFolderName === this.slugLayerName
    // );
    // if(idx > -1) {
    //   const layer_options = this.$root.config.layers_options[idx];
    //   this.is_visible = layer_options.visibility;
    //   this.is_editing = layer_options.editing;
    // }
  },
  mounted() {
  },
  beforeDestroy() {
  },

  watch: {
    'is_editing': function() {
      this.$root.config_setLayerOption(this.slugLayerName, 'editing', this.is_editing);
    },
    'layer_opacity': function() {
      this.$root.config_setLayerOption(this.slugLayerName, 'opacity', this.layer_opacity);
    },
    'is_visible': function() {
      this.$root.config_setLayerOption(this.slugLayerName, 'visibility', this.is_visible);      
    },
    'fusion_mode': function() {
      this.$root.config_setLayerOption(this.slugLayerName, 'fusion_mode', this.fusion_mode);      
    }
  },
  computed: {
    layerVisilibity() {
      return this.$root.config_getLayerOption(this.slugLayerName, 'visibility');
    },
    layerEditing() {
      return this.$root.config_getLayerOption(this.slugLayerName, 'editing');
    }
  },
  methods: {
  }
}
</script>
<style>

</style>