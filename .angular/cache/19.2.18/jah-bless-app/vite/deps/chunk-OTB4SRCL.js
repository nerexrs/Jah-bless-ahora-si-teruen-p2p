import {
  ObliviousSet
} from "./chunk-FKGUJVD6.js";
import {
  Subject,
  mergeWith
} from "./chunk-3TXA6K3X.js";
import {
  __async
} from "./chunk-7RSYZEEK.js";

// node_modules/broadcast-channel/dist/esbrowser/util.js
function isPromise(obj) {
  return obj && typeof obj.then === "function";
}
var PROMISE_RESOLVED_FALSE = Promise.resolve(false);
var PROMISE_RESOLVED_TRUE = Promise.resolve(true);
var PROMISE_RESOLVED_VOID = Promise.resolve();
function sleep(time, resolveWith) {
  if (!time) time = 0;
  return new Promise(function(res) {
    return setTimeout(function() {
      return res(resolveWith);
    }, time);
  });
}
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}
function randomToken() {
  return Math.random().toString(36).substring(2);
}
var lastMs = 0;
function microSeconds() {
  var ret = Date.now() * 1e3;
  if (ret <= lastMs) {
    ret = lastMs + 1;
  }
  lastMs = ret;
  return ret;
}
function supportsWebLockAPI() {
  if (typeof navigator !== "undefined" && typeof navigator.locks !== "undefined" && typeof navigator.locks.request === "function") {
    return true;
  } else {
    return false;
  }
}

// node_modules/broadcast-channel/dist/esbrowser/methods/native.js
var microSeconds2 = microSeconds;
var type = "native";
function create(channelName) {
  var state = {
    time: microSeconds(),
    messagesCallback: null,
    bc: new BroadcastChannel(channelName),
    subFns: []
    // subscriberFunctions
  };
  state.bc.onmessage = function(msgEvent) {
    if (state.messagesCallback) {
      state.messagesCallback(msgEvent.data);
    }
  };
  return state;
}
function close(channelState) {
  channelState.bc.close();
  channelState.subFns = [];
}
function postMessage(channelState, messageJson) {
  try {
    channelState.bc.postMessage(messageJson, false);
    return PROMISE_RESOLVED_VOID;
  } catch (err) {
    return Promise.reject(err);
  }
}
function onMessage(channelState, fn) {
  channelState.messagesCallback = fn;
}
function canBeUsed() {
  if (typeof globalThis !== "undefined" && globalThis.Deno && globalThis.Deno.args) {
    return true;
  }
  if ((typeof window !== "undefined" || typeof self !== "undefined") && typeof BroadcastChannel === "function") {
    if (BroadcastChannel._pubkey) {
      throw new Error("BroadcastChannel: Do not overwrite window.BroadcastChannel with this module, this is not a polyfill");
    }
    return true;
  } else {
    return false;
  }
}
function averageResponseTime() {
  return 150;
}
var NativeMethod = {
  create,
  close,
  onMessage,
  postMessage,
  canBeUsed,
  type,
  averageResponseTime,
  microSeconds: microSeconds2
};

// node_modules/broadcast-channel/dist/esbrowser/options.js
function fillOptionsWithDefaults() {
  var originalOptions = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
  var options = JSON.parse(JSON.stringify(originalOptions));
  if (typeof options.webWorkerSupport === "undefined") options.webWorkerSupport = true;
  if (!options.idb) options.idb = {};
  if (!options.idb.ttl) options.idb.ttl = 1e3 * 45;
  if (!options.idb.fallbackInterval) options.idb.fallbackInterval = 150;
  if (originalOptions.idb && typeof originalOptions.idb.onclose === "function") options.idb.onclose = originalOptions.idb.onclose;
  if (!options.localstorage) options.localstorage = {};
  if (!options.localstorage.removeTimeout) options.localstorage.removeTimeout = 1e3 * 60;
  if (originalOptions.methods) options.methods = originalOptions.methods;
  if (!options.node) options.node = {};
  if (!options.node.ttl) options.node.ttl = 1e3 * 60 * 2;
  if (!options.node.maxParallelWrites) options.node.maxParallelWrites = 2048;
  if (typeof options.node.useFastPath === "undefined") options.node.useFastPath = true;
  return options;
}

