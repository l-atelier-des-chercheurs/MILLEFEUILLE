<template>
  <div class="draggable-item">
    <div class="titlebar">
      <span class="column-drag-handle" :style="`background-image: url(${previewURL}); background-size: contain;`">
        &#x2630;
      </span>
      <input type="checkbox" v-model="layer.active" />
      <span class="item-name" v-html="layer.name" />
      <input type="range" v-if="layer.active" v-model="layer.opacity" min=0 max=1 step=0.01 />
    </div>
    <button type="button" 
      @click="$root.loadLayer(slugLayerName)"
    >
      charger médias
    </button>

    <div 
      v-for="media in layer.medias"
      :key="media.metaFileName"
    >
      <MediaContent
        :context="'preview'"
        :slugFolderName="slugLayerName"
        :media="media"
        :read_only="read_only"
        v-model="media.content"
      >
      </MediaContent>
    </div> 
  </div>
</template>
<script>
import MediaContent from './subcomponents/MediaContent.vue';

export default {
  props: ['layer', 'slugLayerName'],
  components: {
    MediaContent
  },
  data() {
    return {
      showEditProjectModal: false
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
    previewURL() {
      if(!this.layer.hasOwnProperty('preview') || this.layer.preview === '') {
        return false;
      }
      const thumb = this.layer.preview.filter(p => p.size === 800);
      if(thumb.length > 0) { return `${thumb[0].path}?${(new Date()).getTime()}` }
      return false;
    }
  },
  methods: {
  }
}
</script>
<style>
</style>