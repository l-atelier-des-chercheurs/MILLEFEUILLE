<template>
  <div class="flex-sidebyside">

    <Sidebar 
      :layers="$root.store.layers"
    />
    <Calques
      :layers="$root.store.layers"
    />

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