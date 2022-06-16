/** Dimensions of the data. */
const WIDTH = 120;
const HEIGHT = 80;

/** Scale factor to convert to pixels. */
const SCALE = 8;

/** Margin around the field. */
const MARGIN = 20;

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
d3.csv("data/passes.csv").then(passes => {
    // Store a mapping from index to d3 element
    const index = {};

    // Store the index of the currently selected line
    let selected = undefined;

    const stroke = (d) => d.outcome === "Complete" ? "blue" : "red";

    // Shared attributes between the lines
    const attrs = {
        "x1": d => norm(d.location_x),
        "y1": d => norm(d.location_y) ,
        "x2": d => norm(d.location_end_x),
        "y2": d => norm(d.location_end_y)
    };

    // Visual representation of the line
    svg.append("g")
        .selectAll("passes")
        .data(passes)
        .enter()
        .append("line")
        .filter(d => d.possession_team === "Italy")
        .attrs(attrs)
        .attr("stroke-width", STROKE_WIDTH)
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
        .filter(d => d.possession_team === "Italy")
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
            if (selected) {
                d3.select(index[selected]).attr("stroke", stroke(d));
            }
            selected = i;
            d3.select(index[i]).attr("stroke", "yellow");
            document.getElementById("details").innerHTML = JSON.stringify(d);
        });
});