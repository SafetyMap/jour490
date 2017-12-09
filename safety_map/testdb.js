
var pg = require('pg');
var config = {
  user:"xibei",
  database:"crime_map",
  password:"xibei1004",
  port:5432
};


    //app.post('/detect_crime',);
var pool = new pg.Pool(config);

pool.connect(function(err, client, done) {

    if (err) {
    console.log("connect fail"+ err);
    
    return;
  }

    console.log('connect ok');

});
