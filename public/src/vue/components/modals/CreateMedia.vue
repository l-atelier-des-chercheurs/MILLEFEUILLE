<template>
  <Modal
    @close="$emit('close')"
    @submit="createMedia"
    :read_only="read_only"
  >
    <template slot="header">
      <div class="">{{ $t('create_data') }}</div>
    </template>

    <template slot="sidebar">
      PLOP
    </template>

    <template slot="submit_button">
      {{ $t('save') }}
    </template>

  </Modal>
</template>
<script>
import Modal from './BaseModal.vue';
import { setTimeout } from 'timers';

export default {
  props: {
    read_only: {
      type: Boolean
    }
  },
  components: {
    Modal
  },
  data() {
    return {
      mediadata: {
        type: '',
        caption: this.media.caption
      },
      askBeforeClosingModal: false
    };
  },
  watch: {
    'mediadata': {
      handler() {
        this.askBeforeClosingModal = true;
      },
      deep: true
    }
  },  
  created() {
  },
  computed: {
  },
  methods: {
    createMedia: function(event) {
      console.log('createMedia');
      this.$root.createMedia({ 
        type: 'layers',
        slugFolderName: this.slugLayerName, 
        data: this.mediadata
      });
      // then close that popover
      this.$emit('close', '');
    }
  },
};
</script>