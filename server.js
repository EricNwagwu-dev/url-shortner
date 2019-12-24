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

var createNewUrl = function(url) {
  var newURL = new ShortURL({
    url: url
  });
  console.log("This the new url object that was created: " + newURL);
  newURL.save(function(err, urlSaved) {
    if (err) {
      console.log(err);
    } else {
      console.log(
        "This is the url object that was saved to the database: " + urlSaved
      );
      return findUrlGivenString(url);
    }
  });
};

var findUrlGivenString = function(url) {
  ShortURL.findOne({ url: url }, function(err, urlFound) {
    if (err) {
      console.log("It didn't save the url from earlier");
    } else {
      console.log(
        "We searched for the url in the database and found this object: " +
          urlFound
      );
      if (urlFound !== null) {
        return { original_url: urlFound.url, short_url: urlFound._id };
      }
    }
  });
};

app.get("/", function(req, res) {
  console.log(mongoose.connection.readyState);
  res.sendFile(process.cwd() + "/views/index.html");
});

// your first API endpoint...
app.get("/api/hello", function(req, res) {
  res.json({ greeting: "hello API" });
});

app.post("/api/shorturl/new", function(req, res) {
  let validateUrl = req.body.url.split(":");
  console.log(validateUrl);
  let check = false;
  if (
    validateUrl.length == 2 &&
    (validateUrl[0].toLowerCase() === "https" ||
      validateUrl[0].toLowerCase() === "http")
  ) {
    dns.lookup(validateUrl[1], (err, add, fam) => {
      if (add != null) {
        check = true;
      }
      console.log(err, add, fam);
    });
    if (check) {
      res.send("work in progress");
      /*
            //find in database
            if(found)
            {
                //retrieve and find json
            }
            else
            {
                //create new unique key
                //store new object in database
                //return json
            }
            */
    } else {
      res.json({ error: "invalid URL" });
    }
  } else {
    res.json({ error: "invalid URL" });
  }
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
