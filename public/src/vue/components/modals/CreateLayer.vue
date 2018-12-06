<template>
  <Modal
    @submit="newLayer"
    @close="$emit('close')"
    :read_only="read_only"
    :askBeforeClosingModal="askBeforeClosingModal"
    >
    <template slot="header">
      <span class="">{{ $t('create_a_layer') }}</span>
    </template>

    <template slot="sidebar">

<!-- Human name -->
      <div class="margin-bottom-small">
        <label>{{ $t('name') }}</label>
        <input type="text" v-model="layerdata.name" required autofocus>
      </div>

<!-- Preview -->
      <div class="margin-bottom-small">
        <label>{{ $t('background_map') }}</label><br>
        <ImageSelect 
          @newPreview="value => { preview = value }"
          :instructions="$t('select_background_map')"
        />
      </div>


<!-- Description -->
      <div 
        class="margin-bottom-small" 
      >
        <label>{{ $t('description') }}</label><br>
        <textarea v-model="layerdata.description" :readonly="read_only">
        </textarea>
      </div>


<!-- Password -->
      <!-- <div class="margin-bottom-small">
        <label>{{ $t('password') }}</label>
        <input type="password" v-model="layerdata.password">
        <small>{{ $t('password_instructions') }}</small>
      </div> -->

<!-- Keywords -->
      <!-- <div class="margin-bottom-small">
        <label>{{ $t('keywords') }}<br>
        *<small>{{ $t('validate_with_enter') }}</small></label>        
        <TagsInput @tagsChanged="newTags => layerdata.keywords = newTags"/>
      </div> -->

    </template>

    <template slot="submit_button">
      {{ $t('create') }}
    </template>

  </Modal>
</template>
<script>
import Modal from './BaseModal.vue';
import ImageSelect from '../subcomponents/ImageSelect.vue';
import TagsInput from '../subcomponents/TagsInput.vue';

export default {
  props: {
    read_only: Boolean
  },
  components: {
    Modal,
    ImageSelect,
    TagsInput
  },
  data() {
    return {
      layerdata: {
        name: '',
        password: '',
        description: ''
      },
      preview: undefined,
      askBeforeClosingModal: false
    };
  },
  watch: {
  },
  computed: {
  },
  methods: {
    newLayer: function(event) {
      console.log('newLayer');

      function getAllLayerNames() {
        let allLayersName = [];
        for (let sluglayerName in window.store.layers) {
          let layerName = window.store.layers[sluglayerName].name;
          allLayersName.push(layerName);
        }
        return allLayersName;
      }
      let allLayersName = getAllLayerNames();

      // check if layer name (not slug) already exists
      if (allLayersName.indexOf(this.layerdata.name) >= 0) {
        // invalidate if it does
        this.$alertify
          .closeLogOnClick(true)
          .delay(4000)
          .error(this.$t('notifications.layer_name_exists'));

        return false;
      }
      if(!!this.preview) {
        this.layerdata.preview_rawdata = this.preview;
      }

      this.$eventHub.$on('socketio.folder_created_or_updated', this.newLayerCreated);
      this.$root.createFolder({ type: 'layers', data: this.layerdata });
    },
    newLayerCreated: function(fdata) {
      if(fdata.id === this.$root.justCreatedFolderID) {
        this.$eventHub.$off('socketio.folder_created_or_updated', this.newLayerCreated);
        this.$root.justCreatedFolderID = false;
        this.$nextTick(() => {
          this.$emit('close', '');
          this.$root.openLayer(fdata.slugFolderName);
        });
      }
    }
  }
};
</script>
<style>

</style>
