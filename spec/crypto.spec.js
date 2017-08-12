const crypto = require('../crypto.js');

describe("the hashing function", () => {
    it("should be able to hash a value", () => {
        const hash = crypto.hash("value", "seed");
        expect(hash).toMatch(/.{10,}/);
    });

    it("should generate different hashes given different seeds", () => {
        const hash1 = crypto.hash("value", "seed1");
        const hash2 = crypto.hash("value", "seed2");
        expect(hash1).not.toBeCloseTo(hash2);
    });

    it("should generate different hashes given the same seed and different values", () => {
        const hash1 = crypto.hash("value1", "seed");
        const hash2 = crypto.hash("value2", "seed");
        expect(hash1).not.toBeCloseTo(hash2);
    });

    it("should be consistent", () => {
        const hash1 = crypto.hash("value", "seed");
        const hash2 = crypto.hash("value", "seed");
        expect(hash1).toBe(hash2);
    })
});

describe("encryption and decryption", () => {
    it("should be able to encrypt and decrypt data", willResolve(() => {
        const plainText = "Hello";
        const key = "secret code";
        return crypto.encrypt(key, plainText).then(cipherText => {
            expect(cipherText).toContain("PGP");
            return crypto.decrypt(key, cipherText).then(decryptedCipherText => {
                 expect(decryptedCipherText).toBe(plainText);
            })
        });
    }));

    it("should not decrypt without the correct key", willResolve(() => {
        const plainText = "Hello";
        const key = "secret code";
        const wrongKey = "wrong code";
        return crypto.encrypt(key, plainText).then(cipherText =>
            expectToReject(crypto.decrypt(wrongKey, cipherText))
                .then(err => expect(err).toEqual(jasmine.any(crypto.DecryptionError)))
        );
    }));
});