<template>
  <Modal
    @close="$emit('close')"
    @submit="createMedia"
    :read_only="read_only"
    :askBeforeClosingModal="askBeforeClosingModal"
  >
    <template slot="header">
      <div class="">{{ $t('create_data') }}</div>
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
            <small>
              Indiquez ici l’emplacement de la donnée à ajouter
            </small>

            <button 
              type="button" 
              class="buttonLink"
              @click="getLocationConstant"
            >
              Emplacement actuel
            </button>

            
              
            <div class="margin-bottom-small">
              <label>{{ $t('latitude') }}</label>
              <input type="text" required v-model="mediadata.latitude" >
            </div>
            <div class="margin-bottom-small">
              <label>{{ $t('longitude') }}</label>
              <input type="text" required v-model="mediadata.longitude" >
            </div>

          </div>
          <div v-else-if="location_is_loading">
            <span class="loader loader-xs" />
            <small>recherche en cours…</small>
          </div>
        </div>
        <div v-else-if="current_addmedia_mode === 'content'">

    <!-- Caption -->
          <div 
            class="margin-bottom-small" 
          >
            <label>{{ $t('caption') }}</label><br>
            <textarea v-model="mediadata.caption" :readonly="read_only">
            </textarea>
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
        latitude: '',
        longitude: '',
        caption: ''
        // type: ''
      },
      askBeforeClosingModal: false,
      current_addmedia_mode: 'location',
      location_is_loading: false
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
    createMedia(event) {
      console.log('createMedia');
      this.$root.createMedia({ 
        type: 'layers',
        slugFolderName: this.slugLayerName, 
        data: this.mediadata
      });
      // then close that popover
      this.$emit('close', '');
    },

    getLocationConstant() {
      if(navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(this.onGeoSuccess, this.onGeoError);  
        this.location_is_loading = true;
      } else {
        alert("Your browser or device doesn't support Geolocation");
      }
    },
    onGeoSuccess(event) {
      this.mediadata.latitude = event.coords.latitude; 
      this.mediadata.longitude = event.coords.longitude;
      this.location_is_loading = false;
    },
    onGeoError(event) {
      this.location_is_loading = false;
      alert("La localisation n’a pas pu avoir lieu. Error code " + event.code + ". " + event.message);
    }
  },
};
</script>