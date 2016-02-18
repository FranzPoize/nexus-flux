'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

require('should');

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _asap = require('asap');

var _asap2 = _interopRequireDefault(_asap);

var _nexusEvents = require('nexus-events');

var _nexusEvents2 = _interopRequireDefault(_nexusEvents);

var _lifespan = require('lifespan');

var _lifespan2 = _interopRequireDefault(_lifespan);

var _remutable = require('remutable');

var _remutable2 = _interopRequireDefault(_remutable);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var __DEV__ = process.env.NODE_ENV === 'development';
var Patch = _remutable2.default.Patch;


var EVENTS = { UPDATE: 'c', DELETE: 'd' };

var _Engine = undefined;

var Producer = function () {
  function Producer(engine) {
    var _this = this;

    _classCallCheck(this, Producer);

    if (__DEV__) {
      engine.should.be.an.instanceOf(_Engine);
    }
    _extends(this, {
      _engine: engine,
      lifespan: new _lifespan2.default()
    });
    _lodash2.default.bindAll(this, ['get', 'unset', 'set']);
    // proxy getters to engine.remutableProducers
    ['head', 'working', 'hash', 'version'].forEach(function (p) {
      return Object.defineProperty(_this, p, {
        enumerable: true,
        get: function get() {
          return engine.remutableProducer[p];
        }
      });
    });
    // proxy methods to engine.remutableProducers
    ['rollback', 'match'].forEach(function (m) {
      return _this[m] = engine.remutableProducer[m];
    });
    // proxy methods to engine
    ['apply', 'commit', 'delete'].forEach(function (m) {
      return _this[m] = engine[m];
    });
  }

  _createClass(Producer, [{
    key: 'get',
    value: function get(path) {
      if (__DEV__) {
        path.should.be.a.String;
      }
      return this.working.get(path);
    }
  }, {
    key: 'unset',
    value: function unset(path) {
      if (__DEV__) {
        path.should.be.a.String;
      }
      return this.set(path, void 0);
    }

    // chainable

  }, {
    key: 'set',
    value: function set() {
      this._engine.remutableProducer.set.apply(this._engine.remutableProducer, arguments);
      return this;
    }
  }]);

  return Producer;
}();

var Consumer = function () {
  function Consumer(engine) {
    var _this2 = this;

    _classCallCheck(this, Consumer);

    if (__DEV__) {
      engine.should.be.an.instanceOf(_Engine);
    }
    _extends(this, {
      _engine: engine,
      lifespan: new _lifespan2.default()
    });
    _lodash2.default.bindAll(this, ['onUpdate', 'onDelete']);

    if (__DEV__) {
      this._onUpdateHandlers = 0;
      this._onDeleteHandlers = 0;
      // check that handlers are immediatly set
      (0, _asap2.default)(function () {
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
    key: 'onUpdate',
    value: function onUpdate(fn) {
      if (__DEV__) {
        fn.should.be.a.Function;
      }
      this._engine.addListener(EVENTS.UPDATE, fn, this.lifespan);
      if (__DEV__) {
        this._onUpdateHandlers = this._onUpdateHandlers + 1;
      }
      return this;
    }
  }, {
    key: 'onDelete',
    value: function onDelete(fn) {
      if (__DEV__) {
        fn.should.be.a.Function;
      }
      this._engine.addListener(EVENTS.DELETE, fn, this.lifespan);
      if (__DEV__) {
        this._onDeleteHandlers = this._onDeleteHandlers + 1;
      }
      return this;
    }
  }, {
    key: 'value',
    get: function get() {
      return this._engine.remutableConsumer.head;
    }
  }]);

  return Consumer;
}();

var Engine = function (_EventEmitter) {
  _inherits(Engine, _EventEmitter);

  function Engine() {
    var data = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    _classCallCheck(this, Engine);

    var _this3 = _possibleConstructorReturn(this, Object.getPrototypeOf(Engine).call(this));

    _this3.lifespan = new _lifespan2.default();
    _this3.remutable = new _remutable2.default(data);
    _lodash2.default.bindAll(_this3, ['createProducer', 'createConsumer', 'apply', 'commit', 'delete']);
    _this3.remutableProducer = _this3.remutable.createProducer();
    _this3.remutableConsumer = _this3.remutable.createConsumer();
    _this3.consumers = 0;
    _this3.producers = 0;
    _this3.lifespan.onRelease(function () {
      if (__DEV__) {
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
    key: 'createProducer',
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
    key: 'createConsumer',
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
    key: 'apply',
    value: function apply(patch) {
      if (__DEV__) {
        patch.should.be.an.instanceOf(Patch);
      }
      this.remutable.apply(patch);
      this.emit(EVENTS.UPDATE, this.remutableConsumer, patch);
    }
  }, {
    key: 'commit',
    value: function commit() {
      var patch = this.remutable.commit();
      this.emit(EVENTS.UPDATE, this.remutableConsumer, patch);
    }
  }, {
    key: 'delete',
    value: function _delete() {
      this.emit(EVENTS.DELETE);
    }
  }]);

  return Engine;
}(_nexusEvents2.default);

_Engine = Engine;

exports.default = { Consumer: Consumer, Producer: Producer, Engine: Engine };