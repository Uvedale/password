const nosql = require('nosql');
const uuid = require('uuid/v4');

const Storage = require('./storage.js');
const NoSuchEntity = Storage.NoSuchEntity;
exports.NoSuchEntity = NoSuchEntity;

const crypto = require('./crypto.js');
exports.DecryptionError = crypto.DecryptionError;

const secretIndex = nosql.load('./secretIndex.db.json');

exports.put = (name, secret, encryptionKey) => {
    // Hacky way to make sure this is a put
    return removeIndexRecord(name)
        .catch(err => {
            if (!(err instanceof NoSuchEntity)) throw err;
        })
        .then(() => generateNewRecord(name, secret, encryptionKey))
        .then(record => secretIndex.insert(record));
};

exports.get = (name, encryptionKey) => {
    return getIndexRecord(name).then(indexRecord => {
        if (indexRecord == undefined) throw new NoSuchEntity();
        else return indexRecord.secret;
    })
    .then(data => crypto.decrypt(encryptionKey, data.toString()));
};

exports.delete = (name) => {
    return getIndexRecord(name).then(record => {
        if (record == undefined) throw new NoSuchEntity();
        return removeIndexRecord(name);
    });
};

exports.list = (encryptionKey) => {
    return new Promise((resolve, reject) => {
        secretIndex.find().make(filter => {
            filter.callback((err, result) => {
                if (err) reject(err);
                resolve(result);
            });
        });
    }).then(records => {
        return Promise.all(records.map(record => crypto.decrypt(encryptionKey, record.encryptedName)));
    });
}

RecordMatchesName = (name, record) => {
    return name != undefined && crypto.hash(name, record.salt) === record.hashedName
};

generateNewRecord = (name, secret, encryptionKey) => {
    const salt = uuid();
    const hashedName = crypto.hash(name, salt);
    return crypto.encrypt(encryptionKey, name)
        .then(encryptedName => {
            return crypto.encrypt(encryptionKey, secret)
                .then(encryptedSecret => ({hashedName, salt, encryptedName, secret: encryptedSecret}));
        })
}

getIndexRecord = name => {
    return new Promise((resolve, reject) => {
        secretIndex.find().make(filter => {
            filter.callback((err, result) => {
                if (err) reject(err);
                resolve(result.find(rec => RecordMatchesName(name, rec)));
            });
        });
    });
};

removeIndexRecord = name => {
    return getIndexRecord(name).then(record => {
        if (record == undefined) throw new NoSuchEntity();
        return new Promise((resolve, reject) => {
            secretIndex.remove().make(filter => {
                filter.where('hashedName', record.hashedName);
                filter.callback((err, result) => {
                    if (err) reject(err);
                    else resolve();
                });
            });
        });
    });
};