// node_modules/broadcast-channel/dist/esbrowser/methods/indexed-db.js
var microSeconds3 = microSeconds;
var DB_PREFIX = "pubkey.broadcast-channel-0-";
var OBJECT_STORE_ID = "messages";
var TRANSACTION_SETTINGS = {
  durability: "relaxed"
};
var type2 = "idb";
function getIdb() {
  if (typeof indexedDB !== "undefined") return indexedDB;
  if (typeof window !== "undefined") {
    if (typeof window.mozIndexedDB !== "undefined") return window.mozIndexedDB;
    if (typeof window.webkitIndexedDB !== "undefined") return window.webkitIndexedDB;
    if (typeof window.msIndexedDB !== "undefined") return window.msIndexedDB;
  }
  return false;
}
function commitIndexedDBTransaction(tx) {
  if (tx.commit) {
    tx.commit();
  }
}
function createDatabase(channelName) {
  var IndexedDB = getIdb();
  var dbName = DB_PREFIX + channelName;
  var openRequest = IndexedDB.open(dbName);
  openRequest.onupgradeneeded = function(ev) {
    var db = ev.target.result;
    db.createObjectStore(OBJECT_STORE_ID, {
      keyPath: "id",
      autoIncrement: true
    });
  };
  return new Promise(function(res, rej) {
    openRequest.onerror = function(ev) {
      return rej(ev);
    };
    openRequest.onsuccess = function() {
      res(openRequest.result);
    };
  });
}
function writeMessage(db, readerUuid, messageJson) {
  var time = Date.now();
  var writeObject = {
    uuid: readerUuid,
    time,
    data: messageJson
  };
  var tx = db.transaction([OBJECT_STORE_ID], "readwrite", TRANSACTION_SETTINGS);
  return new Promise(function(res, rej) {
    tx.oncomplete = function() {
      return res();
    };
    tx.onerror = function(ev) {
      return rej(ev);
    };
    var objectStore = tx.objectStore(OBJECT_STORE_ID);
    objectStore.add(writeObject);
    commitIndexedDBTransaction(tx);
  });
}
function getMessagesHigherThan(db, lastCursorId) {
  var tx = db.transaction(OBJECT_STORE_ID, "readonly", TRANSACTION_SETTINGS);
  var objectStore = tx.objectStore(OBJECT_STORE_ID);
  var ret = [];
  var keyRangeValue = IDBKeyRange.bound(lastCursorId + 1, Infinity);
  if (objectStore.getAll) {
    var getAllRequest = objectStore.getAll(keyRangeValue);
    return new Promise(function(res, rej) {
      getAllRequest.onerror = function(err) {
        return rej(err);
      };
      getAllRequest.onsuccess = function(e) {
        res(e.target.result);
      };
    });
  }
  function openCursor() {
    try {
      keyRangeValue = IDBKeyRange.bound(lastCursorId + 1, Infinity);
      return objectStore.openCursor(keyRangeValue);
    } catch (e) {
      return objectStore.openCursor();
    }
  }
  return new Promise(function(res, rej) {
    var openCursorRequest = openCursor();
    openCursorRequest.onerror = function(err) {
      return rej(err);
    };
    openCursorRequest.onsuccess = function(ev) {
      var cursor = ev.target.result;
      if (cursor) {
        if (cursor.value.id < lastCursorId + 1) {
          cursor["continue"](lastCursorId + 1);
        } else {
          ret.push(cursor.value);
          cursor["continue"]();
        }
      } else {
        commitIndexedDBTransaction(tx);
        res(ret);
      }
    };
  });
}
function removeMessagesById(channelState, ids) {
  if (channelState.closed) {
    return Promise.resolve([]);
  }
  var tx = channelState.db.transaction(OBJECT_STORE_ID, "readwrite", TRANSACTION_SETTINGS);
  var objectStore = tx.objectStore(OBJECT_STORE_ID);
  return Promise.all(ids.map(function(id) {
    var deleteRequest = objectStore["delete"](id);
    return new Promise(function(res) {
      deleteRequest.onsuccess = function() {
        return res();
      };
    });
  }));
}
function getOldMessages(db, ttl) {
  var olderThen = Date.now() - ttl;
  var tx = db.transaction(OBJECT_STORE_ID, "readonly", TRANSACTION_SETTINGS);
  var objectStore = tx.objectStore(OBJECT_STORE_ID);
  var ret = [];
  return new Promise(function(res) {
    objectStore.openCursor().onsuccess = function(ev) {
      var cursor = ev.target.result;
      if (cursor) {
        var msgObk = cursor.value;
        if (msgObk.time < olderThen) {
          ret.push(msgObk);
          cursor["continue"]();
        } else {
          commitIndexedDBTransaction(tx);
          res(ret);
        }
      } else {
        res(ret);
      }
    };
  });
}
function cleanOldMessages(channelState) {
  return getOldMessages(channelState.db, channelState.options.idb.ttl).then(function(tooOld) {
    return removeMessagesById(channelState, tooOld.map(function(msg) {
      return msg.id;
    }));
  });
}
function create2(channelName, options) {
  options = fillOptionsWithDefaults(options);
  return createDatabase(channelName).then(function(db) {
    var state = {
      closed: false,
      lastCursorId: 0,
      channelName,
      options,
      uuid: randomToken(),
      /**
       * emittedMessagesIds
       * contains all messages that have been emitted before
       * @type {ObliviousSet}
       */
      eMIs: new ObliviousSet(options.idb.ttl * 2),
      // ensures we do not read messages in parallel
      writeBlockPromise: PROMISE_RESOLVED_VOID,
      messagesCallback: null,
      readQueuePromises: [],
      db
    };
    db.onclose = function() {
      state.closed = true;
      if (options.idb.onclose) options.idb.onclose();
    };
    _readLoop(state);
    return state;
  });
}
function _readLoop(state) {
  if (state.closed) return;
  readNewMessages(state).then(function() {
    return sleep(state.options.idb.fallbackInterval);
  }).then(function() {
    return _readLoop(state);
  });
}
function _filterMessage(msgObj, state) {
  if (msgObj.uuid === state.uuid) return false;
  if (state.eMIs.has(msgObj.id)) return false;
  if (msgObj.data.time < state.messagesCallbackTime) return false;
  return true;
}
function readNewMessages(state) {
  if (state.closed) return PROMISE_RESOLVED_VOID;
  if (!state.messagesCallback) return PROMISE_RESOLVED_VOID;
  return getMessagesHigherThan(state.db, state.lastCursorId).then(function(newerMessages) {
    var useMessages = newerMessages.filter(function(msgObj) {
      return !!msgObj;
    }).map(function(msgObj) {
      if (msgObj.id > state.lastCursorId) {
        state.lastCursorId = msgObj.id;
      }
      return msgObj;
    }).filter(function(msgObj) {
      return _filterMessage(msgObj, state);
    }).sort(function(msgObjA, msgObjB) {
      return msgObjA.time - msgObjB.time;
    });
    useMessages.forEach(function(msgObj) {
      if (state.messagesCallback) {
        state.eMIs.add(msgObj.id);
        state.messagesCallback(msgObj.data);
      }
    });
    return PROMISE_RESOLVED_VOID;
  });
}
function close2(channelState) {
  channelState.closed = true;
  channelState.db.close();
}
function postMessage2(channelState, messageJson) {
  channelState.writeBlockPromise = channelState.writeBlockPromise.then(function() {
    return writeMessage(channelState.db, channelState.uuid, messageJson);
  }).then(function() {
    if (randomInt(0, 10) === 0) {
      cleanOldMessages(channelState);
    }
  });
  return channelState.writeBlockPromise;
}
function onMessage2(channelState, fn, time) {
  channelState.messagesCallbackTime = time;
  channelState.messagesCallback = fn;
  readNewMessages(channelState);
}
function canBeUsed2() {
  return !!getIdb();
}
function averageResponseTime2(options) {
  return options.idb.fallbackInterval * 2;
}
var IndexedDBMethod = {
  create: create2,
  close: close2,
  onMessage: onMessage2,
  postMessage: postMessage2,
  canBeUsed: canBeUsed2,
  type: type2,
  averageResponseTime: averageResponseTime2,
  microSeconds: microSeconds3
};

