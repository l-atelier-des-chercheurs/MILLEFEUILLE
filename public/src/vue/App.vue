<template>
  <div id="app">

    <Sidebar 
      :layers="$root.store.layers"
    />
    <Calques
      :layers="$root.store.layers"
    />

    <EditMedia
      v-if="$root.media_modal.open"
      :slugMediaName="$root.media_modal.current_metaFileName"
      :slugLayerName="$root.media_modal.current_slugLayerName"
      :media="$root.store.layers[$root.media_modal.current_slugLayerName].medias[$root.media_modal.current_metaFileName]"
      @close="$root.closeMedia()"
      :read_only="!$root.state.connected"
    />

    <portal-target name="modal_container" />
  </div>
</template>

<script>
import Calques from './components/Calques.vue'
import Sidebar from './components/Sidebar.vue'
import EditMedia from './components/modals/EditMedia.vue'

export default {
  name: 'app',
  components: {
    Calques,
    Sidebar,
    EditMedia
  },
  props: {
  },
  data() {
    return {
    };
  },
  watch: {
  },
  created() {
  },
  computed: {
  },
  methods: {
  }
};
</script>

<style lang="less" src="style.less"></style>