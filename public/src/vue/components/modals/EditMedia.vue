<template>
  <Modal
    @close="$emit('close')"
    @submit="editMedia"
    :read_only="read_only"
    :askBeforeClosingModal="askBeforeClosingModal"
    :isFile="true"
  >
    <template slot="header">
      <div class="">{{ $t('edit_data') }}</div>
    </template>

    <template slot="sidebar">
      <div class="mode_switcher mode_switcher_media">
        <button type="button"
          @click="current_addmedia_mode = 'location'"
          :class="{ 'is--active' : current_addmedia_mode === 'location' }"
        >
          Coordonnées 
        </button>
        <button type="button"
          @click="current_addmedia_mode = 'content'"
          :class="{ 'is--active' : current_addmedia_mode === 'content' }"
        >
          Contenu 
        </button>
      </div>

      <transition name="fade">
        <div v-if="current_addmedia_mode === 'location'">
          <div v-if="!location_is_loading">
            <div class="margin-bottom-small">
              Indiquez ici l’emplacement de la donnée à ajouter
            </div>

            <button 
              type="button" 
              class="buttonLink"
              @click="getLocationConstant"
              v-if="!$root.state.is_electron"
            >
              Emplacement actuel
            </button>

            <div class="margin-bottom-small">
              <label>{{ $t('latitude') }}, {{ $t('longitude') }}<br>
                <small>Par exemple 47.216050, -1.513528</small>
              </label>
              <input type="text" required v-model="mediadata.latlong" >
            </div>
          </div>
          <div v-else-if="location_is_loading">
            <span class="loader loader-small" />
            <small>recherche en cours…</small>
          </div>
        </div>
        <div v-else-if="current_addmedia_mode === 'content'">

          <div class="margin-bottom-small">
            <label>
              {{ $t('media') }}
              <span v-if="media.hasOwnProperty('type')">
                / {{ media.type }}
              </span>  
            </label><br>
            <MediaContent
              class="m_sidebarmedia--preview"
              :context="'edit'"
              :slugFolderName="slugLayerName"
              :media="media"
              v-model="media.content"
            >
            </MediaContent>
          </div>

    <!-- Caption -->
          <div 
            class="margin-bottom-small" 
          >
            <label>{{ $t('caption') }} / note</label><br>
            <textarea v-model="mediadata.caption" :readonly="read_only">
            </textarea>
          </div>

    <!-- Value -->
          <div 
            class="margin-bottom-small" 
          >
            <label>{{ $t('value') }}</label><br>
            <input type="number" v-model="mediadata.value" :readonly="read_only" />
          </div>

        </div>
      </transition>
      
      
    </template>

    <template slot="submit_button">
      {{ $t('save') }}
    </template>

  </Modal>
</template>
<script>
import Modal from './BaseModal.vue';
import { setTimeout } from 'timers';
import * as axios from 'axios';
import MediaContent from '../subcomponents/MediaContent.vue';

export default {
  props: {
    read_only: {
      type: Boolean
    },
    media: Object,
    slugLayerName: String,
    slugMediaName: String
  },
  components: {
    Modal,
    MediaContent
  },
  data() {
    return {
      mediadata: {
        latlong: !!this.media.latitude ? this.media.latitude + ', ' + this.media.longitude:'',
        caption: this.media.caption,
        value: this.media.value
      },
      askBeforeClosingModal: false,
      current_addmedia_mode: 'content',
      location_is_loading: false,
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
    uriToUploadMedia: function() {
      return this.slugLayerName + '/file-upload';
    }
  },
  methods: {
    editMedia(event) {
      console.log('createMedia');

        // préparer un petit paquet pour upload
        // peut contenir un média, une note ou une valeur (ou aucun des trois)

      if(!!this.mediadata.latlong && this.mediadata.latlong.indexOf(',')) {
        this.mediadata.latitude = this.mediadata.latlong.split(",")[0].trim();
        this.mediadata.longitude = this.mediadata.latlong.split(",")[1].trim();
        delete this.mediadata.latlong;
      } else {
        this.$alertify
          .closeLogOnClick(true)
          .delay(4000)
          .error(this.$t('notifications.missing_location_field'));
        return;
      }
      
      this.$root.editMedia({ 
        type: 'layers',
        slugFolderName: this.slugLayerName, 
        slugMediaName: this.slugMediaName,
        data: this.mediadata
      });
        
      this.$emit('close');      

    },

    getLocationConstant() {
      if(navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(this.onGeoSuccess, this.onGeoError);  
        this.location_is_loading = true;
      } else {
        this.$alertify
          .closeLogOnClick(true)
          .delay(4000)
          .error(this.$t('notifications.your_device_cant_geoloc'));
      }
    },
    onGeoSuccess(event) {
      this.mediadata.latlong = event.coords.latitude + ', ' + event.coords.longitude; 
      this.location_is_loading = false;
    },
    onGeoError(event) {
      this.location_is_loading = false;
      this.$alertify
        .closeLogOnClick(true)
        .delay(4000)
        .error(this.$t('notifications.geoloc_failed') + ' ' + this.$t('error_code') + event.code + ". " + event.message);
    },

    formatBytes(a,b) {
      if(0==a)
        return `0 ${this.$t('bytes')}`;

      var e=[this.$t('bytes'),this.$t('kb'),this.$t('mb'),this.$t('gb'),"TB","PB","EB","ZB","YB"];

      var c=1024,
        d=b||2,
        f=Math.floor(Math.log(a)/Math.log(c));
      return parseFloat((a/Math.pow(c,f)).toFixed(d))+" "+e[f]
    },
    getImgPreview(file) {
      return URL.createObjectURL(file);
    },
    cssStatus(f) {
      if(this.selected_files_meta.hasOwnProperty(f.name)) {
        return 'is--' + this.selected_files_meta[f.name].status;
      }
    },
    updateSelectedFiles($event) {
      if (this.$root.state.dev_mode === 'debug') {
        console.log(`METHODS • UploadFile / updateSelectedFiles`);
      }
      this.selected_files = Array.from($event.target.files); 
      this.selected_files_meta = {};
    }
  }
};
</script>