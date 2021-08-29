var Fibaro = require('../lib/fibaro');

var fibaro = new Fibaro('xxx.xxx.xxx.xxx', 'username', 'password');

fibaro.api.scenes.start(27, {args: ["Argument value"], pin:""}, function (err, res, body) {
    console.log(err);
    console.log(res);
    console.log(body);
});