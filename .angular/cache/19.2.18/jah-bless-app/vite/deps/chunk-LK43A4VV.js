import {
  INTERNAL_STORAGE_NAME,
  ObliviousSet,
  flatCloneDocWithMeta,
  getQueryMatcher,
  getSingleDocument,
  getSortComparator,
  getWrappedStorageInstance,
  getWrittenDocumentsFromBulkWriteResponse,
  normalizeMangoQuery,
  prepareQuery,
  runAsyncPluginHooks,
  runPluginHooks,
  runQueryUpdateFunction,
  stripAttachmentsDataFromDocument,
  throwIfIsStorageWriteError,
  writeSingle
} from "./chunk-FKGUJVD6.js";
import {
  NON_PREMIUM_COLLECTION_LIMIT,
  PROMISE_RESOLVE_FALSE,
  PROMISE_RESOLVE_NULL,
  PROMISE_RESOLVE_VOID,
  RXDB_VERSION,
  RXJS_SHARE_REPLAY_DEFAULTS,
  _createClass,
  appendToArray,
  areRxDocumentArraysEqual,
  clone,
  createRevision,
  deepEqual,
  defaultHashSha256,
  ensureNotFalsy,
  fillObjectWithDefaults,
  fillPrimaryKey,
  fillWithDefaultSettings,
  flatClone,
  getComposedPrimaryKeyOfDocumentData,
  getDefaultRevision,
  getDefaultRxDocumentMeta,
  getFinalFields,
  getFromMapOrCreate,
  getFromMapOrThrow,
  getHeightOfRevision,
  getPrimaryFieldOfPrimaryKey,
  getProperty,
  getSchemaByObjectPath,
  hasPremiumFlag,
  isBulkWriteConflictError,
  isMaybeReadonlyArray,
  newRxError,
  newRxTypeError,
  nextTick,
  normalizeRxJsonSchema,
  now,
  overwritable,
  overwriteGetterForCaching,
  pluginMissing,
  promiseSeries,
  randomToken,
  requestIdlePromise,
  requestIdlePromiseNoQueue,
  rxStorageWriteErrorToRxError,
  sortObject,
  stripMetaDataFromDocument,
  trimDots,
  ucfirst
} from "./chunk-GXT3KPMX.js";
import {
  merge
} from "./chunk-WCYHURJF.js";
import {
  BehaviorSubject,
  Subject,
  distinctUntilChanged,
  filter,
  map,
  mergeMap,
  shareReplay,
  startWith
} from "./chunk-3TXA6K3X.js";
import {
  __async
} from "./chunk-7RSYZEEK.js";

// node_modules/rxdb/dist/esm/rx-schema.js
var RxSchema = function() {
  function RxSchema2(jsonSchema, hashFunction) {
    this.jsonSchema = jsonSchema;
    this.hashFunction = hashFunction;
    this.indexes = getIndexes(this.jsonSchema);
    this.primaryPath = getPrimaryFieldOfPrimaryKey(this.jsonSchema.primaryKey);
    if (!jsonSchema.properties[this.primaryPath].maxLength) {
      throw newRxError("SC39", {
        schema: jsonSchema
      });
    }
    this.finalFields = getFinalFields(this.jsonSchema);
  }
  var _proto = RxSchema2.prototype;
  _proto.validateChange = function validateChange(dataBefore, dataAfter) {
    this.finalFields.forEach((fieldName) => {
      if (!deepEqual(dataBefore[fieldName], dataAfter[fieldName])) {
        throw newRxError("DOC9", {
          dataBefore,
          dataAfter,
          fieldName,
          schema: this.jsonSchema
        });
      }
    });
  };
  _proto.getDocumentPrototype = function getDocumentPrototype2() {
    var proto = {};
    var pathProperties = getSchemaByObjectPath(this.jsonSchema, "");
    Object.keys(pathProperties).forEach((key) => {
      var fullPath = key;
      proto.__defineGetter__(key, function() {
        if (!this.get || typeof this.get !== "function") {
          return void 0;
        }
        var ret = this.get(fullPath);
        return ret;
      });
      Object.defineProperty(proto, key + "$", {
        get: function() {
          return this.get$(fullPath);
        },
        enumerable: false,
        configurable: false
      });
      Object.defineProperty(proto, key + "$$", {
        get: function() {
          return this.get$$(fullPath);
        },
        enumerable: false,
        configurable: false
      });
      Object.defineProperty(proto, key + "_", {
        get: function() {
          return this.populate(fullPath);
        },
        enumerable: false,
        configurable: false
      });
    });
    overwriteGetterForCaching(this, "getDocumentPrototype", () => proto);
    return proto;
  };
  _proto.getPrimaryOfDocumentData = function getPrimaryOfDocumentData(documentData) {
    return getComposedPrimaryKeyOfDocumentData(this.jsonSchema, documentData);
  };
  return _createClass(RxSchema2, [{
    key: "version",
    get: function() {
      return this.jsonSchema.version;
    }
  }, {
    key: "defaultValues",
    get: function() {
      var values = {};
      Object.entries(this.jsonSchema.properties).filter(([, v]) => Object.prototype.hasOwnProperty.call(v, "default")).forEach(([k, v]) => values[k] = v.default);
      return overwriteGetterForCaching(this, "defaultValues", values);
    }
    /**
     * @overrides itself on the first call
     */
  }, {
    key: "hash",
    get: function() {
      return overwriteGetterForCaching(this, "hash", this.hashFunction(JSON.stringify(this.jsonSchema)));
    }
  }]);
}();
function getIndexes(jsonSchema) {
  return (jsonSchema.indexes || []).map((index) => isMaybeReadonlyArray(index) ? index : [index]);
}
function getPreviousVersions(schema) {
  var version = schema.version ? schema.version : 0;
  var c = 0;
  return new Array(version).fill(0).map(() => c++);
}
function createRxSchema(jsonSchema, hashFunction, runPreCreateHooks = true) {
  if (runPreCreateHooks) {
    runPluginHooks("preCreateRxSchema", jsonSchema);
  }
  var useJsonSchema = fillWithDefaultSettings(jsonSchema);
  useJsonSchema = normalizeRxJsonSchema(useJsonSchema);
  overwritable.deepFreezeWhenDevMode(useJsonSchema);
  var schema = new RxSchema(useJsonSchema, hashFunction);
  runPluginHooks("createRxSchema", schema);
  return schema;
}
function isRxSchema(obj) {
  return obj instanceof RxSchema;
}
function toTypedRxJsonSchema(schema) {
  return schema;
}

// node_modules/rxdb/dist/esm/rx-change-event.js
function getDocumentDataOfRxChangeEvent(rxChangeEvent) {
  if (rxChangeEvent.documentData) {
    return rxChangeEvent.documentData;
  } else {
    return rxChangeEvent.previousDocumentData;
  }
}
function rxChangeEventToEventReduceChangeEvent(rxChangeEvent) {
  switch (rxChangeEvent.operation) {
    case "INSERT":
      return {
        operation: rxChangeEvent.operation,
        id: rxChangeEvent.documentId,
        doc: rxChangeEvent.documentData,
        previous: null
      };
    case "UPDATE":
      return {
        operation: rxChangeEvent.operation,
        id: rxChangeEvent.documentId,
        doc: overwritable.deepFreezeWhenDevMode(rxChangeEvent.documentData),
        previous: rxChangeEvent.previousDocumentData ? rxChangeEvent.previousDocumentData : "UNKNOWN"
      };
    case "DELETE":
      return {
        operation: rxChangeEvent.operation,
        id: rxChangeEvent.documentId,
        doc: null,
        previous: rxChangeEvent.previousDocumentData
      };
  }
}
function flattenEvents(input) {
  var output = [];
  if (Array.isArray(input)) {
    input.forEach((inputItem) => {
      var add = flattenEvents(inputItem);
      appendToArray(output, add);
    });
  } else {
    if (input.id && input.events) {
      input.events.forEach((ev) => output.push(ev));
    } else {
      output.push(input);
    }
  }
  var usedIds = /* @__PURE__ */ new Set();
  var nonDuplicate = [];
  function getEventId(ev) {
    return [ev.documentId, ev.documentData ? ev.documentData._rev : "", ev.previousDocumentData ? ev.previousDocumentData._rev : ""].join("|");
  }
  output.forEach((ev) => {
    var eventId = getEventId(ev);
    if (!usedIds.has(eventId)) {
      usedIds.add(eventId);
      nonDuplicate.push(ev);
    }
  });
  return nonDuplicate;
}
var EVENT_BULK_CACHE = /* @__PURE__ */ new Map();
function rxChangeEventBulkToRxChangeEvents(eventBulk) {
  return getFromMapOrCreate(EVENT_BULK_CACHE, eventBulk, () => {
    var events = new Array(eventBulk.events.length);
    var rawEvents = eventBulk.events;
    var collectionName = eventBulk.collectionName;
    var isLocal = eventBulk.isLocal;
    var deepFreezeWhenDevMode = overwritable.deepFreezeWhenDevMode;
    for (var index = 0; index < rawEvents.length; index++) {
      var event = rawEvents[index];
      events[index] = {
        documentId: event.documentId,
        collectionName,
        isLocal,
        operation: event.operation,
        documentData: deepFreezeWhenDevMode(event.documentData),
        previousDocumentData: deepFreezeWhenDevMode(event.previousDocumentData)
      };
    }
    return events;
  });
}

// node_modules/rxdb/dist/esm/incremental-write.js
var IncrementalWriteQueue = function() {
  function IncrementalWriteQueue2(storageInstance, primaryPath, preWrite, postWrite) {
    this.queueByDocId = /* @__PURE__ */ new Map();
    this.isRunning = false;
    this.storageInstance = storageInstance;
    this.primaryPath = primaryPath;
    this.preWrite = preWrite;
    this.postWrite = postWrite;
  }
  var _proto = IncrementalWriteQueue2.prototype;
  _proto.addWrite = function addWrite(lastKnownDocumentState, modifier) {
    var docId = lastKnownDocumentState[this.primaryPath];
    var ar = getFromMapOrCreate(this.queueByDocId, docId, () => []);
    var ret = new Promise((resolve, reject) => {
      var item = {
        lastKnownDocumentState,
        modifier,
        resolve,
        reject
      };
      ensureNotFalsy(ar).push(item);
      this.triggerRun();
    });
    return ret;
  };
  _proto.triggerRun = function triggerRun() {
    return __async(this, null, function* () {
      if (this.isRunning === true || this.queueByDocId.size === 0) {
        return;
      }
      this.isRunning = true;
      var writeRows = [];
      var itemsById = this.queueByDocId;
      this.queueByDocId = /* @__PURE__ */ new Map();
      yield Promise.all(Array.from(itemsById.entries()).map((_0) => __async(this, [_0], function* ([_docId, items]) {
        var oldData = findNewestOfDocumentStates(items.map((i) => i.lastKnownDocumentState));
        var newData = oldData;
        for (var item of items) {
          try {
            newData = yield item.modifier(
              /**
               * We have to clone() each time because the modifier
               * might throw while it already changed some properties
               * of the document.
               */
              clone(newData)
            );
          } catch (err) {
            item.reject(err);
            item.reject = () => {
            };
            item.resolve = () => {
            };
          }
        }
        try {
          yield this.preWrite(newData, oldData);
        } catch (err) {
          items.forEach((item2) => item2.reject(err));
          return;
        }
        writeRows.push({
          previous: oldData,
          document: newData
        });
      })));
      var writeResult = writeRows.length > 0 ? yield this.storageInstance.bulkWrite(writeRows, "incremental-write") : {
        error: []
      };
      yield Promise.all(getWrittenDocumentsFromBulkWriteResponse(this.primaryPath, writeRows, writeResult).map((result) => {
        var docId = result[this.primaryPath];
        this.postWrite(result);
        var items = getFromMapOrThrow(itemsById, docId);
        items.forEach((item) => item.resolve(result));
      }));
      writeResult.error.forEach((error) => {
        var docId = error.documentId;
        var items = getFromMapOrThrow(itemsById, docId);
        var isConflict = isBulkWriteConflictError(error);
        if (isConflict) {
          var ar = getFromMapOrCreate(this.queueByDocId, docId, () => []);
          items.reverse().forEach((item) => {
            item.lastKnownDocumentState = ensureNotFalsy(isConflict.documentInDb);
            ensureNotFalsy(ar).unshift(item);
          });
        } else {
          var rxError = rxStorageWriteErrorToRxError(error);
          items.forEach((item) => item.reject(rxError));
        }
      });
      this.isRunning = false;
      return this.triggerRun();
    });
  };
  return IncrementalWriteQueue2;
}();
function modifierFromPublicToInternal(publicModifier) {
  var ret = (docData) => __async(null, null, function* () {
    var withoutMeta = stripMetaDataFromDocument(docData);
    withoutMeta._deleted = docData._deleted;
    var modified = yield publicModifier(withoutMeta);
    var reattachedMeta = Object.assign({}, modified, {
      _meta: docData._meta,
      _attachments: docData._attachments,
      _rev: docData._rev,
      _deleted: typeof modified._deleted !== "undefined" ? modified._deleted : docData._deleted
    });
    if (typeof reattachedMeta._deleted === "undefined") {
      reattachedMeta._deleted = false;
    }
    return reattachedMeta;
  });
  return ret;
}
function findNewestOfDocumentStates(docs) {
  var newest = docs[0];
  var newestRevisionHeight = getHeightOfRevision(newest._rev);
  docs.forEach((doc) => {
    var height = getHeightOfRevision(doc._rev);
    if (height > newestRevisionHeight) {
      newest = doc;
      newestRevisionHeight = height;
    }
  });
  return newest;
}

