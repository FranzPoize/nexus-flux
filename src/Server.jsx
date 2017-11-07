import 'should';
import _each from 'lodash/each';
import _includes from 'lodash/includes';
import _clone from 'lodash/clone';
import _size from 'lodash/size';
import _uniqueId from 'lodash/uniqueId';
import Remutable from 'remutable';
import Lifespan from 'lifespan';
import EventEmitter from 'nexus-events';
// we just need this reference for typechecks
import Client from './Client';
import { Event } from './Server.Event';
import Promise from 'bluebird';

let _Server;

// abstract
class Link {
  constructor() {
    if(process.env.NODE_ENV === 'development') {
      // ensure abstracts
      this.constructor.should.not.be.exactly(Link);
      // ensure virtual
      this.sendToClient.should.not.be.exactly(Link.prototype.sendToClient);
    }
    this.lifespan = new Lifespan();
    // will be set by the server; should be called when received client events, to forward them to the server
    this.receiveFromClient = null;
    this.lifespan.onRelease(() => {
      this.receiveFromClient = null;
    });
  }

  // virtual
  // should forward the event to the associated client
  sendToClient(ev) {
    if(process.env.NODE_ENV === 'development') {
      ev.should.be.an.instanceOf(_Server.Event);
    }
    throw new TypeError('Virtual method invocation');
  }

  // will be called by the server
  acceptFromServer(receiveFromClient) {
    if(process.env.NODE_ENV === 'development') {
      receiveFromClient.should.be.a.Function;
    }
    this.receiveFromClient = receiveFromClient;
  }

  // will be called by server
  receiveFromServer(ev) {
    if(process.env.NODE_ENV === 'development') {
      ev.should.be.an.instanceOf(_Server.Event);
    }
    this.sendToClient(ev);
  }
}

class Server extends EventEmitter {
  constructor({debugPath, logStore}) {
    super();
    this.lifespan = new Lifespan();
    this._links = {};
    this._subscriptions = {};
    this.lifespan.onRelease(() => {
      _each(this._links, ({ link, subscriptions }, linkID) => {
        _each(subscriptions, (path) => this.unsubscribe(linkID, path));
        link.lifespan.release();
      });
      this._links = null;
      this._subscriptions = null;
	});
	this.debugPath = debugPath;
	this.logStore = logStore;
  }

  dispatchAction(path, params) {
    return Promise.try(() => {
      if(process.env.NODE_ENV === 'development') {
        path.should.be.a.String;
        params.should.be.an.Object;
      }
      if (this.logStore && !_includes(this.debugPath, path)) {
        const patchArray = _clone(this.logStore.get('patchArray'));
        patchArray.push({
          path,
          params,
          type: 'action',
        });
        const logPatch = this.logStore.set('patchArray', patchArray).commit();
        const logEv = new Server.Event.Update({path: 'logStore', patch: logPatch});
        _each(this._subscriptions.logStore, (link) => {
          link.receiveFromServer(logEv);
        });
      }
	  this.emit('action', { path, params });
	  return null;
    });
  }

  dispatchUpdate(path, patch) {
    if(process.env.NODE_ENV === 'development') {
      path.should.be.a.String;
      patch.should.be.an.instanceOf(Remutable.Patch);
    }
    if (this.logStore && !_includes(this.debugPath, path)) {
      const patchArray = _clone(this.logStore.get('patchArray'));
      patchArray.push({
        path,
        patch,
        type: 'patch',
      });
      const logPatch = this.logStore.set('patchArray', patchArray).commit();
      const logEv = new Server.Event.Update({path: 'logStore', patch: logPatch});
      _each(this._subscriptions.logStore, (link) => {
        link.receiveFromServer(logEv);
      });
    }
    if(this._subscriptions[path] !== void 0) {

      const ev = new Server.Event.Update({ path, patch });
      _each(this._subscriptions[path], (link) => {
        link.receiveFromServer(ev);
      });
    }
    return this;
  }

  subscribe(linkID, path) {
    if(process.env.NODE_ENV === 'development') {
      linkID.should.be.a.String;
      path.should.be.a.String;
      this._links.should.have.property(linkID);
    }
    if(this._subscriptions[path] === void 0) {
      this._subscriptions[path] = {};
    }
    this._subscriptions[path][linkID] = this._links[linkID].link;
    if(this._links[linkID].subscriptions[path] === void 0) {
      this._links[linkID].subscriptions[path] = path;
    }
    return this;
  }

  unsubscribe(linkID, path) {
    if(process.env.NODE_ENV === 'development') {
      linkID.should.be.a.String;
      path.should.be.a.String;
      this._links.should.have.property(linkID);
      this._links[linkID].subscriptions.should.have.property(path);
      this._subscriptions.should.have.property(path);
      this._subscriptions[path].should.have.property(linkID);
    }
    delete this._links[linkID].subscriptions[path];
    delete this._subscriptions[path][linkID];
    if(_size(this._subscriptions[path]) === 0) {
      delete this._subscriptions[path];
    }
  }

  acceptLink(link) {
    if(process.env.NODE_ENV === 'development') {
      link.should.be.an.instanceOf(Link);
    }

    const linkID = _uniqueId();
    this._links[linkID] = {
      link,
      subscriptions: {},
    };
    link.acceptFromServer((ev) => this.receiveFromLink(linkID, ev));
    link.lifespan.onRelease(() => {
      _each(this._links[linkID].subscriptions, (path) => this.unsubscribe(linkID, path));
      delete this._links[linkID];
    });
  }

  receiveFromLink(linkID, ev) {
    if(process.env.NODE_ENV === 'development') {
      linkID.should.be.a.String;
      this._links.should.have.property(linkID);
      ev.should.be.an.instanceOf(Client.Event);
    }
    if(ev instanceof Client.Event.Subscribe) {
      return this.subscribe(linkID, ev.path);
    }
    if(ev instanceof Client.Event.Unsubscribe) {
      return this.unsubscribe(linkID, ev.path);
    }
    if(ev instanceof Client.Event.Action) {
      return this.dispatchAction(ev.path, ev.params);
    }
    if(process.env.NODE_ENV === 'development') {
      throw new TypeError(`Unknown Client.Event: ${ev}`);
    }
  }
}

_Server = Server;

Object.assign( Server, { Event, Link });

export { Event, Link };
export default Server;
