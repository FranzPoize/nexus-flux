'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.LocalServer = exports.LocalClient = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

require('should');

var _Client2 = require('../Client');

var _Client3 = _interopRequireDefault(_Client2);

var _Server2 = require('../Server');

var _Server3 = _interopRequireDefault(_Server2);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var __DEV__ = process.env.NODE_ENV === 'development';


var _LocalServer = undefined;
var _LocalLink = undefined;

var LocalClient = function (_Client) {
  _inherits(LocalClient, _Client);

  function LocalClient(server) {
    _classCallCheck(this, LocalClient);

    if (__DEV__) {
      server.should.be.an.instanceOf(_LocalServer);
    }

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(LocalClient).call(this));

    _this._server = server;
    _this._link = new _LocalLink(_this);
    _this._server.acceptLink(_this._link);
    _this.lifespan.onRelease(function () {
      _this._link.lifespan.release();
      _this._link = null;
    });
    return _this;
  }

  _createClass(LocalClient, [{
    key: 'sendToServer',
    value: function sendToServer(ev) {
      this._link.receiveFromClient(ev);
    }

    // implements
    // ignore hash

  }, {
    key: 'fetch',
    value: function fetch(path) {
      var _this2 = this;

      // fail if there is not such published path
      return _bluebird2.default.try(function () {
        _this2._server.stores.should.have.property(path);
        return _this2._server.stores[path];
      });
    }
  }]);

  return LocalClient;
}(_Client3.default);

var LocalLink = function (_Link) {
  _inherits(LocalLink, _Link);

  function LocalLink(client) {
    _classCallCheck(this, LocalLink);

    if (__DEV__) {
      client.should.be.an.instanceOf(LocalClient);
    }

    var _this3 = _possibleConstructorReturn(this, Object.getPrototypeOf(LocalLink).call(this));

    _this3._client = client;
    _this3.lifespan.onRelease(function () {
      client.lifespan.release();
      _this3._client = null;
    });
    return _this3;
  }

  _createClass(LocalLink, [{
    key: 'sendToClient',
    value: function sendToClient(ev) {
      this._client.receiveFromServer(ev);
    }
  }]);

  return LocalLink;
}(_Server2.Link);

_LocalLink = LocalLink;

var LocalServer = function (_Server) {
  _inherits(LocalServer, _Server);

  function LocalServer() {
    var stores = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
    var debugInfo = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    _classCallCheck(this, LocalServer);

    if (__DEV__) {
      stores.should.be.an.Object;
    }

    var _this4 = _possibleConstructorReturn(this, Object.getPrototypeOf(LocalServer).call(this, debugInfo));

    _this4.stores = stores;
    _this4.lifespan.onRelease(function () {
      return _this4.stores = null;
    });
    return _this4;
  }

  return LocalServer;
}(_Server3.default);

_LocalServer = LocalServer;

exports.LocalClient = LocalClient;
exports.LocalServer = LocalServer;