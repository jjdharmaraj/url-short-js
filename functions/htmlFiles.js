const functions = require("firebase-functions");
const siteConfig = functions.config();

const footer = `</html>`;

module.exports = {
  /**
   * Homepage.
   *
   * @return {String} HTML to send back to browser.
   */
  indexHtml: () => {
    const regex = /^(?:(?:https?|ftp):\/\/)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/\S*)?$/;
    let indexBody = `<body>
    <div class="d-flex justify-content-center align-items-center" id="main">
      <div class="container">
        <div class="col">
          <form id="url-form" style="margin-bottom: 16px">
            <div class="form-group">
              <label for="formGroupExampleInput">Get a short URL</label>
              <input
                type="text"
                class="form-control"
                id="formGroupExampleInput"
                name="longUrlInput"
                placeholder="Example input"
              />
              <small id="shortLinkExpire" class="form-text text-muted"
                >This short link will expire in 60 days.</small
              >
            </div>
            <button type="submit" class="btn btn-primary">Submit</button>
          </form>
        </div>
        <div class="col" id="shortUrlResult">
          <span style="padding: 8px"></span>
        </div>
      </div>
    </div>
    <script>
      const form = document.querySelector("#url-form");
      let shortUrlResultText = document.querySelector("#shortUrlResult");

      form.addEventListener("submit", (event) => {
        event.preventDefault();

        let longUrl = new FormData(form).get("longUrlInput");

        let validUrl = is_url(longUrl);

        if (validUrl == true) {
          shortUrlResultText.innerHTML =
            '<span class="bg-primary text-white" style="padding: 8px">Working on your short URL...</span>';
          var raw = { longUrl };

          var requestOptions = {
            method: "POST",
            body: JSON.stringify(raw),
            redirect: "follow",
            headers: {
              "Content-Type": "application/json",
            },
          };
          fetch('https://${siteConfig.site.url}/api', requestOptions)
            .then((response) => response.text())
            .then((result) => {
              let data = JSON.parse(result);
              if (data.shortUrl) {
                shortUrlResultText.innerHTML =
                  '<span class="bg-success text-white" style="padding: 8px">' +
                  data.shortUrl +
                  "</span>";
              } else {
                console.log("error", data);
                shortUrlResultText.innerHTML =
                  '<span class="bg-danger text-white" style="padding: 8px">I am sorry, but we ran into an error on our end!</span>';
              }
            })
            .catch((error) => {
              console.log("error", error);
              shortUrlResultText.innerHTML =
                '<span class="bg-danger text-white" style="padding: 8px">I am sorry, but we ran into an error on our end!</span>';
            });
        } else {
          shortUrlResultText.innerHTML =
            '<span class="bg-danger text-white" style="padding: 8px">I am sorry, but that is not a valid URL.</span>';
        }
      });
      function is_url(str) {
        regexp = ${regex};
        if (regexp.test(str)) {
          return true;
        } else {
          return false;
        }
      };
    </script>
  </body>`;

    return header(`Home - ${siteConfig.site.url}`) + indexBody + footer;
  },
  /**
   * 404 page.
   *
   * @return {String} HTML to send back to browser.
   */
  notFoundHtml: () => {
    let notFoundBody = `<link rel="stylesheet" href="/bootstrap.min.css">
    <link rel="stylesheet" href="/style.css">
</head>
<body>
    <div class="d-flex justify-content-center align-items-center" id="main">
    <h1 class="mr-3 pr-3 align-top border-right inline-block align-content-center">404</h1>
    <div class="inline-block align-middle">
    	<h2 class="font-weight-normal lead" id="desc">The page you requested was not found.</h2>
    </div>
</div>
</body>`;
    return (
      header(`Page Not Found - ${siteConfig.site.url}`) + notFoundBody + footer
    );
  },
  /**
   * Webpage to handle redirects.
   *
   * This includes analytics to track which links are popular.
   * https://developers.google.com/analytics/devguides/collection/gtagjs/events
   * https://support.google.com/analytics/answer/7478520?hl=en
   * https://developers.google.com/analytics/devguides/collection/protocol/ga4/reference/events#share
   * Add share events to GA reports: https://support.google.com/analytics/answer/1033068
   *
   * @param {String} redirectUrl URL to redirect to.
   *
   * @return {String} HTML to send back to browser.
   */
  redirectHtml: (redirectUrl) => {
    // TODO: what if there is no analytics setup;
    let redirectBody = `<body onload="measureUrlRedirect('${redirectUrl}')">
    <noscript>I am sorry, but you do not have JavaScript enabled.  Click <a href="${redirectUrl}">here</a> to visit your destination.</noscript>
    <script>
        var measureUrlRedirect = function(url) {
        gtag('event', 'share', {
            'event_category': 'engagement',
            'event_label': url,
            'transport_type': 'beacon',
            'event_callback': function(){document.location = url;},
            'non_interaction': true
        });
        }
      </script>
    </body>`;
    return redirectHeader(`${siteConfig.site.url}`) + redirectBody + footer;
  },
};

/**
 * Creates the header for the webpage.
 *
 * This header is for webpages that do not handle the redirects.
 *
 * @param {String} pageTitle Name of the webpage.
 *
 * @return {String} Header to send back to browser.
 */
function header(pageTitle) {
  const header1 = `<!doctype html>
  <html lang="en">
  <head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <title>${pageTitle}</title>`;
  const styleAndScript = `<link rel="stylesheet" href="/bootstrap.min.css">
<link rel="stylesheet" href="/style.css">`;
  const header2 = `</head>`;
  return header1 + styleAndScript + addAnalytics() + header2;
}
/**
 * Analytics code to add to the header.
 *
 * This analytics code is separate so more providers can be added.
 *
 * @return {String} Analytics to send to code to put into the header.
 */
function addAnalytics() {
  //TODO: should you send Google Analytics server side, disadvantage is not getting certain metrics like device type, etc
  //https://developers.google.com/analytics/devguides/collection/protocol/ga4/sending-events?client_type=gtag#required_parameters
  let analytics = ``;
  const googleanalyticsCode = `<script async src="https://www.googletagmanager.com/gtag/js?id=${siteConfig.google_analytics.measurement_id}"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${siteConfig.google_analytics.measurement_id}');
  </script>`;
  analytics += googleanalyticsCode;
  return analytics;
}
/**
 * Creates header for the redirect webpages.
 *
 * This header should be smaller than normal webpages because it needs to be fast.
 *
 * @param {String} pageTitle Name of the webpage
 *
 * @return {String} Header to send back to browser.
 */
function redirectHeader(pageTitle) {
  const header1 = `<!doctype html>
    <html lang="en">
    <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
      <title>${pageTitle}</title>`;
  const header2 = `</head>`;
  return header1 + addAnalytics() + header2;
}
