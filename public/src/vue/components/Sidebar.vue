<template>
  <div class="m_controller" style="">
    <div class="m_controller--topBar">
      <div class="padding-vert-medium border-bottom">
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
      <transition name="flipfront_left">
        <div class="panel panel_image padding-vert-small padding-sides-medium" v-show="current_view === 'Layers'">
          <Card :type="'section_separator'">
            <div slot="header">
              Liste des calques
            </div>
          </Card>

          <Container @drop="onDrop" drag-handle-selector=".column-drag-handle">
            <Draggable v-for="layer in layers" :key="layer.slugFolderName">
              <SidebarLayer 
                :layer="layer"
                :slugLayerName="layer.slugFolderName"
              />
              <!-- <Card :type="'section_separator'">
                <div slot="header">
                  {{ layer.slugFolderName }}
                </div>
              </Card> -->
            </Draggable>
          </Container>
        </div>
      </transition>

      <transition name="flipfront_right">
        <div class="panel panel_pattern padding-vert-small" v-show="current_view === 'Layer'">
        </div>
      </transition>
    </div>
    <div class="m_controller--bottomBar border-top padding-medium">
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
        v-if="showCreateLayerModal"
        @close="showCreateLayerModal = false"
        :read_only="!$root.state.connected"
      />
    </div>
  </div>
</template>

<script>
import Card from './subcomponents/Card.vue';
import { Container, Draggable } from 'vue-smooth-dnd'
import CreateLayer from './modals/CreateLayer.vue';
import SidebarLayer from './SidebarLayer.vue';

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
    SidebarLayer,
    Card
  },
  data () {
    return {
      baseUrl: process.env.BASE_URL,
      showCreateLayerModal: false,
      current_view: 'Layers'
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