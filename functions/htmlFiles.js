const header = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
  <title>goshare.me</title>`;
const footer = `</html>`;

module.exports = {
  indexHtml: () => {
    let indexBody = `<link rel="stylesheet" href="bootstrap.min.css">
    <link rel="stylesheet" href="style.css">
        </head>
        <body>
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
    return header + indexBody + footer;
  },
  redirectHtml: (redirectUrl) => {
    let redirectBody = `</head>
    <body onload="redirect()">
<noscript>I am sorry, but you do not have JavaScript enabled.  Click <a href="${redirectUrl}">here</a> to visit your destination.</noscript>
  <script>
    function redirect() {
    location.replace("${redirectUrl}");
    }
  </script>
</body>`;
    return header + redirectBody + footer;
  },
  notFoundHtml: () => {
    let notFoundBody = `<link rel="stylesheet" href="bootstrap.min.css">
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="d-flex justify-content-center align-items-center" id="main">
    <h1 class="mr-3 pr-3 align-top border-right inline-block align-content-center">404</h1>
    <div class="inline-block align-middle">
    	<h2 class="font-weight-normal lead" id="desc">The page you requested was not found.</h2>
    </div>
</div>
</body>`;
    return header + notFoundBody + footer;
  },
};
