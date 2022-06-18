let selectedTimestamp = 1;
let selectedMatchId = '3795107';
let selectedTeam = 'Belgium';

let storedPasses;
let storedFrames;

/** Load the data for a match and then render the passes. */
function loadMatch() {
    clearPasses();
    Promise.all([
        d3.csv(`data/passes/${selectedMatchId}.csv`),
        d3.csv(`data/frames/${selectedMatchId}.csv`)
    ]).then(([passes, frames]) => {
        // Process frames to use proper JSON quotes and booleans
        storedFrames = frames.reduce((acc, cur) => {
            const frameString = cur['freeze_frame']
                .replaceAll("'", '"')
                .replaceAll("True", "true")
                .replaceAll("False", "false")
                .replaceAll("None", "false");
            acc[cur['event_uuid']] = JSON.parse(frameString);
            return acc;
        }, {});
        storedPasses = passes;
        renderPasses();
    });
}

// Initial call to load match data.
loadMatch();

/** Color an actor in a frame. */
function actor(frame) {
    if (frame['actor']) {
        return frame['keeper'] ? 'indigo' : 'darkblue';
    } else if (frame['teammate']) {
        return frame['keeper'] ? 'purple' : 'blue';
    } else if (frame['keeper']) {
        return 'orange';
    } else {
        return 'yellow';
    }
}

/** Render a 360 frame. */
function renderFrame(frame) {
    svg.append("g")
        .attr("class", "players")
        .selectAll("players")
        .data(frame)
        .enter()
        .append("circle")
        .attr('cx', d => norm(d['location'][0]))
        .attr('cy', d => norm(d['location'][1]))
        .attr('r', SCALE)
        .attr("fill", d => actor(d));
}

/** Clear the 360 frame. */
function clearFrame() {
    d3.select(".players").remove();
}

/** Render details for a specific pass. */
function renderPassDetails(pass) {
    // TODO(agale): Formatting polish on which entries we show
    let text = "";
    for (const [key, value] of Object.entries(pass)) {
        if (value && !parseInt(value)) {
            text = text.concat(`<p><strong>${key}</strong>: ${value}</p>`);
        }
    }
    // TODO(agale): Compute more interesting stats like pass completion likelihood
    document.getElementById("details").innerHTML = text;
}

/** Clear all passes from the frame. */
function clearPasses() {
    d3.select(".passes").remove();
    d3.select(".passesTarget").remove();
    clearFrame();
    document.getElementById("details").innerText =
        'Select a game and team to explore and analyze passes. Filter to a see passes from certain ' +
        'minutes of the game. Click an individual pass to see detailed stats about it and positioning ' +
        'of players at that moment.';
}

/** Render all passes in the field. */
function renderPasses() {
    clearPasses();

    // Filter by team and timestamp
    const passes = storedPasses.filter(p => {
        return p.team === selectedTeam && selectedTimestamp - 1 <= p.minute && p.minute < selectedTimestamp + 4;
    });

    // Store a mapping from index to d3 element
    const index = {};

    const stroke = (d) => d.outcome === "Complete" ? "blue" : "red";

    // Shared attributes between the lines
    const attrs = {
        "x1": d => norm(d['location_x']),
        "y1": d => norm(d['location_y']),
        "x2": d => norm(d['location_end_x']),
        "y2": d => norm(d['location_end_y'])
    };

    // Visual representation of the line
    svg.append("g")
        .attr("class", "passes")
        .selectAll("passes")
        .data(passes)
        .enter()
        .append("line")
        .attrs(attrs)
        .attr("stroke-width", STROKE_WIDTH)
        .attr("stroke-linecap", "round")
        .attr("stroke", d => stroke(d))
        .each(function (_, i) {
            index[i] = this;
        });
    // Larger target for mouseover and click events
    svg.append("g")
        .attr("class", "passesTarget")
        .selectAll("passesTarget")
        .data(passes)
        .enter()
        .append("line")
        .attrs(attrs)
        .attr("stroke-width", STROKE_WIDTH * 10)
        .attr("stroke", "transparent")
        .on("mouseover", (_, i) => {
            d3.select(index[i]).attr("stroke-width", STROKE_WIDTH * 2);
        })
        .on("mouseout", (_, i) => {
            d3.select(index[i]).attr("stroke-width", STROKE_WIDTH);
        })
        .on("click", (d, i) => {
            // Clear the previous slection
            d3.select(".selected").attr("stroke-dasharray", "")
                .attr("class", "");
            clearFrame();
            // Highlight the new line
            d3.select(index[i]).attr("stroke-dasharray", "2,5")
                .attr("class", "selected");
            let frame = storedFrames[d['id']];
            if (!frame) {
                // Just add the actor manually if the frame doesn't exist
                frame = [
                    {
                        'location': [d['location_x'], d['location_y']],
                        'actor': true,
                        'keeper': d['position'] === 'Goalkeeper',
                    },
                ];
            }
            renderFrame(frame);
            renderPassDetails(d);
        });
}