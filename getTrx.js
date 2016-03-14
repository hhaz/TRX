var ZipWriter = require("moxie-zip").ZipWriter;

var nodeZip = new require('node-zip')();


var solr = require('solr-client');
var client = solr.createClient();

Transactions = function() {
};

Transactions.prototype.getTransactions = function (page,montantMin, montantMax, callback) {
  var query = 'q=*&fq=Montant:[' + montantMin + '%20TO%20' + montantMax + ']&facet=true&facet.field=Monnaie&facet.field=Type_d_application&facet.pivot={!stats=piv1}Monnaie,Type_de_transaction,Type_d_application&stats=true&stats.field={!tag=piv1%20sum=true}Montant&rows=30&start=' + page*50;
  client.get('trx/select', query, function(err, obj){
    if(err){
      console.log(err);
    } else {
      console.log(obj.response.numFound);
      callback(null, obj.response.docs, obj.facet_counts.facet_fields, obj.facet_counts.facet_pivot,obj.response.numFound);
  }
});
}

Transactions.prototype.export = function (montantMin, montantMax, totalRecords, callback) {
  var query = "q=*&fq=Montant:[" + montantMin + "%20TO%20" + montantMax + "]&rows=" + totalRecords;
  var zip = new ZipWriter();
  client.get('trx/select', query, function(err, obj){
    if(err){
      console.log(err);
    } else {
      var data = "";
      for(var trx in obj.response.docs)
      {
        data += obj.response.docs[trx].Date_Ticket + "," + obj.response.docs[trx].Date_Serveur + "," + obj.response.docs[trx].Monnaie + "\r\n";
      }
      zip.addData("results.txt", data);
      zip.toBuffer(function(buf) {
       callback(buf);
    });
 }
});
}  

exports.Transactions = Transactions;

