# Angular JS Events App
![Angular JS Events App](https://cosmicjs.imgix.net/6ce43dc0-36b4-11e7-8843-0d734648413f-angular-events-app.png)
### [View a demo here](https://cosmicjs.com/apps/events-app)
[Sign up for Cosmic JS](https://cosmicjs.com/) to start managing content for your websites and applications faster and easier.
### Get Started
After setting up your bucket on Cosmic JS, edit the config.js file and edit the slug to point to the slug of your bucket:


```javascript
// config.js
app.constant('BUCKET_SLUG', 'your-bucket-slug');
app.constant('URL', 'https://api.cosmicjs.com/v1/');
app.constant('MEDIA_URL', 'https://api.cosmicjs.com/v1/your-bucket-slug/media');
app.constant('READ_KEY', 'read-key');
app.constant('WRITE_KEY', 'write-key');
app.constant('DEFAULT_EVENT_IMAGE', 'url-image');
```


#### Running server:
```
npm install
npm start
```


#### Building Events App:
```
gulp
```
Then go to [http://localhost:3000](http://localhost:3000)


