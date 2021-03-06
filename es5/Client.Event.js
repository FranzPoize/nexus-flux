"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Event = void 0;

require("should");

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Event =
/*#__PURE__*/
function () {
  function Event() {
    _classCallCheck(this, Event);

    if (false) {
      this.should.have.property('_toJS').which.is.a.Function;
      this.constructor.should.have.property('fromJS').which.is.a.Function;
      this.constructor.should.have.property('t').which.is.a.Function;
    }

    Object.assign(this, {
      _json: null,
      _js: null
    });
  }

  _createClass(Event, [{
    key: "toJS",
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
    key: "toJSON",
    value: function toJSON() {
      if (this._json === null) {
        this._json = JSON.stringify(this.toJS());
      }

      return this._json;
    }
  }], [{
    key: "fromJSON",
    value: function fromJSON(json) {
      var _JSON$parse = JSON.parse(json),
          t = _JSON$parse.t,
          j = _JSON$parse.j;

      return Event._[t].fromJS(j);
    }
  }]);

  return Event;
}();

exports.Event = Event;

var Subscribe =
/*#__PURE__*/
function (_Event) {
  _inherits(Subscribe, _Event);

  function Subscribe(_ref) {
    var _this;

    var path = _ref.path;

    _classCallCheck(this, Subscribe);

    if (false) {
      path.should.be.a.String;
    }

    _this = _possibleConstructorReturn(this, (Subscribe.__proto__ || Object.getPrototypeOf(Subscribe)).call(this));
    Object.assign(_this, {
      path: path
    });
    return _this;
  }

  _createClass(Subscribe, [{
    key: "_toJS",
    value: function _toJS() {
      return {
        p: this.path
      };
    }
  }], [{
    key: "t",
    value: function t() {
      return 's';
    }
  }, {
    key: "fromJS",
    value: function fromJS(_ref2) {
      var p = _ref2.p;
      return new Subscribe({
        path: p
      });
    }
  }]);

  return Subscribe;
}(Event);

var Unsubscribe =
/*#__PURE__*/
function (_Event2) {
  _inherits(Unsubscribe, _Event2);

  function Unsubscribe(_ref3) {
    var _this2;

    var path = _ref3.path;

    _classCallCheck(this, Unsubscribe);

    if (false) {
      path.should.be.a.String;
    }

    _this2 = _possibleConstructorReturn(this, (Unsubscribe.__proto__ || Object.getPrototypeOf(Unsubscribe)).call(this));
    Object.assign(_this2, {
      path: path
    });
    return _this2;
  }

  _createClass(Unsubscribe, [{
    key: "_toJS",
    value: function _toJS() {
      return {
        p: this.patch
      };
    }
  }], [{
    key: "t",
    value: function t() {
      return 'u';
    }
  }, {
    key: "fromJS",
    value: function fromJS(_ref4) {
      var p = _ref4.p;
      return new Unsubscribe({
        path: p
      });
    }
  }]);

  return Unsubscribe;
}(Event);

var Action =
/*#__PURE__*/
function (_Event3) {
  _inherits(Action, _Event3);

  function Action(_ref5) {
    var _this3;

    var path = _ref5.path,
        params = _ref5.params;

    _classCallCheck(this, Action);

    if (false) {
      path.should.be.a.String;
      params.should.be.an.Object;
    }

    _this3 = _possibleConstructorReturn(this, (Action.__proto__ || Object.getPrototypeOf(Action)).call(this));
    Object.assign(_this3, {
      path: path,
      params: params
    });
    return _this3;
  }

  _createClass(Action, [{
    key: "_toJS",
    value: function _toJS() {
      return {
        p: this.path,
        a: this.params
      };
    }
  }], [{
    key: "t",
    value: function t() {
      return 'd';
    }
  }, {
    key: "fromJS",
    value: function fromJS(_ref6) {
      var p = _ref6.p,
          a = _ref6.a;
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