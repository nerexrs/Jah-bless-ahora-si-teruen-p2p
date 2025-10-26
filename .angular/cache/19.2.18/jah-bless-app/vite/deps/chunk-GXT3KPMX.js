import {
  __async,
  __spreadValues,
  __yieldStar
} from "./chunk-7RSYZEEK.js";

// node_modules/rxdb/dist/esm/plugins/utils/utils-array.js
function lastOfArray(ar) {
  return ar[ar.length - 1];
}
function shuffleArray(arr) {
  return arr.slice(0).sort(() => Math.random() - 0.5);
}
function randomOfArray(arr) {
  var randomElement = arr[Math.floor(Math.random() * arr.length)];
  return randomElement;
}
function toArray(input) {
  return Array.isArray(input) ? input.slice(0) : [input];
}
function batchArray(array, batchSize) {
  array = array.slice(0);
  var ret = [];
  while (array.length) {
    var batch = array.splice(0, batchSize);
    ret.push(batch);
  }
  return ret;
}
function removeOneFromArrayIfMatches(ar, condition) {
  ar = ar.slice();
  var i = ar.length;
  var done = false;
  while (i-- && !done) {
    if (condition(ar[i])) {
      done = true;
      ar.splice(i, 1);
    }
  }
  return ar;
}
function isMaybeReadonlyArray(x) {
  return Array.isArray(x);
}
function isOneItemOfArrayInOtherArray(ar1, ar2) {
  for (var i = 0; i < ar1.length; i++) {
    var el = ar1[i];
    var has = ar2.includes(el);
    if (has) {
      return true;
    }
  }
  return false;
}
function arrayFilterNotEmpty(value) {
  if (value === null || value === void 0) {
    return false;
  }
  return true;
}
function countUntilNotMatching(ar, matchingFn) {
  var count = 0;
  var idx = -1;
  for (var item of ar) {
    idx = idx + 1;
    var matching = matchingFn(item, idx);
    if (matching) {
      count = count + 1;
    } else {
      break;
    }
  }
  return count;
}
function asyncFilter(array, predicate) {
  return __async(this, null, function* () {
    var filters = yield Promise.all(array.map(predicate));
    return array.filter((...[, index]) => filters[index]);
  });
}
function sumNumberArray(array) {
  var count = 0;
  for (var i = array.length; i--; ) {
    count += array[i];
  }
  return count;
}
function maxOfNumbers(arr) {
  return Math.max(...arr);
}
function appendToArray(ar, add) {
  var addSize = add.length;
  if (addSize === 0) {
    return;
  }
  var baseSize = ar.length;
  ar.length = baseSize + add.length;
  for (var i = 0; i < addSize; ++i) {
    ar[baseSize + i] = add[i];
  }
}
function uniqueArray(arrArg) {
  return arrArg.filter(function(elem, pos, arr) {
    return arr.indexOf(elem) === pos;
  });
}
function sortByObjectNumberProperty(property) {
  return (a, b) => {
    return b[property] - a[property];
  };
}

// node_modules/js-base64/base64.mjs
var _hasBuffer = typeof Buffer === "function";
var _TD = typeof TextDecoder === "function" ? new TextDecoder() : void 0;
var _TE = typeof TextEncoder === "function" ? new TextEncoder() : void 0;
var b64ch = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
var b64chs = Array.prototype.slice.call(b64ch);
var b64tab = ((a) => {
  let tab = {};
  a.forEach((c, i) => tab[c] = i);
  return tab;
})(b64chs);
var b64re = /^(?:[A-Za-z\d+\/]{4})*?(?:[A-Za-z\d+\/]{2}(?:==)?|[A-Za-z\d+\/]{3}=?)?$/;
var _fromCC = String.fromCharCode.bind(String);
var _U8Afrom = typeof Uint8Array.from === "function" ? Uint8Array.from.bind(Uint8Array) : (it) => new Uint8Array(Array.prototype.slice.call(it, 0));
var _mkUriSafe = (src) => src.replace(/=/g, "").replace(/[+\/]/g, (m0) => m0 == "+" ? "-" : "_");
var _tidyB64 = (s) => s.replace(/[^A-Za-z0-9\+\/]/g, "");
var btoaPolyfill = (bin) => {
  let u32, c0, c1, c2, asc = "";
  const pad = bin.length % 3;
  for (let i = 0; i < bin.length; ) {
    if ((c0 = bin.charCodeAt(i++)) > 255 || (c1 = bin.charCodeAt(i++)) > 255 || (c2 = bin.charCodeAt(i++)) > 255) throw new TypeError("invalid character found");
    u32 = c0 << 16 | c1 << 8 | c2;
    asc += b64chs[u32 >> 18 & 63] + b64chs[u32 >> 12 & 63] + b64chs[u32 >> 6 & 63] + b64chs[u32 & 63];
  }
  return pad ? asc.slice(0, pad - 3) + "===".substring(pad) : asc;
};
var _btoa = typeof btoa === "function" ? (bin) => btoa(bin) : _hasBuffer ? (bin) => Buffer.from(bin, "binary").toString("base64") : btoaPolyfill;
var _fromUint8Array = _hasBuffer ? (u8a) => Buffer.from(u8a).toString("base64") : (u8a) => {
  const maxargs = 4096;
  let strs = [];
  for (let i = 0, l = u8a.length; i < l; i += maxargs) {
    strs.push(_fromCC.apply(null, u8a.subarray(i, i + maxargs)));
  }
  return _btoa(strs.join(""));
};
var cb_utob = (c) => {
  if (c.length < 2) {
    var cc = c.charCodeAt(0);
    return cc < 128 ? c : cc < 2048 ? _fromCC(192 | cc >>> 6) + _fromCC(128 | cc & 63) : _fromCC(224 | cc >>> 12 & 15) + _fromCC(128 | cc >>> 6 & 63) + _fromCC(128 | cc & 63);
  } else {
    var cc = 65536 + (c.charCodeAt(0) - 55296) * 1024 + (c.charCodeAt(1) - 56320);
    return _fromCC(240 | cc >>> 18 & 7) + _fromCC(128 | cc >>> 12 & 63) + _fromCC(128 | cc >>> 6 & 63) + _fromCC(128 | cc & 63);
  }
};
var re_utob = /[\uD800-\uDBFF][\uDC00-\uDFFFF]|[^\x00-\x7F]/g;
var utob = (u) => u.replace(re_utob, cb_utob);
var _encode = _hasBuffer ? (s) => Buffer.from(s, "utf8").toString("base64") : _TE ? (s) => _fromUint8Array(_TE.encode(s)) : (s) => _btoa(utob(s));
var encode = (src, urlsafe = false) => urlsafe ? _mkUriSafe(_encode(src)) : _encode(src);
var re_btou = /[\xC0-\xDF][\x80-\xBF]|[\xE0-\xEF][\x80-\xBF]{2}|[\xF0-\xF7][\x80-\xBF]{3}/g;
var cb_btou = (cccc) => {
  switch (cccc.length) {
    case 4:
      var cp = (7 & cccc.charCodeAt(0)) << 18 | (63 & cccc.charCodeAt(1)) << 12 | (63 & cccc.charCodeAt(2)) << 6 | 63 & cccc.charCodeAt(3), offset = cp - 65536;
      return _fromCC((offset >>> 10) + 55296) + _fromCC((offset & 1023) + 56320);
    case 3:
      return _fromCC((15 & cccc.charCodeAt(0)) << 12 | (63 & cccc.charCodeAt(1)) << 6 | 63 & cccc.charCodeAt(2));
    default:
      return _fromCC((31 & cccc.charCodeAt(0)) << 6 | 63 & cccc.charCodeAt(1));
  }
};
var btou = (b) => b.replace(re_btou, cb_btou);
var atobPolyfill = (asc) => {
  asc = asc.replace(/\s+/g, "");
  if (!b64re.test(asc)) throw new TypeError("malformed base64.");
  asc += "==".slice(2 - (asc.length & 3));
  let u24, r1, r2;
  let binArray = [];
  for (let i = 0; i < asc.length; ) {
    u24 = b64tab[asc.charAt(i++)] << 18 | b64tab[asc.charAt(i++)] << 12 | (r1 = b64tab[asc.charAt(i++)]) << 6 | (r2 = b64tab[asc.charAt(i++)]);
    if (r1 === 64) {
      binArray.push(_fromCC(u24 >> 16 & 255));
    } else if (r2 === 64) {
      binArray.push(_fromCC(u24 >> 16 & 255, u24 >> 8 & 255));
    } else {
      binArray.push(_fromCC(u24 >> 16 & 255, u24 >> 8 & 255, u24 & 255));
    }
  }
  return binArray.join("");
};
var _atob = typeof atob === "function" ? (asc) => atob(_tidyB64(asc)) : _hasBuffer ? (asc) => Buffer.from(asc, "base64").toString("binary") : atobPolyfill;
var _toUint8Array = _hasBuffer ? (a) => _U8Afrom(Buffer.from(a, "base64")) : (a) => _U8Afrom(_atob(a).split("").map((c) => c.charCodeAt(0)));
var _decode = _hasBuffer ? (a) => Buffer.from(a, "base64").toString("utf8") : _TD ? (a) => _TD.decode(_toUint8Array(a)) : (a) => btou(_atob(a));
var _unURI = (a) => _tidyB64(a.replace(/[-_]/g, (m0) => m0 == "-" ? "+" : "/"));
var decode = (src) => _decode(_unURI(src));

