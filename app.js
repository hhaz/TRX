var express = require('express');
var connect = require('connect');
var stylus = require('stylus');
var config = require('./config');
XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
document = require('jsdom').jsdom();
d3 = require('d3');
var Transactions = require('./getTrx').Transactions;
var GenerateTransactions = require('./generateTrx').generateTransactions;

var transactions = new Transactions();
var generateTransactions = new GenerateTransactions();

var app = express();

var sessionTimeOut = 3600000; //1 hour

var server = connect();

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.limit('400mb'));
  app.use(express.cookieParser());
  app.use(app.router);
  app.use(require('stylus').middleware({ src: __dirname + '/public' }));
  app.use(express.static(__dirname + '/public'));
  app.use('/images/', express.static(__dirname + "/images/"));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

app.set('view options', { layout: true });
app.set('view options', { pretty: true });
app.locals.pretty = true; 

app.get('/', function(req, res){
      transactions.getGlobalStats(function(error,obj){
      res.render( 'home', {
            title: 'Transactions Display' ,
            totalRows : obj.response.numFound,
            currencies : obj.facet_counts.facet_fields.Currency,
            TrxType : obj.facet_counts.facet_fields.TrxType,
            AppType : obj.facet_counts.facet_fields.AppType
        })
      });
    });

app.post('/go/:pageId', function(req, res){
    transactions.getTransactions(req.params.pageId,req.param('montantMin'), req.param('montantMax'), req.param('dateMin'), req.param('dateMax'),function(error,docs,facetList,facetPivot,total){
    
  if(error) {
    res.render('error' );
  }
  else
  {
    var pageNext = parseInt(req.params.pageId) + 1;
    var pagePrev;

    if((parseInt(req.params.pageId) - 1) < 0) {
      pagePrev = 0;
    }
    else {
      pagePrev = parseInt(req.params.pageId) - 1;
    }
        res.render('displayTrx', {
            title: 'Transaction Journal',
            transactions: docs,
            facets:facetList,
            pivots:facetPivot,
            pageId:req.params.pageId,
            pageNext : pageNext,
            pagePrev : pagePrev,
            montantMin:req.param('montantMin'),
            montantMax:req.param('montantMax'),
            dateMax : req.param('dateMax'),
            dateMin : req.param('dateMin'),
            totalRecords:total,
            config : config,
            io : io
          });
      }
      });
});

app.get('/api/getTrx', function(req, res){ // http://localhost:3000/api/getTrx?cursorMark=*&montantMin=1&montantMax=3
  cursorMark = req.query["cursorMark"];
  montantMin = req.query["montantMin"];
  montantMax = req.query["montantMax"];
  dateMax = req.query["dateMax"];
  dateMin = req.query["dateMin"];
  console.log("Call to /api/getTrx");
    transactions.getTransactionsOnly(cursorMark,montantMin, montantMax, dateMin, dateMax, function(error,docs,total,NextCursorMark){
      res.send({totalRows : total, trx : docs, nextCursorMark : NextCursorMark});
      });
});

app.get('/api/getStats', function(req, res){ // http://localhost:3000/api/getStats?montantMin=1&montantMax=3
  montantMin = req.query["montantMin"];
  montantMax = req.query["montantMax"];
  dateMax = req.query["dateMax"];
  dateMin = req.query["dateMin"];
      transactions.getStatsOnly(montantMin, montantMax, dateMin, dateMax, function(error,docs){
      res.send(docs);
      });
});

app.get('/d3test', function(req, res){ 
  page       = req.query["page"];
  montantMin = req.query["montantMin"];
  montantMax = req.query["montantMax"];
  dateMax = req.query["dateMax"];
  dateMin = req.query["dateMin"];
      transactions.getGlobalStats(function(error,obj){
      res.render( 'd3test', {
            title: 'D3JS Test' ,
            totalRows : obj.response.numFound,
            currencies : obj.facet_counts.facet_fields.Currency,
            TrxType : obj.facet_counts.facet_fields.TrxType,
            AppType : obj.facet_counts.facet_fields.AppType
        })
      });
});

app.post('/go/file/export', function(req, res) {
transactions.export( req.param('montantMin'), req.param('montantMax'),  req.param('dateMin'), req.param('dateMax'), req.param('totalRecords'), res, function (error,data) {
        if(error) {
          res.render('error');
        }
        else {
        res.set({'Content-Type' :'application/octet-stream', 
          'Content-length' : data.length , 
          'Content-disposition' :'attachment; filename=export.zip'});
        res.send(data);
      }
    });
 });

app.post('/go/file/exportWithCursor', function(req, res) {
transactions.exportWithCursor( req.param('montantMin'), req.param('montantMax'),  req.param('dateMin'), req.param('dateMax'), req.param('totalRecords'), res, function (error,data) {
        if(error) {
          res.render('error');
        }
        else {
        res.set({'Content-Type' :'application/octet-stream', 
          'Content-length' : data.length , 
          'Content-disposition' :'attachment; filename=export.zip'});
        res.send(data);
      }
    });
 });


app.post('/testPerHourDisplay', function(req, res){
    transactions.getTrxPerPeriod("HOUR" , req.param('dateMin'), function(error,obj){
    
  if(error) {
    res.render('error' );
  }
  else
  {
    res.render('trxPerDay', {
            title: 'Transaction Journal Per Day',
            transactions: obj,
          });
  }
});
});

app.post('/testPerWeekDisplay', function(req, res){
    transactions.getTrxPerPeriod("WEEK" , req.param('dateMin'), function(error,obj){
    
  if(error) {
    res.render('error' );
  }
  else
  {
    res.render('trxPerDay', {
            title: 'Transaction Journal Per Day',
            transactions: obj,
          });
  }
});
});

app.post('/testPerDayDisplay', function(req, res){
    transactions.getTrxPerPeriod("DAY" , req.param('dateMin'), function(error,obj){
    
  if(error) {
    res.render('error' );
  }
  else
  {
    res.render('trxPerDay', {
            title: 'Transaction Journal Per Day',
            transactions: obj,
          });
  }
});
});


app.post('/testPerMonthDisplay', function(req, res){
    transactions.getTrxPerPeriod("MONTH" , req.param('dateMin'), function(error,obj){
    
  if(error) {
    res.render('error' );
  }
  else
  {
    res.render('trxPerDay', {
            title: 'Transaction Journal Per Day',
            transactions: obj,
          });
  }
});
});

//app.listen(3000);

// With Socket.io
io = require('socket.io').listen(app.listen(3000));

io.sockets.on('connection', function (socket) {
    socket.emit('message', { message: 'welcome to the chat' });
    socket.on('send', function (data) {
        io.sockets.emit('message', data);
    });
});

if( config.generateTrx) {
  setInterval(generateTransactions.generate, config.generationFrequency);
}

console.log("Started ! Using Core : " + config.solRcore + " transaction generation : " + config.generateTrx);


