"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "Event", {
  enumerable: true,
  get: function get() {
    return _Client.Event;
  }
});
exports.default = void 0;

require("should");

var _each2 = _interopRequireDefault(require("lodash/each"));

var _isNumber2 = _interopRequireDefault(require("lodash/isNumber"));

var _mapValues2 = _interopRequireDefault(require("lodash/mapValues"));

var _immutable = _interopRequireDefault(require("immutable"));

var _remutable = _interopRequireDefault(require("remutable"));

var _lifespan = _interopRequireDefault(require("lifespan"));

var _Store = _interopRequireDefault(require("./Store"));

var _Server = _interopRequireDefault(require("./Server"));

var _Client = require("./Client.Event");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Patch = _remutable.default.Patch;

// abstract
var Client =
/*#__PURE__*/
function () {
  function Client() {
    var _this = this;

    _classCallCheck(this, Client);

    if (false) {
      // ensure abstract
      this.constructor.should.not.be.exactly(Client); // ensure virtual

      this.fetch.should.not.be.exactly(Client.prototype.fetch); // ensure virtual

      this.sendToServer.should.not.be.exactly(Client.prototype.sendToServer);
    }

    this.lifespan = new _lifespan.default();
    this._stores = {};
    this._refetching = {};
    this._injected = null;
    this._prefetched = null;
    this.lifespan.onRelease(function () {
      _this._stores = null;
      _this._refetching = null;
      _this._injected = null;
      _this._prefetched = null;
    });
  } // virtual


  _createClass(Client, [{
    key: "fetch",
    value: function fetch(path, hash) {
      if (false) {
        path.should.be.a.String;
        (hash === null || (0, _isNumber2.default)(hash)).should.be.true;
      }

      throw new TypeError('Virtual method invocation');
    } // virtual

  }, {
    key: "sendToServer",
    value: function sendToServer(ev) {
      if (false) {
        ev.should.be.an.instanceOf(_Client.Event);
      }

      throw new TypeError('Virtual method invocation');
    }
  }, {
    key: "getPrefetched",
    value: function getPrefetched(path) {
      if (false) {
        path.should.be.a.String;
        this.isPrefetching.should.be.true;

        this._prefetched.should.have.property(path);

        this._prefetched[path].promise.isPending().should.be.false;
      }

      return this._prefetched[path].head;
    }
  }, {
    key: "startPrefetching",
    value: function startPrefetching() {
      if (false) {
        this.isPrefetching.should.not.be.true;
      }

      this._prefetched = {};
    }
  }, {
    key: "stopPrefetching",
    value: function stopPrefetching() {
      if (false) {
        this.isPrefetching.should.be.true;
      }

      var prefetched = this._prefetched;
      return (0, _mapValues2.default)(prefetched, function (_ref) {
        var head = _ref.head;
        return head ? head.toJS() : void 0;
      });
    }
  }, {
    key: "prefetch",
    value: function prefetch(path) {
      if (false) {
        path.should.be.a.String;
        this.isPrefetching.should.be.true;
      }

      if (this._prefetched[path] === void 0) {
        var prefetched = {
          promise: null,
          head: null
        };
        prefetched.promise = this.fetch(path, null).then(function (_ref2) {
          var head = _ref2.head;
          return prefetched.head = head;
        }).catch(function () {
          return prefetched.head = null;
        });
        this._prefetched[path] = prefetched;
      }

      return this._prefetched[path];
    }
  }, {
    key: "getInjected",
    value: function getInjected(path) {
      if (false) {
        path.should.be.a.String;
      }

      if (this.isInjecting && this._injected[path] !== void 0) {
        return this._injected[path];
      }

      return null;
    }
  }, {
    key: "startInjecting",
    value: function startInjecting(injected) {
      if (false) {
        this.isInjecting.should.not.be.true;
        injected.should.be.an.Object;
      }

      this._injected = (0, _mapValues2.default)(injected, function (js) {
        return new _immutable.default.Map(js);
      });
    }
  }, {
    key: "stopInjecting",
    value: function stopInjecting() {
      if (false) {
        this.isInjecting.should.be.true;
      }

      this._injected = null;
    }
  }, {
    key: "receiveFromServer",
    value: function receiveFromServer(ev) {
      if (false) {
        ev.should.be.an.instanceOf(_Server.default.Event);
      }

      if (ev instanceof _Server.default.Event.Update) {
        return this._update(ev.path, ev.patch);
      }

      if (ev instanceof _Server.default.Event.Delete) {
        return this._delete(ev.path);
      }

      throw new TypeError("Unknown event: ".concat(ev));
    }
  }, {
    key: "findOrCreateStore",
    value: function findOrCreateStore(path) {
      if (false) {
        path.should.be.a.String;
      }

      if (this._stores[path] === void 0) {
        this.sendToServer(new _Client.Event.Subscribe({
          path: path
        }));
        var engine = new _Store.default.Engine(this.getInjected(path) || void 0);
        this._stores[path] = {
          engine: engine,
          producer: engine.createProducer(),
          // initially we have no pending patches and we are not refetching
          patches: {},
          refetching: false
        };

        this._refetch(path, null);
      }

      return this._stores[path];
    }
  }, {
    key: "deleteStore",
    value: function deleteStore(path) {
      if (false) {
        path.should.be.a.String;

        this._stores.should.have.property(path);

        this._stores[path].consumers.should.be.exactly(0);
      }

      this._stores[path].producer.lifespan.release();

      this._stores[path].engine.lifespan.release();

      this.sendToServer(new _Client.Event.Unsubscribe({
        path: path
      }));
      delete this._stores[path];
    } // returns a Store consumer

  }, {
    key: "getStore",
    value: function getStore(path, lifespan) {
      var _this2 = this;

      if (false) {
        path.should.be.a.String;
        lifespan.should.be.an.instanceOf(_lifespan.default);
      }

      var _findOrCreateStore = this.findOrCreateStore(path),
          engine = _findOrCreateStore.engine;

      var consumer = engine.createConsumer();
      consumer.lifespan.onRelease(function () {
        if (engine.consumers === 0) {
          _this2.deleteStore(path);
        }
      });
      lifespan.onRelease(consumer.lifespan.release);
      return consumer;
    }
  }, {
    key: "dispatchAction",
    value: function dispatchAction(path) {
      var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      if (false) {
        path.should.be.a.String;
        params.should.be.an.Object;
      }

      this.sendToServer(new _Client.Event.Action({
        path: path,
        params: params
      }));
    }
  }, {
    key: "forceResync",
    value: function forceResync() {
      var _this3 = this;

      Object.keys(this._stores).forEach(function (path) {
        var _this3$_stores$path = _this3._stores[path],
            producer = _this3$_stores$path.producer,
            refetching = _this3$_stores$path.refetching;
        var hash = producer.hash;

        if (!refetching) {
          _this3._refetch(path, hash, {
            forceResync: true
          });
        }
      });
      return this;
    }
  }, {
    key: "_update",
    value: function _update(path, patch) {
      if (false) {
        path.should.be.a.String;
        patch.should.be.an.instanceOf(Patch);
      } // dismiss if we are not interested anymore


      if (this._stores[path] === void 0) {
        return null;
      }

      var _stores$path = this._stores[path],
          producer = _stores$path.producer,
          patches = _stores$path.patches,
          refetching = _stores$path.refetching;
      var hash = producer.hash;
      var source = patch.source,
          target = patch.target; // if the patch applies to our current version, apply it now

      if (hash === source) {
        return producer.apply(patch);
      } // we don't have a recent enough version, we need to refetch
      // if we arent already refetching, request a newer version (atleast newer than target)


      if (!refetching) {
        return this._refetch(path, target);
      } // if we are already refetching, store the patch for later


      patches[source] = patch;
    }
  }, {
    key: "_delete",
    value: function _delete(path) {
      if (false) {
        path.should.be.a.String;
      }

      if (this._stores[path] === void 0) {
        return;
      }

      var producer = this._stores[path].producer;
      producer.delete();
    }
  }, {
    key: "_refetch",
    value: function _refetch(path, hash) {
      var _this4 = this;

      var _ref3 = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {},
          _ref3$forceResync = _ref3.forceResync,
          forceResync = _ref3$forceResync === void 0 ? false : _ref3$forceResync;

      if (false) {
        path.should.be.a.String;
        (hash === null || (0, _isNumber2.default)(hash)).should.be.true;

        this._stores.should.have.property(path);
      }

      this._stores[path].refetching = true; // we use the fetch method from the adapter

      return this.fetch(path, hash).then(function (remutable) {
        // if we are not interested anymore, then dismiss
        if (_this4._stores[path] === void 0) {
          return;
        }

        if (false) {
          _this4._stores[path].refetching.should.be.true;
        }

        _this4._stores[path].refetching = false;

        _this4._upgrade(path, remutable, {
          forceResync: forceResync
        });
      });
    }
  }, {
    key: "_upgrade",
    value: function _upgrade(path, next) {
      var _ref4 = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {},
          _ref4$forceResync = _ref4.forceResync,
          forceResync = _ref4$forceResync === void 0 ? false : _ref4$forceResync;

      if (false) {
        path.should.be.a.String;
        (next instanceof _remutable.default || next instanceof _remutable.default.Consumer).should.be.true;
      } // if we are not interested anymore, then dismiss


      if (this._stores[path] === void 0) {
        return;
      }

      var _stores$path2 = this._stores[path],
          engine = _stores$path2.engine,
          producer = _stores$path2.producer,
          patches = _stores$path2.patches;
      var prev = engine.remutable; // if we already have a more recent version and this resync isn't forced

      if (!forceResync && prev.version >= next.version) {
        return;
      } // squash patches to create a single patch


      var squash = Patch.fromDiff(prev, next);

      while (patches[squash.target] !== void 0) {
        squash = Patch.combine(squash, patches[squash.target]);
      }

      var version = squash.to.v; // clean old patches

      (0, _each2.default)(patches, function (_ref5, source) {
        var to = _ref5.to;

        if (to.v <= version) {
          delete patches[source];
        }
      });
      producer.apply(squash);
    }
  }, {
    key: "isPrefetching",
    get: function get() {
      return this._prefetched !== null;
    }
  }, {
    key: "isInjecting",
    get: function get() {
      return this._injected !== null;
    }
  }]);

  return Client;
}();

Object.assign(Client, {
  Event: _Client.Event
});
var _default = Client;
exports.default = _default;