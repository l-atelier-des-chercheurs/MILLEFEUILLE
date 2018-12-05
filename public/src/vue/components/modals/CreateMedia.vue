<template>
  <Modal
    @close="$emit('close')"
    @submit="createMedia"
    :read_only="read_only"
    :askBeforeClosingModal="askBeforeClosingModal"
    :isFile="true"
  >
    <template slot="header">
      <div class="">{{ $t('add_data') }}</div>
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
            <label>{{ $t('media') }} ({{ $t('optional') }})</label><br>
            <input type="file" id="addMedia" class="inputfile-2" 
              :name="'medias'" 
              @change="updateSelectedFiles($event)"
            >
            <label for="addMedia">
              <svg width="20" height="17" viewBox="0 0 20 17"><path d="M10 0l-5.2 4.9h3.3v5.1h3.8v-5.1h3.3l-5.2-4.9zm9.3 11.5l-3.2-2.1h-2l3.4 2.6h-3.5c-.1 0-.2.1-.2.1l-.8 2.3h-6l-.8-2.2c-.1-.1-.1-.2-.2-.2h-3.6l3.4-2.6h-2l-3.2 2.1c-.4.3-.7 1-.6 1.5l.6 3.1c.1.5.7.9 1.2.9h16.3c.6 0 1.1-.4 1.3-.9l.6-3.1c.1-.5-.2-1.2-.7-1.5z"></path></svg>
              {{ $t('select_file_to_import') }}
            </label>
          </div>

            <div
              v-for="(f, index) in selected_files" 
              :key="f.name"
              class="m_uploadFile"
              :class="cssStatus(f)"
              :style="`--progress-percent: ${selected_files_meta.hasOwnProperty(f.name) ? selected_files_meta[f.name].upload_percentages/100 : 0}`"
            >
              <!-- too heavy on memory on mobile devices -->
              <img 
                v-if="!!f.type && f.type.includes('image') && index < 5" 
                class="m_uploadFile--image"
                :src="getImgPreview(f)"
              >
              <div v-else class="m_uploadFile--image" />

              <div :title="f.name" class="m_uploadFile--filename">
                {{ f.name }}
              </div>
              <div class="m_uploadFile--size">
                {{ formatBytes(f.size) }}
              </div>
              <div class="m_uploadFile--action"
                v-if="selected_files_meta.hasOwnProperty(f.name)"
              >
                <button type="button" class="buttonLink"
                  @click="sendThisFile(f)"
                  :disabled="read_only || (selected_files_meta.hasOwnProperty(f.name) && selected_files_meta[f.name].status === 'success')"
                >
                  <template v-if="!selected_files_meta.hasOwnProperty(f.name)">
                    {{ $t('import') }}
                  </template>
                  <template v-else-if="selected_files_meta[f.name].status === 'success'">
                    {{ $t('sent') }}
                  </template>
                  <template v-else-if="selected_files_meta[f.name].status === 'failed'">
                    {{ $t('retry') }}
                  </template>
                </button>
              </div>
            </div>

    <!-- Caption -->
          <div 
            class="margin-bottom-small" 
          >
            <label>{{ $t('caption') }} / note ({{ $t('optional') }})</label><br>
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

