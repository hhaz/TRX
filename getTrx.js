var ZipWriter = require("moxie-zip").ZipWriter;
var solr = require('solr-client');
var config = require('./config');
var client = solr.createClient();

Transactions = function() {
};

Transactions.prototype.getTransactionsOnly = function (page,montantMin, montantMax, dateMin, dateMax, callback) {
if ((montantMin == "" || montantMax == "" ) && (dateMin == "" || dateMax == "" )){
    console.log ("Empty or incomplete parameters");
     callback("Empty or incomplete parameters");
  }
 else {   
  var fq = "";

  if (montantMin != "" && montantMax != "" ) {
    fq += "&fq=" + config.amount +':[' + montantMin + '%20TO%20' + montantMax +']';
  }

  if (dateMin != "" && dateMax != "" ) {
    fq += "&fq=" + config.dateTicket +':[' + dateMin + 'T00:00:00Z%20TO%20' + dateMax +'T00:00:00Z]';
  }

  var query = 'q=*' + fq + '&rows=30&start=' + page*30;
 
  client.get( config.solRcore + '/select', query, function(err, obj){
    if(err){
      console.log(err);
    } else {
      callback(null, obj.response.docs, obj.response.numFound);
  }
});
}
}

Transactions.prototype.getTransactions = function (page,montantMin, montantMax, dateMin, dateMax, callback) {
  console.log("date Min : '", dateMin + "'");
  console.log("date Max : '", dateMax + "'");
  console.log("montant Min : '", montantMin + "'");
  console.log("montant Max : '", montantMax + "'");


 if ((montantMin == "" || montantMax == "" ) && (dateMin == "" || dateMax == "" )){
    console.log ("Empty or incomplete parameters");
     callback("Empty or incomplete parameters");  
  }

 else {   
  var fq = "";

  if (montantMin != "" && montantMax != "" ) {
    fq += "&fq=" + config.amount +':[' + montantMin + '%20TO%20' + montantMax +']';
  }

  if (dateMin != "" && dateMax != "" ) {
    fq += "&fq=" + config.dateTicket +':[' + dateMin + 'T00:00:00Z%20TO%20' + dateMax +'T00:00:00Z]';
  }

  var query = 'q=*' + fq + '&facet=true&facet.field=' + config.currency + '&facet.field=' + config.level1 + '&facet.field=' + config.level2 + '&facet.field=' + config.level3 + '&facet.field=' + config.trxType + '&facet.field=' + config.appType +'&facet.pivot={!stats=piv1}' + config.level1 + ',' + config.currency + ',' + config.trxType +',' + config.appType +'&stats=true&stats.field={!tag=piv1%20sum=true%20count=true}' + config.amount + '&rows=30&start=' + page*30;
  client.get(config.solRcore + '/select', query, function(err, obj){
    if(err){
      console.log(err);
    } else {
      callback(null, obj.response.docs, obj.facet_counts.facet_fields, obj.facet_counts.facet_pivot,obj.response.numFound);
  }
});
}
}

Transactions.prototype.getGlobalStats = function (callback) {
  
  var query = 'q=*&facet=true&facet.field=' + config.currency + '&facet.field=' + config.level1 + '&facet.field=' + config.level2 + '&facet.field=' + config.level3 + '&facet.field=' + config.trxType + '&facet.field=' + config.appType + '&rows=0';
  console.log( 'Query : ' + query);
  client.get(config.solRcore + '/select', query, function(err, obj){
    if(err){
      console.log(err);
    } else {
      callback(null, obj);
  }
});
}

Transactions.prototype.export = function (montantMin, montantMax, dateMin, dateMax, totalRecords, res, callback) {
  var query = "";
  var rowsPerIteration = 10000;
  var rowsToRetrieve = 0;
  var data = "";
  var last = false;
  var nbLoops = 0;
  var inserted =0;
  var zip = new ZipWriter();

  var fq = "";

  if (montantMin != "" && montantMax != "" ) {
    fq += "&fq=" + config.amount +':[' + montantMin + '%20TO%20' + montantMax +']';
  }

  if (dateMin != "" && dateMax != "" ) {
    fq += "&fq=" + config.dateTicket +':[' + dateMin + 'T00:00:00Z%20TO%20' + dateMax +'T00:00:00Z]';
  }

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
    
    query = "q=*" + fq + "&rows=" + rowsToRetrieve + "&start=" + i;

    client.get(config.solRcore + '/select', query, function(err, obj) {
      if(err){
        console.log(err);
      } else {
        for(var trx in obj.response.docs)
        {
          data += obj.response.docs[trx][config.dateTicket] + "," + obj.response.docs[trx][config.dateServer] + "," + obj.response.docs[trx][config.currency] + "," + obj.response.docs[trx][config.amount] + "\r\n";
        }
      }
      if(++inserted == nbLoops +1) {  
        zip.addData("export.txt", data);  
        zip.toBuffer(function(buf) {
        callback(null,buf);
      });
      }
     }
    );
  }
}

exports.Transactions = Transactions;
