<template>
  <div class="m_sidebar" style="">
    <div class="m_sidebar--header">
      <h1>cartographie sensible</h1>
      <button type="button" @click="$root.setPersp()" v-html="'Perspective'"/>
    </div>

    <div class="m_sidebar--layerlist">
      <label>Liste des calques</label>
      <Container @drop="onDrop" drag-handle-selector=".column-drag-handle">
        <Draggable v-for="layer in layers" :key="layer.slugFolderName">
          <SidebarLayer 
            :layer="layer"
            :slugLayerName="layer.slugFolderName"
          />
        </Draggable>
      </Container>
    </div>

    <div class="m_sidebar--footer">
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
  name: 'SimpleScroller',
  props: ['layers'],

  components: {
    Container, 
    Draggable,
    CreateLayer,
    SidebarLayer
  },

  data () {
    return {
      baseUrl: process.env.BASE_URL,
      showCreateLayerModal: false,
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