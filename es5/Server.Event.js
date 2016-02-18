'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Event = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

require('should');

var _remutable = require('remutable');

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

var Update = function (_Event) {
  _inherits(Update, _Event);

  function Update(_ref) {
    var path = _ref.path;
    var patch = _ref.patch;

    _classCallCheck(this, Update);

    if (__DEV__) {
      path.should.be.a.String;
      patch.should.be.an.instanceOf(_remutable.Patch);
    }

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Update).call(this));

    _extends(_this, { path: path, patch: patch });
    return _this;
  }

  _createClass(Update, [{
    key: '_toJS',
    value: function _toJS() {
      return {
        p: this.path,
        u: this.patch.toJS()
      };
    }
  }], [{
    key: 't',
    value: function t() {
      return 'u';
    }
  }, {
    key: 'fromJS',
    value: function fromJS(_ref2) {
      var p = _ref2.p;
      var u = _ref2.u;

      if (__DEV__) {
        p.should.be.a.String;
        u.should.be.an.Object;
      }
      return new Update({ path: p, patch: _remutable.Patch.fromJS(u) });
    }
  }]);

  return Update;
}(Event);

var Delete = function (_Event2) {
  _inherits(Delete, _Event2);

  function Delete(_ref3) {
    var path = _ref3.path;

    _classCallCheck(this, Delete);

    if (__DEV__) {
      path.should.be.a.String;
    }

    var _this2 = _possibleConstructorReturn(this, Object.getPrototypeOf(Delete).call(this));

    _extends(_this2, { path: path });
    return _this2;
  }

  _createClass(Delete, [{
    key: '_toJS',
    value: function _toJS() {
      return { p: this.path };
    }
  }], [{
    key: 't',
    value: function t() {
      return 'd';
    }
  }, {
    key: 'fromJS',
    value: function fromJS(_ref4) {
      var p = _ref4.p;

      if (__DEV__) {
        p.should.be.a.String;
      }
      return new Delete({ path: p });
    }
  }]);

  return Delete;
}(Event);

Event._ = {};
Event.Update = Event._[Update.t()] = Update;
Event.Delete = Event._[Delete.t()] = Delete;

exports.Event = Event;