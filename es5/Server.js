"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "Event", {
  enumerable: true,
  get: function get() {
    return _Server2.Event;
  }
});
exports.default = exports.Link = void 0;

require("should");

var _each2 = _interopRequireDefault(require("lodash/each"));

var _includes2 = _interopRequireDefault(require("lodash/includes"));

var _clone2 = _interopRequireDefault(require("lodash/clone"));

var _size2 = _interopRequireDefault(require("lodash/size"));

var _uniqueId2 = _interopRequireDefault(require("lodash/uniqueId"));

var _remutable = _interopRequireDefault(require("remutable"));

var _lifespan = _interopRequireDefault(require("lifespan"));

var _nexusEvents = _interopRequireDefault(require("nexus-events"));

var _Client = _interopRequireDefault(require("./Client"));

var _Server2 = require("./Server.Event");

var _bluebird = _interopRequireDefault(require("bluebird"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var _Server; // abstract


var Link =
/*#__PURE__*/
function () {
  function Link() {
    var _this = this;

    _classCallCheck(this, Link);

    if (false) {
      // ensure abstracts
      this.constructor.should.not.be.exactly(Link); // ensure virtual

      this.sendToClient.should.not.be.exactly(Link.prototype.sendToClient);
    }

    this.lifespan = new _lifespan.default(); // will be set by the server; should be called when received client events, to forward them to the server

    this.receiveFromClient = null;
    this.lifespan.onRelease(function () {
      _this.receiveFromClient = null;
    });
  } // virtual
  // should forward the event to the associated client


  _createClass(Link, [{
    key: "sendToClient",
    value: function sendToClient(ev) {
      if (false) {
        ev.should.be.an.instanceOf(_Server.Event);
      }

      throw new TypeError('Virtual method invocation');
    } // will be called by the server

  }, {
    key: "acceptFromServer",
    value: function acceptFromServer(receiveFromClient) {
      if (false) {
        receiveFromClient.should.be.a.Function;
      }

      this.receiveFromClient = receiveFromClient;
    } // will be called by server

  }, {
    key: "receiveFromServer",
    value: function receiveFromServer(ev) {
      if (false) {
        ev.should.be.an.instanceOf(_Server.Event);
      }

      this.sendToClient(ev);
    }
  }]);

  return Link;
}();

exports.Link = Link;

var Server =
/*#__PURE__*/
function (_EventEmitter) {
  _inherits(Server, _EventEmitter);

  function Server(_ref) {
    var _this2;

    var debugPath = _ref.debugPath,
        logStore = _ref.logStore;

    _classCallCheck(this, Server);

    _this2 = _possibleConstructorReturn(this, (Server.__proto__ || Object.getPrototypeOf(Server)).call(this));
    _this2.lifespan = new _lifespan.default();
    _this2._links = {};
    _this2._subscriptions = {};

    _this2.lifespan.onRelease(function () {
      (0, _each2.default)(_this2._links, function (_ref2, linkID) {
        var link = _ref2.link,
            subscriptions = _ref2.subscriptions;
        (0, _each2.default)(subscriptions, function (path) {
          return _this2.unsubscribe(linkID, path);
        });
        link.lifespan.release();
      });
      _this2._links = null;
      _this2._subscriptions = null;
    });

    _this2.debugPath = debugPath;
    _this2.logStore = logStore;
    return _this2;
  }

  _createClass(Server, [{
    key: "dispatchAction",
    value: function dispatchAction(path, params) {
      var _this3 = this;

      return _bluebird.default.try(function () {
        if (false) {
          path.should.be.a.String;
          params.should.be.an.Object;
        }

        if (_this3.logStore && !(0, _includes2.default)(_this3.debugPath, path)) {
          var patchArray = (0, _clone2.default)(_this3.logStore.get('patchArray'));
          patchArray.push({
            path: path,
            params: params,
            type: 'action'
          });

          var logPatch = _this3.logStore.set('patchArray', patchArray).commit();

          var logEv = new Server.Event.Update({
            path: 'logStore',
            patch: logPatch
          });
          (0, _each2.default)(_this3._subscriptions.logStore, function (link) {
            link.receiveFromServer(logEv);
          });
        }

        _this3.emit('action', {
          path: path,
          params: params
        });

        return null;
      });
    }
  }, {
    key: "dispatchUpdate",
    value: function dispatchUpdate(path, patch) {
      if (false) {
        path.should.be.a.String;
        patch.should.be.an.instanceOf(_remutable.default.Patch);
      }

      if (this.logStore && !(0, _includes2.default)(this.debugPath, path)) {
        var patchArray = (0, _clone2.default)(this.logStore.get('patchArray'));
        patchArray.push({
          path: path,
          patch: patch,
          type: 'patch'
        });
        var logPatch = this.logStore.set('patchArray', patchArray).commit();
        var logEv = new Server.Event.Update({
          path: 'logStore',
          patch: logPatch
        });
        (0, _each2.default)(this._subscriptions.logStore, function (link) {
          link.receiveFromServer(logEv);
        });
      }

      if (this._subscriptions[path] !== void 0) {
        var ev = new Server.Event.Update({
          path: path,
          patch: patch
        });
        (0, _each2.default)(this._subscriptions[path], function (link) {
          link.receiveFromServer(ev);
        });
      }

      return this;
    }
  }, {
    key: "subscribe",
    value: function subscribe(linkID, path) {
      if (false) {
        linkID.should.be.a.String;
        path.should.be.a.String;

        this._links.should.have.property(linkID);
      }

      if (this._subscriptions[path] === void 0) {
        this._subscriptions[path] = {};
      }

      this._subscriptions[path][linkID] = this._links[linkID].link;

      if (this._links[linkID].subscriptions[path] === void 0) {
        this._links[linkID].subscriptions[path] = path;
      }

      return this;
    }
  }, {
    key: "unsubscribe",
    value: function unsubscribe(linkID, path) {
      if (false) {
        linkID.should.be.a.String;
        path.should.be.a.String;

        this._links.should.have.property(linkID);

        this._links[linkID].subscriptions.should.have.property(path);

        this._subscriptions.should.have.property(path);

        this._subscriptions[path].should.have.property(linkID);
      }

      delete this._links[linkID].subscriptions[path];
      delete this._subscriptions[path][linkID];

      if ((0, _size2.default)(this._subscriptions[path]) === 0) {
        delete this._subscriptions[path];
      }
    }
  }, {
    key: "acceptLink",
    value: function acceptLink(link) {
      var _this4 = this;

      if (false) {
        link.should.be.an.instanceOf(Link);
      }

      var linkID = (0, _uniqueId2.default)();
      this._links[linkID] = {
        link: link,
        subscriptions: {}
      };
      link.acceptFromServer(function (ev) {
        return _this4.receiveFromLink(linkID, ev);
      });
      link.lifespan.onRelease(function () {
        (0, _each2.default)(_this4._links[linkID].subscriptions, function (path) {
          return _this4.unsubscribe(linkID, path);
        });
        delete _this4._links[linkID];
      });
    }
  }, {
    key: "receiveFromLink",
    value: function receiveFromLink(linkID, ev) {
      if (false) {
        linkID.should.be.a.String;

        this._links.should.have.property(linkID);

        ev.should.be.an.instanceOf(_Client.default.Event);
      }

      if (ev instanceof _Client.default.Event.Subscribe) {
        return this.subscribe(linkID, ev.path);
      }

      if (ev instanceof _Client.default.Event.Unsubscribe) {
        return this.unsubscribe(linkID, ev.path);
      }

      if (ev instanceof _Client.default.Event.Action) {
        return this.dispatchAction(ev.path, ev.params);
      }

      if (false) {
        throw new TypeError("Unknown Client.Event: ".concat(ev));
      }
    }
  }]);

  return Server;
}(_nexusEvents.default);

_Server = Server;
Object.assign(Server, {
  Event: _Server2.Event,
  Link: Link
});
var _default = Server;
exports.default = _default;