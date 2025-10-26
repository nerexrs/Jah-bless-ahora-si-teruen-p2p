import {
  PROMISE_RESOLVE_TRUE,
  RXDB_VERSION,
  RX_META_LWT_MINIMUM,
  appendToArray,
  clone,
  countUntilNotMatching,
  createRevision,
  ensureNotFalsy,
  firstPropertyNameOfObject,
  flatClone,
  getFromMapOrCreate,
  getPrimaryFieldOfPrimaryKey,
  getSchemaByObjectPath,
  isMaybeReadonlyArray,
  lastOfArray,
  newRxError,
  now,
  objectPathMonad,
  overwritable,
  promiseWait,
  randomToken,
  toArray
} from "./chunk-GXT3KPMX.js";
import {
  filter,
  map,
  startWith,
  switchMap
} from "./chunk-3TXA6K3X.js";
import {
  __async,
  __spreadProps,
  __spreadValues
} from "./chunk-7RSYZEEK.js";

// node_modules/rxdb/dist/esm/hooks.js
var HOOKS = {
  /**
   * Runs before a plugin is added.
   * Use this to block the usage of non-compatible plugins.
   */
  preAddRxPlugin: [],
  /**
   * functions that run before the database is created
   */
  preCreateRxDatabase: [],
  /**
   * runs after the database is created and prepared
   * but before the instance is returned to the user
   * @async
   */
  createRxDatabase: [],
  preCreateRxCollection: [],
  createRxCollection: [],
  createRxState: [],
  /**
  * runs at the end of the close-process of a collection
  * @async
  */
  postCloseRxCollection: [],
  /**
   * Runs after a collection is removed.
   * @async
   */
  postRemoveRxCollection: [],
  /**
    * functions that get the json-schema as input
    * to do additionally checks/manipulation
    */
  preCreateRxSchema: [],
  /**
   * functions that run after the RxSchema is created
   * gets RxSchema as attribute
   */
  createRxSchema: [],
  prePrepareRxQuery: [],
  preCreateRxQuery: [],
  /**
   * Runs before a query is send to the
   * prepareQuery function of the storage engine.
   */
  prePrepareQuery: [],
  createRxDocument: [],
  /**
   * runs after a RxDocument is created,
   * cannot be async
   */
  postCreateRxDocument: [],
  /**
   * Runs before a RxStorageInstance is created
   * gets the params of createStorageInstance()
   * as attribute so you can manipulate them.
   * Notice that you have to clone stuff before mutating the inputs.
   */
  preCreateRxStorageInstance: [],
  preStorageWrite: [],
  /**
   * runs on the document-data before the document is migrated
   * {
   *   doc: Object, // original doc-data
   *   migrated: // migrated doc-data after run through migration-strategies
   * }
   */
  preMigrateDocument: [],
  /**
   * runs after the migration of a document has been done
   */
  postMigrateDocument: [],
  /**
   * runs at the beginning of the close-process of a database
   */
  preCloseRxDatabase: [],
  /**
   * runs after a database has been removed
   * @async
   */
  postRemoveRxDatabase: [],
  postCleanup: [],
  /**
   * runs before the replication writes the rows to master
   * but before the rows have been modified
   * @async
   */
  preReplicationMasterWrite: [],
  /**
   * runs after the replication has been sent to the server
   * but before the new documents have been handled
   * @async
   */
  preReplicationMasterWriteDocumentsHandle: []
};
function runPluginHooks(hookKey, obj) {
  if (HOOKS[hookKey].length > 0) {
    HOOKS[hookKey].forEach((fun) => fun(obj));
  }
}
function runAsyncPluginHooks(hookKey, obj) {
  return __async(this, null, function* () {
    for (var fn of HOOKS[hookKey]) {
      yield fn(obj);
    }
  });
}
function _clearHook(type, fun) {
  HOOKS[type] = HOOKS[type].filter((h) => h !== fun);
}

// node_modules/rxdb/dist/esm/query-planner.js
var INDEX_MAX = String.fromCharCode(65535);
var INDEX_MIN = Number.MIN_SAFE_INTEGER;
function getQueryPlan(schema, query) {
  var selector = query.selector;
  var indexes = schema.indexes ? schema.indexes.slice(0) : [];
  if (query.index) {
    indexes = [query.index];
  }
  var hasDescSorting = !!query.sort.find((sortField) => Object.values(sortField)[0] === "desc");
  var sortIrrelevevantFields = /* @__PURE__ */ new Set();
  Object.keys(selector).forEach((fieldName) => {
    var schemaPart = getSchemaByObjectPath(schema, fieldName);
    if (schemaPart && schemaPart.type === "boolean" && Object.prototype.hasOwnProperty.call(selector[fieldName], "$eq")) {
      sortIrrelevevantFields.add(fieldName);
    }
  });
  var optimalSortIndex = query.sort.map((sortField) => Object.keys(sortField)[0]);
  var optimalSortIndexCompareString = optimalSortIndex.filter((f) => !sortIrrelevevantFields.has(f)).join(",");
  var currentBestQuality = -1;
  var currentBestQueryPlan;
  indexes.forEach((index) => {
    var inclusiveEnd = true;
    var inclusiveStart = true;
    var opts = index.map((indexField) => {
      var matcher = selector[indexField];
      var operators = matcher ? Object.keys(matcher) : [];
      var matcherOpts = {};
      if (!matcher || !operators.length) {
        var startKey = inclusiveStart ? INDEX_MIN : INDEX_MAX;
        matcherOpts = {
          startKey,
          endKey: inclusiveEnd ? INDEX_MAX : INDEX_MIN,
          inclusiveStart: true,
          inclusiveEnd: true
        };
      } else {
        operators.forEach((operator) => {
          if (LOGICAL_OPERATORS.has(operator)) {
            var operatorValue = matcher[operator];
            var partialOpts = getMatcherQueryOpts(operator, operatorValue);
            matcherOpts = Object.assign(matcherOpts, partialOpts);
          }
        });
      }
      if (typeof matcherOpts.startKey === "undefined") {
        matcherOpts.startKey = INDEX_MIN;
      }
      if (typeof matcherOpts.endKey === "undefined") {
        matcherOpts.endKey = INDEX_MAX;
      }
      if (typeof matcherOpts.inclusiveStart === "undefined") {
        matcherOpts.inclusiveStart = true;
      }
      if (typeof matcherOpts.inclusiveEnd === "undefined") {
        matcherOpts.inclusiveEnd = true;
      }
      if (inclusiveStart && !matcherOpts.inclusiveStart) {
        inclusiveStart = false;
      }
      if (inclusiveEnd && !matcherOpts.inclusiveEnd) {
        inclusiveEnd = false;
      }
      return matcherOpts;
    });
    var startKeys = opts.map((opt) => opt.startKey);
    var endKeys = opts.map((opt) => opt.endKey);
    var queryPlan = {
      index,
      startKeys,
      endKeys,
      inclusiveEnd,
      inclusiveStart,
      sortSatisfiedByIndex: !hasDescSorting && optimalSortIndexCompareString === index.filter((f) => !sortIrrelevevantFields.has(f)).join(","),
      selectorSatisfiedByIndex: isSelectorSatisfiedByIndex(index, query.selector, startKeys, endKeys)
    };
    var quality = rateQueryPlan(schema, query, queryPlan);
    if (quality >= currentBestQuality || query.index) {
      currentBestQuality = quality;
      currentBestQueryPlan = queryPlan;
    }
  });
  if (!currentBestQueryPlan) {
    throw newRxError("SNH", {
      query
    });
  }
  return currentBestQueryPlan;
}
var LOGICAL_OPERATORS = /* @__PURE__ */ new Set(["$eq", "$gt", "$gte", "$lt", "$lte"]);
var LOWER_BOUND_LOGICAL_OPERATORS = /* @__PURE__ */ new Set(["$eq", "$gt", "$gte"]);
var UPPER_BOUND_LOGICAL_OPERATORS = /* @__PURE__ */ new Set(["$eq", "$lt", "$lte"]);
function isSelectorSatisfiedByIndex(index, selector, startKeys, endKeys) {
  var selectorEntries = Object.entries(selector);
  var hasNonMatchingOperator = selectorEntries.find(([fieldName2, operation2]) => {
    if (!index.includes(fieldName2)) {
      return true;
    }
    var hasNonLogicOperator = Object.entries(operation2).find(([op, _value]) => !LOGICAL_OPERATORS.has(op));
    return hasNonLogicOperator;
  });
  if (hasNonMatchingOperator) {
    return false;
  }
  if (selector.$and || selector.$or) {
    return false;
  }
  var satisfieldLowerBound = [];
  var lowerOperatorFieldNames = /* @__PURE__ */ new Set();
  for (var [fieldName, operation] of Object.entries(selector)) {
    if (!index.includes(fieldName)) {
      return false;
    }
    var lowerLogicOps = Object.keys(operation).filter((key) => LOWER_BOUND_LOGICAL_OPERATORS.has(key));
    if (lowerLogicOps.length > 1) {
      return false;
    }
    var hasLowerLogicOp = lowerLogicOps[0];
    if (hasLowerLogicOp) {
      lowerOperatorFieldNames.add(fieldName);
    }
    if (hasLowerLogicOp !== "$eq") {
      if (satisfieldLowerBound.length > 0) {
        return false;
      } else {
        satisfieldLowerBound.push(hasLowerLogicOp);
      }
    }
  }
  var satisfieldUpperBound = [];
  var upperOperatorFieldNames = /* @__PURE__ */ new Set();
  for (var [_fieldName, _operation] of Object.entries(selector)) {
    if (!index.includes(_fieldName)) {
      return false;
    }
    var upperLogicOps = Object.keys(_operation).filter((key) => UPPER_BOUND_LOGICAL_OPERATORS.has(key));
    if (upperLogicOps.length > 1) {
      return false;
    }
    var hasUperLogicOp = upperLogicOps[0];
    if (hasUperLogicOp) {
      upperOperatorFieldNames.add(_fieldName);
    }
    if (hasUperLogicOp !== "$eq") {
      if (satisfieldUpperBound.length > 0) {
        return false;
      } else {
        satisfieldUpperBound.push(hasUperLogicOp);
      }
    }
  }
  var i = 0;
  for (var _fieldName2 of index) {
    for (var set of [lowerOperatorFieldNames, upperOperatorFieldNames]) {
      if (!set.has(_fieldName2) && set.size > 0) {
        return false;
      }
      set.delete(_fieldName2);
    }
    var startKey = startKeys[i];
    var endKey = endKeys[i];
    if (startKey !== endKey && lowerOperatorFieldNames.size > 0 && upperOperatorFieldNames.size > 0) {
      return false;
    }
    i++;
  }
  return true;
}
function getMatcherQueryOpts(operator, operatorValue) {
  switch (operator) {
    case "$eq":
      return {
        startKey: operatorValue,
        endKey: operatorValue,
        inclusiveEnd: true,
        inclusiveStart: true
      };
    case "$lte":
      return {
        endKey: operatorValue,
        inclusiveEnd: true
      };
    case "$gte":
      return {
        startKey: operatorValue,
        inclusiveStart: true
      };
    case "$lt":
      return {
        endKey: operatorValue,
        inclusiveEnd: false
      };
    case "$gt":
      return {
        startKey: operatorValue,
        inclusiveStart: false
      };
    default:
      throw new Error("SNH");
  }
}
function rateQueryPlan(schema, query, queryPlan) {
  var quality = 0;
  var addQuality = (value) => {
    if (value > 0) {
      quality = quality + value;
    }
  };
  var pointsPerMatchingKey = 10;
  var nonMinKeyCount = countUntilNotMatching(queryPlan.startKeys, (keyValue) => keyValue !== INDEX_MIN && keyValue !== INDEX_MAX);
  addQuality(nonMinKeyCount * pointsPerMatchingKey);
  var nonMaxKeyCount = countUntilNotMatching(queryPlan.startKeys, (keyValue) => keyValue !== INDEX_MAX && keyValue !== INDEX_MIN);
  addQuality(nonMaxKeyCount * pointsPerMatchingKey);
  var equalKeyCount = countUntilNotMatching(queryPlan.startKeys, (keyValue, idx) => {
    if (keyValue === queryPlan.endKeys[idx]) {
      return true;
    } else {
      return false;
    }
  });
  addQuality(equalKeyCount * pointsPerMatchingKey * 1.5);
  var pointsIfNoReSortMustBeDone = queryPlan.sortSatisfiedByIndex ? 5 : 0;
  addQuality(pointsIfNoReSortMustBeDone);
  return quality;
}

