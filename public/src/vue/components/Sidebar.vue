<template>
  <div class="m_controller" style="">
    <div class="m_controller--topBar">
      <div class="padding-vert-medium padding-sides-medium">
        <h1 class="margin-none">millefeuille</h1>
        <small class="margin-none">
          • workshop «&nbsp;données situées et cartographie sensible&nbsp;»<br>
          ~ version v0.1
        </small>       
      </div>
      <!-- <div class="mode_switcher border-bottom">
        <label for="image" class="padding-vert-small padding-sides-medium">
          <input type="radio" id="image" value="Image" v-model="current_options_mode">
          <span>1. Settings</span>
        </label>
        <label for="motif" class="padding-small padding-sides-medium">
          <input type="radio" id="motif" value="Motif" v-model="current_options_mode">
          <span>2. Design</span>
        </label>
      </div> -->

    </div>      

    <div class="m_controller--content">
      <transition name="slideToLeft">
        <div class="panel panel_image" v-show="$root.settings.sidebar.view === 'Layers'">
          <label class="margin-vert-verysmall margin-sides-medium">{{ $t('layer_list') }}</label>

          <Container @drop="onDrop" drag-handle-selector=".column-drag-handle">

            <Draggable v-for="layer in sortedLayers" :key="layer.slugFolderName">
              <div class="card draggable-item margin-vert-verysmall margin-sides-medium padding-verysmall">
                <div class="card--header card--header_layer cursor-pointer"
                  @click="$root.openLayer(layer.slugFolderName)"
                >
                  <span class="column-drag-handle" @mouseup.stop="">
                    &#x2630;
                  </span>
                  <img v-if="$root.previewURL(layer,50)" :src="$root.previewURL(layer,50)">
                  <span class="titre">
                    {{ layer.name }}
                  </span>
                  <button type="button" 
                  >
                    ►
                  </button>
                </div>
              </div>

              <!-- <Card :type="'section_separator'">
                <div slot="header">
                  {{ layer.slugFolderName }}
                </div>
              </Card> -->
            </Draggable>
          </Container>
        </div>
      </transition>

      <transition name="slideFromLeft">
        <div
          class="panel panel_pattern padding-sides-medium"
          v-if="$root.settings.sidebar.view === 'Layer'"
        >
          <label class="margin-vert-verysmall">{{ $t('layer') }}</label>
          <LayerPanel
            :layer="current_layer"
          />
        </div>
      </transition>
    </div>


    <div class="m_controller--bottomBar">

      <transition name="slideFromBottom" mode="out-in" :duration="500">
        <div v-if="$root.settings.sidebar.view === 'Layers'"
          :key="'layers_options'"
        >
          <button
            class="barButton barButton_createLayer"
            v-if="!showCreateLayerModal"
            @click="showCreateLayerModal = true"
            :disabled="!$root.state.connected"
            :key="'createButton'"
          >
            <span>
              {{ $t('create_a_layer') }}
            </span>
          </button>
          <CreateLayer
            v-if="$root.settings.sidebar.view === 'Layers' && showCreateLayerModal"
            @close="showCreateLayerModal = false"
            :read_only="!$root.state.connected"
          />
        </div>
        <div v-else-if="$root.settings.sidebar.view === 'Layer'"
          :key="'layer_options'"
        >
          <button
            class="barButton barButton_addData"
            v-if="$root.settings.sidebar.view === 'Layer'"
            @click="showCreateMediaModal = true"
            :disabled="!$root.state.connected"
            :key="'createButton'"
          >
            <span>
              {{ $t('add_data') }}
            </span>
          </button>
          <CreateMedia
            v-if="showCreateMediaModal"
            @close="showCreateMediaModal = false"
            :slugLayerName="$root.settings.sidebar.layer_viewed"
            :read_only="!$root.state.connected"
          />
        </div>
      </transition>

    </div>

    <EditMedia
      v-if="$root.media_modal.open"
      :slugLayerName="$root.media_modal.current_slugLayerName"
      :slugMediaName="$root.media_modal.current_metaFileName"
      :media="$root.store.layers[$root.media_modal.current_slugLayerName].medias[$root.media_modal.current_metaFileName]"
      @close="$root.closeMedia()"
      :read_only="!$root.state.connected"
    />

    <portal-target name="modal_container" />

  </div>
</template>

<script>
import Card from './subcomponents/Card.vue';
import { Container, Draggable } from 'vue-smooth-dnd'
import CreateLayer from './modals/CreateLayer.vue';
import CreateMedia from './modals/CreateMedia.vue';
import LayerPanel from './subcomponents/LayerPanel.vue';
import EditMedia from './modals/EditMedia.vue'


