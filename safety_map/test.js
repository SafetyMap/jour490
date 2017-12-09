var pg = require('pg');
//数据库配置
var conString = "tcp://xibei:xibei1004@127.0.0.1/crime_map"; //tcp://用户名：密码@localhost/数据库名

var client =  new pg.Client(conString);
  client.connect(function(err, result) {
    if (err) {
      console.log('ClientConnectionReady error: '+ err.message);
      client.end();
      return;
    }
    console.log("client connect OK");
    //console.log(req.body.path);
    //var qry = "select count(*) from (select ST_GeomFromGeoJSON('"+ req.body.path+
    "') as geom) as st, public.aggtotal as agg"+
    " where ST_DWithin(st.geom, agg.latlng, 0.01) is true group by st.geom;";


});
