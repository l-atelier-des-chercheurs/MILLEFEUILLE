<template>
  <Modal
    @close="$emit('close')"
    @submit="createMedias"
    :read_only="read_only"
    :askBeforeClosingModal="askBeforeClosingModal"
  >
    <template slot="header">
      <div class="">{{ $t('add_data') }}</div>
    </template>

    <template slot="sidebar">

      <div class="margin-bottom-small">
        <select v-model="csv_separator">
          <option v-for="sep in [{ 
              label: 'virgule (,)',
              key: ',',
            },{
              label: 'point virgule (;)',
              key: ';',
            }]" :value="sep.key" :key="sep.key">
            {{ sep.label }}
          </option>
        </select>
      </div>

      <div class="margin-bottom-small">
        <label>champs<br>
          <small>Utilisez bien le séparateur ci-dessus</small>
        </label>
        <input type="text" required class="font-verysmall" v-model="mediadata.header">
      </div>

      <div class="margin-bottom-small">
        <label>contenu</label>
        <textarea class="font-verysmall" v-model="mediadata.csv" />
      </div>
    </template>

    <template slot="submit_button">
      {{ $t('save') }}
    </template>

  </Modal>
</template>
<script>
import Modal from './BaseModal.vue';
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
        header: 'latitude, longitude, caption, value',
        csv: ''
      },
      available_fields: ['latitude', 'longitude', 'caption', 'value'],
      csv_separator: ',',
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
    },
    'csv_separator': function() {
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
    createMedias(event) {
        console.log('createMedias');

        // préparer un petit paquet pour upload
        // peut contenir un média, une note ou une valeur (ou aucun des trois)

        let formData = new FormData();

        const _csv = this.mediadata.csv.split('\n');
        const header = this.mediadata.header.split(this.csv_separator);

        let columns_to_extract = this.available_fields;
        columns_to_extract = columns_to_extract.map(i => {
          const idx = header.findIndex(h => h.trim() === i);
          if(idx > -1) {
            return { 
              [i]: idx
            }
          }
        });

        let meta = {};

        _csv.map(line => {
          const items = line.split(this.csv_separator);

          columns_to_extract.map(i => {
            if(!i) {
              return;
            }
            const field = Object.keys(i)[0];
            const idx = Object.values(i)[0];

            if(items.length < idx) {
              this.$alertify
                .closeLogOnClick(true)
                .delay(4000)
                .error(this.$t('notifications.error_on_dataset'));              
            }

            let val = items[idx];

            if(field === 'latitude' || field === 'longitude') {
              val = val.replace(/,/,'.')
            }

            meta[field] = val;
          });

          meta.filename = 'data_' + (Math.random().toString(36) + '00000000000000000').slice(2, 10 + 2);

          formData.append(meta.filename, JSON.stringify(meta));
        });

        const socketid = this.$socketio.socket.id;
        if(socketid !== undefined) {
          formData.append('socketid', socketid);
        }

        if (this.$root.state.dev_mode === 'debug') {
          console.log(`METHODS • createMedia: name = ${meta.filename} / formData is ready`);
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
              console.log(`METHODS • createMedia: name = ${meta.filename} / success uploading`);
            }
            this.$emit('close');
          })
          .catch(err => {
            if (this.$root.state.dev_mode === 'debug') {
              console.log(`METHODS • createMedia: name = ${meta.filename} / failed uploading`);
            }
            this.$alertify
              .closeLogOnClick(true)
              .delay(4000)
              .error(this.$t('notifications.data_upload_failed'));

            reject();      
          });
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