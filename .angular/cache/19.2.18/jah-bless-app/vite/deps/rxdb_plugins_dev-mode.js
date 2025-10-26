import {
  RxCollectionBase,
  RxDatabaseBase,
  basePrototype,
  createRxDocumentConstructor,
  getPreviousVersions
} from "./chunk-LK43A4VV.js";
import {
  prepareQuery
} from "./chunk-FKGUJVD6.js";
import {
  NON_PREMIUM_COLLECTION_LIMIT,
  RXDB_VERSION,
  appendToArray,
  deepEqual,
  deepFreeze,
  fillPrimaryKey,
  findUndefinedPath,
  flattenObject,
  getPrimaryFieldOfPrimaryKey,
  getProperty,
  getSchemaByObjectPath,
  hasPremiumFlag,
  hashStringToNumber,
  isFolderPath,
  isMaybeReadonlyArray,
  newRxError,
  newRxTypeError,
  trimDots
} from "./chunk-GXT3KPMX.js";
import "./chunk-AUREPRPG.js";
import "./chunk-WCYHURJF.js";
import "./chunk-3TXA6K3X.js";
import {
  __async
} from "./chunk-7RSYZEEK.js";

// node_modules/rxdb/dist/esm/plugins/dev-mode/error-messages.js
var ERROR_MESSAGES = {
  // util.js / config
  UT1: "given name is no string or empty",
  UT2: "collection- and database-names must match the regex to be compatible with couchdb databases.\n    See https://neighbourhood.ie/blog/2020/10/13/everything-you-need-to-know-about-couchdb-database-names/\n    info: if your database-name specifies a folder, the name must contain the slash-char '/' or '\\'",
  UT3: "replication-direction must either be push or pull or both. But not none",
  UT4: "given leveldown is no valid adapter",
  UT5: "keyCompression is set to true in the schema but no key-compression handler is used in the storage",
  UT6: "schema contains encrypted fields but no encryption handler is used in the storage",
  UT7: "attachments.compression is enabled but no attachment-compression plugin is used",
  UT8: "crypto.subtle.digest is not available in your runtime. For expo/react-native see https://discord.com/channels/969553741705539624/1341392686267109458/1343639513850843217 ",
  // plugins
  PL1: "Given plugin is not RxDB plugin.",
  // removed in 14.0.0 - PouchDB RxStorage was removed - PL2: 'You tried importing a RxDB plugin to pouchdb. Use addRxPlugin() instead.',
  PL3: "A plugin with the same name was already added but it was not the exact same JavaScript object",
  // pouch-db.js
  // removed in 12.0.0 - P1: 'PouchDB.getBatch: limit must be > 2',
  P2: "bulkWrite() cannot be called with an empty array",
  // removed in 12.0.0 - P3: 'bulkAddRevisions cannot be called with an empty array',
  // rx-query
  QU1: "RxQuery._execOverDatabase(): op not known",
  // removed in 9.0.0 - QU2: 'limit() must get a number',
  // removed in 9.0.0 - QU3: 'skip() must get a number',
  QU4: "RxQuery.regex(): You cannot use .regex() on the primary field",
  QU5: "RxQuery.sort(): does not work because key is not defined in the schema",
  QU6: "RxQuery.limit(): cannot be called on .findOne()",
  // removed in 12.0.0 (should by ensured by the typings) - QU7: 'query must be an object',
  // removed in 12.0.0 (should by ensured by the typings) - QU8: 'query cannot be an array',
  QU9: "throwIfMissing can only be used in findOne queries",
  QU10: "result empty and throwIfMissing: true",
  QU11: "RxQuery: no valid query params given",
  QU12: "Given index is not in schema",
  QU13: "A top level field of the query is not included in the schema",
  QU14: "Running a count() query in slow mode is now allowed. Either run a count() query with a selector that fully matches an index or set allowSlowCount=true when calling the createRxDatabase",
  QU15: "For count queries it is not allowed to use skip or limit",
  QU16: "$regex queries must be defined by a string, not an RegExp instance. This is because RegExp objects cannot be JSON stringified and also they are mutable which would be dangerous",
  QU17: "Chained queries cannot be used on findByIds() RxQuery instances",
  QU18: "Malformed query result data. This likely happens because you create a OPFS-storage RxDatabase inside of a worker but did not set the usesRxDatabaseInWorker setting. https://rxdb.info/rx-storage-opfs.html#setting-usesrxdatabaseinworker-when-a-rxdatabase-is-also-used-inside-of-the-worker ",
  QU19: "Queries must not contain fields or properties with the value `undefined`: https://github.com/pubkey/rxdb/issues/6792#issuecomment-2624555824 ",
  // mquery.js
  MQ1: "path must be a string or object",
  MQ2: "Invalid argument",
  MQ3: "Invalid sort() argument. Must be a string, object, or array",
  MQ4: "Invalid argument. Expected instanceof mquery or plain object",
  MQ5: "method must be used after where() when called with these arguments",
  MQ6: "Can't mix sort syntaxes. Use either array or object | .sort([['field', 1], ['test', -1]]) | .sort({ field: 1, test: -1 })",
  MQ7: "Invalid sort value",
  MQ8: "Can't mix sort syntaxes. Use either array or object",
  // rx-database
  DB1: "RxDocument.prepare(): another instance on this adapter has a different password",
  DB2: "RxDatabase.addCollections(): collection-names cannot start with underscore _",
  DB3: "RxDatabase.addCollections(): collection already exists. use myDatabase[collectionName] to get it",
  DB4: "RxDatabase.addCollections(): schema is missing",
  DB5: "RxDatabase.addCollections(): collection-name not allowed",
  DB6: "RxDatabase.addCollections(): another instance created this collection with a different schema. Read this https://rxdb.info/questions-answers.html?console=qa#cant-change-the-schema ",
  // removed in 13.0.0 (now part of the encryption plugin) DB7: 'RxDatabase.addCollections(): schema encrypted but no password given',
  DB8: 'createRxDatabase(): A RxDatabase with the same name and adapter already exists.\nMake sure to use this combination of storage+databaseName only once\nIf you have the duplicate database on purpose to simulate multi-tab behavior in unit tests, set "ignoreDuplicate: true".\nAs alternative you can set "closeDuplicates: true" like if this happens in your react projects with hot reload that reloads the code without reloading the process.',
  DB9: "ignoreDuplicate is only allowed in dev-mode and must never be used in production",
  // removed in 14.0.0 - PouchDB RxStorage is removed - DB9: 'createRxDatabase(): Adapter not added. Use addPouchPlugin(require(\'pouchdb-adapter-[adaptername]\'));',
  // removed in 14.0.0 - PouchDB RxStorage is removed DB10: 'createRxDatabase(): To use leveldown-adapters, you have to add the leveldb-plugin. Use addPouchPlugin(require(\'pouchdb-adapter-leveldb\'));',
  DB11: "createRxDatabase(): Invalid db-name, folder-paths must not have an ending slash",
  DB12: "RxDatabase.addCollections(): could not write to internal store",
  DB13: "createRxDatabase(): Invalid db-name or collection name, name contains the dollar sign",
  DB14: "no custom reactivity factory added on database creation",
  // rx-collection
  COL1: "RxDocument.insert() You cannot insert an existing document",
  COL2: "RxCollection.insert() fieldName ._id can only be used as primaryKey",
  COL3: "RxCollection.upsert() does not work without primary",
  COL4: "RxCollection.incrementalUpsert() does not work without primary",
  COL5: "RxCollection.find() if you want to search by _id, use .findOne(_id)",
  COL6: "RxCollection.findOne() needs a queryObject or string. Notice that in RxDB, primary keys must be strings and cannot be numbers.",
  COL7: "hook must be a function",
  COL8: "hooks-when not known",
  COL9: "RxCollection.addHook() hook-name not known",
  COL10: "RxCollection .postCreate-hooks cannot be async",
  COL11: "migrationStrategies must be an object",
  COL12: "A migrationStrategy is missing or too much",
  COL13: "migrationStrategy must be a function",
  COL14: "given static method-name is not a string",
  COL15: "static method-names cannot start with underscore _",
  COL16: "given static method is not a function",
  COL17: "RxCollection.ORM: statics-name not allowed",
  COL18: "collection-method not allowed because fieldname is in the schema",
  // removed in 14.0.0, use CONFLICT instead - COL19: 'Document update conflict. When changing a document you must work on the previous revision',
  COL20: "Storage write error",
  COL21: "The RxCollection is closed or removed already, either from this JavaScript realm or from another, like a browser tab",
  CONFLICT: "Document update conflict. When changing a document you must work on the previous revision",
  COL22: ".bulkInsert() and .bulkUpsert() cannot be run with multiple documents that have the same primary key",
  COL23: "In the open-source version of RxDB, the amount of collections that can exist in parallel is limited to " + NON_PREMIUM_COLLECTION_LIMIT + ". If you already purchased the premium access, you can remove this limit: https://rxdb.info/rx-collection.html#faq",
  // rx-document.js
  DOC1: "RxDocument.get$ cannot get observable of in-array fields because order cannot be guessed",
  DOC2: "cannot observe primary path",
  DOC3: "final fields cannot be observed",
  DOC4: "RxDocument.get$ cannot observe a non-existed field",
  DOC5: "RxDocument.populate() cannot populate a non-existed field",
  DOC6: "RxDocument.populate() cannot populate because path has no ref",
  DOC7: "RxDocument.populate() ref-collection not in database",
  DOC8: "RxDocument.set(): primary-key cannot be modified",
  DOC9: "final fields cannot be modified",
  DOC10: "RxDocument.set(): cannot set childpath when rootPath not selected",
  DOC11: "RxDocument.save(): can't save deleted document",
  // removed in 10.0.0 DOC12: 'RxDocument.save(): error',
  DOC13: "RxDocument.remove(): Document is already deleted",
  DOC14: "RxDocument.close() does not exist",
  DOC15: "query cannot be an array",
  DOC16: "Since version 8.0.0 RxDocument.set() can only be called on temporary RxDocuments",
  DOC17: "Since version 8.0.0 RxDocument.save() can only be called on non-temporary documents",
  DOC18: "Document property for composed primary key is missing",
  DOC19: "Value of primary key(s) cannot be changed",
  DOC20: "PrimaryKey missing",
  DOC21: "PrimaryKey must be equal to PrimaryKey.trim(). It cannot start or end with a whitespace",
  DOC22: "PrimaryKey must not contain a linebreak",
  DOC23: 'PrimaryKey must not contain a double-quote ["]',
  DOC24: "Given document data could not be structured cloned. This happens if you pass non-plain-json data into it, like a Date() object or a Function. In vue.js this happens if you use ref() on the document data which transforms it into a Proxy object.",
  // data-migrator.js
  DM1: "migrate() Migration has already run",
  DM2: "migration of document failed final document does not match final schema",
  DM3: "migration already running",
  DM4: "Migration errored",
  DM5: "Cannot open database state with newer RxDB version. You have to migrate your database state first. See https://rxdb.info/migration-storage.html?console=storage ",
  // plugins/attachments.js
  AT1: "to use attachments, please define this in your schema",
  // plugins/encryption-crypto-js.js
  EN1: "password is not valid",
  EN2: "validatePassword: min-length of password not complied",
  EN3: "Schema contains encrypted properties but no password is given",
  EN4: "Password not valid",
  // plugins/json-dump.js
  JD1: "You must create the collections before you can import their data",
  JD2: "RxCollection.importJSON(): the imported json relies on a different schema",
  JD3: "RxCollection.importJSON(): json.passwordHash does not match the own",
  // plugins/leader-election.js
  // plugins/local-documents.js
  LD1: "RxDocument.allAttachments$ can't use attachments on local documents",
  LD2: "RxDocument.get(): objPath must be a string",
  LD3: "RxDocument.get$ cannot get observable of in-array fields because order cannot be guessed",
  LD4: "cannot observe primary path",
  LD5: "RxDocument.set() id cannot be modified",
  LD6: "LocalDocument: Function is not usable on local documents",
  LD7: "Local document already exists",
  LD8: "localDocuments not activated. Set localDocuments=true on creation, when you want to store local documents on the RxDatabase or RxCollection.",
  // plugins/replication.js
  RC1: "Replication: already added",
  RC2: "replicateCouchDB() query must be from the same RxCollection",
  // removed in 14.0.0 - PouchDB RxStorage is removed RC3: 'RxCollection.syncCouchDB() Do not use a collection\'s pouchdb as remote, use the collection instead',
  RC4: "RxCouchDBReplicationState.awaitInitialReplication() cannot await initial replication when live: true",
  RC5: "RxCouchDBReplicationState.awaitInitialReplication() cannot await initial replication if multiInstance because the replication might run on another instance",
  RC6: "syncFirestore() serverTimestampField MUST NOT be part of the collections schema and MUST NOT be nested.",
  RC7: "SimplePeer requires to have process.nextTick() polyfilled, see https://rxdb.info/replication-webrtc.html?console=webrtc ",
  RC_PULL: "RxReplication pull handler threw an error - see .errors for more details",
  RC_STREAM: "RxReplication pull stream$ threw an error - see .errors for more details",
  RC_PUSH: "RxReplication push handler threw an error - see .errors for more details",
  RC_PUSH_NO_AR: "RxReplication push handler did not return an array with the conflicts",
  RC_WEBRTC_PEER: "RxReplication WebRTC Peer has error",
  RC_COUCHDB_1: "replicateCouchDB() url must end with a slash like 'https://example.com/mydatabase/'",
  RC_COUCHDB_2: "replicateCouchDB() did not get valid result with rows.",
  RC_OUTDATED: "Outdated client, update required. Replication was canceled",
  RC_UNAUTHORIZED: "Unauthorized client, update the replicationState.headers to set correct auth data",
  RC_FORBIDDEN: "Client behaves wrong so the replication was canceled. Mostly happens if the client tries to write data that it is not allowed to",
  // plugins/dev-mode/check-schema.js
  SC1: "fieldnames do not match the regex",
  SC2: "SchemaCheck: name 'item' reserved for array-fields",
  SC3: "SchemaCheck: fieldname has a ref-array but items-type is not string",
  SC4: "SchemaCheck: fieldname has a ref but is not type string, [string,null] or array<string>",
  SC6: "SchemaCheck: primary can only be defined at top-level",
  SC7: "SchemaCheck: default-values can only be defined at top-level",
  SC8: "SchemaCheck: first level-fields cannot start with underscore _",
  SC10: "SchemaCheck: schema defines ._rev, this will be done automatically",
  SC11: "SchemaCheck: schema needs a number >=0 as version",
  // removed in 10.0.0 - SC12: 'SchemaCheck: primary can only be defined once',
  SC13: "SchemaCheck: primary is always index, do not declare it as index",
  SC14: "SchemaCheck: primary is always unique, do not declare it as index",
  SC15: "SchemaCheck: primary cannot be encrypted",
  SC16: "SchemaCheck: primary must have type: string",
  SC17: "SchemaCheck: top-level fieldname is not allowed. See https://rxdb.info/rx-schema.html#non-allowed-properties ",
  SC18: "SchemaCheck: indexes must be an array",
  SC19: "SchemaCheck: indexes must contain strings or arrays of strings",
  SC20: "SchemaCheck: indexes.array must contain strings",
  SC21: "SchemaCheck: given index is not defined in schema",
  SC22: "SchemaCheck: given indexKey is not type:string",
  SC23: "SchemaCheck: fieldname is not allowed",
  SC24: "SchemaCheck: required fields must be set via array. See https://spacetelescope.github.io/understanding-json-schema/reference/object.html#required",
  SC25: "SchemaCheck: compoundIndexes needs to be specified in the indexes field",
  SC26: "SchemaCheck: indexes needs to be specified at collection schema level",
  // removed in 16.0.0 - SC27: 'SchemaCheck: encrypted fields need to be specified at collection schema level',
  SC28: "SchemaCheck: encrypted fields is not defined in the schema",
  SC29: "SchemaCheck: missing object key 'properties'",
  SC30: "SchemaCheck: primaryKey is required",
  SC32: "SchemaCheck: primary field must have the type string/number/integer",
  SC33: "SchemaCheck: used primary key is not a property in the schema",
  SC34: "Fields of type string that are used in an index, must have set the maxLength attribute in the schema",
  SC35: "Fields of type number/integer that are used in an index, must have set the multipleOf attribute in the schema",
  SC36: "A field of this type cannot be used as index",
  SC37: "Fields of type number that are used in an index, must have set the minimum and maximum attribute in the schema",
  SC38: "Fields of type boolean that are used in an index, must be required in the schema",
  SC39: "The primary key must have the maxLength attribute set. Ensure you use the dev-mode plugin when developing with RxDB.",
  SC40: "$ref fields in the schema are not allowed. RxDB cannot resolve related schemas because it would have a negative performance impact.It would have to run http requests on runtime. $ref fields should be resolved during build time.",
  SC41: "minimum, maximum and maxLength values for indexes must be real numbers, not Infinity or -Infinity",
  // plugins/dev-mode
  // removed in 13.9.0, use PL3 instead - DEV1: 'dev-mode added multiple times',
  DVM1: "When dev-mode is enabled, your storage must use one of the schema validators at the top level. This is because most problems people have with RxDB is because they store data that is not valid to the schema which causes strange bugs and problems.",
  // plugins/validate.js
  VD1: "Sub-schema not found, does the schemaPath exists in your schema?",
  VD2: "object does not match schema",
  // plugins/in-memory.js
  // removed in 14.0.0 - PouchDB RxStorage is removed IM1: 'InMemory: Memory-Adapter must be added. Use addPouchPlugin(require(\'pouchdb-adapter-memory\'));',
  // removed in 14.0.0 - PouchDB RxStorage is removed IM2: 'inMemoryCollection.sync(): Do not replicate with the in-memory instance. Replicate with the parent instead',
  // plugins/server.js
  S1: "You cannot create collections after calling RxDatabase.server()",
  // plugins/replication-graphql.js
  GQL1: "GraphQL replication: cannot find sub schema by key",
  // removed in 13.0.0, use RC_PULL instead - GQL2: 'GraphQL replication: unknown errors occurred in replication pull - see innerErrors for more details',
  GQL3: "GraphQL replication: pull returns more documents then batchSize",
  // removed in 13.0.0, use RC_PUSH instead - GQL4: 'GraphQL replication: unknown errors occurred in replication push - see innerErrors for more details',
  // plugins/crdt/
  CRDT1: "CRDT operations cannot be used because the crdt options are not set in the schema.",
  CRDT2: "RxDocument.incrementalModify() cannot be used when CRDTs are activated.",
  CRDT3: "To use CRDTs you MUST NOT set a conflictHandler because the default CRDT conflict handler must be used",
  // plugins/storage-dexie/
  DXE1: "non-required index fields are not possible with the dexie.js RxStorage: https://github.com/pubkey/rxdb/pull/6643#issuecomment-2505310082",
  // removed in 15.0.0, added boolean index support to dexie storage - DXE1: 'The dexie.js RxStorage does not support boolean indexes, see https://rxdb.info/rx-storage-dexie.html#boolean-index',
  // plugins/storage-localstorage
  LS1: "The localstorage RxStorage does not use attachments. In browsers use the IndexedDB, OPFS or Dexie RxStorage if you need attachments support.",
  // plugins/storage-sqlite-trial/
  SQL1: "The trial version of the SQLite storage does not support attachments.",
  SQL2: "The trial version of the SQLite storage is limited to contain 300 documents",
  SQL3: "The trial version of the SQLite storage is limited to running 110 operations",
  // plugins/storage-remote
  RM1: "Cannot communicate with a remote that was build on a different RxDB version. Did you forget to rebuild your workers when updating RxDB?",
  // plugins/replication-mongodb
  MG1: "If _id is used as primaryKey, all documents in the MongoDB instance must have a string-value as _id, not an ObjectId or number",
  /**
   * Should never be thrown, use this for
   * null checks etc. so you do not have to increase the
   * build size with error message strings.
   */
  SNH: "This should never happen"
};

