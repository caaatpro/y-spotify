const fs = require('fs');
const path = require('path');

const pathSpotifyConfig = path.resolve('.spotify.json');

exports.get = function() {
    let potifyConfigRow;
    try {
        potifyConfigRow = fs.readFileSync(pathSpotifyConfig, 'utf8');
    } catch(err) {
        throw new Error(err);
    }

    try {
        return JSON.parse(potifyConfigRow);
    } catch(err) {
        throw new Error(err);
    }
};