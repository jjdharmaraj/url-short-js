const functions = require("firebase-functions");
const express = require("express");
const { json } = require("express");
const app = express();

const cors = require("cors")({ origin: true });
app.use(cors);

const htmlFiles = require("./htmlFiles");
const firestoreFn = require("./firestoreFn");

app.get("/", (req, res) => {
  res.send(htmlFiles.indexHtml());
});

app.get("/:shortUrl", (req, res) => {
  firestoreFn.getShortUrlDoc(req.params.shortUrl).then((html) => {
    res.send(html);
  });
});

app.post("/api", (req, res) => {
  let body = req.body;
  firestoreFn
    .addShortUrlDoc(body.longUrl)
    .then((documentReference) => res.json(documentReference))
    .catch((error) => {
      res.json(error);
    });
});

//Capture All 404 errors
app.use(function (req, res, next) {
  res.status(404).send(htmlFiles.notFoundHtml());
});

exports.app = functions.https.onRequest(app);