// node_modules/rxdb/dist/esm/plugins/dev-mode/entity-properties.js
var _rxCollectionProperties;
function rxCollectionProperties() {
  if (!_rxCollectionProperties) {
    var pseudoInstance = new RxCollectionBase();
    var ownProperties = Object.getOwnPropertyNames(pseudoInstance);
    var prototypeProperties = Object.getOwnPropertyNames(Object.getPrototypeOf(pseudoInstance));
    _rxCollectionProperties = [...ownProperties, ...prototypeProperties];
  }
  return _rxCollectionProperties;
}
var _rxDatabaseProperties;
function rxDatabaseProperties() {
  if (!_rxDatabaseProperties) {
    var pseudoInstance = new RxDatabaseBase("pseudoInstance", "memory");
    var ownProperties = Object.getOwnPropertyNames(pseudoInstance);
    var prototypeProperties = Object.getOwnPropertyNames(Object.getPrototypeOf(pseudoInstance));
    _rxDatabaseProperties = [...ownProperties, ...prototypeProperties];
    pseudoInstance.close();
  }
  return _rxDatabaseProperties;
}
var pseudoConstructor = createRxDocumentConstructor(basePrototype);
var pseudoRxDocument = new pseudoConstructor();
var _rxDocumentProperties;
function rxDocumentProperties() {
  if (!_rxDocumentProperties) {
    var reserved = ["deleted", "synced"];
    var ownProperties = Object.getOwnPropertyNames(pseudoRxDocument);
    var prototypeProperties = Object.getOwnPropertyNames(basePrototype);
    _rxDocumentProperties = [...ownProperties, ...prototypeProperties, ...reserved];
  }
  return _rxDocumentProperties;
}

