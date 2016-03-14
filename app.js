var express = require('express');
var connect = require('connect');
var stylus = require('stylus');

var Transactions = require('./getTrx').Transactions;

var transactions = new Transactions();

var app = module.exports = express();
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
    res.render('home', {
            title: 'Trx Display Test'
        });
});

app.post('/go/:pageId', function(req, res){
    transactions.getTransactions(req.params.pageId,req.param('montantMin'), req.param('montantMax'), function(error,docs,facetList,facetPivot,total){
        res.render('displayTrx', {
            title: 'Transaction Journal',
            transactions: docs,
            facets:facetList,
            pivots:facetPivot,
            pageId:req.params.pageId,
            pageNext : parseInt(req.params.pageId) + 1,
            pagePrev : parseInt(req.params.pageId) - 1,
            montantMin:req.param('montantMin'),
            montantMax:req.param('montantMax'),
            totalRecords:total
          });
      });
});

app.post('/go/file/export', function(req, res) {
transactions.export( req.param('montantMin'), req.param('montantMax'), req.param('totalRecords'), function (data) {
        res.set({'Content-Type' :'application/octet-stream', 
          'Content-length' : data.length , 
          'Content-disposition' :'attachment; filename=export.zip'});
        res.send(data);
      });
 });

app.listen(3000);