// node_modules/rxdb/dist/esm/plugins/utils/utils-base64.js
function b64EncodeUnicode(str) {
  return encode(str);
}
function b64DecodeUnicode(str) {
  return decode(str);
}
function arrayBufferToBase64(buffer) {
  var binary = "";
  var bytes = new Uint8Array(buffer);
  var len = bytes.byteLength;
  for (var i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}
function base64ToArrayBuffer(base64) {
  var binary_string = atob(base64);
  var len = binary_string.length;
  var bytes = new Uint8Array(len);
  for (var i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes.buffer;
}

// node_modules/rxdb/dist/esm/plugins/utils/utils-blob.js
function createBlob(data, type) {
  var blob = new Blob([data], {
    type
  });
  return blob;
}
function createBlobFromBase64(base64String, type) {
  return __async(this, null, function* () {
    var base64Response = yield fetch("data:" + type + ";base64," + base64String);
    var blob = yield base64Response.blob();
    return blob;
  });
}
function blobToString(blob) {
  var blobType = Object.prototype.toString.call(blob);
  if (blobType === "[object Uint8Array]") {
    blob = new Blob([blob]);
  }
  if (typeof blob === "string") {
    return Promise.resolve(blob);
  }
  return blob.text();
}
function blobToBase64String(blob) {
  return __async(this, null, function* () {
    if (typeof blob === "string") {
      return blob;
    }
    var blobType = Object.prototype.toString.call(blob);
    if (blobType === "[object Uint8Array]") {
      blob = new Blob([blob]);
    }
    var arrayBuffer = yield blob.arrayBuffer();
    return arrayBufferToBase64(arrayBuffer);
  });
}
function getBlobSize(blob) {
  return blob.size;
}

// node_modules/rxdb/dist/esm/plugins/utils/utils-revision.js
function parseRevision(revision) {
  var split = revision.split("-");
  if (split.length !== 2) {
    throw new Error("malformatted revision: " + revision);
  }
  return {
    height: parseInt(split[0], 10),
    hash: split[1]
  };
}
function getHeightOfRevision(revision) {
  var useChars = "";
  for (var index = 0; index < revision.length; index++) {
    var char = revision[index];
    if (char === "-") {
      return parseInt(useChars, 10);
    }
    useChars += char;
  }
  throw new Error("malformatted revision: " + revision);
}
function createRevision(databaseInstanceToken, previousDocData) {
  var newRevisionHeight = !previousDocData ? 1 : getHeightOfRevision(previousDocData._rev) + 1;
  return newRevisionHeight + "-" + databaseInstanceToken;
}

// node_modules/rxdb/dist/esm/plugins/utils/utils-object.js
function deepFreeze(o) {
  Object.freeze(o);
  Object.getOwnPropertyNames(o).forEach(function(prop) {
    if (Object.prototype.hasOwnProperty.call(o, prop) && o[prop] !== null && (typeof o[prop] === "object" || typeof o[prop] === "function") && !Object.isFrozen(o[prop])) {
      deepFreeze(o[prop]);
    }
  });
  return o;
}
function objectPathMonad(objectPath) {
  var split = objectPath.split(".");
  var splitLength = split.length;
  if (splitLength === 1) {
    return (obj) => obj[objectPath];
  }
  return (obj) => {
    var currentVal = obj;
    for (var i = 0; i < splitLength; ++i) {
      var subPath = split[i];
      currentVal = currentVal[subPath];
      if (typeof currentVal === "undefined") {
        return currentVal;
      }
    }
    return currentVal;
  };
}
function getFromObjectOrThrow(obj, key) {
  var val = obj[key];
  if (!val) {
    throw new Error("missing value from object " + key);
  }
  return val;
}
function flattenObject(ob) {
  var toReturn = {};
  for (var i in ob) {
    if (!Object.prototype.hasOwnProperty.call(ob, i)) continue;
    if (typeof ob[i] === "object") {
      var flatObject = flattenObject(ob[i]);
      for (var x in flatObject) {
        if (!Object.prototype.hasOwnProperty.call(flatObject, x)) continue;
        toReturn[i + "." + x] = flatObject[x];
      }
    } else {
      toReturn[i] = ob[i];
    }
  }
  return toReturn;
}
function flatClone(obj) {
  return Object.assign({}, obj);
}
function firstPropertyNameOfObject(obj) {
  return Object.keys(obj)[0];
}
function firstPropertyValueOfObject(obj) {
  var key = Object.keys(obj)[0];
  return obj[key];
}
function sortObject(obj, noArraySort = false) {
  if (!obj) return obj;
  if (!noArraySort && Array.isArray(obj)) {
    return obj.sort((a, b) => {
      if (typeof a === "string" && typeof b === "string") return a.localeCompare(b);
      if (typeof a === "object") return 1;
      else return -1;
    }).map((i) => sortObject(i, noArraySort));
  }
  if (typeof obj === "object" && !Array.isArray(obj)) {
    var out = {};
    Object.keys(obj).sort((a, b) => a.localeCompare(b)).forEach((key) => {
      out[key] = sortObject(obj[key], noArraySort);
    });
    return out;
  }
  return obj;
}
function deepClone(src) {
  if (!src) {
    return src;
  }
  if (src === null || typeof src !== "object") {
    return src;
  }
  if (Array.isArray(src)) {
    var ret = new Array(src.length);
    var i = ret.length;
    while (i--) {
      ret[i] = deepClone(src[i]);
    }
    return ret;
  }
  var dest = {};
  for (var key in src) {
    dest[key] = deepClone(src[key]);
  }
  return dest;
}
var clone = deepClone;
function overwriteGetterForCaching(obj, getterName, value) {
  Object.defineProperty(obj, getterName, {
    get: function() {
      return value;
    }
  });
  return value;
}
function hasDeepProperty(obj, property) {
  if (obj.hasOwnProperty(property)) {
    return true;
  }
  if (Array.isArray(obj)) {
    var has = !!obj.find((item) => hasDeepProperty(item, property));
    return has;
  }
  for (var key in obj) {
    if (typeof obj[key] === "object" && obj[key] !== null) {
      if (hasDeepProperty(obj[key], property)) {
        return true;
      }
    }
  }
  return false;
}
function findUndefinedPath(obj, parentPath = "") {
  if (typeof obj !== "object" || obj === null) {
    return false;
  }
  for (var key of Object.keys(obj)) {
    var value = obj[key];
    var currentPath = parentPath ? parentPath + "." + key : key;
    if (typeof value === "undefined") {
      return currentPath;
    }
    if (typeof value === "object" && value !== null) {
      var result = findUndefinedPath(value, currentPath);
      if (result) {
        return result;
      }
    }
  }
  return false;
}

// node_modules/rxdb/dist/esm/plugins/utils/utils-document.js
var RX_META_LWT_MINIMUM = 1;
function getDefaultRxDocumentMeta() {
  return {
    /**
     * Set this to 1 to not waste performance
     * while calling new Date()..
     * The storage wrappers will anyway update
     * the lastWrite time while calling transformDocumentDataFromRxDBToRxStorage()
     */
    lwt: RX_META_LWT_MINIMUM
  };
}
function getDefaultRevision() {
  return "";
}
function stripMetaDataFromDocument(docData) {
  return Object.assign({}, docData, {
    _meta: void 0,
    _deleted: void 0,
    _rev: void 0
  });
}
function areRxDocumentArraysEqual(primaryPath, ar1, ar2) {
  if (ar1.length !== ar2.length) {
    return false;
  }
  var i = 0;
  var len = ar1.length;
  while (i < len) {
    var row1 = ar1[i];
    var row2 = ar2[i];
    i++;
    if (row1[primaryPath] !== row2[primaryPath] || row1._rev !== row2._rev || row1._meta.lwt !== row2._meta.lwt) {
      return false;
    }
  }
  return true;
}
function getSortDocumentsByLastWriteTimeComparator(primaryPath) {
  return (a, b) => {
    if (a._meta.lwt === b._meta.lwt) {
      if (b[primaryPath] < a[primaryPath]) {
        return 1;
      } else {
        return -1;
      }
    } else {
      return a._meta.lwt - b._meta.lwt;
    }
  };
}
function sortDocumentsByLastWriteTime(primaryPath, docs) {
  return docs.sort(getSortDocumentsByLastWriteTimeComparator(primaryPath));
}
function toWithDeleted(docData) {
  docData = flatClone(docData);
  docData._deleted = !!docData._deleted;
  return Object.assign(docData, {
    _attachments: void 0,
    _meta: void 0,
    _rev: void 0
  });
}

// node_modules/rxdb/dist/esm/overwritable.js
var overwritable = {
  /**
   * if this method is overwritten with one
   * that returns true, we do additional checks
   * which help the developer but have bad performance
   */
  isDevMode() {
    return false;
  },
  /**
   * Deep freezes and object when in dev-mode.
   * Deep-Freezing has the same performance as deep-cloning, so we only do that in dev-mode.
   * Also, we can ensure the readonly state via typescript
   * @link https://developer.mozilla.org/de/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze
   */
  deepFreezeWhenDevMode(obj) {
    return obj;
  },
  /**
   * overwritten to map error-codes to text-messages
   */
  tunnelErrorMessage(message) {
    return "\n        RxDB Error-Code: " + message + ".\n        Hint: Error messages are not included in RxDB core to reduce build size.\n        To show the full error messages and to ensure that you do not make any mistakes when using RxDB,\n        use the dev-mode plugin when you are in development mode: https://rxdb.info/dev-mode.html?console=error\n        ";
  }
};

// node_modules/rxdb/node_modules/@babel/runtime/helpers/esm/typeof.js
function _typeof(o) {
  "@babel/helpers - typeof";
  return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o2) {
    return typeof o2;
  } : function(o2) {
    return o2 && "function" == typeof Symbol && o2.constructor === Symbol && o2 !== Symbol.prototype ? "symbol" : typeof o2;
  }, _typeof(o);
}

// node_modules/rxdb/node_modules/@babel/runtime/helpers/esm/toPrimitive.js
function toPrimitive(t, r) {
  if ("object" != _typeof(t) || !t) return t;
  var e = t[Symbol.toPrimitive];
  if (void 0 !== e) {
    var i = e.call(t, r || "default");
    if ("object" != _typeof(i)) return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return ("string" === r ? String : Number)(t);
}

// node_modules/rxdb/node_modules/@babel/runtime/helpers/esm/toPropertyKey.js
function toPropertyKey(t) {
  var i = toPrimitive(t, "string");
  return "symbol" == _typeof(i) ? i : i + "";
}

// node_modules/rxdb/node_modules/@babel/runtime/helpers/esm/createClass.js
function _defineProperties(e, r) {
  for (var t = 0; t < r.length; t++) {
    var o = r[t];
    o.enumerable = o.enumerable || false, o.configurable = true, "value" in o && (o.writable = true), Object.defineProperty(e, toPropertyKey(o.key), o);
  }
}
function _createClass(e, r, t) {
  return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", {
    writable: false
  }), e;
}

