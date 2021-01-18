const functions = require("firebase-functions");
const express = require("express");
const { json } = require("express");
const app = express();

const cors = require("cors")({ origin: true });
app.use(cors);

const htmlFiles = require("./htmlFiles");

const { Firestore } = require("@google-cloud/firestore");
const firestore = new Firestore();
const admin = require("firebase-admin");

app.get("/", (req, res) => {
  res.send(htmlFiles.indexHtml());
});

app.get("/redirect", (req, res) => {
  let redirectUrl = "https://images.google.com";
  res.send(htmlFiles.redirectHtml(redirectUrl));
});

app.post("/api", (req, res) => {
  let body = req.body;
  addShortUrlDoc(body.longUrl)
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

/**
 * Add url to the goshareme collection
 *
 * https://googleapis.dev/nodejs/firestore/latest/CollectionReference.html#add
 *
 * @return {Object} Callback from DB provider.
 */
function addShortUrlDoc(longUrl) {
  const collectionName = "goshareme";
  let query = firestore
    .collection(collectionName)
    .where("longUrl", "==", longUrl);
  let data = {
    longUrl,
    addedTime: admin.firestore.FieldValue.serverTimestamp(),
  };

  return new Promise((resolve, reject) => {
    query
      .limit(1)
      .get()
      .then((querySnapshot) => {
        if (querySnapshot.empty) {
          firestore
            .collection(collectionName)
            .add(data)
            .then((documentReference) => {
              //https://firebase.google.com/docs/firestore/quotas#collections_documents_and_fields
              resolve({ status: "SUCCESS", docId: documentReference.id });
            })
            .catch((error) => {
              reject({ status: "ADD_SHORT_URL_NEW_DOC_ERROR", error });
            });
        } else {
          //TODO: The longUrl already exists, should we update the addedTime so it doesn't get deleted??
          querySnapshot.forEach((documentSnapshot) => {
            //https://firebase.google.com/docs/firestore/quotas#collections_documents_and_fields
            resolve({ status: "SUCCESS", docId: documentSnapshot.id });
          });
        }
      })
      .catch((error) => {
        reject({ status: "ADD_SHORT_URL_QUERY_ERROR", error });
      });
  });
}
