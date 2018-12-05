/** *********
  VUE
***********/

// The following line loads the standalone build of Vue instead of the runtime-only build,
// so you don't have to do: import Vue from 'vue/dist/vue'
// This is done with the browser options. For the config, see package.json
import Vue from 'vue';

import localstore from 'store';
import _ from 'underscore';
Object.defineProperty(Vue.prototype, '$_', { value: _ });

import alertify from 'alertify.js';
Vue.prototype.$alertify = alertify;

import locale_strings from './locale_strings.js';

Vue.config.silent = false;
Vue.config.devtools = true;

Vue.prototype.$eventHub = new Vue(); // Global event bus

import PortalVue from 'portal-vue';
Vue.use(PortalVue);

import VueI18n from 'vue-i18n';
Vue.use(VueI18n);

let lang_settings = {
  available: {
    fr: 'Français',
    en: 'English'
  },
  default: 'en',
  current: '',
  init: function() {
    let localstore_lang = localstore.get('language');

    // // force lang to french
    // this.current = 'fr';
    // return;

    // has lang set
    if (localstore_lang !== undefined) {
      // exists in available
      if (this.available[localstore_lang] !== undefined) {
        this.current = localstore_lang;
      }
    }

    if (this.current === '') {
      // set current lang from window.navigator.language
      // window.navigator.language can be 'fr', 'en', or 'fr-FR'

      let browserLangIsAvailable = Object.keys(this.available).filter(x => {
        return window.navigator.language.includes(x);
      });
      if (browserLangIsAvailable.length > 0) {
        this.current = browserLangIsAvailable[0];
      }
    }

    if (this.current === '') {
      this.current = this.default;
    }
  }
};
lang_settings.init();

import moment from 'moment';
import 'moment/locale/fr';
import 'moment/locale/en-gb';

moment.locale(lang_settings.current);
Vue.prototype.$moment = moment;

const html = document.documentElement; // returns the html tag
html.setAttribute('lang', lang_settings.current);

// Create VueI18n instance with options
let i18n = new VueI18n({
  locale: lang_settings.current, // set locale
  messages: locale_strings // set locale messages
});

/** *********
  SOCKETIO
***********/
import io from 'socket.io-client';

