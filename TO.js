//REQUIRES DE NODE.JS
var zmq = require('zmq'); //Sockets tipo ZMQ
//VARIABLES
var pullSocket = zmq.socket('pull');  //Socket de pull
var pubsocket = zmq.socket('pub'); //Socket de publisher
var colaTO = [];
//=================================CODIGO======================================
pullSocket.bind('tcp://127.0.0.1:9050'); //Bind para pull
console.log(' Conectado pull en el puerto 9050');
//_____________________________________________________________________________
pubsocket.bind('tcp://127.0.0.1:9051', function(err){ //Bind para publicar
	if(err) console.log(err);
	else console.log(' ARH escuchando en el puerto 9051 como publisher');
});
//===============================FUNCIONES=====================================
//Listener para el mensaje de DSS
pullSocket.on('message', function(sendTO,err){
	if( err ) {
		throw err;
		 console.log(err);
	}
	var sendTOJSON = JSON.parse(sendTO);
	console.log(' \nRecibido: '+sendTO);
	colaTO.push(sendTOJSON); //Encolamos el objeto
	var i = 0;
	while(colaTO[i] != null){ //Mientras la cola no este vacia
		var sReq = JSON.stringify(colaTO[i]);
		console.log('colaTO['+i+']: ' + sReq);
		pubsocket.send(''+sReq); //Enviamos el objeto de la primera posicion
		colaTO.shift(); //Eliminamos de la cola ese objeto
	}
});