// node_modules/rxdb/dist/esm/rx-document.js
var basePrototype = {
  get primaryPath() {
    var _this = this;
    if (!_this.isInstanceOfRxDocument) {
      return void 0;
    }
    return _this.collection.schema.primaryPath;
  },
  get primary() {
    var _this = this;
    if (!_this.isInstanceOfRxDocument) {
      return void 0;
    }
    return _this._data[_this.primaryPath];
  },
  get revision() {
    var _this = this;
    if (!_this.isInstanceOfRxDocument) {
      return void 0;
    }
    return _this._data._rev;
  },
  get deleted$() {
    var _this = this;
    if (!_this.isInstanceOfRxDocument) {
      return void 0;
    }
    return _this.$.pipe(map((d) => d._data._deleted));
  },
  get deleted$$() {
    var _this = this;
    var reactivity = _this.collection.database.getReactivityFactory();
    return reactivity.fromObservable(_this.deleted$, _this.getLatest().deleted, _this.collection.database);
  },
  get deleted() {
    var _this = this;
    if (!_this.isInstanceOfRxDocument) {
      return void 0;
    }
    return _this._data._deleted;
  },
  getLatest() {
    var latestDocData = this.collection._docCache.getLatestDocumentData(this.primary);
    return this.collection._docCache.getCachedRxDocument(latestDocData);
  },
  /**
   * returns the observable which emits the plain-data of this document
   */
  get $() {
    var _this = this;
    var id = this.primary;
    return _this.collection.eventBulks$.pipe(filter((bulk) => !bulk.isLocal), map((bulk) => bulk.events.find((ev) => ev.documentId === id)), filter((event) => !!event), map((changeEvent) => getDocumentDataOfRxChangeEvent(ensureNotFalsy(changeEvent))), startWith(_this.collection._docCache.getLatestDocumentData(id)), distinctUntilChanged((prev, curr) => prev._rev === curr._rev), map((docData) => this.collection._docCache.getCachedRxDocument(docData)), shareReplay(RXJS_SHARE_REPLAY_DEFAULTS));
  },
  get $$() {
    var _this = this;
    var reactivity = _this.collection.database.getReactivityFactory();
    return reactivity.fromObservable(_this.$, _this.getLatest()._data, _this.collection.database);
  },
  /**
   * returns observable of the value of the given path
   */
  get$(path) {
    if (overwritable.isDevMode()) {
      if (path.includes(".item.")) {
        throw newRxError("DOC1", {
          path
        });
      }
      if (path === this.primaryPath) {
        throw newRxError("DOC2");
      }
      if (this.collection.schema.finalFields.includes(path)) {
        throw newRxError("DOC3", {
          path
        });
      }
      var schemaObj = getSchemaByObjectPath(this.collection.schema.jsonSchema, path);
      if (!schemaObj) {
        throw newRxError("DOC4", {
          path
        });
      }
    }
    return this.$.pipe(map((data) => getProperty(data, path)), distinctUntilChanged());
  },
  get$$(path) {
    var obs = this.get$(path);
    var reactivity = this.collection.database.getReactivityFactory();
    return reactivity.fromObservable(obs, this.getLatest().get(path), this.collection.database);
  },
  /**
   * populate the given path
   */
  populate(path) {
    var schemaObj = getSchemaByObjectPath(this.collection.schema.jsonSchema, path);
    var value = this.get(path);
    if (!value) {
      return PROMISE_RESOLVE_NULL;
    }
    if (!schemaObj) {
      throw newRxError("DOC5", {
        path
      });
    }
    if (!schemaObj.ref) {
      throw newRxError("DOC6", {
        path,
        schemaObj
      });
    }
    var refCollection = this.collection.database.collections[schemaObj.ref];
    if (!refCollection) {
      throw newRxError("DOC7", {
        ref: schemaObj.ref,
        path,
        schemaObj
      });
    }
    if (schemaObj.type === "array") {
      return refCollection.findByIds(value).exec().then((res) => {
        var valuesIterator = res.values();
        return Array.from(valuesIterator);
      });
    } else {
      return refCollection.findOne(value).exec();
    }
  },
  /**
   * get data by objectPath
   * @hotPath Performance here is really important,
   * run some tests before changing anything.
   */
  get(objPath) {
    return getDocumentProperty(this, objPath);
  },
  toJSON(withMetaFields = false) {
    if (!withMetaFields) {
      var data = flatClone(this._data);
      delete data._rev;
      delete data._attachments;
      delete data._deleted;
      delete data._meta;
      return overwritable.deepFreezeWhenDevMode(data);
    } else {
      return overwritable.deepFreezeWhenDevMode(this._data);
    }
  },
  toMutableJSON(withMetaFields = false) {
    return clone(this.toJSON(withMetaFields));
  },
  /**
   * updates document
   * @overwritten by plugin (optional)
   * @param updateObj mongodb-like syntax
   */
  update(_updateObj) {
    throw pluginMissing("update");
  },
  incrementalUpdate(_updateObj) {
    throw pluginMissing("update");
  },
  updateCRDT(_updateObj) {
    throw pluginMissing("crdt");
  },
  putAttachment() {
    throw pluginMissing("attachments");
  },
  putAttachmentBase64() {
    throw pluginMissing("attachments");
  },
  getAttachment() {
    throw pluginMissing("attachments");
  },
  allAttachments() {
    throw pluginMissing("attachments");
  },
  get allAttachments$() {
    throw pluginMissing("attachments");
  },
  modify(mutationFunction, _context) {
    return __async(this, null, function* () {
      var oldData = this._data;
      var newData = yield modifierFromPublicToInternal(mutationFunction)(oldData);
      return this._saveData(newData, oldData);
    });
  },
  /**
   * runs an incremental update over the document
   * @param function that takes the document-data and returns a new data-object
   */
  incrementalModify(mutationFunction, _context) {
    return this.collection.incrementalWriteQueue.addWrite(this._data, modifierFromPublicToInternal(mutationFunction)).then((result) => this.collection._docCache.getCachedRxDocument(result));
  },
  patch(patch) {
    var oldData = this._data;
    var newData = clone(oldData);
    Object.entries(patch).forEach(([k, v]) => {
      newData[k] = v;
    });
    return this._saveData(newData, oldData);
  },
  /**
   * patches the given properties
   */
  incrementalPatch(patch) {
    return this.incrementalModify((docData) => {
      Object.entries(patch).forEach(([k, v]) => {
        docData[k] = v;
      });
      return docData;
    });
  },
  /**
   * saves the new document-data
   * and handles the events
   */
  _saveData(newData, oldData) {
    return __async(this, null, function* () {
      newData = flatClone(newData);
      if (this._data._deleted) {
        throw newRxError("DOC11", {
          id: this.primary,
          document: this
        });
      }
      yield beforeDocumentUpdateWrite(this.collection, newData, oldData);
      var writeRows = [{
        previous: oldData,
        document: newData
      }];
      var writeResult = yield this.collection.storageInstance.bulkWrite(writeRows, "rx-document-save-data");
      var isError = writeResult.error[0];
      throwIfIsStorageWriteError(this.collection, this.primary, newData, isError);
      yield this.collection._runHooks("post", "save", newData, this);
      return this.collection._docCache.getCachedRxDocument(getWrittenDocumentsFromBulkWriteResponse(this.collection.schema.primaryPath, writeRows, writeResult)[0]);
    });
  },
  /**
   * Remove the document.
   * Notice that there is no hard delete,
   * instead deleted documents get flagged with _deleted=true.
   */
  remove() {
    return __async(this, null, function* () {
      if (this.deleted) {
        return Promise.reject(newRxError("DOC13", {
          document: this,
          id: this.primary
        }));
      }
      var removeResult = yield this.collection.bulkRemove([this]);
      if (removeResult.error.length > 0) {
        var error = removeResult.error[0];
        throwIfIsStorageWriteError(this.collection, this.primary, this._data, error);
      }
      return removeResult.success[0];
    });
  },
  incrementalRemove() {
    return this.incrementalModify((docData) => __async(this, null, function* () {
      yield this.collection._runHooks("pre", "remove", docData, this);
      docData._deleted = true;
      return docData;
    })).then((newDoc) => __async(this, null, function* () {
      yield this.collection._runHooks("post", "remove", newDoc._data, newDoc);
      return newDoc;
    }));
  },
  close() {
    throw newRxError("DOC14");
  }
};
function createRxDocumentConstructor(proto = basePrototype) {
  var constructor = function RxDocumentConstructor(collection, docData) {
    this.collection = collection;
    this._data = docData;
    this._propertyCache = /* @__PURE__ */ new Map();
    this.isInstanceOfRxDocument = true;
  };
  constructor.prototype = proto;
  return constructor;
}
function createWithConstructor(constructor, collection, jsonData) {
  var doc = new constructor(collection, jsonData);
  runPluginHooks("createRxDocument", doc);
  return doc;
}
function isRxDocument(obj) {
  return typeof obj === "object" && obj !== null && "isInstanceOfRxDocument" in obj;
}
function beforeDocumentUpdateWrite(collection, newData, oldData) {
  newData._meta = Object.assign({}, oldData._meta, newData._meta);
  if (overwritable.isDevMode()) {
    collection.schema.validateChange(oldData, newData);
  }
  return collection._runHooks("pre", "save", newData, oldData);
}
function getDocumentProperty(doc, objPath) {
  return getFromMapOrCreate(doc._propertyCache, objPath, () => {
    var valueObj = getProperty(doc._data, objPath);
    if (typeof valueObj !== "object" || valueObj === null || Array.isArray(valueObj)) {
      return overwritable.deepFreezeWhenDevMode(valueObj);
    }
    var proxy = new Proxy(
      /**
       * In dev-mode, the _data is deep-frozen
       * so we have to flat clone here so that
       * the proxy can work.
       */
      flatClone(valueObj),
      {
        /**
         * @performance is really important here
         * because people access nested properties very often
         * and might not be aware that this is internally using a Proxy
         */
        get(target, property) {
          if (typeof property !== "string") {
            return target[property];
          }
          var lastChar2 = property.charAt(property.length - 1);
          if (lastChar2 === "$") {
            if (property.endsWith("$$")) {
              var key = property.slice(0, -2);
              return doc.get$$(trimDots(objPath + "." + key));
            } else {
              var _key = property.slice(0, -1);
              return doc.get$(trimDots(objPath + "." + _key));
            }
          } else if (lastChar2 === "_") {
            var _key2 = property.slice(0, -1);
            return doc.populate(trimDots(objPath + "." + _key2));
          } else {
            var plainValue = target[property];
            if (typeof plainValue === "number" || typeof plainValue === "string" || typeof plainValue === "boolean") {
              return plainValue;
            }
            return getDocumentProperty(doc, trimDots(objPath + "." + property));
          }
        }
      }
    );
    return proxy;
  });
}

// node_modules/rxdb/dist/esm/query-cache.js
var QueryCache = function() {
  function QueryCache2() {
    this._map = /* @__PURE__ */ new Map();
  }
  var _proto = QueryCache2.prototype;
  _proto.getByQuery = function getByQuery(rxQuery) {
    var stringRep = rxQuery.toString();
    var ret = getFromMapOrCreate(this._map, stringRep, () => rxQuery);
    return ret;
  };
  return QueryCache2;
}();
function createQueryCache() {
  return new QueryCache();
}
function uncacheRxQuery(queryCache, rxQuery) {
  rxQuery.uncached = true;
  var stringRep = rxQuery.toString();
  queryCache._map.delete(stringRep);
}
function countRxQuerySubscribers(rxQuery) {
  return rxQuery.refCount$.observers.length;
}
var DEFAULT_TRY_TO_KEEP_MAX = 100;
var DEFAULT_UNEXECUTED_LIFETIME = 30 * 1e3;
var defaultCacheReplacementPolicyMonad = (tryToKeepMax, unExecutedLifetime) => (_collection, queryCache) => {
  if (queryCache._map.size < tryToKeepMax) {
    return;
  }
  var minUnExecutedLifetime = now() - unExecutedLifetime;
  var maybeUncache = [];
  var queriesInCache = Array.from(queryCache._map.values());
  for (var rxQuery of queriesInCache) {
    if (countRxQuerySubscribers(rxQuery) > 0) {
      continue;
    }
    if (rxQuery._lastEnsureEqual === 0 && rxQuery._creationTime < minUnExecutedLifetime) {
      uncacheRxQuery(queryCache, rxQuery);
      continue;
    }
    maybeUncache.push(rxQuery);
  }
  var mustUncache = maybeUncache.length - tryToKeepMax;
  if (mustUncache <= 0) {
    return;
  }
  var sortedByLastUsage = maybeUncache.sort((a, b) => a._lastEnsureEqual - b._lastEnsureEqual);
  var toRemove = sortedByLastUsage.slice(0, mustUncache);
  toRemove.forEach((rxQuery2) => uncacheRxQuery(queryCache, rxQuery2));
};
var defaultCacheReplacementPolicy = defaultCacheReplacementPolicyMonad(DEFAULT_TRY_TO_KEEP_MAX, DEFAULT_UNEXECUTED_LIFETIME);
var COLLECTIONS_WITH_RUNNING_CLEANUP = /* @__PURE__ */ new WeakSet();
function triggerCacheReplacement(rxCollection) {
  if (COLLECTIONS_WITH_RUNNING_CLEANUP.has(rxCollection)) {
    return;
  }
  COLLECTIONS_WITH_RUNNING_CLEANUP.add(rxCollection);
  nextTick().then(() => requestIdlePromise(200)).then(() => {
    if (!rxCollection.closed) {
      rxCollection.cacheReplacementPolicy(rxCollection, rxCollection._queryCache);
    }
    COLLECTIONS_WITH_RUNNING_CLEANUP.delete(rxCollection);
  });
}

// node_modules/rxdb/dist/esm/doc-cache.js
var DocumentCache = function() {
  function DocumentCache2(primaryPath, changes$, documentCreator) {
    this.cacheItemByDocId = /* @__PURE__ */ new Map();
    this.tasks = /* @__PURE__ */ new Set();
    this.registry = typeof FinalizationRegistry === "function" ? new FinalizationRegistry((docMeta) => {
      var docId = docMeta.docId;
      var cacheItem = this.cacheItemByDocId.get(docId);
      if (cacheItem) {
        cacheItem[0].delete(docMeta.revisionHeight + docMeta.lwt + "");
        if (cacheItem[0].size === 0) {
          this.cacheItemByDocId.delete(docId);
        }
      }
    }) : void 0;
    this.primaryPath = primaryPath;
    this.changes$ = changes$;
    this.documentCreator = documentCreator;
    changes$.subscribe((events) => {
      this.tasks.add(() => {
        var cacheItemByDocId = this.cacheItemByDocId;
        for (var index = 0; index < events.length; index++) {
          var event = events[index];
          var cacheItem = cacheItemByDocId.get(event.documentId);
          if (cacheItem) {
            var documentData = event.documentData;
            if (!documentData) {
              documentData = event.previousDocumentData;
            }
            cacheItem[1] = documentData;
          }
        }
      });
      if (this.tasks.size <= 1) {
        requestIdlePromiseNoQueue().then(() => {
          this.processTasks();
        });
      }
    });
  }
  var _proto = DocumentCache2.prototype;
  _proto.processTasks = function processTasks() {
    if (this.tasks.size === 0) {
      return;
    }
    var tasks = Array.from(this.tasks);
    tasks.forEach((task) => task());
    this.tasks.clear();
  };
  _proto.getLatestDocumentData = function getLatestDocumentData(docId) {
    this.processTasks();
    var cacheItem = getFromMapOrThrow(this.cacheItemByDocId, docId);
    return cacheItem[1];
  };
  _proto.getLatestDocumentDataIfExists = function getLatestDocumentDataIfExists(docId) {
    this.processTasks();
    var cacheItem = this.cacheItemByDocId.get(docId);
    if (cacheItem) {
      return cacheItem[1];
    }
  };
  return _createClass(DocumentCache2, [{
    key: "getCachedRxDocuments",
    get: function() {
      var fn = getCachedRxDocumentMonad(this);
      return overwriteGetterForCaching(this, "getCachedRxDocuments", fn);
    }
  }, {
    key: "getCachedRxDocument",
    get: function() {
      var fn = getCachedRxDocumentMonad(this);
      return overwriteGetterForCaching(this, "getCachedRxDocument", (doc) => fn([doc])[0]);
    }
  }]);
}();
function getCachedRxDocumentMonad(docCache) {
  var primaryPath = docCache.primaryPath;
  var cacheItemByDocId = docCache.cacheItemByDocId;
  var registry = docCache.registry;
  var deepFreezeWhenDevMode = overwritable.deepFreezeWhenDevMode;
  var documentCreator = docCache.documentCreator;
  var fn = (docsData) => {
    var ret = new Array(docsData.length);
    var registryTasks = [];
    for (var index = 0; index < docsData.length; index++) {
      var docData = docsData[index];
      var docId = docData[primaryPath];
      var revisionHeight = getHeightOfRevision(docData._rev);
      var byRev = void 0;
      var cachedRxDocumentWeakRef = void 0;
      var cacheItem = cacheItemByDocId.get(docId);
      if (!cacheItem) {
        byRev = /* @__PURE__ */ new Map();
        cacheItem = [byRev, docData];
        cacheItemByDocId.set(docId, cacheItem);
      } else {
        byRev = cacheItem[0];
        cachedRxDocumentWeakRef = byRev.get(revisionHeight + docData._meta.lwt + "");
      }
      var cachedRxDocument = cachedRxDocumentWeakRef ? cachedRxDocumentWeakRef.deref() : void 0;
      if (!cachedRxDocument) {
        docData = deepFreezeWhenDevMode(docData);
        cachedRxDocument = documentCreator(docData);
        byRev.set(revisionHeight + docData._meta.lwt + "", createWeakRefWithFallback(cachedRxDocument));
        if (registry) {
          registryTasks.push(cachedRxDocument);
        }
      }
      ret[index] = cachedRxDocument;
    }
    if (registryTasks.length > 0 && registry) {
      docCache.tasks.add(() => {
        for (var _index = 0; _index < registryTasks.length; _index++) {
          var doc = registryTasks[_index];
          registry.register(doc, {
            docId: doc.primary,
            revisionHeight: getHeightOfRevision(doc.revision),
            lwt: doc._data._meta.lwt
          });
        }
      });
      if (docCache.tasks.size <= 1) {
        requestIdlePromiseNoQueue().then(() => {
          docCache.processTasks();
        });
      }
    }
    return ret;
  };
  return fn;
}
function mapDocumentsDataToCacheDocs(docCache, docsData) {
  var getCachedRxDocuments = docCache.getCachedRxDocuments;
  return getCachedRxDocuments(docsData);
}
var HAS_WEAK_REF = typeof WeakRef === "function";
var createWeakRefWithFallback = HAS_WEAK_REF ? createWeakRef : createWeakRefFallback;
function createWeakRef(obj) {
  return new WeakRef(obj);
}
function createWeakRefFallback(obj) {
  return {
    deref() {
      return obj;
    }
  };
}

