'use strict';
const debug = require('debug');
const express = require('express');
const logger = require('morgan');
const bodyParser = require('body-parser');
const cors = require('cors');

const secretStorage = require('./secret-storage.js');
const NoSuchEntity = secretStorage.NoSuchEntity;
const DecryptionError = secretStorage.DecryptionError;

const app = express();

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(cors());
app.set('port', process.env.PORT || 1234);


const server = app.listen(app.get('port'), () => {
    debug('Express server listening on port ' + server.address().port);
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).end();
    next();
});

app.put('/secret', (req, res) => {
    secretStorage.put(req.body.name, req.body.secret, req.body.encryptionKey).then(res.status(201).end());
});

app.get('/secret', (req, res) => {
    return secretStorage.get(req.query.name, req.query.encryptionKey)
        .then(secret => res.json(secret))
        .catch(err => {
            if (err instanceof DecryptionError) res.status(403).send("Decryption key incorrect");
            else if (err instanceof NoSuchEntity) res.status(404).send('No such secret');
            else throw err;
        });
});

app.delete('/secret', (req, res) => {
    secretStorage.delete(req.query.name)
        .then(() => res.end())
        .catch(err => {
            if (err instanceof NoSuchEntity) res.status(404).send("No such secret");
            else throw err;
        });
});

app.get('/secrets', (req, res) => {
    setTimeout(() => secretStorage.list(req.query.encryptionKey)
        .then(result => res.json(result))
        .catch(err => {
            if (err instanceof DecryptionError) res.status(403).send("Decryption key incorrect");
            else throw err;
        }), 1000);
});