const applyDrag = (arr, dragResult) => {
  const { removedIndex, addedIndex, payload } = dragResult
  if (removedIndex === null && addedIndex === null) return arr

  const result = [...arr]
  let itemToAdd = payload

  if (removedIndex !== null) {
    itemToAdd = result.splice(removedIndex, 1)[0]
  }

  if (addedIndex !== null) {
    result.splice(addedIndex, 0, itemToAdd)
  }

  return result
}

export default {
  props: ['layers'],
  components: {
    Container, 
    Draggable,
    CreateLayer,
    LayerPanel,
    Card,
    CreateMedia,
    EditMedia
  },
  data () {
    return {
      showCreateLayerModal: false,
      showCreateMediaModal: false,
      currentSort: {
        field: 'date_created',
        type: 'date',
        order: 'ascending'
      },
      
    }
  },
  computed: {
    current_layer() {
      if(this.$root.settings.sidebar.layer_viewed && this.layers.hasOwnProperty(this.$root.settings.sidebar.layer_viewed)) {
        return this.layers[this.$root.settings.sidebar.layer_viewed];
      }
      return false;
    },
    sortedLayers: function() {
      var sortable = [];

      if(!this.layers || this.layers.length === 0) {
        return [];
      }

      for (let slugLayerName in this.layers) {
        let orderBy;

        if (this.currentSort.type === 'date') {
          orderBy = +this.$moment(
            this.layers[slugLayerName][this.currentSort.field],
            'YYYY-MM-DD HH:mm:ss'
          );
        } else if (this.currentSort.type === 'alph') {
          orderBy = this.layers[slugLayerName][this.currentSort.field];
        }

        sortable.push({ slugLayerName, orderBy });
        // if(this.$root.settings.layer_filter.keyword === false && this.$root.settings.layer_filter.author === false) {
        //   sortable.push({ slugLayerName, orderBy });
        //   continue;
        // }

        // if(this.$root.settings.layer_filter.keyword !== false && this.$root.settings.layer_filter.author !== false) {
        //   // only add to sorted array if layer has this keyword
        //   if(this.layers[slugLayerName].hasOwnProperty('keywords') 
        //     && typeof this.layers[slugLayerName].keywords === 'object' 
        //     && this.layers[slugLayerName].keywords.filter(k => k.title === this.$root.settings.layer_filter.keyword).length > 0) {
            
        //     if(this.layers[slugLayerName].hasOwnProperty('authors') 
        //       && typeof this.layers[slugLayerName].authors === 'object' 
        //       && this.layers[slugLayerName].authors.filter(k => k.name === this.$root.settings.layer_filter.author).length > 0) {
            
        //       sortable.push({ slugLayerName, orderBy });
        //     }
        //   }
        //   continue;
        // }
        // // if a layer keyword filter is set
        // if(this.$root.settings.layer_filter.keyword !== false) {
        //   // only add to sorted array if layer has this keyword
        //   if(this.layers[slugLayerName].hasOwnProperty('keywords') 
        //     && typeof this.layers[slugLayerName].keywords === 'object' 
        //     && this.layers[slugLayerName].keywords.filter(k => k.title === this.$root.settings.layer_filter.keyword).length > 0) {
        //     sortable.push({ slugLayerName, orderBy });
        //   }
        //   continue;
        // }

        // if(this.$root.settings.layer_filter.author !== false) {
        //   // only add to sorted array if layer has this keyword
        //   if(this.layers[slugLayerName].hasOwnProperty('authors') 
        //     && typeof this.layers[slugLayerName].authors === 'object' 
        //     && this.layers[slugLayerName].authors.filter(k => k.name === this.$root.settings.layer_filter.author).length > 0) {
        //     sortable.push({ slugLayerName, orderBy });
        //   }
        //   continue;
        // }

      }

      // if there is no layer in sortable, it is probable that filters 
      // were too restrictive
      if(sortable.length === 0) {
        // lets remove filters if there are any
        this.$nextTick(() => {
          // this.$root.settings.layer_filter.keyword = false;
        });
      }

      let sortedSortable = sortable.sort(function(a, b) {
        let valA = a.orderBy;
        let valB = b.orderBy;
        if (typeof a.orderBy === 'string' && typeof b.orderBy === 'string') {
          valA = valA.toLowerCase();
          valB = valB.toLowerCase();
        }
        if (valA < valB) {
          return -1;
        }
        if (valA > valB) {
          return 1;
        }
        return 0;
      });

      if (this.currentSort.order === 'descending') {
        sortedSortable.reverse();
      }

      let sortedLayers = sortedSortable.reduce((accumulator, d) => {
        let sortedMediaObj = this.layers[d.slugLayerName];
        accumulator.push(sortedMediaObj);
        return accumulator;
      }, []);

      return sortedLayers;
    },
  },
  methods: {
    onDrop (dropResult) {
      // this.$root.layers = applyDrag(this.$root.layers, dropResult)
    }
  }
}



</script>
<style lang="less">
</style>