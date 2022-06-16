/** Dimensions of the data. */
const WIDTH = 120;
const HEIGHT = 80;

/** Scale factor to convert to pixels. */
const SCALE = 5;

/** Margin around the field. */
const MARGIN = 20;

/** Scale a point to the pixel location. */
const norm = (x) => x * SCALE + MARGIN;

// Create the svg element
let svg = d3.select("body").append("svg")
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
    .attr('cx', norm(60))
    .attr('cy', norm(40))
    .attr('r', 50)
    .attr("stroke-width", 1)
    .attr("stroke", "white")
    .attr("fill", "none");

// Draw lines on field
d3.csv("data/field.csv").then(lines => {
    svg.selectAll("line")
    .data(lines)
    .enter()
    .append("line")
    .attr("x1", d => norm(d.x1))
    .attr("y1", d => norm(d.y1))
    .attr("x2", d => norm(d.x2))
    .attr("y2", d => norm(d.y2))
    .attr("stroke-width", 1)
    .attr("stroke", "white");
})

// Draw the passes after reading data
d3.csv("data/passes.csv").then(passes => {
    svg.selectAll("line")
        .data(passes)
        .enter()
        .append("line")
        .filter(d => d.possession_team === "Italy")
        .attr("x1", d => norm(d.location_x))
        .attr("y1", d => norm(d.location_y))
        .attr("x2", d => norm(d.location_end_x))
        .attr("y2", d => norm(d.location_end_y))
        .attr("stroke-width", 1)
        .attr("stroke", d => d.outcome === "Complete" ? "blue" : "red");
})