Vue.prototype.$socketio = new Vue({
  i18n,
  data: {
    socket: ''
  },
  methods: {
    connect() {
      if (window.navigator.userAgent.indexOf('Chrome') > -1) {
        this.socket = io.connect({ transports: ['websocket', 'polling'] });
      } else {
        this.socket = io.connect({ transports: ['polling', 'websocket'] });
      }
      this.socket.on('connect', this._onSocketConnect);
      this.socket.on('reconnect', this._onReconnect);
      this.socket.on('error', this._onSocketError);
      this.socket.on('connect_error', this._onConnectError);
      this.socket.on('authentificated', this._authentificated);
      this.socket.on('listMedia', this._onListMedia);
      this.socket.on('listMedias', this._onListMedias);
      // used in publications
      this.socket.on('listFolder', this._onListFolder);
      this.socket.on('listFolders', this._onListFolders);

      this.socket.on('listSpecificMedias', this._onListSpecificMedias);
      this.socket.on('publiPDFGenerated', this._onPubliPDFGenerated);
      this.socket.on('publiVideoGenerated', this._onPubliVideoGenerated);

      this.socket.on('newNetworkInfos', this._onNewNetworkInfos);

      this.socket.on('notify', this._onNotify);
    },
    _onSocketConnect() {
      let sessionId = this.socket.io.engine.id;
      console.log(`Connected as ${sessionId}`);

      window.state.connected = true;

      // only for non-electron (since obviously in electron we have to be connected)
      if (!window.state.is_electron) {
        // this.$alertify
        //   .closeLogOnClick(true)
        //   .delay(4000)
        //   .success(this.$t('notifications.connection_active'));
      }

      this.listFolders({ type: 'layers' });
      // this.sendAuth();
    },

    _onReconnect() {
      this.$eventHub.$emit('socketio.reconnect');
      console.log(`Reconnected`);
    },

    sendAuth() {
      let admin_access = auth.getAdminAccess();
      console.log(
        `Asking for auth with ${JSON.stringify(admin_access, null, 4)}`
      );
      this.socket.emit('authenticate', { admin_access });
    },

    _onSocketError(reason) {
      console.log(`Unable to connect to server: ${reason}`);
      window.state.connected = false;
      // this.$alertify
      //   .closeLogOnClick(true)
      //   .error(this.$t('notifications.connection_error') + ' ' + reason);
    },

    _onConnectError(reason) {
      console.log(`Lost connection to server: ${reason}`);
      window.state.connected = false;
      // this.$alertify
      //   .closeLogOnClick(true)
      //   .error(
      //     this.$t('notifications.connection_lost') +
      //       '<br>' +
      //       this.$t('notifications.contents_wont_be_editable')
      //   );
    },

    // _authentificated(list_admin_folders) {
    //   console.log(
    //     `Admin for projects ${JSON.stringify(list_admin_folders, null, 4)}`
    //   );

    //   // compare local store and answer from server
    //   // for each key that is not in the answer, let’s send and alert to notify that the password is most likely wrong or the folder name has changed
    //   if (auth.getAdminAccess() !== undefined) {
    //     let admin_access = Object.keys(auth.getAdminAccess());
    //     admin_access.forEach(slugFolderName => {
    //       if (
    //         list_admin_folders === undefined ||
    //         list_admin_folders.indexOf(slugFolderName) === -1
    //       ) {
    //         this.$alertify
    //           .closeLogOnClick(true)
    //           .delay(4000)
    //           .error(
    //             this.$t('notifications["wrong_password_for_folder:"]') +
    //               ' ' +
    //               slugFolderName
    //           );
    //         auth.removeKey(slugFolderName);
    //       } else {
    //       }
    //     });
    //   }

    //   window.dispatchEvent(
    //     new CustomEvent('socketio.connected_and_authentified')
    //   );
    //   this.listFolders();
    // },

    _onListMedia(data) {
      console.log('Received _onListMedia packet.');

      let type = Object.keys(data)[0];
      let content = Object.values(data)[0];

      console.log(`Type is ${type}`);

      for (let slugFolderName in content) {
        console.log(`Media data is for ${slugFolderName}.`);
        if (window.store[type].hasOwnProperty(slugFolderName)) {
          window.store[type][slugFolderName].medias = Object.assign(
            {},
            window.store[type][slugFolderName].medias,
            content[slugFolderName].medias
          );

          // check if mdata has a mediaID (which would mean a user just created it)
          const mdata = Object.values(content[slugFolderName].medias)[0];
          if (mdata.hasOwnProperty('id')) {
            this.$eventHub.$emit('socketio.media_created_or_updated', mdata);
          }
        }
      }

      this.$eventHub.$emit(`socketio.${type}.listMedia`);
    },

    _onListMedias(data) {
      console.log('Received _onListMedias packet.');

      let type = Object.keys(data)[0];
      let content = Object.values(data)[0];

      console.log(`Type is ${type}`);

      for (let slugFolderName in content) {
        console.log(`Media data is for ${slugFolderName}.`);
        if (window.store[type].hasOwnProperty(slugFolderName)) {
          window.store[type][slugFolderName].medias =
            content[slugFolderName].medias;

          // if (type === 'projects') {
          //   window.state.list_of_projects_whose_medias_are_tracked.push(
          //     slugFolderName
          //   );
          // }
        }
      }
      this.$eventHub.$emit(`socketio.${type}.listMedias`);
    },

    _onListSpecificMedias(data) {
      console.log('Received _onListSpecificMedias packet.');

      let type = Object.keys(data)[0];
      let content = Object.values(data)[0];

      console.log(`Type is ${type}`);

      for (let slugFolderName in content) {
        console.log(`Media data is for ${slugFolderName}.`);
        if (
          window.store[type].hasOwnProperty(slugFolderName) &&
          window.store[type][slugFolderName].hasOwnProperty('medias')
        ) {
          window.store[type][slugFolderName].medias = Object.assign(
            {},
            window.store[type][slugFolderName].medias,
            content[slugFolderName].medias
          );
        }
      }
      this.$eventHub.$emit(`socketio.${type}.listSpecificMedias`);
    },

    _onPubliPDFGenerated(data) {
      console.log('Received _onPubliPDFGenerated packet.');
      this.$eventHub.$emit('socketio.publication.pdfIsGenerated', data);
    },

    _onPubliVideoGenerated(data) {
      console.log('Received _onPubliVideoGenerated packet.');
      this.$eventHub.$emit('socketio.publication.videoIsGenerated', data);
    },

    // for projects, authors and publications
    _onListFolder(data) {
      console.log('Received _onListFolder packet.');
      let type = Object.keys(data)[0];
      let content = Object.values(data)[0];

      // to prevent override of fully formed medias in folders, we copy back the ones we have already
      for (let slugFolderName in content) {
        if (
          window.store[type].hasOwnProperty(slugFolderName) &&
          window.store[type][slugFolderName].hasOwnProperty('medias')
        ) {
          content[slugFolderName].medias =
            window.store[type][slugFolderName].medias;
        }
        if (content[slugFolderName].hasOwnProperty('id')) {
          this.$eventHub.$emit(
            'socketio.folder_created_or_updated',
            content[slugFolderName]
          );
        }
      }

      window.store[type] = Object.assign({}, window.store[type], content);
      this.$eventHub.$emit(`socketio.${type}.folder_listed`);
    },

    // for projects, authors and publications
    _onListFolders(data) {
      console.log('Received _onListFolders packet.');

      if (typeof data !== 'object') {
        return;
      }

      let type = Object.keys(data)[0];
      let content = Object.values(data)[0];

      console.log(`Type is ${type}`);

      // to prevent override of fully formed medias in folders, we copy back the ones we have already
      for (let slugFolderName in content) {
        if (
          window.store[type].hasOwnProperty(slugFolderName) &&
          window.store[type][slugFolderName].hasOwnProperty('medias')
        ) {
          content[slugFolderName].medias =
            window.store[type][slugFolderName].medias;
        }
      }
      window.store[type] = Object.assign({}, content);

      this.$eventHub.$emit(`socketio.${type}.folders_listed`);
    },
    _onNewNetworkInfos(data) {
      console.log('Received _onNewNetworkInfos packet.');
      window.state.localNetworkInfos = data;
    },
    _onNotify({ localized_string, not_localized_string }) {
      console.log('Received _onNotify packet.');
      if (not_localized_string) {
        alertify
          .closeLogOnClick(true)
          .delay(4000)
          .log(not_localized_string);
      }
      if (localized_string) {
        alertify
          .closeLogOnClick(true)
          .delay(4000)
          .log(this.$t(`notifications['${localized_string}']`));
      }
    },
    listFolders(fdata) {
      this.socket.emit('listFolders', fdata);
    },
    listFolder(fdata) {
      this.socket.emit('listFolder', fdata);
    },
    createFolder(fdata) {
      this.socket.emit('createFolder', fdata);
    },
    editFolder(fdata) {
      this.socket.emit('editFolder', fdata);
    },
    removeFolder(fdata) {
      this.socket.emit('removeFolder', fdata);
    },

    listMedias(mdata) {
      this.socket.emit('listMedias', mdata);
    },
    createMedia(mdata) {
      this.socket.emit('createMedia', mdata);
    },
    editMedia(mdata) {
      this.socket.emit('editMedia', mdata);
    },
    removeMedia(mdata) {
      this.socket.emit('removeMedia', mdata);
    },
    listSpecificMedias(mdata) {
      this.socket.emit('listSpecificMedias', mdata);
    },
    downloadPubliPDF(pdata) {
      this.socket.emit('downloadPubliPDF', pdata);
    },
    downloadVideoPubli(pdata) {
      this.socket.emit('downloadVideoPubli', pdata);
    },
    updateNetworkInfos() {
      this.socket.emit('updateNetworkInfos');
    }
  }
});

