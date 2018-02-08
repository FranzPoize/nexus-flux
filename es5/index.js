"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "Lifespan", {
  enumerable: true,
  get: function get() {
    return _lifespan.default;
  }
});
Object.defineProperty(exports, "Remutable", {
  enumerable: true,
  get: function get() {
    return _remutable.default;
  }
});
exports.Server = exports.Client = void 0;

var _lifespan = _interopRequireDefault(require("lifespan"));

var _remutable = _interopRequireDefault(require("remutable"));

var _Local = require("./adapters/Local");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Client = _Local.LocalClient;
exports.Client = Client;
var Server = _Local.LocalServer;
exports.Server = Server;