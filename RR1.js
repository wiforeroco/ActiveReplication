//REQUIRES DE NODE.JS
var zmq = require('zmq'); //Sockets tipo ZMQ
var underScore = require('underscore');	//Underscore
//VARIABLES
var rp = zmq.socket('rep');	//Socket de Reply
var rq = zmq.socket('req');	//Socket de Request
var cl_seq = 0;			//Secuencia del cliente
var req_id;			//JSON de identificacion de cliente
var request;			//JSON del request
var recibido;	//Booleano para ver si hemos recibido mensaje
var sRequest; 	//String de JSON
var resultJSON;	//JSON del resultado
var i; 		//Posicion array servers hlist
var rqs = [];	//Array para almacenar los ARH
var hlist = ['tcp://127.0.0.1:9023','tcp://127.0.0.1:9020'];
//=================================CODIGO======================================
for(var k=0; k<hlist.length; k++){	//Conectamos todos los h(i)
	rqs[k] = zmq.socket('req');		//Socket de Request 
	rqs[k].connect(hlist[k]);		//Conectarlo
}
rp.bind('tcp://127.0.0.1:9011', function(err){	//Bind para conexiones
	if(err)console.log(err)
	else console.log("\n RRMessageHandler escuchando en el puerto 9011")
});
//===============================LISTENERS=====================================
//Listener para cuando recibimos la operacion de cliente.js
rp.on('message',function(msgCliente,err){
	if( err ) {
		throw err;
		console.log(err);
	}
	var msgClienteJSON = JSON.parse(msgCliente);
	i = hlist.length-1;	//Inicializamos i a la longitud del hlist menos 1
	cl_seq = cl_seq + 1;	//Aumentamos la secuencia de cliente
	req_id = {		//Objeto JSON para req_id 
	cl_id: msgClienteJSON.ide,
	cl_seq: cl_seq
	};
	request = {		//Objeto JSON para la peticion
		req_id: req_id,
		request: msgClienteJSON.request
	};
	sRequest = JSON.stringify(request); //String del JSON request
	siguiente(i);	//Funcion para enviar el request al server o servers
});
//_____________________________________________________________________________
//Listener para cuando recibimos el resultado de ARH.js
for(var j=0;j<hlist.length;j++){
	rqs[j].on('message',function(result,err){
		if( err ) {
			throw err;
			console.log(err); 
		}
		recibido = true;    //Hemos recibido mensaje = true
		resultJSON = JSON.parse(result);
		//Si los req_id son iguales
		if( underScore.isEqual(resultJSON.req_id, request.req_id) ){ 
		rp.send(result); //Enviamos el resultado al cliente
		console.log(' Result recibido y enviado\n');
		}
		else{
		console.log(' Req_id distinto entre resultado y envio\n')
		}
	});
}
//_____________________________________________________________________________
//LISTENER para Ctrl + C -> salir
process.on('SIGINT', function() {//Cerrar adecuadamente cada socket
	rp.close();
	for(var k=0; k<hlist.length; k++){
		rqs[k].close();
	}
	process.exit();
});
//===============================FUNCIONES=====================================
//FUNCION Siguiente para pasar el request al siguiente servidor
function siguiente(i){
	if(i>=0){
		rqs[i].send(sRequest); //Enviamos al servidor i el string
		console.log(' Enviando a... '+ hlist[i].toString());
		recibido = false;
		setTimeout(function TDeEspera(){//Cada 1 segundo repetir la funcion
			if(!recibido){	//Si no hemos recibido mensaje
				console.log(' |-El servido parece estar caido, reenvio: ');
				siguiente(i-1);	//Llamar a la funcion con i-1
			}
		},1000);
	}
}

