const CHARS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const MAX_HASH_LENGTH = 190;

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

function generateHash() {
    const hash = [];
    for (let i = 0; i < MAX_HASH_LENGTH; i++) {
        hash.push(CHARS[getRandomInt(CHARS.length)]);
    }
    return hash.join('');
}

module.exports.generateHash = generateHash;
