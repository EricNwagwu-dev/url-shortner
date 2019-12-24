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
  shortCode: { type: Number, required: true, unique: true },
  url: { type: String, required: true }
});

const ShortURL = mongoose.model("ShortURL", shortUrlSchema);

var createNewURL = function(url, done) {
  var genShortCode = ShortURL.find().length + 1;
  var newURL = new ShortURL({
    shortCode: getShortCode,
    url: url
  });
  newURL.save(function(err, urlSaved) {
    if (err) {
      console.log(err);
    } else {
      console.log(urlSaved);
      done(null, urlSaved);
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
  dns.lookup(req.body.url, function(err, address){
    if(err.code ==="ENOTFOUND")
      {
        console.log(err.code);
        console.log(req.body.url);
        res.json({"error": "invalid URL"});
      }
  });
});

app.listen(port, function() {
  console.log("Node.js listening ...");
});
