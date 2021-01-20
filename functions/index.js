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
  let body = req.body;
  firestoreFn
    .addShortUrlDoc(body.longUrl)
    .then((documentReference) => res.json(documentReference))
    .catch((error) => {
      res.json(error);
    });
});

//Capture 404 errors for methods except for GET which is done above.
app.use(function (req, res, next) {
  res.status(404).send(htmlFiles.notFoundHtml());
});

exports.app = functions.https.onRequest(app);