// node_modules/rxdb/node_modules/@babel/runtime/helpers/esm/setPrototypeOf.js
function _setPrototypeOf(t, e) {
  return _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function(t2, e2) {
    return t2.__proto__ = e2, t2;
  }, _setPrototypeOf(t, e);
}

// node_modules/rxdb/node_modules/@babel/runtime/helpers/esm/inheritsLoose.js
function _inheritsLoose(t, o) {
  t.prototype = Object.create(o.prototype), t.prototype.constructor = t, _setPrototypeOf(t, o);
}

// node_modules/rxdb/node_modules/@babel/runtime/helpers/esm/getPrototypeOf.js
function _getPrototypeOf(t) {
  return _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function(t2) {
    return t2.__proto__ || Object.getPrototypeOf(t2);
  }, _getPrototypeOf(t);
}

// node_modules/rxdb/node_modules/@babel/runtime/helpers/esm/isNativeFunction.js
function _isNativeFunction(t) {
  try {
    return -1 !== Function.toString.call(t).indexOf("[native code]");
  } catch (n) {
    return "function" == typeof t;
  }
}

// node_modules/rxdb/node_modules/@babel/runtime/helpers/esm/isNativeReflectConstruct.js
function _isNativeReflectConstruct() {
  try {
    var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {
    }));
  } catch (t2) {
  }
  return (_isNativeReflectConstruct = function _isNativeReflectConstruct2() {
    return !!t;
  })();
}

