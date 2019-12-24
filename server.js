"use strict";
var bodyParser = require("body-parser");
var express = require("express");
var mongo = require("mongodb");
var mongoose = require("mongoose");
var dns = require("dns");
var cors = require("cors");

var app = express();

// Basic Configuration
var port = process.env.PORT || 3000;

/** this project needs a db !! **/

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here
app.use(bodyParser.urlencoded({ extended: false }));
app.use("/public", express.static(process.cwd() + "/public"));

const shortUrlSchema = new mongoose.Schema({
  url: { type: String, required: true }
});

const ShortURL = mongoose.model("ShortURL", shortUrlSchema);

var createNewShortURL = function(done)
{
  var newURL = new ShortURL({
        url: req.body.url
      });
      console.log(newURL);
      newURL.save(function(err, urlSaved, done) {
        if (err) {
          console.log(err);
        } else {
          console.log(urlSaved);
           done(null,urlSaved);
        }
      });
};

app.get("/", function(req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// your first API endpoint...
app.get("/api/hello", function(req, res) {
  res.json({ greeting: "hello API" });
});

app.post("/api/shorturl/new", function(req, res) {
  dns.lookup(req.body.url, function(err, address) {
    //console.log(err);
    if (err.code !== "ENOTFOUND") {
      res.json({ error: "invalid URL" });
    } else {
      
      ShortURL.findOne({ url: req.body.url }, function(err, urlFound) {
        if (err) {
          console.log("It didn't save the url from earlier");
        } else {
          res.json({ original_url: urlFound.url, short_url: urlFound._id });
        }
      });
    }
  });
});

app.listen(port, function() {
  console.log("Node.js listening ...");
});