// node_modules/broadcast-channel/dist/esbrowser/methods/localstorage.js
var microSeconds4 = microSeconds;
var KEY_PREFIX = "pubkey.broadcastChannel-";
var type3 = "localstorage";
function getLocalStorage() {
  var localStorage;
  if (typeof window === "undefined") return null;
  try {
    localStorage = window.localStorage;
    localStorage = window["ie8-eventlistener/storage"] || window.localStorage;
  } catch (e) {
  }
  return localStorage;
}
function storageKey(channelName) {
  return KEY_PREFIX + channelName;
}
function postMessage3(channelState, messageJson) {
  return new Promise(function(res) {
    sleep().then(function() {
      var key = storageKey(channelState.channelName);
      var writeObj = {
        token: randomToken(),
        time: Date.now(),
        data: messageJson,
        uuid: channelState.uuid
      };
      var value = JSON.stringify(writeObj);
      getLocalStorage().setItem(key, value);
      var ev = document.createEvent("Event");
      ev.initEvent("storage", true, true);
      ev.key = key;
      ev.newValue = value;
      window.dispatchEvent(ev);
      res();
    });
  });
}
function addStorageEventListener(channelName, fn) {
  var key = storageKey(channelName);
  var listener = function listener2(ev) {
    if (ev.key === key) {
      fn(JSON.parse(ev.newValue));
    }
  };
  window.addEventListener("storage", listener);
  return listener;
}
function removeStorageEventListener(listener) {
  window.removeEventListener("storage", listener);
}
function create3(channelName, options) {
  options = fillOptionsWithDefaults(options);
  if (!canBeUsed3()) {
    throw new Error("BroadcastChannel: localstorage cannot be used");
  }
  var uuid = randomToken();
  var eMIs = new ObliviousSet(options.localstorage.removeTimeout);
  var state = {
    channelName,
    uuid,
    eMIs
    // emittedMessagesIds
  };
  state.listener = addStorageEventListener(channelName, function(msgObj) {
    if (!state.messagesCallback) return;
    if (msgObj.uuid === uuid) return;
    if (!msgObj.token || eMIs.has(msgObj.token)) return;
    if (msgObj.data.time && msgObj.data.time < state.messagesCallbackTime) return;
    eMIs.add(msgObj.token);
    state.messagesCallback(msgObj.data);
  });
  return state;
}
function close3(channelState) {
  removeStorageEventListener(channelState.listener);
}
function onMessage3(channelState, fn, time) {
  channelState.messagesCallbackTime = time;
  channelState.messagesCallback = fn;
}
function canBeUsed3() {
  var ls = getLocalStorage();
  if (!ls) return false;
  try {
    var key = "__broadcastchannel_check";
    ls.setItem(key, "works");
    ls.removeItem(key);
  } catch (e) {
    return false;
  }
  return true;
}
function averageResponseTime3() {
  var defaultTime = 120;
  var userAgent = navigator.userAgent.toLowerCase();
  if (userAgent.includes("safari") && !userAgent.includes("chrome")) {
    return defaultTime * 2;
  }
  return defaultTime;
}
var LocalstorageMethod = {
  create: create3,
  close: close3,
  onMessage: onMessage3,
  postMessage: postMessage3,
  canBeUsed: canBeUsed3,
  type: type3,
  averageResponseTime: averageResponseTime3,
  microSeconds: microSeconds4
};

