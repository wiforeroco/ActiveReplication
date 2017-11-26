//REQUIRES DE NODE.JS
var readline = require('readline'); //Para leer input de teclado
var zmq = require('zmq'); //Sockets tipo ZMQ

//VARIABLES
var rq = zmq.socket('req'); //Socket de Request
var id = randString(); //Identificacion mediante string aleatorio
var rl = readline.createInterface(process.stdin, process.stdout); //Para leer input



//=================================CODIGO======================================

//CONECTAMOS A UN RR:
rq.connect('tcp://127.0.0.1:9010');
console.log('\n +++ Conectado al RR 127.0.0.1:9010 +++\n');
console.log(' Info: Introduciendo exit el programa terminara');
NuevaPeticion(); //Llamamos a la funcion NuevaPeticion

//======================
//=========LISTENERS=====================================
//Listener para los mensajes de vuelta al cliente con el resultado del request
var mensaje = [{
               text: rq.on('message',function(msg){
	var recibido = JSON.parse(msg); //Pasar a JSON el string recibido
	console.log(' Resultado: ' + JSON.stringify(recibido.res)+'\n');
	NuevaPeticion(); //Llamamos de nuevo a la funcion
})
}];



//===============================FUNCIONES=====================================
//FUNCION en la que creamos el objeto JSON con el identificador y el request
//para enviarselo a nuestro RR

function NuevaPeticion(){
	rl.question(" Introduzca la operacion: ", function LeerTeclado(re) {
		var args = re.trim().split(' ');
		if( (args[0]=='pop' || args[0]=='shift') && args[1]==null){
			//JSON de la identificacion de user y el request
			var envioCliente_RR ={
				ide: id,
				request: args[0]
			}
			//String del JSON para enviar
			sEnvioCliente_RR = JSON.stringify(envioCliente_RR);
			rq.send(sEnvioCliente_RR); //Enviamos al RR
		}
		else if((args[0]=='push' || args[0]=='unshift' || args[0]=='indexOf') && args[1]!=null){
			//JSON de la identificacion de user y el request
			var envioCliente_RR ={
				ide: id,
				request: args[0]+' '+args[1]
			}

			//String del JSON para enviar
			sEnvioCliente_RR = JSON.stringify(envioCliente_RR);
			rq.send(sEnvioCliente_RR); //Enviamos al RR
		}
		else if(args[0]=='exit'){
			rq.close();
			process.exit();
		}
		else{
			console.log('\n Las operaciones validas son: pop, shift, unshift x, push x, indexOf x.');
			console.log(' Donde x es el elemento a añadir (inicio o final	del array) o buscar en el array\n');
			NuevaPeticion();
		}
	});
};
//

//FUNCION de string aleatorio
function randString () {
	var len = 10
	, charSet = '0123456789abcdef'
	, result = [];
	for (var i = 0; i < len; ++i) {
		result.push(charSet[Math.floor(Math.random() * charSet.length)]);
}

	result.splice(len / 2, 0, ['-']);
	return result.join('');
}


//_________________________WebServiceHTTP_______________________
var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

app.use(express.static('Client'));



io.on('connection',function(socket){
    console.log("El cliente con IP: "+socket.handshake.address+" se ha conectado...");
    socket.emit('mensaje', mensaje);
});

server.listen(3000, function(){
    console.log('\n\n\nServidor esta funcionando en http://127.0.0.1:3000');
    
});
//___________________________endWebServiceHTTP_________________________