// node_modules/mingo/dist/esm/util.js
var MingoError = class extends Error {
};
var MISSING = Symbol("missing");
var CYCLE_FOUND_ERROR = Object.freeze(new Error("mingo: cycle detected while processing object/array"));
var DEFAULT_HASH_FUNCTION = (value) => {
  const s = stringify(value);
  let hash = 0;
  let i = s.length;
  while (i) hash = (hash << 5) - hash ^ s.charCodeAt(--i);
  return hash >>> 0;
};
var isPrimitive = (v) => typeof v !== "object" && typeof v !== "function" || v === null;
var isScalar = (v) => isPrimitive(v) || isDate(v) || isRegExp(v);
var SORT_ORDER = {
  undefined: 1,
  null: 2,
  number: 3,
  string: 4,
  symbol: 5,
  object: 6,
  array: 7,
  arraybuffer: 8,
  boolean: 9,
  date: 10,
  regexp: 11,
  function: 12
};
var compare = (a, b) => {
  if (a === MISSING) a = void 0;
  if (b === MISSING) b = void 0;
  const [u, v] = [a, b].map((n) => SORT_ORDER[typeOf(n)] || 0);
  if (u !== v) return u - v;
  if (isEqual(a, b)) return 0;
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
};
var ValueMap = class _ValueMap extends Map {
  // The hash function
  #hashFn = DEFAULT_HASH_FUNCTION;
  // maps the hashcode to key set
  #keyMap = /* @__PURE__ */ new Map();
  // returns a tuple of [<masterKey>, <hash>]. Expects an object key.
  #unpack = (key) => {
    const hash = this.#hashFn(key);
    return [(this.#keyMap.get(hash) || []).find((k) => isEqual(k, key)), hash];
  };
  constructor() {
    super();
  }
  /**
   * Returns a new {@link ValueMap} object.
   * @param fn An optional custom hash function
   */
  static init(fn) {
    const m = new _ValueMap();
    if (fn) m.#hashFn = fn;
    return m;
  }
  clear() {
    super.clear();
    this.#keyMap.clear();
  }
  /**
   * @returns true if an element in the Map existed and has been removed, or false if the element does not exist.
   */
  delete(key) {
    if (isPrimitive(key)) return super.delete(key);
    const [masterKey, hash] = this.#unpack(key);
    if (!super.delete(masterKey)) return false;
    this.#keyMap.set(hash, this.#keyMap.get(hash).filter((k) => !isEqual(k, masterKey)));
    return true;
  }
  /**
   * Returns a specified element from the Map object. If the value that is associated to the provided key is an object, then you will get a reference to that object and any change made to that object will effectively modify it inside the Map.
   * @returns Returns the element associated with the specified key. If no element is associated with the specified key, undefined is returned.
   */
  get(key) {
    if (isPrimitive(key)) return super.get(key);
    const [masterKey, _] = this.#unpack(key);
    return super.get(masterKey);
  }
  /**
   * @returns boolean indicating whether an element with the specified key exists or not.
   */
  has(key) {
    if (isPrimitive(key)) return super.has(key);
    const [masterKey, _] = this.#unpack(key);
    return super.has(masterKey);
  }
  /**
   * Adds a new element with a specified key and value to the Map. If an element with the same key already exists, the element will be updated.
   */
  set(key, value) {
    if (isPrimitive(key)) return super.set(key, value);
    const [masterKey, hash] = this.#unpack(key);
    if (super.has(masterKey)) {
      super.set(masterKey, value);
    } else {
      super.set(key, value);
      const keys = this.#keyMap.get(hash) || [];
      keys.push(key);
      this.#keyMap.set(hash, keys);
    }
    return this;
  }
  /**
   * @returns the number of elements in the Map.
   */
  get size() {
    return super.size;
  }
};
function assert(condition, message) {
  if (!condition) throw new MingoError(message);
}
var STRING_REP = Object.keys(SORT_ORDER).reduce((memo, k) => {
  memo["[object " + k[0].toUpperCase() + k.substring(1) + "]"] = k;
  return memo;
}, {});
function typeOf(v) {
  const s = Object.prototype.toString.call(v);
  return s === "[object Object]" ? v?.constructor?.name?.toLowerCase() || "object" : STRING_REP[s] || s.substring(8, s.length - 1).toLowerCase();
}
var isBoolean = (v) => typeof v === "boolean";
var isString = (v) => typeof v === "string";
var isSymbol = (v) => typeof v === "symbol";
var isNumber = (v) => !isNaN(v) && typeof v === "number";
var isArray = Array.isArray;
function isObject(v) {
  if (!v) return false;
  const p = Object.getPrototypeOf(v);
  return (p === Object.prototype || p === null) && typeOf(v) === "object";
}
var isObjectLike = (v) => !isPrimitive(v);
var isDate = (v) => v instanceof Date;
var isRegExp = (v) => v instanceof RegExp;
var isFunction = (v) => typeof v === "function";
var isNil = (v) => v === null || v === void 0;
var truthy = (arg, strict = true) => !!arg || strict && arg === "";
var isEmpty = (x) => isNil(x) || isString(x) && !x || isArray(x) && x.length === 0 || isObject(x) && Object.keys(x).length === 0;
var ensureArray = (x) => isArray(x) ? x : [x];
var has = (obj, prop) => !!obj && Object.prototype.hasOwnProperty.call(obj, prop);
var isTypedArray = (v) => typeof ArrayBuffer !== "undefined" && ArrayBuffer.isView(v);
var cloneDeep = (v, refs) => {
  if (isNil(v) || isBoolean(v) || isNumber(v) || isString(v)) return v;
  if (isDate(v)) return new Date(v);
  if (isRegExp(v)) return new RegExp(v);
  if (isTypedArray(v)) {
    const ctor = v.constructor;
    return new ctor(v);
  }
  if (!(refs instanceof Set)) refs = /* @__PURE__ */ new Set();
  if (refs.has(v)) throw CYCLE_FOUND_ERROR;
  refs.add(v);
  try {
    if (isArray(v)) {
      const arr = new Array(v.length);
      for (let i = 0; i < v.length; i++) arr[i] = cloneDeep(v[i], refs);
      return arr;
    }
    if (isObject(v)) {
      const obj = {};
      for (const k of Object.keys(v)) obj[k] = cloneDeep(v[k], refs);
      return obj;
    }
  } finally {
    refs.delete(v);
  }
  return v;
};
var isMissing = (v) => v === MISSING;
function merge(target, input) {
  if (isMissing(target) || isNil(target)) return input;
  if (isMissing(input) || isNil(input)) return target;
  if (isPrimitive(target) || isPrimitive(input)) return input;
  if (isArray(target) && isArray(input)) {
    assert(target.length === input.length, "arrays must be of equal length to merge.");
  }
  for (const k of Object.keys(input)) {
    target[k] = merge(target[k], input[k]);
  }
  return target;
}
function intersection(input, hashFunction = DEFAULT_HASH_FUNCTION) {
  const vmaps = [ValueMap.init(hashFunction), ValueMap.init(hashFunction)];
  if (input.length === 0) return [];
  if (input.some((arr) => arr.length === 0)) return [];
  if (input.length === 1) return [...input];
  input[input.length - 1].forEach((v) => vmaps[0].set(v, true));
  for (let i = input.length - 2; i > -1; i--) {
    input[i].forEach((v) => {
      if (vmaps[0].has(v)) vmaps[1].set(v, true);
    });
    if (vmaps[1].size === 0) return [];
    vmaps.reverse();
    vmaps[1].clear();
  }
  return Array.from(vmaps[0].keys());
}
function flatten(xs, depth = 1) {
  const arr = new Array();
  function flatten2(ys, n) {
    for (let i = 0, len = ys.length; i < len; i++) {
      if (isArray(ys[i]) && (n > 0 || n < 0)) {
        flatten2(ys[i], Math.max(-1, n - 1));
      } else {
        arr.push(ys[i]);
      }
    }
  }
  flatten2(xs, depth);
  return arr;
}
function getMembersOf(o) {
  const props = {};
  while (o) {
    for (const k of Object.getOwnPropertyNames(o)) if (!(k in props)) props[k] = o[k];
    o = Object.getPrototypeOf(o);
  }
  return props;
}
function hasCustomString(o) {
  while (o) {
    if (Object.getOwnPropertyNames(o).includes("toString")) return o["toString"] !== Object.prototype.toString;
    o = Object.getPrototypeOf(o);
  }
  return false;
}
function isEqual(a, b) {
  if (a === b || Object.is(a, b)) return true;
  if (a === null || b === null) return false;
  if (typeof a !== typeof b) return false;
  if (typeof a !== "object") return false;
  if (a.constructor !== b.constructor) return false;
  if (a instanceof Date) return +a === +b;
  if (a instanceof RegExp) return a.toString() === b.toString();
  const ctor = a.constructor;
  if (ctor === Array || ctor === Object) {
    const aKeys = Object.keys(a).sort();
    const bKeys = Object.keys(b).sort();
    if (aKeys.length !== bKeys.length) return false;
    for (let i = 0, k = aKeys[i]; i < aKeys.length; k = aKeys[++i]) {
      if (k !== bKeys[i] || !isEqual(a[k], b[k])) return false;
    }
    return true;
  }
  return hasCustomString(a) && a.toString() === b.toString();
}
var stringify = (v, refs) => {
  if (v === null) return "null";
  if (v === void 0) return "undefined";
  if (isString(v) || isNumber(v) || isBoolean(v)) return JSON.stringify(v);
  if (isDate(v)) return v.toISOString();
  if (isRegExp(v) || isSymbol(v) || isFunction(v)) return v.toString();
  if (!(refs instanceof Set)) refs = /* @__PURE__ */ new Set();
  if (refs.has(v)) throw CYCLE_FOUND_ERROR;
  try {
    refs.add(v);
    if (isArray(v)) return "[" + v.map((s2) => stringify(s2, refs)).join(",") + "]";
    if (isObject(v)) {
      const keys = Object.keys(v).sort();
      return "{" + keys.map((k) => `${k}:${stringify(v[k], refs)}`).join() + "}";
    }
    const s = hasCustomString(v) ? v.toString() : stringify(getMembersOf(v), refs);
    return typeOf(v) + "(" + s + ")";
  } finally {
    refs.delete(v);
  }
};
function hashCode(value, hashFunction) {
  if (isNil(value)) return null;
  hashFunction = hashFunction || DEFAULT_HASH_FUNCTION;
  return hashFunction(value);
}
function groupBy(collection, keyFn, hashFunction = DEFAULT_HASH_FUNCTION) {
  if (collection.length < 1) return /* @__PURE__ */ new Map();
  const lookup = /* @__PURE__ */ new Map();
  const result = /* @__PURE__ */ new Map();
  for (let i = 0; i < collection.length; i++) {
    const obj = collection[i];
    const key = keyFn(obj, i);
    const hash = hashCode(key, hashFunction);
    if (hash === null) {
      if (result.has(null)) {
        result.get(null).push(obj);
      } else {
        result.set(null, [obj]);
      }
    } else {
      const existingKey = lookup.has(hash) ? lookup.get(hash).find((k) => isEqual(k, key)) : null;
      if (isNil(existingKey)) {
        result.set(key, [obj]);
        if (lookup.has(hash)) {
          lookup.get(hash).push(key);
        } else {
          lookup.set(hash, [key]);
        }
      } else {
        result.get(existingKey).push(obj);
      }
    }
  }
  return result;
}
function getValue(obj, key) {
  return isObjectLike(obj) ? obj[key] : void 0;
}
function unwrap(arr, depth) {
  if (depth < 1) return arr;
  while (depth-- && arr.length === 1) arr = arr[0];
  return arr;
}
function resolve(obj, selector, options) {
  let depth = 0;
  function resolve2(o, path) {
    let value = o;
    for (let i = 0; i < path.length; i++) {
      const field = path[i];
      const isText = /^\d+$/.exec(field) === null;
      if (isText && isArray(value)) {
        if (i === 0 && depth > 0) break;
        depth += 1;
        const subpath = path.slice(i);
        value = value.reduce((acc, item) => {
          const v = resolve2(item, subpath);
          if (v !== void 0) acc.push(v);
          return acc;
        }, []);
        break;
      } else {
        value = getValue(value, field);
      }
      if (value === void 0) break;
    }
    return value;
  }
  const res = isScalar(obj) ? obj : resolve2(obj, selector.split("."));
  return isArray(res) && options?.unwrapArray ? unwrap(res, depth) : res;
}
function resolveGraph(obj, selector, options) {
  const sep = selector.indexOf(".");
  const key = sep == -1 ? selector : selector.substring(0, sep);
  const next = selector.substring(sep + 1);
  const hasNext = sep != -1;
  if (isArray(obj)) {
    const isIndex = /^\d+$/.test(key);
    const arr = isIndex && options?.preserveIndex ? [...obj] : [];
    if (isIndex) {
      const index = parseInt(key);
      let value2 = getValue(obj, index);
      if (hasNext) {
        value2 = resolveGraph(value2, next, options);
      }
      if (options?.preserveIndex) {
        arr[index] = value2;
      } else {
        arr.push(value2);
      }
    } else {
      for (const item of obj) {
        const value2 = resolveGraph(item, selector, options);
        if (options?.preserveMissing) {
          arr.push(value2 == void 0 ? MISSING : value2);
        } else if (value2 != void 0 || options?.preserveIndex) {
          arr.push(value2);
        }
      }
    }
    return arr;
  }
  const res = options?.preserveKeys ? __spreadValues({}, obj) : {};
  let value = getValue(obj, key);
  if (hasNext) {
    value = resolveGraph(value, next, options);
  }
  if (value === void 0) return void 0;
  res[key] = value;
  return res;
}
function filterMissing(obj) {
  if (isArray(obj)) {
    for (let i = obj.length - 1; i >= 0; i--) {
      if (obj[i] === MISSING) {
        obj.splice(i, 1);
      } else {
        filterMissing(obj[i]);
      }
    }
  } else if (isObject(obj)) {
    for (const k in obj) {
      if (has(obj, k)) {
        filterMissing(obj[k]);
      }
    }
  }
}
var NUMBER_RE = /^\d+$/;
function walk(obj, selector, fn, options) {
  const names = selector.split(".");
  const key = names[0];
  const next = names.slice(1).join(".");
  if (names.length === 1) {
    if (isObject(obj) || isArray(obj) && NUMBER_RE.test(key)) {
      fn(obj, key);
    }
  } else {
    if (options?.buildGraph && isNil(obj[key])) {
      obj[key] = {};
    }
    const item = obj[key];
    if (!item) return;
    const isNextArrayIndex = !!(names.length > 1 && NUMBER_RE.test(names[1]));
    if (isArray(item) && options?.descendArray && !isNextArrayIndex) {
      item.forEach((e) => walk(e, next, fn, options));
    } else {
      walk(item, next, fn, options);
    }
  }
}
function setValue(obj, selector, value) {
  walk(obj, selector, (item, key) => {
    item[key] = isFunction(value) ? value(item[key]) : value;
  }, {
    buildGraph: true
  });
}
function removeValue(obj, selector, options) {
  walk(obj, selector, (item, key) => {
    if (isArray(item)) {
      if (/^\d+$/.test(key)) {
        item.splice(parseInt(key), 1);
      } else if (options && options.descendArray) {
        for (const elem of item) {
          if (isObject(elem)) {
            delete elem[key];
          }
        }
      }
    } else if (isObject(item)) {
      delete item[key];
    }
  }, options);
}
var OPERATOR_NAME_PATTERN = /^\$[a-zA-Z0-9_]+$/;
function isOperator(name) {
  return OPERATOR_NAME_PATTERN.test(name);
}
function normalize(expr) {
  if (isScalar(expr)) {
    return isRegExp(expr) ? {
      $regex: expr
    } : {
      $eq: expr
    };
  }
  if (isObjectLike(expr)) {
    if (!Object.keys(expr).some(isOperator)) return {
      $eq: expr
    };
    if (has(expr, "$regex")) {
      const newExpr = __spreadValues({}, expr);
      newExpr["$regex"] = new RegExp(expr["$regex"], expr["$options"]);
      delete newExpr["$options"];
      return newExpr;
    }
  }
  return expr;
}

// node_modules/mingo/dist/esm/core.js
var ProcessingMode = ((ProcessingMode2) => {
  ProcessingMode2[ProcessingMode2["CLONE_OFF"] = 0] = "CLONE_OFF";
  ProcessingMode2[ProcessingMode2["CLONE_INPUT"] = 1] = "CLONE_INPUT";
  ProcessingMode2[ProcessingMode2["CLONE_OUTPUT"] = 2] = "CLONE_OUTPUT";
  ProcessingMode2[ProcessingMode2["CLONE_ALL"] = 3] = "CLONE_ALL";
  return ProcessingMode2;
})(ProcessingMode || {});
var ComputeOptions = class _ComputeOptions {
  #options;
  /** Reference to the root object when processing subgraphs of the object. */
  #root;
  #local;
  constructor(options, root, local) {
    this.#options = options;
    this.update(root, local);
  }
  /**
   * Initialize new ComputeOptions.
   * @returns {ComputeOptions}
   */
  static init(options, root, local) {
    return !(options instanceof _ComputeOptions) ? new _ComputeOptions(options, root, local) : new _ComputeOptions(options.#options, options.root ?? root, __spreadProps(__spreadValues(__spreadValues({}, options.#local), local), {
      variables: Object.assign({}, options.#local?.variables, local?.variables)
    }));
  }
  /**
   * Updates the internal state.
   *
   * @param root The new root context for this object.
   * @param local The new local state to merge into current if it exists.
   * @returns
   */
  update(root, local) {
    this.#root = root;
    const variables = Object.assign({}, this.#local?.variables, local?.variables);
    if (Object.keys(variables).length) {
      this.#local = __spreadProps(__spreadValues({}, local), {
        variables
      });
    } else {
      this.#local = local ?? {};
    }
    return this;
  }
  getOptions() {
    return Object.freeze(__spreadProps(__spreadValues({}, this.#options), {
      context: Context.from(this.#options.context)
    }));
  }
  get root() {
    return this.#root;
  }
  get local() {
    return this.#local;
  }
  get idKey() {
    return this.#options.idKey;
  }
  get collation() {
    return this.#options?.collation;
  }
  get processingMode() {
    return this.#options?.processingMode || 0;
  }
  get useStrictMode() {
    return this.#options?.useStrictMode;
  }
  get scriptEnabled() {
    return this.#options?.scriptEnabled;
  }
  get useGlobalContext() {
    return this.#options?.useGlobalContext;
  }
  get hashFunction() {
    return this.#options?.hashFunction;
  }
  get collectionResolver() {
    return this.#options?.collectionResolver;
  }
  get jsonSchemaValidator() {
    return this.#options?.jsonSchemaValidator;
  }
  get variables() {
    return this.#options?.variables;
  }
  get context() {
    return this.#options?.context;
  }
};
function initOptions(options) {
  return options instanceof ComputeOptions ? options.getOptions() : Object.freeze(__spreadProps(__spreadValues({
    idKey: "_id",
    scriptEnabled: true,
    useStrictMode: true,
    useGlobalContext: true,
    processingMode: 0
  }, options), {
    context: options?.context ? Context.from(options?.context) : Context.init()
  }));
}
var OperatorType = ((OperatorType2) => {
  OperatorType2["ACCUMULATOR"] = "accumulator";
  OperatorType2["EXPRESSION"] = "expression";
  OperatorType2["PIPELINE"] = "pipeline";
  OperatorType2["PROJECTION"] = "projection";
  OperatorType2["QUERY"] = "query";
  OperatorType2["WINDOW"] = "window";
  return OperatorType2;
})(OperatorType || {});
var Context = class _Context {
  #operators = /* @__PURE__ */ new Map();
  constructor() {
  }
  static init() {
    return new _Context();
  }
  static from(ctx) {
    const instance = _Context.init();
    if (isNil(ctx)) return instance;
    ctx.#operators.forEach((v, k) => instance.addOperators(k, v));
    return instance;
  }
  addOperators(type, operators) {
    if (!this.#operators.has(type)) this.#operators.set(type, {});
    for (const [name, fn] of Object.entries(operators)) {
      if (!this.getOperator(type, name)) {
        this.#operators.get(type)[name] = fn;
      }
    }
    return this;
  }
  getOperator(type, name) {
    const ops = this.#operators.get(type) ?? {};
    return ops[name] ?? null;
  }
  addAccumulatorOps(ops) {
    return this.addOperators("accumulator", ops);
  }
  addExpressionOps(ops) {
    return this.addOperators("expression", ops);
  }
  addQueryOps(ops) {
    return this.addOperators("query", ops);
  }
  addPipelineOps(ops) {
    return this.addOperators("pipeline", ops);
  }
  addProjectionOps(ops) {
    return this.addOperators("projection", ops);
  }
  addWindowOps(ops) {
    return this.addOperators("window", ops);
  }
};
var GLOBAL_CONTEXT = Context.init();
function useOperators(type, operators) {
  for (const [name, fn] of Object.entries(operators)) {
    assert(isFunction(fn) && isOperator(name), `'${name}' is not a valid operator`);
    const currentFn = getOperator(type, name, null);
    assert(!currentFn || fn === currentFn, `${name} already exists for '${type}' operators. Cannot change operator function once registered.`);
  }
  switch (type) {
    case "accumulator":
      GLOBAL_CONTEXT.addAccumulatorOps(operators);
      break;
    case "expression":
      GLOBAL_CONTEXT.addExpressionOps(operators);
      break;
    case "pipeline":
      GLOBAL_CONTEXT.addPipelineOps(operators);
      break;
    case "projection":
      GLOBAL_CONTEXT.addProjectionOps(operators);
      break;
    case "query":
      GLOBAL_CONTEXT.addQueryOps(operators);
      break;
    case "window":
      GLOBAL_CONTEXT.addWindowOps(operators);
      break;
  }
}
function getOperator(type, name, options) {
  const {
    context: ctx,
    useGlobalContext: fallback
  } = options || {};
  const fn = ctx ? ctx.getOperator(type, name) : null;
  return !fn && fallback ? GLOBAL_CONTEXT.getOperator(type, name) : fn;
}
function computeValue(obj, expr, operator, options) {
  const copts = ComputeOptions.init(options, obj);
  return !!operator && isOperator(operator) ? computeOperator(obj, expr, operator, copts) : computeExpression(obj, expr, copts);
}
var SYSTEM_VARS = ["$$ROOT", "$$CURRENT", "$$REMOVE", "$$NOW"];
function computeExpression(obj, expr, options) {
  if (isString(expr) && expr.length > 0 && expr[0] === "$") {
    if (REDACT_ACTIONS.includes(expr)) return expr;
    let ctx = options.root;
    const arr = expr.split(".");
    if (SYSTEM_VARS.includes(arr[0])) {
      switch (arr[0]) {
        case "$$ROOT":
          break;
        case "$$CURRENT":
          ctx = obj;
          break;
        case "$$REMOVE":
          ctx = void 0;
          break;
        case "$$NOW":
          ctx = /* @__PURE__ */ new Date();
          break;
      }
      expr = expr.slice(arr[0].length + 1);
    } else if (arr[0].slice(0, 2) === "$$") {
      ctx = Object.assign(
        {},
        // global vars
        options.variables,
        // current item is added before local variables because the binding may be changed.
        {
          this: obj
        },
        // local vars
        options?.local?.variables
      );
      const name = arr[0].slice(2);
      assert(has(ctx, name), `Use of undefined variable: ${name}`);
      expr = expr.slice(2);
    } else {
      expr = expr.slice(1);
    }
    return expr === "" ? ctx : resolve(ctx, expr);
  }
  if (isArray(expr)) {
    return expr.map((item) => computeExpression(obj, item, options));
  }
  if (isObject(expr)) {
    const result = {};
    const elems = Object.entries(expr);
    for (const [key, val] of elems) {
      if (isOperator(key)) {
        assert(elems.length == 1, "expression must have single operator.");
        return computeOperator(obj, val, key, options);
      }
      result[key] = computeExpression(obj, val, options);
    }
    return result;
  }
  return expr;
}
function computeOperator(obj, expr, operator, options) {
  const callExpression = getOperator("expression", operator, options);
  if (callExpression) return callExpression(obj, expr, options);
  const callAccumulator = getOperator("accumulator", operator, options);
  assert(!!callAccumulator, `accumulator '${operator}' is not registered.`);
  if (!isArray(obj)) {
    obj = computeExpression(obj, expr, options);
    expr = null;
  }
  assert(isArray(obj), `arguments must resolve to array for ${operator}.`);
  return callAccumulator(obj, expr, options);
}
var REDACT_ACTIONS = ["$$KEEP", "$$PRUNE", "$$DESCEND"];

// node_modules/mingo/dist/esm/lazy.js
function Lazy(source) {
  return source instanceof Iterator ? source : new Iterator(source);
}
function concat(...iterators) {
  let index = 0;
  return Lazy(() => {
    while (index < iterators.length) {
      const o = iterators[index].next();
      if (!o.done) return o;
      index++;
    }
    return {
      done: true
    };
  });
}
function isGenerator(o) {
  return !!o && typeof o === "object" && o?.next instanceof Function;
}
function dropItem(array, i) {
  const rest = array.slice(i + 1);
  array.splice(i);
  Array.prototype.push.apply(array, rest);
}
var DONE = new Error();
var Action = ((Action2) => {
  Action2[Action2["MAP"] = 0] = "MAP";
  Action2[Action2["FILTER"] = 1] = "FILTER";
  Action2[Action2["TAKE"] = 2] = "TAKE";
  Action2[Action2["DROP"] = 3] = "DROP";
  return Action2;
})(Action || {});
function createCallback(nextFn, iteratees, buffer) {
  let done = false;
  let index = -1;
  let bufferIndex = 0;
  return function(storeResult) {
    try {
      outer: while (!done) {
        let o = nextFn();
        index++;
        let i = -1;
        const size = iteratees.length;
        let innerDone = false;
        while (++i < size) {
          const r = iteratees[i];
          switch (r.action) {
            case 0:
              o = r.func(o, index);
              break;
            case 1:
              if (!r.func(o, index)) continue outer;
              break;
            case 2:
              --r.count;
              if (!r.count) innerDone = true;
              break;
            case 3:
              --r.count;
              if (!r.count) dropItem(iteratees, i);
              continue outer;
            default:
              break outer;
          }
        }
        done = innerDone;
        if (storeResult) {
          buffer[bufferIndex++] = o;
        } else {
          return {
            value: o,
            done: false
          };
        }
      }
    } catch (e) {
      if (e !== DONE) throw e;
    }
    done = true;
    return {
      done
    };
  };
}
var Iterator = class {
  /**
   * @param {*} source An iterable object or function.
   *    Array - return one element per cycle
   *    Object{next:Function} - call next() for the next value (this also handles generator functions)
   *    Function - call to return the next value
   * @param {Function} fn An optional transformation function
   */
  constructor(source) {
    this.#iteratees = [];
    this.#yieldedValues = [];
    this.isDone = false;
    let nextVal;
    if (source instanceof Function) {
      source = {
        next: source
      };
    }
    if (isGenerator(source)) {
      const src = source;
      nextVal = () => {
        const o = src.next();
        if (o.done) throw DONE;
        return o.value;
      };
    } else if (isArray(source)) {
      const data = source;
      const size = data.length;
      let index = 0;
      nextVal = () => {
        if (index < size) return data[index++];
        throw DONE;
      };
    } else if (!(source instanceof Function)) {
      throw new MingoError(`Lazy must be initialized with an array, generator, or function.`);
    }
    this.#getNext = createCallback(nextVal, this.#iteratees, this.#yieldedValues);
  }
  #iteratees;
  #yieldedValues;
  #getNext;
  /**
   * Add an iteratee to this lazy sequence
   */
  push(action, value) {
    if (typeof value === "function") {
      this.#iteratees.push({
        action,
        func: value
      });
    } else if (typeof value === "number") {
      this.#iteratees.push({
        action,
        count: value
      });
    }
    return this;
  }
  next() {
    return this.#getNext();
  }
  // Iteratees methods
  /**
   * Transform each item in the sequence to a new value
   * @param {Function} f
   */
  map(f) {
    return this.push(0, f);
  }
  /**
   * Select only items matching the given predicate
   * @param {Function} pred
   */
  filter(predicate) {
    return this.push(1, predicate);
  }
  /**
   * Take given numbe for values from sequence
   * @param {Number} n A number greater than 0
   */
  take(n) {
    return n > 0 ? this.push(2, n) : this;
  }
  /**
   * Drop a number of values from the sequence
   * @param {Number} n Number of items to drop greater than 0
   */
  drop(n) {
    return n > 0 ? this.push(3, n) : this;
  }
  // Transformations
  /**
   * Returns a new lazy object with results of the transformation
   * The entire sequence is realized.
   *
   * @param {Callback<Source, Any[]>} fn Tranform function of type (Array) => (Any)
   */
  transform(fn) {
    const self = this;
    let iter;
    return Lazy(() => {
      if (!iter) {
        iter = Lazy(fn(self.value()));
      }
      return iter.next();
    });
  }
  // Terminal methods
  /**
   * Returns the fully realized values of the iterators.
   * The return value will be an array unless `lazy.first()` was used.
   * The realized values are cached for subsequent calls.
   */
  value() {
    if (!this.isDone) {
      this.isDone = this.#getNext(true).done;
    }
    return this.#yieldedValues;
  }
  /**
   * Execute the funcion for each value. Will stop when an execution returns false.
   * @param {Function} f
   * @returns {Boolean} false iff `f` return false for AnyVal execution, otherwise true
   */
  each(f) {
    for (; ; ) {
      const o = this.next();
      if (o.done) break;
      if (f(o.value) === false) return false;
    }
    return true;
  }
  /**
   * Returns the reduction of sequence according the reducing function
   *
   * @param {*} f a reducing function
   * @param {*} initialValue
   */
  reduce(f, initialValue) {
    let o = this.next();
    if (initialValue === void 0 && !o.done) {
      initialValue = o.value;
      o = this.next();
    }
    while (!o.done) {
      initialValue = f(initialValue, o.value);
      o = this.next();
    }
    return initialValue;
  }
  /**
   * Returns the number of matched items in the sequence
   */
  size() {
    return this.reduce((acc, _) => ++acc, 0);
  }
  [Symbol.iterator]() {
    return this;
  }
};

