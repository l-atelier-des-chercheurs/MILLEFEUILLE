<template>
  <div class="card margin-sides-small padding-small">
    <div class="card--header card--header_layer">
      <button type="button" 
        class="bg-transparent font-medium"
        style="margin-left:-0.81rem;"
        @click="$root.closeLayer()"
      >
        ◄
      </button>
      <span class="titre">
        {{ layer.name }}
      </span>
    </div>

    <div class="">
      <div class="" v-if="layer.description">
        <label class="">description</label>
        <p class="margin-top-none padding-left-small padding-right-none" style="border-left: 1px solid #b9b9b9;">
          {{ layer.description }}
        </p>
      </div>
      <div class="">
        <label class="">
          {{ $t('background_map') }} : 
          <a 
            v-if="layer.hasOwnProperty('preview')"
            :download="`fond_de_carte-${slugLayerName}.jpeg`" 
            :href="previewURL" 
            :title="`fond_de_carte-${slugLayerName}.jpeg`" 
            target="_blank"
            class="buttonLink margin-none padding-none"
            :disabled="read_only"
          >
            {{ $t('download') }}
          </a>
          
        </label><br>
        <template v-if="layer.hasOwnProperty('preview')">
          <div class="overlay_img_and_link">
            <img :src="$root.previewURL(layer, 400)" class="bg_img">
          </div>
        </template>
        <template v-else>
          <small>{{ $t('no_background_map') }}</small>
        </template>
      </div>
    </div>
    <div v-if="!!layer.keywords" class="margin-vert-verysmall">
      <label class="">{{ $t('keywords') }}</label>    
      <div class="m_keywordField">
        <span 
          v-for="keyword in layer.keywords" 
          :key="keyword.title"
          :class="['tagcolorid_' + parseInt(keyword.title, 36)%2, { 'is--active' : $root.settings.layer_filter.keyword === keyword.title }]"
        >
          {{ keyword.title }}
        </span>
      </div>
    </div>

    <div class="padding-sides-small " style="text-align: center; ">
      <div class="">
        <button type="button" class="buttonLink " @click="showEditLayerModal = true" :disabled="!$root.state.connected">
          {{ $t('edit_layer') }}
        </button>
      </div>


      <EditLayer
        v-if="showEditLayerModal"
        @close="showEditLayerModal = false"
        :slugLayerName="slugLayerName"
        :layer="layer"
        :read_only="!$root.state.connected"
      />

    </div>
  
    
    <div class="card--body">

      <div
        v-for="media in sortedMedias"
        :key="media.metaFileName"
        class="m_sidebarmedia padding-vert-verysmall"
        @mouseover="$root.settings.highlight_media = media.metaFileName"
        @mouseleave="$root.settings.highlight_media = ''"
      >
        <MediaContent
          v-if="media.type !== 'other'"
          class="m_sidebarmedia--preview"
          :context="'preview'"
          :slugFolderName="slugLayerName"
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
            @click="$root.openMedia({ slugLayerName, metaFileName: media.metaFileName })"
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
  props: ['layer', 'slugLayerName'],
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
    previewURL() {
      return `/${this.slugLayerName}/${this.$root.state.folderPreviewFilename_ext}`
    },
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
  }
}
</script>
<style>

</style>