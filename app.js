const SpotifyWebApi = require('spotify-web-api-node');
const YandexMusicApi = require('yandex-music-api');
const dateFormat = require('dateformat');
const fs = require('fs');
const path = require('path');
const session = require('./lib/session.js');
const spotifyConfig = require('./lib/spotify-config.js');

/**
 * Данные для Yandex.Music
 */
const yandexMusicApi = new YandexMusicApi();
const pathAuthFile = path.resolve('.y_auth');
let yandexAccessToken = session.getSession(true);

/**
 * Данные для Spotify
 */
const configSpotify = spotifyConfig.get();

// credentials are optional
const spotifyApi = new SpotifyWebApi({
    clientId: configSpotify.client_id,
    clientSecret: configSpotify.client_secret,
    redirectUri: configSpotify.redirect_uri
});

async function getTrackIds(traks) {
    const trakcsIds = [];

    for (const track of traks) {
        const trackData = await spotifyApi.searchTracks(track);
        if (trackData.body.tracks.items.length) {
            trakcsIds.push(trackData.body.tracks.items[0].id);
            console.log(`Find: ${track}. Success`);
        } else {
            console.log(`Find: ${track}. Error`);
            console.error(trackData.body);
        }
    }

    return trakcsIds;
}

async function pushTracksToSpotify(date, traks) {
    /**
     * Создание плей листа в спотифай
     */
    const newPlaylist = await spotifyApi.createPlaylist(`Плейлист дня ${date}`, { 'description': '', 'public': true });
    const newPlaylistId = newPlaylist.body.id;

    /**
     * Получение идентификаторов треков
     */
    const trakcsIds = await getTrackIds(traks);

    if (trakcsIds.length === 0) {
        return;
    }

    const sTrakcsIds = trakcsIds.map((id) => {
        return `spotify:track:${id}`;
    });

    /**
     * Добавление треков в плейлист
     */
    await spotifyApi.addTracksToPlaylist(newPlaylistId, sTrakcsIds);
}

function getMusicArray(tracks) {
    const list = [];
    tracks.forEach((track) => {
        const artist = track.track.artists.map((artist) => artist.name).join(', ');
        list.push(`${artist} ${track.track.title}`);
    });

    return list;
}

function main() {
    /**
     * Получение главной страницы
     */
    yandexMusicApi.getLanding(['personalplaylists', 'promotions', 'new-releases', 'new-playlists', 'mixes', 'chart', 'artists', 'albums', 'playlists', 'play_contexts']).then((data) => {
        const playlistOfTheDay = data.blocks[0].entities[0].data.data;
        console.log(1);

        yandexMusicApi.getPlaylist(playlistOfTheDay.uid, playlistOfTheDay.kind).then(async (data) => {
            const tracks = getMusicArray(data.tracks);
            const modified = dateFormat(new Date(data.modified), "dd.mm.yyyy");

            await pushTracksToSpotify(modified, tracks);
        }).catch((err) => {
            console.error(err);
        });
    }).catch((err) => {
        console.error(err);
    });
}

/**
 * Авторизация
 */
if (session === null) {
    let authDataRow;
    try {
        authDataRow = fs.readFileSync(pathAuthFile, 'utf8');
    } catch(err) {
        throw new Error(err);
    }

    const authData = authDataRow.split('\n');
    yandexMusicApi.authWithCredentials({username: authData[0], password: authData[1]}).then((data) => {
        yandexAccessToken = data.access_token;
        session.setSession(true, yandexAccessToken);
    }).catch((err) => {
        console.error(err);
    });
} else {
    yandexMusicApi.authWithToken(yandexAccessToken);
    spotifyApi.setAccessToken(session.getSession(false));

    main();
}

console.log(12);
