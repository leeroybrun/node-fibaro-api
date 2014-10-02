var Fibaro = require('../lib/fibaro');

Fibaro.discover(function(info) {

    console.log('Discovered device', info.serial, 'at', info.ip);

    var fibaro = new Fibaro(info.ip, 'username', 'password');

    fibaro.api.devices.list(function(err, data) {
    	console.log(data);
    });
});