// node_modules/mingo/dist/esm/operators/pipeline/limit.js
var $limit = (collection, expr, _options) => collection.take(expr);

// node_modules/mingo/dist/esm/operators/pipeline/project.js
var $project = (collection, expr, options) => {
  if (isEmpty(expr)) return collection;
  validateExpression(expr, options);
  return collection.map(createHandler(expr, ComputeOptions.init(options)));
};
function createHandler(expr, options, isRoot = true) {
  const idKey = options.idKey;
  const expressionKeys = Object.keys(expr);
  const excludedKeys = new Array();
  const includedKeys = new Array();
  const handlers = {};
  for (const key of expressionKeys) {
    const subExpr = expr[key];
    if (isNumber(subExpr) || isBoolean(subExpr)) {
      if (subExpr) {
        includedKeys.push(key);
      } else {
        excludedKeys.push(key);
      }
    } else if (isArray(subExpr)) {
      handlers[key] = (o) => subExpr.map((v) => computeValue(o, v, null, options.update(o)) ?? null);
    } else if (isObject(subExpr)) {
      const subExprKeys = Object.keys(subExpr);
      const operator = subExprKeys.length == 1 ? subExprKeys[0] : "";
      const projectFn = getOperator("projection", operator, options);
      if (projectFn) {
        const foundSlice = operator === "$slice";
        if (foundSlice && !ensureArray(subExpr[operator]).every(isNumber)) {
          handlers[key] = (o) => computeValue(o, subExpr, key, options.update(o));
        } else {
          handlers[key] = (o) => projectFn(o, subExpr[operator], key, options.update(o));
        }
      } else if (isOperator(operator)) {
        handlers[key] = (o) => computeValue(o, subExpr[operator], operator, options);
      } else {
        validateExpression(subExpr, options);
        handlers[key] = (o) => {
          if (!has(o, key)) return computeValue(o, subExpr, null, options);
          if (isRoot) options.update(o);
          const target = resolve(o, key);
          const fn = createHandler(subExpr, options, false);
          if (isArray(target)) return target.map(fn);
          if (isObject(target)) return fn(target);
          return fn(o);
        };
      }
    } else {
      handlers[key] = isString(subExpr) && subExpr[0] === "$" ? (o) => computeValue(o, subExpr, key, options) : (_) => subExpr;
    }
  }
  const handlerKeys = Object.keys(handlers);
  const idKeyExcluded = excludedKeys.includes(idKey);
  const idKeyOnlyExcluded = isRoot && idKeyExcluded && excludedKeys.length === 1 && !includedKeys.length && !handlerKeys.length;
  if (idKeyOnlyExcluded) {
    return (o) => {
      const newObj = __spreadValues({}, o);
      delete newObj[idKey];
      return newObj;
    };
  }
  const idKeyImplicit = isRoot && !idKeyExcluded && !includedKeys.includes(idKey);
  const opts = {
    preserveMissing: true
  };
  return (o) => {
    const newObj = {};
    if (excludedKeys.length && !includedKeys.length) {
      merge(newObj, o);
      for (const k of excludedKeys) {
        removeValue(newObj, k, {
          descendArray: true
        });
      }
    }
    for (const k of includedKeys) {
      const pathObj = resolveGraph(o, k, opts) ?? {};
      merge(newObj, pathObj);
    }
    if (includedKeys.length) filterMissing(newObj);
    for (const k of handlerKeys) {
      const value = handlers[k](o);
      if (value === void 0) {
        removeValue(newObj, k, {
          descendArray: true
        });
      } else {
        setValue(newObj, k, value);
      }
    }
    if (idKeyImplicit && has(o, idKey)) {
      newObj[idKey] = resolve(o, idKey);
    }
    return newObj;
  };
}
function validateExpression(expr, options) {
  let exclusions = false;
  let inclusions = false;
  for (const [k, v] of Object.entries(expr)) {
    assert(!k.startsWith("$"), "Field names may not start with '$'.");
    assert(!k.endsWith(".$"), "Positional projection operator '$' is not supported.");
    if (k === options?.idKey) continue;
    if (v === 0 || v === false) {
      exclusions = true;
    } else if (v === 1 || v === true) {
      inclusions = true;
    }
    assert(!(exclusions && inclusions), "Projection cannot have a mix of inclusion and exclusion.");
  }
}

