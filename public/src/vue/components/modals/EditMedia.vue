<template>
  <Modal
    :backgroundColor="mediadata.color"
    @close="$emit('close')"
    @submit="editThisMedia"
    :read_only="read_only"
    :askBeforeClosingModal="askBeforeClosingModal"
    :show_sidebar="$root.media_modal.show_sidebar"
    :is_minimized="$root.media_modal.minimized"
    :can_minimize="true"
    :media_navigation="true"
    >
    <template slot="header">
      <div class="">{{ $t('edit_the_media') }}</div>
    </template>

    <template slot="sidebar">
      <!-- <small>{{ this.$root.allAuthors }}</small> -->

      <div v-if="!read_only" class="m_modal--buttonrow">
        <!-- CONFLICT WITH QR PRINTING -->
        <!-- <button type="button"
          class="buttonLink"
          @click.prevent="printMedia()"
          >
          {{ $t('print') }}
        </button> -->

        <a 
          :download="media.media_filename" 
          :href="mediaURL" 
          :title="media.media_filename" 
          target="_blank"
          class="buttonLink hide_on_print"
          :disabled="read_only"
          >
          {{ $t('download') }}
        </a>
        
        <button type="button"
          class="buttonLink hide_on_print"
          @click.prevent="removeMedia()"
          :disabled="read_only"
          >
          {{ $t('remove') }}
        </button>

        <button type="button" class="buttonLink c-noir" @click="showQRModal = !showQRModal">
          <svg version="1.1" class="inline-svg"
            xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:a="http://ns.adobe.com/AdobeSVGViewerExtensions/3.0/"
            x="0px" y="0px" width="20px" height="20px" viewBox="0 0 90 90" style="enable-background:new 0 0 90 90;" xml:space="preserve">
            <path d="M48,0v42h42V0H48z M84,36H54V6h30V36z M13,77h16V61H13V77z M0,90h42V48H0V90z M6,54h30v30H6V54z M63,48H48v13h15V48z M69,54
              h8v7h-8v12h-8v-8h-9v8h5v9h-9v8h21v-8h13v-9h-5v-8h13V48H69V54z M0,42h42V0H0V42z M6,6h30v30H6V6z M90,90v-8h-8v8H90z M13,29h16V13
              H13V29z M77,13H61v16h16V13z"/>
          </svg>
          <span class>
            Partage
          </span>
        </button>

        <hr class="hide_on_print">
      </div>

      <div class="hide_on_print">
        <div class="m_metaField" v-if="!!media.type">
          <div>
            {{ $t('type') }}
          </div>
          <div>
            {{ media.type }}
          </div>
        </div>
        <!-- <div class="m_metaField" v-if="!!media.authors">
          <div>
            {{ $t('author') }}
          </div>
          <div>
            {{ media.authors }}
          </div>
        </div> -->

  <!-- Caption -->
        <div 
          v-if="(!read_only || !!mediadata.caption) && mediadata.type !== 'text'"
          class="margin-bottom-small" 
        >
          <label>{{ $t('caption') }}</label><br>
          <textarea v-model="mediadata.caption" :readonly="read_only">
          </textarea>
        </div>
      </div>
    </template>

    <template slot="submit_button">
      {{ $t('save') }}
    </template>

    <template slot="preview">
      <MediaContent
        :context="'edit'"
        :slugFolderName="slugLayerName"
        :media="media"
        :read_only="read_only"
        v-model="mediadata.content"
      >
      </MediaContent>
    </template>

  </Modal>
</template>
<script>
import Modal from './BaseModal.vue';
import MediaContent from '../subcomponents/MediaContent.vue';
import { setTimeout } from 'timers';
import TagsInput from '../subcomponents/TagsInput.vue';

export default {
  props: {
    slugLayerName: String,
    slugMediaName: String,
    media: Object,
    read_only: {
      type: Boolean,
      default: true
    }
  },
  components: {
    Modal,
    MediaContent,
    TagsInput
  },
  data() {
    return {
      showQRModal: false,
      is_minimized: false,

      mediadata: {
        type: this.media.type,
        authors: this.media.authors,
        caption: this.media.caption,
        keywords: this.media.keywords,
        fav: this.media.fav,
        content: this.media.content
      },
      mediaURL: `/${this.slugLayerName}/${this.media.media_filename}`,
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
    if(typeof this.mediadata.authors === 'string') {
      if( this.mediadata.authors !== '') {
        this.mediadata.authors = this.mediadata.authors.split(',').map(a => {return { name: a }} )
      } else {
        this.mediadata.authors = [];
      }
    }
  },
  computed: {
  },
  methods: {
    printMedia: function() {
      window.print();
    },
    removeMedia: function() {
      if (window.confirm(this.$t('sureToRemoveMedia'))) {
        this.$root.removeMedia({
          type: 'layers',
          slugFolderName: this.slugLayerName, 
          slugMediaName: this.slugMediaName
        });
        // then close that popover
        this.$emit('close', '');
      }
    },
    editThisMedia: function(event) {
      console.log('editThisMedia');
      this.$root.editMedia({ 
        type: 'layers',
        slugFolderName: this.slugLayerName, 
        slugMediaName: this.slugMediaName,
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