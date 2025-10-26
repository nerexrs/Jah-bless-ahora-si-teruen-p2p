import {
  RxCollectionBase,
  RxDatabaseBase,
  RxQueryBase,
  RxSchema,
  basePrototype
} from "./chunk-LK43A4VV.js";
import {
  HOOKS,
  flatCloneDocWithMeta,
  getChangedDocumentsSince,
  getWrittenDocumentsFromBulkWriteResponse,
  runPluginHooks,
  stackCheckpoints,
  stripAttachmentsDataFromDocument
} from "./chunk-FKGUJVD6.js";
import {
  PROMISE_RESOLVE_FALSE,
  PROMISE_RESOLVE_VOID,
  appendToArray,
  batchArray,
  blobToString,
  clone,
  createBlobFromBase64,
  createRevision,
  ensureNotFalsy,
  fillWithDefaultSettings,
  flatClone,
  getComposedPrimaryKeyOfDocumentData,
  getDefaultRevision,
  getDefaultRxDocumentMeta,
  getHeightOfRevision,
  getLengthOfPrimaryKey,
  getPrimaryFieldOfPrimaryKey,
  newRxError,
  newRxTypeError,
  now,
  overwritable
} from "./chunk-GXT3KPMX.js";
import {
  firstValueFrom
} from "./chunk-WCYHURJF.js";
import {
  BehaviorSubject,
  Subject,
  combineLatest,
  filter,
  mergeMap
} from "./chunk-3TXA6K3X.js";
import {
  __async
} from "./chunk-7RSYZEEK.js";

// node_modules/rxdb/dist/esm/plugin.js
var PROTOTYPES = {
  RxSchema: RxSchema.prototype,
  RxDocument: basePrototype,
  RxQuery: RxQueryBase.prototype,
  RxCollection: RxCollectionBase.prototype,
  RxDatabase: RxDatabaseBase.prototype
};
var ADDED_PLUGINS = /* @__PURE__ */ new Set();
var ADDED_PLUGIN_NAMES = /* @__PURE__ */ new Set();
function addRxPlugin(plugin) {
  runPluginHooks("preAddRxPlugin", {
    plugin,
    plugins: ADDED_PLUGINS
  });
  if (ADDED_PLUGINS.has(plugin)) {
    return;
  } else {
    if (ADDED_PLUGIN_NAMES.has(plugin.name)) {
      throw newRxError("PL3", {
        name: plugin.name,
        plugin
      });
    }
    ADDED_PLUGINS.add(plugin);
    ADDED_PLUGIN_NAMES.add(plugin.name);
  }
  if (!plugin.rxdb) {
    throw newRxTypeError("PL1", {
      plugin
    });
  }
  if (plugin.init) {
    plugin.init();
  }
  if (plugin.prototypes) {
    Object.entries(plugin.prototypes).forEach(([name, fun]) => {
      return fun(PROTOTYPES[name]);
    });
  }
  if (plugin.overwritable) {
    Object.assign(overwritable, plugin.overwritable);
  }
  if (plugin.hooks) {
    Object.entries(plugin.hooks).forEach(([name, hooksObj]) => {
      if (hooksObj.after) {
        HOOKS[name].push(hooksObj.after);
      }
      if (hooksObj.before) {
        HOOKS[name].unshift(hooksObj.before);
      }
    });
  }
}

// node_modules/rxdb/dist/esm/replication-protocol/checkpoint.js
function getLastCheckpointDoc(state, direction) {
  return __async(this, null, function* () {
    var checkpointDocId = getComposedPrimaryKeyOfDocumentData(state.input.metaInstance.schema, {
      isCheckpoint: "1",
      itemId: direction
    });
    var checkpointResult = yield state.input.metaInstance.findDocumentsById([checkpointDocId], false);
    var checkpointDoc = checkpointResult[0];
    state.lastCheckpointDoc[direction] = checkpointDoc;
    if (checkpointDoc) {
      return checkpointDoc.checkpointData;
    } else {
      return void 0;
    }
  });
}
function setCheckpoint(state, direction, checkpoint) {
  return __async(this, null, function* () {
    state.checkpointQueue = state.checkpointQueue.then(() => __async(null, null, function* () {
      var previousCheckpointDoc = state.lastCheckpointDoc[direction];
      if (checkpoint && /**
       * If the replication is already canceled,
       * we do not write a checkpoint
       * because that could mean we write a checkpoint
       * for data that has been fetched from the master
       * but not been written to the child.
       */
      !state.events.canceled.getValue() && /**
       * Only write checkpoint if it is different from before
       * to have less writes to the storage.
       */
      (!previousCheckpointDoc || JSON.stringify(previousCheckpointDoc.checkpointData) !== JSON.stringify(checkpoint))) {
        var newDoc = {
          id: "",
          isCheckpoint: "1",
          itemId: direction,
          _deleted: false,
          _attachments: {},
          checkpointData: checkpoint,
          _meta: getDefaultRxDocumentMeta(),
          _rev: getDefaultRevision()
        };
        newDoc.id = getComposedPrimaryKeyOfDocumentData(state.input.metaInstance.schema, newDoc);
        while (!state.events.canceled.getValue()) {
          if (previousCheckpointDoc) {
            newDoc.checkpointData = stackCheckpoints([previousCheckpointDoc.checkpointData, newDoc.checkpointData]);
          }
          newDoc._meta.lwt = now();
          newDoc._rev = createRevision(yield state.checkpointKey, previousCheckpointDoc);
          if (state.events.canceled.getValue()) {
            return;
          }
          var writeRows = [{
            previous: previousCheckpointDoc,
            document: newDoc
          }];
          var result = yield state.input.metaInstance.bulkWrite(writeRows, "replication-set-checkpoint");
          var successDoc = getWrittenDocumentsFromBulkWriteResponse(state.primaryPath, writeRows, result)[0];
          if (successDoc) {
            state.lastCheckpointDoc[direction] = successDoc;
            return;
          } else {
            var error = result.error[0];
            if (error.status !== 409) {
              throw error;
            } else {
              previousCheckpointDoc = ensureNotFalsy(error.documentInDb);
              newDoc._rev = createRevision(yield state.checkpointKey, previousCheckpointDoc);
            }
          }
        }
      }
    }));
    yield state.checkpointQueue;
  });
}
function getCheckpointKey(input) {
  return __async(this, null, function* () {
    var hash = yield input.hashFunction([input.identifier, input.forkInstance.databaseName, input.forkInstance.collectionName].join("||"));
    return "rx_storage_replication_" + hash;
  });
}