import App from './App.vue';

let vm = new Vue({
  // eslint-disable-line no-new
  i18n,
  el: '#app',
  components: { App },
  template: `
    <App
    />
  `,
  data: {
    store: window.store,
    state: window.state,

    justCreatedFolderID: false,
    justCreatedMediaID: false,

    media_modal: {
      open: false,
      minimized: false,
      show_sidebar: true,
      current_slugLayerName: false,
      current_metaFileName: false
    },

    config: {
      // exemple de contenu :
      /* layers: [
        { slugLayerName: plop, ordre: 0, opacite: .2 },
        { slugLayerName: plop2, ordre: 0, opacite: .2 }
      ]
      */
      layers: []
    },

    // persistant, par device (dans le localstorage)
    settings: {
      has_modal_opened: false,
      sidebar: {
        view: 'Layers',
        layer_viewed: false
      },
      mode_perspective: false,
      perspective_stretch: 50,

      windowHeight: window.innerHeight,
      windowWidth: window.innerWidth
    },
    lang: {
      available: lang_settings.available,
      current: lang_settings.current
    }
  },
  created() {
    if (window.state.dev_mode === 'debug') {
      console.log('ROOT EVENT: created');
    }
    if (this.settings.enable_system_bar) {
      document.body.classList.add('has_systembar');
    }

    if (window.state.dev_mode === 'debug') {
      console.log('ROOT EVENT: created / checking for password');
    }

    if (!window.state.is_electron && this.state.session_password !== '') {
      function hashCode(s) {
        return s.split('').reduce(function(a, b) {
          a = (a << 5) - a + b.charCodeAt(0);
          return a & a;
        }, 0);
      }

      var pass = window.prompt(this.$t('input_password'));
      if (this.state.session_password !== hashCode(pass) + '') {
        return;
      }
    }

    window.addEventListener('resize', () => {
      this.settings.windowWidth = window.innerWidth;
      this.settings.windowHeight = window.innerHeight;
    });

    /* à la connexion/reconnexion, détecter si un projet ou une publi sont ouverts 
    et si c’est le cas, rafraichir leur contenu (meta, medias) */
    this.$eventHub.$on('socketio.reconnect', () => {
      // TODO
      // if (this.current_slugLayerName) {
      //   this.$socketio.listFolder({
      //     type: 'projects',
      //     slugFolderName: this.do_navigation.current_slugLayerName
      //   });
      //   this.$socketio.listMedias({
      //     type: 'projects',
      //     slugFolderName: this.do_navigation.current_slugLayerName
      //   });
      // }
    });

    window.addEventListener('tag.newTagDetected', this.newTagDetected);

    if (this.state.mode === 'live') {
      console.log('ROOT EVENT: created / now connecting with socketio');
      this.$socketio.connect();
    }
  },
  beforeDestroy() {},
  watch: {
    'settings.has_modal_opened': function() {
      if (window.state.dev_mode === 'debug') {
        console.log(
          `ROOT EVENT: var has changed: has_modal_opened: ${
            this.settings.has_modal_opened
          }`
        );
      }
      if (this.has_modal_opened) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    },
    'store.authors': function() {
      if (window.state.dev_mode === 'debug') {
        console.log(`ROOT EVENT: var has changed: store.authors`);
      }
      // check if, when store.authors refresh, the current_author is still there
      // delog if not
      if (
        this.settings.current_author &&
        !this.store.authors.hasOwnProperty(
          this.settings.current_author.slugFolderName
        )
      ) {
        this.unsetAuthor();
      }
    }
  },
  computed: {
    currentProject: function() {
      if (
        this.store.hasOwnProperty('projects') &&
        this.store.layers.hasOwnProperty(
          this.do_navigation.current_slugLayerName
        )
      ) {
        return this.store.layers[this.do_navigation.current_slugLayerName];
      }
      return {};
    }
  },
  methods: {
    createFolder: function(fdata) {
      if (window.state.dev_mode === 'debug') {
        console.log(
          `ROOT EVENT: createfolder: ${JSON.stringify(fdata, null, 4)}`
        );
      }

      this.justCreatedFolderID = fdata.id =
        Math.random()
          .toString(36)
          .substring(2, 15) +
        Math.random()
          .toString(36)
          .substring(2, 15);

      this.$socketio.createFolder(fdata);
    },
    editFolder: function(fdata) {
      if (window.state.dev_mode === 'debug') {
        console.log(
          `ROOT EVENT: editFolder: ${JSON.stringify(fdata, null, 4)}`
        );
      }
      this.$socketio.editFolder(fdata);
    },
    removeFolder: function({ type, slugFolderName }) {
      if (window.state.dev_mode === 'debug') {
        console.log(
          `ROOT EVENT: removeFolder: slugFolderName = ${slugFolderName} of type = ${type}`
        );
      }
      this.$socketio.removeFolder({ type, slugFolderName });
    },
    createMedia: function(mdata) {
      if (window.state.dev_mode === 'debug') {
        console.log(`ROOT EVENT: createMedia`);
      }
      this.justCreatedMediaID = mdata.id =
        Math.random()
          .toString(36)
          .substring(2, 15) +
        Math.random()
          .toString(36)
          .substring(2, 15);

      this.$nextTick(() => {
        this.$socketio.createMedia(mdata);
      });
    },

    removeMedia: function(mdata) {
      if (window.state.dev_mode === 'debug') {
        console.log(
          `ROOT EVENT: removeMedia: ${JSON.stringify(mdata, null, 4)}`
        );
      }
      this.$socketio.removeMedia(mdata);
    },
    editMedia: function(mdata) {
      if (window.state.dev_mode === 'debug') {
        console.log(`ROOT EVENT: editMedia: ${JSON.stringify(mdata, null, 4)}`);
      }
      this.$socketio.editMedia(mdata);
    },

    openLayer: function(slugLayerName) {
      if (window.state.dev_mode === 'debug') {
        console.log(`ROOT EVENT: openLayer: ${slugLayerName}`);
      }
      if (!this.store.layers.hasOwnProperty(slugLayerName)) {
        console.log('Missing layer key on the page, aborting.');
        return false;
      }

      this.settings.sidebar.view = 'Layer';
      this.settings.sidebar.layer_viewed = slugLayerName;

      this.$socketio.listMedias({
        type: 'layers',
        slugFolderName: slugLayerName
      });
      // this.$root.config;
    },
    closeLayer: function() {
      if (window.state.dev_mode === 'debug') {
        console.log('ROOT EVENT: closeLayer');
      }
      this.settings.sidebar.view = 'Layers';
      this.settings.sidebar.layer_viewed = false;
    },
    previewURL(layer, width = 1600) {
      if (!layer.hasOwnProperty('preview') || layer.preview === '') {
        return false;
      }
      const thumb = layer.preview.filter(p => p.size === width);
      if (thumb.length > 0) {
        return `${thumb[0].path}?${new Date().getTime()}`;
      }
      return false;
    },
    openMedia({ slugLayerName, metaFileName }) {
      if (window.state.dev_mode === 'debug') {
        console.log(
          `ROOT EVENT: openMedia with slugLayerName = ${slugLayerName} and metaFileName = ${metaFileName}`
        );
      }

      this.media_modal.open = true;
      this.media_modal.minimized = false;
      this.media_modal.current_slugLayerName = slugLayerName;
      this.media_modal.current_metaFileName = metaFileName;
    },
    closeMedia: function() {
      if (window.state.dev_mode === 'debug') {
        console.log(`ROOT EVENT: closeMedia`);
      }

      this.media_modal.open = false;
    },
    setProjectKeywordFilter(newKeywordFilter) {
      if (this.settings.project_filter.keyword !== newKeywordFilter) {
        this.settings.project_filter.keyword = newKeywordFilter;
      } else {
        this.settings.project_filter.keyword = false;
      }
    },
    setProjectAuthorFilter(newAuthorFilter) {
      if (this.settings.project_filter.author !== newAuthorFilter) {
        this.settings.project_filter.author = newAuthorFilter;
      } else {
        this.settings.project_filter.author = false;
      }
    },
    setMediaKeywordFilter(newKeywordFilter) {
      if (this.settings.media_filter.keyword !== newKeywordFilter) {
        this.settings.media_filter.keyword = newKeywordFilter;
      } else {
        this.settings.media_filter.keyword = false;
      }
    },
    setMediaAuthorFilter(newAuthorFilter) {
      if (this.settings.media_filter.author !== newAuthorFilter) {
        this.settings.media_filter.author = newAuthorFilter;
      } else {
        this.settings.media_filter.author = false;
      }
    },
    setFavAuthorFilter(newFavFilter) {
      this.settings.media_filter.fav = !this.settings.media_filter.fav;
    },

    isMediaShown(media) {
      if (this.settings.media_filter.fav === true) {
        if (!media.fav) {
          return false;
        }
      }

      if (
        this.settings.media_filter.keyword === false &&
        this.settings.media_filter.author === false
      ) {
        return true;
      }

      if (
        this.settings.media_filter.keyword !== false &&
        this.settings.media_filter.author !== false
      ) {
        // only add to sorted array if project has this keyword
        if (
          media.hasOwnProperty('keywords') &&
          typeof media.keywords === 'object' &&
          media.keywords.filter(
            k => k.title === this.settings.media_filter.keyword
          ).length > 0
        ) {
          if (
            media.hasOwnProperty('authors') &&
            typeof media.authors === 'object' &&
            media.authors.filter(
              k => k.name === this.settings.media_filter.author
            ).length > 0
          ) {
            return true;
          }
        }
        return false;
      }
      // if a project keyword filter is set
      if (this.settings.media_filter.keyword !== false) {
        // only add to sorted array if project has this keyword
        if (
          media.hasOwnProperty('keywords') &&
          typeof media.keywords === 'object' &&
          media.keywords.filter(
            k => k.title === this.settings.media_filter.keyword
          ).length > 0
        ) {
          return true;
        }
        return false;
      }

      if (this.settings.media_filter.author !== false) {
        // only add to sorted array if project has this keyword
        if (
          media.hasOwnProperty('authors') &&
          typeof media.authors === 'object' &&
          media.authors.filter(
            k => k.name === this.settings.media_filter.author
          ).length > 0
        ) {
          return true;
        }
        return false;
      }
      // END MEDIA FILTER LOGIC
    },
    updateLocalLang: function(newLangCode) {
      if (window.state.dev_mode === 'debug') {
        console.log('ROOT EVENT: updateLocalLang');
      }
      i18n.locale = newLangCode;
      moment.locale(newLangCode);
      this.lang.current = newLangCode;

      const html = document.documentElement; // returns the html tag
      html.setAttribute('lang', newLangCode);

      localstore.set('language', newLangCode);
    },
    listSpecificMedias(mdata) {
      if (window.state.dev_mode === 'debug') {
        console.log(
          `ROOT EVENT: listSpecificMedias with medias_list = ${JSON.stringify(
            mdata,
            null,
            4
          )}`
        );
      }
      this.$socketio.listSpecificMedias(mdata);
    },

    switchLang() {
      if (window.state.dev_mode === 'debug') {
        console.log(`ROOT EVENT: switchLang`);
      }
      if (this.lang.current === 'fr') {
        this.updateLocalLang('en');
      } else {
        this.updateLocalLang('fr');
      }
    },

    loadAllProjectsMedias() {
      if (window.state.dev_mode === 'debug') {
        console.log(`ROOT EVENT: loadAllProjectsMedias`);
      }

      Object.keys(this.store.layers).forEach(slugLayerName => {
        const project_meta = this.store.layers[slugLayerName];
        this.$socketio.listMedias({
          type: 'layers',
          slugFolderName: slugLayerName
        });
      });
    },
    formatDateToHuman(date) {
      return this.$moment(date, 'YYYY-MM-DD HH:mm:ss').format('LL');
    },
    updateNetworkInfos() {
      this.$socketio.updateNetworkInfos();
    },
    navigation_back() {
      if (this.$root.do_navigation.view === 'CaptureView') {
        this.$root.do_navigation.view = 'ProjectView';
      } else if (this.$root.do_navigation.view === 'ProjectView') {
        this.$root.closeProject();
      }
    }
  }
});
