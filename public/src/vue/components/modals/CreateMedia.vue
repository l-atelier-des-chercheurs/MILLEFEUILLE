<template>
  <Modal
    @close="$emit('close')"
    @submit="createMedia"
    :backgroundColor="mediadata.color"
    :read_only="read_only"
  >
    <template slot="header">
      <div class="">{{ $t('create_data') }}</div>
    </template>

    <template slot="sidebar">
      <div 
        v-if="(!read_only || !!mediadata.caption) && mediadata.type !== 'text'"
        class="margin-bottom-small" 
      >
        <label>{{ $t('caption') }}</label><br>
        <textarea v-model="mediadata.caption" :readonly="read_only">
        </textarea>
      </div>
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
    Modal,
    MediaContent,
    TagsInput
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
<style>

</style>