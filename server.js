var express = require("express");
var mongoose = require("mongoose");
var logger = require("morgan");
var axios = require("axios");
var cheerio = require("cheerio");
var db = require("./models");

var PORT = process.env.PORT || 3000;

var app = express();

app.use(logger("dev"));

app.use(express.urlencoded({
  extended: true
}));
app.use(express.json());
app.use(express.static("public"));

var exphbs = require("express-handlebars");

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/articleScrape";

//Routes
app.get("/", function(req, res) {
  res.render("index");
});

app.get("/scrape", function (req, res) {
  axios.get("https://phys.org/space-news/").then(function (response) {
    var $ = cheerio.load(response.data);

    $("article.sorted-article").each(function (i, element) {
      var result = {};

      result.photoUrl = $(this)
      .children("div.d-flex")
      .children("figure")
      .children("a")
      .children("img")
      .attr("src");

      console.log("photoUrl: " + result.photoUrl);

      console.log("                                 ");
      console.log("=================================");
      console.log();

      result.title = $(this)
      .children("div.d-flex")
      .children("div.sorted-article-content")
      .children("h3")
      .children("a")
      .text();

      console.log("title: " + result.title);

      console.log("                                 ");
      console.log("=================================");
      console.log("                                 ");

      result.description = $(this)
      .children("div.d-flex")
      .children("div.sorted-article-content")
      .children("p")
      .text();

      console.log("description: " + result.description.trim());

      console.log("                                 ");
      console.log("=================================");
      console.log();

      result.url = $(this)
      .children("div.d-flex")
      .children("figure")
      .children("a")
      .attr("href");

      console.log("url: " + result.url);

      console.log("                                 ");
      console.log("=================================");
      console.log();

      db.Article.create(result)
        .then(function (dbArticle) {
          console.log(dbArticle);
        })
        .catch(function (err) {
          console.log(err);
        });
    });

    res.send("Scraped");
  });
});

app.get("/articles", function (req, res) {
  db.Article.find({})
    .then(function (dbArticle) {
      res.json(dbArticle);
    })
    .catch(function (err) {
      res.json(err);
    });
});

app.get("/articles/:id", function(req, res) {
  db.Article.findOne({ _id: req.params.id })
    .populate("comment")
    .then(function(dbArticle) {
      //console.log(dbArticle)
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

app.post("/articles/:id", function(req, res) {
  db.Comment.create(req.body)
    .then(function(dbComment) {
      console.log(dbComment);
      return db.Article.findOneAndUpdate({ _id: req.params.id }, { comment: dbComment._id }, { new: true });

    })
    .then(function(dbArticle) {
      console.log(dbArticle);
      res.json(dbArticle);
    })

    .catch(function(err) {
      res.json(err);
    });
});

app.put("/articles/:id", function(req, res) {
  db.Article.findOneAndUpdate({_id: req.params.id}, {comment: req.params.body})
    .then(function(dbArticle) {
      console.log(dbArticle);
      res.json(dbArticle);
    })

    .catch(function(err) {
      res.json(err);
    });
});


mongoose.connect(MONGODB_URI);

app.listen(PORT, function () {
  console.log("App running on port " + PORT);
});