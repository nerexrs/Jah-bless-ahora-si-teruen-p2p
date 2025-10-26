import {
  wrapRxStorageInstance,
  wrappedValidateStorageFactory
} from "./chunk-A2OH43BR.js";
import {
  META_INSTANCE_SCHEMA_TITLE,
  addRxPlugin,
  awaitRxStorageReplicationFirstInSync,
  awaitRxStorageReplicationIdle,
  awaitRxStorageReplicationInSync,
  cancelRxStorageReplication,
  docStateToWriteDoc,
  getAssumedMasterState,
  getCheckpointKey,
  getLastCheckpointDoc,
  getMetaWriteRow,
  getRxReplicationMetaInstanceSchema,
  getUnderlyingPersistentStorage,
  replicateRxStorageInstance,
  resolveConflictError,
  rxStorageInstanceToReplicationHandler,
  setCheckpoint,
  startReplicationDownstream,
  startReplicationUpstream,
  stripAttachmentsDataFromMetaWriteRows,
  writeDocToDocState
} from "./chunk-REWEYEVE.js";
import {
  BROADCAST_CHANNEL_BY_TOKEN,
  addRxStorageMultiInstanceSupport,
  getBroadcastChannelReference,
  removeBroadcastChannelReference
} from "./chunk-OTB4SRCL.js";
import {
  COLLECTIONS_WITH_RUNNING_CLEANUP,
  DEFAULT_TRY_TO_KEEP_MAX,
  DEFAULT_UNEXECUTED_LIFETIME,
  INTERNAL_CONTEXT_COLLECTION,
  INTERNAL_CONTEXT_MIGRATION_STATUS,
  INTERNAL_CONTEXT_PIPELINE_CHECKPOINT,
  INTERNAL_CONTEXT_STORAGE_TOKEN,
  INTERNAL_STORE_SCHEMA,
  INTERNAL_STORE_SCHEMA_TITLE,
  OPEN_COLLECTIONS,
  QueryCache,
  RxCollectionBase,
  RxDatabaseBase,
  RxQueryBase,
  RxQuerySingleResult,
  RxSchema,
  STORAGE_TOKEN_DOCUMENT_ID,
  STORAGE_TOKEN_DOCUMENT_KEY,
  _collectionNamePrimary,
  _getDefaultQuery,
  addConnectedStorageToCollection,
  basePrototype,
  beforeDocumentUpdateWrite,
  countRxQuerySubscribers,
  createNewRxDocument,
  createQueryCache,
  createRxCollection,
  createRxCollectionStorageInstance,
  createRxDatabase,
  createRxDatabaseStorageInstance,
  createRxDocumentConstructor,
  createRxQuery,
  createRxSchema,
  createWithConstructor,
  dbCount,
  defaultCacheReplacementPolicy,
  defaultCacheReplacementPolicyMonad,
  defaultConflictHandler,
  ensureNoStartupErrors,
  ensureRxCollectionIsNotClosed,
  ensureStorageTokenDocumentExists,
  fillObjectDataBeforeInsert,
  flattenEvents,
  getAllCollectionDocuments,
  getDocumentDataOfRxChangeEvent,
  getDocumentOrmPrototype,
  getDocumentPrototype,
  getIndexes,
  getPreviousVersions,
  getPrimaryKeyOfInternalDocument,
  getRxDocumentConstructor,
  isDatabaseStateVersionCompatibleWithDatabaseCode,
  isFindOneByIdQuery,
  isRxCollection,
  isRxDatabase,
  isRxDatabaseFirstTimeInstantiated,
  isRxDocument,
  isRxQuery,
  isRxSchema,
  queryCollection,
  removeCollectionStorages,
  removeConnectedStorageFromCollection,
  removeRxDatabase,
  rxChangeEventBulkToRxChangeEvents,
  rxChangeEventToEventReduceChangeEvent,
  toTypedRxJsonSchema,
  triggerCacheReplacement,
  tunnelQueryCache,
  uncacheRxQuery
} from "./chunk-LK43A4VV.js";
import {
  HOOKS,
  INDEX_MAX,
  INDEX_MIN,
  INTERNAL_STORAGE_NAME,
  LOGICAL_OPERATORS,
  LOWER_BOUND_LOGICAL_OPERATORS,
  RX_DATABASE_LOCAL_DOCS_STORAGE_NAME,
  UPPER_BOUND_LOGICAL_OPERATORS,
  _clearHook,
  attachmentWriteDataToNormalData,
  categorizeBulkWriteRows,
  ensureRxStorageInstanceParamsAreCorrect,
  flatCloneDocWithMeta,
  getAttachmentSize,
  getChangedDocumentsSince,
  getChangedDocumentsSinceQuery,
  getMatcherQueryOpts,
  getQueryMatcher,
  getQueryPlan,
  getSingleDocument,
  getSortComparator,
  getWrappedStorageInstance,
  getWrittenDocumentsFromBulkWriteResponse,
  hasEncryption,
  isSelectorSatisfiedByIndex,
  normalizeMangoQuery,
  observeSingle,
  prepareQuery,
  randomDelayStorage,
  rateQueryPlan,
  runAsyncPluginHooks,
  runPluginHooks,
  runQueryUpdateFunction,
  stackCheckpoints,
  stripAttachmentsDataFromDocument,
  stripAttachmentsDataFromRow,
  throwIfIsStorageWriteError,
  writeSingle
} from "./chunk-FKGUJVD6.js";
import {
  DEFAULT_CHECKPOINT_SCHEMA,
  META_LWT_UNIX_TIME_MAX,
  NON_PREMIUM_COLLECTION_LIMIT,
  PREMIUM_FLAG_HASH,
  PROMISE_RESOLVE_FALSE,
  PROMISE_RESOLVE_NULL,
  PROMISE_RESOLVE_TRUE,
  PROMISE_RESOLVE_VOID,
  RANDOM_STRING,
  REGEX_ALL_DOTS,
  REGEX_ALL_PIPES,
  RXDB_UTILS_GLOBAL,
  RXDB_VERSION,
  RXJS_SHARE_REPLAY_DEFAULTS,
  RX_META_LWT_MINIMUM,
  RX_META_SCHEMA,
  RxError,
  RxTypeError,
  appendToArray,
  areRxDocumentArraysEqual,
  arrayBufferToBase64,
  arrayBufferToString,
  arrayFilterNotEmpty,
  asyncFilter,
  b64DecodeUnicode,
  b64EncodeUnicode,
  base64ToArrayBuffer,
  batchArray,
  blobToBase64String,
  blobToString,
  clone,
  countUntilNotMatching,
  createBlob,
  createBlobFromBase64,
  createRevision,
  customFetchWithFixedHeaders,
  deepEqual,
  deepFreeze,
  deepKeys,
  defaultHashSha256,
  deleteProperty,
  ensureInteger,
  ensureNotFalsy,
  errorToPlainJson,
  errorUrlHint,
  fillObjectWithDefaults,
  fillPrimaryKey,
  fillWithDefaultSettings,
  findUndefinedPath,
  firstPropertyNameOfObject,
  firstPropertyValueOfObject,
  flatClone,
  flattenObject,
  getBlobSize,
  getComposedPrimaryKeyOfDocumentData,
  getDefaultIndex,
  getDefaultRevision,
  getDefaultRxDocumentMeta,
  getErrorUrl,
  getFinalFields,
  getFromMapOrCreate,
  getFromMapOrThrow,
  getFromObjectOrThrow,
  getHeightOfRevision,
  getLengthOfPrimaryKey,
  getPrimaryFieldOfPrimaryKey,
  getProperty,
  getPseudoSchemaForVersion,
  getSchemaByObjectPath,
  getSortDocumentsByLastWriteTimeComparator,
  hasDeepProperty,
  hasPremiumFlag,
  hasProperty,
  hashStringToNumber,
  isBulkWriteConflictError,
  isFolderPath,
  isMaybeReadonlyArray,
  isOneItemOfArrayInOtherArray,
  isPromise,
  lastCharOfString,
  lastOfArray,
  maxOfNumbers,
  nameFunction,
  nativeSha256,
  newRxError,
  newRxTypeError,
  nextTick,
  normalizeRxJsonSchema,
  normalizeString,
  now,
  objectPathMonad,
  overwritable,
  overwriteGetterForCaching,
  parseRevision,
  pluginMissing,
  promiseSeries,
  promiseWait,
  randomNumber,
  randomOfArray,
  randomToken,
  removeOneFromArrayIfMatches,
  requestIdleCallbackIfAvailable,
  requestIdlePromise,
  requestIdlePromiseNoQueue,
  runXTimes,
  rxStorageWriteErrorToRxError,
  setProperty,
  shuffleArray,
  sortByObjectNumberProperty,
  sortDocumentsByLastWriteTime,
  sortObject,
  stringToArrayBuffer,
  stripMetaDataFromDocument,
  sumNumberArray,
  toArray,
  toPromise,
  toWithDeleted,
  trimDots,
  ucfirst,
  uniqueArray
} from "./chunk-GXT3KPMX.js";
import "./chunk-AUREPRPG.js";
import "./chunk-WCYHURJF.js";
import "./chunk-3TXA6K3X.js";
import "./chunk-7RSYZEEK.js";

