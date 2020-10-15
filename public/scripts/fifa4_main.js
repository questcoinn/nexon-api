console.log('[FIFA4] main');

const $nickname = document.getElementById('input-nickname');
const $submitBtn = document.getElementById('submit-btn');

const $userNickname = document.getElementById('user-nickname');
const $userLevel = document.getElementById('user-level');

const $officialDivLabel = document.getElementById('official-div-label');
const $officialDivValue = document.getElementById('official-div-value');
const $officialDivDate = document.getElementById('official-div-date');
const $directorDivLabel = document.getElementById('director-div-label');
const $directorDivValue = document.getElementById('director-div-value');
const $directorDivDate = document.getElementById('director-div-date');

const $foldingMatchesBtn = document.getElementById('folding-matches-btn');
const $recentMatches = document.getElementById('recent-matches');
const $officialMatchesLabel = document.getElementById('official-matches-label');
const $officialMatches = document.getElementById('official-matches');
const $directorMatchesLabel = document.getElementById('director-matches-label');
const $directorMatches = document.getElementById('director-matches');

const $recentBuysLabel = document.getElementById('recent-buys-label');
const $recentBuys = document.getElementById('recent-buys');
const $recentSellsLabel = document.getElementById('recent-sells-label');
const $recentSells = document.getElementById('recent-sells');

const MATCH_TYPE = {};
const SPID = {};
let matches;

/** @main */
(() => {
    // Load
    window.addEventListener('load', async (e) => {
        let res;

        setLoader(20);

        res = await fetch('/fifa4/meta/matchtype');
        const matchTypes = await res.json();
        for(let { matchtype, desc } of matchTypes) {
            MATCH_TYPE[matchtype] = desc;
        }

        res = await fetch('/fifa4/meta/spid');
        const spids = await res.json();
        for(let { id, name } of spids) {
            SPID[id] = name;
        }

        unsetLoader();
    });

    // Submit
    $submitBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        const query = $nickname.value;
        if(query === '') {
            return false;
        }

        setLoader(20);

        const accessId = await getBaseUserInfo(query);
        if(!accessId) {
            unsetLoader();
            return false;
        }

        await Promise.all([
            getMaxDivision(accessId),
            getRecentMatches(accessId),
            getRecentTrades(accessId)
        ]);

        if($recentMatches.classList.contains('folded')) {
            toggleRecentMatches($foldingMatchesBtn);
        }

        unsetLoader();
    });

    // Fold
    $foldingMatchesBtn.addEventListener('click', ({ target }) => {
        toggleRecentMatches(target);
    });

    $recentMatches.addEventListener('click', (e) => {
        const { target } = e;
        if(target.tagName !== 'TD') {
            return false;
        }

        const $table = target.parentElement.parentElement.parentElement;
        console.log(matches[$table.dataset.matchId]);
    });
})();

async function getBaseUserInfo(query) {
    const res = await fetch(`/fifa4/user/${query}`);
    if(res.status === 404) {
        return '';
    }

    const { accessId, nickname, level } = await res.json();
    $userNickname.textContent = nickname;
    $userLevel.textContent = `(Lv.${level})`;
    return accessId;
}

async function getMaxDivision(accessId) {
    const res = await fetch(`/fifa4/user/${accessId}/maxdivision`);
    const maxDivisions = await res.json();
    $officialDivLabel.textContent = MATCH_TYPE[50];
    $directorDivLabel.textContent = MATCH_TYPE[52];
    for(let { matchType, division, achievementDate } of maxDivisions) {
        if(matchType === 50) {
            $officialDivValue.textContent = division;
            $officialDivDate.textContent = achievementDate.replace('T', ' ');
        }
        if(matchType === 52) {
            $directorDivValue.textContent = division;
            $directorDivDate.textContent = achievementDate.replace('T', ' ');
        }
    }
}

async function getRecentMatches(accessId) {
    matches = {};

    $officialMatchesLabel.textContent = '공식경기';
    $officialMatches.clearChildren();
    let res = await fetch(`/fifa4/user/${accessId}/matches/50/0/1`);
    let matchIds = await res.json();
    for(let matchId of matchIds) {
        res = await fetch(`/fifa4/matches/${matchId}`);
        const data = await res.json();
        matches[matchId] = data;
        const { matchDate, matchInfo } = data;
        const info = matchInfo.find(x => x.accessId === accessId);
        const $table = createMatchInfoTable(info, matchDate, matchId);
        $officialMatches.appendChild($table);
    }

    $directorMatchesLabel.textContent = '감독경기';
    $directorMatches.clearChildren();
    res = await fetch(`/fifa4/user/${accessId}/matches/52/0/1`);
    matchIds = await res.json();
    for(let matchId of matchIds) {
        res = await fetch(`/fifa4/matches/${matchId}`);
        const data = await res.json();
        matches[matchId] = data;
        const { matchDate, matchInfo } = data;
        const info = matchInfo.find(x => x.accessId === accessId);
        const $table = createMatchInfoTable(info, matchDate, matchId);
        $directorMatches.appendChild($table);
    }

    $foldingMatchesBtn.removeAttribute('disabled');
}

/**
 * @error
 *  - trade dont exists
 *  - parameter is invalid
 *  - spid is unknown
 *  - action image don't exists
 */
