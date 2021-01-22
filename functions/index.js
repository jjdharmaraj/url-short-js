const functions = require("firebase-functions");
const express = require("express");
const app = express();

const cors = require("cors")({ origin: true });
app.use(cors);

//HTML files to send to the browser.
const htmlFiles = require("./htmlFiles");
//Handles heavy lifting of firestore lookups.
const firestoreFn = require("./firestoreFn");

//Homepage.
app.get("/", (req, res) => {
  res.send(htmlFiles.indexHtml());
});

//Handles all GET requests except for the homepage.
app.get("/:shortUrl", (req, res) => {
  firestoreFn.getShortUrlDoc(req.params.shortUrl).then((html) => {
    res.send(html);
  });
});

//Add more short URLs to firestore.
app.post("/api", (req, res) => {
  checkIncomingUrl(req)
    .then((longUrl) => {
      return firestoreFn
        .addShortUrlDoc(longUrl)
        .then((documentReference) => {
          return res.json(documentReference);
        })
        .catch((error) => {
          return res.json(error);
        });
    })
    .catch((error) => {
      res.json({ status: "INCOMING_DATA_ERROR", error });
    });
});

//Capture 404 errors for methods except for GET which is done above.
app.use(function (req, res, next) {
  res.status(404).send(htmlFiles.notFoundHtml());
});

/**
 * Check if the String is a valid URL.
 *
 * https://www.w3resource.com/javascript-exercises/javascript-regexp-exercise-9.php
 *
 * @param {String} str URL to check.
 *
 * @return {Boolean} Was the input a valid URL or not.
 */
const is_url = (str) => {
  regexp = /^(?:(?:https?|ftp):\/\/)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/\S*)?$/;
  if (regexp.test(str)) {
    return true;
  } else {
    return false;
  }
};
/**
 * Check if the request is valid.
 *
 * @param {Object} req Incoming request.
 *
 * @return {String} Long URL or error if the request was wrong.
 */
const checkIncomingUrl = (req) => {
  return new Promise((resolve, reject) => {
    if (
      req &&
      req.body &&
      req.body.longUrl &&
      typeof req.body.longUrl == "string"
    ) {
      let validUrl = is_url(req.body.longUrl);
      if (validUrl == true) {
        resolve(req.body.longUrl);
      } else {
        reject("NOT_A_VALID_URL");
      }
    } else {
      reject("NOT_A_VALID_INPUT");
    }
  });
};
exports.app = functions.https.onRequest(app);
