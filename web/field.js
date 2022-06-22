/** Dimensions of the data. */
const WIDTH = 120;
const HEIGHT = 80;

/** Scale factor to convert to pixels. */
const SCALE = 6;

/** Margin around the field. */
const MARGIN = 40;

/** Default width of lines on the field. */
const STROKE_WIDTH = 2;

/** Scale a point to the pixel location. */
const norm = (x) => x * SCALE + MARGIN;

// Create the svg element
const svg = d3.select("#field").append("svg")
    .attr("width", WIDTH * SCALE + MARGIN * 2)
    .attr("height", HEIGHT * SCALE + MARGIN * 2)
    .style("border-radius", `${SCALE * 3}px`);

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

// Marker for line arrows
function drawArrow(color) {
    svg.append("svg:defs").append("svg:marker")
        .attr("id", `arrow-${color}`)
        .attr("viewBox", "0 -16 32 32")
        .attr("refX", 10)
        .attr("markerUnits", "userSpaceOnUse")
        .attr("markerWidth", 16)
        .attr("markerHeight", 16)
        .attr("orient", "auto")
        .attr("fill", color)
        .append("svg:path")
        .attr("d", "M0,-16L32,0L0,16");
}
drawArrow("red");
drawArrow("blue");