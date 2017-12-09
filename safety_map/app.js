var express = require('express');//cotrol the route
var routeController = require('./controllers/routeController');
var bodyParser = require('body-parser');
var app = express();
var favicon = require('serve-favicon');
var urlencodedParser = bodyParser.urlencoded({extended: false});
//set up template engine
app.set('view engine', 'ejs');//control the view template using ejs

//static files
app.use(express.static('./public'));
app.use(favicon(__dirname + '/public/favicon.ico'));

//fire controllers
routeController(app);

app.get('/',function(req, res) {
  res.render('map');
});

app.get('/route', function(req, res) {
  res.render('map_routing_test');
});

app.get('/intro', function(req, res){
  res.render('intro');
});

app.get('/contact',function(req, res) {
  res.render('contact', {qs:req.query});
});

app.post('/contact',urlencodedParser, function(req, res) {
  console.log(req.body);
  res.render('contact-success', {data: req.body});
});

app.get('/profile/:name', function(req, res) {
  var data = {age: 29, job: 'ninja', hobbies:['eating','fighting','fishing']};
  res.render('profile', {person: req.params.name, data: data});//{req.params.id}`);
});
//install  ejs later back home
//app.post('route',fn);
//app.delete('route',fn);


app.listen(3000);
