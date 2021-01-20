const htmlFiles = require("./htmlFiles");

const { Firestore } = require("@google-cloud/firestore");
const firestore = new Firestore();
const admin = require("firebase-admin");
const functions = require("firebase-functions");
const siteConfig = functions.config();

const collectionName = siteConfig.firestore.collection_name;

module.exports = {
  /**
   * Add url to the collection
   *
   * https://googleapis.dev/nodejs/firestore/latest/CollectionReference.html#add
   *
   * @param {String} longUrl The long url to save.
   *
   * @return {Object} Callback from DB provider.
   */
  addShortUrlDoc: (longUrl) => {
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
            let docId;
            querySnapshot.forEach((documentSnapshot) => {
              docId = documentSnapshot.id;
            });
            resolve({ status: "SUCCESS", docId });
          }
        })
        .catch((error) => {
          reject({ status: "ADD_SHORT_URL_QUERY_ERROR", error });
        });
    });
  },
  /**
   * Get short url from the collection
   *
   * https://googleapis.dev/nodejs/firestore/latest/CollectionReference.html#get
   * https://googleapis.dev/nodejs/firestore/latest/QuerySnapshot.html
   *
   * @param {String} shortUrl The short url to search.
   *
   * @return {String} HTML to send to user.
   */
  getShortUrlDoc: (shortUrl) => {
    return new Promise((resolve) => {
      firestore
        .collection(collectionName)
        .where(admin.firestore.FieldPath.documentId(), "==", shortUrl)
        .limit(1)
        .get()
        .then((querySnapshot) => {
          if (querySnapshot.empty) {
            resolve(htmlFiles.notFoundHtml());
          } else {
            let redirectUrl;
            querySnapshot.forEach((documentSnapshot) => {
              let data = documentSnapshot.data();
              redirectUrl = data.longUrl;
            });
            resolve(htmlFiles.redirectHtml(redirectUrl));
          }
        })
        .catch((error) => {
          console.log(
            JSON.stringify({ status: "GET_SHORT_URL_QUERY_ERROR", error })
          );
          resolve(htmlFiles.notFoundHtml());
        });
    });
  },
};
