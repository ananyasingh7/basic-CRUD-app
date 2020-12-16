const express = require('express');
const bodyParser= require('body-parser')
const app = express();
const MongoClient = require('mongodb').MongoClient;
const connection = require('./hidden.js')

const PORT  = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));

/*
app.get('/', (req,res)=>{
    res.sendFile(__dirname + '/index.html');
});
*/

MongoClient.connect(connection, 
    {useUnifiedTopology: true},
    (err, client) => {
    if (err) return console.error(err);
    console.log('Connected to Database');
    const db = client.db('the-office');
    const quotesCollection = db.collection('quotes');
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(express.static('public'));
    app.set('view engine', 'ejs')
    app.use(bodyParser.json());
    app.post('/quotes',(req,res)=>{
        quotesCollection.insertOne(req.body)
        .then(result => {
            res.redirect('/');
        })
        .catch(error =>console.log(error));
    });
    app.get('/', (req, res) => {
        db.collection('quotes').find().toArray()
          .then(results => {
            res.render('index.ejs', { quotes: results })
          })
          .catch(error => console.error(error));
    })
    app.put('/quotes', (req, res) => {
        quotesCollection.findOneAndUpdate(
            { name:'Michael Scott' },
            {
                $set: {
                    name: req.body.name,
                    quote: req.body.quote
                }
            },
            { upsert: true }
        ).then(result => {
            res.json('Success');
        })
        .catch(error => console.error(error));
    });
    app.delete('/quotes', (req,res)=>{
        quotesCollection.deleteOne(
            { name : req.body.name  },
        ).then(result => {
            if (result.deletedCount === 0) {
              return res.json('No quote to delete')
            }
            res.json(`Deleted Dwights's quote`)
        })
        .catch(error => console.error(error))
    });
})