// node_modules/rxdb/dist/esm/replication-protocol/helper.js
function docStateToWriteDoc(databaseInstanceToken, hasAttachments, keepMeta, docState, previous) {
  var docData = Object.assign({}, docState, {
    _attachments: hasAttachments && docState._attachments ? docState._attachments : {},
    _meta: keepMeta ? docState._meta : Object.assign({}, previous ? previous._meta : {}, {
      lwt: now()
    }),
    _rev: keepMeta ? docState._rev : getDefaultRevision()
  });
  if (!docData._rev) {
    docData._rev = createRevision(databaseInstanceToken, previous);
  }
  return docData;
}
function writeDocToDocState(writeDoc, keepAttachments, keepMeta) {
  var ret = flatClone(writeDoc);
  if (!keepAttachments) {
    delete ret._attachments;
  }
  if (!keepMeta) {
    delete ret._meta;
    delete ret._rev;
  }
  return ret;
}
function stripAttachmentsDataFromMetaWriteRows(state, rows) {
  if (!state.hasAttachments) {
    return rows;
  }
  return rows.map((row) => {
    var document = clone(row.document);
    document.docData = stripAttachmentsDataFromDocument(document.docData);
    return {
      document,
      previous: row.previous
    };
  });
}
function getUnderlyingPersistentStorage(instance) {
  while (true) {
    if (instance.underlyingPersistentStorage) {
      instance = instance.underlyingPersistentStorage;
    } else {
      return instance;
    }
  }
}

// node_modules/rxdb/dist/esm/replication-protocol/meta-instance.js
var META_INSTANCE_SCHEMA_TITLE = "RxReplicationProtocolMetaData";
function getRxReplicationMetaInstanceSchema(replicatedDocumentsSchema, encrypted) {
  var parentPrimaryKeyLength = getLengthOfPrimaryKey(replicatedDocumentsSchema);
  var baseSchema = {
    title: META_INSTANCE_SCHEMA_TITLE,
    primaryKey: {
      key: "id",
      fields: ["itemId", "isCheckpoint"],
      separator: "|"
    },
    type: "object",
    version: replicatedDocumentsSchema.version,
    additionalProperties: false,
    properties: {
      id: {
        type: "string",
        minLength: 1,
        // add +1 for the '|' and +1 for the 'isCheckpoint' flag
        maxLength: parentPrimaryKeyLength + 2
      },
      isCheckpoint: {
        type: "string",
        enum: ["0", "1"],
        minLength: 1,
        maxLength: 1
      },
      itemId: {
        type: "string",
        /**
         * ensure that all values of RxStorageReplicationDirection ('DOWN' has 4 chars) fit into it
         * because checkpoints use the itemId field for that.
         */
        maxLength: parentPrimaryKeyLength > 4 ? parentPrimaryKeyLength : 4
      },
      checkpointData: {
        type: "object",
        additionalProperties: true
      },
      docData: {
        type: "object",
        properties: replicatedDocumentsSchema.properties
      },
      isResolvedConflict: {
        type: "string"
      }
    },
    keyCompression: replicatedDocumentsSchema.keyCompression,
    required: ["id", "isCheckpoint", "itemId"]
  };
  if (encrypted) {
    baseSchema.encrypted = ["docData"];
  }
  var metaInstanceSchema = fillWithDefaultSettings(baseSchema);
  return metaInstanceSchema;
}
function getAssumedMasterState(state, docIds) {
  return state.input.metaInstance.findDocumentsById(docIds.map((docId) => {
    var useId = getComposedPrimaryKeyOfDocumentData(state.input.metaInstance.schema, {
      itemId: docId,
      isCheckpoint: "0"
    });
    return useId;
  }), true).then((metaDocs) => {
    var ret = {};
    Object.values(metaDocs).forEach((metaDoc) => {
      ret[metaDoc.itemId] = {
        docData: metaDoc.docData,
        metaDocument: metaDoc
      };
    });
    return ret;
  });
}
function getMetaWriteRow(state, newMasterDocState, previous, isResolvedConflict) {
  return __async(this, null, function* () {
    var docId = newMasterDocState[state.primaryPath];
    var newMeta = previous ? flatCloneDocWithMeta(previous) : {
      id: "",
      isCheckpoint: "0",
      itemId: docId,
      docData: newMasterDocState,
      _attachments: {},
      _deleted: false,
      _rev: getDefaultRevision(),
      _meta: {
        lwt: 0
      }
    };
    newMeta.docData = newMasterDocState;
    if (isResolvedConflict) {
      newMeta.isResolvedConflict = isResolvedConflict;
    }
    newMeta._meta.lwt = now();
    newMeta.id = getComposedPrimaryKeyOfDocumentData(state.input.metaInstance.schema, newMeta);
    newMeta._rev = createRevision(yield state.checkpointKey, previous);
    var ret = {
      previous,
      document: newMeta
    };
    return ret;
  });
}