// node_modules/broadcast-channel/dist/esbrowser/methods/simulate.js
var microSeconds5 = microSeconds;
var type4 = "simulate";
var SIMULATE_CHANNELS = /* @__PURE__ */ new Set();
function create4(channelName) {
  var state = {
    time: microSeconds5(),
    name: channelName,
    messagesCallback: null
  };
  SIMULATE_CHANNELS.add(state);
  return state;
}
function close4(channelState) {
  SIMULATE_CHANNELS["delete"](channelState);
}
var SIMULATE_DELAY_TIME = 5;
function postMessage4(channelState, messageJson) {
  return new Promise(function(res) {
    return setTimeout(function() {
      var channelArray = Array.from(SIMULATE_CHANNELS);
      channelArray.forEach(function(channel) {
        if (channel.name === channelState.name && // has same name
        channel !== channelState && // not own channel
        !!channel.messagesCallback && // has subscribers
        channel.time < messageJson.time) {
          channel.messagesCallback(messageJson);
        }
      });
      res();
    }, SIMULATE_DELAY_TIME);
  });
}
function onMessage4(channelState, fn) {
  channelState.messagesCallback = fn;
}
function canBeUsed4() {
  return true;
}
function averageResponseTime4() {
  return SIMULATE_DELAY_TIME;
}
var SimulateMethod = {
  create: create4,
  close: close4,
  onMessage: onMessage4,
  postMessage: postMessage4,
  canBeUsed: canBeUsed4,
  type: type4,
  averageResponseTime: averageResponseTime4,
  microSeconds: microSeconds5
};

// node_modules/broadcast-channel/dist/esbrowser/method-chooser.js
var METHODS = [
  NativeMethod,
  // fastest
  IndexedDBMethod,
  LocalstorageMethod
];
function chooseMethod(options) {
  var chooseMethods = [].concat(options.methods, METHODS).filter(Boolean);
  if (options.type) {
    if (options.type === "simulate") {
      return SimulateMethod;
    }
    var ret = chooseMethods.find(function(m) {
      return m.type === options.type;
    });
    if (!ret) throw new Error("method-type " + options.type + " not found");
    else return ret;
  }
  if (!options.webWorkerSupport) {
    chooseMethods = chooseMethods.filter(function(m) {
      return m.type !== "idb";
    });
  }
  var useMethod = chooseMethods.find(function(method) {
    return method.canBeUsed();
  });
  if (!useMethod) {
    throw new Error("No usable method found in " + JSON.stringify(METHODS.map(function(m) {
      return m.type;
    })));
  } else {
    return useMethod;
  }
}

