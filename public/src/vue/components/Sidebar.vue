<template>
  <div class="m_controller" style="">
    <div class="m_controller--topBar">
      <div class="padding-vert-medium">
        <h1 class="margin-none padding-sides-medium">Cartographie Sensible</h1>
        <span class="margin-none padding-sides-medium">workshop Stéréolux</span>
        <!-- <button type="button" @click="$root.setPersp()" v-html="'Perspective'"/> -->
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
          <label class="margin-vert-verysmall margin-sides-medium">Liste des calques</label>

          <Container @drop="onDrop" drag-handle-selector=".column-drag-handle">
            <Draggable v-for="layer in layers" :key="layer.slugFolderName">
              <div class="card draggable-item margin-verysmall margin-sides-medium padding-verysmall">
                <div class="card--header card--header_layer"
                  @click="$root.openLayer(layer.slugFolderName)"
                >
                  <span class="column-drag-handle" @mouseup.stop="">
                    &#x2630;
                  </span>
                  <img v-if="$root.previewURL(layer,50)" :src="$root.previewURL(layer,50)">
                  <span class="titre">
                    {{ layer.name }}
                  </span>
                  <!-- <input type="checkbox" v-model="layer.active" />
                  <span class="item-name" v-html="layer.name" />
                  <input type="range" v-if="layer.active" v-model="layer.opacity" min=0 max=1 step=0.01 /> -->
                  <!-- </span> -->
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
          class="panel panel_pattern padding-small"
          v-if="$root.settings.sidebar.view === 'Layer'"
        >
          <LayerPanel
            :layer="current_layer"
          />
        </div>
      </transition>
    </div>


    <div class="m_controller--bottomBar">

      <transition name="slideFromBottom" mode="out-in">
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
            v-if="$root.settings.sidebar.view === 'Layer' && !showCreateMediaModal"
            @click="showCreateMediaModal = true"
            :disabled="!$root.state.connected"
            :key="'createButton'"
          >
            <span>
              {{ $t('add_data') }}
            </span>
          </button>
          <CreateMedia
            v-if="$root.settings.sidebar.view === 'Layer' && showCreateMediaModal"
            @close="showCreateMediaModal = false"
            :read_only="!$root.state.connected"
          />
        </div>
      </transition>


    </div>

    <portal-target name="modal_container" />

  </div>
</template>

<script>
import Card from './subcomponents/Card.vue';
import { Container, Draggable } from 'vue-smooth-dnd'
import CreateLayer from './modals/CreateLayer.vue';
import CreateMedia from './modals/CreateMedia.vue';
import LayerPanel from './subcomponents/LayerPanel.vue';

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
    CreateMedia
  },
  data () {
    return {
      baseUrl: process.env.BASE_URL,
      showCreateLayerModal: false      
    }
  },
  computed: {
    current_layer() {
      if(this.$root.settings.sidebar.layer_viewed && this.layers.hasOwnProperty(this.$root.settings.sidebar.layer_viewed)) {
        return this.layers[this.$root.settings.sidebar.layer_viewed];
      }
      return false;
    }
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