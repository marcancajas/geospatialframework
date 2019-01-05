/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ({

/***/ "./app/backend/app.ts":
/*!****************************!*\
  !*** ./app/backend/app.ts ***!
  \****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

// Using require as it is simpler instead of typescript's import/export derived syntax. 
// See typescript's "export = and import = require()" modules documentation section. 
// Documentation: https://www.typescriptlang.org/docs/handbook/modules.html
// This works well with the existing codebase.
var fs = __webpack_require__(/*! fs */ "fs");
var cluster = __webpack_require__(/*! cluster */ "cluster");
var exists = __webpack_require__(/*! ./exists */ "./app/backend/exists.ts");
var options = __webpack_require__(/*! ./options */ "./app/backend/options.ts");
var configureserver = __webpack_require__(/*! ./configureserver */ "./app/backend/configureserver.ts");
var configuredatabase = __webpack_require__(/*! ./configuredatabase */ "./app/backend/configuredatabase.ts");
class app {
    constructor() {
        this.options = new options();
    }
    init() {
        if (cluster.isMaster) {
            console.log('TerriaJS Server ' + __webpack_require__(/*! ../../package.json */ "./package.json").version); // The master process just spins up a few workers and quits.
            options.init(false);
            if (fs.existsSync('terriajs.pid')) {
                this.warn('TerriaJS-Server seems to be running already.');
            }
            this.portInUse(options.port, options.listenHost, function (inUse) {
                if (inUse) {
                    this.error('Port ' + options.port + ' is in use. Exiting.');
                }
                else {
                    if (options.listenHost !== 'localhost') {
                        this.runMaster();
                    }
                    else {
                        // Let's equate non-public, localhost mode with "single-cpu, don't restart".
                        this.startServer(options);
                    }
                }
            });
            return;
        }
        else {
            // We're a forked process.
            options.init(true);
            this.startServer(options);
        }
        // Run database configuration and get database object for the framework.
        var db = configuredatabase();
        // Extend app with database
        this.db = db;
    }
    portInUse(port, host, callback) {
        var server = __webpack_require__(/*! net */ "net").createServer();
        server.listen(port, host);
        server.on('error', function () {
            callback(true);
        });
        server.on('listening', function () {
            server.close();
            callback(false);
        });
    }
    error(message) {
        console.error('Error: ' + message);
        process.exit(1);
    }
    warn(message) {
        console.warn('Warning: ' + message);
    }
    handleExit() {
        console.log('(TerriaJS-Server exiting.)');
        if (fs.existsSync('terriajs.pid')) {
            fs.unlinkSync('terriajs.pid');
        }
        process.exit(0);
    }
    runMaster() {
        var cpuCount = __webpack_require__(/*! os */ "os").cpus().length;
        // Let's equate non-public, localhost mode with "single-cpu, don't restart".
        if (options.listenHost === 'localhost') {
            cpuCount = 1;
        }
        console.log('Serving directory "' + options.wwwroot + '" on port ' + options.port + ' to ' + (options.listenHost ? options.listenHost : 'the world') + '.');
        __webpack_require__(/*! ./controllers/convert */ "./app/backend/controllers/convert.js")().testGdal();
        if (!exists(options.wwwroot)) {
            this.warn('"' + options.wwwroot + '" does not exist.');
        }
        else if (!exists(options.wwwroot + '/index.html')) {
            this.warn('"' + options.wwwroot + '" is not a TerriaJS wwwroot directory.');
        }
        else if (!exists(options.wwwroot + '/build')) {
            this.warn('"' + options.wwwroot + '" has not been built. You should do this:\n\n' +
                '> cd ' + options.wwwroot + '/..\n' +
                '> gulp\n');
        }
        if (typeof options.settings.allowProxyFor === 'undefined') {
            this.warn('The configuration does not contain a "allowProxyFor" list.  The server will proxy _any_ request.');
        }
        process.on('SIGTERM', this.handleExit);
        // Listen for dying workers
        cluster.on('exit', function (worker) {
            if (!worker.suicide) {
                // Replace the dead worker if not a startup error like port in use.
                if (options.listenHost === 'localhost') {
                    console.log('Worker ' + worker.id + ' died. Not replacing it as we\'re running in non-public mode.');
                }
                else {
                    console.log('Worker ' + worker.id + ' died. Replacing it.');
                    cluster.fork();
                }
            }
        });
        fs.writeFileSync('terriajs.pid', process.pid.toString());
        console.log('(TerriaJS-Server running with pid ' + process.pid + ')');
        console.log('Launching ' + cpuCount + ' worker processes.');
        // Create a worker for each CPU
        for (var i = 0; i < cpuCount; i += 1) {
            cluster.fork();
        }
    }
    startServer(options) {
        var app = configureserver.start(options); // Set server configurations and generate server. We replace app here with the actual application server for proper naming conventions.
        app.listen(options.port, options.listenHost, () => console.log(`Terria framework running on ${port}!`)); // Start HTTP/s server with expressjs middleware.
    }
}
var framework = new app();
framework.init(); // Start application.
// Testing framework database
console.log(framework.db.getStatus());


/***/ }),

/***/ "./app/backend/configuredatabase.ts":
/*!******************************************!*\
  !*** ./app/backend/configuredatabase.ts ***!
  \******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

const database_1 = __webpack_require__(/*! ./database */ "./app/backend/database.ts");
class configuredatabase {
    static start() {
        var connection;
        var config = __webpack_require__(/*! ../dbconfig.json */ "./app/dbconfig.json");
        switch (config.database.type) {
            case 'mysql':
                connection = __webpack_require__(/*! ./databases/mysql/mysql.js */ "./app/backend/databases/mysql/mysql.js");
            /* Other database example
            case 'mssql':
                terriadb = require('./databases/mssql/mssql.js');
            */
            /* Other database example
            case 'mongodb':
                terriadb = require('./databases/mongodb/mongodb.js');
            */
            /* Custom example
            case 'customdb':
                terriadb = require('./databases/customdb/customdb.js');
            */
            default:
                connection = __webpack_require__(/*! ./databases/mysql/mysql.js */ "./app/backend/databases/mysql/mysql.js");
        }
        return new database_1.database(config.database.type, config.database.host, config.database.username, config.database.password, connection); // Return database object
    }
}
module.exports = configuredatabase;


/***/ }),

/***/ "./app/backend/configureserver.ts":
/*!****************************************!*\
  !*** ./app/backend/configureserver.ts ***!
  \****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var express = __webpack_require__(/*! express */ "express");
var compression = __webpack_require__(/*! compression */ "compression");
var path = __webpack_require__(/*! path */ "path");
var cors = __webpack_require__(/*! cors */ "cors");
var cluster = __webpack_require__(/*! cluster */ "cluster");
var exists = __webpack_require__(/*! ./exists */ "./app/backend/exists.ts");
var basicAuth = __webpack_require__(/*! basic-auth */ "basic-auth");
var fs = __webpack_require__(/*! fs */ "fs");
var ExpressBrute = __webpack_require__(/*! express-brute */ "express-brute");
/* Creates and returns a single express server. */
class configureserver {
    static start(options) {
        // eventually this mime type configuration will need to change
        // https://github.com/visionmedia/send/commit/d2cb54658ce65948b0ed6e5fb5de69d022bef941
        var mime = express.static.mime;
        mime.define({
            'application/json': ['czml', 'json', 'geojson'],
            'text/plain': ['glsl']
        });
        // initialise app with standard middlewares
        var app = express();
        app.use(compression());
        app.use(cors());
        app.disable('etag');
        if (options.verbose) {
            app.use(__webpack_require__(/*! morgan */ "morgan")('dev'));
        }
        if (typeof options.settings.trustProxy !== 'undefined') {
            app.set('trust proxy', options.settings.trustProxy);
        }
        if (options.verbose) {
            log('Listening on these endpoints:', true);
        }
        endpoint('/ping', function (req, res) {
            res.status(200).send('OK');
        });
        // We do this after the /ping service above so that ping can be used unauthenticated and without TLS for health checks.
        if (options.settings.redirectToHttps) {
            var httpAllowedHosts = options.settings.httpAllowedHosts || ["localhost"];
            app.use(function (req, res, next) {
                if (httpAllowedHosts.indexOf(req.hostname) >= 0) {
                    return next();
                }
                if (req.protocol !== 'https') {
                    var url = 'https://' + req.hostname + req.url;
                    res.redirect(301, url);
                }
                else {
                    next();
                }
            });
        }
        var auth = options.settings.basicAuthentication;
        if (auth && auth.username && auth.password) {
            var store = new ExpressBrute.MemoryStore();
            var rateLimitOptions = {
                freeRetries: 2,
                minWait: 200,
                maxWait: 60000,
            };
            if (options.settings.rateLimit && options.settings.rateLimit.freeRetries !== undefined) {
                rateLimitOptions.freeRetries = options.settings.rateLimit.freeRetries;
                rateLimitOptions.minWait = options.settings.rateLimit.minWait;
                rateLimitOptions.maxWait = options.settings.rateLimit.maxWait;
            }
            var bruteforce = new ExpressBrute(store, rateLimitOptions);
            app.use(bruteforce.prevent, function (req, res, next) {
                var user = basicAuth(req);
                if (user && user.name === auth.username && user.pass === auth.password) {
                    // Successful authentication, reset rate limiting.
                    req.brute.reset(next);
                }
                else {
                    res.statusCode = 401;
                    res.setHeader('WWW-Authenticate', 'Basic realm="terriajs-server"');
                    res.end('Unauthorized');
                }
            });
        }
        // Serve the bulk of our application as a static web directory.
        var serveWwwRoot = exists(options.wwwroot + '/index.html');
        if (serveWwwRoot) {
            app.use(express.static(options.wwwroot));
        }
        // Proxy for servers that don't support CORS
        var bypassUpstreamProxyHostsMap = (options.settings.bypassUpstreamProxyHosts || []).reduce(function (map, host) {
            if (host !== '') {
                map[host.toLowerCase()] = true;
            }
            return map;
        }, {});
        endpoint('/proxy', __webpack_require__(/*! ./controllers/proxy */ "./app/backend/controllers/proxy.js")({
            proxyableDomains: options.settings.allowProxyFor,
            proxyAllDomains: options.settings.proxyAllDomains,
            proxyAuth: options.proxyAuth,
            proxyPostSizeLimit: options.settings.proxyPostSizeLimit,
            upstreamProxy: options.settings.upstreamProxy,
            bypassUpstreamProxyHosts: bypassUpstreamProxyHostsMap,
            basicAuthentication: options.settings.basicAuthentication,
            blacklistedAddresses: options.settings.blacklistedAddresses
        }));
        var esriTokenAuth = __webpack_require__(/*! ./controllers/esri-token-auth */ "./app/backend/controllers/esri-token-auth.js")(options.settings.esriTokenAuth);
        if (esriTokenAuth) {
            endpoint('/esri-token-auth', esriTokenAuth);
        }
        endpoint('/proj4def', __webpack_require__(/*! ./controllers/proj4lookup */ "./app/backend/controllers/proj4lookup.js")); // Proj4def lookup service, to avoid downloading all definitions into the client.
        endpoint('/convert', __webpack_require__(/*! ./controllers/convert */ "./app/backend/controllers/convert.js")(options).router); // OGR2OGR wrapper to allow supporting file types like Shapefile.
        endpoint('/proxyabledomains', __webpack_require__(/*! ./controllers/proxydomains */ "./app/backend/controllers/proxydomains.js")({
            proxyableDomains: options.settings.allowProxyFor,
            proxyAllDomains: !!options.settings.proxyAllDomains,
        }));
        endpoint('/serverconfig', __webpack_require__(/*! ./controllers/serverconfig */ "./app/backend/controllers/serverconfig.js")(options));
        var errorPage = __webpack_require__(/*! ./errorpage */ "./app/backend/errorpage.ts");
        var show404 = serveWwwRoot && exists(options.wwwroot + '/404.html');
        var error404 = errorPage.error404(show404, options.wwwroot, serveWwwRoot);
        var show500 = serveWwwRoot && exists(options.wwwroot + '/500.html');
        var error500 = errorPage.error500(show500, options.wwwroot);
        var initPaths = options.settings.initPaths || [];
        if (serveWwwRoot) {
            initPaths.push(path.join(options.wwwroot, 'init'));
        }
        app.use('/init', __webpack_require__(/*! ./controllers/initfile */ "./app/backend/controllers/initfile.js")(initPaths, error404, options.configDir));
        var feedbackService = __webpack_require__(/*! ./controllers/feedback */ "./app/backend/controllers/feedback.js")(options.settings.feedback);
        if (feedbackService) {
            endpoint('/feedback', feedbackService);
        }
        var shareService = __webpack_require__(/*! ./controllers/share */ "./app/backend/controllers/share.js")(options.settings.shareUrlPrefixes, options.settings.newShareUrlPrefix, options.hostName, options.port);
        if (shareService) {
            endpoint('/share', shareService);
        }
        app.use(error404);
        app.use(error500);
        var server = app;
        var osh = options.settings.https;
        if (osh && osh.key && osh.cert) {
            console.log('Launching in HTTPS mode.');
            var https = __webpack_require__(/*! https */ "https");
            server = https.createServer({
                key: fs.readFileSync(osh.key),
                cert: fs.readFileSync(osh.cert)
            }, app);
        }
        process.on('uncaughtException', function (err) {
            console.error(err.stack ? err.stack : err);
            process.exit(1);
        });
        return server;
    }
    log(message, worker1only) {
        if (!worker1only || cluster.isWorker && cluster.worker.id === 1) {
            console.log(message);
        }
    }
    endpoint(path, router) {
        if (options.verbose) {
            this.log('http://' + options.hostName + ':' + options.port + '/api/v1' + path, true);
        }
        if (path !== 'proxyabledomains') {
            // deprecated endpoint that isn't part of V1
            app.use('/api/v1' + path, router);
        }
        // deprecated endpoint at `/`
        app.use(path, router);
    }
}
module.exports = configureserver;


/***/ }),

/***/ "./app/backend/controllers/convert.js":
/*!********************************************!*\
  !*** ./app/backend/controllers/convert.js ***!
  \********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* jshint node: true */

var express = __webpack_require__(/*! express */ "express");
var fs = __webpack_require__(/*! fs */ "fs");
var ogr2ogr = __webpack_require__(/*! terriajs-ogr2ogr */ "terriajs-ogr2ogr");
var request = __webpack_require__(/*! request */ "request");
var formidable = __webpack_require__(/*! formidable */ "formidable");

var convert = {};

convert.testGdal = function() {
    // test doing 'something' with an empty GeoJSON object. It will either fail with ENOENT, or fail with OGR2OGR output.
    ogr2ogr({}).exec(function(error) {
        if ((error !== undefined) && error.message.match(/ENOENT/)) {
            console.log('Convert warning: ogr2ogr (gdal) is not installed or inaccessible, so the format conversion service will fail.');
        } else {
            // GDAL is installed ok.
        }
    });
};

function tooBigError(request, response) {
    response.header('Connection', 'close'); // stop the client from sending additional data.
    response.status(413) // Payload Too Large
            .send('This file is too big to convert. Maximum allowed size: ' + convert.maxConversionSize + ' bytes');
    console.log('Convert: uploaded file exceeds limit of ' + convert.maxConversionSize + ' bytes. Aborting.');
}

// Extract file name and path out of the provided HTTP POST form
function parseForm(req, res, callback) {
    var form = new formidable.IncomingForm();
    form.on('progress', function(bytesReceived, bytesExpected) {
        // Allow double because bytesReceived is the entire form, not just the file.
        if (bytesReceived > convert.maxConversionSize * 2) {
            var result = tooBigError(req, res);

            // remove any files already uploaded
            (form.openedFiles || []).forEach(function(file) {
                try {
                    fs.unlink(file.path);
                } catch(e) {
                }
            });

            return result;
        }
    });
    form.parse(req, function(err, fields, files) {
        if (fields.input_url !== undefined) {
            if (fields.input_url.indexOf('http') === 0) {
                callback(fields.input_url, fields.input_url, req, res);
            }
        } else if (files.input_file !== undefined) {
            if (files.input_file.size <= convert.maxConversionSize) {
                callback(files.input_file.path, files.input_file.name, req, res);
            } else {
                fs.unlink(files.input_file.path); // we have to delete the upload ourselves.
                return tooBigError(req, res);
            }
        }
    });
}

// Pass a stream to the OGR2OGR library, returning a GeoJSON result.
function convertStream(stream, req, res, hint, fpath) {
    var ogr = ogr2ogr(stream, hint)
                    .skipfailures()
                    .options(['-t_srs', 'EPSG:4326']);

    ogr.exec(function (er, data) {
        if (er) {
            console.error('Convert error: ' + er);
        }
        if (data !== undefined) {
            res.status(200).send(JSON.stringify(data));
        } else {
            res.status(415). // Unsupported Media Type
                send('Unable to convert this data file. For a list of formats supported by Terria, see http://www.gdal.org/ogr_formats.html .');
        }
        if (fpath) {
            fs.unlink(fpath); // clean up the temporary file on disk
        }
    });
}

function handleContent (fpath, fname, req, res) {
    if (!fpath) {
        return res.status(400).send('No file provided to convert.');
    }
    console.log('Convert: receiving file named ', fname);

    var hint = '';
    //simple hint for now, might need to crack zip files going forward
    if (fname.match(/\.zip$/)) {
        hint = 'shp';
    }
    if (fpath.indexOf('http') === 0) {
        var httpStream, abort = false;
        // Read file content by opening the URL given to us
        httpStream = request.get({url: fpath});
        httpStream.on('response', function(response) {
            var request = this, len = 0;
            convertStream(response, req, res, hint);
            response.on('data', function (chunk) {
                len += chunk.length;
                if (!abort && len > convert.maxConversionSize) {
                    tooBigError(request, res);
                    abort = true;
                    httpStream.abort(); // avoid fetching the entire file once we know it's too big. We'll probably get one or two chunks too many.
                    response.destroy();
                }
            });
            response.on('end', function() {
                console.log('Convert: received file of ' + len + ' bytes' + (abort ? ' (which we\'re discarding).' : '.'));
            });
        });
    } else {
        // Read file content embedded directly in POST data
        convertStream(fs.createReadStream(fpath), req, res, hint, fpath);
    }
}

// provide conversion to geojson service
// reguires install of gdal on server:
//   sudo apt-get install gdal-bin
convert.router = express.Router().post('/',  function(req, res) {
    parseForm(req, res, handleContent);
});


module.exports = function(options) {
    if (options) {
        convert.maxConversionSize = options.settings.maxConversionSize || 1000000;
    }
    return convert;
};

/***/ }),

/***/ "./app/backend/controllers/esri-token-auth.js":
/*!****************************************************!*\
  !*** ./app/backend/controllers/esri-token-auth.js ***!
  \****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* jshint node: true, esnext: true */

var router = __webpack_require__(/*! express */ "express").Router();
var request = __webpack_require__(/*! request */ "request");
var bodyParser = __webpack_require__(/*! body-parser */ "body-parser");
var url = __webpack_require__(/*! url */ "url");

module.exports = function(options) {
    if (!options || !options.servers) {
        return;
    }

    // The maximum size of the JSON data.
    let postSizeLimit = options.postSizeLimit || '1024';

    let tokenServers = parseUrls(options.servers);
    tokenServers = validateServerConfig(tokenServers);

    router.use(bodyParser.json({limit:postSizeLimit, type:'application/json'}));
    router.post('/', function(req, res, next) {
        let parameters = req.body;

        if (!parameters.url) {
            return res.status(400).send('No URL specified.');
        }

        let targetUrl = parseUrl(parameters.url);
        if (!targetUrl || (targetUrl.length === 0) || (typeof targetUrl !== 'string')) {
            return res.status(400).send('Invalid URL specified.');
        }

        let tokenServer = tokenServers[targetUrl];
        if (!tokenServer) {
            return res.status(400).send('Unsupported URL specified.');
        }

        request({
            url: tokenServer.tokenUrl,
            method: 'POST',
            headers: {
                'User-Agent': 'TerriaJSESRITokenAuth',
            },
            form:{
                username: tokenServer.username,
                password: tokenServer.password,
                f: 'JSON'
            }
        }, function(error, response, body) {
            try {
                res.set('Content-Type', 'application/json');

                if (response.statusCode !== 200) {
                    return res.status(502).send('Token server failed.');
                } else {
                    let value = JSON.parse(response.body);
                    return res.status(200).send(JSON.stringify(value));
                }
            }
            catch (error) {
                return res.status(500).send('Error processing server response.');
            }
        });
    });

    return router;
};

function parseUrls(servers) {
    let result = {};

    Object.keys(servers).forEach(server => {
        let parsedUrl = parseUrl(server)
        if (parsedUrl) {
            result[parsedUrl] = servers[server];
        }
        else {
            console.error('Invalid configuration. The URL: \'' + server + '\' is not valid.');
        }
    });

    return result;
}

function parseUrl(urlString) {
    try {
        return url.format(url.parse(urlString));
    }
    catch (error) {
        return '';
    }
}

function validateServerConfig(servers)
{
    let result = {};

    Object.keys(servers).forEach(url => {
        let server = servers[url];
        if (server.username && server.password && server.tokenUrl) {
            result[url] = server;

            // Note: We should really only validate URLs that are HTTPS to save us from ourselves, but the current
            // servers we need to support don't support HTTPS :( so the best that we can do is warn against it.
            if (!isHttps(server.tokenUrl)) {
                console.error('All communications should be TLS but the URL \'' + server.tokenUrl + '\' does not use https.');
            }
        } else {
            console.error('Bad Configuration. \'' + url + '\' does not supply all of the required properties.');
        }
    });

    return result;
}

function isHttps(urlString){
    try {
        return (url.parse(urlString).protocol === 'https:')
    }
    catch (error)
    {
        return false;
    }
}


/***/ }),

/***/ "./app/backend/controllers/feedback.js":
/*!*********************************************!*\
  !*** ./app/backend/controllers/feedback.js ***!
  \*********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* jshint node: true */


var bodyParser = __webpack_require__(/*! body-parser */ "body-parser");
var router = __webpack_require__(/*! express */ "express").Router();
var url = __webpack_require__(/*! url */ "url");
var request = __webpack_require__(/*! request */ "request");

module.exports = function(options) {
    if (!options || !options.issuesUrl || !options.accessToken) {
        return;
    }

    var parsedCreateIssueUrl = url.parse(options.issuesUrl, true);
    parsedCreateIssueUrl.query.access_token = options.accessToken;
    var createIssueUrl = url.format(parsedCreateIssueUrl);

    router.use(bodyParser.json());
    router.post('/', function(req, res, next) {
        var parameters = req.body;

        request({
            url: createIssueUrl,
            method: 'POST',
            headers: {
                'User-Agent': options.userAgent || 'TerriaBot (TerriaJS Feedback)',
                'Accept': 'application/vnd.github.v3+json'
            },
            body: JSON.stringify({
                title: parameters.title ? parameters.title : 'User Feedback',
                body: formatBody(req, parameters, options.additionalParameters)
            })
        }, function(error, response, body) {
            res.set('Content-Type', 'application/json');
            if (response.statusCode < 200 || response.statusCode >= 300) {
                res.status(response.statusCode).send(JSON.stringify({result: 'FAILED'}));
            } else {
                res.status(200).send(JSON.stringify({result: 'SUCCESS'}));
            }
        });

    });

    return router;
};

function formatBody(request, parameters, additionalParameters) {
    var result = '';

    result += parameters.comment ? parameters.comment : 'No comment provided';
    result += '\n### User details\n';
    result += '* Name: '          + (parameters.name ? parameters.name : 'Not provided') + '\n';
    result += '* Email Address: ' + (parameters.email ? parameters.email : 'Not provided') + '\n';
    result += '* IP Address: '    + request.ip + '\n';
    result += '* User Agent: '    + request.header('User-Agent') + '\n';
    result += '* Referrer: '      + request.header('Referrer') + '\n';
    result += '* Share URL: '     + (parameters.shareLink ? parameters.shareLink : 'Not provided') + '\n';
    if (additionalParameters) {
        additionalParameters.forEach((parameter) => {
            result += `* ${parameter.descriptiveLabel}: ${parameters[parameter.name] || 'Not provided'}\n`;
        });
    }

    return result;
}


/***/ }),

/***/ "./app/backend/controllers/initfile.js":
/*!*********************************************!*\
  !*** ./app/backend/controllers/initfile.js ***!
  \*********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* jshint node: true */

var express = __webpack_require__(/*! express */ "express");
var router = __webpack_require__(/*! express */ "express").Router();
var exists = __webpack_require__(/*! ../exists */ "./app/backend/exists.ts");
var path = __webpack_require__(/*! path */ "path");
/**
 * Special handling for /init/foo.json requests: look in initPaths, not just wwwroot/init
 * @param  {String[]} initPaths      Paths to look in, can be relative.
 * @param  {function} error404       Error page handler.
 * @param  {String} configFileBase   Directory to resolve relative paths from.
 * @return {Router}
 */
module.exports = function(initPaths, error404, configFileBase) {
    initPaths.forEach(function(initPath) {
        router.use(express.static(path.resolve(configFileBase, initPath)));
    });
    return router;
};

/***/ }),

/***/ "./app/backend/controllers/proj4lookup.js":
/*!************************************************!*\
  !*** ./app/backend/controllers/proj4lookup.js ***!
  \************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* jshint node: true */

var express = __webpack_require__(/*! express */ "express");
var router = express.Router();

var proj4 = __webpack_require__(/*! proj4 */ "proj4");

//TODO: check if this loads the file into each core and if so then,
__webpack_require__(/*! proj4js-defs/epsg */ "proj4js-defs/epsg")(proj4);


//provide REST service for proj4 definition strings
router.get('/:crs', function(req, res, next) {
    var epsg = proj4.defs[req.params.crs.toUpperCase()];
    if (epsg !== undefined) {
        res.status(200).send(epsg);
    } else {
        res.status(404).send('No proj4 definition available for this CRS.');
    }
});

module.exports = router;

/***/ }),

/***/ "./app/backend/controllers/proxy.js":
/*!******************************************!*\
  !*** ./app/backend/controllers/proxy.js ***!
  \******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* jshint node: true */


var basicAuth = __webpack_require__(/*! basic-auth */ "basic-auth");
var express = __webpack_require__(/*! express */ "express");
var defaultRequest = __webpack_require__(/*! request */ "request");
var url = __webpack_require__(/*! url */ "url");
var bodyParser = __webpack_require__(/*! body-parser */ "body-parser");
var rangeCheck = __webpack_require__(/*! range_check */ "range_check");

var DO_NOT_PROXY_REGEX = /^(?:Host|X-Forwarded-Host|Proxy-Connection|Connection|Keep-Alive|Transfer-Encoding|TE|Trailer|Proxy-Authorization|Proxy-Authenticate|Upgrade|Expires|pragma|Strict-Transport-Security)$/i;
var PROTOCOL_REGEX = /^\w+:\//;
var DURATION_REGEX = /^([\d.]+)(ms|s|m|h|d|w|y)$/;
var DURATION_UNITS = {
    ms: 1.0 / 1000,
    s: 1.0,
    m: 60.0,
    h: 60.0 * 60.0,
    d: 24.0 * 60.0 * 60.0,
    w: 7.0 * 24.0 * 60.0 * 60.0,
    y: 365 * 24.0 * 60.0 * 60.0
};
/** Age to override cache instructions with for proxied files */
var DEFAULT_MAX_AGE_SECONDS = 1209600; // two weeks

/**
 * Creates an express middleware that proxies calls to '/proxy/http://example' to 'http://example', while forcing them
 * to be cached by the browser and overrwriting CORS headers. A cache duration can be added with a URL like
 * /proxy/_5m/http://example which causes 'Cache-Control: public,max-age=300' to be added to the response headers.
 *
 * @param {Object} options
 * @param {Array[String]} options.proxyableDomains An array of domains to be proxied
 * @param {boolean} options.proxyAllDomains A boolean indicating whether or not we should proxy ALL domains - overrides
 *                      the configuration in options.proxyDomains
 * @param {String} options.proxyAuth A map of domains to tokens that will be passed to those domains via basic auth
 *                      when proxying through them.
 * @param {String} options.upstreamProxy Url of a standard upstream proxy that will be used to retrieve data.
 * @param {String} options.bypassUpstreamProxyHosts An object of hosts (as strings) to 'true' values.
 * @param {String} options.proxyPostSizeLimit The maximum size of a POST request that the proxy will allow through,
                        in bytes if no unit is specified, or some reasonable unit like 'kb' for kilobytes or 'mb' for megabytes.
 *
 * @returns {*} A middleware that can be used with express.
 */
