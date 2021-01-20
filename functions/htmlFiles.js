const functions = require("firebase-functions");
const siteConfig = functions.config();

const footer = `</html>`;

module.exports = {
  indexHtml: () => {
    let indexBody = `<body>
    <div class="d-flex justify-content-center align-items-center" id="main">
    <form>
        <div class="form-group">
        <label for="formGroupExampleInput">Example label</label>
        <input type="text" class="form-control" id="formGroupExampleInput" placeholder="Example input">
            <small id="shortLinkExpire" class="form-text text-muted">This short link will expire in 60 days.</small>
        </div>
        <button type="submit" class="btn btn-primary">Submit</button>
    </form>
    </div>
    </body>`;
    return header(`Home - ${siteConfig.site.name}`) + indexBody + footer;
  },
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
      header(`Page Not Found - ${siteConfig.site.name}`) + notFoundBody + footer
    );
  },
  redirectHtml: (redirectUrl) => {
    //https://developers.google.com/analytics/devguides/collection/gtagjs/events
    //https://support.google.com/analytics/answer/7478520?hl=en
    //https://developers.google.com/analytics/devguides/collection/protocol/ga4/reference/events#share
    // Add share events to GA reports: https://support.google.com/analytics/answer/1033068
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
    return redirectHeader(`${siteConfig.site.name}`) + redirectBody + footer;
  },
};

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
