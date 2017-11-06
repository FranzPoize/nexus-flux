function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

import 'should';
import _each from 'lodash/each';
import _isObject from 'lodash/isObject';

var __DEV__ = process.env.NODE_ENV === 'development';

import { Client, Server } from '../';
var Link = Server.Link;
import Remutable from 'remutable'; // constants for the communication 'protocol'/convention

var FETCH = 'f';
var PUBLISH = 'p';
var EVENT = 'e'; // this is a just a disambiguation salt; this is by no mean a
// cryptosecure password or anything else. its fine to leave it
// plaintext here.
// any malicious script running from the same domain will be able
// to eavesdrop regardless.

var DEFAULT_SALT = '__KqsrQBNHfkTYQ8mWadEDwfKM';
/* jshint browser:true */

var WorkerClient =
/*#__PURE__*/
function (_Client) {
  _inherits(WorkerClient, _Client);

  function WorkerClient(worker) {
    var _this;

    var salt = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : DEFAULT_SALT;

    _classCallCheck(this, WorkerClient);

    if (__DEV__) {
      worker.should.be.an.instanceOf(window.Worker);
      salt.should.be.a.String;
    }

    _this = _possibleConstructorReturn(this, (WorkerClient.__proto__ || Object.getPrototypeOf(WorkerClient)).call(this));
    _this._worker = worker;
    _this._salt = salt;
    _this._fetching = {};

    _this._worker.addEventListener('message', _this.receiveFromWorker);

    _this.lifespan.onRelease(function () {
      _each(_this._fetching, function (_ref) {
        var reject = _ref.reject;
        return reject(new Error('Client released'));
      });

      _this._worker.removeEventListener('message', _this.receiveFromWorker);
    });

    return _this;
  }

  _createClass(WorkerClient, [{
    key: "fetch",
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

        this._worker.postMessage(_defineProperty({}, this._salt, {
          t: FETCH,
          j: {
            hash: hash,
            path: path
          }
        }));
      }

      return this._fetching[path].promise;
    }
  }, {
    key: "sendToServer",
    value: function sendToServer(ev) {
      if (__DEV__) {
        ev.should.be.an.instanceOf(Client.Event);
      }

      this._worker.postMessage(_defineProperty({}, this._salt, {
        t: EVENT,
        js: ev.toJS()
      }));
    }
  }, {
    key: "_receivePublish",
    value: function _receivePublish(j) {
      var path = j.path;

      if (__DEV__) {
        path.should.be.a.String;
      }

      if (this._fetching[path] !== void 0) {
        if (j === null) {
          this._fetching[path].reject(new Error("Couldn't fetch store"));
        } else {
          this._fetching[path].resolve(Remutable.fromJS(j).createConsumer());
        }

        delete this._fetching[path];
      }

      return null;
    }
  }, {
    key: "_receiveEvent",
    value: function _receiveEvent(j) {
      var ev = Server.Event.fromJS(j);

      if (__DEV__) {
        ev.should.be.an.instanceOf(Server.Event);
      }

      return this.receiveFromServer(ev);
    }
  }, {
    key: "receiveFromWorker",
    value: function receiveFromWorker(message) {
      if (_isObject(message) && message[this._salt] !== void 0) {
        var _message$_salt = message[this._salt],
            t = _message$_salt.t,
            j = _message$_salt.j;

        if (t === PUBLISH) {
          return this._receivePublish(j);
        }

        if (t === EVENT) {
          return this._receiveEvent(j);
        }

        throw new TypeError("Unknown message type: ".concat(message));
      }
    }
  }]);

  return WorkerClient;
}(Client);
/* jshint browser:false */

/* jshint worker:true */


var WorkerLink =
/*#__PURE__*/
function (_Link) {
  _inherits(WorkerLink, _Link);

  function WorkerLink(self, stores) {
    var _this3;

    var salt = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : DEFAULT_SALT;

    _classCallCheck(this, WorkerLink);

    if (__DEV__) {
      self.should.be.an.Object;
      self.postMessage.should.be.a.Function;
      self.addEventListener.should.be.a.Function;
      stores.should.be.an.Object;
      salt.should.be.a.String;
    }

    _this3 = _possibleConstructorReturn(this, (WorkerLink.__proto__ || Object.getPrototypeOf(WorkerLink)).call(this));
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
    key: "sendToClient",
    value: function sendToClient(ev) {
      if (__DEV__) {
        ev.should.be.an.instanceOf(Server.Event);
      }

      this._self.postMessage(_defineProperty({}, this._salt, {
        t: EVENT,
        js: ev.toJS()
      }));
    }
  }, {
    key: "_receivePublish",
    value: function _receivePublish(j) {
      var ev = Client.Event.fromJS(j);

      if (__DEV__) {
        ev.should.be.an.instanceOf(Client.Event);
        return this.receiveFromClient(ev);
      }

      return null;
    }
  }, {
    key: "_receiveFetch",
    value: function _receiveFetch(j) {
      var path = j.path;

      if (this.stores[path] === void 0) {
        return this._self.postMessage(_defineProperty({}, this._salt, {
          t: PUBLISH,
          j: null
        }));
      }

      return this._self.postMessage(_defineProperty({}, this._salt, {
        t: PUBLISH,
        j: this.stores[path].toJS()
      }));
    }
  }, {
    key: "receiveFromWorker",
    value: function receiveFromWorker(message) {
      if (_isObject(message) && message[this._salt] !== void 0) {
        var _message$_salt2 = message[this._salt],
            t = _message$_salt2.t,
            j = _message$_salt2.j;

        if (t === EVENT) {
          return this._receivePublish(j);
        }

        if (t === FETCH) {
          return this._receiveFetch(j);
        }

        throw new TypeError("Unknown message type: ".concat(message));
      }
    }
  }]);

  return WorkerLink;
}(Link);
/* jshint worker:false */

/* jshint worker:true */


var WorkerServer =
/*#__PURE__*/
function (_Server) {
  _inherits(WorkerServer, _Server);

  function WorkerServer() {
    var _this4;

    var stores = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var salt = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : DEFAULT_SALT;

    _classCallCheck(this, WorkerServer);

    if (__DEV__) {
      stores.should.be.an.Object;
      salt.should.be.a.String;
    }

    _this4 = _possibleConstructorReturn(this, (WorkerServer.__proto__ || Object.getPrototypeOf(WorkerServer)).call(this));
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
}(Server);
/* jshint worker:false */


export default {
  Client: WorkerClient,
  Server: WorkerServer
};