// node_modules/rxdb/dist/esm/plugins/dev-mode/check-schema.js
function checkFieldNameRegex(fieldName) {
  if (fieldName === "_deleted") {
    return;
  }
  if (["properties"].includes(fieldName)) {
    throw newRxError("SC23", {
      fieldName
    });
  }
  var regexStr = "^[a-zA-Z](?:[[a-zA-Z0-9_]*]?[a-zA-Z0-9])?$";
  var regex = new RegExp(regexStr);
  if (
    /**
     * It must be allowed to set _id as primaryKey.
     * This makes it sometimes easier to work with RxDB+CouchDB
     * @link https://github.com/pubkey/rxdb/issues/681
     */
    fieldName !== "_id" && !fieldName.match(regex)
  ) {
    throw newRxError("SC1", {
      regex: regexStr,
      fieldName
    });
  }
}
function validateFieldsDeep(rxJsonSchema) {
  var primaryPath = getPrimaryFieldOfPrimaryKey(rxJsonSchema.primaryKey);
  function checkField(fieldName, schemaObj, path) {
    if (typeof fieldName === "string" && typeof schemaObj === "object" && !Array.isArray(schemaObj) && path.split(".").pop() !== "patternProperties") checkFieldNameRegex(fieldName);
    if (Object.prototype.hasOwnProperty.call(schemaObj, "item") && schemaObj.type !== "array") {
      throw newRxError("SC2", {
        fieldName
      });
    }
    if (Object.prototype.hasOwnProperty.call(schemaObj, "required") && typeof schemaObj.required === "boolean") {
      throw newRxError("SC24", {
        fieldName
      });
    }
    if (Object.prototype.hasOwnProperty.call(schemaObj, "$ref")) {
      throw newRxError("SC40", {
        fieldName
      });
    }
    if (Object.prototype.hasOwnProperty.call(schemaObj, "ref")) {
      if (Array.isArray(schemaObj.type)) {
        if (schemaObj.type.length > 2 || !schemaObj.type.includes("string") || !schemaObj.type.includes("null")) {
          throw newRxError("SC4", {
            fieldName
          });
        }
      } else {
        switch (schemaObj.type) {
          case "string":
            break;
          case "array":
            if (!schemaObj.items || !schemaObj.items.type || schemaObj.items.type !== "string") {
              throw newRxError("SC3", {
                fieldName
              });
            }
            break;
          default:
            throw newRxError("SC4", {
              fieldName
            });
        }
      }
    }
    var isNested = path.split(".").length >= 2;
    if (isNested) {
      if (schemaObj.default) {
        throw newRxError("SC7", {
          path
        });
      }
    }
    if (!isNested) {
      if (fieldName === "_id" && primaryPath !== "_id") {
        throw newRxError("COL2", {
          fieldName
        });
      }
      if (fieldName.charAt(0) === "_") {
        if (
          // exceptional allow underscore on these fields.
          fieldName === "_id" || fieldName === "_deleted"
        ) {
          return;
        }
        throw newRxError("SC8", {
          fieldName
        });
      }
    }
  }
  function traverse(currentObj, currentPath) {
    if (!currentObj || typeof currentObj !== "object") {
      return;
    }
    Object.keys(currentObj).forEach((attributeName) => {
      var schemaObj = currentObj[attributeName];
      if (!currentObj.properties && schemaObj && typeof schemaObj === "object" && !Array.isArray(currentObj)) {
        checkField(attributeName, schemaObj, currentPath);
      }
      var nextPath = currentPath;
      if (attributeName !== "properties") nextPath = nextPath + "." + attributeName;
      traverse(schemaObj, nextPath);
    });
  }
  traverse(rxJsonSchema, "");
  return true;
}
function checkPrimaryKey(jsonSchema) {
  if (!jsonSchema.primaryKey) {
    throw newRxError("SC30", {
      schema: jsonSchema
    });
  }
  function validatePrimarySchemaPart(schemaPart2) {
    if (!schemaPart2) {
      throw newRxError("SC33", {
        schema: jsonSchema
      });
    }
    var type = schemaPart2.type;
    if (!type || !["string", "number", "integer"].includes(type)) {
      throw newRxError("SC32", {
        schema: jsonSchema,
        args: {
          schemaPart: schemaPart2
        }
      });
    }
  }
  if (typeof jsonSchema.primaryKey === "string") {
    var key = jsonSchema.primaryKey;
    var schemaPart = jsonSchema.properties[key];
    validatePrimarySchemaPart(schemaPart);
  } else {
    var compositePrimaryKey = jsonSchema.primaryKey;
    var keySchemaPart = getSchemaByObjectPath(jsonSchema, compositePrimaryKey.key);
    validatePrimarySchemaPart(keySchemaPart);
    compositePrimaryKey.fields.forEach((field) => {
      var schemaPart2 = getSchemaByObjectPath(jsonSchema, field);
      validatePrimarySchemaPart(schemaPart2);
    });
  }
  var primaryPath = getPrimaryFieldOfPrimaryKey(jsonSchema.primaryKey);
  var primaryPathSchemaPart = jsonSchema.properties[primaryPath];
  if (!primaryPathSchemaPart.maxLength) {
    throw newRxError("SC39", {
      schema: jsonSchema,
      args: {
        primaryPathSchemaPart
      }
    });
  } else if (!isFinite(primaryPathSchemaPart.maxLength)) {
    throw newRxError("SC41", {
      schema: jsonSchema,
      args: {
        primaryPathSchemaPart
      }
    });
  }
}
function getSchemaPropertyRealPath(shortPath) {
  var pathParts = shortPath.split(".");
  var realPath = "";
  for (var i = 0; i < pathParts.length; i += 1) {
    if (pathParts[i] !== "[]") {
      realPath = realPath.concat(".properties.".concat(pathParts[i]));
    } else {
      realPath = realPath.concat(".items");
    }
  }
  return trimDots(realPath);
}
function checkSchema(jsonSchema) {
  if (!jsonSchema.primaryKey) {
    throw newRxError("SC30", {
      schema: jsonSchema
    });
  }
  if (!Object.prototype.hasOwnProperty.call(jsonSchema, "properties")) {
    throw newRxError("SC29", {
      schema: jsonSchema
    });
  }
  if (jsonSchema.properties._rev) {
    throw newRxError("SC10", {
      schema: jsonSchema
    });
  }
  if (!Object.prototype.hasOwnProperty.call(jsonSchema, "version") || typeof jsonSchema.version !== "number" || jsonSchema.version < 0) {
    throw newRxError("SC11", {
      version: jsonSchema.version
    });
  }
  validateFieldsDeep(jsonSchema);
  checkPrimaryKey(jsonSchema);
  Object.keys(jsonSchema.properties).forEach((key) => {
    var value = jsonSchema.properties[key];
    if (key === jsonSchema.primaryKey) {
      if (jsonSchema.indexes && jsonSchema.indexes.includes(key)) {
        throw newRxError("SC13", {
          value,
          schema: jsonSchema
        });
      }
      if (value.unique) {
        throw newRxError("SC14", {
          value,
          schema: jsonSchema
        });
      }
      if (jsonSchema.encrypted && jsonSchema.encrypted.includes(key)) {
        throw newRxError("SC15", {
          value,
          schema: jsonSchema
        });
      }
      if (value.type !== "string") {
        throw newRxError("SC16", {
          value,
          schema: jsonSchema
        });
      }
    }
    if (rxDocumentProperties().includes(key)) {
      throw newRxError("SC17", {
        key,
        schema: jsonSchema
      });
    }
  });
  if (jsonSchema.indexes) {
    if (!isMaybeReadonlyArray(jsonSchema.indexes)) {
      throw newRxError("SC18", {
        indexes: jsonSchema.indexes,
        schema: jsonSchema
      });
    }
    jsonSchema.indexes.forEach((index) => {
      if (!(typeof index === "string" || Array.isArray(index))) {
        throw newRxError("SC19", {
          index,
          schema: jsonSchema
        });
      }
      if (Array.isArray(index)) {
        for (var i = 0; i < index.length; i += 1) {
          if (typeof index[i] !== "string") {
            throw newRxError("SC20", {
              index,
              schema: jsonSchema
            });
          }
        }
      }
      var indexAsArray = isMaybeReadonlyArray(index) ? index : [index];
      indexAsArray.forEach((fieldName) => {
        var schemaPart = getSchemaByObjectPath(jsonSchema, fieldName);
        var type = schemaPart.type;
        switch (type) {
          case "string":
            var maxLength = schemaPart.maxLength;
            if (!maxLength) {
              throw newRxError("SC34", {
                index,
                field: fieldName,
                schema: jsonSchema
              });
            }
            break;
          case "number":
          case "integer":
            var multipleOf = schemaPart.multipleOf;
            if (!multipleOf) {
              throw newRxError("SC35", {
                index,
                field: fieldName,
                schema: jsonSchema
              });
            }
            var maximum = schemaPart.maximum;
            var minimum = schemaPart.minimum;
            if (typeof maximum === "undefined" || typeof minimum === "undefined") {
              throw newRxError("SC37", {
                index,
                field: fieldName,
                schema: jsonSchema
              });
            }
            if (!isFinite(maximum) || !isFinite(minimum)) {
              throw newRxError("SC41", {
                index,
                field: fieldName,
                schema: jsonSchema
              });
            }
            break;
          case "boolean":
            var parentPath = "";
            var lastPathPart = fieldName;
            if (fieldName.includes(".")) {
              var partParts = fieldName.split(".");
              lastPathPart = partParts.pop();
              parentPath = partParts.join(".");
            }
            var parentSchemaPart = parentPath === "" ? jsonSchema : getSchemaByObjectPath(jsonSchema, parentPath);
            if (!parentSchemaPart.required || !parentSchemaPart.required.includes(lastPathPart)) {
              throw newRxError("SC38", {
                index,
                field: fieldName,
                schema: jsonSchema
              });
            }
            break;
          default:
            throw newRxError("SC36", {
              fieldName,
              type: schemaPart.type,
              schema: jsonSchema
            });
        }
      });
    });
  }
  Object.keys(flattenObject(jsonSchema)).map((key) => {
    var split = key.split(".");
    split.pop();
    return split.join(".");
  }).filter((key) => key !== "").filter((elem, pos, arr) => arr.indexOf(elem) === pos).filter((key) => {
    var value = getProperty(jsonSchema, key);
    return value && !!value.index;
  }).forEach((key) => {
    key = key.replace("properties.", "");
    key = key.replace(/\.properties\./g, ".");
    throw newRxError("SC26", {
      index: trimDots(key),
      schema: jsonSchema
    });
  });
  (jsonSchema.indexes || []).reduce((indexPaths, currentIndex) => {
    if (isMaybeReadonlyArray(currentIndex)) {
      appendToArray(indexPaths, currentIndex);
    } else {
      indexPaths.push(currentIndex);
    }
    return indexPaths;
  }, []).filter((elem, pos, arr) => arr.indexOf(elem) === pos).map((indexPath) => {
    var realPath = getSchemaPropertyRealPath(indexPath);
    var schemaObj = getProperty(jsonSchema, realPath);
    if (!schemaObj || typeof schemaObj !== "object") {
      throw newRxError("SC21", {
        index: indexPath,
        schema: jsonSchema
      });
    }
    return {
      indexPath,
      schemaObj
    };
  }).filter((index) => index.schemaObj.type !== "string" && index.schemaObj.type !== "integer" && index.schemaObj.type !== "number" && index.schemaObj.type !== "boolean").forEach((index) => {
    throw newRxError("SC22", {
      key: index.indexPath,
      type: index.schemaObj.type,
      schema: jsonSchema
    });
  });
  if (jsonSchema.encrypted) {
    jsonSchema.encrypted.forEach((propPath) => {
      var realPath = getSchemaPropertyRealPath(propPath);
      var schemaObj = getProperty(jsonSchema, realPath);
      if (!schemaObj || typeof schemaObj !== "object") {
        throw newRxError("SC28", {
          field: propPath,
          schema: jsonSchema
        });
      }
    });
  }
}

