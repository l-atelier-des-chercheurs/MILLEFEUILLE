<template>
  <div class="card">
    <div class="card--header card--header_layer padding-sides-verysmall">
      <button type="button" 
        class="bg-transparent font-medium"
        @click="$root.closeLayer()"
      >
        ◄
      </button>
      <span class="titre">
        {{ layer.name }}
      </span>
    </div>

    <div class="padding-small padding-top-none">
      <div class="" v-if="layer.description">
        <label class="">description</label>
        <p class="margin-top-none padding-left-small padding-right-none" style="border-left: 1px solid #353535;">
          {{ layer.description }}
        </p>
      </div>
      <div class="">
        <label class="">{{ $t('background_map') }}</label><br>
        <template v-if="layer.hasOwnProperty('preview')">
          <img :src="$root.previewURL(layer, 400)">
        </template>
        <template v-else>
          <small>{{ $t('no_background_map') }}</small>
        </template>
      </div>
    </div>
    <div class="padding-sides-small" style="border-bottom: 1px solid #353535">
      <div>
        <button type="button" class="buttonLink " @click="showEditLayerModal = true" :disabled="!$root.state.connected">
          {{ $t('edit') }}
        </button>
        <button type="button" class="buttonLink " @click="removeLayer()" :disabled="!$root.state.connected">
          {{ $t('remove') }}
        </button>
      </div>


      <EditLayer
        v-if="showEditLayerModal"
        @close="showEditLayerModal = false"
        :slugLayerName="layer.slugFolderName"
        :layer="layer"
        :read_only="!$root.state.connected"
      />

    </div>
  
    
    <div class="card--body">

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
          @click="$root.openMedia({ slugLayerName: layer.slugFolderName, metaFileName: media.media_filename })"
          :disabled="!$root.state.connected"
          :key="'createButton'"
        >
          <span>
            {{ $t('open') }}
          </span>
        </button>

        <EditMedia
          v-if="$root.media_modal.open"
          :slugMediaName="$root.media_modal.current_metaFileName"
          :slugLayerName="$root.media_modal.current_slugLayerName"
          :media="$root.store.layers[$root.media_modal.current_slugLayerName].medias[$root.media_modal.current_metaFileName]"
          @close="$root.closeMedia()"
          :read_only="!$root.state.connected"
        />

      </div>
    </div>
    
  </div>

</template>
<script>
import EditLayer from '../modals/EditLayer.vue';
import MediaContent from './MediaContent.vue';
import EditMedia from '../modals/EditMedia.vue'


export default {
  props: ['layer'],
  components: {
    EditLayer,
    EditMedia,
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