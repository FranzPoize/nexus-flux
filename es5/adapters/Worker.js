'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

require('should');

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _2 = require('../');

var _remutable = require('remutable');

var _remutable2 = _interopRequireDefault(_remutable);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var __DEV__ = process.env.NODE_ENV === 'development';
var Link = _2.Server.Link;


// constants for the communication 'protocol'/convention
var FETCH = 'f';
var PUBLISH = 'p';
var EVENT = 'e';

// this is a just a disambiguation salt; this is by no mean a
// cryptosecure password or anything else. its fine to leave it
// plaintext here.
// any malicious script running from the same domain will be able
// to eavesdrop regardless.
var DEFAULT_SALT = '__KqsrQBNHfkTYQ8mWadEDwfKM';

/* jshint browser:true */

var WorkerClient = function (_Client) {
  _inherits(WorkerClient, _Client);

  function WorkerClient(worker) {
    var salt = arguments.length <= 1 || arguments[1] === undefined ? DEFAULT_SALT : arguments[1];

    _classCallCheck(this, WorkerClient);

    if (__DEV__) {
      worker.should.be.an.instanceOf(window.Worker);
      salt.should.be.a.String;
    }

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(WorkerClient).call(this));

    _this._worker = worker;
    _this._salt = salt;
    _this._fetching = {};
    _this._worker.addEventListener('message', _this.receiveFromWorker);
    _this.lifespan.onRelease(function () {
      _lodash2.default.each(_this._fetching, function (_ref) {
        var reject = _ref.reject;
        return reject(new Error('Client released'));
      });
      _this._worker.removeEventListener('message', _this.receiveFromWorker);
    });
    return _this;
  }

  _createClass(WorkerClient, [{
    key: 'fetch',
    value: function fetch(path, hash) {
      var _this2 = this;

      if (this._fetching[path] === void 0) {
        this._fetching[path] = {
          promise: null,
          resolve: null,
          reject: null
        };
        this._fetching[path].promise = new Promise(function (resolve, reject) {
          _this2._fetching[path].resolve = resolve;
          _this2._fetching[path].reject = reject;
        });
        this._worker.postMessage(_defineProperty({}, this._salt, { t: FETCH, j: { hash: hash, path: path } }));
      }
      return this._fetching[path].promise;
    }
  }, {
    key: 'sendToServer',
    value: function sendToServer(ev) {
      if (__DEV__) {
        ev.should.be.an.instanceOf(_2.Client.Event);
      }
      this._worker.postMessage(_defineProperty({}, this._salt, { t: EVENT, js: ev.toJS() }));
    }
  }, {
    key: '_receivePublish',
    value: function _receivePublish(j) {
      var path = j.path;

      if (__DEV__) {
        path.should.be.a.String;
      }
      if (this._fetching[path] !== void 0) {
        if (j === null) {
          this._fetching[path].reject(new Error('Couldn\'t fetch store'));
        } else {
          this._fetching[path].resolve(_remutable2.default.fromJS(j).createConsumer());
        }
        delete this._fetching[path];
      }
      return null;
    }
  }, {
    key: '_receiveEvent',
    value: function _receiveEvent(j) {
      var ev = _2.Server.Event.fromJS(j);
      if (__DEV__) {
        ev.should.be.an.instanceOf(_2.Server.Event);
      }
      return this.receiveFromServer(ev);
    }
  }, {
    key: 'receiveFromWorker',
    value: function receiveFromWorker(message) {
      if (_lodash2.default.isObject(message) && message[this._salt] !== void 0) {
        var _message$_salt = message[this._salt];
        var t = _message$_salt.t;
        var j = _message$_salt.j;

        if (t === PUBLISH) {
          return this._receivePublish(j);
        }
        if (t === EVENT) {
          return this._receiveEvent(j);
        }
        throw new TypeError('Unknown message type: ' + message);
      }
    }
  }]);

  return WorkerClient;
}(_2.Client);
/* jshint browser:false */

/* jshint worker:true */


var WorkerLink = function (_Link) {
  _inherits(WorkerLink, _Link);

  function WorkerLink(self, stores) {
    var salt = arguments.length <= 2 || arguments[2] === undefined ? DEFAULT_SALT : arguments[2];

    _classCallCheck(this, WorkerLink);

    if (__DEV__) {
      self.should.be.an.Object;
      self.postMessage.should.be.a.Function;
      self.addEventListener.should.be.a.Function;
      stores.should.be.an.Object;
      salt.should.be.a.String;
    }

    var _this3 = _possibleConstructorReturn(this, Object.getPrototypeOf(WorkerLink).call(this));

    _this3._self = self;
    _this3._stores = stores;
    _this3._salt = salt;
    _this3._self.addEventListener('message', _this3.receiveFromWorker);
    _this3.lifespan.onRelease(function () {
      _this3._self.removeEventListener('message', _this3.receiveFromWorker);
      _this3._self = null;
      _this3._stores = null;
    });
    return _this3;
  }

  _createClass(WorkerLink, [{
    key: 'sendToClient',
    value: function sendToClient(ev) {
      if (__DEV__) {
        ev.should.be.an.instanceOf(_2.Server.Event);
      }
      this._self.postMessage(_defineProperty({}, this._salt, { t: EVENT, js: ev.toJS() }));
    }
  }, {
    key: '_receivePublish',
    value: function _receivePublish(j) {
      var ev = _2.Client.Event.fromJS(j);
      if (__DEV__) {
        ev.should.be.an.instanceOf(_2.Client.Event);
        return this.receiveFromClient(ev);
      }
      return null;
    }
  }, {
    key: '_receiveFetch',
    value: function _receiveFetch(j) {
      var path = j.path;

      if (this.stores[path] === void 0) {
        return this._self.postMessage(_defineProperty({}, this._salt, { t: PUBLISH, j: null }));
      }
      return this._self.postMessage(_defineProperty({}, this._salt, { t: PUBLISH, j: this.stores[path].toJS() }));
    }
  }, {
    key: 'receiveFromWorker',
    value: function receiveFromWorker(message) {
      if (_lodash2.default.isObject(message) && message[this._salt] !== void 0) {
        var _message$_salt2 = message[this._salt];
        var t = _message$_salt2.t;
        var j = _message$_salt2.j;

        if (t === EVENT) {
          return this._receivePublish(j);
        }
        if (t === FETCH) {
          return this._receiveFetch(j);
        }
        throw new TypeError('Unknown message type: ' + message);
      }
    }
  }]);

  return WorkerLink;
}(Link);
/* jshint worker:false */

/* jshint worker:true */


var WorkerServer = function (_Server) {
  _inherits(WorkerServer, _Server);

  function WorkerServer() {
    var stores = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
    var salt = arguments.length <= 1 || arguments[1] === undefined ? DEFAULT_SALT : arguments[1];

    _classCallCheck(this, WorkerServer);

    if (__DEV__) {
      stores.should.be.an.Object;
      salt.should.be.a.String;
    }

    var _this4 = _possibleConstructorReturn(this, Object.getPrototypeOf(WorkerServer).call(this));

    _this4._salt = salt;
    _this4._stores = stores;
    _this4._link = new WorkerLink(self, _this4._stores, _this4._salt);
    _this4.acceptLink(_this4._link);
    _this4.lifespan.onRelease(function () {
      _this4._stores = null;
      _this4._link.release();
      _this4._link = null;
    });
    return _this4;
  }

  return WorkerServer;
}(_2.Server);
/* jshint worker:false */

exports.default = {
  Client: WorkerClient,
  Server: WorkerServer
};