// node_modules/rxdb/dist/esm/custom-index.js
function getIndexMeta(schema, index) {
  var fieldNameProperties = index.map((fieldName) => {
    var schemaPart = getSchemaByObjectPath(schema, fieldName);
    if (!schemaPart) {
      throw new Error("not in schema: " + fieldName);
    }
    var type = schemaPart.type;
    var parsedLengths;
    if (type === "number" || type === "integer") {
      parsedLengths = getStringLengthOfIndexNumber(schemaPart);
    }
    var getValue = objectPathMonad(fieldName);
    var maxLength = schemaPart.maxLength ? schemaPart.maxLength : 0;
    var getIndexStringPart;
    if (type === "string") {
      getIndexStringPart = (docData) => {
        var fieldValue = getValue(docData);
        if (!fieldValue) {
          fieldValue = "";
        }
        return fieldValue.padEnd(maxLength, " ");
      };
    } else if (type === "boolean") {
      getIndexStringPart = (docData) => {
        var fieldValue = getValue(docData);
        return fieldValue ? "1" : "0";
      };
    } else {
      getIndexStringPart = (docData) => {
        var fieldValue = getValue(docData);
        return getNumberIndexString(parsedLengths, fieldValue);
      };
    }
    var ret = {
      fieldName,
      schemaPart,
      parsedLengths,
      getValue,
      getIndexStringPart
    };
    return ret;
  });
  return fieldNameProperties;
}
function getIndexableStringMonad(schema, index) {
  var fieldNameProperties = getIndexMeta(schema, index);
  var fieldNamePropertiesAmount = fieldNameProperties.length;
  var indexPartsFunctions = fieldNameProperties.map((r) => r.getIndexStringPart);
  var ret = function(docData) {
    var str = "";
    for (var i = 0; i < fieldNamePropertiesAmount; ++i) {
      str += indexPartsFunctions[i](docData);
    }
    return str;
  };
  return ret;
}
function getStringLengthOfIndexNumber(schemaPart) {
  var minimum = Math.floor(schemaPart.minimum);
  var maximum = Math.ceil(schemaPart.maximum);
  var multipleOf = schemaPart.multipleOf;
  var valueSpan = maximum - minimum;
  var nonDecimals = valueSpan.toString().length;
  var multipleOfParts = multipleOf.toString().split(".");
  var decimals = 0;
  if (multipleOfParts.length > 1) {
    decimals = multipleOfParts[1].length;
  }
  return {
    minimum,
    maximum,
    nonDecimals,
    decimals,
    roundedMinimum: minimum
  };
}
function getIndexStringLength(schema, index) {
  var fieldNameProperties = getIndexMeta(schema, index);
  var length = 0;
  fieldNameProperties.forEach((props) => {
    var schemaPart = props.schemaPart;
    var type = schemaPart.type;
    if (type === "string") {
      length += schemaPart.maxLength;
    } else if (type === "boolean") {
      length += 1;
    } else {
      var parsedLengths = props.parsedLengths;
      length = length + parsedLengths.nonDecimals + parsedLengths.decimals;
    }
  });
  return length;
}
function getPrimaryKeyFromIndexableString(indexableString, primaryKeyLength) {
  var paddedPrimaryKey = indexableString.slice(primaryKeyLength * -1);
  var primaryKey = paddedPrimaryKey.trim();
  return primaryKey;
}
function getNumberIndexString(parsedLengths, fieldValue) {
  if (typeof fieldValue === "undefined") {
    fieldValue = 0;
  }
  if (fieldValue < parsedLengths.minimum) {
    fieldValue = parsedLengths.minimum;
  }
  if (fieldValue > parsedLengths.maximum) {
    fieldValue = parsedLengths.maximum;
  }
  var nonDecimalsValueAsString = (Math.floor(fieldValue) - parsedLengths.roundedMinimum).toString();
  var str = nonDecimalsValueAsString.padStart(parsedLengths.nonDecimals, "0");
  if (parsedLengths.decimals > 0) {
    var splitByDecimalPoint = fieldValue.toString().split(".");
    var decimalValueAsString = splitByDecimalPoint.length > 1 ? splitByDecimalPoint[1] : "0";
    str += decimalValueAsString.padEnd(parsedLengths.decimals, "0");
  }
  return str;
}
function getStartIndexStringFromLowerBound(schema, index, lowerBound) {
  var str = "";
  index.forEach((fieldName, idx) => {
    var schemaPart = getSchemaByObjectPath(schema, fieldName);
    var bound = lowerBound[idx];
    var type = schemaPart.type;
    switch (type) {
      case "string":
        var maxLength = ensureNotFalsy(schemaPart.maxLength, "maxLength not set");
        if (typeof bound === "string") {
          str += bound.padEnd(maxLength, " ");
        } else {
          str += "".padEnd(maxLength, " ");
        }
        break;
      case "boolean":
        if (bound === null) {
          str += "0";
        } else if (bound === INDEX_MIN) {
          str += "0";
        } else if (bound === INDEX_MAX) {
          str += "1";
        } else {
          var boolToStr = bound ? "1" : "0";
          str += boolToStr;
        }
        break;
      case "number":
      case "integer":
        var parsedLengths = getStringLengthOfIndexNumber(schemaPart);
        if (bound === null || bound === INDEX_MIN) {
          var fillChar = "0";
          str += fillChar.repeat(parsedLengths.nonDecimals + parsedLengths.decimals);
        } else if (bound === INDEX_MAX) {
          str += getNumberIndexString(parsedLengths, parsedLengths.maximum);
        } else {
          var add = getNumberIndexString(parsedLengths, bound);
          str += add;
        }
        break;
      default:
        throw new Error("unknown index type " + type);
    }
  });
  return str;
}
function getStartIndexStringFromUpperBound(schema, index, upperBound) {
  var str = "";
  index.forEach((fieldName, idx) => {
    var schemaPart = getSchemaByObjectPath(schema, fieldName);
    var bound = upperBound[idx];
    var type = schemaPart.type;
    switch (type) {
      case "string":
        var maxLength = ensureNotFalsy(schemaPart.maxLength, "maxLength not set");
        if (typeof bound === "string" && bound !== INDEX_MAX) {
          str += bound.padEnd(maxLength, " ");
        } else if (bound === INDEX_MIN) {
          str += "".padEnd(maxLength, " ");
        } else {
          str += "".padEnd(maxLength, INDEX_MAX);
        }
        break;
      case "boolean":
        if (bound === null) {
          str += "1";
        } else {
          var boolToStr = bound ? "1" : "0";
          str += boolToStr;
        }
        break;
      case "number":
      case "integer":
        var parsedLengths = getStringLengthOfIndexNumber(schemaPart);
        if (bound === null || bound === INDEX_MAX) {
          var fillChar = "9";
          str += fillChar.repeat(parsedLengths.nonDecimals + parsedLengths.decimals);
        } else if (bound === INDEX_MIN) {
          var _fillChar = "0";
          str += _fillChar.repeat(parsedLengths.nonDecimals + parsedLengths.decimals);
        } else {
          str += getNumberIndexString(parsedLengths, bound);
        }
        break;
      default:
        throw new Error("unknown index type " + type);
    }
  });
  return str;
}
function changeIndexableStringByOneQuantum(str, direction) {
  var lastChar = str.slice(-1);
  var charCode = lastChar.charCodeAt(0);
  charCode = charCode + direction;
  var withoutLastChar = str.slice(0, -1);
  return withoutLastChar + String.fromCharCode(charCode);
}
export {
  BROADCAST_CHANNEL_BY_TOKEN,
  COLLECTIONS_WITH_RUNNING_CLEANUP,
  DEFAULT_CHECKPOINT_SCHEMA,
  DEFAULT_TRY_TO_KEEP_MAX,
  DEFAULT_UNEXECUTED_LIFETIME,
  HOOKS,
  INDEX_MAX,
  INDEX_MIN,
  INTERNAL_CONTEXT_COLLECTION,
  INTERNAL_CONTEXT_MIGRATION_STATUS,
  INTERNAL_CONTEXT_PIPELINE_CHECKPOINT,
  INTERNAL_CONTEXT_STORAGE_TOKEN,
  INTERNAL_STORAGE_NAME,
  INTERNAL_STORE_SCHEMA,
  INTERNAL_STORE_SCHEMA_TITLE,
  LOGICAL_OPERATORS,
  LOWER_BOUND_LOGICAL_OPERATORS,
  META_INSTANCE_SCHEMA_TITLE,
  META_LWT_UNIX_TIME_MAX,
  NON_PREMIUM_COLLECTION_LIMIT,
  OPEN_COLLECTIONS,
  PREMIUM_FLAG_HASH,
  PROMISE_RESOLVE_FALSE,
  PROMISE_RESOLVE_NULL,
  PROMISE_RESOLVE_TRUE,
  PROMISE_RESOLVE_VOID,
  QueryCache,
  RANDOM_STRING,
  REGEX_ALL_DOTS,
  REGEX_ALL_PIPES,
  RXDB_UTILS_GLOBAL,
  RXDB_VERSION,
  RXJS_SHARE_REPLAY_DEFAULTS,
  RX_DATABASE_LOCAL_DOCS_STORAGE_NAME,
  RX_META_LWT_MINIMUM,
  RX_META_SCHEMA,
  RxCollectionBase,
  RxDatabaseBase,
  RxError,
  RxQueryBase,
  RxQuerySingleResult,
  RxSchema,
  RxTypeError,
  STORAGE_TOKEN_DOCUMENT_ID,
  STORAGE_TOKEN_DOCUMENT_KEY,
  UPPER_BOUND_LOGICAL_OPERATORS,
  _clearHook,
  _collectionNamePrimary,
  _getDefaultQuery,
  addConnectedStorageToCollection,
  addRxPlugin,
  addRxStorageMultiInstanceSupport,
  appendToArray,
  areRxDocumentArraysEqual,
  arrayBufferToBase64,
  arrayBufferToString,
  arrayFilterNotEmpty,
  asyncFilter,
  attachmentWriteDataToNormalData,
  awaitRxStorageReplicationFirstInSync,
  awaitRxStorageReplicationIdle,
  awaitRxStorageReplicationInSync,
  b64DecodeUnicode,
  b64EncodeUnicode,
  base64ToArrayBuffer,
  basePrototype,
  batchArray,
  beforeDocumentUpdateWrite,
  blobToBase64String,
  blobToString,
  cancelRxStorageReplication,
  categorizeBulkWriteRows,
  changeIndexableStringByOneQuantum,
  clone,
  countRxQuerySubscribers,
  countUntilNotMatching,
  createBlob,
  createBlobFromBase64,
  createNewRxDocument,
  createQueryCache,
  createRevision,
  createRxCollection,
  createRxCollectionStorageInstance,
  createRxDatabase,
  createRxDatabaseStorageInstance,
  createRxDocumentConstructor,
  createRxQuery,
  createRxSchema,
  createWithConstructor,
  customFetchWithFixedHeaders,
  dbCount,
  deepEqual,
  deepFreeze,
  deepKeys,
  defaultCacheReplacementPolicy,
  defaultCacheReplacementPolicyMonad,
  defaultConflictHandler,
  defaultHashSha256,
  deleteProperty,
  docStateToWriteDoc,
  ensureInteger,
  ensureNoStartupErrors,
  ensureNotFalsy,
  ensureRxCollectionIsNotClosed,
  ensureRxStorageInstanceParamsAreCorrect,
  ensureStorageTokenDocumentExists,
  errorToPlainJson,
  errorUrlHint,
  fillObjectDataBeforeInsert,
  fillObjectWithDefaults,
  fillPrimaryKey,
  fillWithDefaultSettings,
  findUndefinedPath,
  firstPropertyNameOfObject,
  firstPropertyValueOfObject,
  flatClone,
  flatCloneDocWithMeta,
  flattenEvents,
  flattenObject,
  getAllCollectionDocuments,
  getAssumedMasterState,
  getAttachmentSize,
  getBlobSize,
  getBroadcastChannelReference,
  getChangedDocumentsSince,
  getChangedDocumentsSinceQuery,
  getCheckpointKey,
  getComposedPrimaryKeyOfDocumentData,
  getDefaultIndex,
  getDefaultRevision,
  getDefaultRxDocumentMeta,
  getDocumentDataOfRxChangeEvent,
  getDocumentOrmPrototype,
  getDocumentPrototype,
  getErrorUrl,
  getFinalFields,
  getFromMapOrCreate,
  getFromMapOrThrow,
  getFromObjectOrThrow,
  getHeightOfRevision,
  getIndexMeta,
  getIndexStringLength,
  getIndexableStringMonad,
  getIndexes,
  getLastCheckpointDoc,
  getLengthOfPrimaryKey,
  getMatcherQueryOpts,
  getMetaWriteRow,
  getNumberIndexString,
  getPreviousVersions,
  getPrimaryFieldOfPrimaryKey,
  getPrimaryKeyFromIndexableString,
  getPrimaryKeyOfInternalDocument,
  getProperty,
  getPseudoSchemaForVersion,
  getQueryMatcher,
  getQueryPlan,
  getRxDocumentConstructor,
  getRxReplicationMetaInstanceSchema,
  getSchemaByObjectPath,
  getSingleDocument,
  getSortComparator,
  getSortDocumentsByLastWriteTimeComparator,
  getStartIndexStringFromLowerBound,
  getStartIndexStringFromUpperBound,
  getStringLengthOfIndexNumber,
  getUnderlyingPersistentStorage,
  getWrappedStorageInstance,
  getWrittenDocumentsFromBulkWriteResponse,
  hasDeepProperty,
  hasEncryption,
  hasPremiumFlag,
  hasProperty,
  hashStringToNumber,
  isBulkWriteConflictError,
  isDatabaseStateVersionCompatibleWithDatabaseCode,
  isFindOneByIdQuery,
  isFolderPath,
  isMaybeReadonlyArray,
  isOneItemOfArrayInOtherArray,
  isPromise,
  isRxCollection,
  isRxDatabase,
  isRxDatabaseFirstTimeInstantiated,
  isRxDocument,
  isRxQuery,
  isRxSchema,
  isSelectorSatisfiedByIndex,
  lastCharOfString,
  lastOfArray,
  maxOfNumbers,
  nameFunction,
  nativeSha256,
  newRxError,
  newRxTypeError,
  nextTick,
  normalizeMangoQuery,
  normalizeRxJsonSchema,
  normalizeString,
  now,
  objectPathMonad,
  observeSingle,
  overwritable,
  overwriteGetterForCaching,
  parseRevision,
  pluginMissing,
  prepareQuery,
  promiseSeries,
  promiseWait,
  queryCollection,
  randomDelayStorage,
  randomNumber,
  randomOfArray,
  randomToken,
  rateQueryPlan,
  removeBroadcastChannelReference,
  removeCollectionStorages,
  removeConnectedStorageFromCollection,
  removeOneFromArrayIfMatches,
  removeRxDatabase,
  replicateRxStorageInstance,
  requestIdleCallbackIfAvailable,
  requestIdlePromise,
  requestIdlePromiseNoQueue,
  resolveConflictError,
  runAsyncPluginHooks,
  runPluginHooks,
  runQueryUpdateFunction,
  runXTimes,
  rxChangeEventBulkToRxChangeEvents,
  rxChangeEventToEventReduceChangeEvent,
  rxStorageInstanceToReplicationHandler,
  rxStorageWriteErrorToRxError,
  setCheckpoint,
  setProperty,
  shuffleArray,
  sortByObjectNumberProperty,
  sortDocumentsByLastWriteTime,
  sortObject,
  stackCheckpoints,
  startReplicationDownstream,
  startReplicationUpstream,
  stringToArrayBuffer,
  stripAttachmentsDataFromDocument,
  stripAttachmentsDataFromMetaWriteRows,
  stripAttachmentsDataFromRow,
  stripMetaDataFromDocument,
  sumNumberArray,
  throwIfIsStorageWriteError,
  toArray,
  toPromise,
  toTypedRxJsonSchema,
  toWithDeleted,
  triggerCacheReplacement,
  trimDots,
  tunnelQueryCache,
  ucfirst,
  uncacheRxQuery,
  uniqueArray,
  wrapRxStorageInstance,
  wrappedValidateStorageFactory,
  writeDocToDocState,
  writeSingle
};
//# sourceMappingURL=rxdb_plugins_core.js.map
