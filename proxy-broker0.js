var zmq = require('zmq');
var frontend = zmq.socket('router');
var backend = zmq.socket('router');
var auxfunctions = require('./auxfunctions.js');
var WORKING = true;
var workers = {};
var rp0 = zmq.socket('rep');		//Socket de Reply
var rp1 = zmq.socket('rep');		//Socket de Reply
var rp2 = zmq.socket('rep');		//Socket de Reply
var rp3 = zmq.socket('rep');		//Socket de Reply

rp0.bind('tcp://127.0.0.1:9666', function(err){	//Bind para reply
	if(err)console.log(err)
	else console.log(" RR0 escuchando en el puerto 9666 para proxy")
});
rp1.bind('tcp://127.0.0.1:9667', function(err){	//Bind para reply
	if(err)console.log(err)
	else console.log(" RR1 escuchando en el puerto 9667 para proxy")
});
rp2.bind('tcp://127.0.0.1:9777', function(err){	//Bind para reply
	if(err)console.log(err)
	else console.log(" RR0 escuchando en el puerto 9777 para proxy")
});
rp3.bind('tcp://127.0.0.1:9778', function(err){	//Bind para reply
	if(err)console.log(err)
	else console.log(" RR1 escuchando en el puerto 9778 para proxy")
});

function getWorker() {
	var minWorks = calculeWorksmin();
	for (var key in workers) {
		if( workers[key][1] == minWorks )
			return key;
		}
	return null;
}

function calculeWorksmin() {
	var min = 999999999;
	for (var key in workers) {
		if( workers[key][1] < min )
			min = workers[key][1];
	}
	return min
}

function clearArgs(args) {
	var newArgs = args.reverse();
	newArgs.pop();
	newArgs.pop();
	return newArgs.reverse();
}
// ARGUMENTS
if( process.argv.length != 6 ) {
	console.log("Parametros incorrectos");
	process.exit(1);
}
var portClient0 = process.argv[2];//port RR0
var portWorker0 = process.argv[3];//port ARH0
var portClient1 = process.argv[4];//port RR1
var portWorker1 = process.argv[5];//port ARH1


// ARGUMENTS

console.log('broker: frontend-routerRR0 listening on tcp://*:' + portClient0 + ' ...');
console.log('broker: backend-routerARH0 listening on tcp://*:' + portWorker0 + ' ...');
console.log('broker: frontend-routerRR1 listening on tcp://*:' + portClient1 + ' ...');
console.log('broker: backend-routerARH1 listening on tcp://*:' + portWorker1 + ' ...');

frontend.bindSync('tcp://*:' + portClient0);
frontend.bindSync('tcp://*:' + portClient1);

backend.bindSync('tcp://*:' + portWorker0);
backend.bindSync('tcp://*:' + portWorker1);


frontend.on('message', function() {
	var args = Array.apply(null, arguments);
	var worker = getWorker();
	console.log("\nFrontend");
	console.log("Received request: " + args[2] + " from client ( " + args[0] + " ).");
	//auxfunctions.showArguments(args);
	
	if( worker == null ) {
		console.log("We have not workers")
		frontend.send([args[0], "" , 'We have not workers']);
		return
	}
	
	console.log("Sending client: ( " + args[2] + " ) req to worker( " + worker + " ) through bakend.");
	//auxfunctions.showArguments(args);
	
	workers[worker][0] = WORKING;
	workers[worker][1] += 1;
	backend.send([worker, "" ,args]);
});

backend.on('message', function() {
	var args = Array.apply(null, arguments);
	console.log("\nBackend");
	if(workers[args[0]] == undefined) {
		workers[args[0]] = [!WORKING, 0];
		console.log("Received request: ( " + args[2] + " ) from worker ( " + args[0] + " ).");
		//auxfunctions.showArguments(args);
		
	}
	else {
		workers[args[0]][0] = !WORKING;
		console.log("Received request: ( " + args[2]+ " ) from worker ( " + args[0] + " ).");
		//auxfunctions.showArguments(args);
		
	}
	if(args[2] != "READY") {
		console.log("Sending worker: ( " + args[0] + " ) rep to client ( " + args[2] + " ) through frontend.");
		args = clearArgs(args);
		//auxfunctions.showArguments(args);
		frontend.send([args[0] , "" , args[2]]);
	}
	//console.log(workers);
});

//LISTENER para Ctrl + C -> salir
process.on('SIGINT', function() {	//Cerrar adecuadamente cada socket

	rp0.close();
	rp1.close();
	rp2.close();
	rp3.close();
	process.exit();
	
});
