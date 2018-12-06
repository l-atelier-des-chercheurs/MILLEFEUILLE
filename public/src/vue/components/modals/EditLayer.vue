<template>
  <Modal
    @close="$emit('close')"
    @submit="editThisLayer"
    :read_only="read_only"
    :typeOfModal="'EditMeta'"
    :askBeforeClosingModal="askBeforeClosingModal"
    >
    <template slot="header">
      <div class="">{{ $t('edit_layer') }}</div>
    </template>

    <template slot="sidebar">
      
<!-- Human name -->
      <div class="margin-bottom-small">
        <label>{{ $t('name') }}</label>
        <input class="input-big" type="text" v-model="layerdata.name" required :readonly="read_only">
      </div>

<!-- Description -->
      <div 
        class="margin-bottom-small" 
      >
        <label>{{ $t('description') }}</label><br>
        <textarea v-model="layerdata.description" :readonly="read_only">
        </textarea>
      </div>

<!-- Preview -->
      <div class="margin-bottom-small">
        <label>{{ $t('background_map') }}</label><br>
        <ImageSelect 
          :previewURL="$root.previewURL(layer,400)"
          @newPreview="value => { preview = value }"
          :t_instructions="$t('select_background_map')"
          :t_remove="$t('remove_background_map')"
        >
        </ImageSelect>
      </div>

<!-- Password -->
<!--
      <div class="margin-bottom-small">
        <label>{{ $t('password') }}</label>
        <input type="password" v-model="layerdata.password" :readonly="read_only">
        <small>{{ $t('password_instructions') }}</small>
      </div>
 -->

<!-- Keywords -->
      <!-- <div class="margin-bottom-small">
        <label>{{ $t('keywords') }}<br>
        *<small>{{ $t('validate_with_enter') }}</small></label>
        <TagsInput 
          :keywords="layerdata.keywords"
          @tagsChanged="newTags => layerdata.keywords = newTags"
        />
      </div> -->

<!-- Author(s) -->
      <!-- <div class="margin-bottom-small">
        <label>{{ $t('author') }}</label><br>
      </div> -->

    </template>

    <template slot="submit_button">
      {{ $t('save') }}
    </template>

  </Modal>
</template>
<script>
import Modal from './BaseModal.vue';
import ImageSelect from '../subcomponents/ImageSelect.vue';
import TagsInput from '../subcomponents/TagsInput.vue';

export default {
  props: {
    slugLayerName: String,
    layer: Object,
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
        name: this.layer.name,
        // keywords: this.layer.keywords
        description: this.layer.description
      },
      tag: '',
      preview: undefined,
      askBeforeClosingModal: false
    };
  },
  watch: {
    'layerdata.name': function() {
      this.askBeforeClosingModal = true;
    },
    'preview': function() {
      this.askBeforeClosingModal = true;
    }
  },
  mounted() {
  },
  computed: {
  },
  methods: {
    editThisLayer: function(event) {
      console.log('editThisLayer');

      // only if user changed the name of this folder
      if (this.layerdata.name !== this.layer.name) {
        function getAllLayerNames() {
          let allLayersName = [];
          for (let slugLayerName in window.store.layers) {
            let layerName = window.store.layers[slugLayerName].name;
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
      }

      if(typeof this.preview !== 'undefined') {
        this.layerdata.preview_rawdata = this.preview;
      }

      this.$root.editFolder({ 
        type: 'layers', 
        slugFolderName: this.slugLayerName, 
        data: this.layerdata 
      });

      this.$emit('close', '');
    }
  }
};
</script>
<style>

</style>
