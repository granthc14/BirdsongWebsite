var express = require("express"),
    app = express();
var nodemailer = require('nodemailer');
var json2csv = require('json2csv');
var writeFile = require('write');
var fs = require('fs')
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

var movieOneScreenOne = null;
var movieTwoScreenOne = null;
var movieOneScreenTwo = null;
var movieTwoScreenTwo = null;
var comingSoonDict = null;

//default concession items in case the app crashes since there is no db
//food
concessionList.push({name:"Hamburger", price: 3.50, type: "food", hasCondiments: true, amount: 0, itemsWithCondiments: []});
concessionList.push({name:"Cheeseburger", price: 4.00, type: "food", hasCondiments: true, amount: 0, itemsWithCondiments: []});
concessionList.push({name:"Hot Dog", price: 3.00, type: "food", hasCondiments: false, amount: 0});
concessionList.push({name:"Cheese Dog", price: 3.50, type: "food", hasCondiments: false, amount: 0});
concessionList.push({name:"Chili-Cheese Dog", price: 4.00, type: "food", hasCondiments: false, amount: 0});
concessionList.push({name:"Small Nachos", price: 3.00, type: "food", hasCondiments: false, amount: 0});
concessionList.push({name:"Large Nachos", price: 5.00, type: "food", hasCondiments: false, amount: 0});
concessionList.push({name:"Chili-Cheese Nachos", price: 5.00, type: "food", hasCondiments: false, amount: 0});
concessionList.push({name:"Pickle", price: 1.00, type: "food", hasCondiments: false, amount: 0});
concessionList.push({name:"Super Pretzel", price: 3.00, type: "food", hasCondiments: false, amount: 0});
concessionList.push({name:"Super Pretzel with Cheese", price: 3.50, type: "food", hasCondiments: false, amount: 0});
//drinks
concessionList.push({name:"Small Drink", price: 2.00, type: "drink", hasCondiments: true, amount: 0, itemsWithCondiments: []});
concessionList.push({name:"Medium Drink", price: 3.00, type: "drink", hasCondiments: true, amount: 0, itemsWithCondiments: []});
concessionList.push({name:"Large Drink", price: 4.00, type: "drink", hasCondiments: true, amount: 0, itemsWithCondiments: []});
concessionList.push({name:"Dasani Bottled Water", price: 2.00, type: "drink", hasCondiments: false, amount: 0});
concessionList.push({name:"Yoo-Hoo", price: 2.00, type: "drink", hasCondiments: false, amount: 0});
concessionList.push({name:"Monster Energy", price: 3.00, type: "drink", hasCondiments: false, amount: 0});
//candy
concessionList.push({name:"Cotton Candy", price: 3.00, type: "candy", hasCondiments: false, amount: 0});
concessionList.push({name:"Dippin' Dots", price: 3.50, type: "candy", hasCondiments: false, amount: 0});
//popcorn
concessionList.push({name:"Small Popcorn", price: 3.00, type: "popcorn", hasCondiments: false, amount: 0});
concessionList.push({name:"Medium Popcorn", price: 4.00, type: "popcorn", hasCondiments: false, amount: 0});
concessionList.push({name:"Large Popcorn", price: 5.00, type: "popcorn", hasCondiments: false, amount: 0});
concessionList.push({name:"Jumbo Collectors Bucket Popcorn", price: 7.00, type: "popcorn", hasCondiments: false, amount: 0});


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
});

app.get('/get_concessions', function(req, res) {
   res.send(JSON.stringify(concessionList));
})

app.put('/add_concession', function(req, res) {
  item = JSON.parse(req.body);

  var name = item.name;
  var type = item.type;
  var price = item.price;
  concessionDict = {};
  concessionDict['name'] = name;
  concessionDict['type'] = type;
  concessionDict['price'] = price;

  if (type == "combo") {
    var totalItems = item.totalItems;
    var itemCount = item.itemCount;
    var discount = item.discount;
    var items = item.items;

    concessionDict['totalItems'] = totalItems;
    concessionDict['itemCount'] = itemCount;
    concessionDict['discount'] = discount;
    concessionDict['items'] = items;
  }

  else {
    var amount = 0;
    var hasCondiments = item.hasCondiments;

    concessionDict['amount'] = amount;
    concessionDict['hasCondiments'] = hasCondiments;
  }

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

    var CS = {};
    CS['name'] = "Baby Driver";
    CS['rating'] = "R";
    CS['startTime'] = "9:50 PM";
    CS['imgPath'] = baseUrl + "/dN9LbVNNZFITwfaRjl4tmwGWkRg.jpg";




    if (movieOneScreenOne != null) {
        sOneMovieOne = movieOneScreenOne;
        sOneMovieOne['imgPath'] = baseUrl + movieOneScreenOne["imgPath"];
        screen1['movieOne'] = sOneMovieOne;
    }
    if (movieTwoScreenOne != null) {
        screen1['movieTwo'] = movieTwoScreenOne;
    }
    if (movieOneScreenTwo != null) {
        screen2['movieOne'] = movieOneScreenTwo;
    }
    if (movieTwoScreenTwo != null) {
        screen2['movieTwo'] = movieTwoScreenTwo;
    }
    if (comingSoonDict != null) {
        CS['name'] = comingSoonDict['name'];
        CS['rating'] = comingSoonDict['rating'];
        CS['startTime'] = comingSoonDict['startTime'];
        CS['imdbLink'] = comingSoonDict['imdbLink'];
        CS['imgPath'] = baseUrl + comingSoonDict['imgPath'];
    }


    movies['screenOne'] = screen1;
    movies['screenTwo'] = screen2;
    movies['comingSoon'] = CS;

    res.send(JSON.stringify(movies));
})

