var WebSocketServer = require('ws').Server;
var wss = new WebSocketServer({ port: 1337 });
var osc = require('osc-min');

wss.on('connection', function connection(ws) {
  ws.on('message', function incoming(message) {
    console.log('received: %s', message);
  });

  ws.send('I SEE YA!');
});

wss.broadcast = function broadcast(data) {
  console.log(data);
  wss.clients.forEach(function each(client) {
    client.send(data);
  });
};




var PORT = 33333;
var HOST = '0.0.0.0';

var dgram = require('dgram');
var server = dgram.createSocket('udp4');

server.on('listening', function () {
    var address = server.address();
    console.log('UDP Server listening on ' + address.address + ":" + address.port);
});

var counter = 0;
server.on('message', function (message, remote) {
    // console.log(remote.address + ':' + remote.port +' - ' + message);
    var buffer = osc.fromBuffer(message);
    if(buffer.address.indexOf("Note") > -1) {
      counter += 1;
      if(counter % 2) {
        wss.broadcast('' + buffer.args[0].value);
      }
    }

});

server.bind(PORT, HOST);
