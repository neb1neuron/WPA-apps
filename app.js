const bodyParser = require('body-parser');
const express = require('express');
const app = express();
const port = 5000;

// We want to use JSON to send post request to our application
app.use(bodyParser.json());

// We tell express to serve the folder public as static content
app.use(express.static('website'));

app.get('/website');

app.use((req, res, next) => {
    res.status(404).redirect('/');
});

app.listen(port, () => console.log(`Listening on port ${port}!`));