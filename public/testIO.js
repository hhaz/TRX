window.onload = function() {
 
    var socket = io.connect('http://localhost:3000');
    var progressBar = document.getElementById("progress");

    socket.on('update', function (data) {
        progressBar.value = data;
    });
}
