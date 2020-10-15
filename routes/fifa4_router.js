const express = require('express');
const got = require('got');

const router = express.Router();
require('dotenv').config();

const AUTH_KEY = process.env.AUTH_KEY_FIFA4;
const HOSTS = {
    META_1: 'https://static.api.nexon.co.kr/fifaonline4/latest',
    META_2: 'https://fo4.dn.nexoncdn.co.kr/live/externalAssets/common',
    GENERAL: 'https://api.nexon.co.kr/fifaonline4/v1.0'
}

const DUMMY_USER = {
    accessId: "69ce9b4e1b5006f8cd366449",
    nickname: "Ronaldo"
}

let api_is_accessible = testAPIServer();

router.get('/', (req, res, next) => {
    res.render('fifa4');
});

/** @API_meta */
router.get('/meta/matchtype', async (req, res, next) => {
    try {
        const gotRes = await got(`${HOSTS.META_1}/matchtype.json`);
        res.send(gotRes.body);
    } catch(err) {
        res.status(500);
        res.send({ message: 'Internal Server Error' });
    }
});

router.get('/meta/spid', async (req, res, next) => {
    try {
        const gotRes = await got(`${HOSTS.META_1}/spid.json`);
        res.send(gotRes.body);
    } catch(err) {
        res.status(500);
        res.send({ message: 'Internal Server Error' });
    }
});

router.get('/meta/seasonid', async (req, res, next) => {
    try {
        const gotRes = await got(`${HOSTS.META_1}/seasonid.json`);
        res.send(gotRes.body);
    } catch(err) {
        res.status(500);
        res.send({ message: 'Internal Server Error' });
    }
});

router.get('/meta/spposition', async (req, res, next) => {
    try {
        const gotRes = await got(`${HOSTS.META_1}/spposition.json`);
        res.send(gotRes.body);
    } catch(err) {
        res.status(500);
        res.send({ message: 'Internal Server Error' });
    }
});

router.get('/meta/division', async (req, res, next) => {
    try {
        const gotRes = await got(`${HOSTS.META_1}/division.json`);
        res.send(gotRes.body);
    } catch(err) {
        res.status(500);
        res.send({ message: 'Internal Server Error' });
    }
});

router.get('/meta/division-volta', async (req, res, next) => {
    try {
        const gotRes = await got(`${HOSTS.META_1}/division_volta.json`);
        res.send(gotRes.body);
    } catch(err) {
        res.status(500);
        res.send({ message: 'Internal Server Error' });
    }
});

router.get('/meta/players-action-picture/:spid', async (req, res, next) => {
    res.send(`${HOSTS.META_2}/playersAction/p${req.params.spid}.png`);
});

router.get('/meta/players-picture/:spid', async (req, res, next) => {
    res.send(`${HOSTS.META_2}/players/p${req.params.spid}.png`);
});

/** @API_user */
router.get('/user/:nickname', async (req, res, next) => {
    if(!api_is_accessible) {
        res.status(500);
        res.send({ message: 'Internal Server Error' });
        return next();
    }

    try {
        const gotRes = await got(`${HOSTS.GENERAL}/users?nickname=${req.params.nickname}`, {
            headers: { Authorization: AUTH_KEY }
        });
        res.send(gotRes.body);
    } catch(err) {
        res.status(404);
        res.send({ message: 'User could not found' });
    }
});

router.get('/user/:id/maxdivision', async (req, res, next) => {
    if(!api_is_accessible) {
        res.status(500);
        res.send({ message: 'Internal Server Error' });
        return next();
    }

    try {
        const { id } = req.params;
        const gotRes = await got(`${HOSTS.GENERAL}/users/${id}/maxdivision`, {
            headers: { Authorization: AUTH_KEY }
        });
        res.send(gotRes.body);
    } catch(err) {
        res.status(404);
        res.send({ message: 'User could not found' });
    }
});

