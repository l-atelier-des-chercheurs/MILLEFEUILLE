const path = require('path'),
  fs = require('fs-extra'),
  formidable = require('formidable'),
  archiver = require('archiver');

const sockets = require('./core/sockets'),
  dev = require('./core/dev-log'),
  cache = require('./core/cache'),
  api = require('./core/api'),
  file = require('./core/file'),
  exporter = require('./core/exporter');

module.exports = function(app, io, m) {
  /**
   * routing event
   */
  app.get('/', showIndex);
  app.get('/:folder', loadFolderOrMedia);
  app.get('/:folder/media/:metaFileName', loadFolderOrMedia);
  app.get('/publication/:publication', printPublication);
  app.get('/publication/web/:publication', exportPublication);
  app.get('/publication/print/:pdfName', showPDF);
  app.get('/publication/video/:videoName', showVideo);
  app.post('/:folder/file-upload', postFile2);

  /**
   * routing functions
   */
  function generatePageData(req) {
    return new Promise(function(resolve, reject) {
      let fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
      dev.log(`••• the following page has been requested: ${fullUrl} •••`);

      let pageData = {};

      pageData.pageTitle = 'millefeuille';
      // full path on the storage space, as displayed in the footer
      pageData.folderPath = api.getFolderPath();
      pageData.slugFolderName = '';
      pageData.url = req.path;
      pageData.protocol = req.protocol;
      pageData.folderPreviewFilename_ext =
        global.settings.folderPreviewFilename + global.settings.thumbExt;
      pageData.structure = global.settings.structure;
      // pageData.authorsFolder = global.settings.structure.authors.path;
      pageData.isDebug = dev.isDebug();

      if (global.hasOwnProperty('mode')) {
        pageData.mode = global.mode;
      } else {
        pageData.mode = 'live';
      }

      resolve(pageData);
    });
  }

  // GET
  function showIndex(req, res) {
    generatePageData(req).then(
      pageData => {
        dev.logpackets(
          `Rendering index with data `,
          JSON.stringify(pageData, null, 4)
        );

        if (pageData.mode !== 'read_only') {
          res.render('index', pageData);
        } else {
          if (global.hasOwnProperty('foldersAndMediaData')) {
            pageData.foldersAndMediaData = global.foldersAndMediaData;
            res.render('index', pageData);
          } else {
            const type = 'layers';

            file.getFolder({ type }).then(foldersData => {
              let tasks = [];

              Object.keys(foldersData).map(slugFolderName => {
                let myPromise = new Promise((resolve, reject) => {
                  exporter
                    .getFolderAndMedia({ slugFolderName, type })
                    .then(d => {
                      resolve(d);
                    });
                });

                tasks.push(myPromise);
              });

              Promise.all(tasks).then(d_array => {
                let allLayersAndMedias = {};

                d_array.map(d => {
                  const k = Object.keys(d)[0];
                  const v = Object.values(d)[0];
                  allLayersAndMedias[k] = v;
                });

                global.foldersAndMediaData = allLayersAndMedias;
                pageData.foldersAndMediaData = global.foldersAndMediaData;
                res.render('index', pageData);
              });
            });
          }
        }
      },
      err => {
        dev.error(`Err while getting index data: ${err}`);
      }
    );
  }

  function loadFolderOrMedia(req, res) {
    let slugFolderName = req.param('folder');
    let metaFileName = req.param('metaFileName');

    generatePageData(req).then(
      pageData => {
        // let’s make sure that folder exists first and return some meta
        file
          .getFolder({ type: 'layers', slugFolderName })
          .then(
            foldersData => {
              pageData.slugFolderName = slugFolderName;
              pageData.folderAndMediaData = foldersData;
              if (metaFileName) {
                pageData.metaFileName = metaFileName;
              }
              res.render('index', pageData);
            },
            (err, p) => {
              dev.error(`Failed to get folder: ${err}`);
              pageData.noticeOfError = 'failed_to_find_folder';
              res.render('index', pageData);
            }
          )
          .catch(err => {
            dev.error('No folder found');
          });
      },
      err => {
        dev.error(`Err while getting index data: ${err}`);
      }
    );
  }

  function printPublication(req, res) {
    let slugPubliName = req.param('publication');
    generatePageData(req).then(pageData => {
      exporter.loadPublication(slugPubliName, pageData).then(pageData => {
        pageData.mode = 'print_publication';
        res.render('index', pageData);
      });
    });
  }

  function exportPublication(req, res) {
    let slugPubliName = req.param('publication');
    generatePageData(req).then(pageData => {
      exporter.loadPublication(slugPubliName, pageData).then(pageData => {
        pageData.mode = 'export_publication';
        res.render('index', pageData, (err, html) => {
          exporter
            .copyPubliContent({
              html,
              folders_and_medias: pageData.folderAndMediaData,
              slugPubliName
            })
            .then(
              cachePath => {
                var archive = archiver('zip');

                archive.on('error', function(err) {
                  res.status(500).send({ error: err.message });
                });

                //on stream closed we can end the request
                archive.on('end', function() {
                  dev.log('Archive wrote %d bytes', archive.pointer());
                });

                //set the archive name
                res.attachment(slugPubliName + '.zip');

                //this is the streaming magic
                archive.pipe(res);

                archive.directory(cachePath, false);

                archive.finalize();
              },
              (err, p) => {
                dev.error('Failed while preparing/making a web export');
              }
            );
        });
      });
    });
  }

  function showPDF(req, res) {
    let pdfName = req.param('pdfName');
    const cachePath = path.join(
      global.tempStorage,
      global.settings.cacheDirname,
      '_publications'
    );
    const pdfPath = path.join(cachePath, pdfName);

    res.download(pdfPath, pdfName, function(err) {
      if (err) {
      } else {
      }
    });
  }

  function showVideo(req, res) {
    let videoName = req.param('videoName');
    const cachePath = path.join(
      global.tempStorage,
      global.settings.cacheDirname,
      '_publications'
    );
    const videoPath = path.join(cachePath, videoName);

    res.download(videoPath, videoName, function(err) {
      if (err) {
      } else {
      }
    });
  }

  function postFile2(req, res) {
    let slugFolderName = req.param('folder');
    dev.logverbose(`Will add new media for folder ${slugFolderName}`);

    // create an incoming form object
    var form = new formidable.IncomingForm();

    // specify that we want to allow the user to upload multiple files in a single request
    form.multiples = false;
    form.maxFileSize = 1000 * 1024 * 1024;
    let socketid = '';

    // store all uploads in the folder directory
    form.uploadDir = api.getFolderPath(slugFolderName);

    let allFilesMeta = [];
    let fieldValues = {};

    form.on('field', function(name, value) {
      console.log(`Got field with name = ${name} and value = ${value}.`);
      if (name === 'socketid') {
        socketid = value;
      }

      try {
        fieldValues[name] = JSON.parse(value);
      } catch (e) {
        // didn’t get an object as additional meta
      }
    });

    // every time a file has been uploaded successfully,
    form.on('file', function(field, uploadedFile) {
      dev.logverbose(
        `File uploaded:\nfield: ${field}\nfile: ${JSON.stringify(
          uploadedFile,
          null,
          4
        )}.`
      );
      // add addiontal meta from 'field' to the array
      let newFile = uploadedFile;
      for (let fileName in fieldValues) {
        if (fileName === newFile.name) {
          newFile = Object.assign({}, newFile, {
            additionalMeta: fieldValues[fileName]
          });
        }
      }
      //       dev.logverbose(`Found matching filenames, new meta file is: ${JSON.stringify(newFile,null,4)}`);
      allFilesMeta.push(newFile);
    });

    // log any errors that occur
    form.on('error', function(err) {
      console.log(`An error has happened: ${err}`);
    });
    form.on('aborted', function(err) {
      console.log(`File upload aborted: ${err}`);
    });

    // once all the files have been uploaded
    form.on('end', function() {
      console.log(`All files have been sent`);
      let msg = {};
      msg.msg = 'success';
      //           msg.medias = JSON.stringify(allFilesMeta);
      res.end(JSON.stringify(msg));

      if (allFilesMeta.length > 0) {
        var m = [];
        for (var i in allFilesMeta) {
          m.push(
            renameAndConvertMediaAndCreateMeta(
              form.uploadDir,
              slugFolderName,
              allFilesMeta[i],
              socketid
            )
          );
        }
        Promise.all(m).then(() => {});
      } else {
        var m = [];
        for (var n in fieldValues) {
          m.push(
            sockets.createMediaMeta({
              type: 'layers',
              slugFolderName: slugFolderName,
              additionalMeta: fieldValues[n]
            })
          );
        }
        Promise.all(m).then(() => {});
      }
    });

    // parse the incoming request containing the form data
    form.parse(req);
  }

  function renameAndConvertMediaAndCreateMeta(
    uploadDir,
    slugFolderName,
    fileMeta,
    socketid
  ) {
    return new Promise(function(resolve, reject) {
      dev.logfunction('ROUTER — renameAndConvertMediaAndCreateMeta');
      api.findFirstFilenameNotTaken(uploadDir, fileMeta.name).then(
        function(newFileName) {
          dev.logverbose(`Following filename is available: ${newFileName}`);

          if (fileMeta.hasOwnProperty('additionalMeta')) {
            dev.logverbose(
              `Has additional meta: ${JSON.stringify(
                fileMeta.additionalMeta,
                null,
                4
              )}`
            );
          } else {
            fileMeta.additionalMeta = {};
          }

          file
            .convertAndSaveMedia({
              uploadDir,
              tempPath: fileMeta.path,
              newFileName,
              socketid
            })
            .then(newFileName => {
              fileMeta.additionalMeta.media_filename = newFileName;
              sockets.createMediaMeta({
                type: 'layers',
                slugFolderName: slugFolderName,
                additionalMeta: fileMeta.additionalMeta
              });
              resolve();
            })
            .catch(err => {
              dev.error(err);
              fileMeta.additionalMeta.media_filename = newFileName;
              sockets.createMediaMeta({
                type: 'layers',
                slugFolderName: slugFolderName,
                additionalMeta: fileMeta.additionalMeta
              });
              resolve();
            });
        },
        function(err) {
          reject(err);
        }
      );
    });
  }
};
