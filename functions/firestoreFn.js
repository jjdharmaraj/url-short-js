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
   * If longUrl exists but the vanityUrl is provided, it still gets added.
   *
   * @param {String} longUrl The long url to save.
   * @param {String} vanityUrl Optional; url end point to use instead of something generic
   *
   * @return {Object} Callback from DB provider.
   */
  addShortUrlDoc: (longUrl, vanityUrl) => {
    if (vanityUrl) {
      return getShortUrl(vanityUrl)
        .then((querySnapshot) => {
          if (querySnapshot.empty) {
            //TODO: use set to create a doc with id
            return setShortUrl(longUrl, vanityUrl);
          } else {
            //TODO: return json that the vanity url already exists
            return { status: "VANITY_URL_ALREADY_EXISTS" };
          }
        })
        .catch((error) => {
          return { status: "GET_SHORT_DOC_VANITY_ERROR", error };
        });
    } else {
      return addShortUrl(longUrl);
    }
  },
  /**
   * Get short url from the collection
   *
   * @param {String} shortUrl The short url to search.
   *
   * @return {String} HTML to send to user.
   */
  getShortUrlDoc: (shortUrl) => {
    return getShortUrl(shortUrl)
      .then((querySnapshot) => {
        if (querySnapshot.empty) {
          return htmlFiles.notFoundHtml();
        } else {
          let redirectUrl;
          querySnapshot.forEach((documentSnapshot) => {
            let data = documentSnapshot.data();
            redirectUrl = data.longUrl;
          });
          return htmlFiles.redirectHtml(redirectUrl);
        }
      })
      .catch((error) => {
        console.log(
          JSON.stringify({ status: "GET_SHORT_URL_DOC_ERROR", error })
        );
        return htmlFiles.notFoundHtml();
      });
  },
};
/**
 * Get short url from the collection
 *
 * https://googleapis.dev/nodejs/firestore/latest/CollectionReference.html#get
 * https://googleapis.dev/nodejs/firestore/latest/QuerySnapshot.html
 *
 * @param {String} shortUrl The short url to search.
 *
 * @return {Object} Callback from DB provider.
 */
function getShortUrl(shortUrl) {
  return new Promise((resolve, reject) => {
    firestore
      .collection(collectionName)
      .where(admin.firestore.FieldPath.documentId(), "==", shortUrl)
      .limit(1)
      .get()
      .then((querySnapshot) => {
        resolve(querySnapshot);
      })
      .catch((error) => {
        reject(error);
      });
  });
}
/**
 * Add url to the collection
 *
 * https://googleapis.dev/nodejs/firestore/latest/CollectionReference.html#add
 *
 * @param {String} longUrl The long url to save.
 *
 * @return {Object} Callback from DB provider.
 */
function addShortUrl(longUrl) {
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
              if (documentReference.id) {
                resolve({
                  status: "SUCCESS",
                  shortUrl: `https://${siteConfig.site.url}/${documentReference.id}`,
                });
              } else {
                reject({
                  status: "FIRESTORE_ERROR",
                  error: "DOCUMENT_ID_IS_MISSING_ON_ADD",
                });
              }
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
          //Should I run the docId check again
          resolve({
            status: "SUCCESS",
            shortUrl: `https://${siteConfig.site.url}/${docId}`,
          });
        }
      })
      .catch((error) => {
        reject({ status: "ADD_SHORT_URL_QUERY_ERROR", error });
      });
  });
}
/**
 * Set a long url with a specific vanity docId
 *
 * https://googleapis.dev/nodejs/firestore/latest/DocumentReference.html#set
 * https://firebase.google.com/docs/firestore/manage-data/add-data#set_a_document
 *
 * @param {String} longUrl long url to add
 * @param {String} vanityUrl vanity url to set
 *
 * @return {Object} Short URL or the DB provider error.
 */
function setShortUrl(longUrl, vanityUrl) {
  let data = {
    longUrl,
    addedTime: admin.firestore.FieldValue.serverTimestamp(),
  };
  return new Promise((resolve, reject) => {
    firestore
      .collection(collectionName)
      .doc(vanityUrl)
      .set(data)
      .then(() => {
        resolve({
          status: "SUCCESS",
          shortUrl: `https://${siteConfig.site.url}/${vanityUrl}`,
        });
      })
      .catch((error) => {
        reject({ status: "SET_SHORT_URL_DOC_ERROR", error });
      });
  });
}