app.put('/set_movies', function (req, res) {
   var movieDict = JSON.parse(req.body);
   if (movieDict['screen'] == "Screen One Movie One") {
       movieOneScreenOne = movieDict;
   }
   else if(movieDict['screen'] == "Screen One Movie Two") {
       movieTwoScreenOne = movieDict;
   }
   else if(movieDict['screen'] == "Screen Two Movie One") {
       movieOneScreenTwo = movieDict;
   }
   else if(movieDict['screen'] == "Screen Two Movie Two") {
       movieTwoScreenTwo = movieDict;
   }
   else if (movieDict['screen'] == "Coming Soon") {
       comingSoonDict = movieDict;
   }
    res.send("It's working, I just have to format it now. -Grant");
});

app.put('/order', function (req, res) {
    var screenNo = req.query.screenNo;
    var orderNo = req.query.orderNo;
    var carMake = req.query.carMake;
    var carModel = req.query.carModel;
    var carColor = req.query.carColor;
    var email = req.query.email;
    var orderTime = new Date();
    var cashOrCard = req.query.cashOrCard;
    var orderItems = req.query.orderItems;
    var extras = req.query.extras;
    var cost = req.query.cost;
    var displayNo;
    var isCompleted = false;

    console.log("Extras: " + JSON.parse(extras)["email"]);

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
    orderDict['email'] = email;
    orderDict['orderItems'] = orderItems;
    orderDict['cost'] = cost;
    orderDict['displayNo'] =  orderNo.toString().substr(orderNo.toString().length - 4);;
    orderDict['isCompleted'] = isCompleted;

    var fields = ['screenNo', 'orderNo', 'carMake', 'carModel', 'carColor', 'orderTime', 'cashOrCard', 'extras', 'email', 'orderItems', 'cost', 'displayNo', 'isCompleted'];
    var csv = json2csv({data: orderDict, fields:fields})

    fs.appendFile('orders.csv', csv, function(err) {
        if (err) throw err;
        console.log('file saved');
    });


    orders.push(orderDict);

    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'birdsongOrders@gmail.com',
            pass: 'Birdsong2017'
        }
    });


    var mailOptions = {
        from: 'birdsongorders@gmail.com',
        to: JSON.parse(extras)["email"].toString(),
        subject: 'Order received. Do not reply',
        text: 'Your order has been received and will be delivered to you shortly.\nPlease do not close the app or go back from the number screen until you receive your food! \nThanks, and enjoy the show!'
    };

    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });



    returnDict = {};
    returnDict['orderNumber'] = orderNo;
    returnDict['orderColor'] = randomColor();
    returnDict['displayNumber'] = orderNo.toString().substr(orderNo.toString().length - 4);



    res.send(JSON.stringify(returnDict));
});

//change order status to complete once an order is done
app.put('/complete_order', function(req, res) {
    item = JSON.parse(req.body);

    console.log(item)

    if(item["email"] != null) {
        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'birdsongOrders@gmail.com',
                pass: 'Birdsong2017'
            }
        });


        var mailOptions = {
            from: 'birdsongorders@gmail.com',
            to: item["email"],
            subject: 'Your Order is being delivered!. Do not reply',
            text: 'Your order is on the way!\nPlease place you phone open to the screen with your number on it on your dashboard. \nThanks, and enjoy the show!'
        };

        transporter.sendMail(mailOptions, function(error, info){
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });
    }

    var orderNo = item.orderNo;
    for(i = 0; i < orders.length; i++) {
      if(orders[i].orderNo == orderNo) {
        orders[i].isCompleted = true;
        break;
      }
    }
    res.end('{"status" : 200}');
})

app.listen(port);
console.log("Listening on port ", port);

require("cf-deployment-tracker-client").track();
