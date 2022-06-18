let matches;
// Load the matches data
d3.csv("data/matches.csv").then(m => {
    matches = m;
});

function handleTimestamp(value) {
    // TODO(agale): Format the first/second half stoppage time minutes
    // TODO(agale): Update range slider with proper end value
    document.getElementById("timestamp-label").innerText = `Minutes: ${value}-${parseInt(value)+4}`;
    selectedTimestamp = parseInt(value);
    renderPasses();
}

function handleGame(value) {
    const select = document.getElementById("team");
    const match = matches.find(m => m['match_id'] === value);
    select.children[0].value = match['home_team'];
    select.children[0].innerText = match['home_team'];
    select.children[0].selected = true;
    select.children[1].value = match['away_team'];
    select.children[1].innerText = match['away_team'];
    selectedMatchId = value;
    selectedTeam = match['home_team'];
    loadMatch();
}

function handleTeam(value) {
    selectedTeam = value;
    renderPasses();
}