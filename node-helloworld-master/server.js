var express = require("express"),
    app = express();
var request = require("request");
var randomColor = require("randomcolor");
var port = process.env.PORT || 8080;
var theMovieDatabaseAPIKey = "86bd3a87e020e36bcbe442507b2c35c3";
var baseUrl = "";
var size = "";
var fileSize = "";
var orders = [];


app.use(express.static(__dirname + '/public'));



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

app.get('/get_food', function(req, res) {
   var foodDict = {};
   foodDict['Hamburger'] = "3.50";
   foodDict['Cheeseburger'] = "4.00";
   foodDict['Hotdog'] = "3.00";
   foodDict['Cheesedog'] = "3.50";
   foodDict['Chilicheesedog'] = "4.00";
   foodDict['smallNachos'] = "3.50";
   foodDict['largeNachos'] = "5.00";
   foodDict['chiliCheeseNachos'] = "5.00";
   foodDict['pickle'] = "1.00";
   foodDict['superPretzel'] = "3.50";
   foodDict['superPretzelWithCheese'] = "4.00";
   res.send(JSON.stringify(foodDict));
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



app.listen(port);
console.log("Listening on port ", port);

require("cf-deployment-tracker-client").track();
