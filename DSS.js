//REQUIRES DE NODE.JS
var events = require('events');			//Eventos
var zmq = require('zmq');			//Sockets tipo ZMQ
var underScore = require('underscore');		//Underscore
//VARIABLES
var pushSocket = zmq.socket('push');		//Socket de pull
var subSocket = zmq.socket('sub');		//Socket de pull
var emision = new events.EventEmitter();	//Variable para emision de evento propio 
var sequenced = [];				//Array de secuenciados
var localSeq = 1;				//Secuencia local
var deliverTOJSON, reqJSON;			//JSON
var primero=false;				//Variable 
//=================================CODIGO======================================
pushSocket.connect('tcp://127.0.0.1:9050');	//conectarlo al pull
console.log(' Conectado al pull 9050');
subSocket.connect('tcp://127.0.0.1:9051');	//conectarlo al pub
subSocket.subscribe('');			//Subscibirse a la "cadena vacia"
console.log(' Conectado al pub 9051')
//===============================FUNCIONES=====================================
//FUNCION GETSEQ(req)
exports.GetSeq = function(req,callback){
	reqJSON = JSON.parse(req);
	if( sequenced.indexOf(reqJSON)==-1 ){	//Si no existe el objeto en el array
		pushSocket.send(req);		//Mandamos a TO el request
	}
	else{
	//Si existe guardamos en la variable su posicion
		var posicion = sequenced.indexOf(reqJSON);
		return posicion;		//Retornamos la posicion
	}
	if(!primero){				//Si primero es false
		//Lo asignamos a true para que solo entre el primer emit cada vez
		primero = true
		//Evento dssmsg con parametro msgposicion
		emision.on('dssmsg', function(msgposicion){
			//callback de la posicion
			callback(msgposicion);
			return msgposicion;
		});
	}
}
//FUNCION GETREQ(j)
exports.GetReq = function (j){
	sGetReq = JSON.stringify(sequenced[j]);	//Obtenemos el objeto de la posicion
	return sGetReq;				//Lo retornamos
}
//===============================LISTENERS=====================================
//Listener para los mensajes que llegan de TO
subSocket.on('message',function(deliverTO,err){
	if( err ) {
		throw err;
		console.log(err);
	}
	deliverTOJSON = JSON.parse(deliverTO);
	if( sequenced.indexOf(deliverTOJSON)==-1 ){	//Si no existe el objeto en el array
		//Introducimos el objeto en la posicion del array localseq
		sequenced[localSeq] = deliverTOJSON;
		localSeq = localSeq + 1;
		var bool = underScore.isEqual(deliverTOJSON, reqJSON);
		reqJSON=null;
		if( bool ){	//Si los objetos son iguales
			emision.emit('dssmsg', localSeq-1);	//Emitimos el evento dssmsg
		}
	}
});
//_____________________________________________________________________________
//LISTENER para Ctrl + C -> salir
process.on('SIGINT', function() {	//Cerrar adecuadamente cada socket
	subSocket.close();
	pushSocket.close();
	process.exit();
});