// node_modules/rxdb/dist/esm/replication-protocol/downstream.js
function startReplicationDownstream(state) {
  return __async(this, null, function* () {
    if (state.input.initialCheckpoint && state.input.initialCheckpoint.downstream) {
      var checkpointDoc = yield getLastCheckpointDoc(state, "down");
      if (!checkpointDoc) {
        yield setCheckpoint(state, "down", state.input.initialCheckpoint.downstream);
      }
    }
    var identifierHash = yield state.input.hashFunction(state.input.identifier);
    var replicationHandler = state.input.replicationHandler;
    var timer = 0;
    var openTasks = [];
    function addNewTask(task) {
      state.stats.down.addNewTask = state.stats.down.addNewTask + 1;
      var taskWithTime = {
        time: timer++,
        task
      };
      openTasks.push(taskWithTime);
      state.streamQueue.down = state.streamQueue.down.then(() => {
        var useTasks = [];
        while (openTasks.length > 0) {
          state.events.active.down.next(true);
          var innerTaskWithTime = ensureNotFalsy(openTasks.shift());
          if (innerTaskWithTime.time < lastTimeMasterChangesRequested) {
            continue;
          }
          if (innerTaskWithTime.task === "RESYNC") {
            if (useTasks.length === 0) {
              useTasks.push(innerTaskWithTime.task);
              break;
            } else {
              break;
            }
          }
          useTasks.push(innerTaskWithTime.task);
        }
        if (useTasks.length === 0) {
          return;
        }
        if (useTasks[0] === "RESYNC") {
          return downstreamResyncOnce();
        } else {
          return downstreamProcessChanges(useTasks);
        }
      }).then(() => {
        state.events.active.down.next(false);
        if (!state.firstSyncDone.down.getValue() && !state.events.canceled.getValue()) {
          state.firstSyncDone.down.next(true);
        }
      });
    }
    addNewTask("RESYNC");
    if (!state.events.canceled.getValue()) {
      var sub = replicationHandler.masterChangeStream$.pipe(mergeMap((ev) => __async(null, null, function* () {
        yield firstValueFrom(state.events.active.up.pipe(filter((s) => !s)));
        return ev;
      }))).subscribe((task) => {
        state.stats.down.masterChangeStreamEmit = state.stats.down.masterChangeStreamEmit + 1;
        addNewTask(task);
      });
      firstValueFrom(state.events.canceled.pipe(filter((canceled) => !!canceled))).then(() => sub.unsubscribe());
    }
    var lastTimeMasterChangesRequested = -1;
    function downstreamResyncOnce() {
      return __async(this, null, function* () {
        state.stats.down.downstreamResyncOnce = state.stats.down.downstreamResyncOnce + 1;
        if (state.events.canceled.getValue()) {
          return;
        }
        state.checkpointQueue = state.checkpointQueue.then(() => getLastCheckpointDoc(state, "down"));
        var lastCheckpoint = yield state.checkpointQueue;
        var promises = [];
        while (!state.events.canceled.getValue()) {
          lastTimeMasterChangesRequested = timer++;
          var downResult = yield replicationHandler.masterChangesSince(lastCheckpoint, state.input.pullBatchSize);
          if (downResult.documents.length === 0) {
            break;
          }
          lastCheckpoint = stackCheckpoints([lastCheckpoint, downResult.checkpoint]);
          promises.push(persistFromMaster(downResult.documents, lastCheckpoint));
          if (downResult.documents.length < state.input.pullBatchSize) {
            break;
          }
        }
        yield Promise.all(promises);
      });
    }
    function downstreamProcessChanges(tasks) {
      state.stats.down.downstreamProcessChanges = state.stats.down.downstreamProcessChanges + 1;
      var docsOfAllTasks = [];
      var lastCheckpoint = null;
      tasks.forEach((task) => {
        if (task === "RESYNC") {
          throw new Error("SNH");
        }
        appendToArray(docsOfAllTasks, task.documents);
        lastCheckpoint = stackCheckpoints([lastCheckpoint, task.checkpoint]);
      });
      return persistFromMaster(docsOfAllTasks, ensureNotFalsy(lastCheckpoint));
    }
    var persistenceQueue = PROMISE_RESOLVE_VOID;
    var nonPersistedFromMaster = {
      docs: {}
    };
    function persistFromMaster(docs, checkpoint) {
      var primaryPath = state.primaryPath;
      state.stats.down.persistFromMaster = state.stats.down.persistFromMaster + 1;
      docs.forEach((docData) => {
        var docId = docData[primaryPath];
        nonPersistedFromMaster.docs[docId] = docData;
      });
      nonPersistedFromMaster.checkpoint = checkpoint;
      persistenceQueue = persistenceQueue.then(() => {
        var downDocsById = nonPersistedFromMaster.docs;
        nonPersistedFromMaster.docs = {};
        var useCheckpoint = nonPersistedFromMaster.checkpoint;
        var docIds = Object.keys(downDocsById);
        if (state.events.canceled.getValue() || docIds.length === 0) {
          return PROMISE_RESOLVE_VOID;
        }
        var writeRowsToFork = [];
        var writeRowsToForkById = {};
        var writeRowsToMeta = {};
        var useMetaWriteRows = [];
        return Promise.all([state.input.forkInstance.findDocumentsById(docIds, true), getAssumedMasterState(state, docIds)]).then(([currentForkStateList, assumedMasterState]) => {
          var currentForkState = /* @__PURE__ */ new Map();
          currentForkStateList.forEach((doc) => currentForkState.set(doc[primaryPath], doc));
          return Promise.all(docIds.map((docId) => __async(null, null, function* () {
            var forkStateFullDoc = currentForkState.get(docId);
            var forkStateDocData = forkStateFullDoc ? writeDocToDocState(forkStateFullDoc, state.hasAttachments, false) : void 0;
            var masterState = downDocsById[docId];
            var assumedMaster = assumedMasterState[docId];
            if (assumedMaster && forkStateFullDoc && assumedMaster.metaDocument.isResolvedConflict === forkStateFullDoc._rev) {
              yield state.streamQueue.up;
            }
            var isAssumedMasterEqualToForkState = !assumedMaster || !forkStateDocData ? false : state.input.conflictHandler.isEqual(assumedMaster.docData, forkStateDocData, "downstream-check-if-equal-0");
            if (!isAssumedMasterEqualToForkState && assumedMaster && assumedMaster.docData._rev && forkStateFullDoc && forkStateFullDoc._meta[state.input.identifier] && getHeightOfRevision(forkStateFullDoc._rev) === forkStateFullDoc._meta[state.input.identifier]) {
              isAssumedMasterEqualToForkState = true;
            }
            if (forkStateFullDoc && assumedMaster && isAssumedMasterEqualToForkState === false || forkStateFullDoc && !assumedMaster) {
              return PROMISE_RESOLVE_VOID;
            }
            var areStatesExactlyEqual = !forkStateDocData ? false : state.input.conflictHandler.isEqual(masterState, forkStateDocData, "downstream-check-if-equal-1");
            if (forkStateDocData && areStatesExactlyEqual) {
              if (!assumedMaster || isAssumedMasterEqualToForkState === false) {
                useMetaWriteRows.push(yield getMetaWriteRow(state, forkStateDocData, assumedMaster ? assumedMaster.metaDocument : void 0));
              }
              return PROMISE_RESOLVE_VOID;
            }
            var newForkState = Object.assign({}, masterState, forkStateFullDoc ? {
              _meta: flatClone(forkStateFullDoc._meta),
              _attachments: state.hasAttachments && masterState._attachments ? masterState._attachments : {},
              _rev: getDefaultRevision()
            } : {
              _meta: {
                lwt: now()
              },
              _rev: getDefaultRevision(),
              _attachments: state.hasAttachments && masterState._attachments ? masterState._attachments : {}
            });
            if (masterState._rev) {
              var nextRevisionHeight = !forkStateFullDoc ? 1 : getHeightOfRevision(forkStateFullDoc._rev) + 1;
              newForkState._meta[state.input.identifier] = nextRevisionHeight;
              if (state.input.keepMeta) {
                newForkState._rev = masterState._rev;
              }
            }
            if (state.input.keepMeta && masterState._meta) {
              newForkState._meta = masterState._meta;
            }
            var forkWriteRow = {
              previous: forkStateFullDoc,
              document: newForkState
            };
            forkWriteRow.document._rev = forkWriteRow.document._rev ? forkWriteRow.document._rev : createRevision(identifierHash, forkWriteRow.previous);
            writeRowsToFork.push(forkWriteRow);
            writeRowsToForkById[docId] = forkWriteRow;
            writeRowsToMeta[docId] = yield getMetaWriteRow(state, masterState, assumedMaster ? assumedMaster.metaDocument : void 0);
          })));
        }).then(() => __async(null, null, function* () {
          if (writeRowsToFork.length > 0) {
            return state.input.forkInstance.bulkWrite(writeRowsToFork, yield state.downstreamBulkWriteFlag).then((forkWriteResult) => {
              var success = getWrittenDocumentsFromBulkWriteResponse(state.primaryPath, writeRowsToFork, forkWriteResult);
              success.forEach((doc) => {
                var docId = doc[primaryPath];
                state.events.processed.down.next(writeRowsToForkById[docId]);
                useMetaWriteRows.push(writeRowsToMeta[docId]);
              });
              var mustThrow;
              forkWriteResult.error.forEach((error) => {
                if (error.status === 409) {
                  return;
                }
                var throwMe = newRxError("RC_PULL", {
                  writeError: error
                });
                state.events.error.next(throwMe);
                mustThrow = throwMe;
              });
              if (mustThrow) {
                throw mustThrow;
              }
            });
          }
        })).then(() => {
          if (useMetaWriteRows.length > 0) {
            return state.input.metaInstance.bulkWrite(stripAttachmentsDataFromMetaWriteRows(state, useMetaWriteRows), "replication-down-write-meta").then((metaWriteResult) => {
              metaWriteResult.error.forEach((writeError) => {
                state.events.error.next(newRxError("RC_PULL", {
                  id: writeError.documentId,
                  writeError
                }));
              });
            });
          }
        }).then(() => {
          setCheckpoint(state, "down", useCheckpoint);
        });
      }).catch((unhandledError) => state.events.error.next(unhandledError));
      return persistenceQueue;
    }
  });
}

