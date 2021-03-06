import 'should';
import Client from '../Client';
import Server, {Link} from '../Server';
import Promise from 'bluebird';

let _LocalServer;
let _LocalLink;

class LocalClient extends Client {
  constructor(server) {
    if(process.env.NODE_ENV === 'development') {
      server.should.be.an.instanceOf(_LocalServer);
    }
    super();
    this._server = server;
    this._link = new _LocalLink(this);
    this._server.acceptLink(this._link);
    this.lifespan.onRelease(() => {
      this._link.lifespan.release();
      this._link = null;
    });
  }

  sendToServer(ev) {
    this._link.receiveFromClient(ev);
  }

  // implements
  // ignore hash
  fetch(path) {
    // fail if there is not such published path
	  return Promise.try(() => {
      if (!this._server.stores[path]) {
        throw new Error();
      }
      return this._server.stores[path];
    });
  }
}

class LocalLink extends Link {
  constructor(client) {
    if(process.env.NODE_ENV === 'development') {
      client.should.be.an.instanceOf(LocalClient);
    }
    super();
    this._client = client;
    this.lifespan.onRelease(() => {
      client.lifespan.release();
      this._client = null;
    });
  }

  sendToClient(ev) {
    this._client.receiveFromServer(ev);
  }
}

_LocalLink = LocalLink;

class LocalServer extends Server {
  constructor(stores = {}, debugInfo = {}) {
    if(process.env.NODE_ENV === 'development') {
      stores.should.be.an.Object;
    }
    super(debugInfo);
    this.stores = stores;
    this.lifespan.onRelease(() => this.stores = null);
  }
}

_LocalServer = LocalServer;

export { LocalClient, LocalServer};