module.exports = function(options) {
    var request = options.request || defaultRequest; //overridable for tests
    var proxyAllDomains = options.proxyAllDomains;
    var proxyDomains = options.proxyableDomains || [];
    var proxyAuth = options.proxyAuth || {};
    var proxyPostSizeLimit = options.proxyPostSizeLimit || '102400';
    
    // If you change this, also change the same list in serverconfig.json.example.
    // This page is helpful: https://en.wikipedia.org/wiki/Reserved_IP_addresses
    var blacklistedAddresses = options.blacklistedAddresses || [
        // loopback addresses
        '127.0.0.0/8',
        '::1/128',
        // link local addresses
        '169.254.0.0/16',
        'fe80::/10',
        // private network addresses
        '10.0.0.0/8',
        '172.16.0.0/12',
        '192.168.0.0/16',
        'fc00::/7',
        // other
        '0.0.0.0/8',
        '100.64.0.0/10',
        '192.0.0.0/24',
        '192.0.2.0/24',
        '198.18.0.0/15',
        '192.88.99.0/24',
        '198.51.100.0/24',
        '203.0.113.0/24',
        '224.0.0.0/4',
        '240.0.0.0/4',
        '255.255.255.255/32',
        '::/128',
        '2001:db8::/32',
        'ff00::/8'
    ];

    //Non CORS hosts and domains we proxy to
    function proxyAllowedHost(host) {
        // Exclude hosts that are really IP addresses and are in our blacklist.
        if (rangeCheck.inRange(host, blacklistedAddresses)) {
            return false;
        }

        if (proxyAllDomains) {
            return true;
        }

        host = host.toLowerCase();
        //check that host is from one of these domains
        for (var i = 0; i < proxyDomains.length; i++) {
            if (host.indexOf(proxyDomains[i], host.length - proxyDomains[i].length) !== -1) {
                return true;
            }
        }
        return false;
    }

    function doProxy(req, res, next, retryWithoutAuth, callback) {
        var remoteUrlString = req.url.substring(1);

        if (!remoteUrlString || remoteUrlString.length === 0) {
            return res.status(400).send('No url specified.');
        }

        // Does the proxy URL include a max age?
        var maxAgeSeconds = DEFAULT_MAX_AGE_SECONDS;
        if (remoteUrlString[0] === '_') {
            var slashIndex = remoteUrlString.indexOf('/');
            if (slashIndex < 0) {
                return res.status(400).send('No url specified.');
            }

            var maxAgeString = remoteUrlString.substring(1, slashIndex);
            remoteUrlString = remoteUrlString.substring(slashIndex + 1);

            if (remoteUrlString.length === 0) {
                return res.status(400).send('No url specified.');
            }

            // Interpret the max age as a duration in Varnish notation.
            // https://www.varnish-cache.org/docs/trunk/reference/vcl.html#durations
            var parsedMaxAge = DURATION_REGEX.exec(maxAgeString);
            if (!parsedMaxAge || parsedMaxAge.length < 3) {
                return res.status(400).send('Invalid duration.');
            }

            var value = parseFloat(parsedMaxAge[1]);
            if (value !== value) {
                return res.status(400).send('Invalid duration.');
            }

            var unitConversion = DURATION_UNITS[parsedMaxAge[2]];
            if (!unitConversion) {
                return res.status(400).send('Invalid duration unit ' + parsedMaxAge[2]);
            }

            maxAgeSeconds = value * unitConversion;
        }

        // Add http:// if no protocol is specified.
        var protocolMatch = PROTOCOL_REGEX.exec(remoteUrlString);
        if (!protocolMatch || protocolMatch.length < 1) {
            remoteUrlString = 'http://' + remoteUrlString;
        } else {
            var matchedPart = protocolMatch[0];

            // If the protocol portion of the URL only has a single slash after it, the extra slash was probably stripped off by someone
            // along the way (NGINX will do this).  Add it back.
            if (remoteUrlString[matchedPart.length] !== '/') {
                remoteUrlString = matchedPart + '/' + remoteUrlString.substring(matchedPart.length);
            }
        }

        var remoteUrl = url.parse(remoteUrlString);

        // Copy the query string
        remoteUrl.search = url.parse(req.url).search;

        if (!remoteUrl.protocol) {
            remoteUrl.protocol = 'http:';
        }

        var proxy;
        if (options.upstreamProxy && !((options.bypassUpstreamProxyHosts || {})[remoteUrl.host])) {
            proxy = options.upstreamProxy;
        }

        // Are we allowed to proxy for this host?
        if (!proxyAllowedHost(remoteUrl.host)) {
            res.status(403).send('Host is not in list of allowed hosts: ' + remoteUrl.host);
            return;
        }

        // encoding : null means "body" passed to the callback will be raw bytes

        var proxiedRequest;
        req.on('close', function() {
            if (proxiedRequest) {
                proxiedRequest.abort();
            }
        });

        var filteredReqHeaders = filterHeaders(req.headers);
        if (filteredReqHeaders['x-forwarded-for']) {
            filteredReqHeaders['x-forwarded-for'] = filteredReqHeaders['x-forwarded-for'] + ', ' + req.connection.remoteAddress;
        } else {
            filteredReqHeaders['x-forwarded-for'] = req.connection.remoteAddress;
        }

        // Remove the Authorization header if we used it to authenticate the request to terriajs-server.
        if (options.basicAuthentication && options.basicAuthentication.username && options.basicAuthentication.password) {
            delete filteredReqHeaders['authorization'];
        }

        if (!retryWithoutAuth) {
            var authRequired = proxyAuth[remoteUrl.host];
            if (authRequired) {
                if (authRequired.authorization) {
                    // http basic auth.
                    if (!filteredReqHeaders['authorization']) {
                        filteredReqHeaders['authorization'] = authRequired.authorization;
                    }
                }
                if (authRequired.headers) {
                    // a mechanism to pass arbitrary headers.
                    authRequired.headers.forEach(function(header) {
                        filteredReqHeaders[header.name] = header.value;
                    });
                }
            }
        }

        proxiedRequest = callback(remoteUrl, filteredReqHeaders, proxy, maxAgeSeconds);
    }

    function buildReqHandler(httpVerb) {
        function handler(req, res, next) {
            return doProxy(req, res, next, req.retryWithoutAuth, function(remoteUrl, filteredRequestHeaders, proxy, maxAgeSeconds) {
                try {
                    var proxiedRequest = request({
                        method: httpVerb,
                        url: url.format(remoteUrl),
                        headers: filteredRequestHeaders,
                        encoding: null,
                        proxy: proxy,
                        body: req.body,
                        followRedirect: function(response) {
                            var location = response.headers.location;
                            if (location && location.length > 0) {
                                var parsed = url.parse(location);
                                if (proxyAllowedHost(parsed.host)) {
                                    // redirect is ok
                                    return true;
                                }
                            }
                            // redirect is forbidden
                            return false;
                        }
                    }).on('socket', function(socket) {
                        socket.once('lookup', function(err, address, family, host) {
                            if (rangeCheck.inRange(address, blacklistedAddresses)) {
                                res.status(403).send('IP address is not allowed: ' + address);
                                res.end();
                                proxiedRequest.abort();
                            }
                        });
                    }).on('error', function(err) {
                        console.error(err);

                        // Ideally we would return an error to the client, but if headers have already been sent,
                        // attempting to set a status code here will fail. So in that case, we'll just end the response,
                        // for lack of a better option.
                        if (res.headersSent) {
                            res.end();
                        } else {
                            res.status(500).send('Proxy error');
                        }
                    }).on('response', function(response) {
                        if (!req.retryWithoutAuth && response.statusCode === 403 && proxyAuth[remoteUrl.host]) {
                            // We automatically added an authentication header to this request (e.g. from proxyauth.json),
                            // but got back a 403, indicating our credentials didn't authorize access to this resource.
                            // Try again without credentials in order to give the user the opportunity to supply
                            // their own.
                            req.retryWithoutAuth = true;
                            return handler(req, res, next);
                        }

                        res.status(response.statusCode);
                        res.header(processHeaders(response.headers, maxAgeSeconds));
                        response.on('data', function(chunk) {
                            res.write(chunk);
                        });
                        response.on('end', function() {
                            res.end();
                        });
                    });
                } catch (e) {
                    console.error(e.stack);
                    res.status(500).send('Proxy error');
                }

                return proxiedRequest;
            });
        }

        return handler;
    }

    var router = express.Router();
    router.get('/*', buildReqHandler('GET'));
    router.post('/*', bodyParser.raw({type: function() { return true;}, limit: proxyPostSizeLimit}), buildReqHandler('POST'));

    return router;
};

/**
 * Filters headers that are not matched by {@link DO_NOT_PROXY_REGEX} out of an object containing headers. This does not
 * mutate the original list.
 *
 * @param headers The headers to filter
 * @returns {Object} A new object with the filtered headers.
 */
function filterHeaders(headers) {
    var result = {};
    // filter out headers that are listed in the regex above
    Object.keys(headers).forEach(function(name) {
        if (!DO_NOT_PROXY_REGEX.test(name)) {
            result[name] = headers[name];
        }
    });

    return result;
}

/**
 * Filters out headers that shouldn't be proxied, overrides caching so files are retained for {@link DEFAULT_MAX_AGE_SECONDS},
 * and sets CORS headers to allow all origins
 *
 * @param headers The original object of headers. This is not mutated.
 * @param maxAgeSeconds the amount of time in seconds to cache for. This will override what the original server
 *          specified because we know better than they do.
 * @returns {Object} The new headers object.
 */
function processHeaders(headers, maxAgeSeconds) {
    var result = filterHeaders(headers);

    result['Cache-Control'] = 'public,max-age=' + maxAgeSeconds;
    result['Access-Control-Allow-Origin'] = '*';

    return result;
}


/***/ }),

/***/ "./app/backend/controllers/proxydomains.js":
/*!*************************************************!*\
  !*** ./app/backend/controllers/proxydomains.js ***!
  \*************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* jshint node: true */

var router = __webpack_require__(/*! express */ "express").Router();

module.exports = function(options) {
    router.get('/', function(req, res, next) {
        res.status(200).send(options);
    });
    return router;
};

/***/ }),

/***/ "./app/backend/controllers/serverconfig.js":
/*!*************************************************!*\
  !*** ./app/backend/controllers/serverconfig.js ***!
  \*************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* jshint node: true, esnext: true */

var express = __webpack_require__(/*! express */ "express");

// Expose a whitelisted set of configuration attributes to the world. This definitely doesn't include authorisation tokens, local file paths, etc.
// It mirrors the structure of the real config file.
module.exports = function(options) {
    var router = express.Router();
    var settings = Object.assign({}, options.settings), safeSettings = {};
    var safeAttributes = ['allowProxyFor', 'maxConversionSize', 'newShareUrlPrefix', 'proxyAllDomains'];
    safeAttributes.forEach(key => safeSettings[key] = settings[key]);
    safeSettings.version = __webpack_require__(/*! ../../../package.json */ "./package.json").version;
    if (typeof settings.shareUrlPrefixes === 'object') {
        safeSettings.shareUrlPrefixes = {};
        Object.keys(settings.shareUrlPrefixes).forEach(function(key) {
            safeSettings.shareUrlPrefixes[key] = { service: settings.shareUrlPrefixes[key].service };
        });
    }
    if (settings.feedback && settings.feedback.additionalParameters) {
        safeSettings.additionalFeedbackParameters = settings.feedback.additionalParameters;
    }

    router.get('/', function(req, res, next) {
        res.status(200).send(safeSettings);
    });
    return router;
};


/***/ }),

/***/ "./app/backend/controllers/share.js":
/*!******************************************!*\
  !*** ./app/backend/controllers/share.js ***!
  \******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* jshint node: true, esnext: true */


var bodyParser = __webpack_require__(/*! body-parser */ "body-parser");
var requestp = __webpack_require__(/*! request-promise */ "request-promise");
var rperrors = __webpack_require__(/*! request-promise/errors */ "request-promise/errors");

var gistAPI = 'https://api.github.com/gists';
var googleUrlShortenerAPI = 'https://www.googleapis.com/urlshortener/v1';

var prefixSeparator = '-'; // change the regex below if you change this
var splitPrefixRe = /^(([^-]+)-)?(.*)$/;

//You can test like this with httpie:
//echo '{ "test": "me" }' | http post localhost:3001/api/v1/share
function makeGist(serviceOptions, body) {
    var gistFile = {};
    gistFile[serviceOptions.gistFilename || 'usercatalog.json'] = { content: body };

    var headers = {
        'User-Agent': serviceOptions.userAgent || 'TerriaJS-Server',
        'Accept': 'application/vnd.github.v3+json'
    };
    if (serviceOptions.accessToken !== undefined) {
        headers['Authorization'] = 'token ' + serviceOptions.accessToken;
    }
    return requestp({
        url: gistAPI,
        method: 'POST',
        headers: headers,
        json: true,
        body: {
            files: gistFile,
            description: (serviceOptions.gistDescription || 'User-created catalog'),
            public: false
        }, transform: function(body, response) {
            if (response.statusCode === 201) {
                console.log('Created ID ' + response.body.id + ' using Gist service');
                return response.body.id;
            } else {
                return response;
            }
        }
    });
}

// Test: http localhost:3001/api/v1/share/g-98e01625db07a78d23b42c3dbe08fe20
function resolveGist(serviceOptions, id) {
    var headers = {
        'User-Agent': serviceOptions.userAgent || 'TerriaJS-Server',
        'Accept': 'application/vnd.github.v3+json'
    };
    if (serviceOptions.accessToken !== undefined) {
        headers['Authorization'] = 'token ' + serviceOptions.accessToken;
    }
    return requestp({
        url: gistAPI + '/' + id,
        headers: headers,
        json: true,
        transform: function(body, response) {
            if (response.statusCode >= 300) {
                return response;
            } else {
                return body.files[Object.keys(body.files)[0]].content; // find the contents of the first file in the gist
            }
        }
    });
}
/*
  Generate short ID by hashing body, converting to base62 then truncating.
 */
function shortId(body, length) {
    var hmac = __webpack_require__(/*! crypto */ "crypto").createHmac('sha1', body).digest();
    var base62 = __webpack_require__(/*! base-x */ "base-x")('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');
    var fullkey = base62.encode(hmac);
    return fullkey.slice(0, length); // if length undefined, return the whole thing
}

var _S3;

function S3(serviceOptions) {
    if (_S3) {
        return _S3;
    } else {
        var aws = __webpack_require__(/*! aws-sdk */ "aws-sdk");
        aws.config.setPromisesDependency(__webpack_require__(/*! when */ "when").Promise);
        aws.config.update({
            region: serviceOptions.region
        });
        // if no credentials provided, we assume that they're being provided as environment variables or in a file
        if (serviceOptions.accessKeyId) {
            aws.config.update({
                accessKeyId: serviceOptions.accessKeyId,
                secretAccessKey: serviceOptions.secretAccessKey
            });
        }
        _S3 = new aws.S3();
        return _S3;
    }
}

// We append some pseudo-dir prefixes into the actual object ID to avoid thousands of objects in a single pseudo-directory.
// MyRaNdoMkey => M/y/MyRaNdoMkey
const idToObject = (id) => id.replace(/^(.)(.)/, '$1/$2/$1$2');

function saveS3(serviceOptions, body) {
    var id = shortId(body, serviceOptions.keyLength);
    const params = {
        Bucket: serviceOptions.bucket,
        Key: idToObject(id),
        Body: body
    };

    return S3(serviceOptions).putObject(params).promise()
        .then(function(result) {
            console.log('Saved key ' + id + ' to S3 bucket ' + params.Bucket + ':' + params.Key + '. Etag: ' + result.ETag);
            return id;
        }).catch(function(e) {
            console.error(e);
            return e;
        });
}

function resolveS3(serviceOptions, id) {
    const params = {
        Bucket: serviceOptions.bucket,
        Key: idToObject(id)
    };
    return S3(serviceOptions).getObject(params).promise()
    .then(function(data) {
        return data.Body;
    }).catch(function(e) {
        throw {
            response: e,
            error: e.message
        };
    });
}


// Test: http localhost:3001/api/v1/share/q3nxPd
function resolveGoogleUrl(serviceOptions, id) {
    var shortUrl = 'http://goo.gl/' + id;
    console.log(shortUrl);
    return requestp({
        url: googleUrlShortenerAPI + '/url?key=' + serviceOptions.apikey + '&shortUrl=' + shortUrl,
        headers: {
            'User-Agent': serviceOptions.userAgent || 'TerriaJS-Server',
        },
        json: true,
        transform: function(body, response) {
            if (response.statusCode >= 300) {
                return response;
            } else {
                // Our Google URLs look like "http://nationalmap.gov.au/#share=%7B...%7D" but there might be other URL parameters before or after
                // We just want the encoded JSON (%7B..%7D), not the whole URL.
                return decodeURIComponent(body.longUrl.match(/(%7B.*%7D)(&.*)$/)[1]);
            }
        }
    });
}

module.exports = function(shareUrlPrefixes, newShareUrlPrefix, hostName, port) {
    if (!shareUrlPrefixes) {
        return;
    }

    var router = __webpack_require__(/*! express */ "express").Router();
    router.use(bodyParser.text({type: '*/*'}));

    // Requested creation of a new short URL.
    router.post('/', function(req, res, next) {
        if (newShareUrlPrefix === undefined || !shareUrlPrefixes[newShareUrlPrefix]) {
            return res.status(404).json({ message: "This server has not been configured to generate new share URLs." });
        }
        var serviceOptions = shareUrlPrefixes[newShareUrlPrefix];
        var minter = {
            'gist': makeGist,
            's3': saveS3
            }[serviceOptions.service.toLowerCase()];

        minter(serviceOptions, req.body).then(function(id) {
            id = newShareUrlPrefix + prefixSeparator + id;
            var resPath = req.baseUrl + '/' + id;
            // these properties won't behave correctly unless "trustProxy: true" is set in user's options file.
            // they may not behave correctly (especially port) when behind multiple levels of proxy
            var resUrl =
                req.protocol + '://' +
                req.hostname +
                (req.header('X-Forwarded-Port') || port) +
                resPath;
            res .location(resUrl)
                .status(201)
                .json({ id: id, path: resPath, url: resUrl });
        }).catch(rperrors.TransformError, function (reason) {
            console.error(JSON.stringify(reason, null, 2));
            res.status(500).json({ message: reason.cause.message });
        }).catch(function(reason) {
            console.warn(JSON.stringify(reason, null, 2));
            res.status(500) // probably safest if we always return a consistent error code
                .json({ message: reason.error });
        });
    });

    // Resolve an existing ID. We break off the prefix and use it to work out which resolver to use.
    router.get('/:id', function(req, res, next) {
        var prefix = req.params.id.match(splitPrefixRe)[2] || '';
        var id = req.params.id.match(splitPrefixRe)[3];
        var resolver;

        var serviceOptions = shareUrlPrefixes[prefix];
        if (!serviceOptions) {
            console.error('Share: Unknown prefix to resolve "' + prefix + '", id "' + id + '"');
            return res.status(400).send('Unknown share prefix "' + prefix + '"');
        } else {
            resolver = {
                'gist': resolveGist,
                'googleurlshortener': resolveGoogleUrl,
                's3': resolveS3
            }[serviceOptions.service.toLowerCase()];
        }
        resolver(serviceOptions, id).then(function(content) {
            res.send(content);
        }).catch(rperrors.TransformError, function (reason) {
            console.error(JSON.stringify(reason, null, 2));
            res.status(500).send(reason.cause.message);
        }).catch(function(reason) {
            console.warn(JSON.stringify(reason.response, null, 2));
            res.status(404) // probably safest if we always return 404 rather than whatever the upstream provider sets.
                .send(reason.error);
        });
    });
    return router;
};


/***/ }),

/***/ "./app/backend/database.ts":
/*!*********************************!*\
  !*** ./app/backend/database.ts ***!
  \*********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

class database {
    constructor(type, host, username, password, connection) {
        this.type = type;
        this.host = host;
        this.username = username;
        this.password = password;
        this.connection = connection;
    }
    getStatus() {
        return this.connection.state;
    }
}
module.exports = database;


/***/ }),

/***/ "./app/backend/databases/mysql/mysql.js":
/*!**********************************************!*\
  !*** ./app/backend/databases/mysql/mysql.js ***!
  \**********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var mysql = __webpack_require__(/*! mysql */ "mysql");
var config = __webpack_require__(/*! ../../../dbconfig.json */ "./app/dbconfig.json");

var con = mysql.createConnection({
	host: config.database.host,
	user: config.database.username,
	password: config.database.password
});

con.connect(function(err) {
	if (err) throw err;
	console.log("Database established.");
});

module.exports = con;

/***/ }),

/***/ "./app/backend/errorpage.ts":
/*!**********************************!*\
  !*** ./app/backend/errorpage.ts ***!
  \**********************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports.error404 = function (show404, wwwroot, serveWwwRoot) {
    return function (req, res, next) {
        if (show404) {
            res.status(404).sendFile(wwwroot + '/404.html');
        }
        else if (serveWwwRoot) {
            // Redirect unknown pages back home.
            res.redirect(303, '/');
        }
        else {
            res.status(404).send('No TerriaJS website here.');
        }
    };
};
module.exports.error500 = function (show500, wwwroot) {
    return function (error, req, res, next) {
        console.error(error);
        if (show500) {
            res.status(500).sendFile(wwwroot + '/500.html');
        }
        else {
            res.status(500).send('500: Internal Server Error');
        }
    };
};


/***/ }),

/***/ "./app/backend/exists.ts":
/*!*******************************!*\
  !*** ./app/backend/exists.ts ***!
  \*******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var fs = __webpack_require__(/*! fs */ "fs");
module.exports = function exists(pathName) {
    try {
        fs.statSync(pathName);
        return true;
    }
    catch (e) {
        return false;
    }
};


/***/ }),

/***/ "./app/backend/options.ts":
/*!********************************!*\
  !*** ./app/backend/options.ts ***!
  \********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var exists = __webpack_require__(/*! ./exists */ "./app/backend/exists.ts");
var fs = __webpack_require__(/*! fs */ "fs");
var json5 = __webpack_require__(/*! json5 */ "json5");
var path = __webpack_require__(/*! path */ "path");
class options {
    getFilePath(fileName, warn) {
        if (exists(fileName)) {
            return fileName;
        }
        else if (warn) {
            console.warn("Warning: Can\'t open '" + fileName + "'.");
        }
    }
    getConfigFile(argFileName, defaultFileName) {
        return argFileName ? this.getFilePath(argFileName, true) : this.getFilePath(defaultFileName, true);
    }
    /**
     * Gets a config file using require, logging a warning and defaulting to a backup value in the event of a failure.
     *
     * @param filePath The path to look for the config file.
     * @param configFileType What kind of config file is this? E.g. config, auth etc.
     * @param failureConsequence The consequence of using the defaultValue when this file fails to load - this will be logged
     *        as part of the warning
     * @returns {*} The config, either from the filePath or a default.
     */
    getConfig(filePath, configFileType, failureConsequence, quiet) {
        var config;
        try {
            var fileContents = fs.readFileSync(filePath, 'utf8');
            // Strip comments formatted as lines starting with a #, before parsing as JSON5. #-initial comments are deprecated, will be removed in version 3.
            config = json5.parse(fileContents.replace(/^\s*#.*$/mg, ''));
            if (!quiet) {
                console.log('Using ' + configFileType + ' file "' + fs.realpathSync(filePath) + '".');
            }
        }
        catch (e) {
            if (!quiet) {
                var loggedFilePath = filePath ? ' "' + filePath + '"' : '';
                if (!(loggedFilePath === '' && configFileType === 'proxyAuth')) {
                    console.warn('Warning: Can\'t open ' + configFileType + ' file' + loggedFilePath + '. ' + failureConsequence + '.\n');
                }
            }
            config = {};
        }
        return config;
    }
    loadCommandLine() {
        var yargs = __webpack_require__(/*! yargs */ "yargs")
            .usage('$0 [options] [path/to/wwwroot]')
            .strict()
            .options({
            'port': {
                'description': 'Port to listen on.                [default: 3001]',
                number: true,
            },
            'public': {
                'type': 'boolean',
                'default': true,
                'description': 'Run a public server that listens on all interfaces.'
            },
            'config-file': {
                'description': 'File containing settings such as allowed domains to proxy. See serverconfig.json.example'
            },
            'proxy-auth': {
                'description': 'File containing auth information for proxied domains. See proxyauth.json.example'
            },
            'verbose': {
                'description': 'Produce more output and logging.',
                'type': 'boolean',
                'default': false
            },
            'help': {
                'alias': 'h',
                'type': 'boolean',
                'description': 'Show this help.'
            }
        });
        if (yargs.argv.help) {
            yargs.showHelp();
            process.exit();
        }
        // Yargs unhelpfully turns "--option foo --option bar" into { option: ["foo", "bar"] }.
        // Hence replace arrays with the rightmost value. This matters when `npm run` has options
        // built into it, and the user wants to override them with `npm run -- --port 3005` or something.
        // Yargs also seems to have setters, hence why we have to make a shallow copy.
        var argv = Object.assign({}, yargs.argv);
        Object.keys(argv).forEach(function (k) {
            if (k !== '_' && Array.isArray(argv[k])) {
                argv[k] = argv[k][argv[k].length - 1];
            }
        });
        return argv;
    }
    init(quiet) {
        var argv = this.loadCommandLine();
        this.listenHost = argv.public ? undefined : 'localhost';
        this.configFile = this.getConfigFile(argv.configFile, 'serverconfig.json');
        this.settings = this.getConfig(this.configFile, 'config', 'ALL proxy requests will be accepted.', quiet);
        this.proxyAuthFile = this.getConfigFile(argv.proxyAuth, 'proxyauth.json');
        this.proxyAuth = this.getConfig(this.proxyAuthFile, 'proxyAuth', 'Proxying to servers that require authentication will fail', quiet);
        if (!this.proxyAuth || Object.keys(this.proxyAuth).length === 0) {
            this.proxyAuth = this.settings.proxyAuth || {};
        }
        this.port = argv.port || this.settings.port || 3001;
        this.wwwroot = argv._.length > 0 ? argv._[0] : process.cwd() + '/wwwroot';
        this.configDir = argv.configFile ? path.dirname(argv.configFile) : '.';
        this.verbose = argv.verbose;
        this.hostName = this.listenHost || this.settings.hostName || 'localhost';
        this.settings.proxyAllDomains = this.settings.proxyAllDomains || typeof this.settings.allowProxyFor === 'undefined';
        return options;
    }
}
module.exports = options;


/***/ }),

/***/ "./app/dbconfig.json":
/*!***************************!*\
  !*** ./app/dbconfig.json ***!
  \***************************/
/*! exports provided: database, default */
/***/ (function(module) {

module.exports = {"database":{"type":"mysql","host":"localhost","username":"","password":""}};

/***/ }),

/***/ "./package.json":
/*!**********************!*\
  !*** ./package.json ***!
  \**********************/