// node_modules/rxdb/dist/esm/plugins/dev-mode/check-orm.js
function checkOrmMethods(statics) {
  if (!statics) {
    return;
  }
  Object.entries(statics).forEach(([k, v]) => {
    if (typeof k !== "string") {
      throw newRxTypeError("COL14", {
        name: k
      });
    }
    if (k.startsWith("_")) {
      throw newRxTypeError("COL15", {
        name: k
      });
    }
    if (typeof v !== "function") {
      throw newRxTypeError("COL16", {
        name: k,
        type: typeof k
      });
    }
    if (rxCollectionProperties().includes(k) || rxDocumentProperties().includes(k)) {
      throw newRxError("COL17", {
        name: k
      });
    }
  });
}
function checkOrmDocumentMethods(schema, methods) {
  var topLevelFields = Object.keys(schema.properties);
  if (!methods) {
    return;
  }
  Object.keys(methods).filter((funName) => topLevelFields.includes(funName)).forEach((funName) => {
    throw newRxError("COL18", {
      funName
    });
  });
}

// node_modules/rxdb/dist/esm/plugins/dev-mode/check-migration-strategies.js
function checkMigrationStrategies(schema, migrationStrategies) {
  if (typeof migrationStrategies !== "object" || Array.isArray(migrationStrategies)) {
    throw newRxTypeError("COL11", {
      schema
    });
  }
  var previousVersions = getPreviousVersions(schema);
  if (previousVersions.length !== Object.keys(migrationStrategies).length) {
    throw newRxError("COL12", {
      have: Object.keys(migrationStrategies),
      should: previousVersions
    });
  }
  previousVersions.map((vNr) => ({
    v: vNr,
    s: migrationStrategies[vNr + 1]
  })).filter((strategy) => typeof strategy.s !== "function").forEach((strategy) => {
    throw newRxTypeError("COL13", {
      version: strategy.v,
      type: typeof strategy,
      schema
    });
  });
  return true;
}