// node_modules/broadcast-channel/dist/esbrowser/broadcast-channel.js
var OPEN_BROADCAST_CHANNELS = /* @__PURE__ */ new Set();
var lastId = 0;
var BroadcastChannel2 = function BroadcastChannel3(name, options) {
  this.id = lastId++;
  OPEN_BROADCAST_CHANNELS.add(this);
  this.name = name;
  if (ENFORCED_OPTIONS) {
    options = ENFORCED_OPTIONS;
  }
  this.options = fillOptionsWithDefaults(options);
  this.method = chooseMethod(this.options);
  this._iL = false;
  this._onML = null;
  this._addEL = {
    message: [],
    internal: []
  };
  this._uMP = /* @__PURE__ */ new Set();
  this._befC = [];
  this._prepP = null;
  _prepareChannel(this);
};
BroadcastChannel2._pubkey = true;
var ENFORCED_OPTIONS;
BroadcastChannel2.prototype = {
  postMessage: function postMessage5(msg) {
    if (this.closed) {
      throw new Error("BroadcastChannel.postMessage(): Cannot post message after channel has closed " + /**
       * In the past when this error appeared, it was really hard to debug.
       * So now we log the msg together with the error so it at least
       * gives some clue about where in your application this happens.
       */
      JSON.stringify(msg));
    }
    return _post(this, "message", msg);
  },
  postInternal: function postInternal(msg) {
    return _post(this, "internal", msg);
  },
  set onmessage(fn) {
    var time = this.method.microSeconds();
    var listenObj = {
      time,
      fn
    };
    _removeListenerObject(this, "message", this._onML);
    if (fn && typeof fn === "function") {
      this._onML = listenObj;
      _addListenerObject(this, "message", listenObj);
    } else {
      this._onML = null;
    }
  },
  addEventListener: function addEventListener(type5, fn) {
    var time = this.method.microSeconds();
    var listenObj = {
      time,
      fn
    };
    _addListenerObject(this, type5, listenObj);
  },
  removeEventListener: function removeEventListener(type5, fn) {
    var obj = this._addEL[type5].find(function(obj2) {
      return obj2.fn === fn;
    });
    _removeListenerObject(this, type5, obj);
  },
  close: function close5() {
    var _this = this;
    if (this.closed) {
      return;
    }
    OPEN_BROADCAST_CHANNELS["delete"](this);
    this.closed = true;
    var awaitPrepare = this._prepP ? this._prepP : PROMISE_RESOLVED_VOID;
    this._onML = null;
    this._addEL.message = [];
    return awaitPrepare.then(function() {
      return Promise.all(Array.from(_this._uMP));
    }).then(function() {
      return Promise.all(_this._befC.map(function(fn) {
        return fn();
      }));
    }).then(function() {
      return _this.method.close(_this._state);
    });
  },
  get type() {
    return this.method.type;
  },
  get isClosed() {
    return this.closed;
  }
};
function _post(broadcastChannel, type5, msg) {
  var time = broadcastChannel.method.microSeconds();
  var msgObj = {
    time,
    type: type5,
    data: msg
  };
  var awaitPrepare = broadcastChannel._prepP ? broadcastChannel._prepP : PROMISE_RESOLVED_VOID;
  return awaitPrepare.then(function() {
    var sendPromise = broadcastChannel.method.postMessage(broadcastChannel._state, msgObj);
    broadcastChannel._uMP.add(sendPromise);
    sendPromise["catch"]().then(function() {
      return broadcastChannel._uMP["delete"](sendPromise);
    });
    return sendPromise;
  });
}
function _prepareChannel(channel) {
  var maybePromise = channel.method.create(channel.name, channel.options);
  if (isPromise(maybePromise)) {
    channel._prepP = maybePromise;
    maybePromise.then(function(s) {
      channel._state = s;
    });
  } else {
    channel._state = maybePromise;
  }
}
function _hasMessageListeners(channel) {
  if (channel._addEL.message.length > 0) return true;
  if (channel._addEL.internal.length > 0) return true;
  return false;
}
function _addListenerObject(channel, type5, obj) {
  channel._addEL[type5].push(obj);
  _startListening(channel);
}
function _removeListenerObject(channel, type5, obj) {
  channel._addEL[type5] = channel._addEL[type5].filter(function(o) {
    return o !== obj;
  });
  _stopListening(channel);
}
function _startListening(channel) {
  if (!channel._iL && _hasMessageListeners(channel)) {
    var listenerFn = function listenerFn2(msgObj) {
      channel._addEL[msgObj.type].forEach(function(listenerObject) {
        if (msgObj.time >= listenerObject.time) {
          listenerObject.fn(msgObj.data);
        }
      });
    };
    var time = channel.method.microSeconds();
    if (channel._prepP) {
      channel._prepP.then(function() {
        channel._iL = true;
        channel.method.onMessage(channel._state, listenerFn, time);
      });
    } else {
      channel._iL = true;
      channel.method.onMessage(channel._state, listenerFn, time);
    }
  }
}
function _stopListening(channel) {
  if (channel._iL && !_hasMessageListeners(channel)) {
    channel._iL = false;
    var time = channel.method.microSeconds();
    channel.method.onMessage(channel._state, null, time);
  }
}

// node_modules/unload/dist/es/browser.js
function addBrowser(fn) {
  if (typeof WorkerGlobalScope === "function" && self instanceof WorkerGlobalScope) {
    var oldClose = self.close.bind(self);
    self.close = function() {
      fn();
      return oldClose();
    };
  } else {
    if (typeof window.addEventListener !== "function") {
      return;
    }
    window.addEventListener("beforeunload", function() {
      fn();
    }, true);
    window.addEventListener("unload", function() {
      fn();
    }, true);
  }
}

// node_modules/unload/dist/es/node.js
function addNode(fn) {
  process.on("exit", function() {
    return fn();
  });
  process.on("beforeExit", function() {
    return fn().then(function() {
      return process.exit();
    });
  });
  process.on("SIGINT", function() {
    return fn().then(function() {
      return process.exit();
    });
  });
  process.on("uncaughtException", function(err) {
    return fn().then(function() {
      console.trace(err);
      process.exit(101);
    });
  });
}

