import {connect, connection} from 'mongoose';
import {config} from '../config/index';
import {error as werror} from 'winston';

function connectToMongoDb() {
    let options = { server: { socketOptions: { keepAlive: 1 } } };
    connect(config().mongodb, options);
};

connectToMongoDb();

connection.on('error', werror);
connection.on('disconnected', connectToMongoDb);
