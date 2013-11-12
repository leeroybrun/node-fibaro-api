var Fibaro = require('../lib/fibaro');

var fibaro = new Fibaro('xxx.xxx.xxx.xxx', 'username', 'password');

// Toggle devices ON/OFF
fibaro.api.devices.toggleValue(6, function(err, newVal) {
	console.log(err);
	console.log(newVal);
});