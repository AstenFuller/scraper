const cheerio = require('cheerio');
const axios = require('axios');

const siteURL = 'https://basketball-reference.com'
let playerSiteUrl = ''

const teams = new Set();
const players = new Set();
const playerName = new Set();
const playerPos = new Set();
const playerHeight = new Set();
const playerWeight = new Set();

const fetchData = async () => {
    const result = await axios.get(siteURL);
    return cheerio.load(result.data);
}

const fetchPlayerData = async () => {
    const result = await axios.get(playerSiteUrl);
    return cheerio.load(result.data);
}

const teamData = async (_callback) => {
    const $ = await fetchData();
    let count = 0;

    $('th.left a').each((index, element) => {
        teams.add({
            url: siteURL + ($(element).attr('href')),
            teamName: $(element).attr('title'),
            primaryKey: count
        });
        count++;
    })

    _callback();
}

const results = () => {
    teamData(async () => {
        const team = [...teams];

        if (team.length > 0) {
            for (let i = 0; i < team.length; i++) {
                playerSiteUrl = team[i].url;

                const $ = await fetchPlayerData();

                $('tbody tr th.center').each((index, element) => {
                    if ($(element).attr('data-stat') && $(element).attr('data-stat') == 'number') {
                        players.add({
                            no: $(element).text(),
                            foreignKey: team[i].primaryKey,
                            team: team[i].teamName
                        });
                    };
                });

                $('td.left').each((index, element) => {
                    if ($(element).attr('data-stat') && $(element).attr('data-stat') == 'player') {
                        playerName.add({
                            name: $(element).text()
                        });
                    };
                });

                $('td.center').each((index, element) => {
                    if ($(element).attr('data-stat') && $(element).attr('data-stat') == 'pos') {
                        playerPos.add({
                            pos: $(element).text()
                        });
                    };
                });

                $('td.right').each((index, element) => {
                    if ($(element).attr('data-stat') && $(element).attr('data-stat') == 'height') {
                        playerHeight.add({
                            height: $(element).text()
                        });
                    };
                });

                $('td.right').each((index, element) => {
                    if ($(element).attr('data-stat') && $(element).attr('data-stat') == 'weight') {
                        playerWeight.add({
                            weight: $(element).text()
                        });
                    };
                });
            }
        }

        const playerArray = [...players];
        const playerNameArray = [...playerName];
        const playerPosArray = [...playerPos];
        const playerHeightArray = [...playerHeight];
        const playerWeightArray = [...playerWeight];
        const combinedPlayerStats = [];

        for(let i = 0; i < playerArray.length; i++) {
            combinedPlayerStats.push({...playerArray[i], ...playerNameArray[i], ...playerPosArray[i], ...playerHeightArray[i], ...playerWeightArray[i]});
        };

        console.log(combinedPlayerStats);

        return {
            teams: [...teams],
            players: [...combinedPlayerStats]
        };
    });
};

module.exports = results;