// node_modules/unload/dist/es/index.js
var isNode = Object.prototype.toString.call(typeof process !== "undefined" ? process : 0) === "[object process]";
var USE_METHOD = isNode ? addNode : addBrowser;
var LISTENERS = /* @__PURE__ */ new Set();
var startedListening = false;
function startListening() {
  if (startedListening) {
    return;
  }
  startedListening = true;
  USE_METHOD(runAll);
}
function add(fn) {
  startListening();
  if (typeof fn !== "function") {
    throw new Error("Listener is no function");
  }
  LISTENERS.add(fn);
  var addReturn = {
    remove: function remove() {
      return LISTENERS["delete"](fn);
    },
    run: function run() {
      LISTENERS["delete"](fn);
      return fn();
    }
  };
  return addReturn;
}
function runAll() {
  var promises = [];
  LISTENERS.forEach(function(fn) {
    promises.push(fn());
    LISTENERS["delete"](fn);
  });
  return Promise.all(promises);
}

// node_modules/broadcast-channel/dist/esbrowser/leader-election-util.js
function sendLeaderMessage(leaderElector, action) {
  var msgJson = {
    context: "leader",
    action,
    token: leaderElector.token
  };
  return leaderElector.broadcastChannel.postInternal(msgJson);
}
function beLeader(leaderElector) {
  leaderElector.isLeader = true;
  leaderElector._hasLeader = true;
  var unloadFn = add(function() {
    return leaderElector.die();
  });
  leaderElector._unl.push(unloadFn);
  var isLeaderListener = function isLeaderListener2(msg) {
    if (msg.context === "leader" && msg.action === "apply") {
      sendLeaderMessage(leaderElector, "tell");
    }
    if (msg.context === "leader" && msg.action === "tell" && !leaderElector._dpLC) {
      leaderElector._dpLC = true;
      leaderElector._dpL();
      sendLeaderMessage(leaderElector, "tell");
    }
  };
  leaderElector.broadcastChannel.addEventListener("internal", isLeaderListener);
  leaderElector._lstns.push(isLeaderListener);
  return sendLeaderMessage(leaderElector, "tell");
}

// node_modules/broadcast-channel/dist/esbrowser/leader-election-web-lock.js
var LeaderElectionWebLock = function LeaderElectionWebLock2(broadcastChannel, options) {
  var _this = this;
  this.broadcastChannel = broadcastChannel;
  broadcastChannel._befC.push(function() {
    return _this.die();
  });
  this._options = options;
  this.isLeader = false;
  this.isDead = false;
  this.token = randomToken();
  this._lstns = [];
  this._unl = [];
  this._dpL = function() {
  };
  this._dpLC = false;
  this._wKMC = {};
  this.lN = "pubkey-bc||" + broadcastChannel.method.type + "||" + broadcastChannel.name;
};
LeaderElectionWebLock.prototype = {
  hasLeader: function hasLeader() {
    var _this2 = this;
    return navigator.locks.query().then(function(locks) {
      var relevantLocks = locks.held ? locks.held.filter(function(lock) {
        return lock.name === _this2.lN;
      }) : [];
      if (relevantLocks && relevantLocks.length > 0) {
        return true;
      } else {
        return false;
      }
    });
  },
  awaitLeadership: function awaitLeadership() {
    var _this3 = this;
    if (!this._wLMP) {
      this._wKMC.c = new AbortController();
      var returnPromise = new Promise(function(res, rej) {
        _this3._wKMC.res = res;
        _this3._wKMC.rej = rej;
      });
      this._wLMP = new Promise(function(res) {
        navigator.locks.request(_this3.lN, {
          signal: _this3._wKMC.c.signal
        }, function() {
          _this3._wKMC.c = void 0;
          beLeader(_this3);
          res();
          return returnPromise;
        })["catch"](function() {
        });
      });
    }
    return this._wLMP;
  },
  set onduplicate(_fn) {
  },
  die: function die() {
    var _this4 = this;
    this._lstns.forEach(function(listener) {
      return _this4.broadcastChannel.removeEventListener("internal", listener);
    });
    this._lstns = [];
    this._unl.forEach(function(uFn) {
      return uFn.remove();
    });
    this._unl = [];
    if (this.isLeader) {
      this.isLeader = false;
    }
    this.isDead = true;
    if (this._wKMC.res) {
      this._wKMC.res();
    }
    if (this._wKMC.c) {
      this._wKMC.c.abort("LeaderElectionWebLock.die() called");
    }
    return sendLeaderMessage(this, "death");
  }
};

