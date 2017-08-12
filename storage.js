const fs = require('fs');
var mkdirp = require('mkdirp');
const path = require('path');

module.exports = class Storage {
    static get NoSuchEntity() { return class extends Error { }; }

    constructor(basepath) {
        this.basepath = basepath;
        // I'm sure this will bite me in the ass later, since it's an unsynchronized, non-blocking call.
        mkdirp(basepath);
    }

    save(key, value) {
        return new Promise((resolve, reject) => {
            const fullpath = path.join(this.basepath, key);
            fs.writeFile(fullpath, value, err => {
                if (err) reject(err);
                else resolve();
            });
        })
    }

    load(key) {
        return new Promise((resolve, reject) => {
            const fullpath = path.join(this.basepath, key);
            fs.readFile(fullpath, (err, data) => {
                if (err) {
                    if (err.code == 'ENOENT') reject(new NoSuchEntity(err));
                    else reject(err);
                }
                else resolve(data);
            });
        });
    }

    delete(key) {
        return new Promise((resolve, reject) => {
            const fullPath = path.join(this.basepath, key);
            fs.unlink(fullPath, err => {
                if (err) {
                    if (err.code == 'ENOENT') reject(new NoSuchEntity(err));
                    else reject(err);
                }
                else resolve();
            });
        });
    }

    // Recursively creates a directory
    mkdir(key) {
        return new Promise((resolve, reject) => {
            const fullPath = path.join(this.basepath, key);
            mkdirp(fullpath, err => {
                if (err) reject(err);
                else resolve();
            });
        });
    }
};