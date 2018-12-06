<template>
  <div class="card">
    <div class="card--header card--header_layer padding-verysmall">
      <button type="button" 
        class="bg-transparent"
        @click="$root.closeLayer()"
      >
        ◄
      </button>
      <span class="titre">
        {{ layer.name }}
      </span>
    </div>

    <div class="padding-small padding-top-none">
      <div class="" v-if="layer.description">
        <label class="">description</label>
        <p class="margin-top-none padding-left-small padding-right-none" style="border-left: 1px solid #b9b9b9;">
          {{ layer.description }}
        </p>
      </div>
      <div class="">
        <label class="">{{ $t('background_map') }}</label><br>
        <template v-if="layer.hasOwnProperty('preview')">
          <div class="background_map">
            <img :src="$root.previewURL(layer, 400)" class="">
            <a 
              :download="`fond_de_carte-${layer.slugFolderName}.jpeg`" 
              :href="$root.previewURL(layer, 2200)" 
              :title="`fond_de_carte-${layer.slugFolderName}.jpeg`" 
              target="_blank"
              class="buttonLink"
              :disabled="read_only"
              >
              {{ $t('download') }}
            </a>
          </div>
        </template>
        <template v-else>
          <small>{{ $t('no_background_map') }}</small>
        </template>
      </div>
    </div>
    <div class="padding-sides-small" style="border-bottom: 1px solid #b9b9b9">
      <div>
        <button type="button" class="buttonLink " @click="showEditLayerModal = true" :disabled="!$root.state.connected">
          {{ $t('edit') }}
        </button>
        <button type="button" class="buttonLink " @click="removeLayer()" :disabled="!$root.state.connected">
          {{ $t('remove') }}
        </button>
      </div>


      <EditLayer
        v-if="showEditLayerModal"
        @close="showEditLayerModal = false"
        :slugLayerName="layer.slugFolderName"
        :layer="layer"
        :read_only="!$root.state.connected"
      />

    </div>
  
    
    <div class="card--body">

      <div
        v-for="media in sortedMedias"
        :key="media.metaFileName"
        class="m_sidebarmedia"
      >
        <MediaContent
          class="m_sidebarmedia--preview"
          :context="'preview'"
          :slugFolderName="layer.slugFolderName"
          :media="media"
          :read_only="read_only"
          :preview_size="50"
          v-model="media.content"
        >
        </MediaContent>
        <div 
          class="m_sidebarmedia--title"
        >
          <div><i>{{ media.type }}</i></div>
          <div v-if="!!media.caption">
            {{ media.caption }}
          </div>
          <div>
            <strong v-if="!!media.value">
              {{ media.value }}
            </strong>
          </div>
        </div>
        <div class="m_sidebarmedia--button">
          <button
            class="buttonLink padding-verysmall"
            @click="$root.openMedia({ slugLayerName: layer.slugFolderName, metaFileName: media.metaFileName })"
            :disabled="!$root.state.connected"
            :key="'createButton'"
          >
            <span>
              {{ $t('open') }}
            </span>
          </button>
        </div>

      </div>
    </div>
    
  </div>

</template>
<script>
import EditLayer from '../modals/EditLayer.vue';
import MediaContent from './MediaContent.vue';


export default {
  props: ['layer'],
  components: {
    EditLayer,
    MediaContent
  },
  data() {
    return {
      showEditLayerModal: false,
      mediaSort: {
        field: 'date_uploaded',
        type: 'date',
        order: 'ascending'
      }
    }
  },
  
  created() {
  },
  mounted() {
  },
  beforeDestroy() {
  },

  watch: {
  },
  computed: {
    sortedMedias() {
      var sortable = [];

      if(!this.layer.hasOwnProperty('medias')) {
        return sortable;
      }

      for (let slugMediaName in this.layer.medias) {
        let orderBy;
        const media = this.layer.medias[slugMediaName];

        if (this.mediaSort.type === 'date') {
          if(media.hasOwnProperty(this.mediaSort.field)) {
            orderBy = +this.$moment(
              media[this.mediaSort.field],
              'YYYY-MM-DD HH:mm:ss'
            );
          }
          if(orderBy === undefined || Number.isNaN(orderBy)) {
            orderBy = 1000;
          }
        } else if (this.mediaSort.type === 'alph') {
          orderBy = media[this.mediaSort.field];
          if(orderBy === undefined || Number.isNaN(orderBy)) {
            orderBy = 1000;
          }
          if(orderBy === undefined) {
            orderBy = 'z';
          }          
        }

        // if(this.$root.isMediaShown(media)) {
          sortable.push({ slugMediaName, orderBy });
        // }
        
      }

      let sortedSortable = sortable.sort(function(a, b) {
        let valA = a.orderBy;
        let valB = b.orderBy;
        if (
          typeof a.orderBy === 'string' &&
          typeof b.orderBy === 'string'
        ) {
          valA = valA.toLowerCase();
          valB = valB.toLowerCase();
        }
        if (valA < valB) {
          return -1;
        }
        if (valA > valB) {
          return 1;
        }
        return 0;
      });

      if (this.mediaSort.order === 'descending') {
        sortedSortable.reverse();
      }

      // array order is garanteed while objects properties aren’t,
      // that’s why we use an array here
      let sortedMedias = sortedSortable.reduce((accumulator, d) => {
        let sortedMediaObj = this.layer.medias[d.slugMediaName];
        sortedMediaObj.slugMediaName = d.slugMediaName;
        accumulator.push(sortedMediaObj);
        return accumulator;
      }, []);
      
      return sortedMedias;
    }    
  },
  methods: {
    removeLayer() {
      if (window.confirm(this.$t('sure_to_remove_layer'))) {
        this.$root.removeFolder({ 
          type: 'layers', 
          slugFolderName: this.layer.slugFolderName
        });
        this.$root.closeLayer();
      }
    },
  }
}
</script>
<style>

</style>