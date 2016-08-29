var solr = require('solr-client');
var config = require('./config');
var clientGenerateTrx = solr.createClient(config.host,config.port,config.solRcore);

var customerArray = ["LIDL", "Carrefour" , "Auchan" , "LVMH" , "Picard" , "Intermarche" , "McDonalds" , "TJMorris" , "NewLook"];
var currencyArray = [ "EUR" , "EUR" , "EUR", "EUR" , "GBP", "GBP"];
var paymentAppArray = ["EMV" , "EMV" , "EMV" , "EMV" , "EMV" , "EMV" , "CLS" , "CLS" , "CLS", "AME", "AME", "SSC"];
var trxTypeArray = [ "Debit", "Debit","Debit","Debit","Debit", "Credit", "Credit"];
var level1Array = ["HyperMarket" , "SuperMarket" , "Market" , "ProxiMarket"];
var level2Array = { "HyperMarket" : ["Paris" , "Lille" , "Lyon" , "Marseille" , "Toulouse" , "Nantes" , "Strasbourg" , "Nancy" , "Toulon" , "Nice" , "Cannes"], 
                    "SuperMarket" : ["Villejuif" , "Noisy Le Grand" , "Créteil" , "Versailles" , "Brest" , "Beauvais" , "Bourges" , "Brive" , "Montpellier"],
                    "Market" : ["Vélizy" , "Fontainebleau" , "Clamart" , "Sèvres" , "Issy Les Moulineaux"],
                    "ProxiMarket" : ["Viroflay" , "Melun" , "La Baule" , "Clisson" , "Orléans"]};
var directionArray = [1, -1];

var trxGenerated = 0;

generateTransactions = function() {
};


function gaussian(mean, stdev) {
    var y2;
    var use_last = false;
    return function() {
        var y1;
        if(use_last) {
           y1 = y2;
           use_last = false;
        }
        else {
            var x1, x2, w;
            do {
                 x1 = 2.0 * Math.random() - 1.0;
                 x2 = 2.0 * Math.random() - 1.0;
                 w  = x1 * x1 + x2 * x2;               
            } while( w >= 1.0);
            w = Math.sqrt((-2.0 * Math.log(w))/w);
            y1 = x1 * w;
            y2 = x2 * w;
            use_last = true;
       }

       var retval = mean + stdev * y1;
       if(retval > 0) 
           return retval;
       return -retval;
   }
}

// make a standard gaussian variable.     
var standard = gaussian(12, 4);

Date.prototype.addDays = function (num) {
    var value = this.valueOf();
    value += 86400000 * num;
    return new Date(value);
}

Date.prototype.addSeconds = function (num) {
    var value = this.valueOf();
    value += 1000 * num;
    return new Date(value);
}

Date.prototype.addMinutes = function (num) {
    var value = this.valueOf();
    value += 60000 * num;
    return new Date(value);
}

Date.prototype.addHours = function (num) {
    var value = this.valueOf();
    value += 3600000 * num;
    return new Date(value);
}

function pseudoRandomDate ( nbDays ) {
    var result = new Date();

    var days = Math.round( nbDays * Math.random());

    days = days * getRandomValue( directionArray); //future or past

    result = result.addDays(days);

    var standard = gaussian(12, 4);

    var returnDate = new Date( result.getFullYear(), result.getMonth(), result.getDay(),Math.round(standard()), Math.round( Math.random() * 59),  Math.round( Math.random() * 59),0);

    return returnDate;
}

function getRandomValue (arrayParam) {
  var index = Math.round(arrayParam.length *  Math.random()) - 1;

  if (index < 0) index = 0;
  if (index >= arrayParam.length) index = arrayParam.length - 1;

  return arrayParam[index];
}

generateTransactions.prototype.generate = function () {

  var dateTicket;
  var dateServer;
  var paymentApp;
  var trxType;
  var currency;
  var customer;
  var level1;
  var level2;
  var level2TempArray;
  var level3TempArray;
  var level3;
  var authorization;
  var P2PE;
  var settlement;
  var amount;

  var docs = [];

  for(var i = 0; i <= config.trxBlock ; i++){
   dateTicket = pseudoRandomDate(config.nbDays);
   dateServer = dateTicket.addSeconds(Math.round(config.nbSecondsBetweenTicketAndServer *  Math.random()));
   paymentApp = getRandomValue(paymentAppArray);
   customer = getRandomValue(customerArray);
   trxType = getRandomValue(trxTypeArray);
   currency = getRandomValue(currencyArray);
   level1 = getRandomValue(level1Array); 
   level2TempArray = level2Array[level1];
   level2 = getRandomValue(level2TempArray);
   level3 = "level3." + Math.round(Math.random()*10);
   settlement = Math.round(Math.random());
   P2PE = Math.round(Math.random());
   authorization = Math.round(Math.random());
   amount = (config.maxAmount * Math.random()).toFixed(2);
   var doc = { DateTicket : dateTicket, DateServer : dateServer, TrxType : trxType, Currency : currency, Amount : amount, AppType : paymentApp, Level1 : level1, Level2 : level2, Level3 : level3 , P2PE : P2PE, Settlement : settlement , Authorization : authorization , Merchant : customer}
   docs.push(doc);
  }

  trxGenerated += config.trxBlock;
  io.sockets.emit('updateGraph', trxGenerated);
  if( trxGenerated % config.commitAfter == 0) {
   clientGenerateTrx.commit(function(err,res){
       if(err) console.log(err);
       if(res) {
        console.log("Committing ", trxGenerated , res);
      }
    });
  }

  clientGenerateTrx.add(docs,function(err,obj){
   if(err){
      console.log(err);
   }
});
}

exports.generateTransactions = generateTransactions;
