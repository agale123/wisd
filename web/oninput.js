let matches;
// Load the matches data
d3.csv("data/matches.csv").then(m => {
    matches = m;
});

let extraFirstMinutes;

/** Update the timestamp slider to support extra time. */
function parseTimestamps() {
    const first = Math.max(...storedPasses.filter(p => p['period'] === '1').map(p => parseInt(p['minute'])));
    const second = Math.max(...storedPasses.filter(p => p['period'] === '2').map(p => parseInt(p['minute'])));
    extraFirstMinutes = first - 44;
    const extraMinutes = extraFirstMinutes + second - 89;
    document.getElementById("timestamp-input").max = 90 + extraMinutes - 4;
}

/** Convert timestamp to a string that accounts for extra time. */
function str(value) {
    if (value > 45 && value - 45 <= extraFirstMinutes) {
        return `45+${value - 45}'`;
    } else if (value > 90 + extraFirstMinutes) {
        return `90+${value - extraFirstMinutes - 90}'`;
    } else if (value > 45) {
        return `${value - extraFirstMinutes}'`;
    }
    return `${value}'`;
}

/** Handle updating the timestamp. */
function handleTimestamp(value) {
    document.getElementById("timestamp-label").innerText = `Minutes: ${str(parseInt(value))}-${str(parseInt(value) + 4)}`;
    selectedTimestamp = parseInt(value);
    renderPasses();
}

/** Reset the timestamp slider to default values. */
function clearTimestamp() {
    selectedTimestamp = 1;
    document.getElementById("timestamp-input").max = 86;
    document.getElementById("timestamp-input").value = 1;
    document.getElementById("timestamp-label").innerText = `Minutes: 1'-5'`;
}

/** Handle changes matches. */
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

/** Handle changing teams. */
function handleTeam(value) {
    selectedTeam = value;
    renderPasses();
}