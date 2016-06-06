//setup Dependencies
var connect = require('connect')
    , express = require('express')
    , io = require('socket.io')
    , async = require('async')
    , request = require('request')
    , port = (process.env.PORT || 8081);

//Setup Express
var server = express.createServer();
server.configure(function(){
    server.set('views', __dirname + '/views');
    server.set('view options', { layout: false });
    server.use(connect.bodyParser());
    server.use(express.cookieParser());
    server.use(express.session({ secret: "shhhhhhhhh!"}));
    server.use(connect.static(__dirname + '/static'));
    server.use(server.router);
});

//setup the errors
server.error(function(err, req, res, next){
    if (err instanceof NotFound) {
        res.render('404.jade', { locals: { 
                  title : '404 - Not Found'
                 ,description: ''
                 ,author: ''
                 ,analyticssiteid: 'XXXXXXX' 
                },status: 404 });
    } else {
        res.render('500.jade', { locals: { 
                  title : 'The Server Encountered an Error'
                 ,description: ''
                 ,author: ''
                 ,analyticssiteid: 'XXXXXXX'
                 ,error: err 
                },status: 500 });
    }
});
server.listen( port);

//Setup Socket.IO
var io = io.listen(server);
io.sockets.on('connection', function(socket){
  console.log('Client Connected');

  socket.on('message', function(data){
    socket.broadcast.emit('server_message',data);
    socket.emit('server_message',data);
  });

  socket.on('buscar', function(data){

    //socket.broadcast.emit('server_message',data);
    


    var bod = `{
    "tipoEstacion":"EESS",
    "idProvincia":`+data+`,
    "idMunicipio":null,
    "idProducto":1,
    "rotulo":"",
    "eessEconomicas":false,
    "conPlanesDescuento":false,
    "horarioInicial":null,
    "horarioFinal":null,
    "calle":"",
    "numero":"",
    "codPostal":"",
    "tipoVenta":"P",
    "idOperador":null,
    "nombrePlan":"",
    "idTipoDestinatario":null
    }`;

    request({
        url: 'http://geoportalgasolineras.es/rest/busquedaEstaciones', //URL to hit
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: bod //Set the body as a string
    }, function(error, response, body){
        var b = JSON.parse(body);
        if(error) {
            console.log(error);
        } else if (b.errors) {
          console.log("ERROR");
        } else {
            //console.log(response);
            //socket.emit('server_message',body);
            
            var tam = b.estaciones.length;
            var gasolinera;
            for(i=0; i<tam; i++) {
              gasolinera = b.estaciones[i];
              //console.log(gasolinera.estacion.id);
              socket.emit('server_message',[gasolinera.estacion.rotulo, gasolinera.precio]);
            }
        }
    });


  });
  socket.on('disconnect', function(){
    console.log('Client Disconnected.');
  });
});


///////////////////////////////////////////
//              Routes                   //
///////////////////////////////////////////

/////// ADD ALL YOUR ROUTES HERE  /////////

server.get('/', function(req,res){
  res.render('index.jade', {
    locals : { 
              title : 'Your Page Title'
             ,description: 'Your Page Description'
             ,author: 'Your Name'
             ,analyticssiteid: 'XXXXXXX' 
            }
  });
});


//A Route for Creating a 500 Error (Useful to keep around)
server.get('/500', function(req, res){
    throw new Error('This is a 500 Error');
});

//The 404 Route (ALWAYS Keep this as the last route)
server.get('/*', function(req, res){
    throw new NotFound;
});

function NotFound(msg){
    this.name = 'NotFound';
    Error.call(this, msg);
    Error.captureStackTrace(this, arguments.callee);
}


console.log('Listening on http://0.0.0.0:' + port );
