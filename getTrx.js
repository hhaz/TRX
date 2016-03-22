var ZipWriter = require("moxie-zip").ZipWriter;
var solr = require('solr-client');
var client = solr.createClient();

Transactions = function() {
};

Transactions.prototype.getTransactionsOnly = function (page,montantMin, montantMax, callback) {
  var query = 'q=*&fq=Montant:[' + montantMin + '%20TO%20' + montantMax + ']&rows=30&start=' + page*50;
  client.get('trx2/select', query, function(err, obj){
    if(err){
      console.log(err);
    } else {
      callback(null, obj.response.docs, obj.response.numFound);
  }
});
}

Transactions.prototype.getTransactions = function (page,montantMin, montantMax, callback) {
  var query = 'q=*&fq=Amount:[' + montantMin + '%20TO%20' + montantMax + ']&facet=true&facet.field=Amount&facet.field=AppType&facet.pivot={!stats=piv1}Currency,TrxType,AppType&stats=true&stats.field={!tag=piv1%20sum=true}Amount&rows=30&start=' + page*50;
  client.get('trx2/select', query, function(err, obj){
    if(err){
      console.log(err);
    } else {
      callback(null, obj.response.docs, obj.facet_counts.facet_fields, obj.facet_counts.facet_pivot,obj.response.numFound);
  }
});
}

Transactions.prototype.export = function (montantMin, montantMax, totalRecords, res, callback) {
  var query = "";
  var rowsPerIteration = 10000;
  var rowsToRetrieve = 0;
  var data = "";
  var last = false;
  var nbLoops = 0;
  var inserted =0;
  var zip = new ZipWriter();

  for( var i = 0; i <= totalRecords; i += rowsPerIteration) {
    if (totalRecords - i >= rowsPerIteration) {
      nbLoops ++;
    }
  }

  for( var i = 0; i <= totalRecords; i += rowsPerIteration) {
    if (totalRecords - i < rowsPerIteration) {
      rowsToRetrieve = totalRecords - i;
      last = true;
    }
    else
    {
      rowsToRetrieve = rowsPerIteration;
    }
    
    query = "q=*&fq=Amount:[" + montantMin + "%20TO%20" + montantMax + "]&rows=" + rowsToRetrieve + "&start=" + i;

    client.get('trx2/select', query, function(err, obj) {
      if(err){
        console.log(err);
      } else {
        for(var trx in obj.response.docs)
        {
          data += obj.response.docs[trx].DateTicket + "," + obj.response.docs[trx].DateServer + "," + obj.response.docs[trx].Currency + "\r\n";
        }
      }
      if(++inserted == nbLoops +1) {
        zip.addData("export.txt", data);  
        zip.toBuffer(function(buf) {
        callback(buf);
      });
      }
     }
    );
  }
}

exports.Transactions = Transactions;
