# URL Shortening

This project helps you deploy a URL shortening service using Node JS, Firebase, and Postman to help get code snippets to integrate into larger projects. If you build something and no one knows about it, then does it really exist ;)

## Setup

1. Clone this repo and setup firebase with `firebase init` selecting: hosting, functions, and firestore. You might need to select the "Blaze - Pay as you go" plan to get everything to work from the web console: https://console.firebase.google.com/
2. Setup Google Analytics and obtain the `measurement_id` which will have a format such as "G-01234XXXXX" for the next step. Also setting up the "share" event in your reports right now is helpful but not completely necessary since it should show up eventually automatically: https://support.google.com/analytics/answer/1033068
3. Now let's do some environment configuration. `site.url` should be whatever your short URL is which could just be the URL that firebase gives your project for now. `firestore.collection_name` can be whatever you want to call it so that if you want to use the same Firestore database for multiple projects, that is completely fine.

```
firebase functions:config:set google_analytics.measurement_id="REPLACE_ME" site.url="REPLACE_ME" firestore.collection_name="REPLACE_ME"
```

Use `firebase functions:config:get` if you want to check your work.

4. Now it's time to deploy `firebase deploy --only "functions,hosting"`.

5. That's it!! If you would like to actually setup a custom domain for your URL shortening service, visit: https://firebase.google.com/docs/hosting/custom-domain

## Helpful Links

1. https://firebase.google.com/docs/hosting/functions
2. https://firebase.google.com/docs/functions/config-env
3. https://getbootstrap.com/docs/4.2/components/forms/
4. https://bootsnipp.com/snippets/qr73D
