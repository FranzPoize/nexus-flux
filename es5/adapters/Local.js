function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

import 'should';

var __DEV__ = process.env.NODE_ENV === 'development';

import Client from '../Client';
import Server, { Link } from '../Server';
import Promise from 'bluebird';

var _LocalServer;

var _LocalLink;

var LocalClient =
/*#__PURE__*/
function (_Client) {
  _inherits(LocalClient, _Client);

  function LocalClient(server) {
    var _this;

    _classCallCheck(this, LocalClient);

    if (__DEV__) {
      server.should.be.an.instanceOf(_LocalServer);
    }

    _this = _possibleConstructorReturn(this, (LocalClient.__proto__ || Object.getPrototypeOf(LocalClient)).call(this));
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
    key: "sendToServer",
    value: function sendToServer(ev) {
      this._link.receiveFromClient(ev);
    } // implements
    // ignore hash

  }, {
    key: "fetch",
    value: function fetch(path) {
      var _this2 = this;

      // fail if there is not such published path
      return Promise.try(function () {
        if (!_this2._server.stores.path) {
          throw new Error();
        }

        return _this2._server.stores[path];
      });
    }
  }]);

  return LocalClient;
}(Client);

var LocalLink =
/*#__PURE__*/
function (_Link) {
  _inherits(LocalLink, _Link);

  function LocalLink(client) {
    var _this3;

    _classCallCheck(this, LocalLink);

    if (__DEV__) {
      client.should.be.an.instanceOf(LocalClient);
    }

    _this3 = _possibleConstructorReturn(this, (LocalLink.__proto__ || Object.getPrototypeOf(LocalLink)).call(this));
    _this3._client = client;

    _this3.lifespan.onRelease(function () {
      client.lifespan.release();
      _this3._client = null;
    });

    return _this3;
  }

  _createClass(LocalLink, [{
    key: "sendToClient",
    value: function sendToClient(ev) {
      this._client.receiveFromServer(ev);
    }
  }]);

  return LocalLink;
}(Link);

_LocalLink = LocalLink;

var LocalServer =
/*#__PURE__*/
function (_Server) {
  _inherits(LocalServer, _Server);

  function LocalServer() {
    var _this4;

    var stores = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var debugInfo = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, LocalServer);

    if (__DEV__) {
      stores.should.be.an.Object;
    }

    _this4 = _possibleConstructorReturn(this, (LocalServer.__proto__ || Object.getPrototypeOf(LocalServer)).call(this, debugInfo));
    _this4.stores = stores;

    _this4.lifespan.onRelease(function () {
      return _this4.stores = null;
    });

    return _this4;
  }

  return LocalServer;
}(Server);

_LocalServer = LocalServer;
export { LocalClient, LocalServer };