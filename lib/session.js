const fs = require('fs');
const path = require('path');

const pathSessionFileYandex = path.resolve('.y_session');
const pathSessionFileSpotify = path.resolve('.s_session');

exports.getSession = function(isYandex) {
    const pathSessionFile = isYandex ? pathSessionFileYandex : pathSessionFileSpotify;
    if (!fs.existsSync(pathSessionFile)) {
        return null;
    }

    try {
        return fs.readFileSync(pathSessionFile, 'utf8');
    } catch(err) {
        throw new Error(err);
    }
};

exports.setSession = function(isYandex, data) {
    const pathSessionFile = isYandex ? pathSessionFileYandex : pathSessionFileSpotify;
    try {
        fs.writeFileSync(pathSessionFile, data);
    } catch(err) {
        throw new Error(err);
    }
};