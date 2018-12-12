<template>
  <div style="display: flex;
    flex-flow: column nowrap;
    height: 100%;">
    <div class="m_statusbar" v-if="!$root.state.connected && $root.state.mode === 'live'">
      {{ $t('notifications.connection_lost') }} {{ $t('notifications.contents_wont_be_editable') }}      
    </div>    
    <div class="flex-sidebyside">

      <Sidebar 
        :layers="$root.store.layers"
      />
      <Calques
        :layers="$root.store.layers"
      />

    </div>

    <portal-target name="modal_container" />
  </div>
</template>

<script>
import Calques from './components/Calques.vue'
import Sidebar from './components/Sidebar.vue'

export default {
  name: 'app',
  components: {
    Calques,
    Sidebar
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