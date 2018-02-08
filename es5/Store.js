"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("should");

var _bindAll2 = _interopRequireDefault(require("lodash/bindAll"));

var _asap = _interopRequireDefault(require("asap"));

var _nexusEvents = _interopRequireDefault(require("nexus-events"));

var _lifespan = _interopRequireDefault(require("lifespan"));

var _remutable = _interopRequireDefault(require("remutable"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Patch = _remutable.default.Patch;
var EVENTS = {
  UPDATE: 'c',
  DELETE: 'd'
};

var _Engine;

var Producer =
/*#__PURE__*/
function () {
  function Producer(engine) {
    var _this = this;

    _classCallCheck(this, Producer);

    if (false) {
      engine.should.be.an.instanceOf(_Engine);
    }

    Object.assign(this, {
      _engine: engine,
      lifespan: new _lifespan.default()
    });
    (0, _bindAll2.default)(this, ['get', 'unset', 'set']); // proxy getters to engine.remutableProducers

    ['head', 'working', 'hash', 'version'].forEach(function (p) {
      return Object.defineProperty(_this, p, {
        enumerable: true,
        get: function get() {
          return engine.remutableProducer[p];
        }
      });
    }); // proxy methods to engine.remutableProducers

    ['rollback', 'match'].forEach(function (m) {
      return _this[m] = engine.remutableProducer[m];
    }); // proxy methods to engine

    ['apply', 'commit', 'delete'].forEach(function (m) {
      return _this[m] = engine[m];
    });
  }

  _createClass(Producer, [{
    key: "get",
    value: function get(path) {
      if (false) {
        path.should.be.a.String;
      }

      return this.working.get(path);
    }
  }, {
    key: "unset",
    value: function unset(path) {
      if (false) {
        path.should.be.a.String;
      }

      return this.set(path, void 0);
    } // chainable

  }, {
    key: "set",
    value: function set() {
      this._engine.remutableProducer.set.apply(this._engine.remutableProducer, arguments);

      return this;
    }
  }]);

  return Producer;
}();

var Consumer =
/*#__PURE__*/
function () {
  function Consumer(engine) {
    var _this2 = this;

    _classCallCheck(this, Consumer);

    if (false) {
      engine.should.be.an.instanceOf(_Engine);
    }

    Object.assign(this, {
      _engine: engine,
      lifespan: new _lifespan.default()
    });
    (0, _bindAll2.default)(this, ['onUpdate', 'onDelete']);

    if (false) {
      this._onUpdateHandlers = 0;
      this._onDeleteHandlers = 0; // check that handlers are immediatly set

      (0, _asap.default)(function () {
        try {
          _this2._onUpdateHandlers.should.be.above(0);

          _this2._onDeleteHandlers.should.be.above(0);
        } catch (err) {
          console.warn('StoreConsumer: both onUpdate and onDelete handlers should be set immediatly.');
        }
      });
    }
  }

  _createClass(Consumer, [{
    key: "onUpdate",
    value: function onUpdate(fn) {
      if (false) {
        fn.should.be.a.Function;
      }

      this._engine.addListener(EVENTS.UPDATE, fn, this.lifespan);

      if (false) {
        this._onUpdateHandlers = this._onUpdateHandlers + 1;
      }

      return this;
    }
  }, {
    key: "onDelete",
    value: function onDelete(fn) {
      if (false) {
        fn.should.be.a.Function;
      }

      this._engine.addListener(EVENTS.DELETE, fn, this.lifespan);

      if (false) {
        this._onDeleteHandlers = this._onDeleteHandlers + 1;
      }

      return this;
    }
  }, {
    key: "value",
    get: function get() {
      return this._engine.remutableConsumer.head;
    }
  }]);

  return Consumer;
}();

var Engine =
/*#__PURE__*/
function (_EventEmitter) {
  _inherits(Engine, _EventEmitter);

  function Engine() {
    var _this3;

    var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, Engine);

    _this3 = _possibleConstructorReturn(this, (Engine.__proto__ || Object.getPrototypeOf(Engine)).call(this));
    _this3.lifespan = new _lifespan.default();
    _this3.remutable = new _remutable.default(data);
    (0, _bindAll2.default)(_this3, ['createProducer', 'createConsumer', 'apply', 'commit', 'delete']);
    _this3.remutableProducer = _this3.remutable.createProducer();
    _this3.remutableConsumer = _this3.remutable.createConsumer();
    _this3.consumers = 0;
    _this3.producers = 0;

    _this3.lifespan.onRelease(function () {
      if (false) {
        _this3.consumers.should.be.exactly(0);

        _this3.producers.should.be.exactly(0);
      }

      _this3.remutable = null;
      _this3.remutableConsumer = null;
      _this3.remutableProducer = null;
    });

    return _this3;
  }

  _createClass(Engine, [{
    key: "createProducer",
    value: function createProducer() {
      var _this4 = this;

      var producer = new Producer(this);
      this.producers = this.producers + 1;
      producer.lifespan.onRelease(function () {
        return _this4.producers = _this4.producers - 1;
      });
      return producer;
    }
  }, {
    key: "createConsumer",
    value: function createConsumer() {
      var _this5 = this;

      var consumer = new Consumer(this);
      this.consumers = this.consumers + 1;
      consumer.lifespan.onRelease(function () {
        return _this5.consumers = _this5.consumers - 1;
      });
      return consumer;
    }
  }, {
    key: "apply",
    value: function apply(patch) {
      if (false) {
        patch.should.be.an.instanceOf(Patch);
      }

      this.remutable.apply(patch);
      this.emit(EVENTS.UPDATE, this.remutableConsumer, patch);
    }
  }, {
    key: "commit",
    value: function commit() {
      var patch = this.remutable.commit();
      this.emit(EVENTS.UPDATE, this.remutableConsumer, patch);
    }
  }, {
    key: "delete",
    value: function _delete() {
      this.emit(EVENTS.DELETE);
    }
  }]);

  return Engine;
}(_nexusEvents.default);

_Engine = Engine;
var _default = {
  Consumer: Consumer,
  Producer: Producer,
  Engine: Engine
};
exports.default = _default;