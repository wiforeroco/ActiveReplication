//REQUIRES DE NODE.JS
var zmq = require('zmq'); //Sockets de tipo ZMQ
//VARIABLES
var executed = []; //Array de operaciones ejecutadas
var expectedSeq = 1; //Secuencia esperada
var result, seq; //result y seq del sequencer
var TOResult; //JSON
var sTOResult; //string de JSON
var subSocket = []; //Array de conexiones y listeners de tipo sub
var pushSocket = []; //Array de conexiones y listeners de tipo push
var publist = ['tcp://127.0.0.1:9024']; //Array con las direcciones de tipo pub
var pulllist = ['tcp://127.0.0.1:9025']; //Array con las direcciones de tipo pull
var arrayPrueba = []; //Array para el supuesto
for(k=0; k<21; k++){
	arrayPrueba[k]=k.toString();
}
//=================================CODIGO======================================
console.log('');
	for(var k=0;k<publist.length;k++){
		subSocket[k] = zmq.socket('sub'); //crear el sub para cada hi
		subSocket[k].connect(publist[k]); //conectarlo
		console.log(' Conectado al publicador: ' + publist[k]);
		subSocket[k].subscribe(''); //Subscibirse a la "cadena vacia"
//_____________________________________________________________________________
		pushSocket[k] = zmq.socket('push'); //crear el push para cada pull
		pushSocket[k].connect(pulllist[k]); //conectar a todos los hi con push
		console.log(' Conectado al pull: ' + pulllist[k]);
}
//===============================LISTENERS=====================================
//Listeners para todos los sub's cuando reciben el request del ARH pub
for(var i=0; i<publist.length; i++){
	subSocket[i].on('message', function(msgARH,err) {
		if( err ) {
			throw err;
			 console.log(err);
		}
		var msgARHJSON = JSON.parse(msgARH); //Pasar a JSON el string recibido
		console.log(' \nRecibido: '+msgARH);
		seq = msgARHJSON.seq;  //Asignamos a seq el valor de seq del objeto
		if(seq>expectedSeq){
		//DO NOTHING
		}
		else{
			if(seq == expectedSeq){
				 //Computar el request y almacenar en resultado
				result = compute(msgARHJSON.request);
				 //Almacenar el resultado en el array de ejecutados
				executed[seq] = result;
				  //Iterar una posicion
				expectedSeq = expectedSeq + 1;
			}
			TOResult = { //Objeto JSON del resultado computado
				seq: seq,
				result: executed[seq]
			};
			 //Pasamos el JSON del resultado al hi
			sTOResult=JSON.stringify(TOResult);
			pushSocket[msgARHJSON.ARH].send(sTOResult); //Envio de TOResult
			console.log('Enviando resultado');
		}
	});
}
//_____________________________________________________________________________
//LISTENER para Ctrl + C -> salir
process.on('SIGINT', function() { //Cerrar adecuadamente cada socket
	for(var k=0;k<publist.length;k++){
		pushSocket[k].close();
		subSocket[k].close();
	}
	process.exit();
});
//===============================FUNCIONES=====================================
//FUNCION compute para ejecutar el request y obtener el "resultado"
function compute(request){
	console.log('Ejecucion');
	var args = request.split(' ');
	if(args[0]=='pop'){
		arrayPrueba.pop();
	}
	else if(args[0]=='shift'){
		arrayPrueba.shift();
	}
	else if(args[0]=='push'){
		arrayPrueba.push(args[1]);
	}
	else if(args[0]=='unshift'){
		arrayPrueba.unshift(args[1]);
	}
	else if(args[0]=='indexOf'){
		var pos = arrayPrueba. indexOf(args[1]);
		if(pos!=-1){
			return 'Existe y esta en la posicion '+pos;
		}
		else{
			return 'No existe en el array'
		}
	}
	return arrayPrueba;
}
