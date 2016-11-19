var WebSocketServer = require('ws').Server;
var wss = new WebSocketServer({ port: 1337 });

wss.on('connection', function connection(ws) {
  ws.on('message', function incoming(message) {
    console.log('received: %s', message);
  });

  ws.send('I SEE YA!');
});

wss.broadcast = function broadcast(data) {
  wss.clients.forEach(function each(client) {
    client.send(data);
  });
};

function bin2String(array) {
  var result = [];
  for (var i = 0; i < array.length; i++) {
    result.push(parseInt(array[i], 2));
  }
  return result;
}

var PORT = 33333;
var HOST = '0.0.0.0';

var dgram = require('dgram');
var server = dgram.createSocket('udp4');

server.on('listening', function () {
    var address = server.address();
    console.log('UDP Server listening on ' + address.address + ":" + address.port);
});

server.on('message', function (message, remote) {
    console.log(bin2String(message))
    //console.log(remote.address + ':' + remote.port +' - ' + bin2String(message));
    wss.broadcast(message);
});

server.bind(PORT, HOST);