// node_modules/rxdb/dist/esm/plugins/dev-mode/unallowed-properties.js
function ensureCollectionNameValid(args) {
  if (rxDatabaseProperties().includes(args.name)) {
    throw newRxError("DB5", {
      name: args.name
    });
  }
  validateDatabaseName(args.name);
}
function ensureDatabaseNameIsValid(args) {
  validateDatabaseName(args.name);
  if (args.name.includes("$")) {
    throw newRxError("DB13", {
      name: args.name
    });
  }
  if (isFolderPath(args.name)) {
    if (args.name.endsWith("/") || args.name.endsWith("\\")) {
      throw newRxError("DB11", {
        name: args.name
      });
    }
  }
}
var validCouchDBStringRegexStr = "^[a-z][_$a-zA-Z0-9\\-]*$";
var validCouchDBStringRegex = new RegExp(validCouchDBStringRegexStr);
function validateDatabaseName(name) {
  if (typeof name !== "string" || name.length === 0) {
    throw newRxTypeError("UT1", {
      name
    });
  }
  if (isFolderPath(name)) {
    return true;
  }
  if (!name.match(validCouchDBStringRegex) && /**
   * The string ':memory:' is used in the SQLite RxStorage
   * to persist data into a memory state. Often used in tests.
   */
  name !== ":memory:") {
    throw newRxError("UT2", {
      regex: validCouchDBStringRegexStr,
      givenName: name
    });
  }
  return true;
}

