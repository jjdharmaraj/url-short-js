const functions = require("firebase-functions");
const express = require("express");
const { json } = require("express");
const app = express();
const cors = require("cors")({ origin: true });
app.use(cors);

const htmlFiles = require("./htmlFiles");

app.get("/", (req, res) => {
  res.send(htmlFiles.indexHtml());
});

app.get("/redirect", (req, res) => {
  let redirectUrl = "https://images.google.com";
  res.send(htmlFiles.redirectHtml(redirectUrl));
});

//Capture All 404 errors
app.use(function (req, res, next) {
  res.status(404).send(htmlFiles.notFoundHtml());
});

exports.app = functions.https.onRequest(app);