// node_modules/rxdb/dist/esm/rx-query-single-result.js
var RxQuerySingleResult = function() {
  function RxQuerySingleResult2(query, docsDataFromStorageInstance, count) {
    this.time = now();
    this.query = query;
    this.count = count;
    this.documents = mapDocumentsDataToCacheDocs(this.query.collection._docCache, docsDataFromStorageInstance);
  }
  var _proto = RxQuerySingleResult2.prototype;
  _proto.getValue = function getValue(throwIfMissing) {
    var op = this.query.op;
    if (op === "count") {
      return this.count;
    } else if (op === "findOne") {
      var doc = this.documents.length === 0 ? null : this.documents[0];
      if (!doc && throwIfMissing) {
        throw newRxError("QU10", {
          collection: this.query.collection.name,
          query: this.query.mangoQuery,
          op
        });
      } else {
        return doc;
      }
    } else if (op === "findByIds") {
      return this.docsMap;
    } else {
      return this.documents.slice(0);
    }
  };
  return _createClass(RxQuerySingleResult2, [{
    key: "docsData",
    get: function() {
      return overwriteGetterForCaching(this, "docsData", this.documents.map((d) => d._data));
    }
    // A key->document map, used in the event reduce optimization.
  }, {
    key: "docsDataMap",
    get: function() {
      var map2 = /* @__PURE__ */ new Map();
      this.documents.forEach((d) => {
        map2.set(d.primary, d._data);
      });
      return overwriteGetterForCaching(this, "docsDataMap", map2);
    }
  }, {
    key: "docsMap",
    get: function() {
      var map2 = /* @__PURE__ */ new Map();
      var documents = this.documents;
      for (var i = 0; i < documents.length; i++) {
        var doc = documents[i];
        map2.set(doc.primary, doc);
      }
      return overwriteGetterForCaching(this, "docsMap", map2);
    }
  }]);
}();

// node_modules/event-reduce-js/dist/esm/src/util.js
function lastOfArray(ar) {
  return ar[ar.length - 1];
}
function isObject(value) {
  const type = typeof value;
  return value !== null && (type === "object" || type === "function");
}
function getProperty2(object, path, value) {
  if (Array.isArray(path)) {
    path = path.join(".");
  }
  if (!isObject(object) || typeof path !== "string") {
    return value === void 0 ? object : value;
  }
  const pathArray = path.split(".");
  if (pathArray.length === 0) {
    return value;
  }
  for (let index = 0; index < pathArray.length; index++) {
    const key = pathArray[index];
    if (isStringIndex(object, key)) {
      object = index === pathArray.length - 1 ? void 0 : null;
    } else {
      object = object[key];
    }
    if (object === void 0 || object === null) {
      if (index !== pathArray.length - 1) {
        return value;
      }
      break;
    }
  }
  return object === void 0 ? value : object;
}
function isStringIndex(object, key) {
  if (typeof key !== "number" && Array.isArray(object)) {
    const index = Number.parseInt(key, 10);
    return Number.isInteger(index) && object[index] === object[key];
  }
  return false;
}

// node_modules/event-reduce-js/dist/esm/src/states/state-resolver.js
var hasLimit = (input) => {
  return !!input.queryParams.limit;
};
var isFindOne = (input) => {
  return input.queryParams.limit === 1;
};
var hasSkip = (input) => {
  if (input.queryParams.skip && input.queryParams.skip > 0) {
    return true;
  } else {
    return false;
  }
};
var isDelete = (input) => {
  return input.changeEvent.operation === "DELETE";
};
var isInsert = (input) => {
  return input.changeEvent.operation === "INSERT";
};
var isUpdate = (input) => {
  return input.changeEvent.operation === "UPDATE";
};
var wasLimitReached = (input) => {
  return hasLimit(input) && input.previousResults.length >= input.queryParams.limit;
};
var sortParamsChanged = (input) => {
  const sortFields = input.queryParams.sortFields;
  const prev = input.changeEvent.previous;
  const doc = input.changeEvent.doc;
  if (!doc) {
    return false;
  }
  if (!prev) {
    return true;
  }
  for (let i = 0; i < sortFields.length; i++) {
    const field = sortFields[i];
    const beforeData = getProperty2(prev, field);
    const afterData = getProperty2(doc, field);
    if (beforeData !== afterData) {
      return true;
    }
  }
  return false;
};
var wasInResult = (input) => {
  const id = input.changeEvent.id;
  if (input.keyDocumentMap) {
    const has = input.keyDocumentMap.has(id);
    return has;
  } else {
    const primary = input.queryParams.primaryKey;
    const results = input.previousResults;
    for (let i = 0; i < results.length; i++) {
      const item = results[i];
      if (item[primary] === id) {
        return true;
      }
    }
    return false;
  }
};
var wasFirst = (input) => {
  const first = input.previousResults[0];
  if (first && first[input.queryParams.primaryKey] === input.changeEvent.id) {
    return true;
  } else {
    return false;
  }
};
var wasLast = (input) => {
  const last = lastOfArray(input.previousResults);
  if (last && last[input.queryParams.primaryKey] === input.changeEvent.id) {
    return true;
  } else {
    return false;
  }
};
var wasSortedBeforeFirst = (input) => {
  const prev = input.changeEvent.previous;
  if (!prev) {
    return false;
  }
  const first = input.previousResults[0];
  if (!first) {
    return false;
  }
  if (first[input.queryParams.primaryKey] === input.changeEvent.id) {
    return true;
  }
  const comp = input.queryParams.sortComparator(prev, first);
  return comp < 0;
};
var wasSortedAfterLast = (input) => {
  const prev = input.changeEvent.previous;
  if (!prev) {
    return false;
  }
  const last = lastOfArray(input.previousResults);
  if (!last) {
    return false;
  }
  if (last[input.queryParams.primaryKey] === input.changeEvent.id) {
    return true;
  }
  const comp = input.queryParams.sortComparator(prev, last);
  return comp > 0;
};
var isSortedBeforeFirst = (input) => {
  const doc = input.changeEvent.doc;
  if (!doc) {
    return false;
  }
  const first = input.previousResults[0];
  if (!first) {
    return false;
  }
  if (first[input.queryParams.primaryKey] === input.changeEvent.id) {
    return true;
  }
  const comp = input.queryParams.sortComparator(doc, first);
  return comp < 0;
};
var isSortedAfterLast = (input) => {
  const doc = input.changeEvent.doc;
  if (!doc) {
    return false;
  }
  const last = lastOfArray(input.previousResults);
  if (!last) {
    return false;
  }
  if (last[input.queryParams.primaryKey] === input.changeEvent.id) {
    return true;
  }
  const comp = input.queryParams.sortComparator(doc, last);
  return comp > 0;
};
var wasMatching = (input) => {
  const prev = input.changeEvent.previous;
  if (!prev) {
    return false;
  }
  return input.queryParams.queryMatcher(prev);
};
var doesMatchNow = (input) => {
  const doc = input.changeEvent.doc;
  if (!doc) {
    return false;
  }
  const ret = input.queryParams.queryMatcher(doc);
  return ret;
};
var wasResultsEmpty = (input) => {
  return input.previousResults.length === 0;
};

// node_modules/event-reduce-js/dist/esm/src/states/index.js
var stateResolveFunctionByIndex = {
  0: isInsert,
  1: isUpdate,
  2: isDelete,
  3: hasLimit,
  4: isFindOne,
  5: hasSkip,
  6: wasResultsEmpty,
  7: wasLimitReached,
  8: wasFirst,
  9: wasLast,
  10: sortParamsChanged,
  11: wasInResult,
  12: wasSortedBeforeFirst,
  13: wasSortedAfterLast,
  14: isSortedBeforeFirst,
  15: isSortedAfterLast,
  16: wasMatching,
  17: doesMatchNow
};