// node_modules/mingo/dist/esm/operators/pipeline/skip.js
var $skip = (collection, expr, _options) => {
  return collection.drop(expr);
};

// node_modules/mingo/dist/esm/operators/pipeline/sort.js
var $sort = (collection, sortKeys, options) => {
  if (isEmpty(sortKeys) || !isObject(sortKeys)) return collection;
  let cmp = compare;
  const collationSpec = options.collation;
  if (isObject(collationSpec) && isString(collationSpec.locale)) {
    cmp = collationComparator(collationSpec);
  }
  return collection.transform((coll) => {
    const modifiers = Object.keys(sortKeys);
    for (const key of modifiers.reverse()) {
      const groups = groupBy(coll, (obj) => resolve(obj, key), options.hashFunction);
      const sortedKeys = Array.from(groups.keys()).sort(cmp);
      if (sortKeys[key] === -1) sortedKeys.reverse();
      let i = 0;
      for (const k of sortedKeys) for (const v of groups.get(k)) coll[i++] = v;
      assert(i == coll.length, "bug: counter must match collection size.");
    }
    return coll;
  });
};
var COLLATION_STRENGTH = {
  // Only strings that differ in base letters compare as unequal. Examples: a ≠ b, a = á, a = A.
  1: "base",
  //  Only strings that differ in base letters or accents and other diacritic marks compare as unequal.
  // Examples: a ≠ b, a ≠ á, a = A.
  2: "accent",
  // Strings that differ in base letters, accents and other diacritic marks, or case compare as unequal.
  // Other differences may also be taken into consideration. Examples: a ≠ b, a ≠ á, a ≠ A
  3: "variant"
  // case - Only strings that differ in base letters or case compare as unequal. Examples: a ≠ b, a = á, a ≠ A.
};
function collationComparator(spec) {
  const localeOpt = {
    sensitivity: COLLATION_STRENGTH[spec.strength || 3],
    caseFirst: spec.caseFirst === "off" ? "false" : spec.caseFirst || "false",
    numeric: spec.numericOrdering || false,
    ignorePunctuation: spec.alternate === "shifted"
  };
  if ((spec.caseLevel || false) === true) {
    if (localeOpt.sensitivity === "base") localeOpt.sensitivity = "case";
    if (localeOpt.sensitivity === "accent") localeOpt.sensitivity = "variant";
  }
  const collator = new Intl.Collator(spec.locale, localeOpt);
  return (a, b) => {
    if (!isString(a) || !isString(b)) return compare(a, b);
    const i = collator.compare(a, b);
    if (i < 0) return -1;
    if (i > 0) return 1;
    return 0;
  };
}

