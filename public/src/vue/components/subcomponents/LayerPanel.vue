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
        <p class="margin-top-none padding-left-small padding-right-none" style="border-left: 1px solid #b9b9b9;">
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
    <div class="padding-sides-small" style="border-bottom: 1px solid #b9b9b9">
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
        class="m_sidebarmedia"
      >
        <MediaContent
          class="m_sidebarmedia--preview"
          :context="'preview'"
          :slugFolderName="layer.slugFolderName"
          :media="media"
          :read_only="read_only"
          :preview_size="50"
          v-model="media.content"
        >
        </MediaContent>
        <div 
          class="m_sidebarmedia--title"
        >
          {{ media.caption }}
        </div>
        <div class="m_sidebarmedia--button">
          <button
            class="buttonLink padding-verysmall"
            @click="$root.openMedia({ slugLayerName: layer.slugFolderName, metaFileName: media.metaFileName })"
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