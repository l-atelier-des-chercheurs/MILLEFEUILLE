<template>
  <div class="card">
    <div class="card--header card--header_layer bg-noir padding-sides-verysmall c-blanc">
      <button type="button" 
        class="bg-transparent font-medium c-blanc"
        @click="$root.closeLayer()"
      >
        ◄
      </button>
      <span class="titre">
        {{ layer.name }}
      </span>
    </div>

    <div class="bg-noir padding-medium padding-top-none c-blanc">
      <div class="" v-if="layer.description">
        <label class="c-blanc">description</label>
        <p class="margin-top-none padding-left-small padding-right-none" style="border-left: 1px solid #999;">
          {{ layer.description }}
        </p>
      </div>
      <div class="">
        <label class="c-blanc">{{ $t('background_map') }}</label><br>
        <template v-if="layer.hasOwnProperty('preview')">
          <img :src="$root.previewURL(layer, 400)">
        </template>
        <template v-else>
          <small>{{ $t('no_background_map') }}</small>
        </template>
      </div>
    </div>
    <div class="bg-noir padding-sides-small c-blanc" style="border-top: 1px solid white">
      <div>
        <button type="button" class="buttonLink c-blanc" @click="showEditLayerModal = true" :disabled="!$root.state.connected">
          {{ $t('edit') }}
        </button>
        <button type="button" class="buttonLink c-blanc" @click="removeLayer()" :disabled="!$root.state.connected">
          {{ $t('remove') }}
        </button>
      </div>
    </div>
  
    
    <div class="card--body">

      <EditLayer
        v-if="showEditLayerModal"
        @close="showEditLayerModal = false"
        :slugLayerName="layer.slugFolderName"
        :layer="layer"
        :read_only="!$root.state.connected"
      />

      <div
        v-for="media in layer.medias"
        :key="media.metaFileName"
        class="margin-verysmall flex-nowrap flex-vertically-centered"
      >
        <MediaContent
          class="padding-verysmall"
          :context="'preview'"
          :slugFolderName="layer.slugFolderName"
          :media="media"
          :read_only="read_only"
          :preview_size="50"
          v-model="media.content"
        >
        </MediaContent>
        <span 
          class="t-ellipse padding-verysmall"
        >
          {{ media.media_filename }}
        </span>
        <button
          class="barButton barButton_createLayer padding-verysmall"
          v-if="!showCreateLayerModal"
          @click="showCreateLayerModal = true"
          :disabled="!$root.state.connected"
          :key="'createButton'"
        >
          <span>
            {{ $t('open') }}
          </span>
        </button>

      </div>
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
    removeLayer() {
      if (window.confirm(this.$t('sure_to_remove_layer'))) {
        this.$root.removeFolder({ 
          type: 'layers', 
          slugFolderName: this.layer.slugFolderName
        });
        this.$root.closeLayer();
      }
    },
  }
}
</script>
<style>

</style>