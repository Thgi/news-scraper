// https://frozen-plains-24529.herokuapp.com/ | https://git.heroku.com/frozen-plains-24529.git


// Dependencies
var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var exphbs = require("express-handlebars");

//Our objects
var Article = require("./models/Article.js");
var Note = require("./models/Note.js");
// Our scraping tools

var request = require("request");
var cheerio = require("cheerio");

mongoose.Promise = Promise;

var PORT = process.env.PORT || 3000;

// Initialize Express
var app = express();


// Use morgan and body parser with our app
app.use(logger("dev"));
app.use(bodyParser.urlencoded({
  extended: false
}));

// Make public a static dir
app.use(express.static("public"));

// Set Handlebars

app.use(bodyParser.json());
app.use(bodyParser.text());
app.use(bodyParser.json({ type: "application/vnd.api+json" }));



// Set Handlebars.

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Import routes and give the server access to them.
var routes = require("./controllers/scraper_controller.js");

app.use("/", routes);

// Database configuration for mongoose
// For deployment
mongoose.connect("mongodb://heroku_x6351mcr:uo74jneb7pgtevekcni56bm604@ds127994.mlab.com:27994/heroku_x6351mcr");
// For localhost testing
// mongoose.connect("mongodb://localhost/news-scraper");

var db = mongoose.connection;

// Log any mongoose errors
db.on("error", function(error) {
  console.log("Mongoose Error: ", error);
});

// Log a success message when we connect to our mongoDB collection with no issues
db.once("open", function() {
  console.log("Mongoose connection successful.");
});

// Listen on Port 3000
app.listen(PORT, function() {
  console.log("App running on port 3000!");
});
