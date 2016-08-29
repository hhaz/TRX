window.onload = function() {
 
    var socket = io.connect('http://localhost:3000');
    var progressBar = document.getElementById("progress");

    socket.on('update', function (data) {
        progressBar.value = data;
    });

     socket.on('end', function () {
        progressBar.value = 0;
    });

    socket.on('updateGraph', function (data) {
        var chartDiv = document.getElementById("chartTrxGen");

        var chartTrxGen = c3.generate({
          bindto: chartDiv,
          data: {
            columns: [
            ['New Transactions', data]
            ],
            type: 'gauge',
            onclick: function (d, i) { console.log("onclick", d, i); },
            onmouseover: function (d, i) { console.log("onmouseover", d, i); },
            onmouseout: function (d, i) { console.log("onmouseout", d, i); }
          },
          gauge: {
            max:10000000,
            Label : "Number of Transactions"
          },
          color: {
          pattern: ['#FF0000', '#F97600', '#F6C600', '#60B044'], // the three color levels for the percentage values.
          threshold: {
          values: [data]
          }
          },
          size: {
          height: 180
          }
      });
    });
}