// node_modules/rxdb/dist/esm/plugins/dev-mode/check-query.js
function checkQuery(args) {
  var isPlainObject = Object.prototype.toString.call(args.queryObj) === "[object Object]";
  if (!isPlainObject) {
    throw newRxTypeError("QU11", {
      op: args.op,
      collection: args.collection.name,
      queryObj: args.queryObj
    });
  }
  var validKeys = ["selector", "limit", "skip", "sort", "index"];
  Object.keys(args.queryObj).forEach((key) => {
    if (!validKeys.includes(key)) {
      throw newRxTypeError("QU11", {
        op: args.op,
        collection: args.collection.name,
        queryObj: args.queryObj,
        key,
        args: {
          validKeys
        }
      });
    }
  });
  if (args.op === "count" && (args.queryObj.limit || args.queryObj.skip)) {
    throw newRxError("QU15", {
      collection: args.collection.name,
      query: args.queryObj
    });
  }
  ensureObjectDoesNotContainRegExp(args.queryObj);
}
function checkMangoQuery(args) {
  var schema = args.rxQuery.collection.schema.jsonSchema;
  var undefinedFieldPath = findUndefinedPath(args.mangoQuery);
  if (undefinedFieldPath) {
    throw newRxError("QU19", {
      field: undefinedFieldPath,
      query: args.mangoQuery
    });
  }
  var massagedSelector = args.mangoQuery.selector;
  var schemaTopLevelFields = Object.keys(schema.properties);
  Object.keys(massagedSelector).filter((fieldOrOperator) => !fieldOrOperator.startsWith("$")).filter((field) => !field.includes(".")).forEach((field) => {
    if (!schemaTopLevelFields.includes(field)) {
      throw newRxError("QU13", {
        schema,
        field,
        query: args.mangoQuery
      });
    }
  });
  var schemaIndexes = schema.indexes ? schema.indexes : [];
  var index = args.mangoQuery.index;
  if (index) {
    var isInSchema = schemaIndexes.find((schemaIndex) => deepEqual(schemaIndex, index));
    if (!isInSchema) {
      throw newRxError("QU12", {
        collection: args.rxQuery.collection.name,
        query: args.mangoQuery,
        schema
      });
    }
  }
  if (args.rxQuery.op === "count") {
    if (!areSelectorsSatisfiedByIndex(args.rxQuery.collection.schema.jsonSchema, args.mangoQuery) && !args.rxQuery.collection.database.allowSlowCount) {
      throw newRxError("QU14", {
        collection: args.rxQuery.collection,
        query: args.mangoQuery
      });
    }
  }
  if (args.mangoQuery.sort) {
    args.mangoQuery.sort.map((sortPart) => Object.keys(sortPart)[0]).filter((field) => !field.includes(".")).forEach((field) => {
      if (!schemaTopLevelFields.includes(field)) {
        throw newRxError("QU13", {
          schema,
          field,
          query: args.mangoQuery
        });
      }
    });
  }
  ensureObjectDoesNotContainRegExp(args.mangoQuery);
}
function areSelectorsSatisfiedByIndex(schema, query) {
  var preparedQuery = prepareQuery(schema, query);
  return preparedQuery.queryPlan.selectorSatisfiedByIndex;
}
function ensureObjectDoesNotContainRegExp(selector) {
  if (typeof selector !== "object" || selector === null) {
    return;
  }
  var keys = Object.keys(selector);
  keys.forEach((key) => {
    var value = selector[key];
    if (value instanceof RegExp) {
      throw newRxError("QU16", {
        field: key,
        query: selector
      });
    } else if (Array.isArray(value)) {
      value.forEach((item) => ensureObjectDoesNotContainRegExp(item));
    } else {
      ensureObjectDoesNotContainRegExp(value);
    }
  });
}
function isQueryAllowed(args) {
  if (args.op === "findOne") {
    if (typeof args.queryObj === "number" || Array.isArray(args.queryObj)) {
      throw newRxTypeError("COL6", {
        collection: args.collection.name,
        queryObj: args.queryObj
      });
    }
  } else if (args.op === "find") {
    if (typeof args.queryObj === "string") {
      throw newRxError("COL5", {
        collection: args.collection.name,
        queryObj: args.queryObj
      });
    }
  }
}

