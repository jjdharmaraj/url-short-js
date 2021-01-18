const functions = require("firebase-functions");
const express = require("express");
const { json } = require("express");
const app = express();
const cors = require("cors")({ origin: true });
app.use(cors);

app.get("/", (req, res) => {
  const date = new Date();
  const hours = (date.getHours() % 12) + 1; // London is UTC + 1hr;
  res.send(`
      <!doctype html>
      <head>
        <title>Time</title>
        <link rel="stylesheet" href="/style.css">
        <script src="/script.js"></script>
      </head>
      <body>
        <p>In London, the clock strikes:
          <span id="bongs">${"BONG ".repeat(hours)}</span></p>
        <button onClick="refresh(this)">Refresh</button>
      </body>
    </html>`);
});

app.get("/redirect", (req, res) => {
  let redirectUrl = "https://www.google.com";
  res.send(`
    <!doctype html>
    <head>
      <title>goshare.me</title>
    </head>
    <body onload="redirect()">
    <noscript>I am sorry, but you do not have JavaScript enabled.  Click <a href="${redirectUrl}">here</a> to visit your destination.</noscript>
      <script>
        function redirect() {
        location.replace("${redirectUrl}")
        }
      </script>
    </body>
  </html>`);
});

//Capture All 404 errors
app.use(function (req, res, next) {
  res.status(404).send(`Unable to find the requested resource!`);
});

exports.app = functions.https.onRequest(app);
