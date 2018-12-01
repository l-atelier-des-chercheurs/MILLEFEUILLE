<template>
  <div id="app">

    <template 
      v-if="$root.state.mode === 'live'"
    >    

      <SystemBar
        v-if="$root.settings.enable_system_bar"
        :withTitleBar="true"
      >
      </SystemBar>

      </TopBar>



      <EditMedia
        v-if="$root.media_modal.open"
        :slugMediaName="$root.media_modal.current_metaFileName"
        :slugProjectName="$root.media_modal.current_slugProjectName"
        :media="$root.store.projects[$root.media_modal.current_slugProjectName].medias[$root.media_modal.current_metaFileName]"
        @close="$root.closeMedia()"
        :read_only="!$root.state.connected"
      >
      </EditMedia>      

    </template>  

    <portal-target name="modal_container" />

  </div>
</template>

<script>

export default {
  name: 'app',
  components: {
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