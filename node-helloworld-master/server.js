var express = require("express"),
    app = express();
var request = require("request");
var port = process.env.PORT || 8080;
var theMovieDatabaseAPIKey = "86bd3a87e020e36bcbe442507b2c35c3";

app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
	console.log("hello, everyone"); 
  res.send('Hello World')
})





app.get('/search_movie', function (req, res) {
   var percentEncodedMovieName = req.query.movieName;
   var baseUrl = "https://api.themoviedb.org/3/search/movie?api_key="
               + theMovieDatabaseAPIKey
               + "&language=en-US&query=" + percentEncodedMovieName
               + "&page=1&include_adult=false";

    request(baseUrl, function(error, response, body) {
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




app.put('/new_movie1', function(req, res) {
   movie1 = req.body.name;

   request("")


})




app.listen(port);
console.log("Listening on port ", port);

require("cf-deployment-tracker-client").track();