// node_modules/rxdb/dist/esm/replication-protocol/conflicts.js
function resolveConflictError(state, input, forkState) {
  return __async(this, null, function* () {
    var conflictHandler = state.input.conflictHandler;
    var isEqual = conflictHandler.isEqual(input.realMasterState, input.newDocumentState, "replication-resolve-conflict");
    if (isEqual) {
      return void 0;
    } else {
      var resolved = yield conflictHandler.resolve(input, "replication-resolve-conflict");
      var resolvedDoc = Object.assign({}, resolved, {
        /**
         * Because the resolved conflict is written to the fork,
         * we have to keep/update the forks _meta data, not the masters.
         */
        _meta: flatClone(forkState._meta),
        _rev: getDefaultRevision(),
        _attachments: flatClone(forkState._attachments)
      });
      resolvedDoc._meta.lwt = now();
      resolvedDoc._rev = createRevision(yield state.checkpointKey, forkState);
      return resolvedDoc;
    }
  });
}

// node_modules/rxdb/dist/esm/plugins/attachments/attachments-utils.js
function assignMethodsToAttachment(attachment) {
  Object.entries(attachment.doc.collection.attachments).forEach(([funName, fun]) => {
    Object.defineProperty(attachment, funName, {
      get: () => fun.bind(attachment)
    });
  });
}
function fillWriteDataForAttachmentsChange(primaryPath, storageInstance, newDocument, originalDocument) {
  return __async(this, null, function* () {
    if (!newDocument._attachments || originalDocument && !originalDocument._attachments) {
      throw new Error("_attachments missing");
    }
    var docId = newDocument[primaryPath];
    var originalAttachmentsIds = new Set(originalDocument && originalDocument._attachments ? Object.keys(originalDocument._attachments) : []);
    yield Promise.all(Object.entries(newDocument._attachments).map((_0) => __async(null, [_0], function* ([key, value]) {
      if ((!originalAttachmentsIds.has(key) || originalDocument && ensureNotFalsy(originalDocument._attachments)[key].digest !== value.digest) && !value.data) {
        var attachmentDataString = yield storageInstance.getAttachmentData(docId, key, value.digest);
        value.data = attachmentDataString;
      }
    })));
    return newDocument;
  });
}