// node_modules/broadcast-channel/dist/esbrowser/leader-election.js
var LeaderElection = function LeaderElection2(broadcastChannel, options) {
  var _this = this;
  this.broadcastChannel = broadcastChannel;
  this._options = options;
  this.isLeader = false;
  this._hasLeader = false;
  this.isDead = false;
  this.token = randomToken();
  this._aplQ = PROMISE_RESOLVED_VOID;
  this._aplQC = 0;
  this._unl = [];
  this._lstns = [];
  this._dpL = function() {
  };
  this._dpLC = false;
  var hasLeaderListener = function hasLeaderListener2(msg) {
    if (msg.context === "leader") {
      if (msg.action === "death") {
        _this._hasLeader = false;
      }
      if (msg.action === "tell") {
        _this._hasLeader = true;
      }
    }
  };
  this.broadcastChannel.addEventListener("internal", hasLeaderListener);
  this._lstns.push(hasLeaderListener);
};
LeaderElection.prototype = {
  hasLeader: function hasLeader2() {
    return Promise.resolve(this._hasLeader);
  },
  /**
   * Returns true if the instance is leader,
   * false if not.
   * @async
   */
  applyOnce: function applyOnce(isFromFallbackInterval) {
    var _this2 = this;
    if (this.isLeader) {
      return sleep(0, true);
    }
    if (this.isDead) {
      return sleep(0, false);
    }
    if (this._aplQC > 1) {
      return this._aplQ;
    }
    var applyRun = function applyRun2() {
      if (_this2.isLeader) {
        return PROMISE_RESOLVED_TRUE;
      }
      var stopCriteria = false;
      var stopCriteriaPromiseResolve;
      var stopCriteriaPromise = new Promise(function(res) {
        stopCriteriaPromiseResolve = function stopCriteriaPromiseResolve2() {
          stopCriteria = true;
          res();
        };
      });
      var handleMessage = function handleMessage2(msg) {
        if (msg.context === "leader" && msg.token != _this2.token) {
          if (msg.action === "apply") {
            if (msg.token > _this2.token) {
              stopCriteriaPromiseResolve();
            }
          }
          if (msg.action === "tell") {
            stopCriteriaPromiseResolve();
            _this2._hasLeader = true;
          }
        }
      };
      _this2.broadcastChannel.addEventListener("internal", handleMessage);
      var waitForAnswerTime = isFromFallbackInterval ? _this2._options.responseTime * 4 : _this2._options.responseTime;
      return sendLeaderMessage(_this2, "apply").then(function() {
        return Promise.race([sleep(waitForAnswerTime), stopCriteriaPromise.then(function() {
          return Promise.reject(new Error());
        })]);
      }).then(function() {
        return sendLeaderMessage(_this2, "apply");
      }).then(function() {
        return Promise.race([sleep(waitForAnswerTime), stopCriteriaPromise.then(function() {
          return Promise.reject(new Error());
        })]);
      })["catch"](function() {
      }).then(function() {
        _this2.broadcastChannel.removeEventListener("internal", handleMessage);
        if (!stopCriteria) {
          return beLeader(_this2).then(function() {
            return true;
          });
        } else {
          return false;
        }
      });
    };
    this._aplQC = this._aplQC + 1;
    this._aplQ = this._aplQ.then(function() {
      return applyRun();
    }).then(function() {
      _this2._aplQC = _this2._aplQC - 1;
    });
    return this._aplQ.then(function() {
      return _this2.isLeader;
    });
  },
  awaitLeadership: function awaitLeadership2() {
    if (
      /* _awaitLeadershipPromise */
      !this._aLP
    ) {
      this._aLP = _awaitLeadershipOnce(this);
    }
    return this._aLP;
  },
  set onduplicate(fn) {
    this._dpL = fn;
  },
  die: function die2() {
    var _this3 = this;
    this._lstns.forEach(function(listener) {
      return _this3.broadcastChannel.removeEventListener("internal", listener);
    });
    this._lstns = [];
    this._unl.forEach(function(uFn) {
      return uFn.remove();
    });
    this._unl = [];
    if (this.isLeader) {
      this._hasLeader = false;
      this.isLeader = false;
    }
    this.isDead = true;
    return sendLeaderMessage(this, "death");
  }
};
function _awaitLeadershipOnce(leaderElector) {
  if (leaderElector.isLeader) {
    return PROMISE_RESOLVED_VOID;
  }
  return new Promise(function(res) {
    var resolved = false;
    function finish() {
      if (resolved) {
        return;
      }
      resolved = true;
      leaderElector.broadcastChannel.removeEventListener("internal", whenDeathListener);
      res(true);
    }
    leaderElector.applyOnce().then(function() {
      if (leaderElector.isLeader) {
        finish();
      }
    });
    var _tryOnFallBack = function tryOnFallBack() {
      return sleep(leaderElector._options.fallbackInterval).then(function() {
        if (leaderElector.isDead || resolved) {
          return;
        }
        if (leaderElector.isLeader) {
          finish();
        } else {
          return leaderElector.applyOnce(true).then(function() {
            if (leaderElector.isLeader) {
              finish();
            } else {
              _tryOnFallBack();
            }
          });
        }
      });
    };
    _tryOnFallBack();
    var whenDeathListener = function whenDeathListener2(msg) {
      if (msg.context === "leader" && msg.action === "death") {
        leaderElector._hasLeader = false;
        leaderElector.applyOnce().then(function() {
          if (leaderElector.isLeader) {
            finish();
          }
        });
      }
    };
    leaderElector.broadcastChannel.addEventListener("internal", whenDeathListener);
    leaderElector._lstns.push(whenDeathListener);
  });
}
function fillOptionsWithDefaults2(options, channel) {
  if (!options) options = {};
  options = JSON.parse(JSON.stringify(options));
  if (!options.fallbackInterval) {
    options.fallbackInterval = 3e3;
  }
  if (!options.responseTime) {
    options.responseTime = channel.method.averageResponseTime(channel.options);
  }
  return options;
}
function createLeaderElection(channel, options) {
  if (channel._leaderElector) {
    throw new Error("BroadcastChannel already has a leader-elector");
  }
  options = fillOptionsWithDefaults2(options, channel);
  var elector = supportsWebLockAPI() ? new LeaderElectionWebLock(channel, options) : new LeaderElection(channel, options);
  channel._befC.push(function() {
    return elector.die();
  });
  channel._leaderElector = elector;
  return elector;
}

