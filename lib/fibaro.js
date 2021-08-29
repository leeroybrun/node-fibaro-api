var request = require('request'),
    async = require('async'),
    util = require('util');

var FibaroClient = module.exports = function(host, user, pass) {
    this.rootUrl = 'http://'+ host +'/api';
    this.username = user;
    this.password = pass;
    this.cookies = request.jar();

    this.setCredentials = function(user, pass) {
        this.username = user;
        this.password = pass;
    }

    this.call = function(action, params, callback, method) {
        // If no params was passed
        if(typeof params == 'function') {
            callback = params;
            params = {};
        }

        if (method === 'POST') {
            var reqOptions = {
                'method': 'POST',
                'uri': this.rootUrl +'/'+ action,
                'auth': {
                    'user': this.username,
                    'pass': this.password,
                    'sendImmediately': false
                },
                headers: {
                    'Content-Type': 'application/json',
                },
                json: params
            };
        } else {
            var reqOptions = {
                'method': 'GET',
                'uri': this.rootUrl +'/'+ action,
                'auth': {
                    'user': this.username,
                    'pass': this.password,
                    'sendImmediately': false
                },
                'jar': this.cookies,
                'qs': params
            };
        }

        var req = request(reqOptions, function(err, res, body) {
            if(err) {
                if('code' in err && err.code == 'ECONNREFUSED') {
                    callback(new Error('Fibaro not running...'));
                } else {
                    callback(err);
                }

            } else if(typeof body == 'object' && 'error' in body) {
                callback(new Error(body.error));

            } else if(res.statusCode != 200 && res.statusCode != 202) {
                if(res.statusCode == 401) {
                    callback(new AuthError('Bad username or password.'));
                } else {
                    callback(new Error('Fibaro API returned status code : '+ res.statusCode));
                }

            } else {
                try {
                    body = JSON.parse(body);
                } catch (e) {}

                callback(null, body);
            }
        });
    }

    // TODO: put shortcuts in a separate file
    var client = this;
    var shortcuts = this.api = {
        // ---------------------------------------------------------------
        // Rooms
        // ---------------------------------------------------------------
        rooms: {
            list: function(callback) {
                client.call('rooms', callback);
            }
        },

        // ---------------------------------------------------------------
        // Scenes
        // ---------------------------------------------------------------
        scenes: {
            list: function(callback) {
                client.call('scenes', callback);
            },
            start: function (id, params, callback) {
                client.call('scenes/' + id + '/action/start', params, callback, 'POST');
            },
            stop: function (id, params, callback) {
                client.call('scenes/' + id + '/action/stop', params, callback, 'POST');
            }
        },

        // ---------------------------------------------------------------
        // Devices
        // ---------------------------------------------------------------
        devices: {
            list: function(callback) {
                client.call('devices', callback);
            },
            get: function(id, callback) {
                client.call('devices', { 'id': id }, callback);
            },
            turnOn: function(id, callback) {
                client.call('callAction', { 'deviceID': id, 'name': 'turnOn' }, callback);
            },
            turnOff: function(id, callback) {
                client.call('callAction', { 'deviceID': id, 'name': 'turnOff' }, callback);
            },
            toggleValue: function(id, callback) {
                var self = this;
                var newVal = null;

                async.waterfall([
                    function getDeviceStatus(cb) {
                        self.get(id, cb);
                    },

                    function setDeviceStatus(device, cb) {
                        if(device.properties.value == 0) {
                            newVal = 1;
                            self.turnOn(id, cb);
                        } else {
                            newVal = 0;
                            self.turnOff(id, cb);
                        }
                    }
                ], function(err) {
                    callback(err, newVal);
                });
            }
        }
    };
}

FibaroClient.discover = function (callback, timeout) {

    var re = /^ACK (HC2-[0-9]+) ([0-9a-f:]+)$/;

    var server = require('dgram').createSocket("udp4");

    server.on('message', function (packet, rinfo) {

        var matches = re.exec(packet.toString());

        if (matches) {
            callback({
                ip: rinfo.address,
                serial: matches[1],
                mac: matches[2]
            });
        }
    });

    server.bind(44444, function () {
        var message = new Buffer("FIBARO");
        server.setBroadcast(true);
        server.send(message, 0, message.length, 44444, "255.255.255.255");
    });

    setTimeout(function () {
        server.close();
    }, timeout || 5000);
};

/* Custom error objects */
var AbstractError = function (msg, constr) {
    Error.captureStackTrace(this, constr || this)
    this.message = msg || 'Error'
}
util.inherits(AbstractError, Error);
AbstractError.prototype.name = 'Abstract Error';

var AuthError = function (msg) {
    AuthError.super_.call(this, msg, this.constructor)
}
util.inherits(AuthError, AbstractError)
AuthError.prototype.message = 'Authentification Error'