// node_modules/mingo/dist/esm/cursor.js
var OPERATORS = {
  $sort,
  $skip,
  $limit
};
var Cursor = class {
  #source;
  #predicate;
  #projection;
  #options;
  #operators = {};
  #result = null;
  #buffer = [];
  constructor(source, predicate, projection, options) {
    this.#source = source;
    this.#predicate = predicate;
    this.#projection = projection;
    this.#options = options;
  }
  /** Returns the iterator from running the query */
  fetch() {
    if (this.#result) return this.#result;
    this.#result = Lazy(this.#source).filter(this.#predicate);
    const mode = this.#options.processingMode;
    if (mode & ProcessingMode.CLONE_INPUT) this.#result.map(cloneDeep);
    for (const op of ["$sort", "$skip", "$limit"]) {
      if (has(this.#operators, op)) {
        this.#result = OPERATORS[op](this.#result, this.#operators[op], this.#options);
      }
    }
    if (Object.keys(this.#projection).length) {
      this.#result = $project(this.#result, this.#projection, this.#options);
    }
    if (mode & ProcessingMode.CLONE_OUTPUT) this.#result.map(cloneDeep);
    return this.#result;
  }
  /** Returns an iterator with the buffered data included */
  fetchAll() {
    const buffered = Lazy([...this.#buffer]);
    this.#buffer = [];
    return concat(buffered, this.fetch());
  }
  /**
   * Return remaining objects in the cursor as an array. This method exhausts the cursor
   * @returns {Array}
   */
  all() {
    return this.fetchAll().value();
  }
  /**
   * Returns the number of objects return in the cursor. This method exhausts the cursor
   * @returns {Number}
   */
  count() {
    return this.all().length;
  }
  /**
   * Returns a cursor that begins returning results only after passing or skipping a number of documents.
   * @param {Number} n the number of results to skip.
   * @return {Cursor} Returns the cursor, so you can chain this call.
   */
  skip(n) {
    this.#operators["$skip"] = n;
    return this;
  }
  /**
   * Constrains the size of a cursor's result set.
   * @param {Number} n the number of results to limit to.
   * @return {Cursor} Returns the cursor, so you can chain this call.
   */
  limit(n) {
    this.#operators["$limit"] = n;
    return this;
  }
  /**
   * Returns results ordered according to a sort specification.
   * @param {AnyObject} modifier an object of key and values specifying the sort order. 1 for ascending and -1 for descending
   * @return {Cursor} Returns the cursor, so you can chain this call.
   */
  sort(modifier) {
    this.#operators["$sort"] = modifier;
    return this;
  }
  /**
   * Specifies the collation for the cursor returned by the `mingo.Query.find`
   * @param {*} spec
   */
  collation(spec) {
    this.#options = __spreadProps(__spreadValues({}, this.#options), {
      collation: spec
    });
    return this;
  }
  /**
   * Returns the next document in a cursor.
   * @returns {AnyObject | Boolean}
   */
  next() {
    if (this.#buffer.length > 0) {
      return this.#buffer.pop();
    }
    const o = this.fetch().next();
    if (o.done) return;
    return o.value;
  }
  /**
   * Returns true if the cursor has documents and can be iterated.
   * @returns {boolean}
   */
  hasNext() {
    if (this.#buffer.length > 0) return true;
    const o = this.fetch().next();
    if (o.done) return false;
    this.#buffer.push(o.value);
    return true;
  }
  /**
   * Applies a function to each document in a cursor and collects the return values in an array.
   * @param fn
   * @returns {Array}
   */
  map(fn) {
    return this.all().map(fn);
  }
  /**
   * Applies a JavaScript function for every document in a cursor.
   * @param fn
   */
  forEach(fn) {
    this.all().forEach(fn);
  }
  [Symbol.iterator]() {
    return this.fetchAll();
  }
};

// node_modules/mingo/dist/esm/query.js
var TOP_LEVEL_OPS = new Set(Array.from(["$and", "$or", "$nor", "$expr", "$jsonSchema"]));
var Query = class {
  #compiled;
  #options;
  #condition;
  constructor(condition, options) {
    this.#condition = cloneDeep(condition);
    this.#options = initOptions(options);
    this.#compiled = [];
    this.compile();
  }
  compile() {
    assert(isObject(this.#condition), `query criteria must be an object: ${JSON.stringify(this.#condition)}`);
    const whereOperator = {};
    for (const [field, expr] of Object.entries(this.#condition)) {
      if ("$where" === field) {
        assert(this.#options.scriptEnabled, "$where operator requires 'scriptEnabled' option to be true.");
        Object.assign(whereOperator, {
          field,
          expr
        });
      } else if (TOP_LEVEL_OPS.has(field)) {
        this.processOperator(field, field, expr);
      } else {
        assert(!isOperator(field), `unknown top level operator: ${field}`);
        for (const [operator, val] of Object.entries(normalize(expr))) {
          this.processOperator(field, operator, val);
        }
      }
      if (whereOperator.field) {
        this.processOperator(whereOperator.field, whereOperator.field, whereOperator.expr);
      }
    }
  }
  processOperator(field, operator, value) {
    const call = getOperator("query", operator, this.#options);
    assert(!!call, `unknown query operator ${operator}`);
    this.#compiled.push(call(field, value, this.#options));
  }
  /**
   * Checks if the object passes the query criteria. Returns true if so, false otherwise.
   *
   * @param obj The object to test
   * @returns {boolean}
   */
  test(obj) {
    return this.#compiled.every((p) => p(obj));
  }
  /**
   * Returns a cursor to select matching documents from the input source.
   *
   * @param source A source providing a sequence of documents
   * @param projection An optional projection criteria
   * @returns {Cursor} A Cursor for iterating over the results
   */
  find(collection, projection) {
    return new Cursor(collection, (o) => this.test(o), projection || {}, this.#options);
  }
  /**
   * Remove matched documents from the collection returning the remainder
   *
   * @param collection An array of documents
   * @returns {Array} A new array with matching elements removed
   */
  remove(collection) {
    return collection.reduce((acc, obj) => {
      if (!this.test(obj)) acc.push(obj);
      return acc;
    }, []);
  }
};

// node_modules/mingo/dist/esm/operators/pipeline/bucketAuto.js
var PREFERRED_NUMBERS = Object.freeze({
  // "Least rounded" Renard number series, taken from Wikipedia page on preferred
  // numbers: https://en.wikipedia.org/wiki/Preferred_number#Renard_numbers
  R5: [10, 16, 25, 40, 63],
  R10: [100, 125, 160, 200, 250, 315, 400, 500, 630, 800],
  R20: [100, 112, 125, 140, 160, 180, 200, 224, 250, 280, 315, 355, 400, 450, 500, 560, 630, 710, 800, 900],
  R40: [100, 106, 112, 118, 125, 132, 140, 150, 160, 170, 180, 190, 200, 212, 224, 236, 250, 265, 280, 300, 315, 355, 375, 400, 425, 450, 475, 500, 530, 560, 600, 630, 670, 710, 750, 800, 850, 900, 950],
  R80: [103, 109, 115, 122, 128, 136, 145, 155, 165, 175, 185, 195, 206, 218, 230, 243, 258, 272, 290, 307, 325, 345, 365, 387, 412, 437, 462, 487, 515, 545, 575, 615, 650, 690, 730, 775, 825, 875, 925, 975],
  // https://en.wikipedia.org/wiki/Preferred_number#1-2-5_series
  "1-2-5": [10, 20, 50],
  // E series, taken from Wikipedia page on preferred numbers:
  // https://en.wikipedia.org/wiki/Preferred_number#E_series
  E6: [10, 15, 22, 33, 47, 68],
  E12: [10, 12, 15, 18, 22, 27, 33, 39, 47, 56, 68, 82],
  E24: [10, 11, 12, 13, 15, 16, 18, 20, 22, 24, 27, 30, 33, 36, 39, 43, 47, 51, 56, 62, 68, 75, 82, 91],
  E48: [100, 105, 110, 115, 121, 127, 133, 140, 147, 154, 162, 169, 178, 187, 196, 205, 215, 226, 237, 249, 261, 274, 287, 301, 316, 332, 348, 365, 383, 402, 422, 442, 464, 487, 511, 536, 562, 590, 619, 649, 681, 715, 750, 787, 825, 866, 909, 953],
  E96: [100, 102, 105, 107, 110, 113, 115, 118, 121, 124, 127, 130, 133, 137, 140, 143, 147, 150, 154, 158, 162, 165, 169, 174, 178, 182, 187, 191, 196, 200, 205, 210, 215, 221, 226, 232, 237, 243, 249, 255, 261, 267, 274, 280, 287, 294, 301, 309, 316, 324, 332, 340, 348, 357, 365, 374, 383, 392, 402, 412, 422, 432, 442, 453, 464, 475, 487, 499, 511, 523, 536, 549, 562, 576, 590, 604, 619, 634, 649, 665, 681, 698, 715, 732, 750, 768, 787, 806, 825, 845, 866, 887, 909, 931, 953, 976],
  E192: [100, 101, 102, 104, 105, 106, 107, 109, 110, 111, 113, 114, 115, 117, 118, 120, 121, 123, 124, 126, 127, 129, 130, 132, 133, 135, 137, 138, 140, 142, 143, 145, 147, 149, 150, 152, 154, 156, 158, 160, 162, 164, 165, 167, 169, 172, 174, 176, 178, 180, 182, 184, 187, 189, 191, 193, 196, 198, 200, 203, 205, 208, 210, 213, 215, 218, 221, 223, 226, 229, 232, 234, 237, 240, 243, 246, 249, 252, 255, 258, 261, 264, 267, 271, 274, 277, 280, 284, 287, 291, 294, 298, 301, 305, 309, 312, 316, 320, 324, 328, 332, 336, 340, 344, 348, 352, 357, 361, 365, 370, 374, 379, 383, 388, 392, 397, 402, 407, 412, 417, 422, 427, 432, 437, 442, 448, 453, 459, 464, 470, 475, 481, 487, 493, 499, 505, 511, 517, 523, 530, 536, 542, 549, 556, 562, 569, 576, 583, 590, 597, 604, 612, 619, 626, 634, 642, 649, 657, 665, 673, 681, 690, 698, 706, 715, 723, 732, 741, 750, 759, 768, 777, 787, 796, 806, 816, 825, 835, 845, 856, 866, 876, 887, 898, 909, 920, 931, 942, 953, 965, 976, 988]
});

// node_modules/mingo/dist/esm/operators/expression/date/_internal.js
var DAYS_PER_WEEK = 7;
var MILLIS_PER_DAY = 1e3 * 60 * 60 * 24;
var TIMEUNIT_IN_MILLIS = {
  week: MILLIS_PER_DAY * DAYS_PER_WEEK,
  day: MILLIS_PER_DAY,
  hour: 1e3 * 60 * 60,
  minute: 1e3 * 60,
  second: 1e3,
  millisecond: 1
};
var DAYS_OF_WEEK = ["monday", "mon", "tuesday", "tue", "wednesday", "wed", "thursday", "thu", "friday", "fri", "saturday", "sat", "sunday", "sun"];
var DAYS_OF_WEEK_SET = new Set(DAYS_OF_WEEK);
var ISO_WEEKDAY_MAP = Object.freeze({
  mon: 1,
  tue: 2,
  wed: 3,
  thu: 4,
  fri: 5,
  sat: 6,
  sun: 7
});
var DATE_SYM_TABLE = Object.freeze({
  "%Y": {
    name: "year",
    padding: 4,
    re: /([0-9]{4})/
  },
  "%G": {
    name: "year",
    padding: 4,
    re: /([0-9]{4})/
  },
  "%m": {
    name: "month",
    padding: 2,
    re: /(0[1-9]|1[012])/
  },
  "%d": {
    name: "day",
    padding: 2,
    re: /(0[1-9]|[12][0-9]|3[01])/
  },
  "%H": {
    name: "hour",
    padding: 2,
    re: /([01][0-9]|2[0-3])/
  },
  "%M": {
    name: "minute",
    padding: 2,
    re: /([0-5][0-9])/
  },
  "%S": {
    name: "second",
    padding: 2,
    re: /([0-5][0-9]|60)/
  },
  "%L": {
    name: "millisecond",
    padding: 3,
    re: /([0-9]{3})/
  },
  "%u": {
    name: "weekday",
    padding: 1,
    re: /([1-7])/
  },
  "%U": {
    name: "week",
    padding: 2,
    re: /([1-4][0-9]?|5[0-3]?)/
  },
  "%V": {
    name: "isoWeek",
    padding: 2,
    re: /([1-4][0-9]?|5[0-3]?)/
  },
  "%z": {
    name: "timezone",
    padding: 2,
    re: /(([+-][01][0-9]|2[0-3]):?([0-5][0-9])?)/
  },
  "%Z": {
    name: "minuteOffset",
    padding: 3,
    re: /([+-][0-9]{3})/
  }
  // "%%": "%",
});

// node_modules/mingo/dist/esm/operators/pipeline/densify.js
var EMPTY_OBJECT = Object.freeze({});

// node_modules/mingo/dist/esm/operators/window/_internal.js
var MILLIS_PER_UNIT = {
  week: MILLIS_PER_DAY * 7,
  day: MILLIS_PER_DAY,
  hour: MILLIS_PER_DAY / 24,
  minute: 6e4,
  second: 1e3,
  millisecond: 1
};

// node_modules/mingo/dist/esm/operators/_predicates.js
function createQueryOperator(predicate) {
  const f = (selector, value, options) => {
    const opts = {
      unwrapArray: true
    };
    const depth = Math.max(1, selector.split(".").length - 1);
    return (obj) => {
      const lhs = resolve(obj, selector, opts);
      return predicate(lhs, value, __spreadProps(__spreadValues({}, options), {
        depth
      }));
    };
  };
  return f;
}
function createExpressionOperator(predicate) {
  return (obj, expr, options) => {
    const args = computeValue(obj, expr, null, options);
    return predicate(...args);
  };
}
function $eq(a, b, options) {
  if (isEqual(a, b)) return true;
  if (isNil(a) && isNil(b)) return true;
  if (isArray(a)) {
    return a.some((v) => isEqual(v, b)) || flatten(a, options?.depth).some((v) => isEqual(v, b));
  }
  return false;
}
function $ne(a, b, options) {
  return !$eq(a, b, options);
}
function $in(a, b, options) {
  if (isNil(a)) return b.some((v) => v === null);
  return intersection([ensureArray(a), b], options?.hashFunction).length > 0;
}
function $nin(a, b, options) {
  return !$in(a, b, options);
}
function $lt(a, b, _options) {
  return compare2(a, b, (x, y) => compare(x, y) < 0);
}
function $lte(a, b, _options) {
  return compare2(a, b, (x, y) => compare(x, y) <= 0);
}
function $gt(a, b, _options) {
  return compare2(a, b, (x, y) => compare(x, y) > 0);
}
function $gte(a, b, _options) {
  return compare2(a, b, (x, y) => compare(x, y) >= 0);
}
function $mod(a, b, _options) {
  return ensureArray(a).some((x) => b.length === 2 && x % b[0] === b[1]);
}
function $regex(a, b, options) {
  const lhs = ensureArray(a);
  const match = (x) => isString(x) && truthy(b.exec(x), options?.useStrictMode);
  return lhs.some(match) || flatten(lhs, 1).some(match);
}
function $all(values, queries, options) {
  if (!isArray(values) || !isArray(queries) || !values.length || !queries.length) {
    return false;
  }
  let matched = true;
  for (const query of queries) {
    if (!matched) break;
    if (isObject(query) && Object.keys(query).includes("$elemMatch")) {
      matched = $elemMatch(values, query["$elemMatch"], options);
    } else if (isRegExp(query)) {
      matched = values.some((s) => typeof s === "string" && query.test(s));
    } else {
      matched = values.some((v) => isEqual(query, v));
    }
  }
  return matched;
}
function $size(a, b, _options) {
  return Array.isArray(a) && a.length === b;
}
function isNonBooleanOperator(name) {
  return isOperator(name) && ["$and", "$or", "$nor"].indexOf(name) === -1;
}
function $elemMatch(a, b, options) {
  if (isArray(a) && !isEmpty(a)) {
    let format = (x) => x;
    let criteria = b;
    if (Object.keys(b).every(isNonBooleanOperator)) {
      criteria = {
        temp: b
      };
      format = (x) => ({
        temp: x
      });
    }
    const query = new Query(criteria, options);
    for (let i = 0, len = a.length; i < len; i++) {
      if (query.test(format(a[i]))) {
        return true;
      }
    }
  }
  return false;
}
var isNull = (a) => a === null;
var compareFuncs = {
  array: isArray,
  boolean: isBoolean,
  bool: isBoolean,
  date: isDate,
  number: isNumber,
  int: isNumber,
  long: isNumber,
  double: isNumber,
  decimal: isNumber,
  null: isNull,
  object: isObject,
  regexp: isRegExp,
  regex: isRegExp,
  string: isString,
  // added for completeness
  undefined: isNil,
  // deprecated
  function: (_) => {
    throw new MingoError("unsupported type key `function`.");
  },
  // Mongo identifiers
  1: isNumber,
  //double
  2: isString,
  3: isObject,
  4: isArray,
  6: isNil,
  // deprecated
  8: isBoolean,
  9: isDate,
  10: isNull,
  11: isRegExp,
  16: isNumber,
  //int
  18: isNumber,
  //long
  19: isNumber
  //decimal
};
function compareType(a, b, _) {
  const f = compareFuncs[b];
  return f ? f(a) : false;
}
function $type(a, b, options) {
  return isArray(b) ? b.findIndex((t) => compareType(a, t, options)) >= 0 : compareType(a, b, options);
}
function compare2(a, b, f) {
  return ensureArray(a).some((x) => typeOf(x) === typeOf(b) && f(x, b));
}

// node_modules/mingo/dist/esm/operators/expression/array/nin.js
var $nin2 = createExpressionOperator($nin);

// node_modules/mingo/dist/esm/operators/expression/bitwise/_internal.js
var bitwise = (op, compute) => (obj, expr, options) => {
  assert(isArray(expr), `${op}: expression must be an array.`);
  const nums = computeValue(obj, expr, null, options);
  if (nums.some(isNil)) return null;
  assert(nums.every(isNumber), `${op}: expression must evalue to array of numbers.`);
  return compute(nums);
};

// node_modules/mingo/dist/esm/operators/expression/bitwise/bitAnd.js
var $bitAnd = bitwise("$bitAnd", (nums) => nums.reduce((a, b) => a & b, -1));

// node_modules/mingo/dist/esm/operators/expression/bitwise/bitOr.js
var $bitOr = bitwise("$bitOr", (nums) => nums.reduce((a, b) => a | b, 0));

// node_modules/mingo/dist/esm/operators/expression/bitwise/bitXor.js
var $bitXor = bitwise("$bitXor", (nums) => nums.reduce((a, b) => a ^ b, 0));

// node_modules/mingo/dist/esm/operators/expression/comparison/eq.js
var $eq2 = createExpressionOperator($eq);

// node_modules/mingo/dist/esm/operators/expression/comparison/gt.js
var $gt2 = createExpressionOperator($gt);

// node_modules/mingo/dist/esm/operators/expression/comparison/gte.js
var $gte2 = createExpressionOperator($gte);

// node_modules/mingo/dist/esm/operators/expression/comparison/lt.js
var $lt2 = createExpressionOperator($lt);

// node_modules/mingo/dist/esm/operators/expression/comparison/lte.js
var $lte2 = createExpressionOperator($lte);

// node_modules/mingo/dist/esm/operators/expression/comparison/ne.js
var $ne2 = createExpressionOperator($ne);

// node_modules/mingo/dist/esm/operators/expression/date/dateFromString.js
var buildMap = (letters, sign) => {
  const h = {};
  letters.split("").forEach((v, i) => h[v] = sign * (i + 1));
  return h;
};
var TZ_LETTER_OFFSETS = __spreadProps(__spreadValues(__spreadValues({}, buildMap("ABCDEFGHIKLM", 1)), buildMap("NOPQRSTUVWXY", -1)), {
  Z: 0
});

// node_modules/mingo/dist/esm/operators/expression/trignometry/_internal.js
var FIXED_POINTS = {
  undefined: null,
  null: null,
  NaN: NaN,
  Infinity: new Error(),
  "-Infinity": new Error()
};
function createTrignometryOperator(f, fixedPoints = FIXED_POINTS) {
  const fp = Object.assign({}, FIXED_POINTS, fixedPoints);
  const keySet = new Set(Object.keys(fp));
  return (obj, expr, options) => {
    const n = computeValue(obj, expr, null, options);
    if (keySet.has(`${n}`)) {
      const res = fp[`${n}`];
      if (res instanceof Error) {
        throw new MingoError(`cannot apply $${f.name} to -inf, value must in (-inf,inf)`);
      }
      return res;
    }
    return f(n);
  };
}

// node_modules/mingo/dist/esm/operators/expression/trignometry/acos.js
var $acos = createTrignometryOperator(Math.acos, {
  Infinity: Infinity,
  0: new Error()
});

// node_modules/mingo/dist/esm/operators/expression/trignometry/acosh.js
var $acosh = createTrignometryOperator(Math.acosh, {
  Infinity: Infinity,
  0: new Error()
});

// node_modules/mingo/dist/esm/operators/expression/trignometry/asin.js
var $asin = createTrignometryOperator(Math.asin);

// node_modules/mingo/dist/esm/operators/expression/trignometry/asinh.js
var $asinh = createTrignometryOperator(Math.asinh, {
  Infinity: Infinity,
  "-Infinity": -Infinity
});

// node_modules/mingo/dist/esm/operators/expression/trignometry/atan.js
var $atan = createTrignometryOperator(Math.atan);

// node_modules/mingo/dist/esm/operators/expression/trignometry/atanh.js
var $atanh = createTrignometryOperator(Math.atanh, {
  1: Infinity,
  "-1": -Infinity
});

// node_modules/mingo/dist/esm/operators/expression/trignometry/cos.js
var $cos = createTrignometryOperator(Math.cos);

// node_modules/mingo/dist/esm/operators/expression/trignometry/cosh.js
var $cosh = createTrignometryOperator(Math.cosh, {
  "-Infinity": Infinity,
  Infinity: Infinity
});

// node_modules/mingo/dist/esm/operators/expression/trignometry/degreesToRadians.js
var RADIANS_FACTOR = Math.PI / 180;
var $degreesToRadians = createTrignometryOperator((n) => n * RADIANS_FACTOR, {
  Infinity: Infinity,
  "-Infinity": Infinity
});

// node_modules/mingo/dist/esm/operators/expression/trignometry/radiansToDegrees.js
var DEGREES_FACTOR = 180 / Math.PI;
var $radiansToDegrees = createTrignometryOperator((n) => n * DEGREES_FACTOR, {
  Infinity: Infinity,
  "-Infinity": -Infinity
});

// node_modules/mingo/dist/esm/operators/expression/trignometry/sin.js
var $sin = createTrignometryOperator(Math.sin);

// node_modules/mingo/dist/esm/operators/expression/trignometry/sinh.js
var $sinh = createTrignometryOperator(Math.sinh, {
  "-Infinity": -Infinity,
  Infinity: Infinity
});

// node_modules/mingo/dist/esm/operators/expression/trignometry/tan.js
var $tan = createTrignometryOperator(Math.tan);

// node_modules/mingo/dist/esm/operators/expression/type/_internal.js
var MAX_LONG = Number.MAX_SAFE_INTEGER;
var MIN_LONG = Number.MIN_SAFE_INTEGER;

// node_modules/mingo/dist/esm/operators/query/logical/and.js
var $and = (_, rhs, options) => {
  assert(isArray(rhs), "Invalid expression: $and expects value to be an Array.");
  const queries = rhs.map((expr) => new Query(expr, options));
  return (obj) => queries.every((q) => q.test(obj));
};

// node_modules/mingo/dist/esm/operators/query/logical/or.js
var $or = (_, rhs, options) => {
  assert(isArray(rhs), "Invalid expression. $or expects value to be an Array");
  const queries = rhs.map((expr) => new Query(expr, options));
  return (obj) => queries.some((q) => q.test(obj));
};

// node_modules/mingo/dist/esm/operators/query/logical/nor.js
var $nor = (_, rhs, options) => {
  assert(isArray(rhs), "Invalid expression. $nor expects value to be an array.");
  const f = $or("$or", rhs, options);
  return (obj) => !f(obj);
};

// node_modules/mingo/dist/esm/operators/query/logical/not.js
var $not = (selector, rhs, options) => {
  const criteria = {};
  criteria[selector] = normalize(rhs);
  const query = new Query(criteria, options);
  return (obj) => !query.test(obj);
};

// node_modules/mingo/dist/esm/operators/query/comparison/eq.js
var $eq3 = createQueryOperator($eq);

// node_modules/mingo/dist/esm/operators/query/comparison/gt.js
var $gt3 = createQueryOperator($gt);

// node_modules/mingo/dist/esm/operators/query/comparison/gte.js
var $gte3 = createQueryOperator($gte);

// node_modules/mingo/dist/esm/operators/query/comparison/in.js
var $in2 = createQueryOperator($in);

// node_modules/mingo/dist/esm/operators/query/comparison/lt.js
var $lt3 = createQueryOperator($lt);

// node_modules/mingo/dist/esm/operators/query/comparison/lte.js
var $lte3 = createQueryOperator($lte);

// node_modules/mingo/dist/esm/operators/query/comparison/ne.js
var $ne3 = createQueryOperator($ne);

// node_modules/mingo/dist/esm/operators/query/comparison/nin.js
var $nin3 = createQueryOperator($nin);

// node_modules/mingo/dist/esm/operators/query/evaluation/mod.js
var $mod2 = createQueryOperator($mod);

// node_modules/mingo/dist/esm/operators/query/evaluation/regex.js
var $regex2 = createQueryOperator($regex);

// node_modules/mingo/dist/esm/operators/query/array/all.js
var $all2 = createQueryOperator($all);

// node_modules/mingo/dist/esm/operators/query/array/elemMatch.js
var $elemMatch2 = createQueryOperator($elemMatch);

// node_modules/mingo/dist/esm/operators/query/array/size.js
var $size2 = createQueryOperator($size);

// node_modules/mingo/dist/esm/operators/query/element/exists.js
var $exists = (selector, value, _options) => {
  const nested = selector.includes(".");
  const b = !!value;
  if (!nested || selector.match(/\.\d+$/)) {
    return (o) => resolve(o, selector) !== void 0 === b;
  }
  return (o) => {
    const path = resolveGraph(o, selector, {
      preserveIndex: true
    });
    const val = resolve(path, selector.substring(0, selector.lastIndexOf(".")));
    return isArray(val) ? val.some((v) => v !== void 0) === b : val !== void 0 === b;
  };
};

// node_modules/mingo/dist/esm/operators/query/element/type.js
var $type2 = createQueryOperator($type);

// node_modules/rxdb/dist/esm/rx-query-mingo.js
var mingoInitDone = false;
function getMingoQuery(selector) {
  if (!mingoInitDone) {
    useOperators("pipeline", {
      $sort,
      $project
    });
    useOperators("query", {
      $and,
      $eq: $eq3,
      $elemMatch: $elemMatch2,
      $exists,
      $gt: $gt3,
      $gte: $gte3,
      $in: $in2,
      $lt: $lt3,
      $lte: $lte3,
      $ne: $ne3,
      $nin: $nin3,
      $mod: $mod2,
      $nor,
      $not,
      $or,
      $regex: $regex2,
      $size: $size2,
      $type: $type2
    });
    mingoInitDone = true;
  }
  return new Query(selector);
}

// node_modules/rxdb/dist/esm/rx-query-helper.js
function normalizeMangoQuery(schema, mangoQuery) {
  var primaryKey = getPrimaryFieldOfPrimaryKey(schema.primaryKey);
  mangoQuery = flatClone(mangoQuery);
  var normalizedMangoQuery = clone(mangoQuery);
  if (typeof normalizedMangoQuery.skip !== "number") {
    normalizedMangoQuery.skip = 0;
  }
  if (!normalizedMangoQuery.selector) {
    normalizedMangoQuery.selector = {};
  } else {
    normalizedMangoQuery.selector = normalizedMangoQuery.selector;
    Object.entries(normalizedMangoQuery.selector).forEach(([field, matcher]) => {
      if (typeof matcher !== "object" || matcher === null) {
        normalizedMangoQuery.selector[field] = {
          $eq: matcher
        };
      }
    });
  }
  if (normalizedMangoQuery.index) {
    var indexAr = toArray(normalizedMangoQuery.index);
    if (!indexAr.includes(primaryKey)) {
      indexAr.push(primaryKey);
    }
    normalizedMangoQuery.index = indexAr;
  }
  if (!normalizedMangoQuery.sort) {
    if (normalizedMangoQuery.index) {
      normalizedMangoQuery.sort = normalizedMangoQuery.index.map((field) => {
        return {
          [field]: "asc"
        };
      });
    } else {
      if (schema.indexes) {
        var fieldsWithLogicalOperator = /* @__PURE__ */ new Set();
        Object.entries(normalizedMangoQuery.selector).forEach(([field, matcher]) => {
          var hasLogical = false;
          if (typeof matcher === "object" && matcher !== null) {
            hasLogical = !!Object.keys(matcher).find((operator) => LOGICAL_OPERATORS.has(operator));
          } else {
            hasLogical = true;
          }
          if (hasLogical) {
            fieldsWithLogicalOperator.add(field);
          }
        });
        var currentFieldsAmount = -1;
        var currentBestIndexForSort;
        schema.indexes.forEach((index) => {
          var useIndex2 = isMaybeReadonlyArray(index) ? index : [index];
          var firstWrongIndex = useIndex2.findIndex((indexField) => !fieldsWithLogicalOperator.has(indexField));
          if (firstWrongIndex > 0 && firstWrongIndex > currentFieldsAmount) {
            currentFieldsAmount = firstWrongIndex;
            currentBestIndexForSort = useIndex2;
          }
        });
        if (currentBestIndexForSort) {
          normalizedMangoQuery.sort = currentBestIndexForSort.map((field) => {
            return {
              [field]: "asc"
            };
          });
        }
      }
      if (!normalizedMangoQuery.sort) {
        if (schema.indexes && schema.indexes.length > 0) {
          var firstIndex = schema.indexes[0];
          var useIndex = isMaybeReadonlyArray(firstIndex) ? firstIndex : [firstIndex];
          normalizedMangoQuery.sort = useIndex.map((field) => ({
            [field]: "asc"
          }));
        } else {
          normalizedMangoQuery.sort = [{
            [primaryKey]: "asc"
          }];
        }
      }
    }
  } else {
    var isPrimaryInSort = normalizedMangoQuery.sort.find((p) => firstPropertyNameOfObject(p) === primaryKey);
    if (!isPrimaryInSort) {
      normalizedMangoQuery.sort = normalizedMangoQuery.sort.slice(0);
      normalizedMangoQuery.sort.push({
        [primaryKey]: "asc"
      });
    }
  }
  return normalizedMangoQuery;
}
function getSortComparator(schema, query) {
  if (!query.sort) {
    throw newRxError("SNH", {
      query
    });
  }
  var sortParts = [];
  query.sort.forEach((sortBlock) => {
    var key = Object.keys(sortBlock)[0];
    var direction = Object.values(sortBlock)[0];
    sortParts.push({
      key,
      direction,
      getValueFn: objectPathMonad(key)
    });
  });
  var fun = (a, b) => {
    for (var i = 0; i < sortParts.length; ++i) {
      var sortPart = sortParts[i];
      var valueA = sortPart.getValueFn(a);
      var valueB = sortPart.getValueFn(b);
      if (valueA !== valueB) {
        var ret = sortPart.direction === "asc" ? compare(valueA, valueB) : compare(valueB, valueA);
        return ret;
      }
    }
  };
  return fun;
}
function getQueryMatcher(_schema, query) {
  if (!query.sort) {
    throw newRxError("SNH", {
      query
    });
  }
  var mingoQuery = getMingoQuery(query.selector);
  var fun = (doc) => {
    return mingoQuery.test(doc);
  };
  return fun;
}
function runQueryUpdateFunction(rxQuery, fn) {
  return __async(this, null, function* () {
    var docs = yield rxQuery.exec();
    if (!docs) {
      return null;
    }
    if (Array.isArray(docs)) {
      return Promise.all(docs.map((doc) => fn(doc)));
    } else if (docs instanceof Map) {
      return Promise.all([...docs.values()].map((doc) => fn(doc)));
    } else {
      var result = yield fn(docs);
      return result;
    }
  });
}
function prepareQuery(schema, mutateableQuery) {
  if (!mutateableQuery.sort) {
    throw newRxError("SNH", {
      query: mutateableQuery
    });
  }
  var queryPlan = getQueryPlan(schema, mutateableQuery);
  return {
    query: mutateableQuery,
    queryPlan
  };
}

// node_modules/rxdb/dist/esm/rx-storage-helper.js
var INTERNAL_STORAGE_NAME = "_rxdb_internal";
var RX_DATABASE_LOCAL_DOCS_STORAGE_NAME = "rxdatabase_storage_local";
function getSingleDocument(storageInstance, documentId) {
  return __async(this, null, function* () {
    var results = yield storageInstance.findDocumentsById([documentId], false);
    var doc = results[0];
    if (doc) {
      return doc;
    } else {
      return void 0;
    }
  });
}
function writeSingle(instance, writeRow, context) {
  return __async(this, null, function* () {
    var writeResult = yield instance.bulkWrite([writeRow], context);
    if (writeResult.error.length > 0) {
      var error = writeResult.error[0];
      throw error;
    } else {
      var primaryPath = getPrimaryFieldOfPrimaryKey(instance.schema.primaryKey);
      var success = getWrittenDocumentsFromBulkWriteResponse(primaryPath, [writeRow], writeResult);
      var ret = success[0];
      return ret;
    }
  });
}
function observeSingle(storageInstance, documentId) {
  var firstFindPromise = getSingleDocument(storageInstance, documentId);
  var ret = storageInstance.changeStream().pipe(map((evBulk) => evBulk.events.find((ev) => ev.documentId === documentId)), filter((ev) => !!ev), map((ev) => Promise.resolve(ensureNotFalsy(ev).documentData)), startWith(firstFindPromise), switchMap((v) => v), filter((v) => !!v));
  return ret;
}
function stackCheckpoints(checkpoints) {
  return Object.assign({}, ...checkpoints.filter((x) => !!x));
}
function throwIfIsStorageWriteError(collection, documentId, writeData, error) {
  if (error) {
    if (error.status === 409) {
      throw newRxError("CONFLICT", {
        collection: collection.name,
        id: documentId,
        writeError: error,
        data: writeData
      });
    } else if (error.status === 422) {
      throw newRxError("VD2", {
        collection: collection.name,
        id: documentId,
        writeError: error,
        data: writeData
      });
    } else {
      throw error;
    }
  }
}
function categorizeBulkWriteRows(storageInstance, primaryPath, docsInDb, bulkWriteRows, context, onInsert, onUpdate) {
  var hasAttachments = !!storageInstance.schema.attachments;
  var bulkInsertDocs = [];
  var bulkUpdateDocs = [];
  var errors = [];
  var eventBulkId = randomToken(10);
  var eventBulk = {
    id: eventBulkId,
    events: [],
    checkpoint: null,
    context
  };
  var eventBulkEvents = eventBulk.events;
  var attachmentsAdd = [];
  var attachmentsRemove = [];
  var attachmentsUpdate = [];
  var hasDocsInDb = docsInDb.size > 0;
  var newestRow;
  var rowAmount = bulkWriteRows.length;
  var _loop = function() {
    var writeRow = bulkWriteRows[rowId];
    var document = writeRow.document;
    var previous = writeRow.previous;
    var docId = document[primaryPath];
    var documentDeleted = document._deleted;
    var previousDeleted = previous && previous._deleted;
    var documentInDb = void 0;
    if (hasDocsInDb) {
      documentInDb = docsInDb.get(docId);
    }
    var attachmentError;
    if (!documentInDb) {
      var insertedIsDeleted = documentDeleted ? true : false;
      if (hasAttachments) {
        Object.entries(document._attachments).forEach(([attachmentId, attachmentData]) => {
          if (!attachmentData.data) {
            attachmentError = {
              documentId: docId,
              isError: true,
              status: 510,
              writeRow,
              attachmentId
            };
            errors.push(attachmentError);
          } else {
            attachmentsAdd.push({
              documentId: docId,
              attachmentId,
              attachmentData,
              digest: attachmentData.digest
            });
          }
        });
      }
      if (!attachmentError) {
        if (hasAttachments) {
          bulkInsertDocs.push(stripAttachmentsDataFromRow(writeRow));
          if (onInsert) {
            onInsert(document);
          }
        } else {
          bulkInsertDocs.push(writeRow);
          if (onInsert) {
            onInsert(document);
          }
        }
        newestRow = writeRow;
      }
      if (!insertedIsDeleted) {
        var event = {
          documentId: docId,
          operation: "INSERT",
          documentData: hasAttachments ? stripAttachmentsDataFromDocument(document) : document,
          previousDocumentData: hasAttachments && previous ? stripAttachmentsDataFromDocument(previous) : previous
        };
        eventBulkEvents.push(event);
      }
    } else {
      var revInDb = documentInDb._rev;
      if (!previous || !!previous && revInDb !== previous._rev) {
        var err = {
          isError: true,
          status: 409,
          documentId: docId,
          writeRow,
          documentInDb
        };
        errors.push(err);
        return 1;
      }
      var updatedRow = hasAttachments ? stripAttachmentsDataFromRow(writeRow) : writeRow;
      if (hasAttachments) {
        if (documentDeleted) {
          if (previous) {
            Object.keys(previous._attachments).forEach((attachmentId) => {
              attachmentsRemove.push({
                documentId: docId,
                attachmentId,
                digest: ensureNotFalsy(previous)._attachments[attachmentId].digest
              });
            });
          }
        } else {
          Object.entries(document._attachments).find(([attachmentId, attachmentData]) => {
            var previousAttachmentData = previous ? previous._attachments[attachmentId] : void 0;
            if (!previousAttachmentData && !attachmentData.data) {
              attachmentError = {
                documentId: docId,
                documentInDb,
                isError: true,
                status: 510,
                writeRow,
                attachmentId
              };
            }
            return true;
          });
          if (!attachmentError) {
            Object.entries(document._attachments).forEach(([attachmentId, attachmentData]) => {
              var previousAttachmentData = previous ? previous._attachments[attachmentId] : void 0;
              if (!previousAttachmentData) {
                attachmentsAdd.push({
                  documentId: docId,
                  attachmentId,
                  attachmentData,
                  digest: attachmentData.digest
                });
              } else {
                var newDigest = updatedRow.document._attachments[attachmentId].digest;
                if (attachmentData.data && /**
                 * Performance shortcut,
                 * do not update the attachment data if it did not change.
                 */
                previousAttachmentData.digest !== newDigest) {
                  attachmentsUpdate.push({
                    documentId: docId,
                    attachmentId,
                    attachmentData,
                    digest: attachmentData.digest
                  });
                }
              }
            });
          }
        }
      }
      if (attachmentError) {
        errors.push(attachmentError);
      } else {
        if (hasAttachments) {
          bulkUpdateDocs.push(stripAttachmentsDataFromRow(updatedRow));
          if (onUpdate) {
            onUpdate(document);
          }
        } else {
          bulkUpdateDocs.push(updatedRow);
          if (onUpdate) {
            onUpdate(document);
          }
        }
        newestRow = updatedRow;
      }
      var eventDocumentData = null;
      var previousEventDocumentData = null;
      var operation = null;
      if (previousDeleted && !documentDeleted) {
        operation = "INSERT";
        eventDocumentData = hasAttachments ? stripAttachmentsDataFromDocument(document) : document;
      } else if (previous && !previousDeleted && !documentDeleted) {
        operation = "UPDATE";
        eventDocumentData = hasAttachments ? stripAttachmentsDataFromDocument(document) : document;
        previousEventDocumentData = previous;
      } else if (documentDeleted) {
        operation = "DELETE";
        eventDocumentData = ensureNotFalsy(document);
        previousEventDocumentData = previous;
      } else {
        throw newRxError("SNH", {
          args: {
            writeRow
          }
        });
      }
      var _event = {
        documentId: docId,
        documentData: eventDocumentData,
        previousDocumentData: previousEventDocumentData,
        operation
      };
      eventBulkEvents.push(_event);
    }
  };
  for (var rowId = 0; rowId < rowAmount; rowId++) {
    if (_loop()) continue;
  }
  return {
    bulkInsertDocs,
    bulkUpdateDocs,
    newestRow,
    errors,
    eventBulk,
    attachmentsAdd,
    attachmentsRemove,
    attachmentsUpdate
  };
}
function stripAttachmentsDataFromRow(writeRow) {
  return {
    previous: writeRow.previous,
    document: stripAttachmentsDataFromDocument(writeRow.document)
  };
}
function getAttachmentSize(attachmentBase64String) {
  return atob(attachmentBase64String).length;
}
function attachmentWriteDataToNormalData(writeData) {
  var data = writeData.data;
  if (!data) {
    return writeData;
  }
  var ret = {
    length: getAttachmentSize(data),
    digest: writeData.digest,
    type: writeData.type
  };
  return ret;
}
function stripAttachmentsDataFromDocument(doc) {
  if (!doc._attachments || Object.keys(doc._attachments).length === 0) {
    return doc;
  }
  var useDoc = flatClone(doc);
  useDoc._attachments = {};
  Object.entries(doc._attachments).forEach(([attachmentId, attachmentData]) => {
    useDoc._attachments[attachmentId] = attachmentWriteDataToNormalData(attachmentData);
  });
  return useDoc;
}
function flatCloneDocWithMeta(doc) {
  return Object.assign({}, doc, {
    _meta: flatClone(doc._meta)
  });
}
function getWrappedStorageInstance(database, storageInstance, rxJsonSchema) {
  overwritable.deepFreezeWhenDevMode(rxJsonSchema);
  var primaryPath = getPrimaryFieldOfPrimaryKey(storageInstance.schema.primaryKey);
  var ret = {
    originalStorageInstance: storageInstance,
    schema: storageInstance.schema,
    internals: storageInstance.internals,
    collectionName: storageInstance.collectionName,
    databaseName: storageInstance.databaseName,
    options: storageInstance.options,
    bulkWrite(rows, context) {
      return __async(this, null, function* () {
        var databaseToken = database.token;
        var toStorageWriteRows = new Array(rows.length);
        var time = now();
        for (var index = 0; index < rows.length; index++) {
          var writeRow = rows[index];
          var document = flatCloneDocWithMeta(writeRow.document);
          document._meta.lwt = time;
          var previous = writeRow.previous;
          document._rev = createRevision(databaseToken, previous);
          toStorageWriteRows[index] = {
            document,
            previous
          };
        }
        runPluginHooks("preStorageWrite", {
          storageInstance: this.originalStorageInstance,
          rows: toStorageWriteRows
        });
        var writeResult = yield database.lockedRun(() => storageInstance.bulkWrite(toStorageWriteRows, context));
        var useWriteResult = {
          error: []
        };
        BULK_WRITE_ROWS_BY_RESPONSE.set(useWriteResult, toStorageWriteRows);
        var reInsertErrors = writeResult.error.length === 0 ? [] : writeResult.error.filter((error) => {
          if (error.status === 409 && !error.writeRow.previous && !error.writeRow.document._deleted && ensureNotFalsy(error.documentInDb)._deleted) {
            return true;
          }
          useWriteResult.error.push(error);
          return false;
        });
        if (reInsertErrors.length > 0) {
          var reInsertIds = /* @__PURE__ */ new Set();
          var reInserts = reInsertErrors.map((error) => {
            reInsertIds.add(error.documentId);
            return {
              previous: error.documentInDb,
              document: Object.assign({}, error.writeRow.document, {
                _rev: createRevision(database.token, error.documentInDb)
              })
            };
          });
          var subResult = yield database.lockedRun(() => storageInstance.bulkWrite(reInserts, context));
          appendToArray(useWriteResult.error, subResult.error);
          var successArray = getWrittenDocumentsFromBulkWriteResponse(primaryPath, toStorageWriteRows, useWriteResult, reInsertIds);
          var subSuccess = getWrittenDocumentsFromBulkWriteResponse(primaryPath, reInserts, subResult);
          appendToArray(successArray, subSuccess);
          return useWriteResult;
        }
        return useWriteResult;
      });
    },
    query(preparedQuery) {
      return database.lockedRun(() => storageInstance.query(preparedQuery));
    },
    count(preparedQuery) {
      return database.lockedRun(() => storageInstance.count(preparedQuery));
    },
    findDocumentsById(ids, deleted) {
      return database.lockedRun(() => storageInstance.findDocumentsById(ids, deleted));
    },
    getAttachmentData(documentId, attachmentId, digest) {
      return database.lockedRun(() => storageInstance.getAttachmentData(documentId, attachmentId, digest));
    },
    getChangedDocumentsSince: !storageInstance.getChangedDocumentsSince ? void 0 : (limit, checkpoint) => {
      return database.lockedRun(() => storageInstance.getChangedDocumentsSince(ensureNotFalsy(limit), checkpoint));
    },
    cleanup(minDeletedTime) {
      return database.lockedRun(() => storageInstance.cleanup(minDeletedTime));
    },
    remove() {
      database.storageInstances.delete(ret);
      return database.lockedRun(() => storageInstance.remove());
    },
    close() {
      database.storageInstances.delete(ret);
      return database.lockedRun(() => storageInstance.close());
    },
    changeStream() {
      return storageInstance.changeStream();
    }
  };
  database.storageInstances.add(ret);
  return ret;
}
function ensureRxStorageInstanceParamsAreCorrect(params) {
  if (params.schema.keyCompression) {
    throw newRxError("UT5", {
      args: {
        params
      }
    });
  }
  if (hasEncryption(params.schema)) {
    throw newRxError("UT6", {
      args: {
        params
      }
    });
  }
  if (params.schema.attachments && params.schema.attachments.compression) {
    throw newRxError("UT7", {
      args: {
        params
      }
    });
  }
}
function hasEncryption(jsonSchema) {
  if (!!jsonSchema.encrypted && jsonSchema.encrypted.length > 0 || jsonSchema.attachments && jsonSchema.attachments.encrypted) {
    return true;
  } else {
    return false;
  }
}
function getChangedDocumentsSinceQuery(storageInstance, limit, checkpoint) {
  var primaryPath = getPrimaryFieldOfPrimaryKey(storageInstance.schema.primaryKey);
  var sinceLwt = checkpoint ? checkpoint.lwt : RX_META_LWT_MINIMUM;
  var sinceId = checkpoint ? checkpoint.id : "";
  return normalizeMangoQuery(storageInstance.schema, {
    selector: {
      $or: [{
        "_meta.lwt": {
          $gt: sinceLwt
        }
      }, {
        "_meta.lwt": {
          $eq: sinceLwt
        },
        [primaryPath]: {
          $gt: checkpoint ? sinceId : ""
        }
      }],
      // add this hint for better index usage
      "_meta.lwt": {
        $gte: sinceLwt
      }
    },
    sort: [{
      "_meta.lwt": "asc"
    }, {
      [primaryPath]: "asc"
    }],
    skip: 0,
    limit
    /**
     * DO NOT SET A SPECIFIC INDEX HERE!
     * The query might be modified by some plugin
     * before sending it to the storage.
     * We can be sure that in the end the query planner
     * will find the best index.
     */
    // index: ['_meta.lwt', primaryPath]
  });
}
function getChangedDocumentsSince(storageInstance, limit, checkpoint) {
  return __async(this, null, function* () {
    if (storageInstance.getChangedDocumentsSince) {
      return storageInstance.getChangedDocumentsSince(limit, checkpoint);
    }
    var primaryPath = getPrimaryFieldOfPrimaryKey(storageInstance.schema.primaryKey);
    var query = prepareQuery(storageInstance.schema, getChangedDocumentsSinceQuery(storageInstance, limit, checkpoint));
    var result = yield storageInstance.query(query);
    var documents = result.documents;
    var lastDoc = lastOfArray(documents);
    return {
      documents,
      checkpoint: lastDoc ? {
        id: lastDoc[primaryPath],
        lwt: lastDoc._meta.lwt
      } : checkpoint ? checkpoint : {
        id: "",
        lwt: 0
      }
    };
  });
}
var BULK_WRITE_ROWS_BY_RESPONSE = /* @__PURE__ */ new WeakMap();
var BULK_WRITE_SUCCESS_MAP = /* @__PURE__ */ new WeakMap();
function getWrittenDocumentsFromBulkWriteResponse(primaryPath, writeRows, response, reInsertIds) {
  return getFromMapOrCreate(BULK_WRITE_SUCCESS_MAP, response, () => {
    var ret = [];
    var realWriteRows = BULK_WRITE_ROWS_BY_RESPONSE.get(response);
    if (!realWriteRows) {
      realWriteRows = writeRows;
    }
    if (response.error.length > 0 || reInsertIds) {
      var errorIds = reInsertIds ? reInsertIds : /* @__PURE__ */ new Set();
      for (var index = 0; index < response.error.length; index++) {
        var error = response.error[index];
        errorIds.add(error.documentId);
      }
      for (var _index = 0; _index < realWriteRows.length; _index++) {
        var doc = realWriteRows[_index].document;
        if (!errorIds.has(doc[primaryPath])) {
          ret.push(stripAttachmentsDataFromDocument(doc));
        }
      }
    } else {
      ret.length = writeRows.length - response.error.length;
      for (var _index2 = 0; _index2 < realWriteRows.length; _index2++) {
        var _doc = realWriteRows[_index2].document;
        ret[_index2] = stripAttachmentsDataFromDocument(_doc);
      }
    }
    return ret;
  });
}
function randomDelayStorage(input) {
  var randomDelayStorageWriteQueue = PROMISE_RESOLVE_TRUE;
  var retStorage = {
    name: "random-delay-" + input.storage.name,
    rxdbVersion: RXDB_VERSION,
    createStorageInstance(params) {
      return __async(this, null, function* () {
        yield promiseWait(input.delayTimeBefore());
        var storageInstance = yield input.storage.createStorageInstance(params);
        yield promiseWait(input.delayTimeAfter());
        return {
          databaseName: storageInstance.databaseName,
          internals: storageInstance.internals,
          options: storageInstance.options,
          schema: storageInstance.schema,
          collectionName: storageInstance.collectionName,
          bulkWrite(a, b) {
            randomDelayStorageWriteQueue = randomDelayStorageWriteQueue.then(() => __async(null, null, function* () {
              yield promiseWait(input.delayTimeBefore());
              var response = yield storageInstance.bulkWrite(a, b);
              yield promiseWait(input.delayTimeAfter());
              return response;
            }));
            var ret = randomDelayStorageWriteQueue;
            return ret;
          },
          findDocumentsById(a, b) {
            return __async(this, null, function* () {
              yield promiseWait(input.delayTimeBefore());
              var ret = yield storageInstance.findDocumentsById(a, b);
              yield promiseWait(input.delayTimeAfter());
              return ret;
            });
          },
          query(a) {
            return __async(this, null, function* () {
              yield promiseWait(input.delayTimeBefore());
              var ret = yield storageInstance.query(a);
              return ret;
            });
          },
          count(a) {
            return __async(this, null, function* () {
              yield promiseWait(input.delayTimeBefore());
              var ret = yield storageInstance.count(a);
              yield promiseWait(input.delayTimeAfter());
              return ret;
            });
          },
          getAttachmentData(a, b, c) {
            return __async(this, null, function* () {
              yield promiseWait(input.delayTimeBefore());
              var ret = yield storageInstance.getAttachmentData(a, b, c);
              yield promiseWait(input.delayTimeAfter());
              return ret;
            });
          },
          getChangedDocumentsSince: !storageInstance.getChangedDocumentsSince ? void 0 : (a, b) => __async(null, null, function* () {
            yield promiseWait(input.delayTimeBefore());
            var ret = yield ensureNotFalsy(storageInstance.getChangedDocumentsSince)(a, b);
            yield promiseWait(input.delayTimeAfter());
            return ret;
          }),
          changeStream() {
            return storageInstance.changeStream();
          },
          cleanup(a) {
            return __async(this, null, function* () {
              yield promiseWait(input.delayTimeBefore());
              var ret = yield storageInstance.cleanup(a);
              yield promiseWait(input.delayTimeAfter());
              return ret;
            });
          },
          close() {
            return __async(this, null, function* () {
              yield promiseWait(input.delayTimeBefore());
              var ret = yield storageInstance.close();
              yield promiseWait(input.delayTimeAfter());
              return ret;
            });
          },
          remove() {
            return __async(this, null, function* () {
              yield promiseWait(input.delayTimeBefore());
              var ret = yield storageInstance.remove();
              yield promiseWait(input.delayTimeAfter());
              return ret;
            });
          }
        };
      });
    }
  };
  return retStorage;
}

// node_modules/oblivious-set/dist/esm/src/index.js
var ObliviousSet = class {
  ttl;
  map = /* @__PURE__ */ new Map();
  /**
   * Creating calls to setTimeout() is expensive,
   * so we only do that if there is not timeout already open.
   */
  _to = false;
  constructor(ttl) {
    this.ttl = ttl;
  }
  has(value) {
    return this.map.has(value);
  }
  add(value) {
    this.map.set(value, now2());
    if (!this._to) {
      this._to = true;
      setTimeout(() => {
        this._to = false;
        removeTooOldValues(this);
      }, 0);
    }
  }
  clear() {
    this.map.clear();
  }
};
function removeTooOldValues(obliviousSet) {
  const olderThen = now2() - obliviousSet.ttl;
  const iterator = obliviousSet.map[Symbol.iterator]();
  while (true) {
    const next = iterator.next().value;
    if (!next) {
      return;
    }
    const value = next[0];
    const time = next[1];
    if (time < olderThen) {
      obliviousSet.map.delete(value);
    } else {
      return;
    }
  }
}
function now2() {
  return Date.now();
}

export {
  HOOKS,
  runPluginHooks,
  runAsyncPluginHooks,
  _clearHook,
  INDEX_MAX,
  INDEX_MIN,
  getQueryPlan,
  LOGICAL_OPERATORS,
  LOWER_BOUND_LOGICAL_OPERATORS,
  UPPER_BOUND_LOGICAL_OPERATORS,
  isSelectorSatisfiedByIndex,
  getMatcherQueryOpts,
  rateQueryPlan,
  normalizeMangoQuery,
  getSortComparator,
  getQueryMatcher,
  runQueryUpdateFunction,
  prepareQuery,
  INTERNAL_STORAGE_NAME,
  RX_DATABASE_LOCAL_DOCS_STORAGE_NAME,
  getSingleDocument,
  writeSingle,
  observeSingle,
  stackCheckpoints,
  throwIfIsStorageWriteError,
  categorizeBulkWriteRows,
  stripAttachmentsDataFromRow,
  getAttachmentSize,
  attachmentWriteDataToNormalData,
  stripAttachmentsDataFromDocument,
  flatCloneDocWithMeta,
  getWrappedStorageInstance,
  ensureRxStorageInstanceParamsAreCorrect,
  hasEncryption,
  getChangedDocumentsSinceQuery,
  getChangedDocumentsSince,
  getWrittenDocumentsFromBulkWriteResponse,
  randomDelayStorage,
  ObliviousSet
};
//# sourceMappingURL=chunk-FKGUJVD6.js.map
