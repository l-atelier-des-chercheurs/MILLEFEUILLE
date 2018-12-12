<template>
  <div class="card draggable-item"
    :class="{ 'is--visible' : values.visibility }" 
  >
    <div class="card--header card--header_layer margin-sides-small padding-sides-small padding-vert-none cursor-pointer"
      @click="$root.openLayer(slugLayerName)"
    >
      <span class="column-drag-handle" @mouseup.stop="" v-if="values.visibility">
        &#x2630;
      </span>
      <button type="button" class="visibility_picto"
        @click.stop="values.visibility = !values.visibility" 
        :class="{ 'is--active' : values.visibility }" 
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
    <div class="margin-vert-verysmall margin-sides-small padding-sides-small padding-vert-none">
      <div class="m_keywordField">
        <span 
          v-for="keyword in layer.keywords" 
          :key="keyword.title"
          :class="['tagcolorid_' + parseInt(keyword.title, 36)%2, { 'is--active' : $root.settings.layer_filter.keyword === keyword.title }]"
        >
          {{ keyword.title }}
        </span>
      </div>
    </div>

    <div class="m_layeredit " v-if="values.visibility"
      :class="{ 'is--active' : values.editing }"
    >
      <span class="switch switch-verysmall">
        <input type="checkbox" class="switch" :id="`editlayer_${slugLayerName}`" v-model="values.editing">
        <label :for="`editlayer_${slugLayerName}`">mise en forme</label>
      </span>

      <template v-if="values.editing">
<!-- Opacity -->
        <Card 
          :variable="options.opacity"
          v-model="values.opacity"
        >
        </Card>

  <!-- Mode de fusion -->
        <Card 
          :variable="options.fusion_mode"
          v-model="values.fusion_mode"
        >
        </Card>

<!-- pin_mode_media_type -->
        <Card 
          :variable="options.pin_type"
          v-model="values.pin_type"
        >
        </Card>

<!-- pin_color -->
        <Card 
          :variable="options.pin_color"
          v-model="values.pin_color"
        >
        </Card>
      </template>
    </div>

  </div>
</template>
<script>
import Card from './Card.vue';


const default_values = {
  visibility: false,
  editing: false,
  opacity: 100,
  fusion_mode: 'normal',
  pin_type: 'pins',
  pin_color: '#000'  
}

export default {
  props: {
    layer: Object,
    slugLayerName: String,
    saved_opts: {
      type: Object,
      default: {}
    }
  },
  components: {
    Card
  },
  data() {
    return {
      values: Object.assign({}, default_values),
      options: {
        opacity: {
          label: this.$t('opacity'),
          default: 100,
          min: 0,
          max: 100,
          field_type: 'slider'            
        },
        fusion_mode: {
          label: this.$t('fusion_mode'),
          default: 'normal',
          field_type: 'select',
          field_options: [
            { 
              key: 'normal',
              name: 'normal'
            },
            
            { 
              key: 'multiply',
              name: 'produit'
            },
            {
              key: 'screen',
              name: 'écran'
            },
            {
              key: 'overlay',
              name: 'incrustation'
            },
            {
              key: 'darken',
              name: 'obscurcir'
            },
            {
              key: 'lighten',
              name: 'éclaircir'
            },
            {
              key: 'color-dodge',
              name: 'densité des couleurs -'
            },
            {
              key: 'color-burn',
              name: 'densité des couleurs +'
            },
            {
              key: 'hard-light',
              name: 'lumière forte'
            },
            {
              key: 'soft-light',
              name: 'lumière tamisée'
            },
            {
              key: 'difference',
              name: 'différence'
            },
            {
              key: 'exclusion',
              name: 'exclusion'
            },
            {
              key: 'hue',
              name: 'teinte'
            },
            {
              key: 'saturation',
              name: 'saturation'
            },
            {
              key: 'color',
              name: 'couleurs'
            },
            {
              key: 'luminosity',
              name: 'luminosité'
            }
          ]

        },
        pin_type: {
          label: this.$t('pin_mode_media_type'),
          default: 'pins',
          field_type: 'select',
          field_options: [
            { 
              key: 'pins',
              name: 'pins'
            },
            { 
              key: 'medias',
              name: 'type de médias'
            },            
          ]
        },
        pin_color: {
          label: this.$t('color'),
          field_type: 'color',
          default: '#ff2719'              
        }

      }
    }
  },
  
  created() {
    Object.keys(this.values).map(type => {
      if(this.saved_opts.hasOwnProperty(type)) {
        this.values[type] = this.saved_opts[type];
      }
    })
  },
  mounted() {
  },
  beforeDestroy() {
  },

  watch: {

  // visibility: false,
  // editing: false,
  // opacity: 100,
  // fusion_mode: 'normal',
  // pin_type: 'pins',
  // pin_color: '#000'  

    'values.visibility': function() {
      debugger;
      this.$root.config_setLayerOption(this.slugLayerName, 'visibility', this.values.visibility);
    },
    'values.editing': function() {
      this.$root.config_setLayerOption(this.slugLayerName, 'editing', this.values.editing);
    },
    'values.opacity': function() {
      this.$root.config_setLayerOption(this.slugLayerName, 'opacity', this.values.opacity);
    },
    'values.fusion_mode': function() {
      this.$root.config_setLayerOption(this.slugLayerName, 'fusion_mode', this.values.fusion_mode);
    },
    'values.pin_type': function() {
      this.$root.config_setLayerOption(this.slugLayerName, 'pin_type', this.values.pin_type);
    },
    'values.pin_color': function() {
      this.$root.config_setLayerOption(this.slugLayerName, 'pin_color', this.values.pin_color);
    },

    'saved_opts': {
      handler(val, oldVal) {
        if(Object.keys(this.saved_opts).length === 0) {
          this.values = Object.assign({}, default_values);
        }
      },
    }
  },
  computed: {
    // watch the entire as a new object
    computedOptions: function() {
        return Object.assign({}, this.values);
    }
  },
  methods: {
  }
}
</script>
<style>

</style>