import {
  flatClone,
  getFromMapOrCreate,
  getPrimaryFieldOfPrimaryKey,
  requestIdleCallbackIfAvailable
} from "./chunk-GXT3KPMX.js";
import {
  firstValueFrom
} from "./chunk-WCYHURJF.js";
import {
  BehaviorSubject,
  filter,
  mergeMap,
  tap
} from "./chunk-3TXA6K3X.js";
import {
  __async
} from "./chunk-7RSYZEEK.js";

// node_modules/rxdb/dist/esm/plugin-helpers.js
var VALIDATOR_CACHE_BY_VALIDATOR_KEY = /* @__PURE__ */ new Map();
function wrappedValidateStorageFactory(getValidator, validatorKey) {
  var VALIDATOR_CACHE = getFromMapOrCreate(VALIDATOR_CACHE_BY_VALIDATOR_KEY, validatorKey, () => /* @__PURE__ */ new Map());
  function initValidator(schema) {
    return getFromMapOrCreate(VALIDATOR_CACHE, JSON.stringify(schema), () => getValidator(schema));
  }
  return (args) => {
    return Object.assign({}, args.storage, {
      name: "validate-" + validatorKey + "-" + args.storage.name,
      createStorageInstance(params) {
        return __async(this, null, function* () {
          var instance = yield args.storage.createStorageInstance(params);
          var primaryPath = getPrimaryFieldOfPrimaryKey(params.schema.primaryKey);
          var validatorCached;
          requestIdleCallbackIfAvailable(() => validatorCached = initValidator(params.schema));
          var oldBulkWrite = instance.bulkWrite.bind(instance);
          instance.bulkWrite = (documentWrites, context) => {
            if (!validatorCached) {
              validatorCached = initValidator(params.schema);
            }
            var errors = [];
            var continueWrites = [];
            documentWrites.forEach((row) => {
              var documentId = row.document[primaryPath];
              var validationErrors = validatorCached(row.document);
              if (validationErrors.length > 0) {
                errors.push({
                  status: 422,
                  isError: true,
                  documentId,
                  writeRow: row,
                  validationErrors,
                  schema: instance.schema
                });
              } else {
                continueWrites.push(row);
              }
            });
            var writePromise = continueWrites.length > 0 ? oldBulkWrite(continueWrites, context) : Promise.resolve({
              error: [],
              success: []
            });
            return writePromise.then((writeResult) => {
              errors.forEach((validationError) => {
                writeResult.error.push(validationError);
              });
              return writeResult;
            });
          };
          return instance;
        });
      }
    });
  };
}
function wrapRxStorageInstance(originalSchema, instance, modifyToStorage, modifyFromStorage, modifyAttachmentFromStorage = (v) => v) {
  function toStorage(docData) {
    return __async(this, null, function* () {
      if (!docData) {
        return docData;
      }
      return yield modifyToStorage(docData);
    });
  }
  function fromStorage(docData) {
    return __async(this, null, function* () {
      if (!docData) {
        return docData;
      }
      return yield modifyFromStorage(docData);
    });
  }
  function errorFromStorage(error) {
    return __async(this, null, function* () {
      var ret = flatClone(error);
      ret.writeRow = flatClone(ret.writeRow);
      if (ret.documentInDb) {
        ret.documentInDb = yield fromStorage(ret.documentInDb);
      }
      if (ret.writeRow.previous) {
        ret.writeRow.previous = yield fromStorage(ret.writeRow.previous);
      }
      ret.writeRow.document = yield fromStorage(ret.writeRow.document);
      return ret;
    });
  }
  var processingChangesCount$ = new BehaviorSubject(0);
  var wrappedInstance = {
    databaseName: instance.databaseName,
    internals: instance.internals,
    cleanup: instance.cleanup.bind(instance),
    options: instance.options,
    close: instance.close.bind(instance),
    schema: originalSchema,
    collectionName: instance.collectionName,
    count: instance.count.bind(instance),
    remove: instance.remove.bind(instance),
    originalStorageInstance: instance,
    bulkWrite: (documentWrites, context) => __async(null, null, function* () {
      var useRows = [];
      yield Promise.all(documentWrites.map((row) => __async(null, null, function* () {
        var [previous, document] = yield Promise.all([row.previous ? toStorage(row.previous) : void 0, toStorage(row.document)]);
        useRows.push({
          previous,
          document
        });
      })));
      var writeResult = yield instance.bulkWrite(useRows, context);
      var ret = {
        error: []
      };
      var promises = [];
      writeResult.error.forEach((error) => {
        promises.push(errorFromStorage(error).then((err) => ret.error.push(err)));
      });
      yield Promise.all(promises);
      yield firstValueFrom(processingChangesCount$.pipe(filter((v) => v === 0)));
      return ret;
    }),
    query: (preparedQuery) => {
      return instance.query(preparedQuery).then((queryResult) => {
        return Promise.all(queryResult.documents.map((doc) => fromStorage(doc)));
      }).then((documents) => ({
        documents
      }));
    },
    getAttachmentData: (documentId, attachmentId, digest) => __async(null, null, function* () {
      var data = yield instance.getAttachmentData(documentId, attachmentId, digest);
      data = yield modifyAttachmentFromStorage(data);
      return data;
    }),
    findDocumentsById: (ids, deleted) => {
      return instance.findDocumentsById(ids, deleted).then((findResult) => __async(null, null, function* () {
        var ret = [];
        yield Promise.all(findResult.map((doc) => __async(null, null, function* () {
          ret.push(yield fromStorage(doc));
        })));
        return ret;
      }));
    },
    getChangedDocumentsSince: !instance.getChangedDocumentsSince ? void 0 : (limit, checkpoint) => {
      return instance.getChangedDocumentsSince(limit, checkpoint).then((result) => __async(null, null, function* () {
        return {
          checkpoint: result.checkpoint,
          documents: yield Promise.all(result.documents.map((d) => fromStorage(d)))
        };
      }));
    },
    changeStream: () => {
      return instance.changeStream().pipe(tap(() => processingChangesCount$.next(processingChangesCount$.getValue() + 1)), mergeMap((eventBulk) => __async(null, null, function* () {
        var useEvents = yield Promise.all(eventBulk.events.map((event) => __async(null, null, function* () {
          var [documentData, previousDocumentData] = yield Promise.all([fromStorage(event.documentData), fromStorage(event.previousDocumentData)]);
          var ev = {
            operation: event.operation,
            documentId: event.documentId,
            documentData,
            previousDocumentData,
            isLocal: false
          };
          return ev;
        })));
        var ret = {
          id: eventBulk.id,
          events: useEvents,
          checkpoint: eventBulk.checkpoint,
          context: eventBulk.context
        };
        return ret;
      })), tap(() => processingChangesCount$.next(processingChangesCount$.getValue() - 1)));
    }
  };
  return wrappedInstance;
}

export {
  wrappedValidateStorageFactory,
  wrapRxStorageInstance
};
//# sourceMappingURL=chunk-A2OH43BR.js.map
