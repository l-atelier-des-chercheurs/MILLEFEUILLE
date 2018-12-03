<template>
  <div class="card">
    <div class="card--header card--header_layer padding-small">
      <button type="button" 
        class="bg-transparent"
        @click="$root.closeLayer()"
      >
        ◄
      </button>
      <span class="titre">
        {{ layer.name }}
      </span>
    </div>
    <div class="card--body">
      <template v-if="layer.hasOwnProperty('preview')">
        <img :src="$root.previewURL(layer, 800)">
      </template>
      <template v-else>
        {{ $t('no_background_map') }}
      </template>
    </div>

    <button
      class="barButton barButton_createLayer"
      v-if="!showEditLayerModal"
      @click="showEditLayerModal = true"
      :disabled="!$root.state.connected"
      :key="'createButton'"
    >
      <span>
        {{ $t('edit_layer') }}
      </span>
    </button>
    <EditLayer
      v-if="showEditLayerModal"
      @close="showEditLayerModal = false"
      :slugLayerName="layer.slugFolderName",
      :layer="layer"
      :read_only="!$root.state.connected"
    />

    <div
      v-for="media in layer.medias"
      :key="media.metaFileName"
      class="margin-small flex-nowrap"
    >
      <MediaContent
        :context="'preview'"
        :slugFolderName="layer.slugFolderName"
        :media="media"
        :read_only="read_only"
        :preview_size="50"
        v-model="media.content"
      >
      </MediaContent>
      {{ media.media_filename }}
      <button
        class="barButton barButton_createLayer"
        v-if="!showCreateLayerModal"
        @click="showCreateLayerModal = true"
        :disabled="!$root.state.connected"
        :key="'createButton'"
      >
        <span>
          {{ $t('edit_data') }}
        </span>
      </button>

    </div>
    
  </div>

</template>
<script>
import EditLayer from '../modals/EditLayer.vue';
import MediaContent from './MediaContent.vue';


export default {
  props: ['layer'],
  components: {
    EditLayer,
    MediaContent
  },
  data() {
    return {
      showEditLayerModal: false
    }
  },
  
  created() {
  },
  mounted() {
  },
  beforeDestroy() {
  },

  watch: {
  },
  computed: {
  },
  methods: {
  }
}
</script>
<style>

</style>