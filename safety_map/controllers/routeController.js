var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({extended: false});
var pg = require('pg');
var config = {
  user:"xibei",
  database:"crime_map",
  password:"xibei1004",
  port:5432
};
//数据库配置
var conString = "tcp://postgres:zxcvbfds@localhost/postgis"; //tcp://用户名：密码@localhost/数据库名

//client = null;

module.exports = function(app) {
    //app.post('/detect_crime',);
var pool = new pg.Pool(config);
app.post('/detect_crime', urlencodedParser, function(req, res) {
  //get data from the view and save to db
  var curHr = new Date().getHours();
  var tmQry = "(extract(hour from incident_date) < 9 or extract(hour from incident_date) > 21)";
  if (curHr > 9 && curHr < 21) {
    tmQry = "(extract(hour from incident_date) > 9 and extract(hour from incident_date) < 21)";
  }
  //var reqjson = JSON.parse(req.body.index);
  var segments = JSON.parse(req.body.path);
  var qry = "select count(*),st.rnum from "+
  "(select nextval('r') as rnum, geom from (select ST_GeomFromGeoJSON(unnest(ARRAY[";
  /*"select count(*) from (select ST_GeomFromGeoJSON($1)"+
  " as geom) as st, public.aggtotal as agg"+
  " where ST_DWithin(st.geom, agg.latlng, 0.01) is true group by st.geom;";*/
  qry += "'"+segments[0]+"'";
  //console.log("req:"+ segments.length);

  for (var i = 1; i < segments.length; i++) {
    qry += ",'" + segments[i]+"'";

  }
  qry += "])) as geom) as tmp ) as st, public.aggtotal as agg where ST_DWithin(st.geom, agg.latlng, 0.01) is true "+
  " and" + tmQry+"  group by st.rnum;";
  //console.log(qry);
pool.connect(function(err, client, done) {

    if (err) {
    console.log("connect fail"+ err);
    res.json({status:'connect fail'});
    return;
  }
    
	client.query('BEGIN', (err) => {
    //if (shouldAbort(err)) return
    client.query('create temp sequence r', (err, r) => {
      //if (shouldAbort(err)) return

      //const insertPhotoText = 'INSERT INTO photos(user_id, photo_url) VALUES ($1, $2)'
      //const insertPhotoValues = [res.rows[0].id, 's3.bucket.foo']
      client.query(qry, (err, data) => {
        if (err) {res.json({status:'query fail'});return;}

        client.query('COMMIT', (err) => {
          if(err) {
			//console.error('query fail:', err);
			res.json({status:'query fail'});
			return;
		  }
		  done();
		//console.log(data);
		  if (data.rowCount > 0) {
			//console.log("res:"+ data.rows.length);
			myRes = [];
			//console.log(segments.length);
			for (var i = 0; i < segments.length; i++) {
				
				myRes.push({count:0});
			}
			for (var i = 0; i < data.rows.length; i++) {
				//var obj = myRes[row.rnum - 1];
				myRes[data.rows[i].rnum-1].count = data.rows[i].count;
				
			}
			//console.log(data.rows);
			//console.log(myRes);
			res.json({status:'ok', data:myRes, index: req.body.index});
		  }
		  
        })
      })
    })
  })
	
	
	/*
	client.query(qry, function(err, data) {
      done();
      if(err) {
        console.error('query fail:', err);
        res.json({status:'query fail'});
        return;
      }
      //console.log(data);
      if (data.rowCount > 0) {
        //console.log("res:"+ data.rows.length);
        res.json({status:'ok', data:data.rows, index: req.body.index});
      }
    });*/
	
   

  });
});
};
