function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

import 'should';
import _bindAll from 'lodash/bindAll';

var __DEV__ = process.env.NODE_ENV === 'development';

import asap from 'asap';
import EventEmitter from 'nexus-events';
import Lifespan from 'lifespan';
import Remutable from 'remutable';
var Patch = Remutable.Patch;
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

    if (__DEV__) {
      engine.should.be.an.instanceOf(_Engine);
    }

    Object.assign(this, {
      _engine: engine,
      lifespan: new Lifespan()
    });

    _bindAll(this, ['get', 'unset', 'set']); // proxy getters to engine.remutableProducers


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
      if (__DEV__) {
        path.should.be.a.String;
      }

      return this.working.get(path);
    }
  }, {
    key: "unset",
    value: function unset(path) {
      if (__DEV__) {
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

    if (__DEV__) {
      engine.should.be.an.instanceOf(_Engine);
    }

    Object.assign(this, {
      _engine: engine,
      lifespan: new Lifespan()
    });

    _bindAll(this, ['onUpdate', 'onDelete']);

    if (__DEV__) {
      this._onUpdateHandlers = 0;
      this._onDeleteHandlers = 0; // check that handlers are immediatly set

      asap(function () {
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
    key: "onDelete",
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
    _this3.lifespan = new Lifespan();
    _this3.remutable = new Remutable(data);

    _bindAll(_this3, ['createProducer', 'createConsumer', 'apply', 'commit', 'delete']);

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
      if (__DEV__) {
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
}(EventEmitter);

_Engine = Engine;
export default {
  Consumer: Consumer,
  Producer: Producer,
  Engine: Engine
};