// node_modules/rxdb/dist/esm/rx-storage-multiinstance.js
var BROADCAST_CHANNEL_BY_TOKEN = /* @__PURE__ */ new Map();
function getBroadcastChannelReference(storageName, databaseInstanceToken, databaseName, refObject) {
  var state = BROADCAST_CHANNEL_BY_TOKEN.get(databaseInstanceToken);
  if (!state) {
    state = {
      /**
       * We have to use the databaseName instead of the databaseInstanceToken
       * in the BroadcastChannel name because different instances must end with the same
       * channel name to be able to broadcast messages between each other.
       */
      bc: new BroadcastChannel2(["RxDB:", storageName, databaseName].join("|")),
      refs: /* @__PURE__ */ new Set()
    };
    BROADCAST_CHANNEL_BY_TOKEN.set(databaseInstanceToken, state);
  }
  state.refs.add(refObject);
  return state.bc;
}
function removeBroadcastChannelReference(databaseInstanceToken, refObject) {
  var state = BROADCAST_CHANNEL_BY_TOKEN.get(databaseInstanceToken);
  if (!state) {
    return;
  }
  state.refs.delete(refObject);
  if (state.refs.size === 0) {
    BROADCAST_CHANNEL_BY_TOKEN.delete(databaseInstanceToken);
    return state.bc.close();
  }
}
function addRxStorageMultiInstanceSupport(storageName, instanceCreationParams, instance, providedBroadcastChannel) {
  if (!instanceCreationParams.multiInstance) {
    return;
  }
  var broadcastChannel = providedBroadcastChannel ? providedBroadcastChannel : getBroadcastChannelReference(storageName, instanceCreationParams.databaseInstanceToken, instance.databaseName, instance);
  var changesFromOtherInstances$ = new Subject();
  var eventListener = (msg) => {
    if (msg.storageName === storageName && msg.databaseName === instanceCreationParams.databaseName && msg.collectionName === instanceCreationParams.collectionName && msg.version === instanceCreationParams.schema.version) {
      changesFromOtherInstances$.next(msg.eventBulk);
    }
  };
  broadcastChannel.addEventListener("message", eventListener);
  var oldChangestream$ = instance.changeStream();
  var closed = false;
  var sub = oldChangestream$.subscribe((eventBulk) => {
    if (closed) {
      return;
    }
    broadcastChannel.postMessage({
      storageName,
      databaseName: instanceCreationParams.databaseName,
      collectionName: instanceCreationParams.collectionName,
      version: instanceCreationParams.schema.version,
      eventBulk
    });
  });
  instance.changeStream = function() {
    return changesFromOtherInstances$.asObservable().pipe(mergeWith(oldChangestream$));
  };
  var oldClose = instance.close.bind(instance);
  instance.close = function() {
    return __async(this, null, function* () {
      closed = true;
      sub.unsubscribe();
      broadcastChannel.removeEventListener("message", eventListener);
      if (!providedBroadcastChannel) {
        yield removeBroadcastChannelReference(instanceCreationParams.databaseInstanceToken, instance);
      }
      return oldClose();
    });
  };
  var oldRemove = instance.remove.bind(instance);
  instance.remove = function() {
    return __async(this, null, function* () {
      closed = true;
      sub.unsubscribe();
      broadcastChannel.removeEventListener("message", eventListener);
      if (!providedBroadcastChannel) {
        yield removeBroadcastChannelReference(instanceCreationParams.databaseInstanceToken, instance);
      }
      return oldRemove();
    });
  };
}

export {
  createLeaderElection,
  BROADCAST_CHANNEL_BY_TOKEN,
  getBroadcastChannelReference,
  removeBroadcastChannelReference,
  addRxStorageMultiInstanceSupport
};
//# sourceMappingURL=chunk-OTB4SRCL.js.map
