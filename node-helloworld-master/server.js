var express = require("express"),
    app = express();
app.use (function(req, res, next) {
    var data='';
    req.setEncoding('utf8');
    req.on('data', function(chunk) {
       data += chunk;
    });

    req.on('end', function() {
        req.body = data;
        next();
    });
});
var request = require("request");
var randomColor = require("randomcolor");
var port = process.env.PORT || 8080;
var theMovieDatabaseAPIKey = "86bd3a87e020e36bcbe442507b2c35c3";
var baseUrl = "";
var size = "";
var fileSize = "";
var orders = [];
var concessionList = [];

app.use(express.static(__dirname + '/public'));
app.enable('trust proxy');



//configue the movie DB
request("https://api.themoviedb.org/3/configuration?api_key=86bd3a87e020e36bcbe442507b2c35c3", function (error, response, body) {

    if (error != null) {
        console.log(error);
    }
    var resDict = JSON.parse(body);
    baseUrl = resDict['images']['base_url'] + "original";
});

app.get('/get_orders', function(req, res){
    res.send(JSON.stringify(orders));
});

//to use on incoming orders table so that we don't have to filter through such a large json string client side
app.get('/get_recent_orders', function(req, res) {
  //orders within the last two days
  var d = new Date();
  d.setDate(d.getDate()-2);

  var recentOrders = orders.filter(function (e) {
    return e.orderTime > d;
  });

  res.send(JSON.stringify(recentOrders));
});

app.get('/search_movie', function (req, res) {
   var percentEncodedMovieName = req.query.movieName;
   var url = "https://api.themoviedb.org/3/search/movie?api_key="
               + theMovieDatabaseAPIKey
               + "&language=en-US&query=" + percentEncodedMovieName
               + "&page=1&include_adult=false";

    request(url, function(error, response, body) {
        res.send(body);
    });
})

app.get('/get_concessions', function(req, res) {
   res.send(JSON.stringify(concessionList));
})

app.put('/add_concession', function(req, res) {
  item = JSON.parse(req.body);
  var name = item.name;
  var price = item.price;
  var type = item.type;

  concessionDict = {};
  concessionDict['name'] = name;
  concessionDict['price'] = price;
  concessionDict['type'] = type;

  concessionList.push(concessionDict);
  res.end('{"status" : 200}');
})

app.put('/delete_concession', function(req, res) {

  item = JSON.parse(req.body);
  var name = item.name;
  var price = item.price;
  var type = item.type;

  var index = 0;
  for(var i = 0; i < concessionList.length; i++) {
    if(concessionList[i].name == name && concessionList[i].price == price && concessionList[i].type == type) {
      break;
    }
    index++;
  }
  concessionList.splice(index, 1);

  res.end('{"status" : 200}');
})

app.get('/get_movies', function(req, res) {
    var movies = {};
    var screen1 = {};
    var screen2 = {};

    //can be pulled from database, but just hard coded right now
    var sOneMovieOne = {};
    sOneMovieOne['name'] = "IT";
    sOneMovieOne['rating'] = "R";
    sOneMovieOne['startTime'] = "7:30 PM";
    sOneMovieOne['imgPath'] = baseUrl + '/tcheoA2nPATCm2vvXw2hVQoaEFD.jpg';


    var sOneMovieTwo = {};
    sOneMovieTwo['name'] = "The Dark Tower";
    sOneMovieTwo['rating'] = "PG-13";
    sOneMovieTwo['startTime'] = "9:50 PM";
    sOneMovieTwo['imgPath'] = baseUrl + '/i9GUSgddIqrroubiLsvvMRYyRy0.jpg';

    screen1['movieOne'] = sOneMovieOne;
    screen1['movieTwo'] = sOneMovieTwo;


    var sTwoMovieOne = {};
    sTwoMovieOne['name'] = "Nut Job";
    sTwoMovieOne['rating'] = "PG";
    sTwoMovieOne['startTime'] = "7:00 PM";
    sTwoMovieOne['imgPath'] = baseUrl + "/xOfdQHNF9TlrdujyAjiKfUhxSXy.jpg";

    var sTwoMovieTwo = {};
    sTwoMovieTwo['name'] = "Baby Driver";
    sTwoMovieTwo['rating'] = "R";
    sTwoMovieTwo['startTime'] = "9:50 PM";
    sTwoMovieTwo['imgPath'] = baseUrl + "/dN9LbVNNZFITwfaRjl4tmwGWkRg.jpg";

    screen2['movieOne'] = sTwoMovieOne;
    screen2['movieTwo'] = sTwoMovieTwo;

    movies['screenOne'] = screen1;
    movies['screenTwo'] = screen2;
    res.send(JSON.stringify(movies));
})

app.put('/set_movies', function (req, res) {
    console.log(req);
    res.send("It's working, I just have to format it now. -Grant");
})

app.put('/order', function (req, res) {


    var screenNo = req.query.screenNo;
    var orderNo = req.query.orderNo;
    var carMake = req.query.carMake;
    var carModel = req.query.carModel;
    var carColor = req.query.carColor;
    var orderTime = new Date();
    var cashOrCard = req.query.cashOrCard;
    var orderItems = req.query.orderItems;
    var extras = req.query.extras;
    var cost = req.query.cost;
    var displayNo;
    var isCompleted = false;

    orderNo = orderTime.getTime();

    orderDict = {};
    orderDict['screenNo'] = screenNo;
    orderDict['orderNo'] = orderNo;
    orderDict['carMake'] = carMake;
    orderDict['carModel'] = carModel;
    orderDict['carColor'] = carColor;
    orderDict['orderTime'] = orderTime;
    orderDict['cashOrCard'] = cashOrCard;
    orderDict['extras'] = extras;
    orderDict['orderItems'] = orderItems;
    orderDict['cost'] = cost;
    orderDict['displayNo'] =  orderNo.toString().substr(orderNo.toString().length - 4);;
    orderDict['isCompleted'] = isCompleted;

    orders.push(orderDict);


    returnDict = {};
    returnDict['orderNumber'] = orderNo;
    returnDict['orderColor'] = randomColor();
    returnDict['displayNumber'] = orderNo.toString().substr(orderNo.toString().length - 4);



    res.send(JSON.stringify(returnDict));
});

//change order status to complete once an order is done
app.put('/complete_order', function(req, res) {
    item = JSON.parse(req.body);

    var orderNo = item.orderNo;
    for(i = 0; i < orders.length; i++) {
      if(orders[i].orderNo = orderNo) {
        orders[i].isCompleted = true;
        break;
      }
    }
    res.end('{"status" : 200}');
})

app.listen(port);
console.log("Listening on port ", port);

require("cf-deployment-tracker-client").track();
