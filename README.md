node-fibaro-api
===========

Interact with Fibaro Home Center API

## How it works

Instantiate a new client :
```javascript
var Fibaro = require('fibaro-api');
var fibaro = new Fibaro('xxx.xxx.xxx.xxx', 'username', 'password');
```

Make your calls :

```javascript
fibaro.call(action, params, callback);
```

### Shortcuts

There is some shortcuts too :

#### fibaro.api.devices.list(callback)
#### fibaro.api.devices.get(deviceId, callback)
#### fibaro.api.devices.turnOn(deviceId, callback)
#### fibaro.api.devices.turnOff(deviceId, callback)
#### fibaro.api.devices.toggleValue(deviceId, callback)

I will add shortcuts as needed, don't hesitate to add yours and send me a pull request. :-)