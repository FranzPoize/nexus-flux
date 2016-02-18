'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Link = exports.Event = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

require('should');

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _remutable = require('remutable');

var _remutable2 = _interopRequireDefault(_remutable);

var _lifespan = require('lifespan');

var _lifespan2 = _interopRequireDefault(_lifespan);

var _nexusEvents = require('nexus-events');

var _nexusEvents2 = _interopRequireDefault(_nexusEvents);

var _Client = require('./Client');

var _Client2 = _interopRequireDefault(_Client);

var _Server2 = require('./Server.Event');

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var __DEV__ = process.env.NODE_ENV === 'development';
// we just need this reference for typechecks

var _Server = undefined;

// abstract

var Link = function () {
  function Link() {
    var _this = this;

    _classCallCheck(this, Link);

    if (__DEV__) {
      // ensure abstracts
      this.constructor.should.not.be.exactly(Link);
      // ensure virtual
      this.sendToClient.should.not.be.exactly(Link.prototype.sendToClient);
    }
    this.lifespan = new _lifespan2.default();
    // will be set by the server; should be called when received client events, to forward them to the server
    this.receiveFromClient = null;
    this.lifespan.onRelease(function () {
      _this.receiveFromClient = null;
    });
  }

  // virtual
  // should forward the event to the associated client


  _createClass(Link, [{
    key: 'sendToClient',
    value: function sendToClient(ev) {
      if (__DEV__) {
        ev.should.be.an.instanceOf(_Server.Event);
      }
      throw new TypeError('Virtual method invocation');
    }

    // will be called by the server

  }, {
    key: 'acceptFromServer',
    value: function acceptFromServer(receiveFromClient) {
      if (__DEV__) {
        receiveFromClient.should.be.a.Function;
      }
      this.receiveFromClient = receiveFromClient;
    }

    // will be called by server

  }, {
    key: 'receiveFromServer',
    value: function receiveFromServer(ev) {
      if (__DEV__) {
        ev.should.be.an.instanceOf(_Server.Event);
      }
      this.sendToClient(ev);
    }
  }]);

  return Link;
}();

var Server = function (_EventEmitter) {
  _inherits(Server, _EventEmitter);

  function Server(_ref) {
    var debugPath = _ref.debugPath;
    var logStore = _ref.logStore;

    _classCallCheck(this, Server);

    var _this2 = _possibleConstructorReturn(this, Object.getPrototypeOf(Server).call(this));

    _this2.lifespan = new _lifespan2.default();
    _this2._links = {};
    _this2._subscriptions = {};
    _this2.lifespan.onRelease(function () {
      _lodash2.default.each(_this2._links, function (_ref2, linkID) {
        var link = _ref2.link;
        var subscriptions = _ref2.subscriptions;

        _lodash2.default.each(subscriptions, function (path) {
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
    key: 'dispatchAction',
    value: function dispatchAction(path, params) {
      var _this3 = this;

      return _bluebird2.default.try(function () {
        if (__DEV__) {
          path.should.be.a.String;
          params.should.be.an.Object;
        }
        if (_this3.logStore && !_lodash2.default.contains(_this3.debugPath, path)) {
          (function () {
            var patchArray = _lodash2.default.clone(_this3.logStore.get('patchArray'));
            patchArray.push({
              path: path,
              params: params,
              type: 'action'
            });
            var logPatch = _this3.logStore.set('patchArray', patchArray).commit();
            var logEv = new Server.Event.Update({ path: 'logStore', patch: logPatch });
            _lodash2.default.each(_this3._subscriptions.logStore, function (link) {
              link.receiveFromServer(logEv);
            });
          })();
        }
        _this3.emit('action', { path: path, params: params });
        return null;
      });
    }
  }, {
    key: 'dispatchUpdate',
    value: function dispatchUpdate(path, patch) {
      var _this4 = this;

      if (__DEV__) {
        path.should.be.a.String;
        patch.should.be.an.instanceOf(_remutable2.default.Patch);
      }
      if (this.logStore && !_lodash2.default.contains(this.debugPath, path)) {
        (function () {
          var patchArray = _lodash2.default.clone(_this4.logStore.get('patchArray'));
          patchArray.push({
            path: path,
            patch: patch,
            type: 'patch'
          });
          var logPatch = _this4.logStore.set('patchArray', patchArray).commit();
          var logEv = new Server.Event.Update({ path: 'logStore', patch: logPatch });
          _lodash2.default.each(_this4._subscriptions.logStore, function (link) {
            link.receiveFromServer(logEv);
          });
        })();
      }
      if (this._subscriptions[path] !== void 0) {
        (function () {

          var ev = new Server.Event.Update({ path: path, patch: patch });
          _lodash2.default.each(_this4._subscriptions[path], function (link) {
            link.receiveFromServer(ev);
          });
        })();
      }
      return this;
    }
  }, {
    key: 'subscribe',
    value: function subscribe(linkID, path) {
      if (__DEV__) {
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
    key: 'unsubscribe',
    value: function unsubscribe(linkID, path) {
      if (__DEV__) {
        linkID.should.be.a.String;
        path.should.be.a.String;
        this._links.should.have.property(linkID);
        this._links[linkID].subscriptions.should.have.property(path);
        this._subscriptions.should.have.property(path);
        this._subscriptions[path].should.have.property(linkID);
      }
      delete this._links[linkID].subscriptions[path];
      delete this._subscriptions[path][linkID];
      if (_lodash2.default.size(this._subscriptions[path]) === 0) {
        delete this._subscriptions[path];
      }
    }
  }, {
    key: 'acceptLink',
    value: function acceptLink(link) {
      var _this5 = this;

      if (__DEV__) {
        link.should.be.an.instanceOf(Link);
      }

      var linkID = _lodash2.default.uniqueId();
      this._links[linkID] = {
        link: link,
        subscriptions: {}
      };
      link.acceptFromServer(function (ev) {
        return _this5.receiveFromLink(linkID, ev);
      });
      link.lifespan.onRelease(function () {
        _lodash2.default.each(_this5._links[linkID].subscriptions, function (path) {
          return _this5.unsubscribe(linkID, path);
        });
        delete _this5._links[linkID];
      });
    }
  }, {
    key: 'receiveFromLink',
    value: function receiveFromLink(linkID, ev) {
      if (__DEV__) {
        linkID.should.be.a.String;
        this._links.should.have.property(linkID);
        ev.should.be.an.instanceOf(_Client2.default.Event);
      }
      if (ev instanceof _Client2.default.Event.Subscribe) {
        return this.subscribe(linkID, ev.path);
      }
      if (ev instanceof _Client2.default.Event.Unsubscribe) {
        return this.unsubscribe(linkID, ev.path);
      }
      if (ev instanceof _Client2.default.Event.Action) {
        return this.dispatchAction(ev.path, ev.params);
      }
      if (__DEV__) {
        throw new TypeError('Unknown Client.Event: ' + ev);
      }
    }
  }]);

  return Server;
}(_nexusEvents2.default);

_Server = Server;

_extends(Server, { Event: _Server2.Event, Link: Link });

exports.Event = _Server2.Event;
exports.Link = Link;
exports.default = Server;