// node_modules/array-push-at-sort-position/dist/esm/index.js
function pushAtSortPosition(array, item, compareFunction, low) {
  var length = array.length;
  var high = length - 1;
  var mid = 0;
  if (length === 0) {
    array.push(item);
    return 0;
  }
  var lastMidDoc;
  while (low <= high) {
    mid = low + (high - low >> 1);
    lastMidDoc = array[mid];
    if (compareFunction(lastMidDoc, item) <= 0) {
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }
  if (compareFunction(lastMidDoc, item) <= 0) {
    mid++;
  }
  array.splice(mid, 0, item);
  return mid;
}

// node_modules/event-reduce-js/dist/esm/src/actions/action-functions.js
var doNothing = (_input) => {
};
var insertFirst = (input) => {
  input.previousResults.unshift(input.changeEvent.doc);
  if (input.keyDocumentMap) {
    input.keyDocumentMap.set(input.changeEvent.id, input.changeEvent.doc);
  }
};
var insertLast = (input) => {
  input.previousResults.push(input.changeEvent.doc);
  if (input.keyDocumentMap) {
    input.keyDocumentMap.set(input.changeEvent.id, input.changeEvent.doc);
  }
};
var removeFirstItem = (input) => {
  const first = input.previousResults.shift();
  if (input.keyDocumentMap && first) {
    input.keyDocumentMap.delete(first[input.queryParams.primaryKey]);
  }
};
var removeLastItem = (input) => {
  const last = input.previousResults.pop();
  if (input.keyDocumentMap && last) {
    input.keyDocumentMap.delete(last[input.queryParams.primaryKey]);
  }
};
var removeFirstInsertLast = (input) => {
  removeFirstItem(input);
  insertLast(input);
};
var removeLastInsertFirst = (input) => {
  removeLastItem(input);
  insertFirst(input);
};
var removeFirstInsertFirst = (input) => {
  removeFirstItem(input);
  insertFirst(input);
};
var removeLastInsertLast = (input) => {
  removeLastItem(input);
  insertLast(input);
};
var removeExisting = (input) => {
  if (input.keyDocumentMap) {
    input.keyDocumentMap.delete(input.changeEvent.id);
  }
  const primary = input.queryParams.primaryKey;
  const results = input.previousResults;
  for (let i = 0; i < results.length; i++) {
    const item = results[i];
    if (item[primary] === input.changeEvent.id) {
      results.splice(i, 1);
      break;
    }
  }
};
var replaceExisting = (input) => {
  const doc = input.changeEvent.doc;
  const primary = input.queryParams.primaryKey;
  const results = input.previousResults;
  for (let i = 0; i < results.length; i++) {
    const item = results[i];
    if (item[primary] === input.changeEvent.id) {
      results[i] = doc;
      if (input.keyDocumentMap) {
        input.keyDocumentMap.set(input.changeEvent.id, doc);
      }
      break;
    }
  }
};
var alwaysWrong = (input) => {
  const wrongHuman = {
    _id: "wrongHuman" + (/* @__PURE__ */ new Date()).getTime()
  };
  input.previousResults.length = 0;
  input.previousResults.push(wrongHuman);
  if (input.keyDocumentMap) {
    input.keyDocumentMap.clear();
    input.keyDocumentMap.set(wrongHuman._id, wrongHuman);
  }
};
var insertAtSortPosition = (input) => {
  const docId = input.changeEvent.id;
  const doc = input.changeEvent.doc;
  if (input.keyDocumentMap) {
    if (input.keyDocumentMap.has(docId)) {
      return;
    }
    input.keyDocumentMap.set(docId, doc);
  } else {
    const isDocInResults = input.previousResults.find((d) => d[input.queryParams.primaryKey] === docId);
    if (isDocInResults) {
      return;
    }
  }
  pushAtSortPosition(input.previousResults, doc, input.queryParams.sortComparator, 0);
};
var removeExistingAndInsertAtSortPosition = (input) => {
  removeExisting(input);
  insertAtSortPosition(input);
};
var runFullQueryAgain = (_input) => {
  throw new Error("Action runFullQueryAgain must be implemented by yourself");
};
var unknownAction = (_input) => {
  throw new Error("Action unknownAction should never be called");
};

// node_modules/event-reduce-js/dist/esm/src/actions/index.js
var orderedActionList = ["doNothing", "insertFirst", "insertLast", "removeFirstItem", "removeLastItem", "removeFirstInsertLast", "removeLastInsertFirst", "removeFirstInsertFirst", "removeLastInsertLast", "removeExisting", "replaceExisting", "alwaysWrong", "insertAtSortPosition", "removeExistingAndInsertAtSortPosition", "runFullQueryAgain", "unknownAction"];
var actionFunctions = {
  doNothing,
  insertFirst,
  insertLast,
  removeFirstItem,
  removeLastItem,
  removeFirstInsertLast,
  removeLastInsertFirst,
  removeFirstInsertFirst,
  removeLastInsertLast,
  removeExisting,
  replaceExisting,
  alwaysWrong,
  insertAtSortPosition,
  removeExistingAndInsertAtSortPosition,
  runFullQueryAgain,
  unknownAction
};

// node_modules/binary-decision-diagram/dist/esm/src/minimal-string/string-format.js
var CHAR_CODE_OFFSET = 40;
function getNumberOfChar(char) {
  const charCode = char.charCodeAt(0);
  return charCode - CHAR_CODE_OFFSET;
}

// node_modules/binary-decision-diagram/dist/esm/src/util.js
function booleanToBooleanString(b) {
  if (b) {
    return "1";
  } else {
    return "0";
  }
}
function makeid(length = 6) {
  let result = "";
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}
var nodeIdPrefix = makeid(4);
function splitStringToChunks(str, chunkSize) {
  const chunks = [];
  for (let i = 0, charsLength = str.length; i < charsLength; i += chunkSize) {
    chunks.push(str.substring(i, i + chunkSize));
  }
  return chunks;
}

// node_modules/binary-decision-diagram/dist/esm/src/minimal-string/minimal-string-to-simple-bdd.js
function minimalStringToSimpleBdd(str) {
  const nodesById = /* @__PURE__ */ new Map();
  const leafNodeAmount = parseInt(str.charAt(0) + str.charAt(1), 10);
  const lastLeafNodeChar = 2 + leafNodeAmount * 2;
  const leafNodeChars = str.substring(2, lastLeafNodeChar);
  const leafNodeChunks = splitStringToChunks(leafNodeChars, 2);
  for (let i = 0; i < leafNodeChunks.length; i++) {
    const chunk = leafNodeChunks[i];
    const id = chunk.charAt(0);
    const value = getNumberOfChar(chunk.charAt(1));
    nodesById.set(id, value);
  }
  const internalNodeChars = str.substring(lastLeafNodeChar, str.length - 3);
  const internalNodeChunks = splitStringToChunks(internalNodeChars, 4);
  for (let i = 0; i < internalNodeChunks.length; i++) {
    const chunk = internalNodeChunks[i];
    const id = chunk.charAt(0);
    const idOf0Branch = chunk.charAt(1);
    const idOf1Branch = chunk.charAt(2);
    const level = getNumberOfChar(chunk.charAt(3));
    if (!nodesById.has(idOf0Branch)) {
      throw new Error("missing node with id " + idOf0Branch);
    }
    if (!nodesById.has(idOf1Branch)) {
      throw new Error("missing node with id " + idOf1Branch);
    }
    const node0 = nodesById.get(idOf0Branch);
    const node1 = nodesById.get(idOf1Branch);
    const node = {
      l: level,
      // level is first for prettier json output
      0: node0,
      1: node1
    };
    nodesById.set(id, node);
  }
  const last3 = str.slice(-3);
  const idOf0 = last3.charAt(0);
  const idOf1 = last3.charAt(1);
  const levelOfRoot = getNumberOfChar(last3.charAt(2));
  const nodeOf0 = nodesById.get(idOf0);
  const nodeOf1 = nodesById.get(idOf1);
  const rootNode = {
    l: levelOfRoot,
    0: nodeOf0,
    1: nodeOf1
  };
  return rootNode;
}

// node_modules/binary-decision-diagram/dist/esm/src/minimal-string/resolve-with-simple-bdd.js
function resolveWithSimpleBdd(simpleBdd2, fns, input) {
  let currentNode = simpleBdd2;
  let currentLevel = simpleBdd2.l;
  while (true) {
    const booleanResult = fns[currentLevel](input);
    const branchKey = booleanToBooleanString(booleanResult);
    currentNode = currentNode[branchKey];
    if (typeof currentNode === "number" || typeof currentNode === "string") {
      return currentNode;
    } else {
      currentLevel = currentNode.l;
    }
  }
}

// node_modules/event-reduce-js/dist/esm/src/bdd/bdd.generated.js
var minimalBddString = "14a1b,c+d2e5f0g/h.i4j*k-l)m(n6oeh6pnm6qen6ril6snh6tin6ubo9vce9wmh9xns9yne9zmi9{cm9|ad9}cp9~aq9ae9¡bf9¢bq9£cg9¤ck9¥cn9¦nd9§np9¨nq9©nf9ªng9«nm9¬nk9­mr9®ms9¯mt9°mj9±mk9²ml9³mn9´mc8µ³{8¶¯}8·°¤8¸³§8¹mn8º³«8»³m8¼m´4½z²4¾³w4¿zµ4À¯¶4Á°·4Â³º4Ã³¸4Äm¹4Åv¤7Æyn7ÇÀÁ7È~7É¥¤7ÊÃÄ7Ë¨n7Ìº¹7Í­°7Î®m7Ï¯°7Ð±m7Ñ³m7Ò¼m5ÓÄm5Ô¹m5Õ½°5Ö¾m5×¿°5ØÇÏ5ÙÂm5ÚÊÑ5Û±m5Üºm5ÝÌÑ5ÞÕÍ2ß|2à¡u2á£Å2âÖÎ2ã¦Æ2ä©x2åªÆ2æ×Ø2ç|È2è¡¢2é£É2ê¤¥2ëÙÚ2ì¦Ë2í©n2îªn2ïÛÐ2ðÜÝ2ñ¬n2òÒÓ/óan/ôbn/õcn/öÞâ/÷ßã/øàä/ùáå/úæë/ûçì/üèí/ýéî/þÍÎ/ÿÏÑ/ĀòÔ,ācn,Ăöï,ă¤ñ,Ąúð,ąêñ,ĆþÐ,ćÿÑ,Ĉac0ĉbc0Ċóõ0ċôā0Čßá0čà¤0Ďçé0ďèê0Đ÷ù0đøă0Ēûý0ēüą0ĔmÒ-ĕmĀ-ĖÞæ-ėČĎ-Ęčď-ęĂĄ-ĚĐĒ-ěđē-Ĝ²»-ĝÍÏ-ĞĆć-ğ²³-ĠĔĈ3ġĕĊ3ĢĖė3ģęĚ3ĤĢĝ(ĥĜğ(ĦģĞ(ħĠġ+Ĩĉċ+ĩĤĦ+ĪĘě+īħĨ1ĬĩĪ1ĭĬī*Įĥm*ĭĮ.";
var simpleBdd;
function getSimpleBdd() {
  if (!simpleBdd) {
    simpleBdd = minimalStringToSimpleBdd(minimalBddString);
  }
  return simpleBdd;
}
var resolveInput = (input) => {
  return resolveWithSimpleBdd(getSimpleBdd(), stateResolveFunctionByIndex, input);
};

// node_modules/event-reduce-js/dist/esm/src/index.js
function calculateActionName(input) {
  const resolvedActionId = resolveInput(input);
  return orderedActionList[resolvedActionId];
}
function runAction(action, queryParams, changeEvent, previousResults, keyDocumentMap) {
  const fn = actionFunctions[action];
  fn({
    queryParams,
    changeEvent,
    previousResults,
    keyDocumentMap
  });
  return previousResults;
}

// node_modules/rxdb/dist/esm/event-reduce.js
function getSortFieldsOfQuery(primaryKey, query) {
  if (!query.sort || query.sort.length === 0) {
    return [primaryKey];
  } else {
    return query.sort.map((part) => Object.keys(part)[0]);
  }
}
var RXQUERY_QUERY_PARAMS_CACHE = /* @__PURE__ */ new WeakMap();
function getQueryParams(rxQuery) {
  return getFromMapOrCreate(RXQUERY_QUERY_PARAMS_CACHE, rxQuery, () => {
    var collection = rxQuery.collection;
    var normalizedMangoQuery = normalizeMangoQuery(collection.storageInstance.schema, clone(rxQuery.mangoQuery));
    var primaryKey = collection.schema.primaryPath;
    var sortComparator = getSortComparator(collection.schema.jsonSchema, normalizedMangoQuery);
    var useSortComparator = (docA, docB) => {
      var sortComparatorData = {
        docA,
        docB,
        rxQuery
      };
      return sortComparator(sortComparatorData.docA, sortComparatorData.docB);
    };
    var queryMatcher = getQueryMatcher(collection.schema.jsonSchema, normalizedMangoQuery);
    var useQueryMatcher = (doc) => {
      var queryMatcherData = {
        doc,
        rxQuery
      };
      return queryMatcher(queryMatcherData.doc);
    };
    var ret = {
      primaryKey: rxQuery.collection.schema.primaryPath,
      skip: normalizedMangoQuery.skip,
      limit: normalizedMangoQuery.limit,
      sortFields: getSortFieldsOfQuery(primaryKey, normalizedMangoQuery),
      sortComparator: useSortComparator,
      queryMatcher: useQueryMatcher
    };
    return ret;
  });
}
function calculateNewResults(rxQuery, rxChangeEvents) {
  if (!rxQuery.collection.database.eventReduce) {
    return {
      runFullQueryAgain: true
    };
  }
  var queryParams = getQueryParams(rxQuery);
  var previousResults = ensureNotFalsy(rxQuery._result).docsData.slice(0);
  var previousResultsMap = ensureNotFalsy(rxQuery._result).docsDataMap;
  var changed = false;
  var eventReduceEvents = [];
  for (var index = 0; index < rxChangeEvents.length; index++) {
    var cE = rxChangeEvents[index];
    var eventReduceEvent = rxChangeEventToEventReduceChangeEvent(cE);
    if (eventReduceEvent) {
      eventReduceEvents.push(eventReduceEvent);
    }
  }
  var foundNonOptimizeable = eventReduceEvents.find((eventReduceEvent2) => {
    var stateResolveFunctionInput = {
      queryParams,
      changeEvent: eventReduceEvent2,
      previousResults,
      keyDocumentMap: previousResultsMap
    };
    var actionName = calculateActionName(stateResolveFunctionInput);
    if (actionName === "runFullQueryAgain") {
      return true;
    } else if (actionName !== "doNothing") {
      changed = true;
      runAction(actionName, queryParams, eventReduceEvent2, previousResults, previousResultsMap);
      return false;
    }
  });
  if (foundNonOptimizeable) {
    return {
      runFullQueryAgain: true
    };
  } else {
    return {
      runFullQueryAgain: false,
      changed,
      newResults: previousResults
    };
  }
}

// node_modules/rxdb/dist/esm/rx-query.js
var _queryCount = 0;
var newQueryID = function() {
  return ++_queryCount;
};
var RxQueryBase = function() {
  function RxQueryBase2(op, mangoQuery, collection, other = {}) {
    this.id = newQueryID();
    this._execOverDatabaseCount = 0;
    this._creationTime = now();
    this._lastEnsureEqual = 0;
    this.uncached = false;
    this.refCount$ = new BehaviorSubject(null);
    this._result = null;
    this._latestChangeEvent = -1;
    this._ensureEqualQueue = PROMISE_RESOLVE_FALSE;
    this.op = op;
    this.mangoQuery = mangoQuery;
    this.collection = collection;
    this.other = other;
    if (!mangoQuery) {
      this.mangoQuery = _getDefaultQuery();
    }
    this.isFindOneByIdQuery = isFindOneByIdQuery(this.collection.schema.primaryPath, mangoQuery);
  }
  var _proto = RxQueryBase2.prototype;
  _proto._setResultData = function _setResultData(newResultData) {
    if (typeof newResultData === "undefined") {
      throw newRxError("QU18", {
        database: this.collection.database.name,
        collection: this.collection.name
      });
    }
    if (typeof newResultData === "number") {
      this._result = new RxQuerySingleResult(this, [], newResultData);
      return;
    } else if (newResultData instanceof Map) {
      newResultData = Array.from(newResultData.values());
    }
    var newQueryResult = new RxQuerySingleResult(this, newResultData, newResultData.length);
    this._result = newQueryResult;
  };
  _proto._execOverDatabase = function _execOverDatabase() {
    return __async(this, null, function* () {
      this._execOverDatabaseCount = this._execOverDatabaseCount + 1;
      if (this.op === "count") {
        var preparedQuery = this.getPreparedQuery();
        var result = yield this.collection.storageInstance.count(preparedQuery);
        if (result.mode === "slow" && !this.collection.database.allowSlowCount) {
          throw newRxError("QU14", {
            collection: this.collection,
            queryObj: this.mangoQuery
          });
        } else {
          return result.count;
        }
      }
      if (this.op === "findByIds") {
        var ids = ensureNotFalsy(this.mangoQuery.selector)[this.collection.schema.primaryPath].$in;
        var ret = /* @__PURE__ */ new Map();
        var mustBeQueried = [];
        ids.forEach((id) => {
          var docData = this.collection._docCache.getLatestDocumentDataIfExists(id);
          if (docData) {
            if (!docData._deleted) {
              var doc = this.collection._docCache.getCachedRxDocument(docData);
              ret.set(id, doc);
            }
          } else {
            mustBeQueried.push(id);
          }
        });
        if (mustBeQueried.length > 0) {
          var docs = yield this.collection.storageInstance.findDocumentsById(mustBeQueried, false);
          docs.forEach((docData) => {
            var doc = this.collection._docCache.getCachedRxDocument(docData);
            ret.set(doc.primary, doc);
          });
        }
        return ret;
      }
      var docsPromise = queryCollection(this);
      return docsPromise.then((docs2) => {
        return docs2;
      });
    });
  };
  _proto.exec = function exec(throwIfMissing) {
    return __async(this, null, function* () {
      if (throwIfMissing && this.op !== "findOne") {
        throw newRxError("QU9", {
          collection: this.collection.name,
          query: this.mangoQuery,
          op: this.op
        });
      }
      yield _ensureEqual(this);
      var useResult = ensureNotFalsy(this._result);
      return useResult.getValue(throwIfMissing);
    });
  };
  _proto.toString = function toString() {
    var stringObj = sortObject({
      op: this.op,
      query: normalizeMangoQuery(this.collection.schema.jsonSchema, this.mangoQuery),
      other: this.other
    }, true);
    var value = JSON.stringify(stringObj);
    this.toString = () => value;
    return value;
  };
  _proto.getPreparedQuery = function getPreparedQuery() {
    var hookInput = {
      rxQuery: this,
      // can be mutated by the hooks so we have to deep clone first.
      mangoQuery: normalizeMangoQuery(this.collection.schema.jsonSchema, this.mangoQuery)
    };
    hookInput.mangoQuery.selector._deleted = {
      $eq: false
    };
    if (hookInput.mangoQuery.index) {
      hookInput.mangoQuery.index.unshift("_deleted");
    }
    runPluginHooks("prePrepareQuery", hookInput);
    var value = prepareQuery(this.collection.schema.jsonSchema, hookInput.mangoQuery);
    this.getPreparedQuery = () => value;
    return value;
  };
  _proto.doesDocumentDataMatch = function doesDocumentDataMatch(docData) {
    if (docData._deleted) {
      return false;
    }
    return this.queryMatcher(docData);
  };
  _proto.remove = function remove() {
    return __async(this, null, function* () {
      var docs = yield this.exec();
      if (Array.isArray(docs)) {
        var result = yield this.collection.bulkRemove(docs);
        if (result.error.length > 0) {
          throw rxStorageWriteErrorToRxError(result.error[0]);
        } else {
          return result.success;
        }
      } else {
        return docs.remove();
      }
    });
  };
  _proto.incrementalRemove = function incrementalRemove() {
    return runQueryUpdateFunction(this.asRxQuery, (doc) => doc.incrementalRemove());
  };
  _proto.update = function update(_updateObj) {
    throw pluginMissing("update");
  };
  _proto.patch = function patch(_patch) {
    return runQueryUpdateFunction(this.asRxQuery, (doc) => doc.patch(_patch));
  };
  _proto.incrementalPatch = function incrementalPatch(patch) {
    return runQueryUpdateFunction(this.asRxQuery, (doc) => doc.incrementalPatch(patch));
  };
  _proto.modify = function modify(mutationFunction) {
    return runQueryUpdateFunction(this.asRxQuery, (doc) => doc.modify(mutationFunction));
  };
  _proto.incrementalModify = function incrementalModify(mutationFunction) {
    return runQueryUpdateFunction(this.asRxQuery, (doc) => doc.incrementalModify(mutationFunction));
  };
  _proto.where = function where(_queryObj) {
    throw pluginMissing("query-builder");
  };
  _proto.sort = function sort(_params) {
    throw pluginMissing("query-builder");
  };
  _proto.skip = function skip(_amount) {
    throw pluginMissing("query-builder");
  };
  _proto.limit = function limit(_amount) {
    throw pluginMissing("query-builder");
  };
  return _createClass(RxQueryBase2, [{
    key: "$",
    get: function() {
      if (!this._$) {
        var results$ = this.collection.eventBulks$.pipe(
          /**
           * Performance shortcut.
           * Changes to local documents are not relevant for the query.
           */
          filter((bulk) => !bulk.isLocal),
          /**
           * Start once to ensure the querying also starts
           * when there where no changes.
           */
          startWith(null),
          // ensure query results are up to date.
          mergeMap(() => _ensureEqual(this)),
          // use the current result set, written by _ensureEqual().
          map(() => this._result),
          // do not run stuff above for each new subscriber, only once.
          shareReplay(RXJS_SHARE_REPLAY_DEFAULTS),
          // do not proceed if result set has not changed.
          distinctUntilChanged((prev, curr) => {
            if (prev && prev.time === ensureNotFalsy(curr).time) {
              return true;
            } else {
              return false;
            }
          }),
          filter((result) => !!result),
          /**
           * Map the result set to a single RxDocument or an array,
           * depending on query type
           */
          map((result) => {
            return ensureNotFalsy(result).getValue();
          })
        );
        this._$ = merge(
          results$,
          /**
           * Also add the refCount$ to the query observable
           * to allow us to count the amount of subscribers.
           */
          this.refCount$.pipe(filter(() => false))
        );
      }
      return this._$;
    }
  }, {
    key: "$$",
    get: function() {
      var reactivity = this.collection.database.getReactivityFactory();
      return reactivity.fromObservable(this.$, void 0, this.collection.database);
    }
    // stores the changeEvent-number of the last handled change-event
    /**
     * ensures that the exec-runs
     * are not run in parallel
     */
  }, {
    key: "queryMatcher",
    get: function() {
      var schema = this.collection.schema.jsonSchema;
      var normalizedQuery = normalizeMangoQuery(this.collection.schema.jsonSchema, this.mangoQuery);
      return overwriteGetterForCaching(this, "queryMatcher", getQueryMatcher(schema, normalizedQuery));
    }
  }, {
    key: "asRxQuery",
    get: function() {
      return this;
    }
  }]);
}();
function _getDefaultQuery() {
  return {
    selector: {}
  };
}
function tunnelQueryCache(rxQuery) {
  return rxQuery.collection._queryCache.getByQuery(rxQuery);
}
function createRxQuery(op, queryObj, collection, other) {
  runPluginHooks("preCreateRxQuery", {
    op,
    queryObj,
    collection,
    other
  });
  var ret = new RxQueryBase(op, queryObj, collection, other);
  ret = tunnelQueryCache(ret);
  triggerCacheReplacement(collection);
  return ret;
}
function _isResultsInSync(rxQuery) {
  var currentLatestEventNumber = rxQuery.asRxQuery.collection._changeEventBuffer.getCounter();
  if (rxQuery._latestChangeEvent >= currentLatestEventNumber) {
    return true;
  } else {
    return false;
  }
}
function _ensureEqual(rxQuery) {
  return __async(this, null, function* () {
    if (rxQuery.collection.awaitBeforeReads.size > 0) {
      yield Promise.all(Array.from(rxQuery.collection.awaitBeforeReads).map((fn) => fn()));
    }
    if (rxQuery.collection.database.closed || _isResultsInSync(rxQuery)) {
      return false;
    }
    rxQuery._ensureEqualQueue = rxQuery._ensureEqualQueue.then(() => __ensureEqual(rxQuery));
    return rxQuery._ensureEqualQueue;
  });
}
function __ensureEqual(rxQuery) {
  rxQuery._lastEnsureEqual = now();
  if (
    // db is closed
    rxQuery.collection.database.closed || // nothing happened since last run
    _isResultsInSync(rxQuery)
  ) {
    return PROMISE_RESOLVE_FALSE;
  }
  var ret = false;
  var mustReExec = false;
  if (rxQuery._latestChangeEvent === -1) {
    mustReExec = true;
  }
  if (!mustReExec) {
    var missedChangeEvents = rxQuery.asRxQuery.collection._changeEventBuffer.getFrom(rxQuery._latestChangeEvent + 1);
    if (missedChangeEvents === null) {
      mustReExec = true;
    } else {
      rxQuery._latestChangeEvent = rxQuery.asRxQuery.collection._changeEventBuffer.getCounter();
      var runChangeEvents = rxQuery.asRxQuery.collection._changeEventBuffer.reduceByLastOfDoc(missedChangeEvents);
      if (rxQuery.op === "count") {
        var previousCount = ensureNotFalsy(rxQuery._result).count;
        var newCount = previousCount;
        runChangeEvents.forEach((cE) => {
          var didMatchBefore = cE.previousDocumentData && rxQuery.doesDocumentDataMatch(cE.previousDocumentData);
          var doesMatchNow2 = rxQuery.doesDocumentDataMatch(cE.documentData);
          if (!didMatchBefore && doesMatchNow2) {
            newCount++;
          }
          if (didMatchBefore && !doesMatchNow2) {
            newCount--;
          }
        });
        if (newCount !== previousCount) {
          ret = true;
          rxQuery._setResultData(newCount);
        }
      } else {
        var eventReduceResult = calculateNewResults(rxQuery, runChangeEvents);
        if (eventReduceResult.runFullQueryAgain) {
          mustReExec = true;
        } else if (eventReduceResult.changed) {
          ret = true;
          rxQuery._setResultData(eventReduceResult.newResults);
        }
      }
    }
  }
  if (mustReExec) {
    return rxQuery._execOverDatabase().then((newResultData) => {
      rxQuery._latestChangeEvent = rxQuery.collection._changeEventBuffer.getCounter();
      if (typeof newResultData === "number") {
        if (!rxQuery._result || newResultData !== rxQuery._result.count) {
          ret = true;
          rxQuery._setResultData(newResultData);
        }
        return ret;
      }
      if (!rxQuery._result || !areRxDocumentArraysEqual(rxQuery.collection.schema.primaryPath, newResultData, rxQuery._result.docsData)) {
        ret = true;
        rxQuery._setResultData(newResultData);
      }
      return ret;
    });
  }
  return Promise.resolve(ret);
}
function queryCollection(rxQuery) {
  return __async(this, null, function* () {
    var docs = [];
    var collection = rxQuery.collection;
    if (rxQuery.isFindOneByIdQuery) {
      if (Array.isArray(rxQuery.isFindOneByIdQuery)) {
        var docIds = rxQuery.isFindOneByIdQuery;
        docIds = docIds.filter((docId2) => {
          var docData2 = rxQuery.collection._docCache.getLatestDocumentDataIfExists(docId2);
          if (docData2) {
            if (!docData2._deleted) {
              docs.push(docData2);
            }
            return false;
          } else {
            return true;
          }
        });
        if (docIds.length > 0) {
          var docsFromStorage = yield collection.storageInstance.findDocumentsById(docIds, false);
          appendToArray(docs, docsFromStorage);
        }
      } else {
        var docId = rxQuery.isFindOneByIdQuery;
        var docData = rxQuery.collection._docCache.getLatestDocumentDataIfExists(docId);
        if (!docData) {
          var fromStorageList = yield collection.storageInstance.findDocumentsById([docId], false);
          if (fromStorageList[0]) {
            docData = fromStorageList[0];
          }
        }
        if (docData && !docData._deleted) {
          docs.push(docData);
        }
      }
    } else {
      var preparedQuery = rxQuery.getPreparedQuery();
      var queryResult = yield collection.storageInstance.query(preparedQuery);
      docs = queryResult.documents;
    }
    return docs;
  });
}
function isFindOneByIdQuery(primaryPath, query) {
  if (!query.skip && query.selector && Object.keys(query.selector).length === 1 && query.selector[primaryPath]) {
    var value = query.selector[primaryPath];
    if (typeof value === "string") {
      return value;
    } else if (Object.keys(value).length === 1 && typeof value.$eq === "string") {
      return value.$eq;
    }
    if (Object.keys(value).length === 1 && Array.isArray(value.$eq) && // must only contain strings
    !value.$eq.find((r) => typeof r !== "string")) {
      return value.$eq;
    }
  }
  return false;
}
function isRxQuery(obj) {
  return obj instanceof RxQueryBase;
}

// node_modules/rxdb/dist/esm/rx-database-internal-store.js
var INTERNAL_CONTEXT_COLLECTION = "collection";
var INTERNAL_CONTEXT_STORAGE_TOKEN = "storage-token";
var INTERNAL_CONTEXT_MIGRATION_STATUS = "rx-migration-status";
var INTERNAL_CONTEXT_PIPELINE_CHECKPOINT = "rx-pipeline-checkpoint";
var INTERNAL_STORE_SCHEMA_TITLE = "RxInternalDocument";
var INTERNAL_STORE_SCHEMA = fillWithDefaultSettings({
  version: 0,
  title: INTERNAL_STORE_SCHEMA_TITLE,
  primaryKey: {
    key: "id",
    fields: ["context", "key"],
    separator: "|"
  },
  type: "object",
  properties: {
    id: {
      type: "string",
      maxLength: 200
    },
    key: {
      type: "string"
    },
    context: {
      type: "string",
      enum: [INTERNAL_CONTEXT_COLLECTION, INTERNAL_CONTEXT_STORAGE_TOKEN, INTERNAL_CONTEXT_MIGRATION_STATUS, INTERNAL_CONTEXT_PIPELINE_CHECKPOINT, "OTHER"]
    },
    data: {
      type: "object",
      additionalProperties: true
    }
  },
  indexes: [],
  required: ["key", "context", "data"],
  additionalProperties: false,
  /**
   * If the sharding plugin is used,
   * it must not shard on the internal RxStorageInstance
   * because that one anyway has only a small amount of documents
   * and also its creation is in the hot path of the initial page load,
   * so we should spend less time creating multiple RxStorageInstances.
   */
  sharding: {
    shards: 1,
    mode: "collection"
  }
});
function getPrimaryKeyOfInternalDocument(key, context) {
  return getComposedPrimaryKeyOfDocumentData(INTERNAL_STORE_SCHEMA, {
    key,
    context
  });
}
function getAllCollectionDocuments(storageInstance) {
  return __async(this, null, function* () {
    var getAllQueryPrepared = prepareQuery(storageInstance.schema, {
      selector: {
        context: INTERNAL_CONTEXT_COLLECTION,
        _deleted: {
          $eq: false
        }
      },
      sort: [{
        id: "asc"
      }],
      skip: 0
    });
    var queryResult = yield storageInstance.query(getAllQueryPrepared);
    var allDocs = queryResult.documents;
    return allDocs;
  });
}
var STORAGE_TOKEN_DOCUMENT_KEY = "storageToken";
var STORAGE_TOKEN_DOCUMENT_ID = getPrimaryKeyOfInternalDocument(STORAGE_TOKEN_DOCUMENT_KEY, INTERNAL_CONTEXT_STORAGE_TOKEN);
function ensureStorageTokenDocumentExists(rxDatabase) {
  return __async(this, null, function* () {
    var storageToken = randomToken(10);
    var passwordHash = rxDatabase.password ? yield rxDatabase.hashFunction(JSON.stringify(rxDatabase.password)) : void 0;
    var docData = {
      id: STORAGE_TOKEN_DOCUMENT_ID,
      context: INTERNAL_CONTEXT_STORAGE_TOKEN,
      key: STORAGE_TOKEN_DOCUMENT_KEY,
      data: {
        rxdbVersion: rxDatabase.rxdbVersion,
        token: storageToken,
        /**
         * We add the instance token here
         * to be able to detect if a given RxDatabase instance
         * is the first instance that was ever created
         * or if databases have existed earlier on that storage
         * with the same database name.
         */
        instanceToken: rxDatabase.token,
        passwordHash
      },
      _deleted: false,
      _meta: getDefaultRxDocumentMeta(),
      _rev: getDefaultRevision(),
      _attachments: {}
    };
    var writeRows = [{
      document: docData
    }];
    var writeResult = yield rxDatabase.internalStore.bulkWrite(writeRows, "internal-add-storage-token");
    if (!writeResult.error[0]) {
      return getWrittenDocumentsFromBulkWriteResponse("id", writeRows, writeResult)[0];
    }
    var error = ensureNotFalsy(writeResult.error[0]);
    if (error.isError && isBulkWriteConflictError(error)) {
      var conflictError = error;
      if (!isDatabaseStateVersionCompatibleWithDatabaseCode(conflictError.documentInDb.data.rxdbVersion, rxDatabase.rxdbVersion)) {
        throw newRxError("DM5", {
          args: {
            database: rxDatabase.name,
            databaseStateVersion: conflictError.documentInDb.data.rxdbVersion,
            codeVersion: rxDatabase.rxdbVersion
          }
        });
      }
      if (passwordHash && passwordHash !== conflictError.documentInDb.data.passwordHash) {
        throw newRxError("DB1", {
          passwordHash,
          existingPasswordHash: conflictError.documentInDb.data.passwordHash
        });
      }
      var storageTokenDocInDb = conflictError.documentInDb;
      return ensureNotFalsy(storageTokenDocInDb);
    }
    throw error;
  });
}
function isDatabaseStateVersionCompatibleWithDatabaseCode(databaseStateVersion, codeVersion) {
  if (!databaseStateVersion) {
    return false;
  }
  var stateMajor = databaseStateVersion.split(".")[0];
  var codeMajor = codeVersion.split(".")[0];
  if (stateMajor === "15" && codeMajor === "16") {
    return true;
  }
  if (stateMajor !== codeMajor) {
    return false;
  }
  return true;
}
function addConnectedStorageToCollection(collection, storageCollectionName, schema) {
  return __async(this, null, function* () {
    if (collection.schema.version !== schema.version) {
      throw newRxError("SNH", {
        schema,
        version: collection.schema.version,
        name: collection.name,
        collection,
        args: {
          storageCollectionName
        }
      });
    }
    var collectionNameWithVersion = _collectionNamePrimary(collection.name, collection.schema.jsonSchema);
    var collectionDocId = getPrimaryKeyOfInternalDocument(collectionNameWithVersion, INTERNAL_CONTEXT_COLLECTION);
    while (true) {
      var collectionDoc = yield getSingleDocument(collection.database.internalStore, collectionDocId);
      var saveData = clone(ensureNotFalsy(collectionDoc));
      var alreadyThere = saveData.data.connectedStorages.find((row) => row.collectionName === storageCollectionName && row.schema.version === schema.version);
      if (alreadyThere) {
        return;
      }
      saveData.data.connectedStorages.push({
        collectionName: storageCollectionName,
        schema
      });
      try {
        yield writeSingle(collection.database.internalStore, {
          previous: ensureNotFalsy(collectionDoc),
          document: saveData
        }, "add-connected-storage-to-collection");
      } catch (err) {
        if (!isBulkWriteConflictError(err)) {
          throw err;
        }
      }
    }
  });
}
function removeConnectedStorageFromCollection(collection, storageCollectionName, schema) {
  return __async(this, null, function* () {
    if (collection.schema.version !== schema.version) {
      throw newRxError("SNH", {
        schema,
        version: collection.schema.version,
        name: collection.name,
        collection,
        args: {
          storageCollectionName
        }
      });
    }
    var collectionNameWithVersion = _collectionNamePrimary(collection.name, collection.schema.jsonSchema);
    var collectionDocId = getPrimaryKeyOfInternalDocument(collectionNameWithVersion, INTERNAL_CONTEXT_COLLECTION);
    while (true) {
      var collectionDoc = yield getSingleDocument(collection.database.internalStore, collectionDocId);
      var saveData = clone(ensureNotFalsy(collectionDoc));
      var isThere = saveData.data.connectedStorages.find((row) => row.collectionName === storageCollectionName && row.schema.version === schema.version);
      if (!isThere) {
        return;
      }
      saveData.data.connectedStorages = saveData.data.connectedStorages.filter((item) => item.collectionName !== storageCollectionName);
      try {
        yield writeSingle(collection.database.internalStore, {
          previous: ensureNotFalsy(collectionDoc),
          document: saveData
        }, "remove-connected-storage-from-collection");
      } catch (err) {
        if (!isBulkWriteConflictError(err)) {
          throw err;
        }
      }
    }
  });
}
function _collectionNamePrimary(name, schema) {
  return name + "-" + schema.version;
}

// node_modules/rxdb/dist/esm/rx-collection-helper.js
function fillObjectDataBeforeInsert(schema, data) {
  data = flatClone(data);
  data = fillObjectWithDefaults(schema, data);
  if (typeof schema.jsonSchema.primaryKey !== "string") {
    data = fillPrimaryKey(schema.primaryPath, schema.jsonSchema, data);
  }
  data._meta = getDefaultRxDocumentMeta();
  if (!Object.prototype.hasOwnProperty.call(data, "_deleted")) {
    data._deleted = false;
  }
  if (!Object.prototype.hasOwnProperty.call(data, "_attachments")) {
    data._attachments = {};
  }
  if (!Object.prototype.hasOwnProperty.call(data, "_rev")) {
    data._rev = getDefaultRevision();
  }
  return data;
}
function createRxCollectionStorageInstance(rxDatabase, storageInstanceCreationParams) {
  return __async(this, null, function* () {
    storageInstanceCreationParams.multiInstance = rxDatabase.multiInstance;
    var storageInstance = yield rxDatabase.storage.createStorageInstance(storageInstanceCreationParams);
    return storageInstance;
  });
}
function removeCollectionStorages(storage, databaseInternalStorage, databaseInstanceToken, databaseName, collectionName, multiInstance, password, hashFunction) {
  return __async(this, null, function* () {
    var allCollectionMetaDocs = yield getAllCollectionDocuments(databaseInternalStorage);
    var relevantCollectionMetaDocs = allCollectionMetaDocs.filter((metaDoc) => metaDoc.data.name === collectionName);
    var removeStorages = [];
    relevantCollectionMetaDocs.forEach((metaDoc) => {
      removeStorages.push({
        collectionName: metaDoc.data.name,
        schema: metaDoc.data.schema,
        isCollection: true
      });
      metaDoc.data.connectedStorages.forEach((row) => removeStorages.push({
        collectionName: row.collectionName,
        isCollection: false,
        schema: row.schema
      }));
    });
    var alreadyAdded = /* @__PURE__ */ new Set();
    removeStorages = removeStorages.filter((row) => {
      var key = row.collectionName + "||" + row.schema.version;
      if (alreadyAdded.has(key)) {
        return false;
      } else {
        alreadyAdded.add(key);
        return true;
      }
    });
    yield Promise.all(removeStorages.map((row) => __async(null, null, function* () {
      var storageInstance = yield storage.createStorageInstance({
        collectionName: row.collectionName,
        databaseInstanceToken,
        databaseName,
        /**
         * multiInstance must be set to true if multiInstance
         * was true on the database
         * so that the storageInstance can inform other
         * instances about being removed.
         */
        multiInstance,
        options: {},
        schema: row.schema,
        password,
        devMode: overwritable.isDevMode()
      });
      yield storageInstance.remove();
      if (row.isCollection) {
        yield runAsyncPluginHooks("postRemoveRxCollection", {
          storage,
          databaseName,
          collectionName
        });
      }
    })));
    if (hashFunction) {
      var writeRows = relevantCollectionMetaDocs.map((doc) => {
        var writeDoc = flatCloneDocWithMeta(doc);
        writeDoc._deleted = true;
        writeDoc._meta.lwt = now();
        writeDoc._rev = createRevision(databaseInstanceToken, doc);
        return {
          previous: doc,
          document: writeDoc
        };
      });
      yield databaseInternalStorage.bulkWrite(writeRows, "rx-database-remove-collection-all");
    }
  });
}
function ensureRxCollectionIsNotClosed(collection) {
  if (collection.closed) {
    throw newRxError("COL21", {
      collection: collection.name,
      version: collection.schema.version
    });
  }
}

// node_modules/rxdb/dist/esm/rx-document-prototype-merge.js
var constructorForCollection = /* @__PURE__ */ new WeakMap();
function getDocumentPrototype(rxCollection) {
  var schemaProto = rxCollection.schema.getDocumentPrototype();
  var ormProto = getDocumentOrmPrototype(rxCollection);
  var baseProto = basePrototype;
  var proto = {};
  [schemaProto, ormProto, baseProto].forEach((obj) => {
    var props = Object.getOwnPropertyNames(obj);
    props.forEach((key) => {
      var desc = Object.getOwnPropertyDescriptor(obj, key);
      var enumerable = true;
      if (key.startsWith("_") || key.endsWith("_") || key.startsWith("$") || key.endsWith("$")) enumerable = false;
      if (typeof desc.value === "function") {
        Object.defineProperty(proto, key, {
          get() {
            return desc.value.bind(this);
          },
          enumerable,
          configurable: false
        });
      } else {
        desc.enumerable = enumerable;
        desc.configurable = false;
        if (desc.writable) desc.writable = false;
        Object.defineProperty(proto, key, desc);
      }
    });
  });
  return proto;
}
function getRxDocumentConstructor(rxCollection) {
  return getFromMapOrCreate(constructorForCollection, rxCollection, () => createRxDocumentConstructor(getDocumentPrototype(rxCollection)));
}
function createNewRxDocument(rxCollection, documentConstructor, docData) {
  var doc = createWithConstructor(documentConstructor, rxCollection, overwritable.deepFreezeWhenDevMode(docData));
  rxCollection._runHooksSync("post", "create", docData, doc);
  runPluginHooks("postCreateRxDocument", doc);
  return doc;
}
function getDocumentOrmPrototype(rxCollection) {
  var proto = {};
  Object.entries(rxCollection.methods).forEach(([k, v]) => {
    proto[k] = v;
  });
  return proto;
}

// node_modules/rxdb/dist/esm/replication-protocol/default-conflict-handler.js
var defaultConflictHandler = {
  isEqual(a, b, _ctx) {
    a = addAttachmentsIfNotExists(a);
    b = addAttachmentsIfNotExists(b);
    var ret = deepEqual(stripAttachmentsDataFromDocument(a), stripAttachmentsDataFromDocument(b));
    return ret;
  },
  resolve(i) {
    return i.realMasterState;
  }
};
function addAttachmentsIfNotExists(d) {
  if (!d._attachments) {
    d = flatClone(d);
    d._attachments = {};
  }
  return d;
}

// node_modules/rxdb/dist/esm/change-event-buffer.js
var ChangeEventBuffer = function() {
  function ChangeEventBuffer2(collection) {
    this.subs = [];
    this.counter = 0;
    this.eventCounterMap = /* @__PURE__ */ new WeakMap();
    this.buffer = [];
    this.limit = 100;
    this.tasks = /* @__PURE__ */ new Set();
    this.collection = collection;
    this.subs.push(this.collection.eventBulks$.pipe(filter((bulk) => !bulk.isLocal)).subscribe((eventBulk) => {
      this.tasks.add(() => this._handleChangeEvents(eventBulk.events));
      if (this.tasks.size <= 1) {
        requestIdlePromiseNoQueue().then(() => {
          this.processTasks();
        });
      }
    }));
  }
  var _proto = ChangeEventBuffer2.prototype;
  _proto.processTasks = function processTasks() {
    if (this.tasks.size === 0) {
      return;
    }
    var tasks = Array.from(this.tasks);
    tasks.forEach((task) => task());
    this.tasks.clear();
  };
  _proto._handleChangeEvents = function _handleChangeEvents(events) {
    var counterBefore = this.counter;
    this.counter = this.counter + events.length;
    if (events.length > this.limit) {
      this.buffer = events.slice(events.length * -1);
    } else {
      appendToArray(this.buffer, events);
      this.buffer = this.buffer.slice(this.limit * -1);
    }
    var counterBase = counterBefore + 1;
    var eventCounterMap = this.eventCounterMap;
    for (var index = 0; index < events.length; index++) {
      var event = events[index];
      eventCounterMap.set(event, counterBase + index);
    }
  };
  _proto.getCounter = function getCounter() {
    this.processTasks();
    return this.counter;
  };
  _proto.getBuffer = function getBuffer() {
    this.processTasks();
    return this.buffer;
  };
  _proto.getArrayIndexByPointer = function getArrayIndexByPointer(pointer) {
    this.processTasks();
    var oldestEvent = this.buffer[0];
    var oldestCounter = this.eventCounterMap.get(oldestEvent);
    if (pointer < oldestCounter) return null;
    var rest = pointer - oldestCounter;
    return rest;
  };
  _proto.getFrom = function getFrom(pointer) {
    this.processTasks();
    var ret = [];
    var currentIndex = this.getArrayIndexByPointer(pointer);
    if (currentIndex === null)
      return null;
    while (true) {
      var nextEvent = this.buffer[currentIndex];
      currentIndex++;
      if (!nextEvent) {
        return ret;
      } else {
        ret.push(nextEvent);
      }
    }
  };
  _proto.runFrom = function runFrom(pointer, fn) {
    this.processTasks();
    var ret = this.getFrom(pointer);
    if (ret === null) {
      throw new Error("out of bounds");
    } else {
      ret.forEach((cE) => fn(cE));
    }
  };
  _proto.reduceByLastOfDoc = function reduceByLastOfDoc(changeEvents) {
    this.processTasks();
    return changeEvents.slice(0);
  };
  _proto.close = function close() {
    this.tasks.clear();
    this.subs.forEach((sub) => sub.unsubscribe());
  };
  return ChangeEventBuffer2;
}();
function createChangeEventBuffer(collection) {
  return new ChangeEventBuffer(collection);
}

// node_modules/rxdb/dist/esm/rx-collection.js
var HOOKS_WHEN = ["pre", "post"];
var HOOKS_KEYS = ["insert", "save", "remove", "create"];
var hooksApplied = false;
var OPEN_COLLECTIONS = /* @__PURE__ */ new Set();
var RxCollectionBase = function() {
  function RxCollectionBase2(database, name, schema, internalStorageInstance, instanceCreationOptions = {}, migrationStrategies = {}, methods = {}, attachments = {}, options = {}, cacheReplacementPolicy = defaultCacheReplacementPolicy, statics = {}, conflictHandler = defaultConflictHandler) {
    this.storageInstance = {};
    this.timeouts = /* @__PURE__ */ new Set();
    this.incrementalWriteQueue = {};
    this.awaitBeforeReads = /* @__PURE__ */ new Set();
    this._incrementalUpsertQueues = /* @__PURE__ */ new Map();
    this.synced = false;
    this.hooks = {};
    this._subs = [];
    this._docCache = {};
    this._queryCache = createQueryCache();
    this.$ = {};
    this.checkpoint$ = {};
    this._changeEventBuffer = {};
    this.eventBulks$ = {};
    this.onClose = [];
    this.closed = false;
    this.onRemove = [];
    this.database = database;
    this.name = name;
    this.schema = schema;
    this.internalStorageInstance = internalStorageInstance;
    this.instanceCreationOptions = instanceCreationOptions;
    this.migrationStrategies = migrationStrategies;
    this.methods = methods;
    this.attachments = attachments;
    this.options = options;
    this.cacheReplacementPolicy = cacheReplacementPolicy;
    this.statics = statics;
    this.conflictHandler = conflictHandler;
    _applyHookFunctions(this.asRxCollection);
    if (database) {
      this.eventBulks$ = database.eventBulks$.pipe(filter((changeEventBulk) => changeEventBulk.collectionName === this.name));
    } else {
    }
    if (this.database) {
      OPEN_COLLECTIONS.add(this);
    }
  }
  var _proto = RxCollectionBase2.prototype;
  _proto.prepare = function prepare() {
    return __async(this, null, function* () {
      if (!(yield hasPremiumFlag())) {
        var count = 0;
        while (count < 10 && OPEN_COLLECTIONS.size > NON_PREMIUM_COLLECTION_LIMIT) {
          count++;
          yield this.promiseWait(30);
        }
        if (OPEN_COLLECTIONS.size > NON_PREMIUM_COLLECTION_LIMIT) {
          throw newRxError("COL23", {
            database: this.database.name,
            collection: this.name,
            args: {
              existing: Array.from(OPEN_COLLECTIONS.values()).map((c) => ({
                db: c.database ? c.database.name : "",
                c: c.name
              }))
            }
          });
        }
      }
      this.storageInstance = getWrappedStorageInstance(this.database, this.internalStorageInstance, this.schema.jsonSchema);
      this.incrementalWriteQueue = new IncrementalWriteQueue(this.storageInstance, this.schema.primaryPath, (newData, oldData) => beforeDocumentUpdateWrite(this, newData, oldData), (result) => this._runHooks("post", "save", result));
      this.$ = this.eventBulks$.pipe(mergeMap((changeEventBulk) => rxChangeEventBulkToRxChangeEvents(changeEventBulk)));
      this.checkpoint$ = this.eventBulks$.pipe(map((changeEventBulk) => changeEventBulk.checkpoint));
      this._changeEventBuffer = createChangeEventBuffer(this.asRxCollection);
      var documentConstructor;
      this._docCache = new DocumentCache(this.schema.primaryPath, this.eventBulks$.pipe(filter((bulk) => !bulk.isLocal), map((bulk) => bulk.events)), (docData) => {
        if (!documentConstructor) {
          documentConstructor = getRxDocumentConstructor(this.asRxCollection);
        }
        return createNewRxDocument(this.asRxCollection, documentConstructor, docData);
      });
      var listenToRemoveSub = this.database.internalStore.changeStream().pipe(filter((bulk) => {
        var key = this.name + "-" + this.schema.version;
        var found = bulk.events.find((event) => {
          return event.documentData.context === "collection" && event.documentData.key === key && event.operation === "DELETE";
        });
        return !!found;
      })).subscribe(() => __async(this, null, function* () {
        yield this.close();
        yield Promise.all(this.onRemove.map((fn) => fn()));
      }));
      this._subs.push(listenToRemoveSub);
      var databaseStorageToken = yield this.database.storageToken;
      var subDocs = this.storageInstance.changeStream().subscribe((eventBulk) => {
        var changeEventBulk = {
          id: eventBulk.id,
          isLocal: false,
          internal: false,
          collectionName: this.name,
          storageToken: databaseStorageToken,
          events: eventBulk.events,
          databaseToken: this.database.token,
          checkpoint: eventBulk.checkpoint,
          context: eventBulk.context
        };
        this.database.$emit(changeEventBulk);
      });
      this._subs.push(subDocs);
      return PROMISE_RESOLVE_VOID;
    });
  };
  _proto.cleanup = function cleanup(_minimumDeletedTime) {
    ensureRxCollectionIsNotClosed(this);
    throw pluginMissing("cleanup");
  };
  _proto.migrationNeeded = function migrationNeeded() {
    throw pluginMissing("migration-schema");
  };
  _proto.getMigrationState = function getMigrationState() {
    throw pluginMissing("migration-schema");
  };
  _proto.startMigration = function startMigration(batchSize = 10) {
    ensureRxCollectionIsNotClosed(this);
    return this.getMigrationState().startMigration(batchSize);
  };
  _proto.migratePromise = function migratePromise(batchSize = 10) {
    return this.getMigrationState().migratePromise(batchSize);
  };
  _proto.insert = function insert(json) {
    return __async(this, null, function* () {
      ensureRxCollectionIsNotClosed(this);
      var writeResult = yield this.bulkInsert([json]);
      var isError = writeResult.error[0];
      throwIfIsStorageWriteError(this, json[this.schema.primaryPath], json, isError);
      var insertResult = ensureNotFalsy(writeResult.success[0]);
      return insertResult;
    });
  };
  _proto.insertIfNotExists = function insertIfNotExists(json) {
    return __async(this, null, function* () {
      var writeResult = yield this.bulkInsert([json]);
      if (writeResult.error.length > 0) {
        var error = writeResult.error[0];
        if (error.status === 409) {
          var conflictDocData = error.documentInDb;
          return mapDocumentsDataToCacheDocs(this._docCache, [conflictDocData])[0];
        } else {
          throw error;
        }
      }
      return writeResult.success[0];
    });
  };
  _proto.bulkInsert = function bulkInsert(docsData) {
    return __async(this, null, function* () {
      ensureRxCollectionIsNotClosed(this);
      if (docsData.length === 0) {
        return {
          success: [],
          error: []
        };
      }
      var primaryPath = this.schema.primaryPath;
      var ids = /* @__PURE__ */ new Set();
      var insertRows;
      if (this.hasHooks("pre", "insert")) {
        insertRows = yield Promise.all(docsData.map((docData2) => {
          var useDocData2 = fillObjectDataBeforeInsert(this.schema, docData2);
          return this._runHooks("pre", "insert", useDocData2).then(() => {
            ids.add(useDocData2[primaryPath]);
            return {
              document: useDocData2
            };
          });
        }));
      } else {
        insertRows = new Array(docsData.length);
        var _schema = this.schema;
        for (var index = 0; index < docsData.length; index++) {
          var docData = docsData[index];
          var useDocData = fillObjectDataBeforeInsert(_schema, docData);
          ids.add(useDocData[primaryPath]);
          insertRows[index] = {
            document: useDocData
          };
        }
      }
      if (ids.size !== docsData.length) {
        throw newRxError("COL22", {
          collection: this.name,
          args: {
            documents: docsData
          }
        });
      }
      var results = yield this.storageInstance.bulkWrite(insertRows, "rx-collection-bulk-insert");
      var rxDocuments;
      var collection = this;
      var ret = {
        get success() {
          if (!rxDocuments) {
            var success = getWrittenDocumentsFromBulkWriteResponse(collection.schema.primaryPath, insertRows, results);
            rxDocuments = mapDocumentsDataToCacheDocs(collection._docCache, success);
          }
          return rxDocuments;
        },
        error: results.error
      };
      if (this.hasHooks("post", "insert")) {
        var docsMap = /* @__PURE__ */ new Map();
        insertRows.forEach((row) => {
          var doc = row.document;
          docsMap.set(doc[primaryPath], doc);
        });
        yield Promise.all(ret.success.map((doc) => {
          return this._runHooks("post", "insert", docsMap.get(doc.primary), doc);
        }));
      }
      return ret;
    });
  };
  _proto.bulkRemove = function bulkRemove(idsOrDocs) {
    return __async(this, null, function* () {
      ensureRxCollectionIsNotClosed(this);
      var primaryPath = this.schema.primaryPath;
      if (idsOrDocs.length === 0) {
        return {
          success: [],
          error: []
        };
      }
      var rxDocumentMap;
      if (typeof idsOrDocs[0] === "string") {
        rxDocumentMap = yield this.findByIds(idsOrDocs).exec();
      } else {
        rxDocumentMap = /* @__PURE__ */ new Map();
        idsOrDocs.forEach((d) => rxDocumentMap.set(d.primary, d));
      }
      var docsData = [];
      var docsMap = /* @__PURE__ */ new Map();
      Array.from(rxDocumentMap.values()).forEach((rxDocument) => {
        var data = rxDocument.toMutableJSON(true);
        docsData.push(data);
        docsMap.set(rxDocument.primary, data);
      });
      yield Promise.all(docsData.map((doc) => {
        var primary = doc[this.schema.primaryPath];
        return this._runHooks("pre", "remove", doc, rxDocumentMap.get(primary));
      }));
      var removeDocs = docsData.map((doc) => {
        var writeDoc = flatClone(doc);
        writeDoc._deleted = true;
        return {
          previous: doc,
          document: writeDoc
        };
      });
      var results = yield this.storageInstance.bulkWrite(removeDocs, "rx-collection-bulk-remove");
      var success = getWrittenDocumentsFromBulkWriteResponse(this.schema.primaryPath, removeDocs, results);
      var deletedRxDocuments = [];
      var successIds = success.map((d) => {
        var id = d[primaryPath];
        var doc = this._docCache.getCachedRxDocument(d);
        deletedRxDocuments.push(doc);
        return id;
      });
      yield Promise.all(successIds.map((id) => {
        return this._runHooks("post", "remove", docsMap.get(id), rxDocumentMap.get(id));
      }));
      return {
        success: deletedRxDocuments,
        error: results.error
      };
    });
  };
  _proto.bulkUpsert = function bulkUpsert(docsData) {
    return __async(this, null, function* () {
      ensureRxCollectionIsNotClosed(this);
      var insertData = [];
      var useJsonByDocId = /* @__PURE__ */ new Map();
      docsData.forEach((docData) => {
        var useJson = fillObjectDataBeforeInsert(this.schema, docData);
        var primary = useJson[this.schema.primaryPath];
        if (!primary) {
          throw newRxError("COL3", {
            primaryPath: this.schema.primaryPath,
            data: useJson,
            schema: this.schema.jsonSchema
          });
        }
        useJsonByDocId.set(primary, useJson);
        insertData.push(useJson);
      });
      var insertResult = yield this.bulkInsert(insertData);
      var success = insertResult.success.slice(0);
      var error = [];
      yield Promise.all(insertResult.error.map((err) => __async(this, null, function* () {
        if (err.status !== 409) {
          error.push(err);
        } else {
          var id = err.documentId;
          var writeData = getFromMapOrThrow(useJsonByDocId, id);
          var docDataInDb = ensureNotFalsy(err.documentInDb);
          var doc = this._docCache.getCachedRxDocuments([docDataInDb])[0];
          var newDoc = yield doc.incrementalModify(() => writeData);
          success.push(newDoc);
        }
      })));
      return {
        error,
        success
      };
    });
  };
  _proto.upsert = function upsert(json) {
    return __async(this, null, function* () {
      ensureRxCollectionIsNotClosed(this);
      var bulkResult = yield this.bulkUpsert([json]);
      throwIfIsStorageWriteError(this.asRxCollection, json[this.schema.primaryPath], json, bulkResult.error[0]);
      return bulkResult.success[0];
    });
  };
  _proto.incrementalUpsert = function incrementalUpsert(json) {
    ensureRxCollectionIsNotClosed(this);
    var useJson = fillObjectDataBeforeInsert(this.schema, json);
    var primary = useJson[this.schema.primaryPath];
    if (!primary) {
      throw newRxError("COL4", {
        data: json
      });
    }
    var queue = this._incrementalUpsertQueues.get(primary);
    if (!queue) {
      queue = PROMISE_RESOLVE_VOID;
    }
    queue = queue.then(() => _incrementalUpsertEnsureRxDocumentExists(this, primary, useJson)).then((wasInserted) => {
      if (!wasInserted.inserted) {
        return _incrementalUpsertUpdate(wasInserted.doc, useJson);
      } else {
        return wasInserted.doc;
      }
    });
    this._incrementalUpsertQueues.set(primary, queue);
    return queue;
  };
  _proto.find = function find(queryObj) {
    ensureRxCollectionIsNotClosed(this);
    runPluginHooks("prePrepareRxQuery", {
      op: "find",
      queryObj,
      collection: this
    });
    if (!queryObj) {
      queryObj = _getDefaultQuery();
    }
    var query = createRxQuery("find", queryObj, this);
    return query;
  };
  _proto.findOne = function findOne(queryObj) {
    ensureRxCollectionIsNotClosed(this);
    runPluginHooks("prePrepareRxQuery", {
      op: "findOne",
      queryObj,
      collection: this
    });
    var query;
    if (typeof queryObj === "string") {
      query = createRxQuery("findOne", {
        selector: {
          [this.schema.primaryPath]: queryObj
        },
        limit: 1
      }, this);
    } else {
      if (!queryObj) {
        queryObj = _getDefaultQuery();
      }
      if (queryObj.limit) {
        throw newRxError("QU6");
      }
      queryObj = flatClone(queryObj);
      queryObj.limit = 1;
      query = createRxQuery("findOne", queryObj, this);
    }
    return query;
  };
  _proto.count = function count(queryObj) {
    ensureRxCollectionIsNotClosed(this);
    if (!queryObj) {
      queryObj = _getDefaultQuery();
    }
    var query = createRxQuery("count", queryObj, this);
    return query;
  };
  _proto.findByIds = function findByIds(ids) {
    ensureRxCollectionIsNotClosed(this);
    var mangoQuery = {
      selector: {
        [this.schema.primaryPath]: {
          $in: ids.slice(0)
        }
      }
    };
    var query = createRxQuery("findByIds", mangoQuery, this);
    return query;
  };
  _proto.exportJSON = function exportJSON() {
    throw pluginMissing("json-dump");
  };
  _proto.importJSON = function importJSON(_exportedJSON) {
    throw pluginMissing("json-dump");
  };
  _proto.insertCRDT = function insertCRDT(_updateObj) {
    throw pluginMissing("crdt");
  };
  _proto.addPipeline = function addPipeline(_options) {
    throw pluginMissing("pipeline");
  };
  _proto.addHook = function addHook(when, key, fun, parallel = false) {
    if (typeof fun !== "function") {
      throw newRxTypeError("COL7", {
        key,
        when
      });
    }
    if (!HOOKS_WHEN.includes(when)) {
      throw newRxTypeError("COL8", {
        key,
        when
      });
    }
    if (!HOOKS_KEYS.includes(key)) {
      throw newRxError("COL9", {
        key
      });
    }
    if (when === "post" && key === "create" && parallel === true) {
      throw newRxError("COL10", {
        when,
        key,
        parallel
      });
    }
    var boundFun = fun.bind(this);
    var runName = parallel ? "parallel" : "series";
    this.hooks[key] = this.hooks[key] || {};
    this.hooks[key][when] = this.hooks[key][when] || {
      series: [],
      parallel: []
    };
    this.hooks[key][when][runName].push(boundFun);
  };
  _proto.getHooks = function getHooks(when, key) {
    if (!this.hooks[key] || !this.hooks[key][when]) {
      return {
        series: [],
        parallel: []
      };
    }
    return this.hooks[key][when];
  };
  _proto.hasHooks = function hasHooks(when, key) {
    if (!this.hooks[key] || !this.hooks[key][when]) {
      return false;
    }
    var hooks = this.getHooks(when, key);
    if (!hooks) {
      return false;
    }
    return hooks.series.length > 0 || hooks.parallel.length > 0;
  };
  _proto._runHooks = function _runHooks(when, key, data, instance) {
    var hooks = this.getHooks(when, key);
    if (!hooks) {
      return PROMISE_RESOLVE_VOID;
    }
    var tasks = hooks.series.map((hook) => () => hook(data, instance));
    return promiseSeries(tasks).then(() => Promise.all(hooks.parallel.map((hook) => hook(data, instance))));
  };
  _proto._runHooksSync = function _runHooksSync(when, key, data, instance) {
    if (!this.hasHooks(when, key)) {
      return;
    }
    var hooks = this.getHooks(when, key);
    if (!hooks) return;
    hooks.series.forEach((hook) => hook(data, instance));
  };
  _proto.promiseWait = function promiseWait(time) {
    var ret = new Promise((res) => {
      var timeout = setTimeout(() => {
        this.timeouts.delete(timeout);
        res();
      }, time);
      this.timeouts.add(timeout);
    });
    return ret;
  };
  _proto.close = function close() {
    return __async(this, null, function* () {
      if (this.closed) {
        return PROMISE_RESOLVE_FALSE;
      }
      OPEN_COLLECTIONS.delete(this);
      yield Promise.all(this.onClose.map((fn) => fn()));
      this.closed = true;
      Array.from(this.timeouts).forEach((timeout) => clearTimeout(timeout));
      if (this._changeEventBuffer) {
        this._changeEventBuffer.close();
      }
      return this.database.requestIdlePromise().then(() => this.storageInstance.close()).then(() => {
        this._subs.forEach((sub) => sub.unsubscribe());
        delete this.database.collections[this.name];
        return runAsyncPluginHooks("postCloseRxCollection", this).then(() => true);
      });
    });
  };
  _proto.remove = function remove() {
    return __async(this, null, function* () {
      yield this.close();
      yield Promise.all(this.onRemove.map((fn) => fn()));
      yield removeCollectionStorages(this.database.storage, this.database.internalStore, this.database.token, this.database.name, this.name, this.database.multiInstance, this.database.password, this.database.hashFunction);
    });
  };
  return _createClass(RxCollectionBase2, [{
    key: "insert$",
    get: function() {
      return this.$.pipe(filter((cE) => cE.operation === "INSERT"));
    }
  }, {
    key: "update$",
    get: function() {
      return this.$.pipe(filter((cE) => cE.operation === "UPDATE"));
    }
  }, {
    key: "remove$",
    get: function() {
      return this.$.pipe(filter((cE) => cE.operation === "DELETE"));
    }
    // defaults
    /**
     * Internally only use eventBulks$
     * Do not use .$ or .observable$ because that has to transform
     * the events which decreases performance.
     */
    /**
     * When the collection is closed,
     * these functions will be called an awaited.
     * Used to automatically clean up stuff that
     * belongs to this collection.
    */
  }, {
    key: "asRxCollection",
    get: function() {
      return this;
    }
  }]);
}();
function _applyHookFunctions(collection) {
  if (hooksApplied) return;
  hooksApplied = true;
  var colProto = Object.getPrototypeOf(collection);
  HOOKS_KEYS.forEach((key) => {
    HOOKS_WHEN.map((when) => {
      var fnName = when + ucfirst(key);
      colProto[fnName] = function(fun, parallel) {
        return this.addHook(when, key, fun, parallel);
      };
    });
  });
}
function _incrementalUpsertUpdate(doc, json) {
  return doc.incrementalModify((_innerDoc) => {
    return json;
  });
}
function _incrementalUpsertEnsureRxDocumentExists(rxCollection, primary, json) {
  var docDataFromCache = rxCollection._docCache.getLatestDocumentDataIfExists(primary);
  if (docDataFromCache) {
    return Promise.resolve({
      doc: rxCollection._docCache.getCachedRxDocuments([docDataFromCache])[0],
      inserted: false
    });
  }
  return rxCollection.findOne(primary).exec().then((doc) => {
    if (!doc) {
      return rxCollection.insert(json).then((newDoc) => ({
        doc: newDoc,
        inserted: true
      }));
    } else {
      return {
        doc,
        inserted: false
      };
    }
  });
}
function createRxCollection(_0) {
  return __async(this, arguments, function* ({
    database,
    name,
    schema,
    instanceCreationOptions = {},
    migrationStrategies = {},
    autoMigrate = true,
    statics = {},
    methods = {},
    attachments = {},
    options = {},
    localDocuments = false,
    cacheReplacementPolicy = defaultCacheReplacementPolicy,
    conflictHandler = defaultConflictHandler
  }) {
    var storageInstanceCreationParams = {
      databaseInstanceToken: database.token,
      databaseName: database.name,
      collectionName: name,
      schema: schema.jsonSchema,
      options: instanceCreationOptions,
      multiInstance: database.multiInstance,
      password: database.password,
      devMode: overwritable.isDevMode()
    };
    runPluginHooks("preCreateRxStorageInstance", storageInstanceCreationParams);
    var storageInstance = yield createRxCollectionStorageInstance(database, storageInstanceCreationParams);
    var collection = new RxCollectionBase(database, name, schema, storageInstance, instanceCreationOptions, migrationStrategies, methods, attachments, options, cacheReplacementPolicy, statics, conflictHandler);
    try {
      yield collection.prepare();
      Object.entries(statics).forEach(([funName, fun]) => {
        Object.defineProperty(collection, funName, {
          get: () => fun.bind(collection)
        });
      });
      runPluginHooks("createRxCollection", {
        collection,
        creator: {
          name,
          schema,
          storageInstance,
          instanceCreationOptions,
          migrationStrategies,
          methods,
          attachments,
          options,
          cacheReplacementPolicy,
          localDocuments,
          statics
        }
      });
      if (autoMigrate && collection.schema.version !== 0) {
        yield collection.migratePromise();
      }
    } catch (err) {
      OPEN_COLLECTIONS.delete(collection);
      yield storageInstance.close();
      throw err;
    }
    return collection;
  });
}
function isRxCollection(obj) {
  return obj instanceof RxCollectionBase;
}

// node_modules/custom-idle-queue/dist/es/index.js
var IdleQueue = function IdleQueue2() {
  var parallels = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 1;
  this._parallels = parallels || 1;
  this._qC = 0;
  this._iC = /* @__PURE__ */ new Set();
  this._lHN = 0;
  this._hPM = /* @__PURE__ */ new Map();
  this._pHM = /* @__PURE__ */ new Map();
};
IdleQueue.prototype = {
  isIdle: function isIdle() {
    return this._qC < this._parallels;
  },
  /**
   * creates a lock in the queue
   * and returns an unlock-function to remove the lock from the queue
   * @return {function} unlock function than must be called afterwards
   */
  lock: function lock() {
    this._qC++;
  },
  unlock: function unlock() {
    this._qC--;
    _tryIdleCall(this);
  },
  /**
   * wraps a function with lock/unlock and runs it
   * @performance is really important here because
   * it is often used in hot paths.
   * @param  {function}  fun
   * @return {Promise<any>}
   */
  wrapCall: function wrapCall(fun) {
    var _this = this;
    this._qC++;
    var maybePromise;
    try {
      maybePromise = fun();
    } catch (err) {
      this.unlock();
      throw err;
    }
    if (!maybePromise.then || typeof maybePromise.then !== "function") {
      this.unlock();
      return maybePromise;
    } else {
      return maybePromise.then(function(ret) {
        _this.unlock();
        return ret;
      })["catch"](function(err) {
        _this.unlock();
        throw err;
      });
    }
  },
  /**
   * does the same as requestIdleCallback() but uses promises instead of the callback
   * @param {{timeout?: number}} options like timeout
   * @return {Promise<void>} promise that resolves when the database is in idle-mode
   */
  requestIdlePromise: function requestIdlePromise2(options) {
    var _this2 = this;
    options = options || {};
    var resolve;
    var prom = new Promise(function(res) {
      return resolve = res;
    });
    var resolveFromOutside = function resolveFromOutside2() {
      _removeIdlePromise(_this2, prom);
      resolve();
    };
    prom._manRes = resolveFromOutside;
    if (options.timeout) {
      var timeoutObj = setTimeout(function() {
        prom._manRes();
      }, options.timeout);
      prom._timeoutObj = timeoutObj;
    }
    this._iC.add(prom);
    _tryIdleCall(this);
    return prom;
  },
  /**
   * remove the promise so it will never be resolved
   * @param  {Promise} promise from requestIdlePromise()
   * @return {void}
   */
  cancelIdlePromise: function cancelIdlePromise(promise) {
    _removeIdlePromise(this, promise);
  },
  /**
   * api equal to
   * @link https://developer.mozilla.org/en-US/docs/Web/API/Window/requestIdleCallback
   * @param  {Function} callback
   * @param  {options}   options  [description]
   * @return {number} handle which can be used with cancelIdleCallback()
   */
  requestIdleCallback: function requestIdleCallback(callback, options) {
    var handle = this._lHN++;
    var promise = this.requestIdlePromise(options);
    this._hPM.set(handle, promise);
    this._pHM.set(promise, handle);
    promise.then(function() {
      return callback();
    });
    return handle;
  },
  /**
   * API equal to
   * @link https://developer.mozilla.org/en-US/docs/Web/API/Window/cancelIdleCallback
   * @param  {number} handle returned from requestIdleCallback()
   * @return {void}
   */
  cancelIdleCallback: function cancelIdleCallback(handle) {
    var promise = this._hPM.get(handle);
    this.cancelIdlePromise(promise);
  },
  /**
   * clears and resets everything
   * @return {void}
   */
  clear: function clear() {
    var _this3 = this;
    this._iC.forEach(function(promise) {
      return _removeIdlePromise(_this3, promise);
    });
    this._qC = 0;
    this._iC.clear();
    this._hPM = /* @__PURE__ */ new Map();
    this._pHM = /* @__PURE__ */ new Map();
  }
};
function _resolveOneIdleCall(idleQueue) {
  if (idleQueue._iC.size === 0) return;
  var iterator = idleQueue._iC.values();
  var oldestPromise = iterator.next().value;
  oldestPromise._manRes();
  setTimeout(function() {
    return _tryIdleCall(idleQueue);
  }, 0);
}
function _removeIdlePromise(idleQueue, promise) {
  if (!promise) return;
  if (promise._timeoutObj) clearTimeout(promise._timeoutObj);
  if (idleQueue._pHM.has(promise)) {
    var handle = idleQueue._pHM.get(promise);
    idleQueue._hPM["delete"](handle);
    idleQueue._pHM["delete"](promise);
  }
  idleQueue._iC["delete"](promise);
}
function _tryIdleCall(idleQueue) {
  if (idleQueue._tryIR || idleQueue._iC.size === 0) return;
  idleQueue._tryIR = true;
  setTimeout(function() {
    if (!idleQueue.isIdle()) {
      idleQueue._tryIR = false;
      return;
    }
    setTimeout(function() {
      if (!idleQueue.isIdle()) {
        idleQueue._tryIR = false;
        return;
      }
      _resolveOneIdleCall(idleQueue);
      idleQueue._tryIR = false;
    }, 0);
  }, 0);
}

// node_modules/rxdb/dist/esm/rx-database.js
var USED_DATABASE_NAMES = /* @__PURE__ */ new Set();
var DATABASE_UNCLOSED_INSTANCE_PROMISE_MAP = /* @__PURE__ */ new Map();
var DB_COUNT = 0;
var RxDatabaseBase = function() {
  function RxDatabaseBase2(name, token, storage, instanceCreationOptions, password, multiInstance, eventReduce = false, options = {}, internalStore, hashFunction, cleanupPolicy, allowSlowCount, reactivity, onClosed) {
    this.idleQueue = new IdleQueue();
    this.rxdbVersion = RXDB_VERSION;
    this.storageInstances = /* @__PURE__ */ new Set();
    this._subs = [];
    this.startupErrors = [];
    this.onClose = [];
    this.closed = false;
    this.collections = {};
    this.states = {};
    this.eventBulks$ = new Subject();
    this.closePromise = null;
    this.observable$ = this.eventBulks$.pipe(mergeMap((changeEventBulk) => rxChangeEventBulkToRxChangeEvents(changeEventBulk)));
    this.storageToken = PROMISE_RESOLVE_FALSE;
    this.storageTokenDocument = PROMISE_RESOLVE_FALSE;
    this.emittedEventBulkIds = new ObliviousSet(60 * 1e3);
    this.name = name;
    this.token = token;
    this.storage = storage;
    this.instanceCreationOptions = instanceCreationOptions;
    this.password = password;
    this.multiInstance = multiInstance;
    this.eventReduce = eventReduce;
    this.options = options;
    this.internalStore = internalStore;
    this.hashFunction = hashFunction;
    this.cleanupPolicy = cleanupPolicy;
    this.allowSlowCount = allowSlowCount;
    this.reactivity = reactivity;
    this.onClosed = onClosed;
    DB_COUNT++;
    if (this.name !== "pseudoInstance") {
      this.internalStore = getWrappedStorageInstance(this.asRxDatabase, internalStore, INTERNAL_STORE_SCHEMA);
      this.storageTokenDocument = ensureStorageTokenDocumentExists(this.asRxDatabase).catch((err) => this.startupErrors.push(err));
      this.storageToken = this.storageTokenDocument.then((doc) => doc.data.token).catch((err) => this.startupErrors.push(err));
    }
  }
  var _proto = RxDatabaseBase2.prototype;
  _proto.getReactivityFactory = function getReactivityFactory() {
    if (!this.reactivity) {
      throw newRxError("DB14", {
        database: this.name
      });
    }
    return this.reactivity;
  };
  _proto.$emit = function $emit(changeEventBulk) {
    if (this.emittedEventBulkIds.has(changeEventBulk.id)) {
      return;
    }
    this.emittedEventBulkIds.add(changeEventBulk.id);
    this.eventBulks$.next(changeEventBulk);
  };
  _proto.removeCollectionDoc = function removeCollectionDoc(name, schema) {
    return __async(this, null, function* () {
      var doc = yield getSingleDocument(this.internalStore, getPrimaryKeyOfInternalDocument(_collectionNamePrimary(name, schema), INTERNAL_CONTEXT_COLLECTION));
      if (!doc) {
        throw newRxError("SNH", {
          name,
          schema
        });
      }
      var writeDoc = flatCloneDocWithMeta(doc);
      writeDoc._deleted = true;
      yield this.internalStore.bulkWrite([{
        document: writeDoc,
        previous: doc
      }], "rx-database-remove-collection");
    });
  };
  _proto.addCollections = function addCollections(collectionCreators) {
    return __async(this, null, function* () {
      var jsonSchemas = {};
      var schemas = {};
      var bulkPutDocs = [];
      var useArgsByCollectionName = {};
      yield Promise.all(Object.entries(collectionCreators).map((_0) => __async(this, [_0], function* ([name, args]) {
        var collectionName = name;
        var rxJsonSchema = args.schema;
        jsonSchemas[collectionName] = rxJsonSchema;
        var schema = createRxSchema(rxJsonSchema, this.hashFunction);
        schemas[collectionName] = schema;
        if (this.collections[name]) {
          throw newRxError("DB3", {
            name
          });
        }
        var collectionNameWithVersion = _collectionNamePrimary(name, rxJsonSchema);
        var collectionDocData = {
          id: getPrimaryKeyOfInternalDocument(collectionNameWithVersion, INTERNAL_CONTEXT_COLLECTION),
          key: collectionNameWithVersion,
          context: INTERNAL_CONTEXT_COLLECTION,
          data: {
            name: collectionName,
            schemaHash: yield schema.hash,
            schema: schema.jsonSchema,
            version: schema.version,
            connectedStorages: []
          },
          _deleted: false,
          _meta: getDefaultRxDocumentMeta(),
          _rev: getDefaultRevision(),
          _attachments: {}
        };
        bulkPutDocs.push({
          document: collectionDocData
        });
        var useArgs = Object.assign({}, args, {
          name: collectionName,
          schema,
          database: this
        });
        var hookData = flatClone(args);
        hookData.database = this;
        hookData.name = name;
        runPluginHooks("preCreateRxCollection", hookData);
        useArgs.conflictHandler = hookData.conflictHandler;
        useArgsByCollectionName[collectionName] = useArgs;
      })));
      var putDocsResult = yield this.internalStore.bulkWrite(bulkPutDocs, "rx-database-add-collection");
      yield ensureNoStartupErrors(this);
      yield Promise.all(putDocsResult.error.map((error) => __async(this, null, function* () {
        if (error.status !== 409) {
          throw newRxError("DB12", {
            database: this.name,
            writeError: error
          });
        }
        var docInDb = ensureNotFalsy(error.documentInDb);
        var collectionName = docInDb.data.name;
        var schema = schemas[collectionName];
        if (docInDb.data.schemaHash !== (yield schema.hash)) {
          throw newRxError("DB6", {
            database: this.name,
            collection: collectionName,
            previousSchemaHash: docInDb.data.schemaHash,
            schemaHash: yield schema.hash,
            previousSchema: docInDb.data.schema,
            schema: ensureNotFalsy(jsonSchemas[collectionName])
          });
        }
      })));
      var ret = {};
      yield Promise.all(Object.keys(collectionCreators).map((collectionName) => __async(this, null, function* () {
        var useArgs = useArgsByCollectionName[collectionName];
        var collection = yield createRxCollection(useArgs);
        ret[collectionName] = collection;
        this.collections[collectionName] = collection;
        if (!this[collectionName]) {
          Object.defineProperty(this, collectionName, {
            get: () => this.collections[collectionName]
          });
        }
      })));
      return ret;
    });
  };
  _proto.lockedRun = function lockedRun(fn) {
    return this.idleQueue.wrapCall(fn);
  };
  _proto.requestIdlePromise = function requestIdlePromise3() {
    return this.idleQueue.requestIdlePromise();
  };
  _proto.exportJSON = function exportJSON(_collections) {
    throw pluginMissing("json-dump");
  };
  _proto.addState = function addState(_name) {
    throw pluginMissing("state");
  };
  _proto.importJSON = function importJSON(_exportedJSON) {
    throw pluginMissing("json-dump");
  };
  _proto.backup = function backup(_options) {
    throw pluginMissing("backup");
  };
  _proto.leaderElector = function leaderElector() {
    throw pluginMissing("leader-election");
  };
  _proto.isLeader = function isLeader() {
    throw pluginMissing("leader-election");
  };
  _proto.waitForLeadership = function waitForLeadership() {
    throw pluginMissing("leader-election");
  };
  _proto.migrationStates = function migrationStates() {
    throw pluginMissing("migration-schema");
  };
  _proto.close = function close() {
    if (this.closePromise) {
      return this.closePromise;
    }
    var {
      promise,
      resolve
    } = createPromiseWithResolvers();
    var resolveClosePromise = (result) => {
      if (this.onClosed) {
        this.onClosed();
      }
      this.closed = true;
      resolve(result);
    };
    this.closePromise = promise;
    (() => __async(this, null, function* () {
      yield runAsyncPluginHooks("preCloseRxDatabase", this);
      this.eventBulks$.complete();
      DB_COUNT--;
      this._subs.map((sub) => sub.unsubscribe());
      if (this.name === "pseudoInstance") {
        resolveClosePromise(false);
        return;
      }
      return this.requestIdlePromise().then(() => Promise.all(this.onClose.map((fn) => fn()))).then(() => Promise.all(Object.keys(this.collections).map((key) => this.collections[key]).map((col) => col.close()))).then(() => this.internalStore.close()).then(() => resolveClosePromise(true));
    }))();
    return promise;
  };
  _proto.remove = function remove() {
    return this.close().then(() => removeRxDatabase(this.name, this.storage, this.multiInstance, this.password));
  };
  return _createClass(RxDatabaseBase2, [{
    key: "$",
    get: function() {
      return this.observable$;
    }
  }, {
    key: "asRxDatabase",
    get: function() {
      return this;
    }
  }]);
}();
function throwIfDatabaseNameUsed(name, storage) {
  if (USED_DATABASE_NAMES.has(getDatabaseNameKey(name, storage))) {
    throw newRxError("DB8", {
      name,
      storage: storage.name,
      link: "https://rxdb.info/rx-database.html#ignoreduplicate"
    });
  }
}
function createPromiseWithResolvers() {
  var resolve;
  var reject;
  var promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return {
    promise,
    resolve,
    reject
  };
}
function getDatabaseNameKey(name, storage) {
  return storage.name + "|" + name;
}
function createRxDatabaseStorageInstance(databaseInstanceToken, storage, databaseName, options, multiInstance, password) {
  return __async(this, null, function* () {
    var internalStore = yield storage.createStorageInstance({
      databaseInstanceToken,
      databaseName,
      collectionName: INTERNAL_STORAGE_NAME,
      schema: INTERNAL_STORE_SCHEMA,
      options,
      multiInstance,
      password,
      devMode: overwritable.isDevMode()
    });
    return internalStore;
  });
}
function createRxDatabase({
  storage,
  instanceCreationOptions,
  name,
  password,
  multiInstance = true,
  eventReduce = true,
  ignoreDuplicate = false,
  options = {},
  cleanupPolicy,
  closeDuplicates = false,
  allowSlowCount = false,
  localDocuments = false,
  hashFunction = defaultHashSha256,
  reactivity
}) {
  runPluginHooks("preCreateRxDatabase", {
    storage,
    instanceCreationOptions,
    name,
    password,
    multiInstance,
    eventReduce,
    ignoreDuplicate,
    options,
    localDocuments
  });
  var databaseNameKey = getDatabaseNameKey(name, storage);
  var databaseNameKeyUnclosedInstancesSet = DATABASE_UNCLOSED_INSTANCE_PROMISE_MAP.get(databaseNameKey) || /* @__PURE__ */ new Set();
  var instancePromiseWithResolvers = createPromiseWithResolvers();
  var closeDuplicatesPromises = Array.from(databaseNameKeyUnclosedInstancesSet);
  var onInstanceClosed = () => {
    databaseNameKeyUnclosedInstancesSet.delete(instancePromiseWithResolvers.promise);
    USED_DATABASE_NAMES.delete(databaseNameKey);
  };
  databaseNameKeyUnclosedInstancesSet.add(instancePromiseWithResolvers.promise);
  DATABASE_UNCLOSED_INSTANCE_PROMISE_MAP.set(databaseNameKey, databaseNameKeyUnclosedInstancesSet);
  (() => __async(null, null, function* () {
    if (closeDuplicates) {
      yield Promise.all(closeDuplicatesPromises.map((unclosedInstancePromise) => unclosedInstancePromise.catch(() => null).then((instance) => instance && instance.close())));
    }
    if (ignoreDuplicate) {
      if (!overwritable.isDevMode()) {
        throw newRxError("DB9", {
          database: name
        });
      }
    } else {
      throwIfDatabaseNameUsed(name, storage);
    }
    USED_DATABASE_NAMES.add(databaseNameKey);
    var databaseInstanceToken = randomToken(10);
    var storageInstance = yield createRxDatabaseStorageInstance(databaseInstanceToken, storage, name, instanceCreationOptions, multiInstance, password);
    var rxDatabase = new RxDatabaseBase(name, databaseInstanceToken, storage, instanceCreationOptions, password, multiInstance, eventReduce, options, storageInstance, hashFunction, cleanupPolicy, allowSlowCount, reactivity, onInstanceClosed);
    yield runAsyncPluginHooks("createRxDatabase", {
      database: rxDatabase,
      creator: {
        storage,
        instanceCreationOptions,
        name,
        password,
        multiInstance,
        eventReduce,
        ignoreDuplicate,
        options,
        localDocuments
      }
    });
    return rxDatabase;
  }))().then((rxDatabase) => {
    instancePromiseWithResolvers.resolve(rxDatabase);
  }).catch((err) => {
    instancePromiseWithResolvers.reject(err);
    onInstanceClosed();
  });
  return instancePromiseWithResolvers.promise;
}
function removeRxDatabase(databaseName, storage, multiInstance = true, password) {
  return __async(this, null, function* () {
    var databaseInstanceToken = randomToken(10);
    var dbInternalsStorageInstance = yield createRxDatabaseStorageInstance(databaseInstanceToken, storage, databaseName, {}, multiInstance, password);
    var collectionDocs = yield getAllCollectionDocuments(dbInternalsStorageInstance);
    var collectionNames = /* @__PURE__ */ new Set();
    collectionDocs.forEach((doc) => collectionNames.add(doc.data.name));
    var removedCollectionNames = Array.from(collectionNames);
    yield Promise.all(removedCollectionNames.map((collectionName) => removeCollectionStorages(storage, dbInternalsStorageInstance, databaseInstanceToken, databaseName, collectionName, multiInstance, password)));
    yield runAsyncPluginHooks("postRemoveRxDatabase", {
      databaseName,
      storage
    });
    yield dbInternalsStorageInstance.remove();
    return removedCollectionNames;
  });
}
function isRxDatabase(obj) {
  return obj instanceof RxDatabaseBase;
}
function dbCount() {
  return DB_COUNT;
}
function isRxDatabaseFirstTimeInstantiated(database) {
  return __async(this, null, function* () {
    var tokenDoc = yield database.storageTokenDocument;
    return tokenDoc.data.instanceToken === database.token;
  });
}
function ensureNoStartupErrors(rxDatabase) {
  return __async(this, null, function* () {
    yield rxDatabase.storageToken;
    if (rxDatabase.startupErrors[0]) {
      throw rxDatabase.startupErrors[0];
    }
  });
}

export {
  RxSchema,
  getIndexes,
  getPreviousVersions,
  createRxSchema,
  isRxSchema,
  toTypedRxJsonSchema,
  getDocumentDataOfRxChangeEvent,
  rxChangeEventToEventReduceChangeEvent,
  flattenEvents,
  rxChangeEventBulkToRxChangeEvents,
  basePrototype,
  createRxDocumentConstructor,
  createWithConstructor,
  isRxDocument,
  beforeDocumentUpdateWrite,
  QueryCache,
  createQueryCache,
  uncacheRxQuery,
  countRxQuerySubscribers,
  DEFAULT_TRY_TO_KEEP_MAX,
  DEFAULT_UNEXECUTED_LIFETIME,
  defaultCacheReplacementPolicyMonad,
  defaultCacheReplacementPolicy,
  COLLECTIONS_WITH_RUNNING_CLEANUP,
  triggerCacheReplacement,
  RxQuerySingleResult,
  RxQueryBase,
  _getDefaultQuery,
  tunnelQueryCache,
  createRxQuery,
  queryCollection,
  isFindOneByIdQuery,
  isRxQuery,
  INTERNAL_CONTEXT_COLLECTION,
  INTERNAL_CONTEXT_STORAGE_TOKEN,
  INTERNAL_CONTEXT_MIGRATION_STATUS,
  INTERNAL_CONTEXT_PIPELINE_CHECKPOINT,
  INTERNAL_STORE_SCHEMA_TITLE,
  INTERNAL_STORE_SCHEMA,
  getPrimaryKeyOfInternalDocument,
  getAllCollectionDocuments,
  STORAGE_TOKEN_DOCUMENT_KEY,
  STORAGE_TOKEN_DOCUMENT_ID,
  ensureStorageTokenDocumentExists,
  isDatabaseStateVersionCompatibleWithDatabaseCode,
  addConnectedStorageToCollection,
  removeConnectedStorageFromCollection,
  _collectionNamePrimary,
  fillObjectDataBeforeInsert,
  createRxCollectionStorageInstance,
  removeCollectionStorages,
  ensureRxCollectionIsNotClosed,
  getDocumentPrototype,
  getRxDocumentConstructor,
  createNewRxDocument,
  getDocumentOrmPrototype,
  defaultConflictHandler,
  OPEN_COLLECTIONS,
  RxCollectionBase,
  createRxCollection,
  isRxCollection,
  RxDatabaseBase,
  createRxDatabaseStorageInstance,
  createRxDatabase,
  removeRxDatabase,
  isRxDatabase,
  dbCount,
  isRxDatabaseFirstTimeInstantiated,
  ensureNoStartupErrors
};
//# sourceMappingURL=chunk-LK43A4VV.js.map
