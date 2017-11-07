function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

import 'should';
import { Patch } from 'remutable';

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

var Update =
/*#__PURE__*/
function (_Event) {
  _inherits(Update, _Event);

  function Update(_ref) {
    var _this;

    var path = _ref.path,
        patch = _ref.patch;

    _classCallCheck(this, Update);

    if (false) {
      path.should.be.a.String;
      patch.should.be.an.instanceOf(Patch);
    }

    _this = _possibleConstructorReturn(this, (Update.__proto__ || Object.getPrototypeOf(Update)).call(this));
    Object.assign(_this, {
      path: path,
      patch: patch
    });
    return _this;
  }

  _createClass(Update, [{
    key: "_toJS",
    value: function _toJS() {
      return {
        p: this.path,
        u: this.patch.toJS()
      };
    }
  }], [{
    key: "t",
    value: function t() {
      return 'u';
    }
  }, {
    key: "fromJS",
    value: function fromJS(_ref2) {
      var p = _ref2.p,
          u = _ref2.u;

      if (false) {
        p.should.be.a.String;
        u.should.be.an.Object;
      }

      return new Update({
        path: p,
        patch: Patch.fromJS(u)
      });
    }
  }]);

  return Update;
}(Event);

var Delete =
/*#__PURE__*/
function (_Event2) {
  _inherits(Delete, _Event2);

  function Delete(_ref3) {
    var _this2;

    var path = _ref3.path;

    _classCallCheck(this, Delete);

    if (false) {
      path.should.be.a.String;
    }

    _this2 = _possibleConstructorReturn(this, (Delete.__proto__ || Object.getPrototypeOf(Delete)).call(this));
    Object.assign(_this2, {
      path: path
    });
    return _this2;
  }

  _createClass(Delete, [{
    key: "_toJS",
    value: function _toJS() {
      return {
        p: this.path
      };
    }
  }], [{
    key: "t",
    value: function t() {
      return 'd';
    }
  }, {
    key: "fromJS",
    value: function fromJS(_ref4) {
      var p = _ref4.p;

      if (false) {
        p.should.be.a.String;
      }

      return new Delete({
        path: p
      });
    }
  }]);

  return Delete;
}(Event);

Event._ = {};
Event.Update = Event._[Update.t()] = Update;
Event.Delete = Event._[Delete.t()] = Delete;
export { Event };