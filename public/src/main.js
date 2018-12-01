import localstore from 'store';

/** *********
   AUTH
***********/
// window.auth = (function() {
//   let admin_access;

//   const API = {
//     init: () => init(),
//     updateAdminAccess: folderPass => updateAdminAccess(folderPass),
//     removeKey: slugFolderName => removeKey(slugFolderName),
//     getAdminAccess: () => getAdminAccess()
//   };

//   function init() {
//     admin_access = localstore.get('admin_access') || {};
//   }

//   function updateAdminAccess(folderPass) {
//     for (let slugFolderName in folderPass) {
//       admin_access[slugFolderName] = folderPass[slugFolderName];
//     }
//     localstore.set('admin_access', admin_access);
//   }

//   function removeKey(slugFolderName) {
//     delete admin_access[slugFolderName];
//     localstore.set('admin_access', admin_access);
//   }

//   function getAdminAccess() {
//     return admin_access;
//   }

//   return API;
// })();
// auth.init();

/** *********
  UTILS
***********/

if (window.state.is_electron) {
  document.body.addEventListener('click', electronSpecificOpenLink);

  // If click on a link with a specific class, open in the browser and not in electron.
  function electronSpecificOpenLink(event) {
    event.path.every(item => {
      if (item.classList !== undefined && item.classList.length > 0) {
        if (item.classList.contains('js--openInBrowser')) {
          const shell = window.require('electron').shell;
          event.preventDefault();
          shell.openExternal(item.href);
          return false;
        } else if (item.classList.contains('js--openInNativeApp')) {
          const shell = window.require('electron').shell;
          event.preventDefault();
          shell.openItem(item.getAttribute('href'));
          return false;
        }
      }
      return true;
    });
  }
}

document.addEventListener(
  'dragover',
  function(event) {
    event.preventDefault();
    return false;
  },
  false
);

document.addEventListener(
  'drop',
  function(event) {
    event.preventDefault();
    return false;
  },
  false
);

import main from './vue/app.js';