// node_modules/rxdb/node_modules/@babel/runtime/helpers/esm/construct.js
function _construct(t, e, r) {
  if (_isNativeReflectConstruct()) return Reflect.construct.apply(null, arguments);
  var o = [null];
  o.push.apply(o, e);
  var p = new (t.bind.apply(t, o))();
  return r && _setPrototypeOf(p, r.prototype), p;
}

// node_modules/rxdb/node_modules/@babel/runtime/helpers/esm/wrapNativeSuper.js
function _wrapNativeSuper(t) {
  var r = "function" == typeof Map ? /* @__PURE__ */ new Map() : void 0;
  return _wrapNativeSuper = function _wrapNativeSuper2(t2) {
    if (null === t2 || !_isNativeFunction(t2)) return t2;
    if ("function" != typeof t2) throw new TypeError("Super expression must either be null or a function");
    if (void 0 !== r) {
      if (r.has(t2)) return r.get(t2);
      r.set(t2, Wrapper);
    }
    function Wrapper() {
      return _construct(t2, arguments, _getPrototypeOf(this).constructor);
    }
    return Wrapper.prototype = Object.create(t2.prototype, {
      constructor: {
        value: Wrapper,
        enumerable: false,
        writable: true,
        configurable: true
      }
    }), _setPrototypeOf(Wrapper, t2);
  }, _wrapNativeSuper(t);
}

// node_modules/rxdb/dist/esm/rx-error.js
function parametersToString(parameters) {
  var ret = "";
  if (Object.keys(parameters).length === 0) return ret;
  ret += "-".repeat(20) + "\n";
  ret += "Parameters:\n";
  ret += Object.keys(parameters).map((k) => {
    var paramStr = "[object Object]";
    try {
      if (k === "errors") {
        paramStr = parameters[k].map((err) => JSON.stringify(err, Object.getOwnPropertyNames(err)));
      } else {
        paramStr = JSON.stringify(parameters[k], function(_k, v) {
          return v === void 0 ? null : v;
        }, 2);
      }
    } catch (e) {
    }
    return k + ": " + paramStr;
  }).join("\n");
  ret += "\n";
  return ret;
}
function messageForError(message, code, parameters) {
  return "\n" + message + "\n" + parametersToString(parameters);
}
var RxError = function(_Error) {
  function RxError2(code, message, parameters = {}) {
    var _this;
    var mes = messageForError(message, code, parameters);
    _this = _Error.call(this, mes) || this;
    _this.code = code;
    _this.message = mes;
    _this.url = getErrorUrl(code);
    _this.parameters = parameters;
    _this.rxdb = true;
    return _this;
  }
  _inheritsLoose(RxError2, _Error);
  var _proto = RxError2.prototype;
  _proto.toString = function toString() {
    return this.message;
  };
  return _createClass(RxError2, [{
    key: "name",
    get: function() {
      return "RxError (" + this.code + ")";
    }
  }, {
    key: "typeError",
    get: function() {
      return false;
    }
  }]);
}(_wrapNativeSuper(Error));
var RxTypeError = function(_TypeError) {
  function RxTypeError2(code, message, parameters = {}) {
    var _this2;
    var mes = messageForError(message, code, parameters);
    _this2 = _TypeError.call(this, mes) || this;
    _this2.code = code;
    _this2.message = mes;
    _this2.url = getErrorUrl(code);
    _this2.parameters = parameters;
    _this2.rxdb = true;
    return _this2;
  }
  _inheritsLoose(RxTypeError2, _TypeError);
  var _proto2 = RxTypeError2.prototype;
  _proto2.toString = function toString() {
    return this.message;
  };
  return _createClass(RxTypeError2, [{
    key: "name",
    get: function() {
      return "RxTypeError (" + this.code + ")";
    }
  }, {
    key: "typeError",
    get: function() {
      return true;
    }
  }]);
}(_wrapNativeSuper(TypeError));
function getErrorUrl(code) {
  return "https://rxdb.info/errors.html?console=errors#" + code;
}
function errorUrlHint(code) {
  return "\nFind out more about this error here: " + getErrorUrl(code) + " \n";
}
function newRxError(code, parameters) {
  return new RxError(code, overwritable.tunnelErrorMessage(code) + errorUrlHint(code), parameters);
}
function newRxTypeError(code, parameters) {
  return new RxTypeError(code, overwritable.tunnelErrorMessage(code) + errorUrlHint(code), parameters);
}
function isBulkWriteConflictError(err) {
  if (err && err.status === 409) {
    return err;
  } else {
    return false;
  }
}
var STORAGE_WRITE_ERROR_CODE_TO_MESSAGE = {
  409: "document write conflict",
  422: "schema validation error",
  510: "attachment data missing"
};
function rxStorageWriteErrorToRxError(err) {
  return newRxError("COL20", {
    name: STORAGE_WRITE_ERROR_CODE_TO_MESSAGE[err.status],
    document: err.documentId,
    writeError: err
  });
}

