var config = {};

// solR settings
config.solRcore = 'trx5';
config.amount = 'Amount';
config.dateTicket = 'DateTicket';
config.dateServer = 'DateServer';
config.trxType = 'TrxType';
config.appType = 'AppType';
config.currency = 'Currency';
config.level1 = "Level1";
config.level2 = "Level2";
config.level3 = "Level3";
config.host = 'localhost';
config.port = 8983;

//Application settings
config.rowPerPage = 30;
config.exportRowsPerIteration = 10000;

//Transaction generation settings
config.nbDays = 720;
config.nbSecondsBetweenTicketAndServer = 120;
config.maxAmount = 3000;
config.generateTrx = false;
config.commitAfter = 100000;
config.trxBlock = 10000;
config.generationFrequency = 5000;

module.exports = config;