router.get('/user/:id/matches/:matchtype/:offset/:limit', async (req, res, next) => {
    if(!api_is_accessible) {
        res.status(500);
        res.send({ message: 'Internal Server Error' });
        return next();
    }

    try {
        const { id, matchtype, offset, limit } = req.params;
        const gotRes = await got(`${HOSTS.GENERAL}/users/${id}/matches?matchtype=${matchtype}&offset=${offset}&limit=${limit}`, {
            headers: { Authorization: AUTH_KEY }
        });
        res.send(gotRes.body);
    } catch(err) {
        res.status(404);
        res.send({ message: 'Parameters are invalid' });
    }
});

router.get('/user/:id/trades/:tradetype/:offset/:limit', async (req, res, next) => {
    if(!api_is_accessible) {
        res.status(500);
        res.send({ message: 'Internal Server Error' });
        return next();
    }

    try {
        const { id, tradetype, offset, limit } = req.params;
        const gotRes = await got(`${HOSTS.GENERAL}/users/${id}/markets?tradetype=${tradetype}&offset=${offset}&limit=${limit}`, {
            headers: { Authorization: AUTH_KEY }
        });
        res.send(gotRes.body);
    } catch(err) {
        res.status(404);
        res.send({ message: 'Trade list could not exists' });
    }
});

/** @API_match */
router.get('/matches/:matchtype/:orderby/:offset/:limit', async (req, res, next) => {
    if(!api_is_accessible) {
        res.status(500);
        res.send({ message: 'Internal Server Error' });
        return next();
    }

    try {
        const { matchtype, offset, limit, orderby } = req.params;
        const gotRes = await got(`${HOSTS.GENERAL}/matches?matchtype=${matchtype}&offset=${offset}&limit=${limit}&orderby=${orderby}`, {
            headers: { Authorization: AUTH_KEY }
        });
        res.send(gotRes.body);
    } catch(err) {
        res.status(404);
        res.send({ message: 'Parameters are invalid' });
    }
});

router.get('/matches/:id', async (req, res, next) => {
    if(!api_is_accessible) {
        res.status(500);
        res.send({ message: 'Internal Server Error' });
        return next();
    }

    try {
        const { id } = req.params;
        const gotRes = await got(`${HOSTS.GENERAL}/matches/${id}`, {
            headers: { Authorization: AUTH_KEY }
        });
        res.send(gotRes.body);
    } catch(err) {
        res.status(404);
        res.send({ message: 'Parameters are invalid' });
    }
});

/** @API_ranker 
 *  @not_working
 */
router.get('/rankers/:matchtype/:players', async (req, res, next) => {
    if(!api_is_accessible) {
        res.status(500);
        res.send({ message: 'Internal Server Error' });
        return next();
    }

    // const urlInfo = req.url.slice(1).split('/');
    // if(urlInfo.length % 2 !== 0 || urlInfo.length < 4) {
    //     res.status(404);
    //     res.send({ message: 'Parameters are invalid' });
    //     return next();
    // }

    // const playersObj = [];
    // for(let i = 2, len = urlInfo.length; i < len; i += 2) {
    //     playersObj.push({ id: urlInfo[i], po: urlInfo[i + 1] });
    // }
    // const players = JSON.stringify(playersObj);

    try {
        const { matchtype, players } = req.params;
        const gotRes = await got(`${HOSTS.GENERAL}/rankers/status?matchtype=${matchtype}&players=${players}`, {
            headers: { Authorization: AUTH_KEY }
        });
        res.send(gotRes.body);
    } catch(err) {
        res.status(404);
        res.send({ message: 'Parameters are invalid' });
    }
});

module.exports = router;

/** @functions */
async function testAPIServer() {
    try {
        await got(`${HOSTS.GENERAL}/users?nickname=${DUMMY_USER.nickname}`, {
            headers: { Authorization: AUTH_KEY }
        });
        return true;
    } catch(err) {
        console.error(err);
        return false;
    };
}