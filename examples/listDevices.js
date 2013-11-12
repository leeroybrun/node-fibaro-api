var Fibaro = require('../lib/fibaro');

var fibaro = new Fibaro('xxx.xxx.xxx.xxx', 'username', 'password');

fibaro.api.devices.list(function(err, data) {
	console.log(data);
});