export default {
  props: {
    read_only: {
      type: Boolean
    },
    slugLayerName: String
  },
  components: {
    Modal
  },
  data() {
    return {
      mediadata: {
        latlong: '',
        caption: '',
        value: ''
        // type: ''
      },
      askBeforeClosingModal: false,
      current_addmedia_mode: 'location',
      location_is_loading: false,

      selected_files: false,
      selected_files_meta: {},
      upload_percentages: 0
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
    createMedia(event) {
      console.log('createMedia');

        // préparer un petit paquet pour upload
        // peut contenir un média, une note ou une valeur (ou aucun des trois)

        let meta = {};
        let formData = new FormData();

        if(!!this.mediadata.latlong && this.mediadata.latlong.indexOf(',')) {
          meta.latitude = this.mediadata.latlong.split(",")[0].trim();
          meta.longitude = this.mediadata.latlong.split(",")[1].trim();
        } else {
          this.$alertify
            .closeLogOnClick(true)
            .delay(4000)
            .error(this.$t('notifications.missing_location_field'));
          return;
        }

        meta.caption = this.mediadata.caption;
        meta.value = this.mediadata.value;


        if(this.selected_files && this.selected_files.length > 0) {
          let f = this.selected_files[0];
          meta.filename = f.name;
          meta.modified = f.lastModified;

          this.$set(this.selected_files_meta, meta.filename, {
            upload_percentages: 0,
            status: 'sending'
          });
          formData.append('files', f, meta.filename);
        } else {
          meta.filename = 'data_' + (Math.random().toString(36) + '00000000000000000').slice(2, 5 + 2);
        }

        formData.append(meta.filename, JSON.stringify(meta));

        const socketid = this.$socketio.socket.id;
        if(socketid !== undefined) {
          formData.append('socketid', socketid);
        }

        if (this.$root.state.dev_mode === 'debug') {
          console.log(`METHODS • sendThisFile: name = ${meta.filename} / formData is ready`);
        }

        // TODO : possibilité de cancel
        axios.post(this.uriToUploadMedia, formData,{
            headers: { 'Content-Type': 'multipart/form-data' },
            onUploadProgress: function( progressEvent ) {
              if(this.selected_files_meta.hasOwnProperty(meta.filename)) {
                this.selected_files_meta[meta.filename].upload_percentages = parseInt(Math.round((progressEvent.loaded * 100 ) / progressEvent.total ) );
              }
            }.bind(this)            
          })
          .then(x => x.data)
          .then(x => {
            if (this.$root.state.dev_mode === 'debug') {
              console.log(`METHODS • sendThisFile: name = ${meta.filename} / success uploading`);
            }
            this.$emit('close');
          })
          .catch(err => {
            if (this.$root.state.dev_mode === 'debug') {
              console.log(`METHODS • sendThisFile: name = ${meta.filename} / failed uploading`);
            }
            this.$alertify
              .closeLogOnClick(true)
              .delay(4000)
              .error(this.$t('notifications.data_upload_failed'));

            reject();      
          });

      this.sendAllFiles();
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


    sendThisFile(f) {
      return new Promise((resolve, reject) => {
        if (this.$root.state.dev_mode === 'debug') {
          console.log(`METHODS • UploadFile / sendThisFile : name = ${f.name}`);
        }

        const filename = f.name;
        const modified = f.lastModified;

        const meta = {
          fileCreationDate: modified,
          latitude: this.mediadata.latlong.split(",")[0].trim(),
          longitude: this.mediadata.latlong.split(",")[1].trim(),
          caption: this.mediadata.caption,
          value: this.mediadata.value
        }

        this.$set(this.selected_files_meta, filename, {
          upload_percentages: 0,
          status: 'sending'
        });

        let formData = new FormData();
        formData.append('files', f, filename);
        formData.append(filename, JSON.stringify(meta));

        const socketid = this.$socketio.socket.id;
        if(socketid !== undefined) {
          formData.append('socketid', socketid);
        }

        if (this.$root.state.dev_mode === 'debug') {
          console.log(`METHODS • sendThisFile: name = ${filename} / formData is ready`);
        }

        // TODO : possibilité de cancel
        axios.post(this.uriToUploadMedia, formData,{
            headers: { 'Content-Type': 'multipart/form-data' },
            onUploadProgress: function( progressEvent ) {
              this.selected_files_meta[filename].upload_percentages = parseInt(Math.round((progressEvent.loaded * 100 ) / progressEvent.total ) );
            }.bind(this)            
          })
          .then(x => x.data)
          .then(x => {
            if (this.$root.state.dev_mode === 'debug') {
              console.log(`METHODS • sendThisFile: name = ${filename} / success uploading`);
            }

            this.selected_files_meta[filename].status = 'success';
            this.selected_files_meta[filename].upload_percentages = 100;     

            resolve();    
            // resolve(x.map(img => Object.assign({}, img, { url: `${BASE_URL}/images/${img.id}` })));
          })
          .catch(err => {
            if (this.$root.state.dev_mode === 'debug') {
              console.log(`METHODS • sendThisFile: name = ${filename} / failed uploading`);
            }

            this.selected_files_meta[filename].status = 'failed'; 
            this.selected_files_meta[filename].upload_percentages = 0;   
            reject();      
          });
      });
    },
    sendAllFiles() {
      // TODO : start 1 by 1
      // Array.from(Array(this.selected_files.length).keys())
      //   .map(x => {
      //     await this.sendThisFile(this.selected_files[x]);
      //   });

      const executeSequentially = (array) => {  
        return this.sendThisFile(this.selected_files[array.shift()])
          .then(x => array.length == 0 ? x : executeSequentially(array));
      }

      executeSequentially(Array.from(Array(this.selected_files.length).keys())).then(x => {
        Object.keys(this.selected_files_meta).map(name => {
          let index = 1;
          if(this.selected_files_meta[name].status === 'success') {
            setTimeout(() => {
              this.selected_files = this.selected_files.filter(x => x.name !== name);
              this.$delete(this.selected_files_meta, name);

              // check if there are anymore files to upload 
              if(Object.keys(this.selected_files_meta).length === 0) {
                this.$emit('close');
              }
            }, 500 * index);
            index++;
          }
        });
      });

      // const test = async () => {
      //   for (let task of Array.from(Array(this.selected_files.length).keys()).map()) {
      //     await sendThisFile(task);
      //   }
      // }
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