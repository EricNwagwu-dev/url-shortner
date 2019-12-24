"use strict";
var bodyParser = require("body-parser");
var express = require("express");
var mongo = require("mongodb");
var mongoose = require("mongoose");
var dns = require("dns");
var cors = require("cors");
var crypto = require("crypto-js");
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
  url: { type: String, required: true },
  code: { type: String, required: true }
});

const ShortURL = mongoose.model("ShortURL", shortUrlSchema);

var createNewUrl = function(url) {};

var findUrlGivenString = function(url) {};

app.get("/", function(req, res) {
  console.log(mongoose.connection.readyState);
  res.sendFile(process.cwd() + "/views/index.html");
});

// your first API endpoint...
app.get("/api/hello", function(req, res) {
  res.json({ greeting: "hello API" });
});

app.post("/api/shorturl/new", function(req, res) {
  let validateUrl = req.body.url.split("://");
  console.log(validateUrl);
  let check = false;
  if (
    validateUrl.length == 2 &&
    (validateUrl[0].toLowerCase() === "https" ||
      validateUrl[0].toLowerCase() === "http")
  ) {
    dns.lookup(validateUrl[1], (err, add, fam) => {
      if (err === null) {
        ShortURL.findOne({ url: req.body.url }, function(err, urlFound) {
          if (err) {
            console.log("Error loading database");
          } else {
            if (urlFound !== null) {
              res.json({
                original_url: urlFound.url,
                short_url: urlFound.code
              });
            } else {
              var newURL = new ShortURL({
                url: req.body.url,
                code: crypto.SHA256(req.body.url)
              });
              newURL.save(function(err, urlSaved) {
                if (err) {
                  console.log(err);
                } else {
                  res.json({
                    original_url: urlSaved.url,
                    short_url: urlSaved.code
                  });
                }
              });
            }
          }
        });
      } else {
        res.json({ error: "invalid URL" });
      }
    });
  } else {
    res.json({ error: "invalid URL" });
  }
});

app.get("/api/shorturl/:short_url_code", function(req, res) {
  ShortURL.findOne({ code: req.params.short_url_code }, function(
    err,
    urlFound
  ) {
    if (err) {
      console.log("error loading database: " + err);
      res.send("Url not found error");
    } else if (urlFound != null) {
      res.redirect(urlFound.original_url);
    } else {
      console.log(urlFound, req.params.short_url_code);
      res.send("Url not found unknown");
    }
  });
});
/*dns.lookup(req.body.url, function(err, address) {
    //console.log(err);
    if (err.code !== "ENOTFOUND") {
      res.json({ error: "invalid URL" });
    } else {
      createNewUrl(req.body.url);
      ShortURL.findOne({ url: req.body.url }, function(err, urlFound) {
        if (err) {
          console.log("It didn't save the url from earlier");
        } else {
          console.log(urlFound);
          res.json({ original_url: urlFound.url, short_url: urlFound._id });
        }*/

//});

app.listen(port, function() {
  console.log("Node.js listening ...");
});
