import 'should';
import _bindAll from 'lodash/bindAll';
const __DEV__ = process.env.NODE_ENV === 'development';
import asap from 'asap';
import EventEmitter from 'nexus-events';
import Lifespan from 'lifespan';
import Remutable from 'remutable';
const { Patch } = Remutable;

const EVENTS = { UPDATE: 'c', DELETE: 'd' };

let _Engine;

class Producer {
  constructor(engine) {
    if(__DEV__) {
      engine.should.be.an.instanceOf(_Engine);
    }
    Object.assign(this, {
      _engine: engine,
      lifespan: new Lifespan(),
    });
    _bindAll(this, [
      'get',
      'unset',
      'set',
    ]);
    // proxy getters to engine.remutableProducers
    ['head', 'working', 'hash', 'version']
    .forEach((p) => Object.defineProperty(this, p, {
      enumerable: true,
      get: () => engine.remutableProducer[p],
    }));
    // proxy methods to engine.remutableProducers
    ['rollback', 'match']
    .forEach((m) => this[m] = engine.remutableProducer[m]);
    // proxy methods to engine
    ['apply', 'commit', 'delete']
    .forEach((m) => this[m] = engine[m]);
  }

  get(path) {
    if(__DEV__) {
      path.should.be.a.String;
    }
    return this.working.get(path);
  }

  unset(path) {
    if(__DEV__) {
      path.should.be.a.String;
    }
    return this.set(path, void 0);
  }

  // chainable
  set() {
    this._engine.remutableProducer.set.apply(this._engine.remutableProducer, arguments);
    return this;
  }
}

class Consumer {
  constructor(engine) {
    if(__DEV__) {
      engine.should.be.an.instanceOf(_Engine);
    }
    Object.assign(this, {
      _engine: engine,
      lifespan: new Lifespan(),
    });
    _bindAll(this, [
      'onUpdate',
      'onDelete',
    ]);

    if(__DEV__) {
      this._onUpdateHandlers = 0;
      this._onDeleteHandlers = 0;
      // check that handlers are immediatly set
      asap(() => {
        try {
          this._onUpdateHandlers.should.be.above(0);
          this._onDeleteHandlers.should.be.above(0);
        }
        catch(err) {
          console.warn('StoreConsumer: both onUpdate and onDelete handlers should be set immediatly.');
        }
      });
    }
  }

  get value() {
    return this._engine.remutableConsumer.head;
  }

  onUpdate(fn) {
    if(__DEV__) {
      fn.should.be.a.Function;
    }
    this._engine.addListener(EVENTS.UPDATE, fn, this.lifespan);
    if(__DEV__) {
      this._onUpdateHandlers = this._onUpdateHandlers + 1;
    }
    return this;
  }

  onDelete(fn) {
    if(__DEV__) {
      fn.should.be.a.Function;
    }
    this._engine.addListener(EVENTS.DELETE, fn, this.lifespan);
    if(__DEV__) {
      this._onDeleteHandlers = this._onDeleteHandlers + 1;
    }
    return this;
  }
}

class Engine extends EventEmitter {
  constructor(data = {}) {
    super();
    this.lifespan = new Lifespan();
    this.remutable = new Remutable(data);
    _bindAll(this, [
      'createProducer',
      'createConsumer',
      'apply',
      'commit',
      'delete',
    ]);
    this.remutableProducer = this.remutable.createProducer();
    this.remutableConsumer = this.remutable.createConsumer();
    this.consumers = 0;
    this.producers = 0;
    this.lifespan.onRelease(() => {
      if(__DEV__) {
        this.consumers.should.be.exactly(0);
        this.producers.should.be.exactly(0);
      }
      this.remutable = null;
      this.remutableConsumer = null;
      this.remutableProducer = null;
    });
  }

  createProducer() {
    const producer = new Producer(this);
    this.producers = this.producers + 1;
    producer.lifespan.onRelease(() => this.producers = this.producers - 1);
    return producer;
  }

  createConsumer() {
    const consumer = new Consumer(this);
    this.consumers = this.consumers + 1;
    consumer.lifespan.onRelease(() => this.consumers = this.consumers - 1);
    return consumer;
  }

  apply(patch) {
    if(__DEV__) {
      patch.should.be.an.instanceOf(Patch);
    }
    this.remutable.apply(patch);
    this.emit(EVENTS.UPDATE, this.remutableConsumer, patch);
  }

  commit() {
    const patch = this.remutable.commit();
    this.emit(EVENTS.UPDATE, this.remutableConsumer, patch);
  }

  delete() {
    this.emit(EVENTS.DELETE);
  }
}

_Engine = Engine;

export default { Consumer, Producer, Engine };