// node_modules/rxdb/dist/esm/plugins/attachments/index.js
var RxAttachment = function() {
  function RxAttachment2({
    doc,
    id,
    type,
    length,
    digest
  }) {
    this.doc = doc;
    this.id = id;
    this.type = type;
    this.length = length;
    this.digest = digest;
    assignMethodsToAttachment(this);
  }
  var _proto = RxAttachment2.prototype;
  _proto.remove = function remove() {
    return this.doc.collection.incrementalWriteQueue.addWrite(this.doc._data, (docWriteData) => {
      delete docWriteData._attachments[this.id];
      return docWriteData;
    }).then(() => {
    });
  };
  _proto.getData = function getData() {
    return __async(this, null, function* () {
      var plainDataBase64 = yield this.getDataBase64();
      var ret = yield createBlobFromBase64(plainDataBase64, this.type);
      return ret;
    });
  };
  _proto.getStringData = function getStringData() {
    return __async(this, null, function* () {
      var data = yield this.getData();
      var asString = yield blobToString(data);
      return asString;
    });
  };
  _proto.getDataBase64 = function getDataBase64() {
    return __async(this, null, function* () {
      var plainDataBase64 = yield this.doc.collection.storageInstance.getAttachmentData(this.doc.primary, this.id, this.digest);
      return plainDataBase64;
    });
  };
  return RxAttachment2;
}();

