global.api = {};
api.fs = require('fs');
api.http = require('http');
api.websocket = require('websocket');

var index = api.fs.readFileSync('./index.html');

var server = api.http.createServer(function(req, res) {
  res.writeHead(200);
  res.end(index);
});

server.listen(80, function() {
  console.log('Listen port 80');
});

var ws = new api.websocket.server({
  httpServer: server,
  autoAcceptConnections: false
});

var clients = [];

ws.on('request', function(req) {
  var connection = req.accept('', req.origin);
  clients.push(connection);
  console.log('Connected ' + connection.remoteAddress);
  sendSmileImgs(connection);
  connection.on('message', function(message) {
    var dataName = message.type + 'Data',
        data = message[dataName];
    console.log('Received: ' + data);
    var response = JSON.stringify({id:'text', msg:data});
    clients.forEach(function(client) {
      if (connection !== client) {
        client.send(response);
      }
    });
  });
  connection.on('close', function(reasonCode, description) {
    console.log('Disconnected ' + connection.remoteAddress);
  });
});

var sendSmileImgs = function(connection){
  var smiles = api.fs.readdirSync("./smiles");
  console.log(smiles);
  smiles.forEach(function(fileName){
    var smile = 
    {
      id:fileName.split(/\./)[0],
      img:api.fs.readFileSync("./smiles/"+fileName,'base64')
    };
    connection.send(JSON.stringify(smile));
  });
}