// node_modules/rxdb/dist/esm/plugins/utils/utils-hash.js
var hashFn;
function getHashFn() {
  if (hashFn) {
    return hashFn;
  }
  if (typeof crypto === "undefined" || typeof crypto.subtle === "undefined" || typeof crypto.subtle.digest !== "function") {
    throw newRxError("UT8", {
      args: {
        typeof_crypto: typeof crypto,
        typeof_crypto_subtle: typeof crypto?.subtle,
        typeof_crypto_subtle_digest: typeof crypto?.subtle?.digest
      }
    });
  }
  hashFn = crypto.subtle.digest.bind(crypto.subtle);
  return hashFn;
}
function nativeSha256(input) {
  return __async(this, null, function* () {
    var data = new TextEncoder().encode(input);
    var hashBuffer = yield getHashFn()("SHA-256", data);
    var hash = Array.prototype.map.call(new Uint8Array(hashBuffer), (x) => ("00" + x.toString(16)).slice(-2)).join("");
    return hash;
  });
}
var defaultHashSha256 = nativeSha256;
function hashStringToNumber(str) {
  var nr = 0;
  var len = str.length;
  for (var i = 0; i < len; i++) {
    nr = nr + str.charCodeAt(i);
    nr |= 0;
  }
  return nr;
}

// node_modules/rxdb/dist/esm/plugins/utils/utils-promise.js
function nextTick() {
  return new Promise((res) => setTimeout(res, 0));
}
function promiseWait(ms = 0) {
  return new Promise((res) => setTimeout(res, ms));
}
function toPromise(maybePromise) {
  if (maybePromise && typeof maybePromise.then === "function") {
    return maybePromise;
  } else {
    return Promise.resolve(maybePromise);
  }
}
function isPromise(value) {
  if (typeof value !== "undefined" && typeof value.then === "function") {
    return true;
  }
  return false;
}
var PROMISE_RESOLVE_TRUE = Promise.resolve(true);
var PROMISE_RESOLVE_FALSE = Promise.resolve(false);
var PROMISE_RESOLVE_NULL = Promise.resolve(null);
var PROMISE_RESOLVE_VOID = Promise.resolve();
function requestIdlePromiseNoQueue(timeout = 1e4) {
  if (typeof requestIdleCallback === "function") {
    return new Promise((res) => {
      requestIdleCallback(() => res(), {
        timeout
      });
    });
  } else {
    return promiseWait(0);
  }
}
var idlePromiseQueue = PROMISE_RESOLVE_VOID;
function requestIdlePromise(timeout = void 0) {
  idlePromiseQueue = idlePromiseQueue.then(() => {
    return requestIdlePromiseNoQueue(timeout);
  });
  return idlePromiseQueue;
}
function requestIdleCallbackIfAvailable(fun) {
  if (typeof requestIdleCallback === "function") {
    requestIdleCallback(() => {
      fun();
    });
  }
}
function promiseSeries(tasks, initial) {
  return tasks.reduce((current, next) => current.then(next), Promise.resolve(initial));
}

// node_modules/rxdb/dist/esm/plugins/utils/utils-regex.js
var REGEX_ALL_DOTS = /\./g;
var REGEX_ALL_PIPES = /\|/g;

// node_modules/rxdb/dist/esm/plugins/utils/utils-string.js
var COUCH_NAME_CHARS = "abcdefghijklmnopqrstuvwxyz";
function randomToken(length = 10) {
  var text = "";
  for (var i = 0; i < length; i++) {
    text += COUCH_NAME_CHARS.charAt(Math.floor(Math.random() * COUCH_NAME_CHARS.length));
  }
  return text;
}
var RANDOM_STRING = "Fz7SZXPmYJujkzjY1rpXWvlWBqoGAfAX";
function ucfirst(str) {
  str += "";
  var f = str.charAt(0).toUpperCase();
  return f + str.substr(1);
}
function trimDots(str) {
  while (str.charAt(0) === ".") {
    str = str.substr(1);
  }
  while (str.slice(-1) === ".") {
    str = str.slice(0, -1);
  }
  return str;
}
function lastCharOfString(str) {
  return str.charAt(str.length - 1);
}
function isFolderPath(name) {
  if (name.includes("/") || // unix
  name.includes("\\")) {
    return true;
  } else {
    return false;
  }
}
function arrayBufferToString(arrayBuffer) {
  return new TextDecoder().decode(arrayBuffer);
}
function stringToArrayBuffer(str) {
  return new TextEncoder().encode(str);
}
function normalizeString(str) {
  return str.trim().replace(/[\n\s]+/g, "");
}

// node_modules/rxdb/dist/esm/plugins/utils/utils-number.js
function randomNumber(min = 0, max = 1e3) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// node_modules/rxdb/dist/esm/plugins/utils/utils-object-deep-equal.js
function deepEqual(a, b) {
  if (a === b) return true;
  if (a && b && typeof a == "object" && typeof b == "object") {
    if (a.constructor !== b.constructor) return false;
    var length;
    var i;
    if (Array.isArray(a)) {
      length = a.length;
      if (length !== b.length) return false;
      for (i = length; i-- !== 0; ) if (!deepEqual(a[i], b[i])) return false;
      return true;
    }
    if (a.constructor === RegExp) return a.source === b.source && a.flags === b.flags;
    if (a.valueOf !== Object.prototype.valueOf) return a.valueOf() === b.valueOf();
    if (a.toString !== Object.prototype.toString) return a.toString() === b.toString();
    var keys = Object.keys(a);
    length = keys.length;
    if (length !== Object.keys(b).length) return false;
    for (i = length; i-- !== 0; ) if (!Object.prototype.hasOwnProperty.call(b, keys[i])) return false;
    for (i = length; i-- !== 0; ) {
      var key = keys[i];
      if (!deepEqual(a[key], b[key])) return false;
    }
    return true;
  }
  return a !== a && b !== b;
}