/*! exports provided: name, version, description, license, engines, repository, dependencies, config, devDependencies, scripts, default */
/***/ (function(module) {

module.exports = {"name":"terriajs-map","version":"0.0.1","description":"Geospatial catalog explorer based on TerriaJS.","license":"Apache-2.0","engines":{"node":">= 5.1.0","npm":">= 3.0.0"},"repository":{"type":"git","url":"http://github.com/TerriaJS/TerriaMap"},"dependencies":{"@types/node":"^10.12.18","terriajs-server":"^2.7.4","webpack":"^4.28.2"},"config":{"awsProfile":"terria","awsS3PackagesPath":"s3://terria-apps/map","awsRegion":"ap-southeast-2","awsEc2InstanceType":"t2.small","awsEc2ImageId":"ami-0d9ca8d416482590e","awsKeyName":"terria-kring","awsS3ServerConfigOverridePath":"s3://terria-apps/map/privateserverconfig-2016-08-31.json","awsS3ClientConfigOverridePath":"s3://terria-apps/map/privateclientconfig-2018-11-19.json","docker":{"name":"data61/terria-terriamap","include":"wwwroot node_modules devserverconfig.json index.js package.json version.js"}},"devDependencies":{"@webpack-cli/migrate":"^0.1.2","babel-eslint":"^7.0.0","babel-loader":"^7.0.0","babel-plugin-jsx-control-statements":"^3.2.8","babel-preset-env":"^1.6.1","babel-preset-react":"^6.5.0","css-loader":"^0.28.0","ejs":"^2.5.2","eslint":"^4.9.0","eslint-plugin-jsx-control-statements":"^2.2.0","eslint-plugin-react":"^7.2.1","extract-text-webpack-plugin":"^3.0.0","file-loader":"^1.1.5","fs-extra":"^4.0.0","generate-terriajs-schema":"^1.3.0","gulp":"^3.9.1","gulp-util":"^3.0.7","json5":"^0.5.0","mini-css-extract-plugin":"^0.5.0","mysql":"^2.16.0","node-notifier":"^5.1.2","node-sass":"^4.0.0","prop-types":"^15.6.0","raw-loader":"^0.5.1","react":"^16.3.2","react-dom":"^16.3.2","redbox-react":"^1.3.6","resolve-url-loader":"^2.0.2","sass-loader":"^6.0.3","semver":"^5.0.0","style-loader":"^0.19.1","svg-sprite-loader":"^3.4.0","terriajs":"6.3.6","terriajs-catalog-editor":"^0.2.0","terriajs-cesium":"1.51.0","terriajs-schema":"latest","ts-loader":"^5.3.2","typescript":"^3.2.2","typings-for-css-modules-loader":"^1.7.0","urijs":"^1.18.12","url-loader":"^0.5.7","webpack-dev-server":"^2.9.2","webpack-node-externals":"^1.7.2","yargs":"^11.0.0"},"scripts":{"gulp-frontend":"gulp build-frontend","gulp-backend":"gulp build-backend","start-frontend":"./node_modules/.bin/webpack-dev-server --config webpack-frontend.config.js --open","start":"bash ./node_modules/terriajs-server/run_server.sh --config-file serverconfig.json","stop":"bash ./node_modules/terriajs-server/stop_server.sh","docker-build-local":"node ./deploy/docker/create-docker-context-for-node-components.js --build --push --tag auto --local","docker-build-prod":"node ./deploy/docker/create-docker-context-for-node-components.js --build --push --tag auto","docker-build-ci":"node ./deploy/docker/create-docker-context-for-node-components.js --build","postinstall":"echo 'Installation successful. What to do next:\\n  npm start       # Starts the server on port 3001\\n  gulp watch      # Builds TerriaMap and dependencies, and rebuilds if files change.'","hot":"webpack-dev-server --inline --config buildprocess/webpack.config.hot.js --hot --host 0.0.0.0","deploy":"rm -rf node_modules && npm install && npm run deploy-without-reinstall","deploy-without-reinstall":"gulp clean && gulp release && npm run deploy-current","deploy-current":"npm run get-deploy-overrides && gulp make-package --serverConfigOverride ./privateserverconfig.json --clientConfigOverride ./wwwroot/privateconfig.json && cd deploy/aws && ./stack create && cd ../..","get-deploy-overrides":"aws s3 --profile $npm_package_config_awsProfile cp $npm_package_config_awsS3ServerConfigOverridePath ./privateserverconfig.json && aws s3 --profile $npm_package_config_awsProfile cp $npm_package_config_awsS3ClientConfigOverridePath ./wwwroot/privateconfig.json"}};

/***/ }),

/***/ 0:
/*!**********************************!*\
  !*** multi ./app/backend/app.ts ***!
  \**********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(/*! ./app/backend/app.ts */"./app/backend/app.ts");


/***/ }),

/***/ "aws-sdk":
/*!**************************!*\
  !*** external "aws-sdk" ***!
  \**************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("aws-sdk");

/***/ }),

/***/ "base-x":
/*!*************************!*\
  !*** external "base-x" ***!
  \*************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("base-x");

/***/ }),

/***/ "basic-auth":
/*!*****************************!*\
  !*** external "basic-auth" ***!
  \*****************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("basic-auth");

/***/ }),

/***/ "body-parser":
/*!******************************!*\
  !*** external "body-parser" ***!
  \******************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("body-parser");

/***/ }),

/***/ "cluster":
/*!**************************!*\
  !*** external "cluster" ***!
  \**************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("cluster");

/***/ }),

/***/ "compression":
/*!******************************!*\
  !*** external "compression" ***!
  \******************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("compression");

/***/ }),

/***/ "cors":
/*!***********************!*\
  !*** external "cors" ***!
  \***********************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("cors");

/***/ }),

/***/ "crypto":
/*!*************************!*\
  !*** external "crypto" ***!
  \*************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("crypto");

/***/ }),

/***/ "express":
/*!**************************!*\
  !*** external "express" ***!
  \**************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("express");

/***/ }),

/***/ "express-brute":
/*!********************************!*\
  !*** external "express-brute" ***!
  \********************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("express-brute");

/***/ }),

/***/ "formidable":
/*!*****************************!*\
  !*** external "formidable" ***!
  \*****************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("formidable");

/***/ }),

/***/ "fs":
/*!*********************!*\
  !*** external "fs" ***!
  \*********************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("fs");

/***/ }),

/***/ "https":
/*!************************!*\
  !*** external "https" ***!
  \************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("https");

/***/ }),

/***/ "json5":
/*!************************!*\
  !*** external "json5" ***!
  \************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("json5");

/***/ }),

/***/ "morgan":
/*!*************************!*\
  !*** external "morgan" ***!
  \*************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("morgan");

/***/ }),

/***/ "mysql":
/*!************************!*\
  !*** external "mysql" ***!
  \************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("mysql");

/***/ }),

/***/ "net":
/*!**********************!*\
  !*** external "net" ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("net");

/***/ }),

/***/ "os":
/*!*********************!*\
  !*** external "os" ***!
  \*********************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("os");

/***/ }),

/***/ "path":
/*!***********************!*\
  !*** external "path" ***!
  \***********************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("path");

/***/ }),

/***/ "proj4":
/*!************************!*\
  !*** external "proj4" ***!
  \************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("proj4");

/***/ }),

/***/ "proj4js-defs/epsg":
/*!************************************!*\
  !*** external "proj4js-defs/epsg" ***!
  \************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("proj4js-defs/epsg");

/***/ }),

/***/ "range_check":
/*!******************************!*\
  !*** external "range_check" ***!
  \******************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("range_check");

/***/ }),

/***/ "request":
/*!**************************!*\
  !*** external "request" ***!
  \**************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("request");

/***/ }),

/***/ "request-promise":
/*!**********************************!*\
  !*** external "request-promise" ***!
  \**********************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("request-promise");

/***/ }),

/***/ "request-promise/errors":
/*!*****************************************!*\
  !*** external "request-promise/errors" ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("request-promise/errors");

/***/ }),

/***/ "terriajs-ogr2ogr":
/*!***********************************!*\
  !*** external "terriajs-ogr2ogr" ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("terriajs-ogr2ogr");

/***/ }),

/***/ "url":
/*!**********************!*\
  !*** external "url" ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("url");

/***/ }),

/***/ "when":
/*!***********************!*\
  !*** external "when" ***!
  \***********************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("when");

/***/ }),

/***/ "yargs":
/*!************************!*\
  !*** external "yargs" ***!
  \************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("yargs");

/***/ })

