var express = require("express");
var app = express.Router();
var request = require("request");
var cheerio = require("cheerio");
var mongoose = require("mongoose");

var Article = require("../models/Article.js");
var Note = require("../models/Note.js");

mongoose.Promise = Promise;

app.get('/', function (req, res) {
    res.render('index');
});

app.get('/saved', function (req, res) {
  Article.find({}, function(error, doc) {
    // Log any errors
    if (error) {
      console.log(error);
    }
    // Or send the doc to the browser as a json object
    else {
      var hbsArticleObject = {
        articles: doc
      };

    res.render("saved", hbsArticleObject);
    }
  });
});

// Scrape data from one site and place it into the mongodb db
app.post("/scrape", function(req, res) {
  // First, we grab the body of the html with request
  request("http://www.npr.org/news", function(error, response, html) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(html);
    var scrapedArticles = {};

    // Now, we grab every h2 within an article tag, and do the following:
    $("article").each(function(i, element) {
      // Save an empty result object
      var result = {};
      // Add the text and href of every link, and save them as properties of the result object
      result.headline = $(this).find("h2 a").text();
      result.url = $(this).find("h2 a").attr("href");
      result.summary = $(this).find("p").text();
      // Using our Article model, create a new entry
      // This effectively passes the result object to the entry (and the title and link)
      var entry = new Article(result);

      scrapedArticles[i] = entry;

      // Now, save that entry to the db
      // entry.save(function(err, doc) {
      //   // Log any errors
      //   if (err) {
      //     console.log(err);
      //   }
      //   // Or log the doc
      //   else {
      //     console.log(doc);
      //   }
      // });
    });
  var hbsArticleObject = {
      articles: scrapedArticles
    };
  res.render("index", hbsArticleObject);
  });
  // Tell the browser that we finished scraping the text
  // res.send("Scrape Complete");
});


app.post("/save", function(req, res) {

  console.log("This is the title: " + req.body.headline);

  var newArticleObject = {};

  newArticleObject.headline = req.body.headline;
  newArticleObject.summary = req.body.summary;
  newArticleObject.url = req.body.url;
  var entry = new Article(newArticleObject);

  console.log("We can save the article: " + entry);

  // Now, save that entry to the db
  entry.save(function(err, doc) {
    // Log any errors
    if (err) {
      console.log(err);
    }
    // Or log the doc
    else {
      console.log(doc);
    }
  });

  res.redirect("/saved");

});

app.get("/delete/:id", function(req, res) {

  console.log("ID is getting read for delete" + req.params.id);

  console.log("Able to activate delete function.");

  Article.findOneAndRemove({"_id": req.params.id}, function (err, offer) {
    if (err) {
      console.log("Not able to delete:" + err);
    } else {
      console.log("Able to delete, Yay");
    }
    res.redirect("/saved");
  });
});

app.get("/notes/:id", function(req, res) {

  console.log("ID is getting read for delete" + req.params.id);

  console.log("Able to activate delete function.");

  Note.findOneAndRemove({"_id": req.params.id}, function (err, doc) {
    if (err) {
      console.log("Not able to delete:" + err);
    } else {
      console.log("Able to delete, Yay");
    }
    res.send(doc);
  });
});

// This will grab an article by it's ObjectId
app.get("/articles/:id", function(req, res) {

  console.log("ID is getting read" + req.params.id);

  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  Article.findOne({"_id": req.params.id})

  .populate('note')

  .exec(function(err, doc) {
    if (err) {
      console.log("Not able to find article and get notes.");
    }
    else {
      console.log("We are getting article and maybe notes? " + doc);
      res.json(doc);
    }
  });
});

// Create a new note or replace an existing note
app.post("/articles/:id", function(req, res) {

  // Create a new note and pass the req.body to the entry
  var newNote = new Note(req.body);
  // And save the new note the db
  newNote.save(function(error, doc) {
    // Log any errors
    if (error) {
      console.log(error);
    }
    else {
      // Use the article id to find it and then push note
      Article.findOneAndUpdate({ "_id": req.params.id }, {"note": doc._id},{ returnNewDocument: true })
      .populate('note')

      .exec(function (err, doc) {
        if (err) {
          console.log("Cannot find article.");
        } else {
          // console.log("On note save we are getting notes? "+ doc);
          res.send(doc);
        }
      });
    }
  });
});


module.exports = app;
