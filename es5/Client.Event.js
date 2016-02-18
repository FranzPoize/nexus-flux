'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Event = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

require('should');

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var __DEV__ = process.env.NODE_ENV === 'development';

var Event = function () {
  function Event() {
    _classCallCheck(this, Event);

    if (__DEV__) {
      this.should.have.property('_toJS').which.is.a.Function;
      this.constructor.should.have.property('fromJS').which.is.a.Function;
      this.constructor.should.have.property('t').which.is.a.Function;
    }
    _extends(this, {
      _json: null,
      _js: null
    });
  }

  _createClass(Event, [{
    key: 'toJS',
    value: function toJS() {
      if (this._js === null) {
        this._js = {
          t: this.constructor.t(),
          j: this._toJS()
        };
      }
      return this._js;
    }
  }, {
    key: 'toJSON',
    value: function toJSON() {
      if (this._json === null) {
        this._json = JSON.stringify(this.toJS());
      }
      return this._json;
    }
  }], [{
    key: 'fromJSON',
    value: function fromJSON(json) {
      var _JSON$parse = JSON.parse(json);

      var t = _JSON$parse.t;
      var j = _JSON$parse.j;

      return Event._[t].fromJS(j);
    }
  }]);

  return Event;
}();

var Subscribe = function (_Event) {
  _inherits(Subscribe, _Event);

  function Subscribe(_ref) {
    var path = _ref.path;

    _classCallCheck(this, Subscribe);

    if (__DEV__) {
      path.should.be.a.String;
    }

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Subscribe).call(this));

    _extends(_this, { path: path });
    return _this;
  }

  _createClass(Subscribe, [{
    key: '_toJS',
    value: function _toJS() {
      return { p: this.path };
    }
  }], [{
    key: 't',
    value: function t() {
      return 's';
    }
  }, {
    key: 'fromJS',
    value: function fromJS(_ref2) {
      var p = _ref2.p;

      return new Subscribe({ path: p });
    }
  }]);

  return Subscribe;
}(Event);

var Unsubscribe = function (_Event2) {
  _inherits(Unsubscribe, _Event2);

  function Unsubscribe(_ref3) {
    var path = _ref3.path;

    _classCallCheck(this, Unsubscribe);

    if (__DEV__) {
      path.should.be.a.String;
    }

    var _this2 = _possibleConstructorReturn(this, Object.getPrototypeOf(Unsubscribe).call(this));

    _extends(_this2, { path: path });
    return _this2;
  }

  _createClass(Unsubscribe, [{
    key: '_toJS',
    value: function _toJS() {
      return { p: this.patch };
    }
  }], [{
    key: 't',
    value: function t() {
      return 'u';
    }
  }, {
    key: 'fromJS',
    value: function fromJS(_ref4) {
      var p = _ref4.p;

      return new Unsubscribe({ path: p });
    }
  }]);

  return Unsubscribe;
}(Event);

var Action = function (_Event3) {
  _inherits(Action, _Event3);

  function Action(_ref5) {
    var path = _ref5.path;
    var params = _ref5.params;

    _classCallCheck(this, Action);

    if (__DEV__) {
      path.should.be.a.String;
      params.should.be.an.Object;
    }

    var _this3 = _possibleConstructorReturn(this, Object.getPrototypeOf(Action).call(this));

    _extends(_this3, { path: path, params: params });
    return _this3;
  }

  _createClass(Action, [{
    key: '_toJS',
    value: function _toJS() {
      return {
        p: this.path,
        a: this.params
      };
    }
  }], [{
    key: 't',
    value: function t() {
      return 'd';
    }
  }, {
    key: 'fromJS',
    value: function fromJS(_ref6) {
      var p = _ref6.p;
      var a = _ref6.a;

      return new Action({
        path: p,
        params: a
      });
    }
  }]);

  return Action;
}(Event);

Event._ = {};
Event.Subscribe = Event._[Subscribe.t()] = Subscribe;
Event.Unsubscribe = Event._[Unsubscribe.t()] = Unsubscribe;
Event.Action = Event._[Action.t()] = Action;

exports.Event = Event;