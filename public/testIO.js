window.onload = function() {
 
    var socket = io.connect('http://localhost:3000');
    var progress = document.getElementById("progress");

    console.log( 'connecting');
    
    socket.on('message', function (data) {
        console.log( data);
        progress.innerHTML = data;
        /*if(data.message) {
            messages.push(data.message);
            var html = '';
            for(var i=0; i<messages.length; i++) {
                html += messages[i] + '<br />';
            }
            content.innerHTML = html;
        } else {
            console.log("There is a problem:", data);
        }*/
    });
 
    /*sendButton.onclick = function() {
        var text = field.value;
        socket.emit('send', { message: text });
    };*/
 
}