async function getRecentTrades(accessId) {
    $recentBuysLabel.textContent = 'Recent Buys';
    $recentBuys.clearChildren();
    let res = await fetch(`/fifa4/user/${accessId}/trades/buy/0/10`);
    if(res.status === 200) {
        const buys = await res.json();
        for(let buy of buys) {
            const spid = buy.spid;
            res = await fetch(`/fifa4/meta/players-action-picture/${spid}`);
            const imgURL = await res.text();
    
            const $card = createRecentTradeCard(buy, imgURL, SPID[spid], 'buy');
            $recentBuys.appendChild($card);
        }
    }

    $recentSellsLabel.textContent = 'Recent Sells';
    $recentSells.clearChildren();
    res = await fetch(`/fifa4/user/${accessId}/trades/sell/0/10`);
    if(res.status === 200) {
        const sells = await res.json();
        for(let sell of sells) {
            const spid = sell.spid;
            res = await fetch(`/fifa4/meta/players-action-picture/${spid}`);
            const imgURL = await res.text();

            const $card = createRecentTradeCard(sell, imgURL, SPID[spid], 'sell');
            $recentSells.appendChild($card);
        }
    }
}

function createMatchInfoTable(info, matchDate, matchId) {
    const { matchResult, foul, possession } = info.matchDetail;
    const { shootTotal, effectiveShootTotal, goalTotal } = info.shoot;
    const { passTry, passSuccess } = info.pass;

    const heads = [
        '경기일', '경기결과', '파울수', '점유율',
        '슈팅수', '유효슈팅수', '골', '패스성공률'
    ];
    const datas = [
        matchDate.replace('T', ' '),
        matchResult,
        foul,
        `${possession} %`,
        shootTotal,
        effectiveShootTotal,
        goalTotal,
        `${Math.floor(passTry > 0 ? 100 * passSuccess / passTry : 0)} %`
    ];

    const $table = document.createElement('table');
    const $tbody = document.createElement('tbody');
    $table.dataset.matchId = matchId;
    
    for(let i = 0; i < 8; i++) {
        const $tr = document.createElement('tr');
        const $td1 = document.createElement('td');
        const $td2 = document.createElement('td');

        $td1.textContent = heads[i];
        $td2.textContent = datas[i];

        $tr.appendChild($td1);
        $tr.appendChild($td2);
        $tbody.appendChild($tr);
    }
    $table.appendChild($tbody);
    return $table;
}

function createRecentTradeCard({ tradeDate, grade, value }, src, name, type) {
    const $card = document.createElement('div');
    $card.classList.add(`recent-${type}`);

    const $img = document.createElement('img');
    $img.setAttribute('src', src);
    $img.setAttribute('alt', name);
    $img.onerror = (e) => {
        $img.src = '/images/fifa4-logo-square.png';
    }

    const $nameWrapper = document.createElement('h4');
    const $nameText = document.createElement('span');
    const $grade = document.createElement('span');

    $nameText.textContent = name;
    $grade.textContent = grade;
    $grade.classList.add('card-grade');

    $nameWrapper.appendChild($nameText);
    $nameWrapper.appendChild($grade);

    const $value = document.createElement('p');
    const $date = document.createElement('i');
    $value.textContent = `${value.formatWithComma()} BP`;
    $date.textContent = tradeDate.replace('T', ' ');

    $card.appendChild($img);
    $card.appendChild($nameWrapper);
    $card.appendChild($value);
    $card.appendChild($date);
    return $card;
}

function toggleRecentMatches(target) {
    $recentMatches.classList.toggle('folded');
    if($recentMatches.classList.contains('folded')) {
        target.textContent = '최근경기펼치기';
    } else {
        target.textContent = '최근경기접기';
    }
}

function setLoader(stage = 12) {
    const $loader = document.createElement('div');
    $loader.classList.add('loader');
    $loader.style.setProperty('--stage', stage);

    for(let i = 0; i < stage; i++) {
        const $span = document.createElement('span');
        $span.style.setProperty('--i', i);
        $loader.appendChild($span);
    }
    document.body.appendChild($loader);
}

function unsetLoader() {
    const $loader = document.getElementsByClassName('loader')[0];
    if($loader) {
        document.body.removeChild($loader);
    }
}

if(typeof Number.prototype.formatWithComma === 'undefined') {
    Object.defineProperty(Number.prototype, 'formatWithComma', {
        value: function() {
            const [ integer, decimal ] = this.toString().split('.');
            let ret = '';
            for(let i = 0, len = integer.length; i < len; i++) {
                if(i > 0 && i % 3 === 0) {
                    ret = ',' + ret;
                }
                ret = integer[len - i - 1] + ret;
            }
            if(decimal !== undefined) {
                ret += `.${decimal}`;
            }
            return ret;
        }
    });
}

// https://stackoverflow.com/questions/3955229/remove-all-child-elements-of-a-dom-node-in-javascript#answer-3955238
if(typeof Element.prototype.clearChildren === 'undefined') {
    Object.defineProperty(Element.prototype, 'clearChildren', {
        value: function() {
            while(this.firstChild) {
                this.removeChild(this.lastChild);
            }
        }
    });
}