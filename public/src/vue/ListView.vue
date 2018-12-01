<template>
  <div class="m_listview"
  >
    <main class="m_projects main_scroll_panel">
      <div class="m_actionbar">
        <div class="m_actionbar--buttonBar">
          <button
            class="barButton barButton_createProject"
            @click="showCreateProjectModal = true"
            :disabled="read_only"
            :key="'createButton'"
          >
            <span>
              {{ $t('create_a_project') }}
            </span>
          </button>
          <CreateProject
            v-if="showCreateProjectModal"
            @close="showCreateProjectModal = false"
            :read_only="read_only"
          />
        </div>
      </div>
        
      <transition-group
        class="m_projects--list"
        name="list-complete"
      >
        <Project
          v-for="(sortedProject, index) in sortedProjectsSlug"
          :key="sortedProject.slugProjectName"
          :slugProjectName="sortedProject.slugProjectName"
          :project="projects[sortedProject.slugProjectName]"
          :read_only="read_only"
          :index="index"
        />
      </transition-group>
    </main>

  </div>
</template>
<script>
import Project from './components/Project.vue';
import CreateProject from './components/modals/CreateProject.vue';
import MediaCard from './components/subcomponents/MediaCard.vue';
import { setTimeout } from 'timers';

export default {
  props: {
    read_only: Boolean,
    projects: Object
  },
  components: {
    CreateProject
  },
  data() {
    return {
      showCreateProjectModal: false,
      currentLang: this.$root.lang.current,
      show_medias_instead_of_projects: false,

      currentFilter: '',      
      currentSort: {
        field: 'date_created',
        type: 'date',
        order: 'descending'
      },

      show_filters: false
    };
  },
  mounted() {
    if(this.$root.settings.project_filter.keyword || this.$root.settings.project_filter.author) {
      this.show_filters = true;
    }
  },
  beforeDestroy() {
  },
  watch: {
    currentLang: function() {
      this.$root.updateLocalLang(this.currentLang);
    }
  },
  computed: {
    projectsKeywords: function() {
      return this.$root.getAllKeywordsFrom(this.projects);
    },
    projectsAuthors: function() {
      return this.$root.getAllAuthorsFrom(this.projects);      
    },
    mediasKeywords: function() {
      return this.$root.getAllKeywordsFrom(this.filteredMedias);      
    },
    mediasAuthors: function() {
      return this.$root.getAllAuthorsFrom(this.filteredMedias);      
    },
    sortedProjectsSlug: function() {
      var sortable = [];

      if(!this.projects || this.projects.length === 0) {
        return [];
      }

      for (let slugProjectName in this.projects) {
        let orderBy;

        if (this.currentSort.type === 'date') {
          orderBy = +this.$moment(
            this.projects[slugProjectName][this.currentSort.field],
            'YYYY-MM-DD HH:mm:ss'
          );
        } else if (this.currentSort.type === 'alph') {
          orderBy = this.projects[slugProjectName][this.currentSort.field];
        }

        if(this.$root.settings.project_filter.keyword === false && this.$root.settings.project_filter.author === false) {
          sortable.push({ slugProjectName, orderBy });
          continue;
        }

        if(this.$root.settings.project_filter.keyword !== false && this.$root.settings.project_filter.author !== false) {
          // only add to sorted array if project has this keyword
          if(this.projects[slugProjectName].hasOwnProperty('keywords') 
            && typeof this.projects[slugProjectName].keywords === 'object' 
            && this.projects[slugProjectName].keywords.filter(k => k.title === this.$root.settings.project_filter.keyword).length > 0) {
            
            if(this.projects[slugProjectName].hasOwnProperty('authors') 
              && typeof this.projects[slugProjectName].authors === 'object' 
              && this.projects[slugProjectName].authors.filter(k => k.name === this.$root.settings.project_filter.author).length > 0) {
            
              sortable.push({ slugProjectName, orderBy });
            }
          }
          continue;
        }
        // if a project keyword filter is set
        if(this.$root.settings.project_filter.keyword !== false) {
          // only add to sorted array if project has this keyword
          if(this.projects[slugProjectName].hasOwnProperty('keywords') 
            && typeof this.projects[slugProjectName].keywords === 'object' 
            && this.projects[slugProjectName].keywords.filter(k => k.title === this.$root.settings.project_filter.keyword).length > 0) {
            sortable.push({ slugProjectName, orderBy });
          }
          continue;
        }

        if(this.$root.settings.project_filter.author !== false) {
          // only add to sorted array if project has this keyword
          if(this.projects[slugProjectName].hasOwnProperty('authors') 
            && typeof this.projects[slugProjectName].authors === 'object' 
            && this.projects[slugProjectName].authors.filter(k => k.name === this.$root.settings.project_filter.author).length > 0) {
            sortable.push({ slugProjectName, orderBy });
          }
          continue;
        }

      }

      // if there is no project in sortable, it is probable that filters 
      // were too restrictive
      if(sortable.length === 0) {
        // lets remove filters if there are any
        this.$nextTick(() => {
          // this.$root.settings.project_filter.keyword = false;
        });
      }

      let sortedSortable = sortable.sort(function(a, b) {
        let valA = a.orderBy;
        let valB = b.orderBy;
        if (typeof a.orderBy === 'string' && typeof b.orderBy === 'string') {
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

      if (this.currentSort.order === 'descending') {
        sortedSortable.reverse();
      }

      return sortedSortable;
    },
    allMedias: function() {
      let allMedias = [];
      if(this.projects === undefined || Object.keys(this.projects).length === 0) {
        return [];
      }
      Object.keys(this.projects).map(slugProjectName => {
        const folder = this.projects[slugProjectName];
        if(!folder.hasOwnProperty('medias')) {
          return;
        }
        const folder_medias = folder.medias;

        Object.keys(folder_medias).map(slugMediaName => {
          let media = JSON.parse(JSON.stringify(folder_medias[slugMediaName]));
          media.slugProjectName = slugProjectName;
          allMedias.push(media);
        });
      });
      return allMedias;
    },
    filteredMedias: function() {
      return this.allMedias.filter(m => this.$root.isMediaShown(m));
    },
    sortedMedias: function() {
      let sortedMedias = this.$_.sortBy(this.filteredMedias, 'date_created');
      return sortedMedias.reverse();
    },
    groupedMedias: function() {
      let mediaGroup = this.$_.groupBy(this.sortedMedias, (media) => {
          if(media.hasOwnProperty('date_created')) {
            var dateMoment = this.$moment(media.date_created);
            return dateMoment.format('YYYY-MM-DD');
          }
        });
      mediaGroup = this.$_.pairs(mediaGroup); 
      mediaGroup = this.$_.sortBy(mediaGroup);
      mediaGroup = mediaGroup.reverse();
      return mediaGroup;  
    }
  },
  methods: {
    setSort(newSort) {
      this.currentSort = newSort;
    },
    setFilter(newFilter) {
      this.currentFilter = newFilter;
    },
    urlToPortrait(slug, filename) {
      if(filename === undefined) {
        return '';
      }
      return `/${this.$root.state.authorsFolder}/${slug}/${filename}`;
    }
  }
};
</script>
<style>

</style>