// node_modules/rxdb/dist/esm/plugins/utils/utils-object-dot-prop.js
var isObject = (value) => {
  var type = typeof value;
  return value !== null && (type === "object" || type === "function");
};
var disallowedKeys = /* @__PURE__ */ new Set(["__proto__", "prototype", "constructor"]);
var digits = new Set("0123456789");
function getPathSegments(path) {
  var parts = [];
  var currentSegment = "";
  var currentPart = "start";
  var isIgnoring = false;
  for (var character of path) {
    switch (character) {
      case "\\": {
        if (currentPart === "index") {
          throw new Error("Invalid character in an index");
        }
        if (currentPart === "indexEnd") {
          throw new Error("Invalid character after an index");
        }
        if (isIgnoring) {
          currentSegment += character;
        }
        currentPart = "property";
        isIgnoring = !isIgnoring;
        break;
      }
      case ".": {
        if (currentPart === "index") {
          throw new Error("Invalid character in an index");
        }
        if (currentPart === "indexEnd") {
          currentPart = "property";
          break;
        }
        if (isIgnoring) {
          isIgnoring = false;
          currentSegment += character;
          break;
        }
        if (disallowedKeys.has(currentSegment)) {
          return [];
        }
        parts.push(currentSegment);
        currentSegment = "";
        currentPart = "property";
        break;
      }
      case "[": {
        if (currentPart === "index") {
          throw new Error("Invalid character in an index");
        }
        if (currentPart === "indexEnd") {
          currentPart = "index";
          break;
        }
        if (isIgnoring) {
          isIgnoring = false;
          currentSegment += character;
          break;
        }
        if (currentPart === "property") {
          if (disallowedKeys.has(currentSegment)) {
            return [];
          }
          parts.push(currentSegment);
          currentSegment = "";
        }
        currentPart = "index";
        break;
      }
      case "]": {
        if (currentPart === "index") {
          parts.push(Number.parseInt(currentSegment, 10));
          currentSegment = "";
          currentPart = "indexEnd";
          break;
        }
        if (currentPart === "indexEnd") {
          throw new Error("Invalid character after an index");
        }
      }
      default: {
        if (currentPart === "index" && !digits.has(character)) {
          throw new Error("Invalid character in an index");
        }
        if (currentPart === "indexEnd") {
          throw new Error("Invalid character after an index");
        }
        if (currentPart === "start") {
          currentPart = "property";
        }
        if (isIgnoring) {
          isIgnoring = false;
          currentSegment += "\\";
        }
        currentSegment += character;
      }
    }
  }
  if (isIgnoring) {
    currentSegment += "\\";
  }
  switch (currentPart) {
    case "property": {
      if (disallowedKeys.has(currentSegment)) {
        return [];
      }
      parts.push(currentSegment);
      break;
    }
    case "index": {
      throw new Error("Index was not closed");
    }
    case "start": {
      parts.push("");
      break;
    }
  }
  return parts;
}
function isStringIndex(object, key) {
  if (typeof key !== "number" && Array.isArray(object)) {
    var index = Number.parseInt(key, 10);
    return Number.isInteger(index) && object[index] === object[key];
  }
  return false;
}
function assertNotStringIndex(object, key) {
  if (isStringIndex(object, key)) {
    throw new Error("Cannot use string index");
  }
}
function getProperty(object, path, value) {
  if (Array.isArray(path)) {
    path = path.join(".");
  }
  if (!path.includes(".") && !path.includes("[")) {
    return object[path];
  }
  if (!isObject(object) || typeof path !== "string") {
    return value === void 0 ? object : value;
  }
  var pathArray = getPathSegments(path);
  if (pathArray.length === 0) {
    return value;
  }
  for (var index = 0; index < pathArray.length; index++) {
    var key = pathArray[index];
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
function setProperty(object, path, value) {
  if (Array.isArray(path)) {
    path = path.join(".");
  }
  if (!isObject(object) || typeof path !== "string") {
    return object;
  }
  var root = object;
  var pathArray = getPathSegments(path);
  for (var index = 0; index < pathArray.length; index++) {
    var key = pathArray[index];
    assertNotStringIndex(object, key);
    if (index === pathArray.length - 1) {
      object[key] = value;
    } else if (!isObject(object[key])) {
      object[key] = typeof pathArray[index + 1] === "number" ? [] : {};
    }
    object = object[key];
  }
  return root;
}
function deleteProperty(object, path) {
  if (!isObject(object) || typeof path !== "string") {
    return false;
  }
  var pathArray = getPathSegments(path);
  for (var index = 0; index < pathArray.length; index++) {
    var key = pathArray[index];
    assertNotStringIndex(object, key);
    if (index === pathArray.length - 1) {
      delete object[key];
      return true;
    }
    object = object[key];
    if (!isObject(object)) {
      return false;
    }
  }
}
function hasProperty(object, path) {
  if (!isObject(object) || typeof path !== "string") {
    return false;
  }
  var pathArray = getPathSegments(path);
  if (pathArray.length === 0) {
    return false;
  }
  for (var key of pathArray) {
    if (!isObject(object) || !(key in object) || isStringIndex(object, key)) {
      return false;
    }
    object = object[key];
  }
  return true;
}
function escapePath(path) {
  if (typeof path !== "string") {
    throw new TypeError("Expected a string");
  }
  return path.replace(/[\\.[]/g, "\\$&");
}
function entries(value) {
  if (Array.isArray(value)) {
    return value.map((v, index) => [index, v]);
  }
  return Object.entries(value);
}
function stringifyPath(pathSegments) {
  var result = "";
  for (var [index, segment] of entries(pathSegments)) {
    if (typeof segment === "number") {
      result += "[" + segment + "]";
    } else {
      segment = escapePath(segment);
      result += index === 0 ? segment : "." + segment;
    }
  }
  return result;
}
function* deepKeysIterator(object, currentPath = []) {
  if (!isObject(object)) {
    if (currentPath.length > 0) {
      yield stringifyPath(currentPath);
    }
    return;
  }
  for (var [key, value] of entries(object)) {
    yield* __yieldStar(deepKeysIterator(value, [...currentPath, key]));
  }
}
function deepKeys(object) {
  return [...deepKeysIterator(object)];
}

// node_modules/rxdb/dist/esm/plugins/utils/utils-map.js
function getFromMapOrThrow(map, key) {
  var val = map.get(key);
  if (typeof val === "undefined") {
    throw new Error("missing value from map " + key);
  }
  return val;
}
function getFromMapOrCreate(map, index, creator, ifWasThere) {
  var value = map.get(index);
  if (typeof value === "undefined") {
    value = creator();
    map.set(index, value);
  } else if (ifWasThere) {
    ifWasThere(value);
  }
  return value;
}

// node_modules/rxdb/dist/esm/plugins/utils/utils-error.js
function pluginMissing(pluginKey) {
  var keyParts = pluginKey.split("-");
  var pluginName = "RxDB";
  keyParts.forEach((part) => {
    pluginName += ucfirst(part);
  });
  pluginName += "Plugin";
  return new Error("You are using a function which must be overwritten by a plugin.\n        You should either prevent the usage of this function or add the plugin via:\n            import { " + pluginName + " } from 'rxdb/plugins/" + pluginKey + "';\n            addRxPlugin(" + pluginName + ");\n        ");
}
function errorToPlainJson(err) {
  var ret = {
    name: err.name,
    message: err.message,
    rxdb: err.rxdb,
    parameters: err.parameters,
    extensions: err.extensions,
    code: err.code,
    url: err.url,
    /**
     * stack must be last to make it easier to read the json in a console.
     * Also we ensure that each linebreak is spaced so that the chrome devtools
     * shows urls to the source code that can be clicked to inspect
     * the correct place in the code.
     */
    stack: !err.stack ? void 0 : err.stack.replace(/\n/g, " \n ")
  };
  return ret;
}

// node_modules/rxdb/dist/esm/plugins/utils/utils-time.js
var _lastNow = 0;
function now() {
  var ret = Date.now();
  ret = ret + 0.01;
  if (ret <= _lastNow) {
    ret = _lastNow + 0.01;
  }
  var twoDecimals = parseFloat(ret.toFixed(2));
  _lastNow = twoDecimals;
  return twoDecimals;
}

// node_modules/rxdb/dist/esm/plugins/utils/utils-other.js
function runXTimes(xTimes, fn) {
  new Array(xTimes).fill(0).forEach((_v, idx) => fn(idx));
}
function ensureNotFalsy(obj, message) {
  if (!obj) {
    if (!message) {
      message = "";
    }
    throw new Error("ensureNotFalsy() is falsy: " + message);
  }
  return obj;
}
function ensureInteger(obj) {
  if (!Number.isInteger(obj)) {
    throw new Error("ensureInteger() is falsy");
  }
  return obj;
}
var RXJS_SHARE_REPLAY_DEFAULTS = {
  bufferSize: 1,
  refCount: true
};
function nameFunction(name, body) {
  return {
    [name](...args) {
      return body.apply(this, args);
    }
  }[name];
}
function customFetchWithFixedHeaders(headers) {
  function customFetch(url, options = {}) {
    options.headers = __spreadValues(__spreadValues({}, headers), options.headers || {});
    return fetch(url, options);
  }
  return customFetch;
}

// node_modules/rxdb/dist/esm/plugins/utils/utils-rxdb-version.js
var RXDB_VERSION = "16.20.0";

// node_modules/rxdb/dist/esm/plugins/utils/utils-global.js
var RXDB_UTILS_GLOBAL = {};

// node_modules/rxdb/dist/esm/plugins/utils/utils-premium.js
var PREMIUM_FLAG_HASH = "6da4936d1425ff3a5c44c02342c6daf791d266be3ae8479b8ec59e261df41b93";
var NON_PREMIUM_COLLECTION_LIMIT = 16;
var hasPremiumPromise = PROMISE_RESOLVE_FALSE;
var premiumChecked = false;
function hasPremiumFlag() {
  return __async(this, null, function* () {
    if (premiumChecked) {
      return hasPremiumPromise;
    }
    premiumChecked = true;
    hasPremiumPromise = (() => __async(null, null, function* () {
      if (RXDB_UTILS_GLOBAL.premium && typeof RXDB_UTILS_GLOBAL.premium === "string" && (yield defaultHashSha256(RXDB_UTILS_GLOBAL.premium)) === PREMIUM_FLAG_HASH) {
        return true;
      } else {
        return false;
      }
    }))();
    return hasPremiumPromise;
  });
}

// node_modules/rxdb/dist/esm/rx-schema-helper.js
function getPseudoSchemaForVersion(version, primaryKey) {
  var pseudoSchema = fillWithDefaultSettings({
    version,
    type: "object",
    primaryKey,
    properties: {
      [primaryKey]: {
        type: "string",
        maxLength: 100
      },
      value: {
        type: "string"
      }
    },
    indexes: [[primaryKey]],
    required: [primaryKey]
  });
  return pseudoSchema;
}
function getSchemaByObjectPath(rxJsonSchema, path) {
  var usePath = path;
  usePath = usePath.replace(REGEX_ALL_DOTS, ".properties.");
  usePath = "properties." + usePath;
  usePath = trimDots(usePath);
  var ret = getProperty(rxJsonSchema, usePath);
  return ret;
}
function fillPrimaryKey(primaryPath, jsonSchema, documentData) {
  if (typeof jsonSchema.primaryKey === "string") {
    return documentData;
  }
  var newPrimary = getComposedPrimaryKeyOfDocumentData(jsonSchema, documentData);
  var existingPrimary = documentData[primaryPath];
  if (existingPrimary && existingPrimary !== newPrimary) {
    throw newRxError("DOC19", {
      args: {
        documentData,
        existingPrimary,
        newPrimary
      },
      schema: jsonSchema
    });
  }
  documentData[primaryPath] = newPrimary;
  return documentData;
}
function getPrimaryFieldOfPrimaryKey(primaryKey) {
  if (typeof primaryKey === "string") {
    return primaryKey;
  } else {
    return primaryKey.key;
  }
}
function getLengthOfPrimaryKey(schema) {
  var primaryPath = getPrimaryFieldOfPrimaryKey(schema.primaryKey);
  var schemaPart = getSchemaByObjectPath(schema, primaryPath);
  return ensureNotFalsy(schemaPart.maxLength);
}
function getComposedPrimaryKeyOfDocumentData(jsonSchema, documentData) {
  if (typeof jsonSchema.primaryKey === "string") {
    return documentData[jsonSchema.primaryKey];
  }
  var compositePrimary = jsonSchema.primaryKey;
  return compositePrimary.fields.map((field) => {
    var value = getProperty(documentData, field);
    if (typeof value === "undefined") {
      throw newRxError("DOC18", {
        args: {
          field,
          documentData
        }
      });
    }
    return value;
  }).join(compositePrimary.separator);
}
function normalizeRxJsonSchema(jsonSchema) {
  var normalizedSchema = sortObject(jsonSchema, true);
  return normalizedSchema;
}
function getDefaultIndex(primaryPath) {
  return ["_deleted", primaryPath];
}
function fillWithDefaultSettings(schemaObj) {
  schemaObj = flatClone(schemaObj);
  var primaryPath = getPrimaryFieldOfPrimaryKey(schemaObj.primaryKey);
  schemaObj.properties = flatClone(schemaObj.properties);
  schemaObj.additionalProperties = false;
  if (!Object.prototype.hasOwnProperty.call(schemaObj, "keyCompression")) {
    schemaObj.keyCompression = false;
  }
  schemaObj.indexes = schemaObj.indexes ? schemaObj.indexes.slice(0) : [];
  schemaObj.required = schemaObj.required ? schemaObj.required.slice(0) : [];
  schemaObj.encrypted = schemaObj.encrypted ? schemaObj.encrypted.slice(0) : [];
  schemaObj.properties._rev = {
    type: "string",
    minLength: 1
  };
  schemaObj.properties._attachments = {
    type: "object"
  };
  schemaObj.properties._deleted = {
    type: "boolean"
  };
  schemaObj.properties._meta = RX_META_SCHEMA;
  schemaObj.required = schemaObj.required ? schemaObj.required.slice(0) : [];
  schemaObj.required.push("_deleted");
  schemaObj.required.push("_rev");
  schemaObj.required.push("_meta");
  schemaObj.required.push("_attachments");
  var finalFields = getFinalFields(schemaObj);
  appendToArray(schemaObj.required, finalFields);
  schemaObj.required = schemaObj.required.filter((field) => !field.includes(".")).filter((elem, pos, arr) => arr.indexOf(elem) === pos);
  schemaObj.version = schemaObj.version || 0;
  var useIndexes = schemaObj.indexes.map((index) => {
    var arIndex = isMaybeReadonlyArray(index) ? index.slice(0) : [index];
    if (!arIndex.includes(primaryPath)) {
      arIndex.push(primaryPath);
    }
    if (arIndex[0] !== "_deleted") {
      arIndex.unshift("_deleted");
    }
    return arIndex;
  });
  if (useIndexes.length === 0) {
    useIndexes.push(getDefaultIndex(primaryPath));
  }
  useIndexes.push(["_meta.lwt", primaryPath]);
  if (schemaObj.internalIndexes) {
    schemaObj.internalIndexes.map((idx) => {
      useIndexes.push(idx);
    });
  }
  var hasIndex = /* @__PURE__ */ new Set();
  useIndexes.filter((index) => {
    var indexStr = index.join(",");
    if (hasIndex.has(indexStr)) {
      return false;
    } else {
      hasIndex.add(indexStr);
      return true;
    }
  });
  schemaObj.indexes = useIndexes;
  return schemaObj;
}
var META_LWT_UNIX_TIME_MAX = 1e15;
var RX_META_SCHEMA = {
  type: "object",
  properties: {
    /**
     * The last-write time.
     * Unix time in milliseconds.
     */
    lwt: {
      type: "number",
      /**
       * We use 1 as minimum so that the value is never falsy.
       */
      minimum: RX_META_LWT_MINIMUM,
      maximum: META_LWT_UNIX_TIME_MAX,
      multipleOf: 0.01
    }
  },
  /**
   * Additional properties are allowed
   * and can be used by plugins to set various flags.
   */
  additionalProperties: true,
  required: ["lwt"]
};
function getFinalFields(jsonSchema) {
  var ret = Object.keys(jsonSchema.properties).filter((key) => jsonSchema.properties[key].final);
  var primaryPath = getPrimaryFieldOfPrimaryKey(jsonSchema.primaryKey);
  ret.push(primaryPath);
  if (typeof jsonSchema.primaryKey !== "string") {
    jsonSchema.primaryKey.fields.forEach((field) => ret.push(field));
  }
  return ret;
}
function fillObjectWithDefaults(rxSchema, obj) {
  var defaultKeys = Object.keys(rxSchema.defaultValues);
  for (var i = 0; i < defaultKeys.length; ++i) {
    var key = defaultKeys[i];
    if (!Object.prototype.hasOwnProperty.call(obj, key) || typeof obj[key] === "undefined") {
      obj[key] = rxSchema.defaultValues[key];
    }
  }
  return obj;
}
var DEFAULT_CHECKPOINT_SCHEMA = {
  type: "object",
  properties: {
    id: {
      type: "string"
    },
    lwt: {
      type: "number"
    }
  },
  required: ["id", "lwt"],
  additionalProperties: false
};

export {
  _createClass,
  lastOfArray,
  shuffleArray,
  randomOfArray,
  toArray,
  batchArray,
  removeOneFromArrayIfMatches,
  isMaybeReadonlyArray,
  isOneItemOfArrayInOtherArray,
  arrayFilterNotEmpty,
  countUntilNotMatching,
  asyncFilter,
  sumNumberArray,
  maxOfNumbers,
  appendToArray,
  uniqueArray,
  sortByObjectNumberProperty,
  b64EncodeUnicode,
  b64DecodeUnicode,
  arrayBufferToBase64,
  base64ToArrayBuffer,
  createBlob,
  createBlobFromBase64,
  blobToString,
  blobToBase64String,
  getBlobSize,
  parseRevision,
  getHeightOfRevision,
  createRevision,
  deepFreeze,
  objectPathMonad,
  getFromObjectOrThrow,
  flattenObject,
  flatClone,
  firstPropertyNameOfObject,
  firstPropertyValueOfObject,
  sortObject,
  clone,
  overwriteGetterForCaching,
  hasDeepProperty,
  findUndefinedPath,
  RX_META_LWT_MINIMUM,
  getDefaultRxDocumentMeta,
  getDefaultRevision,
  stripMetaDataFromDocument,
  areRxDocumentArraysEqual,
  getSortDocumentsByLastWriteTimeComparator,
  sortDocumentsByLastWriteTime,
  toWithDeleted,
  overwritable,
  RxError,
  RxTypeError,
  getErrorUrl,
  errorUrlHint,
  newRxError,
  newRxTypeError,
  isBulkWriteConflictError,
  rxStorageWriteErrorToRxError,
  nativeSha256,
  defaultHashSha256,
  hashStringToNumber,
  nextTick,
  promiseWait,
  toPromise,
  isPromise,
  PROMISE_RESOLVE_TRUE,
  PROMISE_RESOLVE_FALSE,
  PROMISE_RESOLVE_NULL,
  PROMISE_RESOLVE_VOID,
  requestIdlePromiseNoQueue,
  requestIdlePromise,
  requestIdleCallbackIfAvailable,
  promiseSeries,
  REGEX_ALL_DOTS,
  REGEX_ALL_PIPES,
  randomToken,
  RANDOM_STRING,
  ucfirst,
  trimDots,
  lastCharOfString,
  isFolderPath,
  arrayBufferToString,
  stringToArrayBuffer,
  normalizeString,
  randomNumber,
  deepEqual,
  getProperty,
  setProperty,
  deleteProperty,
  hasProperty,
  deepKeys,
  getFromMapOrThrow,
  getFromMapOrCreate,
  pluginMissing,
  errorToPlainJson,
  now,
  runXTimes,
  ensureNotFalsy,
  ensureInteger,
  RXJS_SHARE_REPLAY_DEFAULTS,
  nameFunction,
  customFetchWithFixedHeaders,
  RXDB_VERSION,
  RXDB_UTILS_GLOBAL,
  PREMIUM_FLAG_HASH,
  NON_PREMIUM_COLLECTION_LIMIT,
  hasPremiumFlag,
  getPseudoSchemaForVersion,
  getSchemaByObjectPath,
  fillPrimaryKey,
  getPrimaryFieldOfPrimaryKey,
  getLengthOfPrimaryKey,
  getComposedPrimaryKeyOfDocumentData,
  normalizeRxJsonSchema,
  getDefaultIndex,
  fillWithDefaultSettings,
  META_LWT_UNIX_TIME_MAX,
  RX_META_SCHEMA,
  getFinalFields,
  fillObjectWithDefaults,
  DEFAULT_CHECKPOINT_SCHEMA
};
//# sourceMappingURL=chunk-GXT3KPMX.js.map