// node_modules/rxdb/dist/esm/plugins/dev-mode/check-document.js
function ensurePrimaryKeyValid(primaryKey, docData) {
  if (!primaryKey) {
    throw newRxError("DOC20", {
      primaryKey,
      document: docData
    });
  }
  if (primaryKey !== primaryKey.trim()) {
    throw newRxError("DOC21", {
      primaryKey,
      document: docData
    });
  }
  if (primaryKey.includes("\r") || primaryKey.includes("\n")) {
    throw newRxError("DOC22", {
      primaryKey,
      document: docData
    });
  }
  if (primaryKey.includes('"')) {
    throw newRxError("DOC23", {
      primaryKey,
      document: docData
    });
  }
}
function containsDateInstance(obj) {
  if (typeof obj !== "object" || obj === null) {
    return false;
  }
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      if (obj[key] instanceof Date) {
        return true;
      }
      if (typeof obj[key] === "object" && containsDateInstance(obj[key])) {
        return true;
      }
    }
  }
  return false;
}
function checkWriteRows(storageInstance, rows) {
  var primaryPath = getPrimaryFieldOfPrimaryKey(storageInstance.schema.primaryKey);
  var _loop = function(writeRow2) {
    writeRow2.document = fillPrimaryKey(primaryPath, storageInstance.schema, writeRow2.document);
    if (writeRow2.previous) {
      Object.keys(writeRow2.previous._meta).forEach((metaFieldName) => {
        if (!Object.prototype.hasOwnProperty.call(writeRow2.document._meta, metaFieldName)) {
          throw newRxError("SNH", {
            dataBefore: writeRow2.previous,
            dataAfter: writeRow2.document,
            args: {
              metaFieldName
            }
          });
        }
      });
    }
    try {
      if (typeof structuredClone === "function") {
        structuredClone(writeRow2);
      } else {
        JSON.parse(JSON.stringify(writeRow2));
      }
    } catch (err) {
      throw newRxError("DOC24", {
        collection: storageInstance.collectionName,
        document: writeRow2.document
      });
    }
    if (containsDateInstance(writeRow2.document)) {
      throw newRxError("DOC24", {
        collection: storageInstance.collectionName,
        document: writeRow2.document
      });
    }
  };
  for (var writeRow of rows) {
    _loop(writeRow);
  }
}

