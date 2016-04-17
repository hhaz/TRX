var currentValue = 0;
var myInterval;
var start = true;

window.onload = function() {
 
    var socket = io.connect('http://localhost:3000');
    var progressBar = document.getElementById("progress");

    //console.log( 'connecting');

    socket.on('update', function (data) {
        if(start) { 
            progressBar.value = 0;
            myInterval  = setInterval( function(){ updateProgress() }, 100); 
            start = false;
        }
        currentValue = data;    
    });
}

function updateProgress () {
    var progressBar = document.getElementById("progress");
    console.log (currentValue);
    progressBar.value = currentValue;
    //$("progress").animate({ value: "+=100" }, 1);
    if (currentValue >= progressBar.max ) {
        console.log('clearInterval');
        clearInterval(myInterval);
        start = true;
    }
}