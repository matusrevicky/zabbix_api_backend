import Express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import * as path from 'path';
import * as bodyParser from 'body-parser';
import * as http from 'http';
import * as https from 'https';
import * as fs from 'fs';
import * as os from 'os';
import l from './logger';
import * as OpenApiValidator from 'express-openapi-validator';
import errorHandler from '../api/middlewares/error.handler';
var timeout = require('connect-timeout')

const app = new Express();
app.use(timeout('60s'))

//**********testing start*************
// just for testing purposes memorystore gets deleted when server is restrted
var session = require('express-session')
var MemoryStore = require('memorystore')(session)
var middlewareZabbix = require("../api/middlewares/middleware-zabbix.js");
//**********testing end*********** */

// const redis = require('redis');
// const redisStore = require('connect-redis')(session);
// const client  = redis.createClient();

export default class ExpressServer {
  constructor() {
    const root = path.normalize(`${__dirname}/../..`);

    const apiSpec = path.join(__dirname, 'api.yml');
    const validateResponses = !!(
      process.env.OPENAPI_ENABLE_RESPONSE_VALIDATION &&
      process.env.OPENAPI_ENABLE_RESPONSE_VALIDATION.toLowerCase() === 'true'
    );

    // app.use(session({
    //   secret: process.env.SESSION_SECRET,
    //   // create new redis store.
    //   store: new redisStore({ host: 'localhost', port: 6379, client: client,ttl : 260}),
    //   saveUninitialized: false,
    //   resave: false
    // }));

    // client.on('error', function(err) {
    //   console.log('Redis error: ' + err);
    // });

    // client.on("ready",function () {
    //   console.log("Redis is ready");
    // });


    //**********testing start*************
    // just for testing purposes memorystore gets deleted when server is restrted
    app.use(session({
      cookie: { httpOnly: false,
        // secure: true, // comment out if using http server
        maxAge: 86400000 
      },
      store: new MemoryStore({
        checkPeriod: 86400000 // prune expired entries every 24h
      }),
      saveUninitialized: false,
      resave: false,
      secret: process.env.SESSION_SECRET || 'secretToBeChangedInEnvironment'
    }))
    //**********testing end*********** */


    const corsOptions = {
      origin: true,
      credentials: true
    }
    app.use(cors(corsOptions));
    app.set('appPath', `${root}client`);
    app.use(bodyParser.json({ limit: process.env.REQUEST_LIMIT || '500mb' }));
    app.use(
      bodyParser.urlencoded({
        extended: true,
        limit: process.env.REQUEST_LIMIT || '500mb',
      })
    );
    app.use(bodyParser.text({ limit: process.env.REQUEST_LIMIT || '500mb' }));
    app.use(cookieParser(process.env.SESSION_SECRET));
    app.use(Express.static(`${root}/public`));

    app.use(process.env.OPENAPI_SPEC || '/spec', Express.static(apiSpec));
    app.use(
      OpenApiValidator.middleware({
        apiSpec,
        validateResponses,
        ignorePaths: /.*\/spec(\/|$)/,
      })
    );
    //**********testing start*************
    // just for testing purposes memorystore gets deleted when server is restrted
    app.use(middlewareZabbix);
    //**********testing end*********** */  
  }

  router(routes) {
    routes(app);
    app.use(errorHandler);
    return this;
  }

  listen(port = process.env.PORT) {
    const welcome = (p) => () =>
      l.info(
        `up and running in ${process.env.NODE_ENV || 'development'
        } @: ${os.hostname()} on port: ${p}}`
      );

    // var cluster = require('cluster');

    // if (cluster.isMaster) {
    //   // Create a worker for each CPU
    //   for (var i = 0; i <  require('os').cpus().length; i++) {
    //     cluster.fork();
    //   }

    //   cluster.on('online', function (worker) {
    //     console.log('Worker ' + worker.process.pid + ' is online.');
    //   });
    //   cluster.on('exit', function (worker, code, signal) {
    //     console.log('worker ' + worker.process.pid + ' died.');
    //   });
    // }
    // else {
    
    const sslPath = path.resolve(__dirname, '../ssl');
    const key = fs.readFileSync(path.join(sslPath, 'key.pem'));
    const ca = fs.readFileSync(path.join(sslPath, 'csr.pem'));
    const cert = fs.readFileSync(path.join(sslPath, 'cert.pem'));
    const credentials = {
      key: key,
      ca: ca,
      cert: cert
    }

    // https.createServer(credentials, app).listen(port, welcome(port));
    http.createServer(app).listen(port, welcome(port)); // comment out secure attribute in cookie

    return app;
    // }
  }
}
