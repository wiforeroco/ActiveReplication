var socket = io.connect('http://127.0.0.1:3000',{'forceNew':true});

socket.on('mensaje',function(data){
    console.log(data);
   // document.getElementById('messages').innerHTML = data
    render(data);
});

function render(data){
    
    var html =  data.map(function(message, index){
        return (
                message.text
        );
    }).join(' ');
    
    document.getElementById('messages').innerHTML = html;
}