// node_modules/rxdb/dist/esm/replication-protocol/upstream.js
function startReplicationUpstream(state) {
  return __async(this, null, function* () {
    if (state.input.initialCheckpoint && state.input.initialCheckpoint.upstream) {
      var checkpointDoc = yield getLastCheckpointDoc(state, "up");
      if (!checkpointDoc) {
        yield setCheckpoint(state, "up", state.input.initialCheckpoint.upstream);
      }
    }
    var replicationHandler = state.input.replicationHandler;
    state.streamQueue.up = state.streamQueue.up.then(() => {
      return upstreamInitialSync().then(() => {
        return processTasks();
      });
    });
    var timer = 0;
    var initialSyncStartTime = -1;
    var openTasks = [];
    var persistenceQueue = PROMISE_RESOLVE_FALSE;
    var nonPersistedFromMaster = {
      docs: {}
    };
    var sub = state.input.forkInstance.changeStream().subscribe((eventBulk) => {
      if (state.events.paused.getValue()) {
        return;
      }
      state.stats.up.forkChangeStreamEmit = state.stats.up.forkChangeStreamEmit + 1;
      openTasks.push({
        task: eventBulk,
        time: timer++
      });
      if (!state.events.active.up.getValue()) {
        state.events.active.up.next(true);
      }
      if (state.input.waitBeforePersist) {
        return state.input.waitBeforePersist().then(() => processTasks());
      } else {
        return processTasks();
      }
    });
    var subResync = replicationHandler.masterChangeStream$.pipe(filter((ev) => ev === "RESYNC")).subscribe(() => {
      openTasks.push({
        task: "RESYNC",
        time: timer++
      });
      processTasks();
    });
    firstValueFrom(state.events.canceled.pipe(filter((canceled) => !!canceled))).then(() => {
      sub.unsubscribe();
      subResync.unsubscribe();
    });
    function upstreamInitialSync() {
      return __async(this, null, function* () {
        state.stats.up.upstreamInitialSync = state.stats.up.upstreamInitialSync + 1;
        if (state.events.canceled.getValue()) {
          return;
        }
        state.checkpointQueue = state.checkpointQueue.then(() => getLastCheckpointDoc(state, "up"));
        var lastCheckpoint = yield state.checkpointQueue;
        var promises = /* @__PURE__ */ new Set();
        var _loop = function() {
          return __async(this, null, function* () {
            initialSyncStartTime = timer++;
            if (promises.size > 3) {
              yield Promise.race(Array.from(promises));
            }
            var upResult = yield getChangedDocumentsSince(state.input.forkInstance, state.input.pushBatchSize, lastCheckpoint);
            if (upResult.documents.length === 0) {
              return 1;
            }
            lastCheckpoint = stackCheckpoints([lastCheckpoint, upResult.checkpoint]);
            var promise = persistToMaster(upResult.documents, ensureNotFalsy(lastCheckpoint));
            promises.add(promise);
            promise.catch().then(() => promises.delete(promise));
          });
        };
        while (!state.events.canceled.getValue()) {
          if (yield _loop()) break;
        }
        var resolvedPromises = yield Promise.all(promises);
        var hadConflicts = resolvedPromises.find((r) => !!r);
        if (hadConflicts) {
          yield upstreamInitialSync();
        } else if (!state.firstSyncDone.up.getValue() && !state.events.canceled.getValue()) {
          state.firstSyncDone.up.next(true);
        }
      });
    }
    function processTasks() {
      if (state.events.canceled.getValue() || openTasks.length === 0) {
        state.events.active.up.next(false);
        return;
      }
      state.stats.up.processTasks = state.stats.up.processTasks + 1;
      state.events.active.up.next(true);
      state.streamQueue.up = state.streamQueue.up.then(() => __async(null, null, function* () {
        var docs = [];
        var checkpoint;
        while (openTasks.length > 0) {
          var taskWithTime = ensureNotFalsy(openTasks.shift());
          if (taskWithTime.time < initialSyncStartTime) {
            continue;
          }
          if (taskWithTime.task === "RESYNC") {
            state.events.active.up.next(false);
            yield upstreamInitialSync();
            return;
          }
          if (taskWithTime.task.context !== (yield state.downstreamBulkWriteFlag)) {
            appendToArray(docs, taskWithTime.task.events.map((r) => {
              return r.documentData;
            }));
          }
          checkpoint = stackCheckpoints([checkpoint, taskWithTime.task.checkpoint]);
        }
        yield persistToMaster(docs, checkpoint);
        if (openTasks.length === 0) {
          state.events.active.up.next(false);
        } else {
          return processTasks();
        }
      }));
    }
    function persistToMaster(docs, checkpoint) {
      state.stats.up.persistToMaster = state.stats.up.persistToMaster + 1;
      docs.forEach((docData) => {
        var docId = docData[state.primaryPath];
        nonPersistedFromMaster.docs[docId] = docData;
      });
      nonPersistedFromMaster.checkpoint = checkpoint;
      persistenceQueue = persistenceQueue.then(() => __async(null, null, function* () {
        if (state.events.canceled.getValue()) {
          return false;
        }
        var upDocsById = nonPersistedFromMaster.docs;
        nonPersistedFromMaster.docs = {};
        var useCheckpoint = nonPersistedFromMaster.checkpoint;
        var docIds = Object.keys(upDocsById);
        function rememberCheckpointBeforeReturn() {
          return setCheckpoint(state, "up", useCheckpoint);
        }
        ;
        if (docIds.length === 0) {
          rememberCheckpointBeforeReturn();
          return false;
        }
        var assumedMasterState = yield getAssumedMasterState(state, docIds);
        var writeRowsToMaster = {};
        var writeRowsToMasterIds = [];
        var writeRowsToMeta = {};
        var forkStateById = {};
        yield Promise.all(docIds.map((docId) => __async(null, null, function* () {
          var fullDocData = upDocsById[docId];
          forkStateById[docId] = fullDocData;
          var docData = writeDocToDocState(fullDocData, state.hasAttachments, !!state.input.keepMeta);
          var assumedMasterDoc = assumedMasterState[docId];
          if (assumedMasterDoc && // if the isResolvedConflict is correct, we do not have to compare the documents.
          assumedMasterDoc.metaDocument.isResolvedConflict !== fullDocData._rev && state.input.conflictHandler.isEqual(assumedMasterDoc.docData, docData, "upstream-check-if-equal") || /**
           * If the master works with _rev fields,
           * we use that to check if our current doc state
           * is different from the assumedMasterDoc.
           */
          assumedMasterDoc && assumedMasterDoc.docData._rev && getHeightOfRevision(fullDocData._rev) === fullDocData._meta[state.input.identifier]) {
            return;
          }
          writeRowsToMasterIds.push(docId);
          writeRowsToMaster[docId] = {
            assumedMasterState: assumedMasterDoc ? assumedMasterDoc.docData : void 0,
            newDocumentState: docData
          };
          writeRowsToMeta[docId] = yield getMetaWriteRow(state, docData, assumedMasterDoc ? assumedMasterDoc.metaDocument : void 0);
        })));
        if (writeRowsToMasterIds.length === 0) {
          rememberCheckpointBeforeReturn();
          return false;
        }
        var writeRowsArray = Object.values(writeRowsToMaster);
        var conflictIds = /* @__PURE__ */ new Set();
        var conflictsById = {};
        var writeBatches = batchArray(writeRowsArray, state.input.pushBatchSize);
        yield Promise.all(writeBatches.map((writeBatch) => __async(null, null, function* () {
          if (state.hasAttachments) {
            yield Promise.all(writeBatch.map((row) => __async(null, null, function* () {
              row.newDocumentState = yield fillWriteDataForAttachmentsChange(state.primaryPath, state.input.forkInstance, clone(row.newDocumentState), row.assumedMasterState);
            })));
          }
          var masterWriteResult = yield replicationHandler.masterWrite(writeBatch);
          masterWriteResult.forEach((conflictDoc) => {
            var id = conflictDoc[state.primaryPath];
            conflictIds.add(id);
            conflictsById[id] = conflictDoc;
          });
        })));
        var useWriteRowsToMeta = [];
        writeRowsToMasterIds.forEach((docId) => {
          if (!conflictIds.has(docId)) {
            state.events.processed.up.next(writeRowsToMaster[docId]);
            useWriteRowsToMeta.push(writeRowsToMeta[docId]);
          }
        });
        if (state.events.canceled.getValue()) {
          return false;
        }
        if (useWriteRowsToMeta.length > 0) {
          yield state.input.metaInstance.bulkWrite(stripAttachmentsDataFromMetaWriteRows(state, useWriteRowsToMeta), "replication-up-write-meta");
        }
        var hadConflictWrites = false;
        if (conflictIds.size > 0) {
          state.stats.up.persistToMasterHadConflicts = state.stats.up.persistToMasterHadConflicts + 1;
          var conflictWriteFork = [];
          var conflictWriteMeta = {};
          yield Promise.all(Object.entries(conflictsById).map(([docId, realMasterState]) => {
            var writeToMasterRow = writeRowsToMaster[docId];
            var input = {
              newDocumentState: writeToMasterRow.newDocumentState,
              assumedMasterState: writeToMasterRow.assumedMasterState,
              realMasterState
            };
            return resolveConflictError(state, input, forkStateById[docId]).then((resolved) => __async(null, null, function* () {
              if (resolved) {
                state.events.resolvedConflicts.next({
                  input,
                  output: resolved
                });
                conflictWriteFork.push({
                  previous: forkStateById[docId],
                  document: resolved
                });
                var assumedMasterDoc = assumedMasterState[docId];
                conflictWriteMeta[docId] = yield getMetaWriteRow(state, ensureNotFalsy(realMasterState), assumedMasterDoc ? assumedMasterDoc.metaDocument : void 0, resolved._rev);
              }
            }));
          }));
          if (conflictWriteFork.length > 0) {
            hadConflictWrites = true;
            state.stats.up.persistToMasterConflictWrites = state.stats.up.persistToMasterConflictWrites + 1;
            var forkWriteResult = yield state.input.forkInstance.bulkWrite(conflictWriteFork, "replication-up-write-conflict");
            var mustThrow;
            forkWriteResult.error.forEach((error) => {
              if (error.status === 409) {
                return;
              }
              var throwMe = newRxError("RC_PUSH", {
                writeError: error
              });
              state.events.error.next(throwMe);
              mustThrow = throwMe;
            });
            if (mustThrow) {
              throw mustThrow;
            }
            var useMetaWrites = [];
            var success = getWrittenDocumentsFromBulkWriteResponse(state.primaryPath, conflictWriteFork, forkWriteResult);
            success.forEach((docData) => {
              var docId = docData[state.primaryPath];
              useMetaWrites.push(conflictWriteMeta[docId]);
            });
            if (useMetaWrites.length > 0) {
              yield state.input.metaInstance.bulkWrite(stripAttachmentsDataFromMetaWriteRows(state, useMetaWrites), "replication-up-write-conflict-meta");
            }
          }
        }
        rememberCheckpointBeforeReturn();
        return hadConflictWrites;
      })).catch((unhandledError) => {
        state.events.error.next(unhandledError);
        return false;
      });
      return persistenceQueue;
    }
  });
}

