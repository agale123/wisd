/** Dimensions of the data. */
const WIDTH = 120;
const HEIGHT = 80;

/** Scale factor to convert to pixels. */
const SCALE = 7;

/** Margin around the field. */
const MARGIN = 40;

/** Default width of lines on the field. */
const STROKE_WIDTH = 2;

/** Scale a point to the pixel location. */
const norm = (x) => x * SCALE + MARGIN;

// Create the svg element
let svg = d3.select("#field").append("svg")
    .attr("width", WIDTH * SCALE + MARGIN * 2)
    .attr("height", HEIGHT * SCALE + MARGIN * 2);

// Green field turf
svg.append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", WIDTH * SCALE + MARGIN * 2)
    .attr("height", HEIGHT * SCALE + MARGIN * 2)
    .attr("fill", "green");

// Add center circle
svg.append("circle")
    .attr('cx', norm(WIDTH / 2))
    .attr('cy', norm(HEIGHT / 2))
    .attr('r', 10 * SCALE)
    .attr("stroke-width", STROKE_WIDTH)
    .attr("stroke", "white")
    .attr("fill", "none");

// Draw lines on field
d3.csv("data/field.csv").then(lines => {
    svg.selectAll("field")
        .data(lines)
        .enter()
        .append("line")
        .attr("x1", d => norm(d.x1))
        .attr("y1", d => norm(d.y1))
        .attr("x2", d => norm(d.x2))
        .attr("y2", d => norm(d.y2))
        .attr("stroke-width", STROKE_WIDTH)
        .attr("stroke", "white");
});

// Draw the passes after reading data
// TODO(agale): Update to handle arbitrary matches
Promise.all([d3.csv("data/passes.csv"), d3.csv("data/frames.csv")]).then(([passes, frames]) => {
    // Prosses passes
    const filteredPasses = passes.filter(p => {
        // TODO(agale): Update to handle choosing the team
        // TODO(agale): Update to handle filtering minutes
        return p.team === "Italy" && p.minute < 5;
    });
    // Process frames
    const processedFrames = frames.reduce((acc, cur) => {
        // Use proper JSON quotes and booleans
        const frameString = cur['freeze_frame']
            .replaceAll("'", '"')
            .replaceAll("True", "true")
            .replaceAll("False", "false");
        acc[cur['event_uuid']] = JSON.parse(frameString);
        return acc;
    }, {});
    renderPasses(filteredPasses, processedFrames);
});

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

function renderPasses(passes, frames) {
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
            let frame = frames[d['id']];
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

            // TODO(agale): Render prettier details.
            document.getElementById("details").innerHTML = JSON.stringify(d);
        });
}