/******/ });
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4vYXBwL2JhY2tlbmQvYXBwLnRzIiwid2VicGFjazovLy8uL2FwcC9iYWNrZW5kL2NvbmZpZ3VyZWRhdGFiYXNlLnRzIiwid2VicGFjazovLy8uL2FwcC9iYWNrZW5kL2NvbmZpZ3VyZXNlcnZlci50cyIsIndlYnBhY2s6Ly8vLi9hcHAvYmFja2VuZC9jb250cm9sbGVycy9jb252ZXJ0LmpzIiwid2VicGFjazovLy8uL2FwcC9iYWNrZW5kL2NvbnRyb2xsZXJzL2VzcmktdG9rZW4tYXV0aC5qcyIsIndlYnBhY2s6Ly8vLi9hcHAvYmFja2VuZC9jb250cm9sbGVycy9mZWVkYmFjay5qcyIsIndlYnBhY2s6Ly8vLi9hcHAvYmFja2VuZC9jb250cm9sbGVycy9pbml0ZmlsZS5qcyIsIndlYnBhY2s6Ly8vLi9hcHAvYmFja2VuZC9jb250cm9sbGVycy9wcm9qNGxvb2t1cC5qcyIsIndlYnBhY2s6Ly8vLi9hcHAvYmFja2VuZC9jb250cm9sbGVycy9wcm94eS5qcyIsIndlYnBhY2s6Ly8vLi9hcHAvYmFja2VuZC9jb250cm9sbGVycy9wcm94eWRvbWFpbnMuanMiLCJ3ZWJwYWNrOi8vLy4vYXBwL2JhY2tlbmQvY29udHJvbGxlcnMvc2VydmVyY29uZmlnLmpzIiwid2VicGFjazovLy8uL2FwcC9iYWNrZW5kL2NvbnRyb2xsZXJzL3NoYXJlLmpzIiwid2VicGFjazovLy8uL2FwcC9iYWNrZW5kL2RhdGFiYXNlLnRzIiwid2VicGFjazovLy8uL2FwcC9iYWNrZW5kL2RhdGFiYXNlcy9teXNxbC9teXNxbC5qcyIsIndlYnBhY2s6Ly8vLi9hcHAvYmFja2VuZC9lcnJvcnBhZ2UudHMiLCJ3ZWJwYWNrOi8vLy4vYXBwL2JhY2tlbmQvZXhpc3RzLnRzIiwid2VicGFjazovLy8uL2FwcC9iYWNrZW5kL29wdGlvbnMudHMiLCJ3ZWJwYWNrOi8vL2V4dGVybmFsIFwiYXdzLXNka1wiIiwid2VicGFjazovLy9leHRlcm5hbCBcImJhc2UteFwiIiwid2VicGFjazovLy9leHRlcm5hbCBcImJhc2ljLWF1dGhcIiIsIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJib2R5LXBhcnNlclwiIiwid2VicGFjazovLy9leHRlcm5hbCBcImNsdXN0ZXJcIiIsIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJjb21wcmVzc2lvblwiIiwid2VicGFjazovLy9leHRlcm5hbCBcImNvcnNcIiIsIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJjcnlwdG9cIiIsIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJleHByZXNzXCIiLCJ3ZWJwYWNrOi8vL2V4dGVybmFsIFwiZXhwcmVzcy1icnV0ZVwiIiwid2VicGFjazovLy9leHRlcm5hbCBcImZvcm1pZGFibGVcIiIsIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJmc1wiIiwid2VicGFjazovLy9leHRlcm5hbCBcImh0dHBzXCIiLCJ3ZWJwYWNrOi8vL2V4dGVybmFsIFwianNvbjVcIiIsIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJtb3JnYW5cIiIsIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJteXNxbFwiIiwid2VicGFjazovLy9leHRlcm5hbCBcIm5ldFwiIiwid2VicGFjazovLy9leHRlcm5hbCBcIm9zXCIiLCJ3ZWJwYWNrOi8vL2V4dGVybmFsIFwicGF0aFwiIiwid2VicGFjazovLy9leHRlcm5hbCBcInByb2o0XCIiLCJ3ZWJwYWNrOi8vL2V4dGVybmFsIFwicHJvajRqcy1kZWZzL2Vwc2dcIiIsIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJyYW5nZV9jaGVja1wiIiwid2VicGFjazovLy9leHRlcm5hbCBcInJlcXVlc3RcIiIsIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJyZXF1ZXN0LXByb21pc2VcIiIsIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJyZXF1ZXN0LXByb21pc2UvZXJyb3JzXCIiLCJ3ZWJwYWNrOi8vL2V4dGVybmFsIFwidGVycmlhanMtb2dyMm9nclwiIiwid2VicGFjazovLy9leHRlcm5hbCBcInVybFwiIiwid2VicGFjazovLy9leHRlcm5hbCBcIndoZW5cIiIsIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJ5YXJnc1wiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLGtEQUEwQyxnQ0FBZ0M7QUFDMUU7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxnRUFBd0Qsa0JBQWtCO0FBQzFFO0FBQ0EseURBQWlELGNBQWM7QUFDL0Q7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlEQUF5QyxpQ0FBaUM7QUFDMUUsd0hBQWdILG1CQUFtQixFQUFFO0FBQ3JJO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsbUNBQTJCLDBCQUEwQixFQUFFO0FBQ3ZELHlDQUFpQyxlQUFlO0FBQ2hEO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLDhEQUFzRCwrREFBK0Q7O0FBRXJIO0FBQ0E7OztBQUdBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7QUNsRmE7QUFFYix3RkFBd0Y7QUFDeEYscUZBQXFGO0FBQ3JGLDJFQUEyRTtBQUMzRSw4Q0FBOEM7QUFFOUMsSUFBSSxFQUFFLEdBQUcsbUJBQU8sQ0FBQyxjQUFJLENBQUMsQ0FBQztBQUN2QixJQUFJLE9BQU8sR0FBRyxtQkFBTyxDQUFDLHdCQUFTLENBQUMsQ0FBQztBQUNqQyxJQUFJLE1BQU0sR0FBRyxtQkFBTyxDQUFDLHlDQUFVLENBQUMsQ0FBQztBQUNqQyxJQUFJLE9BQU8sR0FBRyxtQkFBTyxDQUFDLDJDQUFXLENBQUMsQ0FBQztBQUNuQyxJQUFJLGVBQWUsR0FBRyxtQkFBTyxDQUFDLDJEQUFtQixDQUFDLENBQUM7QUFDbkQsSUFBSSxpQkFBaUIs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QUcsSUFBSSxDQUFDLE9BQU8sQ0FBQztRQUM1QixJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxVQUFVLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLElBQUksV0FBVyxDQUFDO1FBQ3pFLElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZSxJQUFJLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxhQUFhLEtBQUssV0FBVyxDQUFDO1FBRXBILE9BQU8sT0FBTyxDQUFDO0lBQ25CLENBQUM7Q0FFSjtBQUVELGlCQUFTLE9BQU8sQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQzFJakIsb0M7Ozs7Ozs7Ozs7O0FDQUEsbUM7Ozs7Ozs7Ozs7O0FDQUEsdUM7Ozs7Ozs7Ozs7O0FDQUEsd0M7Ozs7Ozs7Ozs7O0FDQUEsb0M7Ozs7Ozs7Ozs7O0FDQUEsd0M7Ozs7Ozs7Ozs7O0FDQUEsaUM7Ozs7Ozs7Ozs7O0FDQUEsbUM7Ozs7Ozs7Ozs7O0FDQUEsb0M7Ozs7Ozs7Ozs7O0FDQUEsMEM7Ozs7Ozs7Ozs7O0FDQUEsdUM7Ozs7Ozs7Ozs7O0FDQUEsK0I7Ozs7Ozs7Ozs7O0FDQUEsa0M7Ozs7Ozs7Ozs7O0FDQUEsa0M7Ozs7Ozs7Ozs7O0FDQUEsbUM7Ozs7Ozs7Ozs7O0FDQUEsa0M7Ozs7Ozs7Ozs7O0FDQUEsZ0M7Ozs7Ozs7Ozs7O0FDQUEsK0I7Ozs7Ozs7Ozs7O0FDQUEsaUM7Ozs7Ozs7Ozs7O0FDQUEsa0M7Ozs7Ozs7Ozs7O0FDQUEsOEM7Ozs7Ozs7Ozs7O0FDQUEsd0M7Ozs7Ozs7Ozs7O0FDQUEsb0M7Ozs7Ozs7Ozs7O0FDQUEsNEM7Ozs7Ozs7Ozs7O0FDQUEsbUQ7Ozs7Ozs7Ozs7O0FDQUEsNkM7Ozs7Ozs7Ozs7O0FDQUEsZ0M7Ozs7Ozs7Ozs7O0FDQUEsaUM7Ozs7Ozs7Ozs7O0FDQUEsa0MiLCJmaWxlIjoiYnVuZGxlLWJhY2tlbmQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSkge1xuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuIFx0XHR9XG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRpOiBtb2R1bGVJZCxcbiBcdFx0XHRsOiBmYWxzZSxcbiBcdFx0XHRleHBvcnRzOiB7fVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9uIGZvciBoYXJtb255IGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uZCA9IGZ1bmN0aW9uKGV4cG9ydHMsIG5hbWUsIGdldHRlcikge1xuIFx0XHRpZighX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIG5hbWUpKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIG5hbWUsIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBnZXR0ZXIgfSk7XG4gXHRcdH1cbiBcdH07XG5cbiBcdC8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uciA9IGZ1bmN0aW9uKGV4cG9ydHMpIHtcbiBcdFx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG4gXHRcdH1cbiBcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbiBcdH07XG5cbiBcdC8vIGNyZWF0ZSBhIGZha2UgbmFtZXNwYWNlIG9iamVjdFxuIFx0Ly8gbW9kZSAmIDE6IHZhbHVlIGlzIGEgbW9kdWxlIGlkLCByZXF1aXJlIGl0XG4gXHQvLyBtb2RlICYgMjogbWVyZ2UgYWxsIHByb3BlcnRpZXMgb2YgdmFsdWUgaW50byB0aGUgbnNcbiBcdC8vIG1vZGUgJiA0OiByZXR1cm4gdmFsdWUgd2hlbiBhbHJlYWR5IG5zIG9iamVjdFxuIFx0Ly8gbW9kZSAmIDh8MTogYmVoYXZlIGxpa2UgcmVxdWlyZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy50ID0gZnVuY3Rpb24odmFsdWUsIG1vZGUpIHtcbiBcdFx0aWYobW9kZSAmIDEpIHZhbHVlID0gX193ZWJwYWNrX3JlcXVpcmVfXyh2YWx1ZSk7XG4gXHRcdGlmKG1vZGUgJiA4KSByZXR1cm4gdmFsdWU7XG4gXHRcdGlmKChtb2RlICYgNCkgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiB2YWx1ZSAmJiB2YWx1ZS5fX2VzTW9kdWxlKSByZXR1cm4gdmFsdWU7XG4gXHRcdHZhciBucyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18ucihucyk7XG4gXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShucywgJ2RlZmF1bHQnLCB7IGVudW1lcmFibGU6IHRydWUsIHZhbHVlOiB2YWx1ZSB9KTtcbiBcdFx0aWYobW9kZSAmIDIgJiYgdHlwZW9mIHZhbHVlICE9ICdzdHJpbmcnKSBmb3IodmFyIGtleSBpbiB2YWx1ZSkgX193ZWJwYWNrX3JlcXVpcmVfXy5kKG5zLCBrZXksIGZ1bmN0aW9uKGtleSkgeyByZXR1cm4gdmFsdWVba2V5XTsgfS5iaW5kKG51bGwsIGtleSkpO1xuIFx0XHRyZXR1cm4gbnM7XG4gXHR9O1xuXG4gXHQvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5uID0gZnVuY3Rpb24obW9kdWxlKSB7XG4gXHRcdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuIFx0XHRcdGZ1bmN0aW9uIGdldERlZmF1bHQoKSB7IHJldHVybiBtb2R1bGVbJ2RlZmF1bHQnXTsgfSA6XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0TW9kdWxlRXhwb3J0cygpIHsgcmV0dXJuIG1vZHVsZTsgfTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgJ2EnLCBnZXR0ZXIpO1xuIFx0XHRyZXR1cm4gZ2V0dGVyO1xuIFx0fTtcblxuIFx0Ly8gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSBmdW5jdGlvbihvYmplY3QsIHByb3BlcnR5KSB7IHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBwcm9wZXJ0eSk7IH07XG5cbiBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiO1xuXG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oX193ZWJwYWNrX3JlcXVpcmVfXy5zID0gMCk7XG4iLCIndXNlIHN0cmljdCc7XG5cbi8vIFVzaW5nIHJlcXVpcmUgYXMgaXQgaXMgc2ltcGxlciBpbnN0ZWFkIG9mIHR5cGVzY3JpcHQncyBpbXBvcnQvZXhwb3J0IGRlcml2ZWQgc3ludGF4LiBcbi8vIFNlZSB0eXBlc2NyaXB0J3MgXCJleHBvcnQgPSBhbmQgaW1wb3J0ID0gcmVxdWlyZSgpXCIgbW9kdWxlcyBkb2N1bWVudGF0aW9uIHNlY3Rpb24uIFxuLy8gRG9jdW1lbnRhdGlvbjogaHR0cHM6Ly93d3cudHlwZXNjcmlwdGxhbmcub3JnL2RvY3MvaGFuZGJvb2svbW9kdWxlcy5odG1sXG4vLyBUaGlzIHdvcmtzIHdlbGwgd2l0aCB0aGUgZXhpc3RpbmcgY29kZWJhc2UuXG5cbnZhciBmcyA9IHJlcXVpcmUoJ2ZzJyk7XG52YXIgY2x1c3RlciA9IHJlcXVpcmUoJ2NsdXN0ZXInKTtcbnZhciBleGlzdHMgPSByZXF1aXJlKCcuL2V4aXN0cycpO1xudmFyIG9wdGlvbnMgPSByZXF1aXJlKCcuL29wdGlvbnMnKTtcbnZhciBjb25maWd1cmVzZXJ2ZXIgPSByZXF1aXJlKCcuL2NvbmZpZ3VyZXNlcnZlcicpO1xudmFyIGNvbmZpZ3VyZWRhdGFiYXNlID0gcmVxdWlyZSgnLi9jb25maWd1cmVkYXRhYmFzZScpO1xuXG5jbGFzcyBhcHAge1xuXG4gICAgcHVibGljIG9wdGlvbnMgPSBuZXcgb3B0aW9ucygpO1xuICAgIHB1YmxpYyBkYjogYW55O1xuXG4gICAgaW5pdCgpIHtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgaWYgKGNsdXN0ZXIuaXNNYXN0ZXIpIHtcblxuICAgICAgICAgICAgY29uc29sZS5sb2cgKCdUZXJyaWFKUyBTZXJ2ZXIgJyArIHJlcXVpcmUoJy4uLy4uL3BhY2thZ2UuanNvbicpLnZlcnNpb24pOyAvLyBUaGUgbWFzdGVyIHByb2Nlc3MganVzdCBzcGlucyB1cCBhIGZldyB3b3JrZXJzIGFuZCBxdWl0cy5cbiAgICAgICAgICAgIG9wdGlvbnMuaW5pdChmYWxzZSk7XG5cbiAgICAgICAgICAgIGlmIChmcy5leGlzdHNTeW5jKCd0ZXJyaWFqcy5waWQnKSkge1xuICAgICAgICAgICAgICAgIHRoaXMud2FybignVGVycmlhSlMtU2VydmVyIHNlZW1zIHRvIGJlIHJ1bm5pbmcgYWxyZWFkeS4nKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIHRoaXMucG9ydEluVXNlKG9wdGlvbnMucG9ydCwgb3B0aW9ucy5saXN0ZW5Ib3N0LCBmdW5jdGlvbiAoaW5Vc2UpIHsgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiAoaW5Vc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5lcnJvcignUG9ydCAnICsgb3B0aW9ucy5wb3J0ICsgJyBpcyBpbiB1c2UuIEV4aXRpbmcuJyk7XG4gICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChvcHRpb25zLmxpc3Rlbkhvc3QgIT09ICdsb2NhbGhvc3QnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnJ1bk1hc3RlcigpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gTGV0J3MgZXF1YXRlIG5vbi1wdWJsaWMsIGxvY2FsaG9zdCBtb2RlIHdpdGggXCJzaW5nbGUtY3B1LCBkb24ndCByZXN0YXJ0XCIuXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnN0YXJ0U2VydmVyKG9wdGlvbnMpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHJldHVybjtcblxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gV2UncmUgYSBmb3JrZWQgcHJvY2Vzcy5cbiAgICAgICAgICAgIG9wdGlvbnMuaW5pdCh0cnVlKTtcbiAgICAgICAgICAgIHRoaXMuc3RhcnRTZXJ2ZXIob3B0aW9ucyk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBSdW4gZGF0YWJhc2UgY29uZmlndXJhdGlvbiBhbmQgZ2V0IGRhdGFiYXNlIG9iamVjdCBmb3IgdGhlIGZyYW1ld29yay5cbiAgICAgICAgdmFyIGRiID0gY29uZmlndXJlZGF0YWJhc2UoKTtcblxuICAgICAgICAvLyBFeHRlbmQgYXBwIHdpdGggZGF0YWJhc2VcbiAgICAgICAgdGhpcy5kYiA9IGRiO1xuXG4gICAgfVxuXG4gICAgcG9ydEluVXNlKHBvcnQsIGhvc3QsIGNhbGxiYWNrKSB7XG5cbiAgICAgICAgdmFyIHNlcnZlciA9IHJlcXVpcmUoJ25ldCcpLmNyZWF0ZVNlcnZlcigpO1xuXG4gICAgICAgIHNlcnZlci5saXN0ZW4ocG9ydCwgaG9zdCk7XG4gICAgICAgIHNlcnZlci5vbignZXJyb3InLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBjYWxsYmFjayh0cnVlKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHNlcnZlci5vbignbGlzdGVuaW5nJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgc2VydmVyLmNsb3NlKCk7XG4gICAgICAgICAgICBjYWxsYmFjayhmYWxzZSk7XG4gICAgICAgIH0pO1xuXG4gICAgfVxuXG4gICAgZXJyb3IobWVzc2FnZSkge1xuXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yOiAnICsgbWVzc2FnZSk7XG4gICAgICAgIHByb2Nlc3MuZXhpdCgxKTtcblxuICAgIH1cblxuICAgIHdhcm4obWVzc2FnZSkge1xuXG4gICAgICAgIGNvbnNvbGUud2FybignV2FybmluZzogJyArIG1lc3NhZ2UpO1xuXG4gICAgfVxuXG4gICAgaGFuZGxlRXhpdCgpIHtcblxuICAgICAgICBjb25zb2xlLmxvZygnKFRlcnJpYUpTLVNlcnZlciBleGl0aW5nLiknKTtcbiAgICAgICAgaWYgKGZzLmV4aXN0c1N5bmMoJ3RlcnJpYWpzLnBpZCcpKSB7XG4gICAgICAgICAgICBmcy51bmxpbmtTeW5jKCd0ZXJyaWFqcy5waWQnKTtcbiAgICAgICAgfVxuICAgICAgICBwcm9jZXNzLmV4aXQoMCk7XG5cbiAgICB9XG5cbiAgICBydW5NYXN0ZXIoKSB7XG5cbiAgICAgICAgdmFyIGNwdUNvdW50ID0gcmVxdWlyZSgnb3MnKS5jcHVzKCkubGVuZ3RoO1xuXG4gICAgICAgIC8vIExldCdzIGVxdWF0ZSBub24tcHVibGljLCBsb2NhbGhvc3QgbW9kZSB3aXRoIFwic2luZ2xlLWNwdSwgZG9uJ3QgcmVzdGFydFwiLlxuICAgICAgICBpZiAob3B0aW9ucy5saXN0ZW5Ib3N0ID09PSAnbG9jYWxob3N0Jykge1xuICAgICAgICAgICAgY3B1Q291bnQgPSAxO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc29sZS5sb2coJ1NlcnZpbmcgZGlyZWN0b3J5IFwiJyArIG9wdGlvbnMud3d3cm9vdCArICdcIiBvbiBwb3J0ICcgKyBvcHRpb25zLnBvcnQgKyAnIHRvICcgKyAob3B0aW9ucy5saXN0ZW5Ib3N0ID8gb3B0aW9ucy5saXN0ZW5Ib3N0OiAndGhlIHdvcmxkJykgKyAnLicpO1xuICAgICAgICByZXF1aXJlKCcuL2NvbnRyb2xsZXJzL2NvbnZlcnQnKSgpLnRlc3RHZGFsKCk7XG5cbiAgICAgICAgaWYgKCFleGlzdHMob3B0aW9ucy53d3dyb290KSkge1xuICAgICAgICAgICAgdGhpcy53YXJuKCdcIicgKyBvcHRpb25zLnd3d3Jvb3QgKyAnXCIgZG9lcyBub3QgZXhpc3QuJyk7XG4gICAgICAgIH0gZWxzZSBpZiAoIWV4aXN0cyhvcHRpb25zLnd3d3Jvb3QgKyAnL2luZGV4Lmh0bWwnKSkge1xuICAgICAgICAgICAgdGhpcy53YXJuKCdcIicgKyBvcHRpb25zLnd3d3Jvb3QgKyAnXCIgaXMgbm90IGEgVGVycmlhSlMgd3d3cm9vdCBkaXJlY3RvcnkuJyk7XG4gICAgICAgIH0gZWxzZSBpZiAoIWV4aXN0cyhvcHRpb25zLnd3d3Jvb3QgKyAnL2J1aWxkJykpIHtcbiAgICAgICAgICAgIHRoaXMud2FybignXCInICsgb3B0aW9ucy53d3dyb290ICsgJ1wiIGhhcyBub3QgYmVlbiBidWlsdC4gWW91IHNob3VsZCBkbyB0aGlzOlxcblxcbicgK1xuICAgICAgICAgICAgICAgICc+IGNkICcgKyBvcHRpb25zLnd3d3Jvb3QgKyAnLy4uXFxuJyArXG4gICAgICAgICAgICAgICAgJz4gZ3VscFxcbicpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHR5cGVvZiBvcHRpb25zLnNldHRpbmdzLmFsbG93UHJveHlGb3IgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICB0aGlzLndhcm4oJ1RoZSBjb25maWd1cmF0aW9uIGRvZXMgbm90IGNvbnRhaW4gYSBcImFsbG93UHJveHlGb3JcIiBsaXN0LiAgVGhlIHNlcnZlciB3aWxsIHByb3h5IF9hbnlfIHJlcXVlc3QuJyk7XG4gICAgICAgIH1cblxuICAgICAgICBwcm9jZXNzLm9uKCdTSUdURVJNJywgdGhpcy5oYW5kbGVFeGl0KTtcblxuICAgICAgICAvLyBMaXN0ZW4gZm9yIGR5aW5nIHdvcmtlcnNcbiAgICAgICAgY2x1c3Rlci5vbignZXhpdCcsIGZ1bmN0aW9uICh3b3JrZXIpIHtcbiAgICAgICAgICAgIGlmICghd29ya2VyLnN1aWNpZGUpIHtcbiAgICAgICAgICAgICAgICAvLyBSZXBsYWNlIHRoZSBkZWFkIHdvcmtlciBpZiBub3QgYSBzdGFydHVwIGVycm9yIGxpa2UgcG9ydCBpbiB1c2UuXG4gICAgICAgICAgICAgICAgaWYgKG9wdGlvbnMubGlzdGVuSG9zdCA9PT0gJ2xvY2FsaG9zdCcpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1dvcmtlciAnICsgd29ya2VyLmlkICsgJyBkaWVkLiBOb3QgcmVwbGFjaW5nIGl0IGFzIHdlXFwncmUgcnVubmluZyBpbiBub24tcHVibGljIG1vZGUuJyk7ICAgIFxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdXb3JrZXIgJyArIHdvcmtlci5pZCArICcgZGllZC4gUmVwbGFjaW5nIGl0LicpO1xuICAgICAgICAgICAgICAgICAgICBjbHVzdGVyLmZvcmsoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGZzLndyaXRlRmlsZVN5bmMoJ3RlcnJpYWpzLnBpZCcsIHByb2Nlc3MucGlkLnRvU3RyaW5nKCkpO1xuXG4gICAgICAgIGNvbnNvbGUubG9nKCcoVGVycmlhSlMtU2VydmVyIHJ1bm5pbmcgd2l0aCBwaWQgJyArIHByb2Nlc3MucGlkICsgJyknKTtcbiAgICAgICAgY29uc29sZS5sb2coJ0xhdW5jaGluZyAnICsgIGNwdUNvdW50ICsgJyB3b3JrZXIgcHJvY2Vzc2VzLicpO1xuXG4gICAgICAgIC8vIENyZWF0ZSBhIHdvcmtlciBmb3IgZWFjaCBDUFVcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjcHVDb3VudDsgaSArPSAxKSB7XG4gICAgICAgICAgICBjbHVzdGVyLmZvcmsoKTtcbiAgICAgICAgfVxuXG4gICAgfVxuXG4gICAgc3RhcnRTZXJ2ZXIob3B0aW9ucykge1xuXG4gICAgICAgIHZhciBhcHAgPSBjb25maWd1cmVzZXJ2ZXIuc3RhcnQob3B0aW9ucyk7IC8vIFNldCBzZXJ2ZXIgY29uZmlndXJhdGlvbnMgYW5kIGdlbmVyYXRlIHNlcnZlci4gV2UgcmVwbGFjZSBhcHAgaGVyZSB3aXRoIHRoZSBhY3R1YWwgYXBwbGljYXRpb24gc2VydmVyIGZvciBwcm9wZXIgbmFtaW5nIGNvbnZlbnRpb25zLlxuICAgICAgICBhcHAubGlzdGVuKG9wdGlvbnMucG9ydCwgb3B0aW9ucy5saXN0ZW5Ib3N0LCAoKSA9PiBjb25zb2xlLmxvZyhgVGVycmlhIGZyYW1ld29yayBydW5uaW5nIG9uICR7cG9ydH0hYCkpOyAvLyBTdGFydCBIVFRQL3Mgc2VydmVyIHdpdGggZXhwcmVzc2pzIG1pZGRsZXdhcmUuXG5cbiAgICB9XG5cbn1cblxudmFyIGZyYW1ld29yayA9IG5ldyBhcHAoKTtcblxuZnJhbWV3b3JrLmluaXQoKTsgLy8gU3RhcnQgYXBwbGljYXRpb24uXG5cbi8vIFRlc3RpbmcgZnJhbWV3b3JrIGRhdGFiYXNlXG5jb25zb2xlLmxvZyhmcmFtZXdvcmsuZGIuZ2V0U3RhdHVzKCkpO1xuXG4iLCIndXNlIHN0cmljdCc7XG5cbmltcG9ydCB7IGRhdGFiYXNlIH0gZnJvbSAnLi9kYXRhYmFzZSc7XG5cbmNsYXNzIGNvbmZpZ3VyZWRhdGFiYXNlIHtcblxuXHRzdGF0aWMgc3RhcnQoKTogZGF0YWJhc2Uge1xuXG5cdFx0dmFyIGNvbm5lY3Rpb247XG5cblx0XHR2YXIgY29uZmlnID0gcmVxdWlyZSgnLi4vZGJjb25maWcuanNvbicpO1xuXHRcblx0XHRzd2l0Y2goY29uZmlnLmRhdGFiYXNlLnR5cGUpIHtcblx0XHRjYXNlICdteXNxbCc6XG5cdFx0XHRjb25uZWN0aW9uID0gcmVxdWlyZSgnLi9kYXRhYmFzZXMvbXlzcWwvbXlzcWwuanMnKTtcblx0XHQvKiBPdGhlciBkYXRhYmFzZSBleGFtcGxlXG5cdFx0Y2FzZSAnbXNzcWwnOlxuXHRcdFx0dGVycmlhZGIgPSByZXF1aXJlKCcuL2RhdGFiYXNlcy9tc3NxbC9tc3NxbC5qcycpO1xuXHRcdCovXG5cdFx0LyogT3RoZXIgZGF0YWJhc2UgZXhhbXBsZVxuXHRcdGNhc2UgJ21vbmdvZGInOlxuXHRcdFx0dGVycmlhZGIgPSByZXF1aXJlKCcuL2RhdGFiYXNlcy9tb25nb2RiL21vbmdvZGIuanMnKTtcblx0XHQqL1xuXHRcdC8qIEN1c3RvbSBleGFtcGxlXG5cdFx0Y2FzZSAnY3VzdG9tZGInOlxuXHRcdFx0dGVycmlhZGIgPSByZXF1aXJlKCcuL2RhdGFiYXNlcy9jdXN0b21kYi9jdXN0b21kYi5qcycpO1xuXHRcdCovXG5cdFx0ZGVmYXVsdDogXG5cdFx0XHRjb25uZWN0aW9uID0gcmVxdWlyZSgnLi9kYXRhYmFzZXMvbXlzcWwvbXlzcWwuanMnKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gbmV3IGRhdGFiYXNlKGNvbmZpZy5kYXRhYmFzZS50eXBlLCBjb25maWcuZGF0YWJhc2UuaG9zdCwgY29uZmlnLmRhdGFiYXNlLnVzZXJuYW1lLCBjb25maWcuZGF0YWJhc2UucGFzc3dvcmQsIGNvbm5lY3Rpb24pOyAvLyBSZXR1cm4gZGF0YWJhc2Ugb2JqZWN0XG5cblx0fVxuXG59XG5cbmV4cG9ydCA9IGNvbmZpZ3VyZWRhdGFiYXNlOyIsIid1c2Ugc3RyaWN0JztcblxudmFyIGV4cHJlc3MgPSByZXF1aXJlKCdleHByZXNzJyk7XG52YXIgY29tcHJlc3Npb24gPSByZXF1aXJlKCdjb21wcmVzc2lvbicpO1xudmFyIHBhdGggPSByZXF1aXJlKCdwYXRoJyk7XG52YXIgY29ycyA9IHJlcXVpcmUoJ2NvcnMnKTtcbnZhciBjbHVzdGVyID0gcmVxdWlyZSgnY2x1c3RlcicpO1xudmFyIGV4aXN0cyA9IHJlcXVpcmUoJy4vZXhpc3RzJyk7XG52YXIgYmFzaWNBdXRoID0gcmVxdWlyZSgnYmFzaWMtYXV0aCcpO1xudmFyIGZzID0gcmVxdWlyZSgnZnMnKTtcbnZhciBFeHByZXNzQnJ1dGUgPSByZXF1aXJlKCdleHByZXNzLWJydXRlJyk7XG5cbi8qIENyZWF0ZXMgYW5kIHJldHVybnMgYSBzaW5nbGUgZXhwcmVzcyBzZXJ2ZXIuICovXG5jbGFzcyBjb25maWd1cmVzZXJ2ZXIge1xuXG4gICAgc3RhdGljIHN0YXJ0KG9wdGlvbnMpOiBleHByZXNzIHtcbiAgICAgICAgLy8gZXZlbnR1YWxseSB0aGlzIG1pbWUgdHlwZSBjb25maWd1cmF0aW9uIHdpbGwgbmVlZCB0byBjaGFuZ2VcbiAgICAgICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL3Zpc2lvbm1lZGlhL3NlbmQvY29tbWl0L2QyY2I1NDY1OGNlNjU5NDhiMGVkNmU1ZmI1ZGU2OWQwMjJiZWY5NDFcbiAgICAgICAgdmFyIG1pbWUgPSBleHByZXNzLnN0YXRpYy5taW1lO1xuICAgICAgICBtaW1lLmRlZmluZSh7XG4gICAgICAgICAgICAnYXBwbGljYXRpb24vanNvbicgOiBbJ2N6bWwnLCAnanNvbicsICdnZW9qc29uJ10sXG4gICAgICAgICAgICAndGV4dC9wbGFpbicgOiBbJ2dsc2wnXVxuICAgICAgICB9KTtcblxuICAgICAgICAvLyBpbml0aWFsaXNlIGFwcCB3aXRoIHN0YW5kYXJkIG1pZGRsZXdhcmVzXG4gICAgICAgIHZhciBhcHAgPSBleHByZXNzKCk7XG4gICAgICAgIGFwcC51c2UoY29tcHJlc3Npb24oKSk7XG4gICAgICAgIGFwcC51c2UoY29ycygpKTtcbiAgICAgICAgYXBwLmRpc2FibGUoJ2V0YWcnKTtcblxuICAgICAgICBpZiAob3B0aW9ucy52ZXJib3NlKSB7XG4gICAgICAgICAgICBhcHAudXNlKHJlcXVpcmUoJ21vcmdhbicpKCdkZXYnKSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodHlwZW9mIG9wdGlvbnMuc2V0dGluZ3MudHJ1c3RQcm94eSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgIGFwcC5zZXQoJ3RydXN0IHByb3h5Jywgb3B0aW9ucy5zZXR0aW5ncy50cnVzdFByb3h5KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChvcHRpb25zLnZlcmJvc2UpIHtcbiAgICAgICAgICAgIGxvZygnTGlzdGVuaW5nIG9uIHRoZXNlIGVuZHBvaW50czonLCB0cnVlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGVuZHBvaW50KCcvcGluZycsIGZ1bmN0aW9uKHJlcSwgcmVzKXtcbiAgICAgICAgICByZXMuc3RhdHVzKDIwMCkuc2VuZCgnT0snKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gV2UgZG8gdGhpcyBhZnRlciB0aGUgL3Bpbmcgc2VydmljZSBhYm92ZSBzbyB0aGF0IHBpbmcgY2FuIGJlIHVzZWQgdW5hdXRoZW50aWNhdGVkIGFuZCB3aXRob3V0IFRMUyBmb3IgaGVhbHRoIGNoZWNrcy5cblxuICAgICAgICBpZiAob3B0aW9ucy5zZXR0aW5ncy5yZWRpcmVjdFRvSHR0cHMpIHtcbiAgICAgICAgICAgIHZhciBodHRwQWxsb3dlZEhvc3RzID0gb3B0aW9ucy5zZXR0aW5ncy5odHRwQWxsb3dlZEhvc3RzIHx8IFtcImxvY2FsaG9zdFwiXTtcbiAgICAgICAgICAgIGFwcC51c2UoZnVuY3Rpb24ocmVxLCByZXMsIG5leHQpIHtcbiAgICAgICAgICAgICAgICBpZiAoaHR0cEFsbG93ZWRIb3N0cy5pbmRleE9mKHJlcS5ob3N0bmFtZSkgPj0gMCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmV4dCgpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChyZXEucHJvdG9jb2wgIT09ICdodHRwcycpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHVybCA9ICdodHRwczovLycgKyByZXEuaG9zdG5hbWUgKyByZXEudXJsO1xuICAgICAgICAgICAgICAgICAgICByZXMucmVkaXJlY3QoMzAxLCB1cmwpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIG5leHQoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBhdXRoID0gb3B0aW9ucy5zZXR0aW5ncy5iYXNpY0F1dGhlbnRpY2F0aW9uO1xuXG4gICAgICAgIGlmIChhdXRoICYmIGF1dGgudXNlcm5hbWUgJiYgYXV0aC5wYXNzd29yZCkge1xuICAgICAgICAgICAgdmFyIHN0b3JlID0gbmV3IEV4cHJlc3NCcnV0ZS5NZW1vcnlTdG9yZSgpO1xuICAgICAgICAgICAgdmFyIHJhdGVMaW1pdE9wdGlvbnMgPSB7XG4gICAgICAgICAgICAgICAgZnJlZVJldHJpZXM6IDIsXG4gICAgICAgICAgICAgICAgbWluV2FpdDogMjAwLFxuICAgICAgICAgICAgICAgIG1heFdhaXQ6IDYwMDAwLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGlmIChvcHRpb25zLnNldHRpbmdzLnJhdGVMaW1pdCAmJiBvcHRpb25zLnNldHRpbmdzLnJhdGVMaW1pdC5mcmVlUmV0cmllcyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgcmF0ZUxpbWl0T3B0aW9ucy5mcmVlUmV0cmllcyA9IG9wdGlvbnMuc2V0dGluZ3MucmF0ZUxpbWl0LmZyZWVSZXRyaWVzO1xuICAgICAgICAgICAgICAgIHJhdGVMaW1pdE9wdGlvbnMubWluV2FpdCA9IG9wdGlvbnMuc2V0dGluZ3MucmF0ZUxpbWl0Lm1pbldhaXQ7XG4gICAgICAgICAgICAgICAgcmF0ZUxpbWl0T3B0aW9ucy5tYXhXYWl0ID0gb3B0aW9ucy5zZXR0aW5ncy5yYXRlTGltaXQubWF4V2FpdDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBicnV0ZWZvcmNlID0gbmV3IEV4cHJlc3NCcnV0ZShzdG9yZSwgcmF0ZUxpbWl0T3B0aW9ucyk7XG4gICAgICAgICAgICBhcHAudXNlKGJydXRlZm9yY2UucHJldmVudCwgZnVuY3Rpb24ocmVxLCByZXMsIG5leHQpIHtcbiAgICAgICAgICAgICAgICB2YXIgdXNlciA9IGJhc2ljQXV0aChyZXEpO1xuICAgICAgICAgICAgICAgIGlmICh1c2VyICYmIHVzZXIubmFtZSA9PT0gYXV0aC51c2VybmFtZSAmJiB1c2VyLnBhc3MgPT09IGF1dGgucGFzc3dvcmQpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gU3VjY2Vzc2Z1bCBhdXRoZW50aWNhdGlvbiwgcmVzZXQgcmF0ZSBsaW1pdGluZy5cbiAgICAgICAgICAgICAgICAgICAgcmVxLmJydXRlLnJlc2V0KG5leHQpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJlcy5zdGF0dXNDb2RlID0gNDAxO1xuICAgICAgICAgICAgICAgICAgICByZXMuc2V0SGVhZGVyKCdXV1ctQXV0aGVudGljYXRlJywgJ0Jhc2ljIHJlYWxtPVwidGVycmlhanMtc2VydmVyXCInKTtcbiAgICAgICAgICAgICAgICAgICAgcmVzLmVuZCgnVW5hdXRob3JpemVkJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBTZXJ2ZSB0aGUgYnVsayBvZiBvdXIgYXBwbGljYXRpb24gYXMgYSBzdGF0aWMgd2ViIGRpcmVjdG9yeS5cbiAgICAgICAgdmFyIHNlcnZlV3d3Um9vdCA9IGV4aXN0cyhvcHRpb25zLnd3d3Jvb3QgKyAnL2luZGV4Lmh0bWwnKTtcbiAgICAgICAgaWYgKHNlcnZlV3d3Um9vdCkge1xuICAgICAgICAgICAgYXBwLnVzZShleHByZXNzLnN0YXRpYyhvcHRpb25zLnd3d3Jvb3QpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFByb3h5IGZvciBzZXJ2ZXJzIHRoYXQgZG9uJ3Qgc3VwcG9ydCBDT1JTXG4gICAgICAgIHZhciBieXBhc3NVcHN0cmVhbVByb3h5SG9zdHNNYXAgPSAob3B0aW9ucy5zZXR0aW5ncy5ieXBhc3NVcHN0cmVhbVByb3h5SG9zdHMgfHwgW10pLnJlZHVjZShmdW5jdGlvbihtYXAsIGhvc3QpIHtcbiAgICAgICAgICAgICAgICBpZiAoaG9zdCAhPT0gJycpIHtcbiAgICAgICAgICAgICAgICAgICAgbWFwW2hvc3QudG9Mb3dlckNhc2UoKV0gPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gbWFwO1xuICAgICAgICAgICAgfSwge30pO1xuXG4gICAgICAgIGVuZHBvaW50KCcvcHJveHknLCByZXF1aXJlKCcuL2NvbnRyb2xsZXJzL3Byb3h5Jykoe1xuICAgICAgICAgICAgcHJveHlhYmxlRG9tYWluczogb3B0aW9ucy5zZXR0aW5ncy5hbGxvd1Byb3h5Rm9yLFxuICAgICAgICAgICAgcHJveHlBbGxEb21haW5zOiBvcHRpb25zLnNldHRpbmdzLnByb3h5QWxsRG9tYWlucyxcbiAgICAgICAgICAgIHByb3h5QXV0aDogb3B0aW9ucy5wcm94eUF1dGgsXG4gICAgICAgICAgICBwcm94eVBvc3RTaXplTGltaXQ6IG9wdGlvbnMuc2V0dGluZ3MucHJveHlQb3N0U2l6ZUxpbWl0LFxuICAgICAgICAgICAgdXBzdHJlYW1Qcm94eTogb3B0aW9ucy5zZXR0aW5ncy51cHN0cmVhbVByb3h5LFxuICAgICAgICAgICAgYnlwYXNzVXBzdHJlYW1Qcm94eUhvc3RzOiBieXBhc3NVcHN0cmVhbVByb3h5SG9zdHNNYXAsXG4gICAgICAgICAgICBiYXNpY0F1dGhlbnRpY2F0aW9uOiBvcHRpb25zLnNldHRpbmdzLmJhc2ljQXV0aGVudGljYXRpb24sXG4gICAgICAgICAgICBibGFja2xpc3RlZEFkZHJlc3Nlczogb3B0aW9ucy5zZXR0aW5ncy5ibGFja2xpc3RlZEFkZHJlc3Nlc1xuICAgICAgICB9KSk7XG5cbiAgICAgICAgdmFyIGVzcmlUb2tlbkF1dGggPSByZXF1aXJlKCcuL2NvbnRyb2xsZXJzL2VzcmktdG9rZW4tYXV0aCcpKG9wdGlvbnMuc2V0dGluZ3MuZXNyaVRva2VuQXV0aCk7XG4gICAgICAgIGlmIChlc3JpVG9rZW5BdXRoKSB7XG4gICAgICAgICAgICBlbmRwb2ludCgnL2VzcmktdG9rZW4tYXV0aCcsIGVzcmlUb2tlbkF1dGgpO1xuICAgICAgICB9XG5cbiAgICAgICAgZW5kcG9pbnQoJy9wcm9qNGRlZicsIHJlcXVpcmUoJy4vY29udHJvbGxlcnMvcHJvajRsb29rdXAnKSk7ICAgICAgICAgICAgLy8gUHJvajRkZWYgbG9va3VwIHNlcnZpY2UsIHRvIGF2b2lkIGRvd25sb2FkaW5nIGFsbCBkZWZpbml0aW9ucyBpbnRvIHRoZSBjbGllbnQuXG4gICAgICAgIGVuZHBvaW50KCcvY29udmVydCcsIHJlcXVpcmUoJy4vY29udHJvbGxlcnMvY29udmVydCcpKG9wdGlvbnMpLnJvdXRlcik7IC8vIE9HUjJPR1Igd3JhcHBlciB0byBhbGxvdyBzdXBwb3J0aW5nIGZpbGUgdHlwZXMgbGlrZSBTaGFwZWZpbGUuXG4gICAgICAgIGVuZHBvaW50KCcvcHJveHlhYmxlZG9tYWlucycsIHJlcXVpcmUoJy4vY29udHJvbGxlcnMvcHJveHlkb21haW5zJykoeyAgIC8vIFJldHVybnMgSlNPTiBsaXN0IG9mIGRvbWFpbnMgd2UncmUgd2lsbGluZyB0byBwcm94eSBmb3JcbiAgICAgICAgICAgIHByb3h5YWJsZURvbWFpbnM6IG9wdGlvbnMuc2V0dGluZ3MuYWxsb3dQcm94eUZvcixcbiAgICAgICAgICAgIHByb3h5QWxsRG9tYWluczogISFvcHRpb25zLnNldHRpbmdzLnByb3h5QWxsRG9tYWlucyxcbiAgICAgICAgfSkpO1xuICAgICAgICBlbmRwb2ludCgnL3NlcnZlcmNvbmZpZycsIHJlcXVpcmUoJy4vY29udHJvbGxlcnMvc2VydmVyY29uZmlnJykob3B0aW9ucykpO1xuXG4gICAgICAgIHZhciBlcnJvclBhZ2UgPSByZXF1aXJlKCcuL2Vycm9ycGFnZScpO1xuICAgICAgICB2YXIgc2hvdzQwNCA9IHNlcnZlV3d3Um9vdCAmJiBleGlzdHMob3B0aW9ucy53d3dyb290ICsgJy80MDQuaHRtbCcpO1xuICAgICAgICB2YXIgZXJyb3I0MDQgPSBlcnJvclBhZ2UuZXJyb3I0MDQoc2hvdzQwNCwgb3B0aW9ucy53d3dyb290LCBzZXJ2ZVd3d1Jvb3QpO1xuICAgICAgICB2YXIgc2hvdzUwMCA9IHNlcnZlV3d3Um9vdCAmJiBleGlzdHMob3B0aW9ucy53d3dyb290ICsgJy81MDAuaHRtbCcpO1xuICAgICAgICB2YXIgZXJyb3I1MDAgPSBlcnJvclBhZ2UuZXJyb3I1MDAoc2hvdzUwMCwgb3B0aW9ucy53d3dyb290KTtcbiAgICAgICAgdmFyIGluaXRQYXRocyA9IG9wdGlvbnMuc2V0dGluZ3MuaW5pdFBhdGhzIHx8IFtdO1xuXG4gICAgICAgIGlmIChzZXJ2ZVd3d1Jvb3QpIHtcbiAgICAgICAgICAgIGluaXRQYXRocy5wdXNoKHBhdGguam9pbihvcHRpb25zLnd3d3Jvb3QsICdpbml0JykpO1xuICAgICAgICB9XG5cbiAgICAgICAgYXBwLnVzZSgnL2luaXQnLCByZXF1aXJlKCcuL2NvbnRyb2xsZXJzL2luaXRmaWxlJykoaW5pdFBhdGhzLCBlcnJvcjQwNCwgb3B0aW9ucy5jb25maWdEaXIpKTtcblxuICAgICAgICB2YXIgZmVlZGJhY2tTZXJ2aWNlID0gcmVxdWlyZSgnLi9jb250cm9sbGVycy9mZWVkYmFjaycpKG9wdGlvbnMuc2V0dGluZ3MuZmVlZGJhY2spO1xuICAgICAgICBpZiAoZmVlZGJhY2tTZXJ2aWNlKSB7XG4gICAgICAgICAgICBlbmRwb2ludCgnL2ZlZWRiYWNrJywgZmVlZGJhY2tTZXJ2aWNlKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgdmFyIHNoYXJlU2VydmljZSA9IHJlcXVpcmUoJy4vY29udHJvbGxlcnMvc2hhcmUnKShvcHRpb25zLnNldHRpbmdzLnNoYXJlVXJsUHJlZml4ZXMsIG9wdGlvbnMuc2V0dGluZ3MubmV3U2hhcmVVcmxQcmVmaXgsIG9wdGlvbnMuaG9zdE5hbWUsIG9wdGlvbnMucG9ydCk7XG4gICAgICAgIGlmIChzaGFyZVNlcnZpY2UpIHtcbiAgICAgICAgICAgIGVuZHBvaW50KCcvc2hhcmUnLCBzaGFyZVNlcnZpY2UpO1xuICAgICAgICB9XG5cbiAgICAgICAgYXBwLnVzZShlcnJvcjQwNCk7XG4gICAgICAgIGFwcC51c2UoZXJyb3I1MDApO1xuICAgICAgICB2YXIgc2VydmVyID0gYXBwO1xuICAgICAgICB2YXIgb3NoID0gb3B0aW9ucy5zZXR0aW5ncy5odHRwcztcbiAgICAgICAgaWYgKG9zaCAmJiBvc2gua2V5ICYmIG9zaC5jZXJ0KSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnTGF1bmNoaW5nIGluIEhUVFBTIG1vZGUuJyk7XG4gICAgICAgICAgICB2YXIgaHR0cHMgPSByZXF1aXJlKCdodHRwcycpO1xuICAgICAgICAgICAgc2VydmVyID0gaHR0cHMuY3JlYXRlU2VydmVyKHtcbiAgICAgICAgICAgICAgICBrZXk6IGZzLnJlYWRGaWxlU3luYyhvc2gua2V5KSxcbiAgICAgICAgICAgICAgICBjZXJ0OiBmcy5yZWFkRmlsZVN5bmMob3NoLmNlcnQpXG4gICAgICAgICAgICB9LCBhcHApO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJvY2Vzcy5vbigndW5jYXVnaHRFeGNlcHRpb24nLCBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyLnN0YWNrID8gZXJyLnN0YWNrIDogZXJyKTtcbiAgICAgICAgICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIHNlcnZlcjtcblxuICAgIH1cblxuICAgIGxvZyhtZXNzYWdlLCB3b3JrZXIxb25seSkge1xuXG4gICAgICAgIGlmICghd29ya2VyMW9ubHkgfHwgY2x1c3Rlci5pc1dvcmtlciAmJiBjbHVzdGVyLndvcmtlci5pZCA9PT0gMSkge1xuICAgICAgICAgICAgY29uc29sZS5sb2cobWVzc2FnZSk7XG4gICAgICAgIH1cblxuICAgIH1cblxuICAgIGVuZHBvaW50KHBhdGgscm91dGVyKSB7XG5cbiAgICAgICAgaWYgKG9wdGlvbnMudmVyYm9zZSkge1xuICAgICAgICAgICAgdGhpcy5sb2coJ2h0dHA6Ly8nICsgb3B0aW9ucy5ob3N0TmFtZSArICc6JyArIG9wdGlvbnMucG9ydCArICcvYXBpL3YxJyArIHBhdGgsIHRydWUpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChwYXRoICE9PSAncHJveHlhYmxlZG9tYWlucycpIHtcbiAgICAgICAgICAgIC8vIGRlcHJlY2F0ZWQgZW5kcG9pbnQgdGhhdCBpc24ndCBwYXJ0IG9mIFYxXG4gICAgICAgICAgICBhcHAudXNlKCcvYXBpL3YxJyArIHBhdGgsIHJvdXRlcik7XG4gICAgICAgIH1cbiAgICAgICAgLy8gZGVwcmVjYXRlZCBlbmRwb2ludCBhdCBgL2BcbiAgICAgICAgYXBwLnVzZShwYXRoLCByb3V0ZXIpO1xuXG4gICAgfVxuXG59XG5cbmV4cG9ydCA9IGNvbmZpZ3VyZXNlcnZlcjsiLCIvKiBqc2hpbnQgbm9kZTogdHJ1ZSAqL1xuXCJ1c2Ugc3RyaWN0XCI7XG52YXIgZXhwcmVzcyA9IHJlcXVpcmUoJ2V4cHJlc3MnKTtcbnZhciBmcyA9IHJlcXVpcmUoJ2ZzJyk7XG52YXIgb2dyMm9nciA9IHJlcXVpcmUoJ3RlcnJpYWpzLW9ncjJvZ3InKTtcbnZhciByZXF1ZXN0ID0gcmVxdWlyZSgncmVxdWVzdCcpO1xudmFyIGZvcm1pZGFibGUgPSByZXF1aXJlKCdmb3JtaWRhYmxlJyk7XG5cbnZhciBjb252ZXJ0ID0ge307XG5cbmNvbnZlcnQudGVzdEdkYWwgPSBmdW5jdGlvbigpIHtcbiAgICAvLyB0ZXN0IGRvaW5nICdzb21ldGhpbmcnIHdpdGggYW4gZW1wdHkgR2VvSlNPTiBvYmplY3QuIEl0IHdpbGwgZWl0aGVyIGZhaWwgd2l0aCBFTk9FTlQsIG9yIGZhaWwgd2l0aCBPR1IyT0dSIG91dHB1dC5cbiAgICBvZ3Iyb2dyKHt9KS5leGVjKGZ1bmN0aW9uKGVycm9yKSB7XG4gICAgICAgIGlmICgoZXJyb3IgIT09IHVuZGVmaW5lZCkgJiYgZXJyb3IubWVzc2FnZS5tYXRjaCgvRU5PRU5ULykpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdDb252ZXJ0IHdhcm5pbmc6IG9ncjJvZ3IgKGdkYWwpIGlzIG5vdCBpbnN0YWxsZWQgb3IgaW5hY2Nlc3NpYmxlLCBzbyB0aGUgZm9ybWF0IGNvbnZlcnNpb24gc2VydmljZSB3aWxsIGZhaWwuJyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBHREFMIGlzIGluc3RhbGxlZCBvay5cbiAgICAgICAgfVxuICAgIH0pO1xufTtcblxuZnVuY3Rpb24gdG9vQmlnRXJyb3IocmVxdWVzdCwgcmVzcG9uc2UpIHtcbiAgICByZXNwb25zZS5oZWFkZXIoJ0Nvbm5lY3Rpb24nLCAnY2xvc2UnKTsgLy8gc3RvcCB0aGUgY2xpZW50IGZyb20gc2VuZGluZyBhZGRpdGlvbmFsIGRhdGEuXG4gICAgcmVzcG9uc2Uuc3RhdHVzKDQxMykgLy8gUGF5bG9hZCBUb28gTGFyZ2VcbiAgICAgICAgICAgIC5zZW5kKCdUaGlzIGZpbGUgaXMgdG9vIGJpZyB0byBjb252ZXJ0LiBNYXhpbXVtIGFsbG93ZWQgc2l6ZTogJyArIGNvbnZlcnQubWF4Q29udmVyc2lvblNpemUgKyAnIGJ5dGVzJyk7XG4gICAgY29uc29sZS5sb2coJ0NvbnZlcnQ6IHVwbG9hZGVkIGZpbGUgZXhjZWVkcyBsaW1pdCBvZiAnICsgY29udmVydC5tYXhDb252ZXJzaW9uU2l6ZSArICcgYnl0ZXMuIEFib3J0aW5nLicpO1xufVxuXG4vLyBFeHRyYWN0IGZpbGUgbmFtZSBhbmQgcGF0aCBvdXQgb2YgdGhlIHByb3ZpZGVkIEhUVFAgUE9TVCBmb3JtXG5mdW5jdGlvbiBwYXJzZUZvcm0ocmVxLCByZXMsIGNhbGxiYWNrKSB7XG4gICAgdmFyIGZvcm0gPSBuZXcgZm9ybWlkYWJsZS5JbmNvbWluZ0Zvcm0oKTtcbiAgICBmb3JtLm9uKCdwcm9ncmVzcycsIGZ1bmN0aW9uKGJ5dGVzUmVjZWl2ZWQsIGJ5dGVzRXhwZWN0ZWQpIHtcbiAgICAgICAgLy8gQWxsb3cgZG91YmxlIGJlY2F1c2UgYnl0ZXNSZWNlaXZlZCBpcyB0aGUgZW50aXJlIGZvcm0sIG5vdCBqdXN0IHRoZSBmaWxlLlxuICAgICAgICBpZiAoYnl0ZXNSZWNlaXZlZCA+IGNvbnZlcnQubWF4Q29udmVyc2lvblNpemUgKiAyKSB7XG4gICAgICAgICAgICB2YXIgcmVzdWx0ID0gdG9vQmlnRXJyb3IocmVxLCByZXMpO1xuXG4gICAgICAgICAgICAvLyByZW1vdmUgYW55IGZpbGVzIGFscmVhZHkgdXBsb2FkZWRcbiAgICAgICAgICAgIChmb3JtLm9wZW5lZEZpbGVzIHx8IFtdKS5mb3JFYWNoKGZ1bmN0aW9uKGZpbGUpIHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBmcy51bmxpbmsoZmlsZS5wYXRoKTtcbiAgICAgICAgICAgICAgICB9IGNhdGNoKGUpIHtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIGZvcm0ucGFyc2UocmVxLCBmdW5jdGlvbihlcnIsIGZpZWxkcywgZmlsZXMpIHtcbiAgICAgICAgaWYgKGZpZWxkcy5pbnB1dF91cmwgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgaWYgKGZpZWxkcy5pbnB1dF91cmwuaW5kZXhPZignaHR0cCcpID09PSAwKSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2soZmllbGRzLmlucHV0X3VybCwgZmllbGRzLmlucHV0X3VybCwgcmVxLCByZXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKGZpbGVzLmlucHV0X2ZpbGUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgaWYgKGZpbGVzLmlucHV0X2ZpbGUuc2l6ZSA8PSBjb252ZXJ0Lm1heENvbnZlcnNpb25TaXplKSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2soZmlsZXMuaW5wdXRfZmlsZS5wYXRoLCBmaWxlcy5pbnB1dF9maWxlLm5hbWUsIHJlcSwgcmVzKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZnMudW5saW5rKGZpbGVzLmlucHV0X2ZpbGUucGF0aCk7IC8vIHdlIGhhdmUgdG8gZGVsZXRlIHRoZSB1cGxvYWQgb3Vyc2VsdmVzLlxuICAgICAgICAgICAgICAgIHJldHVybiB0b29CaWdFcnJvcihyZXEsIHJlcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9KTtcbn1cblxuLy8gUGFzcyBhIHN0cmVhbSB0byB0aGUgT0dSMk9HUiBsaWJyYXJ5LCByZXR1cm5pbmcgYSBHZW9KU09OIHJlc3VsdC5cbmZ1bmN0aW9uIGNvbnZlcnRTdHJlYW0oc3RyZWFtLCByZXEsIHJlcywgaGludCwgZnBhdGgpIHtcbiAgICB2YXIgb2dyID0gb2dyMm9ncihzdHJlYW0sIGhpbnQpXG4gICAgICAgICAgICAgICAgICAgIC5za2lwZmFpbHVyZXMoKVxuICAgICAgICAgICAgICAgICAgICAub3B0aW9ucyhbJy10X3NycycsICdFUFNHOjQzMjYnXSk7XG5cbiAgICBvZ3IuZXhlYyhmdW5jdGlvbiAoZXIsIGRhdGEpIHtcbiAgICAgICAgaWYgKGVyKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdDb252ZXJ0IGVycm9yOiAnICsgZXIpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChkYXRhICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHJlcy5zdGF0dXMoMjAwKS5zZW5kKEpTT04uc3RyaW5naWZ5KGRhdGEpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJlcy5zdGF0dXMoNDE1KS4gLy8gVW5zdXBwb3J0ZWQgTWVkaWEgVHlwZVxuICAgICAgICAgICAgICAgIHNlbmQoJ1VuYWJsZSB0byBjb252ZXJ0IHRoaXMgZGF0YSBmaWxlLiBGb3IgYSBsaXN0IG9mIGZvcm1hdHMgc3VwcG9ydGVkIGJ5IFRlcnJpYSwgc2VlIGh0dHA6Ly93d3cuZ2RhbC5vcmcvb2dyX2Zvcm1hdHMuaHRtbCAuJyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGZwYXRoKSB7XG4gICAgICAgICAgICBmcy51bmxpbmsoZnBhdGgpOyAvLyBjbGVhbiB1cCB0aGUgdGVtcG9yYXJ5IGZpbGUgb24gZGlza1xuICAgICAgICB9XG4gICAgfSk7XG59XG5cbmZ1bmN0aW9uIGhhbmRsZUNvbnRlbnQgKGZwYXRoLCBmbmFtZSwgcmVxLCByZXMpIHtcbiAgICBpZiAoIWZwYXRoKSB7XG4gICAgICAgIHJldHVybiByZXMuc3RhdHVzKDQwMCkuc2VuZCgnTm8gZmlsZSBwcm92aWRlZCB0byBjb252ZXJ0LicpO1xuICAgIH1cbiAgICBjb25zb2xlLmxvZygnQ29udmVydDogcmVjZWl2aW5nIGZpbGUgbmFtZWQgJywgZm5hbWUpO1xuXG4gICAgdmFyIGhpbnQgPSAnJztcbiAgICAvL3NpbXBsZSBoaW50IGZvciBub3csIG1pZ2h0IG5lZWQgdG8gY3JhY2sgemlwIGZpbGVzIGdvaW5nIGZvcndhcmRcbiAgICBpZiAoZm5hbWUubWF0Y2goL1xcLnppcCQvKSkge1xuICAgICAgICBoaW50ID0gJ3NocCc7XG4gICAgfVxuICAgIGlmIChmcGF0aC5pbmRleE9mKCdodHRwJykgPT09IDApIHtcbiAgICAgICAgdmFyIGh0dHBTdHJlYW0sIGFib3J0ID0gZmFsc2U7XG4gICAgICAgIC8vIFJlYWQgZmlsZSBjb250ZW50IGJ5IG9wZW5pbmcgdGhlIFVSTCBnaXZlbiB0byB1c1xuICAgICAgICBodHRwU3RyZWFtID0gcmVxdWVzdC5nZXQoe3VybDogZnBhdGh9KTtcbiAgICAgICAgaHR0cFN0cmVhbS5vbigncmVzcG9uc2UnLCBmdW5jdGlvbihyZXNwb25zZSkge1xuICAgICAgICAgICAgdmFyIHJlcXVlc3QgPSB0aGlzLCBsZW4gPSAwO1xuICAgICAgICAgICAgY29udmVydFN0cmVhbShyZXNwb25zZSwgcmVxLCByZXMsIGhpbnQpO1xuICAgICAgICAgICAgcmVzcG9uc2Uub24oJ2RhdGEnLCBmdW5jdGlvbiAoY2h1bmspIHtcbiAgICAgICAgICAgICAgICBsZW4gKz0gY2h1bmsubGVuZ3RoO1xuICAgICAgICAgICAgICAgIGlmICghYWJvcnQgJiYgbGVuID4gY29udmVydC5tYXhDb252ZXJzaW9uU2l6ZSkge1xuICAgICAgICAgICAgICAgICAgICB0b29CaWdFcnJvcihyZXF1ZXN0LCByZXMpO1xuICAgICAgICAgICAgICAgICAgICBhYm9ydCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIGh0dHBTdHJlYW0uYWJvcnQoKTsgLy8gYXZvaWQgZmV0Y2hpbmcgdGhlIGVudGlyZSBmaWxlIG9uY2Ugd2Uga25vdyBpdCdzIHRvbyBiaWcuIFdlJ2xsIHByb2JhYmx5IGdldCBvbmUgb3IgdHdvIGNodW5rcyB0b28gbWFueS5cbiAgICAgICAgICAgICAgICAgICAgcmVzcG9uc2UuZGVzdHJveSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmVzcG9uc2Uub24oJ2VuZCcsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdDb252ZXJ0OiByZWNlaXZlZCBmaWxlIG9mICcgKyBsZW4gKyAnIGJ5dGVzJyArIChhYm9ydCA/ICcgKHdoaWNoIHdlXFwncmUgZGlzY2FyZGluZykuJyA6ICcuJykpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIFJlYWQgZmlsZSBjb250ZW50IGVtYmVkZGVkIGRpcmVjdGx5IGluIFBPU1QgZGF0YVxuICAgICAgICBjb252ZXJ0U3RyZWFtKGZzLmNyZWF0ZVJlYWRTdHJlYW0oZnBhdGgpLCByZXEsIHJlcywgaGludCwgZnBhdGgpO1xuICAgIH1cbn1cblxuLy8gcHJvdmlkZSBjb252ZXJzaW9uIHRvIGdlb2pzb24gc2VydmljZVxuLy8gcmVndWlyZXMgaW5zdGFsbCBvZiBnZGFsIG9uIHNlcnZlcjpcbi8vICAgc3VkbyBhcHQtZ2V0IGluc3RhbGwgZ2RhbC1iaW5cbmNvbnZlcnQucm91dGVyID0gZXhwcmVzcy5Sb3V0ZXIoKS5wb3N0KCcvJywgIGZ1bmN0aW9uKHJlcSwgcmVzKSB7XG4gICAgcGFyc2VGb3JtKHJlcSwgcmVzLCBoYW5kbGVDb250ZW50KTtcbn0pO1xuXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24ob3B0aW9ucykge1xuICAgIGlmIChvcHRpb25zKSB7XG4gICAgICAgIGNvbnZlcnQubWF4Q29udmVyc2lvblNpemUgPSBvcHRpb25zLnNldHRpbmdzLm1heENvbnZlcnNpb25TaXplIHx8IDEwMDAwMDA7XG4gICAgfVxuICAgIHJldHVybiBjb252ZXJ0O1xufTsiLCIvKiBqc2hpbnQgbm9kZTogdHJ1ZSwgZXNuZXh0OiB0cnVlICovXG5cInVzZSBzdHJpY3RcIjtcbnZhciByb3V0ZXIgPSByZXF1aXJlKCdleHByZXNzJykuUm91dGVyKCk7XG52YXIgcmVxdWVzdCA9IHJlcXVpcmUoJ3JlcXVlc3QnKTtcbnZhciBib2R5UGFyc2VyID0gcmVxdWlyZSgnYm9keS1wYXJzZXInKTtcbnZhciB1cmwgPSByZXF1aXJlKCd1cmwnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgaWYgKCFvcHRpb25zIHx8ICFvcHRpb25zLnNlcnZlcnMpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIFRoZSBtYXhpbXVtIHNpemUgb2YgdGhlIEpTT04gZGF0YS5cbiAgICBsZXQgcG9zdFNpemVMaW1pdCA9IG9wdGlvbnMucG9zdFNpemVMaW1pdCB8fCAnMTAyNCc7XG5cbiAgICBsZXQgdG9rZW5TZXJ2ZXJzID0gcGFyc2VVcmxzKG9wdGlvbnMuc2VydmVycyk7XG4gICAgdG9rZW5TZXJ2ZXJzID0gdmFsaWRhdGVTZXJ2ZXJDb25maWcodG9rZW5TZXJ2ZXJzKTtcblxuICAgIHJvdXRlci51c2UoYm9keVBhcnNlci5qc29uKHtsaW1pdDpwb3N0U2l6ZUxpbWl0LCB0eXBlOidhcHBsaWNhdGlvbi9qc29uJ30pKTtcbiAgICByb3V0ZXIucG9zdCgnLycsIGZ1bmN0aW9uKHJlcSwgcmVzLCBuZXh0KSB7XG4gICAgICAgIGxldCBwYXJhbWV0ZXJzID0gcmVxLmJvZHk7XG5cbiAgICAgICAgaWYgKCFwYXJhbWV0ZXJzLnVybCkge1xuICAgICAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNDAwKS5zZW5kKCdObyBVUkwgc3BlY2lmaWVkLicpO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IHRhcmdldFVybCA9IHBhcnNlVXJsKHBhcmFtZXRlcnMudXJsKTtcbiAgICAgICAgaWYgKCF0YXJnZXRVcmwgfHwgKHRhcmdldFVybC5sZW5ndGggPT09IDApIHx8ICh0eXBlb2YgdGFyZ2V0VXJsICE9PSAnc3RyaW5nJykpIHtcbiAgICAgICAgICAgIHJldHVybiByZXMuc3RhdHVzKDQwMCkuc2VuZCgnSW52YWxpZCBVUkwgc3BlY2lmaWVkLicpO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IHRva2VuU2VydmVyID0gdG9rZW5TZXJ2ZXJzW3RhcmdldFVybF07XG4gICAgICAgIGlmICghdG9rZW5TZXJ2ZXIpIHtcbiAgICAgICAgICAgIHJldHVybiByZXMuc3RhdHVzKDQwMCkuc2VuZCgnVW5zdXBwb3J0ZWQgVVJMIHNwZWNpZmllZC4nKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJlcXVlc3Qoe1xuICAgICAgICAgICAgdXJsOiB0b2tlblNlcnZlci50b2tlblVybCxcbiAgICAgICAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgICdVc2VyLUFnZW50JzogJ1RlcnJpYUpTRVNSSVRva2VuQXV0aCcsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZm9ybTp7XG4gICAgICAgICAgICAgICAgdXNlcm5hbWU6IHRva2VuU2VydmVyLnVzZXJuYW1lLFxuICAgICAgICAgICAgICAgIHBhc3N3b3JkOiB0b2tlblNlcnZlci5wYXNzd29yZCxcbiAgICAgICAgICAgICAgICBmOiAnSlNPTidcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgZnVuY3Rpb24oZXJyb3IsIHJlc3BvbnNlLCBib2R5KSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHJlcy5zZXQoJ0NvbnRlbnQtVHlwZScsICdhcHBsaWNhdGlvbi9qc29uJyk7XG5cbiAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2Uuc3RhdHVzQ29kZSAhPT0gMjAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZXMuc3RhdHVzKDUwMikuc2VuZCgnVG9rZW4gc2VydmVyIGZhaWxlZC4nKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBsZXQgdmFsdWUgPSBKU09OLnBhcnNlKHJlc3BvbnNlLmJvZHkpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVzLnN0YXR1cygyMDApLnNlbmQoSlNPTi5zdHJpbmdpZnkodmFsdWUpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg1MDApLnNlbmQoJ0Vycm9yIHByb2Nlc3Npbmcgc2VydmVyIHJlc3BvbnNlLicpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9KTtcblxuICAgIHJldHVybiByb3V0ZXI7XG59O1xuXG5mdW5jdGlvbiBwYXJzZVVybHMoc2VydmVycykge1xuICAgIGxldCByZXN1bHQgPSB7fTtcblxuICAgIE9iamVjdC5rZXlzKHNlcnZlcnMpLmZvckVhY2goc2VydmVyID0+IHtcbiAgICAgICAgbGV0IHBhcnNlZFVybCA9IHBhcnNlVXJsKHNlcnZlcilcbiAgICAgICAgaWYgKHBhcnNlZFVybCkge1xuICAgICAgICAgICAgcmVzdWx0W3BhcnNlZFVybF0gPSBzZXJ2ZXJzW3NlcnZlcl07XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdJbnZhbGlkIGNvbmZpZ3VyYXRpb24uIFRoZSBVUkw6IFxcJycgKyBzZXJ2ZXIgKyAnXFwnIGlzIG5vdCB2YWxpZC4nKTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZnVuY3Rpb24gcGFyc2VVcmwodXJsU3RyaW5nKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgcmV0dXJuIHVybC5mb3JtYXQodXJsLnBhcnNlKHVybFN0cmluZykpO1xuICAgIH1cbiAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgcmV0dXJuICcnO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gdmFsaWRhdGVTZXJ2ZXJDb25maWcoc2VydmVycylcbntcbiAgICBsZXQgcmVzdWx0ID0ge307XG5cbiAgICBPYmplY3Qua2V5cyhzZXJ2ZXJzKS5mb3JFYWNoKHVybCA9PiB7XG4gICAgICAgIGxldCBzZXJ2ZXIgPSBzZXJ2ZXJzW3VybF07XG4gICAgICAgIGlmIChzZXJ2ZXIudXNlcm5hbWUgJiYgc2VydmVyLnBhc3N3b3JkICYmIHNlcnZlci50b2tlblVybCkge1xuICAgICAgICAgICAgcmVzdWx0W3VybF0gPSBzZXJ2ZXI7XG5cbiAgICAgICAgICAgIC8vIE5vdGU6IFdlIHNob3VsZCByZWFsbHkgb25seSB2YWxpZGF0ZSBVUkxzIHRoYXQgYXJlIEhUVFBTIHRvIHNhdmUgdXMgZnJvbSBvdXJzZWx2ZXMsIGJ1dCB0aGUgY3VycmVudFxuICAgICAgICAgICAgLy8gc2VydmVycyB3ZSBuZWVkIHRvIHN1cHBvcnQgZG9uJ3Qgc3VwcG9ydCBIVFRQUyA6KCBzbyB0aGUgYmVzdCB0aGF0IHdlIGNhbiBkbyBpcyB3YXJuIGFnYWluc3QgaXQuXG4gICAgICAgICAgICBpZiAoIWlzSHR0cHMoc2VydmVyLnRva2VuVXJsKSkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0FsbCBjb21tdW5pY2F0aW9ucyBzaG91bGQgYmUgVExTIGJ1dCB0aGUgVVJMIFxcJycgKyBzZXJ2ZXIudG9rZW5VcmwgKyAnXFwnIGRvZXMgbm90IHVzZSBodHRwcy4nKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0JhZCBDb25maWd1cmF0aW9uLiBcXCcnICsgdXJsICsgJ1xcJyBkb2VzIG5vdCBzdXBwbHkgYWxsIG9mIHRoZSByZXF1aXJlZCBwcm9wZXJ0aWVzLicpO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICByZXR1cm4gcmVzdWx0O1xufVxuXG5mdW5jdGlvbiBpc0h0dHBzKHVybFN0cmluZyl7XG4gICAgdHJ5IHtcbiAgICAgICAgcmV0dXJuICh1cmwucGFyc2UodXJsU3RyaW5nKS5wcm90b2NvbCA9PT0gJ2h0dHBzOicpXG4gICAgfVxuICAgIGNhdGNoIChlcnJvcilcbiAgICB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG59XG4iLCIvKiBqc2hpbnQgbm9kZTogdHJ1ZSAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgYm9keVBhcnNlciA9IHJlcXVpcmUoJ2JvZHktcGFyc2VyJyk7XG52YXIgcm91dGVyID0gcmVxdWlyZSgnZXhwcmVzcycpLlJvdXRlcigpO1xudmFyIHVybCA9IHJlcXVpcmUoJ3VybCcpO1xudmFyIHJlcXVlc3QgPSByZXF1aXJlKCdyZXF1ZXN0Jyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24ob3B0aW9ucykge1xuICAgIGlmICghb3B0aW9ucyB8fCAhb3B0aW9ucy5pc3N1ZXNVcmwgfHwgIW9wdGlvbnMuYWNjZXNzVG9rZW4pIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHZhciBwYXJzZWRDcmVhdGVJc3N1ZVVybCA9IHVybC5wYXJzZShvcHRpb25zLmlzc3Vlc1VybCwgdHJ1ZSk7XG4gICAgcGFyc2VkQ3JlYXRlSXNzdWVVcmwucXVlcnkuYWNjZXNzX3Rva2VuID0gb3B0aW9ucy5hY2Nlc3NUb2tlbjtcbiAgICB2YXIgY3JlYXRlSXNzdWVVcmwgPSB1cmwuZm9ybWF0KHBhcnNlZENyZWF0ZUlzc3VlVXJsKTtcblxuICAgIHJvdXRlci51c2UoYm9keVBhcnNlci5qc29uKCkpO1xuICAgIHJvdXRlci5wb3N0KCcvJywgZnVuY3Rpb24ocmVxLCByZXMsIG5leHQpIHtcbiAgICAgICAgdmFyIHBhcmFtZXRlcnMgPSByZXEuYm9keTtcblxuICAgICAgICByZXF1ZXN0KHtcbiAgICAgICAgICAgIHVybDogY3JlYXRlSXNzdWVVcmwsXG4gICAgICAgICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICAnVXNlci1BZ2VudCc6IG9wdGlvbnMudXNlckFnZW50IHx8ICdUZXJyaWFCb3QgKFRlcnJpYUpTIEZlZWRiYWNrKScsXG4gICAgICAgICAgICAgICAgJ0FjY2VwdCc6ICdhcHBsaWNhdGlvbi92bmQuZ2l0aHViLnYzK2pzb24nXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgICAgICAgIHRpdGxlOiBwYXJhbWV0ZXJzLnRpdGxlID8gcGFyYW1ldGVycy50aXRsZSA6ICdVc2VyIEZlZWRiYWNrJyxcbiAgICAgICAgICAgICAgICBib2R5OiBmb3JtYXRCb2R5KHJlcSwgcGFyYW1ldGVycywgb3B0aW9ucy5hZGRpdGlvbmFsUGFyYW1ldGVycylcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH0sIGZ1bmN0aW9uKGVycm9yLCByZXNwb25zZSwgYm9keSkge1xuICAgICAgICAgICAgcmVzLnNldCgnQ29udGVudC1UeXBlJywgJ2FwcGxpY2F0aW9uL2pzb24nKTtcbiAgICAgICAgICAgIGlmIChyZXNwb25zZS5zdGF0dXNDb2RlIDwgMjAwIHx8IHJlc3BvbnNlLnN0YXR1c0NvZGUgPj0gMzAwKSB7XG4gICAgICAgICAgICAgICAgcmVzLnN0YXR1cyhyZXNwb25zZS5zdGF0dXNDb2RlKS5zZW5kKEpTT04uc3RyaW5naWZ5KHtyZXN1bHQ6ICdGQUlMRUQnfSkpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXMuc3RhdHVzKDIwMCkuc2VuZChKU09OLnN0cmluZ2lmeSh7cmVzdWx0OiAnU1VDQ0VTUyd9KSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgfSk7XG5cbiAgICByZXR1cm4gcm91dGVyO1xufTtcblxuZnVuY3Rpb24gZm9ybWF0Qm9keShyZXF1ZXN0LCBwYXJhbWV0ZXJzLCBhZGRpdGlvbmFsUGFyYW1ldGVycykge1xuICAgIHZhciByZXN1bHQgPSAnJztcblxuICAgIHJlc3VsdCArPSBwYXJhbWV0ZXJzLmNvbW1lbnQgPyBwYXJhbWV0ZXJzLmNvbW1lbnQgOiAnTm8gY29tbWVudCBwcm92aWRlZCc7XG4gICAgcmVzdWx0ICs9ICdcXG4jIyMgVXNlciBkZXRhaWxzXFxuJztcbiAgICByZXN1bHQgKz0gJyogTmFtZTogJyAgICAgICAgICArIChwYXJhbWV0ZXJzLm5hbWUgPyBwYXJhbWV0ZXJzLm5hbWUgOiAnTm90IHByb3ZpZGVkJykgKyAnXFxuJztcbiAgICByZXN1bHQgKz0gJyogRW1haWwgQWRkcmVzczogJyArIChwYXJhbWV0ZXJzLmVtYWlsID8gcGFyYW1ldGVycy5lbWFpbCA6ICdOb3QgcHJvdmlkZWQnKSArICdcXG4nO1xuICAgIHJlc3VsdCArPSAnKiBJUCBBZGRyZXNzOiAnICAgICsgcmVxdWVzdC5pcCArICdcXG4nO1xuICAgIHJlc3VsdCArPSAnKiBVc2VyIEFnZW50OiAnICAgICsgcmVxdWVzdC5oZWFkZXIoJ1VzZXItQWdlbnQnKSArICdcXG4nO1xuICAgIHJlc3VsdCArPSAnKiBSZWZlcnJlcjogJyAgICAgICsgcmVxdWVzdC5oZWFkZXIoJ1JlZmVycmVyJykgKyAnXFxuJztcbiAgICByZXN1bHQgKz0gJyogU2hhcmUgVVJMOiAnICAgICArIChwYXJhbWV0ZXJzLnNoYXJlTGluayA/IHBhcmFtZXRlcnMuc2hhcmVMaW5rIDogJ05vdCBwcm92aWRlZCcpICsgJ1xcbic7XG4gICAgaWYgKGFkZGl0aW9uYWxQYXJhbWV0ZXJzKSB7XG4gICAgICAgIGFkZGl0aW9uYWxQYXJhbWV0ZXJzLmZvckVhY2goKHBhcmFtZXRlcikgPT4ge1xuICAgICAgICAgICAgcmVzdWx0ICs9IGAqICR7cGFyYW1ldGVyLmRlc2NyaXB0aXZlTGFiZWx9OiAke3BhcmFtZXRlcnNbcGFyYW1ldGVyLm5hbWVdIHx8ICdOb3QgcHJvdmlkZWQnfVxcbmA7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiByZXN1bHQ7XG59XG4iLCIvKiBqc2hpbnQgbm9kZTogdHJ1ZSAqL1xuJ3VzZSBzdHJpY3QnO1xudmFyIGV4cHJlc3MgPSByZXF1aXJlKCdleHByZXNzJyk7XG52YXIgcm91dGVyID0gcmVxdWlyZSgnZXhwcmVzcycpLlJvdXRlcigpO1xudmFyIGV4aXN0cyA9IHJlcXVpcmUoJy4uL2V4aXN0cycpO1xudmFyIHBhdGggPSByZXF1aXJlKCdwYXRoJyk7XG4vKipcbiAqIFNwZWNpYWwgaGFuZGxpbmcgZm9yIC9pbml0L2Zvby5qc29uIHJlcXVlc3RzOiBsb29rIGluIGluaXRQYXRocywgbm90IGp1c3Qgd3d3cm9vdC9pbml0XG4gKiBAcGFyYW0gIHtTdHJpbmdbXX0gaW5pdFBhdGhzICAgICAgUGF0aHMgdG8gbG9vayBpbiwgY2FuIGJlIHJlbGF0aXZlLlxuICogQHBhcmFtICB7ZnVuY3Rpb259IGVycm9yNDA0ICAgICAgIEVycm9yIHBhZ2UgaGFuZGxlci5cbiAqIEBwYXJhbSAge1N0cmluZ30gY29uZmlnRmlsZUJhc2UgICBEaXJlY3RvcnkgdG8gcmVzb2x2ZSByZWxhdGl2ZSBwYXRocyBmcm9tLlxuICogQHJldHVybiB7Um91dGVyfVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGluaXRQYXRocywgZXJyb3I0MDQsIGNvbmZpZ0ZpbGVCYXNlKSB7XG4gICAgaW5pdFBhdGhzLmZvckVhY2goZnVuY3Rpb24oaW5pdFBhdGgpIHtcbiAgICAgICAgcm91dGVyLnVzZShleHByZXNzLnN0YXRpYyhwYXRoLnJlc29sdmUoY29uZmlnRmlsZUJhc2UsIGluaXRQYXRoKSkpO1xuICAgIH0pO1xuICAgIHJldHVybiByb3V0ZXI7XG59OyIsIi8qIGpzaGludCBub2RlOiB0cnVlICovXG5cInVzZSBzdHJpY3RcIjtcbnZhciBleHByZXNzID0gcmVxdWlyZSgnZXhwcmVzcycpO1xudmFyIHJvdXRlciA9IGV4cHJlc3MuUm91dGVyKCk7XG5cbnZhciBwcm9qNCA9IHJlcXVpcmUoJ3Byb2o0Jyk7XG5cbi8vVE9ETzogY2hlY2sgaWYgdGhpcyBsb2FkcyB0aGUgZmlsZSBpbnRvIGVhY2ggY29yZSBhbmQgaWYgc28gdGhlbixcbnJlcXVpcmUoJ3Byb2o0anMtZGVmcy9lcHNnJykocHJvajQpO1xuXG5cbi8vcHJvdmlkZSBSRVNUIHNlcnZpY2UgZm9yIHByb2o0IGRlZmluaXRpb24gc3RyaW5nc1xucm91dGVyLmdldCgnLzpjcnMnLCBmdW5jdGlvbihyZXEsIHJlcywgbmV4dCkge1xuICAgIHZhciBlcHNnID0gcHJvajQuZGVmc1tyZXEucGFyYW1zLmNycy50b1VwcGVyQ2FzZSgpXTtcbiAgICBpZiAoZXBzZyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHJlcy5zdGF0dXMoMjAwKS5zZW5kKGVwc2cpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJlcy5zdGF0dXMoNDA0KS5zZW5kKCdObyBwcm9qNCBkZWZpbml0aW9uIGF2YWlsYWJsZSBmb3IgdGhpcyBDUlMuJyk7XG4gICAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gcm91dGVyOyIsIi8qIGpzaGludCBub2RlOiB0cnVlICovXG5cInVzZSBzdHJpY3RcIjtcblxudmFyIGJhc2ljQXV0aCA9IHJlcXVpcmUoJ2Jhc2ljLWF1dGgnKTtcbnZhciBleHByZXNzID0gcmVxdWlyZSgnZXhwcmVzcycpO1xudmFyIGRlZmF1bHRSZXF1ZXN0ID0gcmVxdWlyZSgncmVxdWVzdCcpO1xudmFyIHVybCA9IHJlcXVpcmUoJ3VybCcpO1xudmFyIGJvZHlQYXJzZXIgPSByZXF1aXJlKCdib2R5LXBhcnNlcicpO1xudmFyIHJhbmdlQ2hlY2sgPSByZXF1aXJlKCdyYW5nZV9jaGVjaycpO1xuXG52YXIgRE9fTk9UX1BST1hZX1JFR0VYID0gL14oPzpIb3N0fFgtRm9yd2FyZGVkLUhvc3R8UHJveHktQ29ubmVjdGlvbnxDb25uZWN0aW9ufEtlZXAtQWxpdmV8VHJhbnNmZXItRW5jb2Rpbmd8VEV8VHJhaWxlcnxQcm94eS1BdXRob3JpemF0aW9ufFByb3h5LUF1dGhlbnRpY2F0ZXxVcGdyYWRlfEV4cGlyZXN8cHJhZ21hfFN0cmljdC1UcmFuc3BvcnQtU2VjdXJpdHkpJC9pO1xudmFyIFBST1RPQ09MX1JFR0VYID0gL15cXHcrOlxcLy87XG52YXIgRFVSQVRJT05fUkVHRVggPSAvXihbXFxkLl0rKShtc3xzfG18aHxkfHd8eSkkLztcbnZhciBEVVJBVElPTl9VTklUUyA9IHtcbiAgICBtczogMS4wIC8gMTAwMCxcbiAgICBzOiAxLjAsXG4gICAgbTogNjAuMCxcbiAgICBoOiA2MC4wICogNjAuMCxcbiAgICBkOiAyNC4wICogNjAuMCAqIDYwLjAsXG4gICAgdzogNy4wICogMjQuMCAqIDYwLjAgKiA2MC4wLFxuICAgIHk6IDM2NSAqIDI0LjAgKiA2MC4wICogNjAuMFxufTtcbi8qKiBBZ2UgdG8gb3ZlcnJpZGUgY2FjaGUgaW5zdHJ1Y3Rpb25zIHdpdGggZm9yIHByb3hpZWQgZmlsZXMgKi9cbnZhciBERUZBVUxUX01BWF9BR0VfU0VDT05EUyA9IDEyMDk2MDA7IC8vIHR3byB3ZWVrc1xuXG4vKipcbiAqIENyZWF0ZXMgYW4gZXhwcmVzcyBtaWRkbGV3YXJlIHRoYXQgcHJveGllcyBjYWxscyB0byAnL3Byb3h5L2h0dHA6Ly9leGFtcGxlJyB0byAnaHR0cDovL2V4YW1wbGUnLCB3aGlsZSBmb3JjaW5nIHRoZW1cbiAqIHRvIGJlIGNhY2hlZCBieSB0aGUgYnJvd3NlciBhbmQgb3ZlcnJ3cml0aW5nIENPUlMgaGVhZGVycy4gQSBjYWNoZSBkdXJhdGlvbiBjYW4gYmUgYWRkZWQgd2l0aCBhIFVSTCBsaWtlXG4gKiAvcHJveHkvXzVtL2h0dHA6Ly9leGFtcGxlIHdoaWNoIGNhdXNlcyAnQ2FjaGUtQ29udHJvbDogcHVibGljLG1heC1hZ2U9MzAwJyB0byBiZSBhZGRlZCB0byB0aGUgcmVzcG9uc2UgaGVhZGVycy5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICogQHBhcmFtIHtBcnJheVtTdHJpbmddfSBvcHRpb25zLnByb3h5YWJsZURvbWFpbnMgQW4gYXJyYXkgb2YgZG9tYWlucyB0byBiZSBwcm94aWVkXG4gKiBAcGFyYW0ge2Jvb2xlYW59IG9wdGlvbnMucHJveHlBbGxEb21haW5zIEEgYm9vbGVhbiBpbmRpY2F0aW5nIHdoZXRoZXIgb3Igbm90IHdlIHNob3VsZCBwcm94eSBBTEwgZG9tYWlucyAtIG92ZXJyaWRlc1xuICogICAgICAgICAgICAgICAgICAgICAgdGhlIGNvbmZpZ3VyYXRpb24gaW4gb3B0aW9ucy5wcm94eURvbWFpbnNcbiAqIEBwYXJhbSB7U3RyaW5nfSBvcHRpb25zLnByb3h5QXV0aCBBIG1hcCBvZiBkb21haW5zIHRvIHRva2VucyB0aGF0IHdpbGwgYmUgcGFzc2VkIHRvIHRob3NlIGRvbWFpbnMgdmlhIGJhc2ljIGF1dGhcbiAqICAgICAgICAgICAgICAgICAgICAgIHdoZW4gcHJveHlpbmcgdGhyb3VnaCB0aGVtLlxuICogQHBhcmFtIHtTdHJpbmd9IG9wdGlvbnMudXBzdHJlYW1Qcm94eSBVcmwgb2YgYSBzdGFuZGFyZCB1cHN0cmVhbSBwcm94eSB0aGF0IHdpbGwgYmUgdXNlZCB0byByZXRyaWV2ZSBkYXRhLlxuICogQHBhcmFtIHtTdHJpbmd9IG9wdGlvbnMuYnlwYXNzVXBzdHJlYW1Qcm94eUhvc3RzIEFuIG9iamVjdCBvZiBob3N0cyAoYXMgc3RyaW5ncykgdG8gJ3RydWUnIHZhbHVlcy5cbiAqIEBwYXJhbSB7U3RyaW5nfSBvcHRpb25zLnByb3h5UG9zdFNpemVMaW1pdCBUaGUgbWF4aW11bSBzaXplIG9mIGEgUE9TVCByZXF1ZXN0IHRoYXQgdGhlIHByb3h5IHdpbGwgYWxsb3cgdGhyb3VnaCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGluIGJ5dGVzIGlmIG5vIHVuaXQgaXMgc3BlY2lmaWVkLCBvciBzb21lIHJlYXNvbmFibGUgdW5pdCBsaWtlICdrYicgZm9yIGtpbG9ieXRlcyBvciAnbWInIGZvciBtZWdhYnl0ZXMuXG4gKlxuICogQHJldHVybnMgeyp9IEEgbWlkZGxld2FyZSB0aGF0IGNhbiBiZSB1c2VkIHdpdGggZXhwcmVzcy5cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgdmFyIHJlcXVlc3QgPSBvcHRpb25zLnJlcXVlc3QgfHwgZGVmYXVsdFJlcXVlc3Q7IC8vb3ZlcnJpZGFibGUgZm9yIHRlc3RzXG4gICAgdmFyIHByb3h5QWxsRG9tYWlucyA9IG9wdGlvbnMucHJveHlBbGxEb21haW5zO1xuICAgIHZhciBwcm94eURvbWFpbnMgPSBvcHRpb25zLnByb3h5YWJsZURvbWFpbnMgfHwgW107XG4gICAgdmFyIHByb3h5QXV0aCA9IG9wdGlvbnMucHJveHlBdXRoIHx8IHt9O1xuICAgIHZhciBwcm94eVBvc3RTaXplTGltaXQgPSBvcHRpb25zLnByb3h5UG9zdFNpemVMaW1pdCB8fCAnMTAyNDAwJztcbiAgICBcbiAgICAvLyBJZiB5b3UgY2hhbmdlIHRoaXMsIGFsc28gY2hhbmdlIHRoZSBzYW1lIGxpc3QgaW4gc2VydmVyY29uZmlnLmpzb24uZXhhbXBsZS5cbiAgICAvLyBUaGlzIHBhZ2UgaXMgaGVscGZ1bDogaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvUmVzZXJ2ZWRfSVBfYWRkcmVzc2VzXG4gICAgdmFyIGJsYWNrbGlzdGVkQWRkcmVzc2VzID0gb3B0aW9ucy5ibGFja2xpc3RlZEFkZHJlc3NlcyB8fCBbXG4gICAgICAgIC8vIGxvb3BiYWNrIGFkZHJlc3Nlc1xuICAgICAgICAnMTI3LjAuMC4wLzgnLFxuICAgICAgICAnOjoxLzEyOCcsXG4gICAgICAgIC8vIGxpbmsgbG9jYWwgYWRkcmVzc2VzXG4gICAgICAgICcxNjkuMjU0LjAuMC8xNicsXG4gICAgICAgICdmZTgwOjovMTAnLFxuICAgICAgICAvLyBwcml2YXRlIG5ldHdvcmsgYWRkcmVzc2VzXG4gICAgICAgICcxMC4wLjAuMC84JyxcbiAgICAgICAgJzE3Mi4xNi4wLjAvMTInLFxuICAgICAgICAnMTkyLjE2OC4wLjAvMTYnLFxuICAgICAgICAnZmMwMDo6LzcnLFxuICAgICAgICAvLyBvdGhlclxuICAgICAgICAnMC4wLjAuMC84JyxcbiAgICAgICAgJzEwMC42NC4wLjAvMTAnLFxuICAgICAgICAnMTkyLjAuMC4wLzI0JyxcbiAgICAgICAgJzE5Mi4wLjIuMC8yNCcsXG4gICAgICAgICcxOTguMTguMC4wLzE1JyxcbiAgICAgICAgJzE5Mi44OC45OS4wLzI0JyxcbiAgICAgICAgJzE5OC41MS4xMDAuMC8yNCcsXG4gICAgICAgICcyMDMuMC4xMTMuMC8yNCcsXG4gICAgICAgICcyMjQuMC4wLjAvNCcsXG4gICAgICAgICcyNDAuMC4wLjAvNCcsXG4gICAgICAgICcyNTUuMjU1LjI1NS4yNTUvMzInLFxuICAgICAgICAnOjovMTI4JyxcbiAgICAgICAgJzIwMDE6ZGI4OjovMzInLFxuICAgICAgICAnZmYwMDo6LzgnXG4gICAgXTtcblxuICAgIC8vTm9uIENPUlMgaG9zdHMgYW5kIGRvbWFpbnMgd2UgcHJveHkgdG9cbiAgICBmdW5jdGlvbiBwcm94eUFsbG93ZWRIb3N0KGhvc3QpIHtcbiAgICAgICAgLy8gRXhjbHVkZSBob3N0cyB0aGF0IGFyZSByZWFsbHkgSVAgYWRkcmVzc2VzIGFuZCBhcmUgaW4gb3VyIGJsYWNrbGlzdC5cbiAgICAgICAgaWYgKHJhbmdlQ2hlY2suaW5SYW5nZShob3N0LCBibGFja2xpc3RlZEFkZHJlc3NlcykpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwcm94eUFsbERvbWFpbnMpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgaG9zdCA9IGhvc3QudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgLy9jaGVjayB0aGF0IGhvc3QgaXMgZnJvbSBvbmUgb2YgdGhlc2UgZG9tYWluc1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHByb3h5RG9tYWlucy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaWYgKGhvc3QuaW5kZXhPZihwcm94eURvbWFpbnNbaV0sIGhvc3QubGVuZ3RoIC0gcHJveHlEb21haW5zW2ldLmxlbmd0aCkgIT09IC0xKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGRvUHJveHkocmVxLCByZXMsIG5leHQsIHJldHJ5V2l0aG91dEF1dGgsIGNhbGxiYWNrKSB7XG4gICAgICAgIHZhciByZW1vdGVVcmxTdHJpbmcgPSByZXEudXJsLnN1YnN0cmluZygxKTtcblxuICAgICAgICBpZiAoIXJlbW90ZVVybFN0cmluZyB8fCByZW1vdGVVcmxTdHJpbmcubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDApLnNlbmQoJ05vIHVybCBzcGVjaWZpZWQuJyk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBEb2VzIHRoZSBwcm94eSBVUkwgaW5jbHVkZSBhIG1heCBhZ2U/XG4gICAgICAgIHZhciBtYXhBZ2VTZWNvbmRzID0gREVGQVVMVF9NQVhfQUdFX1NFQ09ORFM7XG4gICAgICAgIGlmIChyZW1vdGVVcmxTdHJpbmdbMF0gPT09ICdfJykge1xuICAgICAgICAgICAgdmFyIHNsYXNoSW5kZXggPSByZW1vdGVVcmxTdHJpbmcuaW5kZXhPZignLycpO1xuICAgICAgICAgICAgaWYgKHNsYXNoSW5kZXggPCAwKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNDAwKS5zZW5kKCdObyB1cmwgc3BlY2lmaWVkLicpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgbWF4QWdlU3RyaW5nID0gcmVtb3RlVXJsU3RyaW5nLnN1YnN0cmluZygxLCBzbGFzaEluZGV4KTtcbiAgICAgICAgICAgIHJlbW90ZVVybFN0cmluZyA9IHJlbW90ZVVybFN0cmluZy5zdWJzdHJpbmcoc2xhc2hJbmRleCArIDEpO1xuXG4gICAgICAgICAgICBpZiAocmVtb3RlVXJsU3RyaW5nLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIHJldHVybiByZXMuc3RhdHVzKDQwMCkuc2VuZCgnTm8gdXJsIHNwZWNpZmllZC4nKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gSW50ZXJwcmV0IHRoZSBtYXggYWdlIGFzIGEgZHVyYXRpb24gaW4gVmFybmlzaCBub3RhdGlvbi5cbiAgICAgICAgICAgIC8vIGh0dHBzOi8vd3d3LnZhcm5pc2gtY2FjaGUub3JnL2RvY3MvdHJ1bmsvcmVmZXJlbmNlL3ZjbC5odG1sI2R1cmF0aW9uc1xuICAgICAgICAgICAgdmFyIHBhcnNlZE1heEFnZSA9IERVUkFUSU9OX1JFR0VYLmV4ZWMobWF4QWdlU3RyaW5nKTtcbiAgICAgICAgICAgIGlmICghcGFyc2VkTWF4QWdlIHx8IHBhcnNlZE1heEFnZS5sZW5ndGggPCAzKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNDAwKS5zZW5kKCdJbnZhbGlkIGR1cmF0aW9uLicpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgdmFsdWUgPSBwYXJzZUZsb2F0KHBhcnNlZE1heEFnZVsxXSk7XG4gICAgICAgICAgICBpZiAodmFsdWUgIT09IHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNDAwKS5zZW5kKCdJbnZhbGlkIGR1cmF0aW9uLicpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgdW5pdENvbnZlcnNpb24gPSBEVVJBVElPTl9VTklUU1twYXJzZWRNYXhBZ2VbMl1dO1xuICAgICAgICAgICAgaWYgKCF1bml0Q29udmVyc2lvbikge1xuICAgICAgICAgICAgICAgIHJldHVybiByZXMuc3RhdHVzKDQwMCkuc2VuZCgnSW52YWxpZCBkdXJhdGlvbiB1bml0ICcgKyBwYXJzZWRNYXhBZ2VbMl0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBtYXhBZ2VTZWNvbmRzID0gdmFsdWUgKiB1bml0Q29udmVyc2lvbjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEFkZCBodHRwOi8vIGlmIG5vIHByb3RvY29sIGlzIHNwZWNpZmllZC5cbiAgICAgICAgdmFyIHByb3RvY29sTWF0Y2ggPSBQUk9UT0NPTF9SRUdFWC5leGVjKHJlbW90ZVVybFN0cmluZyk7XG4gICAgICAgIGlmICghcHJvdG9jb2xNYXRjaCB8fCBwcm90b2NvbE1hdGNoLmxlbmd0aCA8IDEpIHtcbiAgICAgICAgICAgIHJlbW90ZVVybFN0cmluZyA9ICdodHRwOi8vJyArIHJlbW90ZVVybFN0cmluZztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHZhciBtYXRjaGVkUGFydCA9IHByb3RvY29sTWF0Y2hbMF07XG5cbiAgICAgICAgICAgIC8vIElmIHRoZSBwcm90b2NvbCBwb3J0aW9uIG9mIHRoZSBVUkwgb25seSBoYXMgYSBzaW5nbGUgc2xhc2ggYWZ0ZXIgaXQsIHRoZSBleHRyYSBzbGFzaCB3YXMgcHJvYmFibHkgc3RyaXBwZWQgb2ZmIGJ5IHNvbWVvbmVcbiAgICAgICAgICAgIC8vIGFsb25nIHRoZSB3YXkgKE5HSU5YIHdpbGwgZG8gdGhpcykuICBBZGQgaXQgYmFjay5cbiAgICAgICAgICAgIGlmIChyZW1vdGVVcmxTdHJpbmdbbWF0Y2hlZFBhcnQubGVuZ3RoXSAhPT0gJy8nKSB7XG4gICAgICAgICAgICAgICAgcmVtb3RlVXJsU3RyaW5nID0gbWF0Y2hlZFBhcnQgKyAnLycgKyByZW1vdGVVcmxTdHJpbmcuc3Vic3RyaW5nKG1hdGNoZWRQYXJ0Lmxlbmd0aCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgcmVtb3RlVXJsID0gdXJsLnBhcnNlKHJlbW90ZVVybFN0cmluZyk7XG5cbiAgICAgICAgLy8gQ29weSB0aGUgcXVlcnkgc3RyaW5nXG4gICAgICAgIHJlbW90ZVVybC5zZWFyY2ggPSB1cmwucGFyc2UocmVxLnVybCkuc2VhcmNoO1xuXG4gICAgICAgIGlmICghcmVtb3RlVXJsLnByb3RvY29sKSB7XG4gICAgICAgICAgICByZW1vdGVVcmwucHJvdG9jb2wgPSAnaHR0cDonO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHByb3h5O1xuICAgICAgICBpZiAob3B0aW9ucy51cHN0cmVhbVByb3h5ICYmICEoKG9wdGlvbnMuYnlwYXNzVXBzdHJlYW1Qcm94eUhvc3RzIHx8IHt9KVtyZW1vdGVVcmwuaG9zdF0pKSB7XG4gICAgICAgICAgICBwcm94eSA9IG9wdGlvbnMudXBzdHJlYW1Qcm94eTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEFyZSB3ZSBhbGxvd2VkIHRvIHByb3h5IGZvciB0aGlzIGhvc3Q/XG4gICAgICAgIGlmICghcHJveHlBbGxvd2VkSG9zdChyZW1vdGVVcmwuaG9zdCkpIHtcbiAgICAgICAgICAgIHJlcy5zdGF0dXMoNDAzKS5zZW5kKCdIb3N0IGlzIG5vdCBpbiBsaXN0IG9mIGFsbG93ZWQgaG9zdHM6ICcgKyByZW1vdGVVcmwuaG9zdCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBlbmNvZGluZyA6IG51bGwgbWVhbnMgXCJib2R5XCIgcGFzc2VkIHRvIHRoZSBjYWxsYmFjayB3aWxsIGJlIHJhdyBieXRlc1xuXG4gICAgICAgIHZhciBwcm94aWVkUmVxdWVzdDtcbiAgICAgICAgcmVxLm9uKCdjbG9zZScsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaWYgKHByb3hpZWRSZXF1ZXN0KSB7XG4gICAgICAgICAgICAgICAgcHJveGllZFJlcXVlc3QuYWJvcnQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgdmFyIGZpbHRlcmVkUmVxSGVhZGVycyA9IGZpbHRlckhlYWRlcnMocmVxLmhlYWRlcnMpO1xuICAgICAgICBpZiAoZmlsdGVyZWRSZXFIZWFkZXJzWyd4LWZvcndhcmRlZC1mb3InXSkge1xuICAgICAgICAgICAgZmlsdGVyZWRSZXFIZWFkZXJzWyd4LWZvcndhcmRlZC1mb3InXSA9IGZpbHRlcmVkUmVxSGVhZGVyc1sneC1mb3J3YXJkZWQtZm9yJ10gKyAnLCAnICsgcmVxLmNvbm5lY3Rpb24ucmVtb3RlQWRkcmVzcztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGZpbHRlcmVkUmVxSGVhZGVyc1sneC1mb3J3YXJkZWQtZm9yJ10gPSByZXEuY29ubmVjdGlvbi5yZW1vdGVBZGRyZXNzO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gUmVtb3ZlIHRoZSBBdXRob3JpemF0aW9uIGhlYWRlciBpZiB3ZSB1c2VkIGl0IHRvIGF1dGhlbnRpY2F0ZSB0aGUgcmVxdWVzdCB0byB0ZXJyaWFqcy1zZXJ2ZXIuXG4gICAgICAgIGlmIChvcHRpb25zLmJhc2ljQXV0aGVudGljYXRpb24gJiYgb3B0aW9ucy5iYXNpY0F1dGhlbnRpY2F0aW9uLnVzZXJuYW1lICYmIG9wdGlvbnMuYmFzaWNBdXRoZW50aWNhdGlvbi5wYXNzd29yZCkge1xuICAgICAgICAgICAgZGVsZXRlIGZpbHRlcmVkUmVxSGVhZGVyc1snYXV0aG9yaXphdGlvbiddO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFyZXRyeVdpdGhvdXRBdXRoKSB7XG4gICAgICAgICAgICB2YXIgYXV0aFJlcXVpcmVkID0gcHJveHlBdXRoW3JlbW90ZVVybC5ob3N0XTtcbiAgICAgICAgICAgIGlmIChhdXRoUmVxdWlyZWQpIHtcbiAgICAgICAgICAgICAgICBpZiAoYXV0aFJlcXVpcmVkLmF1dGhvcml6YXRpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gaHR0cCBiYXNpYyBhdXRoLlxuICAgICAgICAgICAgICAgICAgICBpZiAoIWZpbHRlcmVkUmVxSGVhZGVyc1snYXV0aG9yaXphdGlvbiddKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmaWx0ZXJlZFJlcUhlYWRlcnNbJ2F1dGhvcml6YXRpb24nXSA9IGF1dGhSZXF1aXJlZC5hdXRob3JpemF0aW9uO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChhdXRoUmVxdWlyZWQuaGVhZGVycykge1xuICAgICAgICAgICAgICAgICAgICAvLyBhIG1lY2hhbmlzbSB0byBwYXNzIGFyYml0cmFyeSBoZWFkZXJzLlxuICAgICAgICAgICAgICAgICAgICBhdXRoUmVxdWlyZWQuaGVhZGVycy5mb3JFYWNoKGZ1bmN0aW9uKGhlYWRlcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgZmlsdGVyZWRSZXFIZWFkZXJzW2hlYWRlci5uYW1lXSA9IGhlYWRlci52YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcHJveGllZFJlcXVlc3QgPSBjYWxsYmFjayhyZW1vdGVVcmwsIGZpbHRlcmVkUmVxSGVhZGVycywgcHJveHksIG1heEFnZVNlY29uZHMpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGJ1aWxkUmVxSGFuZGxlcihodHRwVmVyYikge1xuICAgICAgICBmdW5jdGlvbiBoYW5kbGVyKHJlcSwgcmVzLCBuZXh0KSB7XG4gICAgICAgICAgICByZXR1cm4gZG9Qcm94eShyZXEsIHJlcywgbmV4dCwgcmVxLnJldHJ5V2l0aG91dEF1dGgsIGZ1bmN0aW9uKHJlbW90ZVVybCwgZmlsdGVyZWRSZXF1ZXN0SGVhZGVycywgcHJveHksIG1heEFnZVNlY29uZHMpIHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgcHJveGllZFJlcXVlc3QgPSByZXF1ZXN0KHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1ldGhvZDogaHR0cFZlcmIsXG4gICAgICAgICAgICAgICAgICAgICAgICB1cmw6IHVybC5mb3JtYXQocmVtb3RlVXJsKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGhlYWRlcnM6IGZpbHRlcmVkUmVxdWVzdEhlYWRlcnMsXG4gICAgICAgICAgICAgICAgICAgICAgICBlbmNvZGluZzogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb3h5OiBwcm94eSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGJvZHk6IHJlcS5ib2R5LFxuICAgICAgICAgICAgICAgICAgICAgICAgZm9sbG93UmVkaXJlY3Q6IGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGxvY2F0aW9uID0gcmVzcG9uc2UuaGVhZGVycy5sb2NhdGlvbjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobG9jYXRpb24gJiYgbG9jYXRpb24ubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgcGFyc2VkID0gdXJsLnBhcnNlKGxvY2F0aW9uKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHByb3h5QWxsb3dlZEhvc3QocGFyc2VkLmhvc3QpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyByZWRpcmVjdCBpcyBva1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gcmVkaXJlY3QgaXMgZm9yYmlkZGVuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KS5vbignc29ja2V0JywgZnVuY3Rpb24oc29ja2V0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzb2NrZXQub25jZSgnbG9va3VwJywgZnVuY3Rpb24oZXJyLCBhZGRyZXNzLCBmYW1pbHksIGhvc3QpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocmFuZ2VDaGVjay5pblJhbmdlKGFkZHJlc3MsIGJsYWNrbGlzdGVkQWRkcmVzc2VzKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXMuc3RhdHVzKDQwMykuc2VuZCgnSVAgYWRkcmVzcyBpcyBub3QgYWxsb3dlZDogJyArIGFkZHJlc3MpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXMuZW5kKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb3hpZWRSZXF1ZXN0LmFib3J0KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH0pLm9uKCdlcnJvcicsIGZ1bmN0aW9uKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihlcnIpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBJZGVhbGx5IHdlIHdvdWxkIHJldHVybiBhbiBlcnJvciB0byB0aGUgY2xpZW50LCBidXQgaWYgaGVhZGVycyBoYXZlIGFscmVhZHkgYmVlbiBzZW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gYXR0ZW1wdGluZyB0byBzZXQgYSBzdGF0dXMgY29kZSBoZXJlIHdpbGwgZmFpbC4gU28gaW4gdGhhdCBjYXNlLCB3ZSdsbCBqdXN0IGVuZCB0aGUgcmVzcG9uc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBmb3IgbGFjayBvZiBhIGJldHRlciBvcHRpb24uXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVzLmhlYWRlcnNTZW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzLmVuZCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXMuc3RhdHVzKDUwMCkuc2VuZCgnUHJveHkgZXJyb3InKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSkub24oJ3Jlc3BvbnNlJywgZnVuY3Rpb24ocmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghcmVxLnJldHJ5V2l0aG91dEF1dGggJiYgcmVzcG9uc2Uuc3RhdHVzQ29kZSA9PT0gNDAzICYmIHByb3h5QXV0aFtyZW1vdGVVcmwuaG9zdF0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBXZSBhdXRvbWF0aWNhbGx5IGFkZGVkIGFuIGF1dGhlbnRpY2F0aW9uIGhlYWRlciB0byB0aGlzIHJlcXVlc3QgKGUuZy4gZnJvbSBwcm94eWF1dGguanNvbiksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gYnV0IGdvdCBiYWNrIGEgNDAzLCBpbmRpY2F0aW5nIG91ciBjcmVkZW50aWFscyBkaWRuJ3QgYXV0aG9yaXplIGFjY2VzcyB0byB0aGlzIHJlc291cmNlLlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRyeSBhZ2FpbiB3aXRob3V0IGNyZWRlbnRpYWxzIGluIG9yZGVyIHRvIGdpdmUgdGhlIHVzZXIgdGhlIG9wcG9ydHVuaXR5IHRvIHN1cHBseVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHRoZWlyIG93bi5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXEucmV0cnlXaXRob3V0QXV0aCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGhhbmRsZXIocmVxLCByZXMsIG5leHQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICByZXMuc3RhdHVzKHJlc3BvbnNlLnN0YXR1c0NvZGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzLmhlYWRlcihwcm9jZXNzSGVhZGVycyhyZXNwb25zZS5oZWFkZXJzLCBtYXhBZ2VTZWNvbmRzKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXNwb25zZS5vbignZGF0YScsIGZ1bmN0aW9uKGNodW5rKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzLndyaXRlKGNodW5rKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzcG9uc2Uub24oJ2VuZCcsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlcy5lbmQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZS5zdGFjayk7XG4gICAgICAgICAgICAgICAgICAgIHJlcy5zdGF0dXMoNTAwKS5zZW5kKCdQcm94eSBlcnJvcicpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHJldHVybiBwcm94aWVkUmVxdWVzdDtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGhhbmRsZXI7XG4gICAgfVxuXG4gICAgdmFyIHJvdXRlciA9IGV4cHJlc3MuUm91dGVyKCk7XG4gICAgcm91dGVyLmdldCgnLyonLCBidWlsZFJlcUhhbmRsZXIoJ0dFVCcpKTtcbiAgICByb3V0ZXIucG9zdCgnLyonLCBib2R5UGFyc2VyLnJhdyh7dHlwZTogZnVuY3Rpb24oKSB7IHJldHVybiB0cnVlO30sIGxpbWl0OiBwcm94eVBvc3RTaXplTGltaXR9KSwgYnVpbGRSZXFIYW5kbGVyKCdQT1NUJykpO1xuXG4gICAgcmV0dXJuIHJvdXRlcjtcbn07XG5cbi8qKlxuICogRmlsdGVycyBoZWFkZXJzIHRoYXQgYXJlIG5vdCBtYXRjaGVkIGJ5IHtAbGluayBET19OT1RfUFJPWFlfUkVHRVh9IG91dCBvZiBhbiBvYmplY3QgY29udGFpbmluZyBoZWFkZXJzLiBUaGlzIGRvZXMgbm90XG4gKiBtdXRhdGUgdGhlIG9yaWdpbmFsIGxpc3QuXG4gKlxuICogQHBhcmFtIGhlYWRlcnMgVGhlIGhlYWRlcnMgdG8gZmlsdGVyXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBBIG5ldyBvYmplY3Qgd2l0aCB0aGUgZmlsdGVyZWQgaGVhZGVycy5cbiAqL1xuZnVuY3Rpb24gZmlsdGVySGVhZGVycyhoZWFkZXJzKSB7XG4gICAgdmFyIHJlc3VsdCA9IHt9O1xuICAgIC8vIGZpbHRlciBvdXQgaGVhZGVycyB0aGF0IGFyZSBsaXN0ZWQgaW4gdGhlIHJlZ2V4IGFib3ZlXG4gICAgT2JqZWN0LmtleXMoaGVhZGVycykuZm9yRWFjaChmdW5jdGlvbihuYW1lKSB7XG4gICAgICAgIGlmICghRE9fTk9UX1BST1hZX1JFR0VYLnRlc3QobmFtZSkpIHtcbiAgICAgICAgICAgIHJlc3VsdFtuYW1lXSA9IGhlYWRlcnNbbmFtZV07XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIHJldHVybiByZXN1bHQ7XG59XG5cbi8qKlxuICogRmlsdGVycyBvdXQgaGVhZGVycyB0aGF0IHNob3VsZG4ndCBiZSBwcm94aWVkLCBvdmVycmlkZXMgY2FjaGluZyBzbyBmaWxlcyBhcmUgcmV0YWluZWQgZm9yIHtAbGluayBERUZBVUxUX01BWF9BR0VfU0VDT05EU30sXG4gKiBhbmQgc2V0cyBDT1JTIGhlYWRlcnMgdG8gYWxsb3cgYWxsIG9yaWdpbnNcbiAqXG4gKiBAcGFyYW0gaGVhZGVycyBUaGUgb3JpZ2luYWwgb2JqZWN0IG9mIGhlYWRlcnMuIFRoaXMgaXMgbm90IG11dGF0ZWQuXG4gKiBAcGFyYW0gbWF4QWdlU2Vjb25kcyB0aGUgYW1vdW50IG9mIHRpbWUgaW4gc2Vjb25kcyB0byBjYWNoZSBmb3IuIFRoaXMgd2lsbCBvdmVycmlkZSB3aGF0IHRoZSBvcmlnaW5hbCBzZXJ2ZXJcbiAqICAgICAgICAgIHNwZWNpZmllZCBiZWNhdXNlIHdlIGtub3cgYmV0dGVyIHRoYW4gdGhleSBkby5cbiAqIEByZXR1cm5zIHtPYmplY3R9IFRoZSBuZXcgaGVhZGVycyBvYmplY3QuXG4gKi9cbmZ1bmN0aW9uIHByb2Nlc3NIZWFkZXJzKGhlYWRlcnMsIG1heEFnZVNlY29uZHMpIHtcbiAgICB2YXIgcmVzdWx0ID0gZmlsdGVySGVhZGVycyhoZWFkZXJzKTtcblxuICAgIHJlc3VsdFsnQ2FjaGUtQ29udHJvbCddID0gJ3B1YmxpYyxtYXgtYWdlPScgKyBtYXhBZ2VTZWNvbmRzO1xuICAgIHJlc3VsdFsnQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luJ10gPSAnKic7XG5cbiAgICByZXR1cm4gcmVzdWx0O1xufVxuIiwiLyoganNoaW50IG5vZGU6IHRydWUgKi9cbid1c2Ugc3RyaWN0JztcbnZhciByb3V0ZXIgPSByZXF1aXJlKCdleHByZXNzJykuUm91dGVyKCk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24ob3B0aW9ucykge1xuICAgIHJvdXRlci5nZXQoJy8nLCBmdW5jdGlvbihyZXEsIHJlcywgbmV4dCkge1xuICAgICAgICByZXMuc3RhdHVzKDIwMCkuc2VuZChvcHRpb25zKTtcbiAgICB9KTtcbiAgICByZXR1cm4gcm91dGVyO1xufTsiLCIvKiBqc2hpbnQgbm9kZTogdHJ1ZSwgZXNuZXh0OiB0cnVlICovXG5cInVzZSBzdHJpY3RcIjtcbnZhciBleHByZXNzID0gcmVxdWlyZSgnZXhwcmVzcycpO1xuXG4vLyBFeHBvc2UgYSB3aGl0ZWxpc3RlZCBzZXQgb2YgY29uZmlndXJhdGlvbiBhdHRyaWJ1dGVzIHRvIHRoZSB3b3JsZC4gVGhpcyBkZWZpbml0ZWx5IGRvZXNuJ3QgaW5jbHVkZSBhdXRob3Jpc2F0aW9uIHRva2VucywgbG9jYWwgZmlsZSBwYXRocywgZXRjLlxuLy8gSXQgbWlycm9ycyB0aGUgc3RydWN0dXJlIG9mIHRoZSByZWFsIGNvbmZpZyBmaWxlLlxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgdmFyIHJvdXRlciA9IGV4cHJlc3MuUm91dGVyKCk7XG4gICAgdmFyIHNldHRpbmdzID0gT2JqZWN0LmFzc2lnbih7fSwgb3B0aW9ucy5zZXR0aW5ncyksIHNhZmVTZXR0aW5ncyA9IHt9O1xuICAgIHZhciBzYWZlQXR0cmlidXRlcyA9IFsnYWxsb3dQcm94eUZvcicsICdtYXhDb252ZXJzaW9uU2l6ZScsICduZXdTaGFyZVVybFByZWZpeCcsICdwcm94eUFsbERvbWFpbnMnXTtcbiAgICBzYWZlQXR0cmlidXRlcy5mb3JFYWNoKGtleSA9PiBzYWZlU2V0dGluZ3Nba2V5XSA9IHNldHRpbmdzW2tleV0pO1xuICAgIHNhZmVTZXR0aW5ncy52ZXJzaW9uID0gcmVxdWlyZSgnLi4vLi4vLi4vcGFja2FnZS5qc29uJykudmVyc2lvbjtcbiAgICBpZiAodHlwZW9mIHNldHRpbmdzLnNoYXJlVXJsUHJlZml4ZXMgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIHNhZmVTZXR0aW5ncy5zaGFyZVVybFByZWZpeGVzID0ge307XG4gICAgICAgIE9iamVjdC5rZXlzKHNldHRpbmdzLnNoYXJlVXJsUHJlZml4ZXMpLmZvckVhY2goZnVuY3Rpb24oa2V5KSB7XG4gICAgICAgICAgICBzYWZlU2V0dGluZ3Muc2hhcmVVcmxQcmVmaXhlc1trZXldID0geyBzZXJ2aWNlOiBzZXR0aW5ncy5zaGFyZVVybFByZWZpeGVzW2tleV0uc2VydmljZSB9O1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgaWYgKHNldHRpbmdzLmZlZWRiYWNrICYmIHNldHRpbmdzLmZlZWRiYWNrLmFkZGl0aW9uYWxQYXJhbWV0ZXJzKSB7XG4gICAgICAgIHNhZmVTZXR0aW5ncy5hZGRpdGlvbmFsRmVlZGJhY2tQYXJhbWV0ZXJzID0gc2V0dGluZ3MuZmVlZGJhY2suYWRkaXRpb25hbFBhcmFtZXRlcnM7XG4gICAgfVxuXG4gICAgcm91dGVyLmdldCgnLycsIGZ1bmN0aW9uKHJlcSwgcmVzLCBuZXh0KSB7XG4gICAgICAgIHJlcy5zdGF0dXMoMjAwKS5zZW5kKHNhZmVTZXR0aW5ncyk7XG4gICAgfSk7XG4gICAgcmV0dXJuIHJvdXRlcjtcbn07XG4iLCIvKiBqc2hpbnQgbm9kZTogdHJ1ZSwgZXNuZXh0OiB0cnVlICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBib2R5UGFyc2VyID0gcmVxdWlyZSgnYm9keS1wYXJzZXInKTtcbnZhciByZXF1ZXN0cCA9IHJlcXVpcmUoJ3JlcXVlc3QtcHJvbWlzZScpO1xudmFyIHJwZXJyb3JzID0gcmVxdWlyZSgncmVxdWVzdC1wcm9taXNlL2Vycm9ycycpO1xuXG52YXIgZ2lzdEFQSSA9ICdodHRwczovL2FwaS5naXRodWIuY29tL2dpc3RzJztcbnZhciBnb29nbGVVcmxTaG9ydGVuZXJBUEkgPSAnaHR0cHM6Ly93d3cuZ29vZ2xlYXBpcy5jb20vdXJsc2hvcnRlbmVyL3YxJztcblxudmFyIHByZWZpeFNlcGFyYXRvciA9ICctJzsgLy8gY2hhbmdlIHRoZSByZWdleCBiZWxvdyBpZiB5b3UgY2hhbmdlIHRoaXNcbnZhciBzcGxpdFByZWZpeFJlID0gL14oKFteLV0rKS0pPyguKikkLztcblxuLy9Zb3UgY2FuIHRlc3QgbGlrZSB0aGlzIHdpdGggaHR0cGllOlxuLy9lY2hvICd7IFwidGVzdFwiOiBcIm1lXCIgfScgfCBodHRwIHBvc3QgbG9jYWxob3N0OjMwMDEvYXBpL3YxL3NoYXJlXG5mdW5jdGlvbiBtYWtlR2lzdChzZXJ2aWNlT3B0aW9ucywgYm9keSkge1xuICAgIHZhciBnaXN0RmlsZSA9IHt9O1xuICAgIGdpc3RGaWxlW3NlcnZpY2VPcHRpb25zLmdpc3RGaWxlbmFtZSB8fCAndXNlcmNhdGFsb2cuanNvbiddID0geyBjb250ZW50OiBib2R5IH07XG5cbiAgICB2YXIgaGVhZGVycyA9IHtcbiAgICAgICAgJ1VzZXItQWdlbnQnOiBzZXJ2aWNlT3B0aW9ucy51c2VyQWdlbnQgfHwgJ1RlcnJpYUpTLVNlcnZlcicsXG4gICAgICAgICdBY2NlcHQnOiAnYXBwbGljYXRpb24vdm5kLmdpdGh1Yi52Mytqc29uJ1xuICAgIH07XG4gICAgaWYgKHNlcnZpY2VPcHRpb25zLmFjY2Vzc1Rva2VuICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgaGVhZGVyc1snQXV0aG9yaXphdGlvbiddID0gJ3Rva2VuICcgKyBzZXJ2aWNlT3B0aW9ucy5hY2Nlc3NUb2tlbjtcbiAgICB9XG4gICAgcmV0dXJuIHJlcXVlc3RwKHtcbiAgICAgICAgdXJsOiBnaXN0QVBJLFxuICAgICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgICAgaGVhZGVyczogaGVhZGVycyxcbiAgICAgICAganNvbjogdHJ1ZSxcbiAgICAgICAgYm9keToge1xuICAgICAgICAgICAgZmlsZXM6IGdpc3RGaWxlLFxuICAgICAgICAgICAgZGVzY3JpcHRpb246IChzZXJ2aWNlT3B0aW9ucy5naXN0RGVzY3JpcHRpb24gfHwgJ1VzZXItY3JlYXRlZCBjYXRhbG9nJyksXG4gICAgICAgICAgICBwdWJsaWM6IGZhbHNlXG4gICAgICAgIH0sIHRyYW5zZm9ybTogZnVuY3Rpb24oYm9keSwgcmVzcG9uc2UpIHtcbiAgICAgICAgICAgIGlmIChyZXNwb25zZS5zdGF0dXNDb2RlID09PSAyMDEpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnQ3JlYXRlZCBJRCAnICsgcmVzcG9uc2UuYm9keS5pZCArICcgdXNpbmcgR2lzdCBzZXJ2aWNlJyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmJvZHkuaWQ7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiByZXNwb25zZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0pO1xufVxuXG4vLyBUZXN0OiBodHRwIGxvY2FsaG9zdDozMDAxL2FwaS92MS9zaGFyZS9nLTk4ZTAxNjI1ZGIwN2E3OGQyM2I0MmMzZGJlMDhmZTIwXG5mdW5jdGlvbiByZXNvbHZlR2lzdChzZXJ2aWNlT3B0aW9ucywgaWQpIHtcbiAgICB2YXIgaGVhZGVycyA9IHtcbiAgICAgICAgJ1VzZXItQWdlbnQnOiBzZXJ2aWNlT3B0aW9ucy51c2VyQWdlbnQgfHwgJ1RlcnJpYUpTLVNlcnZlcicsXG4gICAgICAgICdBY2NlcHQnOiAnYXBwbGljYXRpb24vdm5kLmdpdGh1Yi52Mytqc29uJ1xuICAgIH07XG4gICAgaWYgKHNlcnZpY2VPcHRpb25zLmFjY2Vzc1Rva2VuICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgaGVhZGVyc1snQXV0aG9yaXphdGlvbiddID0gJ3Rva2VuICcgKyBzZXJ2aWNlT3B0aW9ucy5hY2Nlc3NUb2tlbjtcbiAgICB9XG4gICAgcmV0dXJuIHJlcXVlc3RwKHtcbiAgICAgICAgdXJsOiBnaXN0QVBJICsgJy8nICsgaWQsXG4gICAgICAgIGhlYWRlcnM6IGhlYWRlcnMsXG4gICAgICAgIGpzb246IHRydWUsXG4gICAgICAgIHRyYW5zZm9ybTogZnVuY3Rpb24oYm9keSwgcmVzcG9uc2UpIHtcbiAgICAgICAgICAgIGlmIChyZXNwb25zZS5zdGF0dXNDb2RlID49IDMwMCkge1xuICAgICAgICAgICAgICAgIHJldHVybiByZXNwb25zZTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGJvZHkuZmlsZXNbT2JqZWN0LmtleXMoYm9keS5maWxlcylbMF1dLmNvbnRlbnQ7IC8vIGZpbmQgdGhlIGNvbnRlbnRzIG9mIHRoZSBmaXJzdCBmaWxlIGluIHRoZSBnaXN0XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9KTtcbn1cbi8qXG4gIEdlbmVyYXRlIHNob3J0IElEIGJ5IGhhc2hpbmcgYm9keSwgY29udmVydGluZyB0byBiYXNlNjIgdGhlbiB0cnVuY2F0aW5nLlxuICovXG5mdW5jdGlvbiBzaG9ydElkKGJvZHksIGxlbmd0aCkge1xuICAgIHZhciBobWFjID0gcmVxdWlyZSgnY3J5cHRvJykuY3JlYXRlSG1hYygnc2hhMScsIGJvZHkpLmRpZ2VzdCgpO1xuICAgIHZhciBiYXNlNjIgPSByZXF1aXJlKFwiYmFzZS14XCIpKCcwMTIzNDU2Nzg5YWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXpBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWicpO1xuICAgIHZhciBmdWxsa2V5ID0gYmFzZTYyLmVuY29kZShobWFjKTtcbiAgICByZXR1cm4gZnVsbGtleS5zbGljZSgwLCBsZW5ndGgpOyAvLyBpZiBsZW5ndGggdW5kZWZpbmVkLCByZXR1cm4gdGhlIHdob2xlIHRoaW5nXG59XG5cbnZhciBfUzM7XG5cbmZ1bmN0aW9uIFMzKHNlcnZpY2VPcHRpb25zKSB7XG4gICAgaWYgKF9TMykge1xuICAgICAgICByZXR1cm4gX1MzO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciBhd3MgPSByZXF1aXJlKCdhd3Mtc2RrJyk7XG4gICAgICAgIGF3cy5jb25maWcuc2V0UHJvbWlzZXNEZXBlbmRlbmN5KHJlcXVpcmUoJ3doZW4nKS5Qcm9taXNlKTtcbiAgICAgICAgYXdzLmNvbmZpZy51cGRhdGUoe1xuICAgICAgICAgICAgcmVnaW9uOiBzZXJ2aWNlT3B0aW9ucy5yZWdpb25cbiAgICAgICAgfSk7XG4gICAgICAgIC8vIGlmIG5vIGNyZWRlbnRpYWxzIHByb3ZpZGVkLCB3ZSBhc3N1bWUgdGhhdCB0aGV5J3JlIGJlaW5nIHByb3ZpZGVkIGFzIGVudmlyb25tZW50IHZhcmlhYmxlcyBvciBpbiBhIGZpbGVcbiAgICAgICAgaWYgKHNlcnZpY2VPcHRpb25zLmFjY2Vzc0tleUlkKSB7XG4gICAgICAgICAgICBhd3MuY29uZmlnLnVwZGF0ZSh7XG4gICAgICAgICAgICAgICAgYWNjZXNzS2V5SWQ6IHNlcnZpY2VPcHRpb25zLmFjY2Vzc0tleUlkLFxuICAgICAgICAgICAgICAgIHNlY3JldEFjY2Vzc0tleTogc2VydmljZU9wdGlvbnMuc2VjcmV0QWNjZXNzS2V5XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBfUzMgPSBuZXcgYXdzLlMzKCk7XG4gICAgICAgIHJldHVybiBfUzM7XG4gICAgfVxufVxuXG4vLyBXZSBhcHBlbmQgc29tZSBwc2V1ZG8tZGlyIHByZWZpeGVzIGludG8gdGhlIGFjdHVhbCBvYmplY3QgSUQgdG8gYXZvaWQgdGhvdXNhbmRzIG9mIG9iamVjdHMgaW4gYSBzaW5nbGUgcHNldWRvLWRpcmVjdG9yeS5cbi8vIE15UmFOZG9Na2V5ID0+IE0veS9NeVJhTmRvTWtleVxuY29uc3QgaWRUb09iamVjdCA9IChpZCkgPT4gaWQucmVwbGFjZSgvXiguKSguKS8sICckMS8kMi8kMSQyJyk7XG5cbmZ1bmN0aW9uIHNhdmVTMyhzZXJ2aWNlT3B0aW9ucywgYm9keSkge1xuICAgIHZhciBpZCA9IHNob3J0SWQoYm9keSwgc2VydmljZU9wdGlvbnMua2V5TGVuZ3RoKTtcbiAgICBjb25zdCBwYXJhbXMgPSB7XG4gICAgICAgIEJ1Y2tldDogc2VydmljZU9wdGlvbnMuYnVja2V0LFxuICAgICAgICBLZXk6IGlkVG9PYmplY3QoaWQpLFxuICAgICAgICBCb2R5OiBib2R5XG4gICAgfTtcblxuICAgIHJldHVybiBTMyhzZXJ2aWNlT3B0aW9ucykucHV0T2JqZWN0KHBhcmFtcykucHJvbWlzZSgpXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlc3VsdCkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ1NhdmVkIGtleSAnICsgaWQgKyAnIHRvIFMzIGJ1Y2tldCAnICsgcGFyYW1zLkJ1Y2tldCArICc6JyArIHBhcmFtcy5LZXkgKyAnLiBFdGFnOiAnICsgcmVzdWx0LkVUYWcpO1xuICAgICAgICAgICAgcmV0dXJuIGlkO1xuICAgICAgICB9KS5jYXRjaChmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGUpO1xuICAgICAgICAgICAgcmV0dXJuIGU7XG4gICAgICAgIH0pO1xufVxuXG5mdW5jdGlvbiByZXNvbHZlUzMoc2VydmljZU9wdGlvbnMsIGlkKSB7XG4gICAgY29uc3QgcGFyYW1zID0ge1xuICAgICAgICBCdWNrZXQ6IHNlcnZpY2VPcHRpb25zLmJ1Y2tldCxcbiAgICAgICAgS2V5OiBpZFRvT2JqZWN0KGlkKVxuICAgIH07XG4gICAgcmV0dXJuIFMzKHNlcnZpY2VPcHRpb25zKS5nZXRPYmplY3QocGFyYW1zKS5wcm9taXNlKClcbiAgICAudGhlbihmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIHJldHVybiBkYXRhLkJvZHk7XG4gICAgfSkuY2F0Y2goZnVuY3Rpb24oZSkge1xuICAgICAgICB0aHJvdyB7XG4gICAgICAgICAgICByZXNwb25zZTogZSxcbiAgICAgICAgICAgIGVycm9yOiBlLm1lc3NhZ2VcbiAgICAgICAgfTtcbiAgICB9KTtcbn1cblxuXG4vLyBUZXN0OiBodHRwIGxvY2FsaG9zdDozMDAxL2FwaS92MS9zaGFyZS9xM254UGRcbmZ1bmN0aW9uIHJlc29sdmVHb29nbGVVcmwoc2VydmljZU9wdGlvbnMsIGlkKSB7XG4gICAgdmFyIHNob3J0VXJsID0gJ2h0dHA6Ly9nb28uZ2wvJyArIGlkO1xuICAgIGNvbnNvbGUubG9nKHNob3J0VXJsKTtcbiAgICByZXR1cm4gcmVxdWVzdHAoe1xuICAgICAgICB1cmw6IGdvb2dsZVVybFNob3J0ZW5lckFQSSArICcvdXJsP2tleT0nICsgc2VydmljZU9wdGlvbnMuYXBpa2V5ICsgJyZzaG9ydFVybD0nICsgc2hvcnRVcmwsXG4gICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICdVc2VyLUFnZW50Jzogc2VydmljZU9wdGlvbnMudXNlckFnZW50IHx8ICdUZXJyaWFKUy1TZXJ2ZXInLFxuICAgICAgICB9LFxuICAgICAgICBqc29uOiB0cnVlLFxuICAgICAgICB0cmFuc2Zvcm06IGZ1bmN0aW9uKGJvZHksIHJlc3BvbnNlKSB7XG4gICAgICAgICAgICBpZiAocmVzcG9uc2Uuc3RhdHVzQ29kZSA+PSAzMDApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzcG9uc2U7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIE91ciBHb29nbGUgVVJMcyBsb29rIGxpa2UgXCJodHRwOi8vbmF0aW9uYWxtYXAuZ292LmF1LyNzaGFyZT0lN0IuLi4lN0RcIiBidXQgdGhlcmUgbWlnaHQgYmUgb3RoZXIgVVJMIHBhcmFtZXRlcnMgYmVmb3JlIG9yIGFmdGVyXG4gICAgICAgICAgICAgICAgLy8gV2UganVzdCB3YW50IHRoZSBlbmNvZGVkIEpTT04gKCU3Qi4uJTdEKSwgbm90IHRoZSB3aG9sZSBVUkwuXG4gICAgICAgICAgICAgICAgcmV0dXJuIGRlY29kZVVSSUNvbXBvbmVudChib2R5LmxvbmdVcmwubWF0Y2goLyglN0IuKiU3RCkoJi4qKSQvKVsxXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9KTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihzaGFyZVVybFByZWZpeGVzLCBuZXdTaGFyZVVybFByZWZpeCwgaG9zdE5hbWUsIHBvcnQpIHtcbiAgICBpZiAoIXNoYXJlVXJsUHJlZml4ZXMpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHZhciByb3V0ZXIgPSByZXF1aXJlKCdleHByZXNzJykuUm91dGVyKCk7XG4gICAgcm91dGVyLnVzZShib2R5UGFyc2VyLnRleHQoe3R5cGU6ICcqLyonfSkpO1xuXG4gICAgLy8gUmVxdWVzdGVkIGNyZWF0aW9uIG9mIGEgbmV3IHNob3J0IFVSTC5cbiAgICByb3V0ZXIucG9zdCgnLycsIGZ1bmN0aW9uKHJlcSwgcmVzLCBuZXh0KSB7XG4gICAgICAgIGlmIChuZXdTaGFyZVVybFByZWZpeCA9PT0gdW5kZWZpbmVkIHx8ICFzaGFyZVVybFByZWZpeGVzW25ld1NoYXJlVXJsUHJlZml4XSkge1xuICAgICAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNDA0KS5qc29uKHsgbWVzc2FnZTogXCJUaGlzIHNlcnZlciBoYXMgbm90IGJlZW4gY29uZmlndXJlZCB0byBnZW5lcmF0ZSBuZXcgc2hhcmUgVVJMcy5cIiB9KTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgc2VydmljZU9wdGlvbnMgPSBzaGFyZVVybFByZWZpeGVzW25ld1NoYXJlVXJsUHJlZml4XTtcbiAgICAgICAgdmFyIG1pbnRlciA9IHtcbiAgICAgICAgICAgICdnaXN0JzogbWFrZUdpc3QsXG4gICAgICAgICAgICAnczMnOiBzYXZlUzNcbiAgICAgICAgICAgIH1bc2VydmljZU9wdGlvbnMuc2VydmljZS50b0xvd2VyQ2FzZSgpXTtcblxuICAgICAgICBtaW50ZXIoc2VydmljZU9wdGlvbnMsIHJlcS5ib2R5KS50aGVuKGZ1bmN0aW9uKGlkKSB7XG4gICAgICAgICAgICBpZCA9IG5ld1NoYXJlVXJsUHJlZml4ICsgcHJlZml4U2VwYXJhdG9yICsgaWQ7XG4gICAgICAgICAgICB2YXIgcmVzUGF0aCA9IHJlcS5iYXNlVXJsICsgJy8nICsgaWQ7XG4gICAgICAgICAgICAvLyB0aGVzZSBwcm9wZXJ0aWVzIHdvbid0IGJlaGF2ZSBjb3JyZWN0bHkgdW5sZXNzIFwidHJ1c3RQcm94eTogdHJ1ZVwiIGlzIHNldCBpbiB1c2VyJ3Mgb3B0aW9ucyBmaWxlLlxuICAgICAgICAgICAgLy8gdGhleSBtYXkgbm90IGJlaGF2ZSBjb3JyZWN0bHkgKGVzcGVjaWFsbHkgcG9ydCkgd2hlbiBiZWhpbmQgbXVsdGlwbGUgbGV2ZWxzIG9mIHByb3h5XG4gICAgICAgICAgICB2YXIgcmVzVXJsID1cbiAgICAgICAgICAgICAgICByZXEucHJvdG9jb2wgKyAnOi8vJyArXG4gICAgICAgICAgICAgICAgcmVxLmhvc3RuYW1lICtcbiAgICAgICAgICAgICAgICAocmVxLmhlYWRlcignWC1Gb3J3YXJkZWQtUG9ydCcpIHx8IHBvcnQpICtcbiAgICAgICAgICAgICAgICByZXNQYXRoO1xuICAgICAgICAgICAgcmVzIC5sb2NhdGlvbihyZXNVcmwpXG4gICAgICAgICAgICAgICAgLnN0YXR1cygyMDEpXG4gICAgICAgICAgICAgICAgLmpzb24oeyBpZDogaWQsIHBhdGg6IHJlc1BhdGgsIHVybDogcmVzVXJsIH0pO1xuICAgICAgICB9KS5jYXRjaChycGVycm9ycy5UcmFuc2Zvcm1FcnJvciwgZnVuY3Rpb24gKHJlYXNvbikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihKU09OLnN0cmluZ2lmeShyZWFzb24sIG51bGwsIDIpKTtcbiAgICAgICAgICAgIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgbWVzc2FnZTogcmVhc29uLmNhdXNlLm1lc3NhZ2UgfSk7XG4gICAgICAgIH0pLmNhdGNoKGZ1bmN0aW9uKHJlYXNvbikge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKEpTT04uc3RyaW5naWZ5KHJlYXNvbiwgbnVsbCwgMikpO1xuICAgICAgICAgICAgcmVzLnN0YXR1cyg1MDApIC8vIHByb2JhYmx5IHNhZmVzdCBpZiB3ZSBhbHdheXMgcmV0dXJuIGEgY29uc2lzdGVudCBlcnJvciBjb2RlXG4gICAgICAgICAgICAgICAgLmpzb24oeyBtZXNzYWdlOiByZWFzb24uZXJyb3IgfSk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgLy8gUmVzb2x2ZSBhbiBleGlzdGluZyBJRC4gV2UgYnJlYWsgb2ZmIHRoZSBwcmVmaXggYW5kIHVzZSBpdCB0byB3b3JrIG91dCB3aGljaCByZXNvbHZlciB0byB1c2UuXG4gICAgcm91dGVyLmdldCgnLzppZCcsIGZ1bmN0aW9uKHJlcSwgcmVzLCBuZXh0KSB7XG4gICAgICAgIHZhciBwcmVmaXggPSByZXEucGFyYW1zLmlkLm1hdGNoKHNwbGl0UHJlZml4UmUpWzJdIHx8ICcnO1xuICAgICAgICB2YXIgaWQgPSByZXEucGFyYW1zLmlkLm1hdGNoKHNwbGl0UHJlZml4UmUpWzNdO1xuICAgICAgICB2YXIgcmVzb2x2ZXI7XG5cbiAgICAgICAgdmFyIHNlcnZpY2VPcHRpb25zID0gc2hhcmVVcmxQcmVmaXhlc1twcmVmaXhdO1xuICAgICAgICBpZiAoIXNlcnZpY2VPcHRpb25zKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdTaGFyZTogVW5rbm93biBwcmVmaXggdG8gcmVzb2x2ZSBcIicgKyBwcmVmaXggKyAnXCIsIGlkIFwiJyArIGlkICsgJ1wiJyk7XG4gICAgICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDApLnNlbmQoJ1Vua25vd24gc2hhcmUgcHJlZml4IFwiJyArIHByZWZpeCArICdcIicpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmVzb2x2ZXIgPSB7XG4gICAgICAgICAgICAgICAgJ2dpc3QnOiByZXNvbHZlR2lzdCxcbiAgICAgICAgICAgICAgICAnZ29vZ2xldXJsc2hvcnRlbmVyJzogcmVzb2x2ZUdvb2dsZVVybCxcbiAgICAgICAgICAgICAgICAnczMnOiByZXNvbHZlUzNcbiAgICAgICAgICAgIH1bc2VydmljZU9wdGlvbnMuc2VydmljZS50b0xvd2VyQ2FzZSgpXTtcbiAgICAgICAgfVxuICAgICAgICByZXNvbHZlcihzZXJ2aWNlT3B0aW9ucywgaWQpLnRoZW4oZnVuY3Rpb24oY29udGVudCkge1xuICAgICAgICAgICAgcmVzLnNlbmQoY29udGVudCk7XG4gICAgICAgIH0pLmNhdGNoKHJwZXJyb3JzLlRyYW5zZm9ybUVycm9yLCBmdW5jdGlvbiAocmVhc29uKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKEpTT04uc3RyaW5naWZ5KHJlYXNvbiwgbnVsbCwgMikpO1xuICAgICAgICAgICAgcmVzLnN0YXR1cyg1MDApLnNlbmQocmVhc29uLmNhdXNlLm1lc3NhZ2UpO1xuICAgICAgICB9KS5jYXRjaChmdW5jdGlvbihyZWFzb24pIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihKU09OLnN0cmluZ2lmeShyZWFzb24ucmVzcG9uc2UsIG51bGwsIDIpKTtcbiAgICAgICAgICAgIHJlcy5zdGF0dXMoNDA0KSAvLyBwcm9iYWJseSBzYWZlc3QgaWYgd2UgYWx3YXlzIHJldHVybiA0MDQgcmF0aGVyIHRoYW4gd2hhdGV2ZXIgdGhlIHVwc3RyZWFtIHByb3ZpZGVyIHNldHMuXG4gICAgICAgICAgICAgICAgLnNlbmQocmVhc29uLmVycm9yKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIHJvdXRlcjtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbmNsYXNzIGRhdGFiYXNlIHtcblxuXHRwdWJsaWMgdHlwZTogc3RyaW5nO1xuXHRwdWJsaWMgaG9zdDogc3RyaW5nO1xuXHRwcml2YXRlIHVzZXJuYW1lOiBzdHJpbmc7XG5cdHByaXZhdGUgcGFzc3dvcmQ6IHN0cmluZztcblx0cHVibGljIGNvbm5lY3Rpb246IGFueTtcblxuXHRjb25zdHJ1Y3Rvcih0eXBlOiBzdHJpbmcsIGhvc3Q6IHN0cmluZywgdXNlcm5hbWU6IHN0cmluZywgcGFzc3dvcmQ6IHN0cmluZywgY29ubmVjdGlvbjogYW55KSB7XG5cdFx0dGhpcy50eXBlID0gdHlwZTtcblx0XHR0aGlzLmhvc3QgPSBob3N0O1xuXHRcdHRoaXMudXNlcm5hbWUgPSB1c2VybmFtZTtcblx0XHR0aGlzLnBhc3N3b3JkID0gcGFzc3dvcmQ7XG5cdFx0dGhpcy5jb25uZWN0aW9uID0gY29ubmVjdGlvbjtcblx0fVxuXG5cdGdldFN0YXR1cygpOiBib29sZWFuIHtcblx0XHRyZXR1cm4gdGhpcy5jb25uZWN0aW9uLnN0YXRlO1xuXHR9XG5cbn1cblxuZXhwb3J0ID0gZGF0YWJhc2U7IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgbXlzcWwgPSByZXF1aXJlKCdteXNxbCcpO1xudmFyIGNvbmZpZyA9IHJlcXVpcmUoJy4uLy4uLy4uL2RiY29uZmlnLmpzb24nKTtcblxudmFyIGNvbiA9IG15c3FsLmNyZWF0ZUNvbm5lY3Rpb24oe1xuXHRob3N0OiBjb25maWcuZGF0YWJhc2UuaG9zdCxcblx0dXNlcjogY29uZmlnLmRhdGFiYXNlLnVzZXJuYW1lLFxuXHRwYXNzd29yZDogY29uZmlnLmRhdGFiYXNlLnBhc3N3b3JkXG59KTtcblxuY29uLmNvbm5lY3QoZnVuY3Rpb24oZXJyKSB7XG5cdGlmIChlcnIpIHRocm93IGVycjtcblx0Y29uc29sZS5sb2coXCJEYXRhYmFzZSBlc3RhYmxpc2hlZC5cIik7XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBjb247IiwibW9kdWxlLmV4cG9ydHMuZXJyb3I0MDQgPSBmdW5jdGlvbihzaG93NDA0LCB3d3dyb290LCBzZXJ2ZVd3d1Jvb3QpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKHJlcSwgcmVzLCBuZXh0KSB7XG4gICAgICAgIGlmIChzaG93NDA0KSB7XG4gICAgICAgICAgICByZXMuc3RhdHVzKDQwNCkuc2VuZEZpbGUod3d3cm9vdCArICcvNDA0Lmh0bWwnKTtcbiAgICAgICAgfSBlbHNlIGlmIChzZXJ2ZVd3d1Jvb3QpIHtcbiAgICAgICAgICAgIC8vIFJlZGlyZWN0IHVua25vd24gcGFnZXMgYmFjayBob21lLlxuICAgICAgICAgICAgcmVzLnJlZGlyZWN0KDMwMywgJy8nKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJlcy5zdGF0dXMoNDA0KS5zZW5kKCdObyBUZXJyaWFKUyB3ZWJzaXRlIGhlcmUuJyk7XG4gICAgICAgIH1cbiAgICB9O1xufTtcblxubW9kdWxlLmV4cG9ydHMuZXJyb3I1MDAgPSBmdW5jdGlvbihzaG93NTAwLCB3d3dyb290KSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKGVycm9yLCByZXEsIHJlcywgbmV4dCkge1xuICAgICAgICBjb25zb2xlLmVycm9yKGVycm9yKTtcbiAgICAgICAgaWYgKHNob3c1MDApIHtcbiAgICAgICAgICAgIHJlcy5zdGF0dXMoNTAwKS5zZW5kRmlsZSh3d3dyb290ICsgJy81MDAuaHRtbCcpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmVzLnN0YXR1cyg1MDApLnNlbmQoJzUwMDogSW50ZXJuYWwgU2VydmVyIEVycm9yJyk7XG4gICAgICAgIH1cbiAgICB9O1xufTtcbiIsInZhciBmcyA9IHJlcXVpcmUoJ2ZzJyk7XG5cbmV4cG9ydCA9IGZ1bmN0aW9uIGV4aXN0cyhwYXRoTmFtZSkge1xuICAgIHRyeSB7XG4gICAgICAgIGZzLnN0YXRTeW5jKHBhdGhOYW1lKTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxufTsiLCJ2YXIgZXhpc3RzID0gcmVxdWlyZSgnLi9leGlzdHMnKTtcbnZhciBmcyA9IHJlcXVpcmUoJ2ZzJyk7XG52YXIganNvbjUgPSByZXF1aXJlKCdqc29uNScpO1xudmFyIHBhdGggPSByZXF1aXJlKCdwYXRoJyk7XG5cbmNsYXNzIG9wdGlvbnMge1xuXG4gICAgcHVibGljIGxpc3Rlbkhvc3Q6IHN0cmluZztcbiAgICBwdWJsaWMgY29uZmlnRmlsZTogc3RyaW5nO1xuICAgIHB1YmxpYyBzZXR0aW5nczogYW55O1xuICAgIHB1YmxpYyBwcm94eUF1dGhGaWxlOiBzdHJpbmc7XG4gICAgcHVibGljIHByb3h5QXV0aDogc3RyaW5nO1xuICAgIHB1YmxpYyBwb3J0OiBudW1iZXI7XG4gICAgcHVibGljIHd3d3Jvb3Q6IHN0cmluZztcbiAgICBwdWJsaWMgY29uZmlnRGlyOiBzdHJpbmc7XG4gICAgcHVibGljIHZlcmJvc2U6IGFueTtcbiAgICBwdWJsaWMgaG9zdE5hbWU6IHN0cmluZztcblxuICAgIGdldEZpbGVQYXRoKGZpbGVOYW1lLCB3YXJuKSB7XG4gICAgICAgIGlmIChleGlzdHMoZmlsZU5hbWUpKSB7XG4gICAgICAgICAgICByZXR1cm4gZmlsZU5hbWU7XG4gICAgICAgIH0gZWxzZSBpZiAod2Fybikge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKFwiV2FybmluZzogQ2FuXFwndCBvcGVuICdcIiArIGZpbGVOYW1lICsgXCInLlwiKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGdldENvbmZpZ0ZpbGUoYXJnRmlsZU5hbWUsIGRlZmF1bHRGaWxlTmFtZSk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiBhcmdGaWxlTmFtZSA/ICB0aGlzLmdldEZpbGVQYXRoKGFyZ0ZpbGVOYW1lLCB0cnVlKSA6IHRoaXMuZ2V0RmlsZVBhdGgoZGVmYXVsdEZpbGVOYW1lLCB0cnVlKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXRzIGEgY29uZmlnIGZpbGUgdXNpbmcgcmVxdWlyZSwgbG9nZ2luZyBhIHdhcm5pbmcgYW5kIGRlZmF1bHRpbmcgdG8gYSBiYWNrdXAgdmFsdWUgaW4gdGhlIGV2ZW50IG9mIGEgZmFpbHVyZS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBmaWxlUGF0aCBUaGUgcGF0aCB0byBsb29rIGZvciB0aGUgY29uZmlnIGZpbGUuXG4gICAgICogQHBhcmFtIGNvbmZpZ0ZpbGVUeXBlIFdoYXQga2luZCBvZiBjb25maWcgZmlsZSBpcyB0aGlzPyBFLmcuIGNvbmZpZywgYXV0aCBldGMuXG4gICAgICogQHBhcmFtIGZhaWx1cmVDb25zZXF1ZW5jZSBUaGUgY29uc2VxdWVuY2Ugb2YgdXNpbmcgdGhlIGRlZmF1bHRWYWx1ZSB3aGVuIHRoaXMgZmlsZSBmYWlscyB0byBsb2FkIC0gdGhpcyB3aWxsIGJlIGxvZ2dlZFxuICAgICAqICAgICAgICBhcyBwYXJ0IG9mIHRoZSB3YXJuaW5nXG4gICAgICogQHJldHVybnMgeyp9IFRoZSBjb25maWcsIGVpdGhlciBmcm9tIHRoZSBmaWxlUGF0aCBvciBhIGRlZmF1bHQuXG4gICAgICovXG4gICAgZ2V0Q29uZmlnKGZpbGVQYXRoLCBjb25maWdGaWxlVHlwZSwgZmFpbHVyZUNvbnNlcXVlbmNlLCBxdWlldCk6IGFueSB7XG4gICAgICAgIHZhciBjb25maWc7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHZhciBmaWxlQ29udGVudHMgPSBmcy5yZWFkRmlsZVN5bmMoZmlsZVBhdGgsICd1dGY4Jyk7XG4gICAgICAgICAgICAvLyBTdHJpcCBjb21tZW50cyBmb3JtYXR0ZWQgYXMgbGluZXMgc3RhcnRpbmcgd2l0aCBhICMsIGJlZm9yZSBwYXJzaW5nIGFzIEpTT041LiAjLWluaXRpYWwgY29tbWVudHMgYXJlIGRlcHJlY2F0ZWQsIHdpbGwgYmUgcmVtb3ZlZCBpbiB2ZXJzaW9uIDMuXG4gICAgICAgICAgICBjb25maWcgPSBqc29uNS5wYXJzZShmaWxlQ29udGVudHMucmVwbGFjZSgvXlxccyojLiokL21nLCcnKSk7XG4gICAgICAgICAgICBpZiAoIXF1aWV0KSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1VzaW5nICcgKyBjb25maWdGaWxlVHlwZSArICcgZmlsZSBcIicgKyBmcy5yZWFscGF0aFN5bmMoZmlsZVBhdGgpICsgJ1wiLicpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBpZiAoIXF1aWV0KSB7XG4gICAgICAgICAgICAgICAgdmFyIGxvZ2dlZEZpbGVQYXRoID0gZmlsZVBhdGggPyAnIFwiJyArIGZpbGVQYXRoICsgJ1wiJyA6ICcnO1xuICAgICAgICAgICAgICAgIGlmICghKGxvZ2dlZEZpbGVQYXRoID09PSAnJyAmJiBjb25maWdGaWxlVHlwZSA9PT0gJ3Byb3h5QXV0aCcpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignV2FybmluZzogQ2FuXFwndCBvcGVuICcgKyBjb25maWdGaWxlVHlwZSArICcgZmlsZScgKyBsb2dnZWRGaWxlUGF0aCArICcuICcgKyBmYWlsdXJlQ29uc2VxdWVuY2UgKyAnLlxcbicpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbmZpZyA9IHt9O1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGNvbmZpZzsgICAgICAgIFxuICAgIH1cblxuICAgIGxvYWRDb21tYW5kTGluZSgpIHtcbiAgICAgICAgdmFyIHlhcmdzID0gcmVxdWlyZSgneWFyZ3MnKVxuICAgICAgICAgICAgLnVzYWdlKCckMCBbb3B0aW9uc10gW3BhdGgvdG8vd3d3cm9vdF0nKVxuICAgICAgICAgICAgLnN0cmljdCgpXG4gICAgICAgICAgICAub3B0aW9ucyh7XG4gICAgICAgICAgICAncG9ydCcgOiB7XG4gICAgICAgICAgICAgICAgJ2Rlc2NyaXB0aW9uJyA6ICdQb3J0IHRvIGxpc3RlbiBvbi4gICAgICAgICAgICAgICAgW2RlZmF1bHQ6IDMwMDFdJyxcbiAgICAgICAgICAgICAgICBudW1iZXI6IHRydWUsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgJ3B1YmxpYycgOiB7XG4gICAgICAgICAgICAgICAgJ3R5cGUnIDogJ2Jvb2xlYW4nLFxuICAgICAgICAgICAgICAgICdkZWZhdWx0JyA6IHRydWUsXG4gICAgICAgICAgICAgICAgJ2Rlc2NyaXB0aW9uJyA6ICdSdW4gYSBwdWJsaWMgc2VydmVyIHRoYXQgbGlzdGVucyBvbiBhbGwgaW50ZXJmYWNlcy4nXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgJ2NvbmZpZy1maWxlJyA6IHtcbiAgICAgICAgICAgICAgICAnZGVzY3JpcHRpb24nIDogJ0ZpbGUgY29udGFpbmluZyBzZXR0aW5ncyBzdWNoIGFzIGFsbG93ZWQgZG9tYWlucyB0byBwcm94eS4gU2VlIHNlcnZlcmNvbmZpZy5qc29uLmV4YW1wbGUnXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgJ3Byb3h5LWF1dGgnIDoge1xuICAgICAgICAgICAgICAgICdkZXNjcmlwdGlvbicgOiAnRmlsZSBjb250YWluaW5nIGF1dGggaW5mb3JtYXRpb24gZm9yIHByb3hpZWQgZG9tYWlucy4gU2VlIHByb3h5YXV0aC5qc29uLmV4YW1wbGUnXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgJ3ZlcmJvc2UnOiB7XG4gICAgICAgICAgICAgICAgJ2Rlc2NyaXB0aW9uJzogJ1Byb2R1Y2UgbW9yZSBvdXRwdXQgYW5kIGxvZ2dpbmcuJyxcbiAgICAgICAgICAgICAgICAndHlwZSc6ICdib29sZWFuJyxcbiAgICAgICAgICAgICAgICAnZGVmYXVsdCc6IGZhbHNlXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgJ2hlbHAnIDoge1xuICAgICAgICAgICAgICAgICdhbGlhcycgOiAnaCcsXG4gICAgICAgICAgICAgICAgJ3R5cGUnIDogJ2Jvb2xlYW4nLFxuICAgICAgICAgICAgICAgICdkZXNjcmlwdGlvbicgOiAnU2hvdyB0aGlzIGhlbHAuJ1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICBpZiAoeWFyZ3MuYXJndi5oZWxwKSB7XG4gICAgICAgICAgICB5YXJncy5zaG93SGVscCgpO1xuICAgICAgICAgICAgcHJvY2Vzcy5leGl0KCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBZYXJncyB1bmhlbHBmdWxseSB0dXJucyBcIi0tb3B0aW9uIGZvbyAtLW9wdGlvbiBiYXJcIiBpbnRvIHsgb3B0aW9uOiBbXCJmb29cIiwgXCJiYXJcIl0gfS5cbiAgICAgICAgLy8gSGVuY2UgcmVwbGFjZSBhcnJheXMgd2l0aCB0aGUgcmlnaHRtb3N0IHZhbHVlLiBUaGlzIG1hdHRlcnMgd2hlbiBgbnBtIHJ1bmAgaGFzIG9wdGlvbnNcbiAgICAgICAgLy8gYnVpbHQgaW50byBpdCwgYW5kIHRoZSB1c2VyIHdhbnRzIHRvIG92ZXJyaWRlIHRoZW0gd2l0aCBgbnBtIHJ1biAtLSAtLXBvcnQgMzAwNWAgb3Igc29tZXRoaW5nLlxuICAgICAgICAvLyBZYXJncyBhbHNvIHNlZW1zIHRvIGhhdmUgc2V0dGVycywgaGVuY2Ugd2h5IHdlIGhhdmUgdG8gbWFrZSBhIHNoYWxsb3cgY29weS5cbiAgICAgICAgdmFyIGFyZ3YgPSBPYmplY3QuYXNzaWduKHt9LCB5YXJncy5hcmd2KTtcbiAgICAgICAgT2JqZWN0LmtleXMoYXJndikuZm9yRWFjaChmdW5jdGlvbihrKSB7XG4gICAgICAgICAgICBpZiAoayAhPT0gJ18nICYmIEFycmF5LmlzQXJyYXkoYXJndltrXSkpIHtcbiAgICAgICAgICAgICAgICBhcmd2W2tdID0gYXJndltrXVthcmd2W2tdLmxlbmd0aCAtIDFdO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gYXJndjtcbiAgICB9XG5cbiAgICBpbml0KHF1aWV0KSB7XG4gICAgICAgIHZhciBhcmd2ID0gdGhpcy5sb2FkQ29tbWFuZExpbmUoKTtcblxuICAgICAgICB0aGlzLmxpc3Rlbkhvc3QgPSBhcmd2LnB1YmxpYyA/IHVuZGVmaW5lZCA6ICdsb2NhbGhvc3QnO1xuICAgICAgICB0aGlzLmNvbmZpZ0ZpbGUgPSB0aGlzLmdldENvbmZpZ0ZpbGUoYXJndi5jb25maWdGaWxlLCAnc2VydmVyY29uZmlnLmpzb24nKTtcbiAgICAgICAgdGhpcy5zZXR0aW5ncyA9IHRoaXMuZ2V0Q29uZmlnKHRoaXMuY29uZmlnRmlsZSwgJ2NvbmZpZycsICdBTEwgcHJveHkgcmVxdWVzdHMgd2lsbCBiZSBhY2NlcHRlZC4nLCBxdWlldCk7XG4gICAgICAgIHRoaXMucHJveHlBdXRoRmlsZSA9IHRoaXMuZ2V0Q29uZmlnRmlsZShhcmd2LnByb3h5QXV0aCwgJ3Byb3h5YXV0aC5qc29uJyk7XG4gICAgICAgIHRoaXMucHJveHlBdXRoID0gdGhpcy5nZXRDb25maWcodGhpcy5wcm94eUF1dGhGaWxlLCAncHJveHlBdXRoJywgJ1Byb3h5aW5nIHRvIHNlcnZlcnMgdGhhdCByZXF1aXJlIGF1dGhlbnRpY2F0aW9uIHdpbGwgZmFpbCcsIHF1aWV0KTtcbiAgICAgICAgXG4gICAgICAgIGlmICghdGhpcy5wcm94eUF1dGggfHwgT2JqZWN0LmtleXModGhpcy5wcm94eUF1dGgpLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgdGhpcy5wcm94eUF1dGggPSB0aGlzLnNldHRpbmdzLnByb3h5QXV0aCB8fCB7fTtcbiAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICB0aGlzLnBvcnQgPSBhcmd2LnBvcnQgfHwgdGhpcy5zZXR0aW5ncy5wb3J0IHx8IDMwMDE7XG4gICAgICAgIHRoaXMud3d3cm9vdCA9IGFyZ3YuXy5sZW5ndGggPiAwID8gYXJndi5fWzBdIDogcHJvY2Vzcy5jd2QoKSArICcvd3d3cm9vdCc7XG4gICAgICAgIHRoaXMuY29uZmlnRGlyID0gYXJndi5jb25maWdGaWxlID8gcGF0aC5kaXJuYW1lIChhcmd2LmNvbmZpZ0ZpbGUpIDogJy4nO1xuICAgICAgICB0aGlzLnZlcmJvc2UgPSBhcmd2LnZlcmJvc2U7XG4gICAgICAgIHRoaXMuaG9zdE5hbWUgPSB0aGlzLmxpc3Rlbkhvc3QgfHwgdGhpcy5zZXR0aW5ncy5ob3N0TmFtZSB8fCAnbG9jYWxob3N0JztcbiAgICAgICAgdGhpcy5zZXR0aW5ncy5wcm94eUFsbERvbWFpbnMgPSB0aGlzLnNldHRpbmdzLnByb3h5QWxsRG9tYWlucyB8fCB0eXBlb2YgdGhpcy5zZXR0aW5ncy5hbGxvd1Byb3h5Rm9yID09PSAndW5kZWZpbmVkJztcbiAgICAgICAgXG4gICAgICAgIHJldHVybiBvcHRpb25zO1xuICAgIH1cblxufVxuXG5leHBvcnQgPSBvcHRpb25zOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcImF3cy1zZGtcIik7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiYmFzZS14XCIpOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcImJhc2ljLWF1dGhcIik7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiYm9keS1wYXJzZXJcIik7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiY2x1c3RlclwiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJjb21wcmVzc2lvblwiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJjb3JzXCIpOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcImNyeXB0b1wiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJleHByZXNzXCIpOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcImV4cHJlc3MtYnJ1dGVcIik7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiZm9ybWlkYWJsZVwiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJmc1wiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJodHRwc1wiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJqc29uNVwiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJtb3JnYW5cIik7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwibXlzcWxcIik7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwibmV0XCIpOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcIm9zXCIpOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcInBhdGhcIik7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwicHJvajRcIik7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwicHJvajRqcy1kZWZzL2Vwc2dcIik7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwicmFuZ2VfY2hlY2tcIik7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwicmVxdWVzdFwiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJyZXF1ZXN0LXByb21pc2VcIik7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwicmVxdWVzdC1wcm9taXNlL2Vycm9yc1wiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJ0ZXJyaWFqcy1vZ3Iyb2dyXCIpOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcInVybFwiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJ3aGVuXCIpOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcInlhcmdzXCIpOyJdLCJzb3VyY2VSb290IjoiIn0=