// node_modules/rxdb/dist/esm/replication-protocol/index.js
function replicateRxStorageInstance(input) {
  input = flatClone(input);
  input.forkInstance = getUnderlyingPersistentStorage(input.forkInstance);
  input.metaInstance = getUnderlyingPersistentStorage(input.metaInstance);
  var checkpointKeyPromise = getCheckpointKey(input);
  var state = {
    primaryPath: getPrimaryFieldOfPrimaryKey(input.forkInstance.schema.primaryKey),
    hasAttachments: !!input.forkInstance.schema.attachments,
    input,
    checkpointKey: checkpointKeyPromise,
    downstreamBulkWriteFlag: checkpointKeyPromise.then((checkpointKey) => "replication-downstream-" + checkpointKey),
    events: {
      canceled: new BehaviorSubject(false),
      paused: new BehaviorSubject(false),
      active: {
        down: new BehaviorSubject(true),
        up: new BehaviorSubject(true)
      },
      processed: {
        down: new Subject(),
        up: new Subject()
      },
      resolvedConflicts: new Subject(),
      error: new Subject()
    },
    stats: {
      down: {
        addNewTask: 0,
        downstreamProcessChanges: 0,
        downstreamResyncOnce: 0,
        masterChangeStreamEmit: 0,
        persistFromMaster: 0
      },
      up: {
        forkChangeStreamEmit: 0,
        persistToMaster: 0,
        persistToMasterConflictWrites: 0,
        persistToMasterHadConflicts: 0,
        processTasks: 0,
        upstreamInitialSync: 0
      }
    },
    firstSyncDone: {
      down: new BehaviorSubject(false),
      up: new BehaviorSubject(false)
    },
    streamQueue: {
      down: PROMISE_RESOLVE_VOID,
      up: PROMISE_RESOLVE_VOID
    },
    checkpointQueue: PROMISE_RESOLVE_VOID,
    lastCheckpointDoc: {}
  };
  startReplicationDownstream(state);
  startReplicationUpstream(state);
  return state;
}
function awaitRxStorageReplicationFirstInSync(state) {
  return firstValueFrom(combineLatest([state.firstSyncDone.down.pipe(filter((v) => !!v)), state.firstSyncDone.up.pipe(filter((v) => !!v))])).then(() => {
  });
}
function awaitRxStorageReplicationInSync(replicationState) {
  return Promise.all([replicationState.streamQueue.up, replicationState.streamQueue.down, replicationState.checkpointQueue]);
}
function awaitRxStorageReplicationIdle(state) {
  return __async(this, null, function* () {
    yield awaitRxStorageReplicationFirstInSync(state);
    while (true) {
      var {
        down,
        up
      } = state.streamQueue;
      yield Promise.all([up, down]);
      if (down === state.streamQueue.down && up === state.streamQueue.up) {
        return;
      }
    }
  });
}
function rxStorageInstanceToReplicationHandler(instance, conflictHandler, databaseInstanceToken, keepMeta = false) {
  instance = getUnderlyingPersistentStorage(instance);
  var hasAttachments = !!instance.schema.attachments;
  var primaryPath = getPrimaryFieldOfPrimaryKey(instance.schema.primaryKey);
  var replicationHandler = {
    masterChangeStream$: instance.changeStream().pipe(mergeMap((eventBulk) => __async(null, null, function* () {
      var ret = {
        checkpoint: eventBulk.checkpoint,
        documents: yield Promise.all(eventBulk.events.map((event) => __async(null, null, function* () {
          var docData = writeDocToDocState(event.documentData, hasAttachments, keepMeta);
          if (hasAttachments) {
            docData = yield fillWriteDataForAttachmentsChange(
              primaryPath,
              instance,
              clone(docData),
              /**
               * Notice that the master never knows
               * the client state of the document.
               * Therefore we always send all attachments data.
               */
              void 0
            );
          }
          return docData;
        })))
      };
      return ret;
    }))),
    masterChangesSince(checkpoint, batchSize) {
      return getChangedDocumentsSince(instance, batchSize, checkpoint).then((result) => __async(null, null, function* () {
        return {
          checkpoint: result.documents.length > 0 ? result.checkpoint : checkpoint,
          documents: yield Promise.all(result.documents.map((plainDocumentData) => __async(null, null, function* () {
            var docData = writeDocToDocState(plainDocumentData, hasAttachments, keepMeta);
            if (hasAttachments) {
              docData = yield fillWriteDataForAttachmentsChange(
                primaryPath,
                instance,
                clone(docData),
                /**
                 * Notice the the master never knows
                 * the client state of the document.
                 * Therefore we always send all attachments data.
                 */
                void 0
              );
            }
            return docData;
          })))
        };
      }));
    },
    masterWrite(rows) {
      return __async(this, null, function* () {
        var rowById = {};
        rows.forEach((row) => {
          var docId = row.newDocumentState[primaryPath];
          rowById[docId] = row;
        });
        var ids = Object.keys(rowById);
        var masterDocsStateList = yield instance.findDocumentsById(ids, true);
        var masterDocsState = /* @__PURE__ */ new Map();
        masterDocsStateList.forEach((doc) => masterDocsState.set(doc[primaryPath], doc));
        var conflicts = [];
        var writeRows = [];
        yield Promise.all(Object.entries(rowById).map(([id, row]) => {
          var masterState = masterDocsState.get(id);
          if (!masterState) {
            writeRows.push({
              document: docStateToWriteDoc(databaseInstanceToken, hasAttachments, keepMeta, row.newDocumentState)
            });
          } else if (masterState && !row.assumedMasterState) {
            conflicts.push(writeDocToDocState(masterState, hasAttachments, keepMeta));
          } else if (conflictHandler.isEqual(writeDocToDocState(masterState, hasAttachments, keepMeta), ensureNotFalsy(row.assumedMasterState), "rxStorageInstanceToReplicationHandler-masterWrite") === true) {
            writeRows.push({
              previous: masterState,
              document: docStateToWriteDoc(databaseInstanceToken, hasAttachments, keepMeta, row.newDocumentState, masterState)
            });
          } else {
            conflicts.push(writeDocToDocState(masterState, hasAttachments, keepMeta));
          }
        }));
        if (writeRows.length > 0) {
          var result = yield instance.bulkWrite(writeRows, "replication-master-write");
          result.error.forEach((err) => {
            if (err.status !== 409) {
              throw newRxError("SNH", {
                name: "non conflict error",
                error: err
              });
            } else {
              conflicts.push(writeDocToDocState(ensureNotFalsy(err.documentInDb), hasAttachments, keepMeta));
            }
          });
        }
        return conflicts;
      });
    }
  };
  return replicationHandler;
}
function cancelRxStorageReplication(replicationState) {
  return __async(this, null, function* () {
    replicationState.events.canceled.next(true);
    replicationState.events.active.up.complete();
    replicationState.events.active.down.complete();
    replicationState.events.processed.up.complete();
    replicationState.events.processed.down.complete();
    replicationState.events.resolvedConflicts.complete();
    replicationState.events.canceled.complete();
    yield replicationState.checkpointQueue;
  });
}

export {
  addRxPlugin,
  getLastCheckpointDoc,
  setCheckpoint,
  getCheckpointKey,
  docStateToWriteDoc,
  writeDocToDocState,
  stripAttachmentsDataFromMetaWriteRows,
  getUnderlyingPersistentStorage,
  META_INSTANCE_SCHEMA_TITLE,
  getRxReplicationMetaInstanceSchema,
  getAssumedMasterState,
  getMetaWriteRow,
  startReplicationDownstream,
  resolveConflictError,
  startReplicationUpstream,
  replicateRxStorageInstance,
  awaitRxStorageReplicationFirstInSync,
  awaitRxStorageReplicationInSync,
  awaitRxStorageReplicationIdle,
  rxStorageInstanceToReplicationHandler,
  cancelRxStorageReplication
};
//# sourceMappingURL=chunk-REWEYEVE.js.map
