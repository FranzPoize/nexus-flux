import Lifespan from 'lifespan';
import Remutable from 'remutable';
import { LocalClient, LocalServer } from './adapters/Local.jsx';

export var Client = LocalClient;
export var Server = LocalServer;
export {Lifespan, Remutable};