// node_modules/rxdb/dist/esm/plugins/dev-mode/dev-mode-tracking.js
var iframeShown = false;
var links = [{
  text: "JavaScript Database",
  url: "https://rxdb.info/"
}, {
  text: "React Native Database",
  url: "https://rxdb.info/react-native-database.html"
}, {
  text: "Local First",
  url: "https://rxdb.info/articles/local-first-future.html"
}, {
  text: "Angular IndexedDB",
  url: "https://rxdb.info/articles/angular-indexeddb.html"
}, {
  text: "React IndexedDB",
  url: "https://rxdb.info/articles/react-indexeddb.html"
}, {
  text: "Firestore Alternative",
  url: "https://rxdb.info/articles/firestore-alternative.html"
}, {
  text: "Offline Database",
  url: "https://rxdb.info/articles/offline-database.html"
}, {
  text: "JSON Database",
  url: "https://rxdb.info/articles/json-database.html"
}, {
  text: "NodeJS Database",
  url: "https://rxdb.info/nodejs-database.html"
}];
function addDevModeTrackingIframe() {
  return __async(this, null, function* () {
    if (iframeShown || typeof window === "undefined" || typeof location === "undefined" || typeof document === "undefined") {
      return;
    }
    if (yield hasPremiumFlag()) {
      return;
    }
    iframeShown = true;
    var containerDiv = document.createElement("div");
    containerDiv.style.visibility = "hidden";
    containerDiv.style.position = "absolute";
    containerDiv.style.top = "0";
    containerDiv.style.left = "0";
    containerDiv.style.opacity = "0.1";
    containerDiv.style.width = "1px";
    containerDiv.style.height = "1px";
    containerDiv.style.overflow = "hidden";
    var iframe = document.createElement("iframe");
    iframe.width = "1px";
    iframe.height = "1px";
    iframe.src = "https://rxdb.info/html/dev-mode-iframe.html?version=" + RXDB_VERSION;
    containerDiv.appendChild(iframe);
    var hashNr = hashStringToNumber(location.host);
    var useLinkId = hashNr % links.length;
    var useLink = links[useLinkId];
    var link = document.createElement("a");
    link.href = useLink.url;
    link.target = "_blank";
    link.innerText = useLink.text;
    var p = document.createElement("p");
    p.innerText = "This is the iframe which is shown when the RxDB Dev-Mode is enabled. Also see ";
    p.appendChild(link);
    containerDiv.appendChild(p);
    document.body.appendChild(containerDiv);
  });
}

// node_modules/rxdb/dist/esm/plugins/dev-mode/index.js
var showDevModeWarning = true;
function disableWarnings() {
  showDevModeWarning = false;
}
function deepFreezeWhenDevMode(obj) {
  if (!obj || typeof obj === "string" || typeof obj === "number") {
    return obj;
  }
  return deepFreeze(obj);
}
var DEV_MODE_PLUGIN_NAME = "dev-mode";
var RxDBDevModePlugin = {
  name: DEV_MODE_PLUGIN_NAME,
  rxdb: true,
  init: () => {
    addDevModeTrackingIframe();
    if (showDevModeWarning) {
      console.warn([
        "-------------- RxDB dev-mode warning -------------------------------",
        "you are seeing this because you use the RxDB dev-mode plugin https://rxdb.info/dev-mode.html?console=dev-mode ",
        "This is great in development mode, because it will run many checks to ensure",
        "that you use RxDB correct. If you see this in production mode,",
        "you did something wrong because the dev-mode plugin will decrease the performance.",
        "",
        "🤗 Hint: To get the most out of RxDB, check out the Premium Plugins",
        "to get access to faster storages and more professional features: https://rxdb.info/premium/?console=dev-mode ",
        "",
        "You can disable this warning by calling disableWarnings() from the dev-mode plugin.",
        // '',
        // 'Also take part in the RxDB User Survey: https://rxdb.info/survey.html',
        "---------------------------------------------------------------------"
      ].join("\n"));
    }
  },
  overwritable: {
    isDevMode() {
      return true;
    },
    deepFreezeWhenDevMode,
    tunnelErrorMessage(code) {
      if (!ERROR_MESSAGES[code]) {
        console.error("RxDB: Error-Code not known: " + code);
        throw new Error("Error-Code " + code + " not known, contact the maintainer");
      }
      var errorMessage = ERROR_MESSAGES[code];
      return "\nError message: " + errorMessage + "\nError code: " + code;
    }
  },
  hooks: {
    preCreateRxSchema: {
      after: checkSchema
    },
    preCreateRxDatabase: {
      before: function(args) {
        if (!args.storage.name.startsWith("validate-")) {
          throw newRxError("DVM1", {
            database: args.name,
            storage: args.storage.name
          });
        }
      },
      after: function(args) {
        ensureDatabaseNameIsValid(args);
      }
    },
    createRxDatabase: {
      after: function(args) {
        return __async(this, null, function* () {
        });
      }
    },
    preCreateRxCollection: {
      after: function(args) {
        ensureCollectionNameValid(args);
        checkOrmDocumentMethods(args.schema, args.methods);
        if (args.name.charAt(0) === "_") {
          throw newRxError("DB2", {
            name: args.name
          });
        }
        if (!args.schema) {
          throw newRxError("DB4", {
            name: args.name,
            args
          });
        }
      }
    },
    createRxDocument: {
      before: function(doc) {
        ensurePrimaryKeyValid(doc.primary, doc.toJSON(true));
      }
    },
    prePrepareRxQuery: {
      after: function(args) {
        isQueryAllowed(args);
      }
    },
    preCreateRxQuery: {
      after: function(args) {
        checkQuery(args);
      }
    },
    prePrepareQuery: {
      after: (args) => {
        checkMangoQuery(args);
      }
    },
    preStorageWrite: {
      before: (args) => {
        checkWriteRows(args.storageInstance, args.rows);
      }
    },
    createRxCollection: {
      after: (args) => {
        checkOrmMethods(args.creator.statics);
        checkOrmMethods(args.creator.methods);
        checkOrmMethods(args.creator.attachments);
        if (args.creator.schema && args.creator.migrationStrategies) {
          checkMigrationStrategies(args.creator.schema, args.creator.migrationStrategies);
        }
      }
    }
  }
};
export {
  DEV_MODE_PLUGIN_NAME,
  RxDBDevModePlugin,
  areSelectorsSatisfiedByIndex,
  checkFieldNameRegex,
  checkMangoQuery,
  checkPrimaryKey,
  checkQuery,
  checkSchema,
  deepFreezeWhenDevMode,
  disableWarnings,
  ensureCollectionNameValid,
  ensureDatabaseNameIsValid,
  ensureObjectDoesNotContainRegExp,
  isQueryAllowed,
  validateDatabaseName,
  validateFieldsDeep
};
//# sourceMappingURL=rxdb_plugins_dev-mode.js.map
