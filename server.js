const express = require('express');
const exphbs  = require('express-handlebars');
const fecha   = require('fecha');

const getEntries = require('./entries');

const app = express();

app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

app.use(express.static('public'));

app.get('/', (req, res) => {
  getEntries().then((entries) => {
    console.log(entries[0].tweet.entities.media[0].media_url_https)
    res.render('index', {
      layout: false,
      timestamp: fecha.format(Date.now(), 'YYYY-MM-DD hh:mm:ss'),
      entries: entries,
    });
  });
});

// listen for requests :)
const listener = app.listen(process.env.PORT, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});
