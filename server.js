const express = require('express');
const exphbs  = require('express-handlebars');
const fecha   = require('fecha');

const app = express();

app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.render('index', {
    layout: false,
    timestamp: fecha.format(Date.now(), 'YYYY-MM-DD hh:mm:ss'),
    entries: [
      {
        partial: 'theLastDeck',
        handle: 'thelastdeck',
        title: 'The Pictorial Bot To The Tarot',
      },
    ],
  });
});

// listen for requests :)
const listener = app.listen(process.env.PORT, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});
