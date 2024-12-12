// add your JavaScript/D3 to this file

d3.select("#plot")
  .append("p")
  .style("font-size", "14px")
  .style("max-width", "600px")
  .text("This chart shows the number of swing counties by region for each election year. Use the dropdown below to select a year and see how the distribution changes.");

// Set the dimensions and margins of the graph
const margin = { top: 50, right: 30, bottom: 60, left: 60 },
      width = 600 - margin.left - margin.right,
      height = 400 - margin.top - margin.bottom;

// Append the SVG object to the div called 'plot'
const svg = d3.select("#plot")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);

// Add a title
svg.append("text")
  .attr("x", (width + margin.left + margin.right) / 2)
  .attr("y", margin.top / 2)
  .attr("text-anchor", "middle")
  .style("font-size", "20px")
  .style("font-weight", "bold")
  .text("Number of Swing Counties by Region and Year");

const g = svg.append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

// Create data inline
const data = [
  { region: "Midwest", year: 2000, num_swing_counties: 139 },
  { region: "Midwest", year: 2004, num_swing_counties: 178 },
  { region: "Midwest", year: 2008, num_swing_counties: 316 },
  { region: "Midwest", year: 2012, num_swing_counties: 254 },
  { region: "Midwest", year: 2016, num_swing_counties: 179 },
  { region: "Midwest", year: 2020, num_swing_counties: 148 },

  { region: "Northeast", year: 2000, num_swing_counties: 38 },
  { region: "Northeast", year: 2004, num_swing_counties: 54 },
  { region: "Northeast", year: 2008, num_swing_counties: 67 },
  { region: "Northeast", year: 2012, num_swing_counties: 57 },
  { region: "Northeast", year: 2016, num_swing_counties: 64 },
  { region: "Northeast", year: 2020, num_swing_counties: 56 },

  { region: "South", year: 2000, num_swing_counties: 179 },
  { region: "South", year: 2004, num_swing_counties: 252 },
  { region: "South", year: 2008, num_swing_counties: 277 },
  { region: "South", year: 2012, num_swing_counties: 228 },
  { region: "South", year: 2016, num_swing_counties: 190 },
  { region: "South", year: 2020, num_swing_counties: 179 },

  { region: "West", year: 2000, num_swing_counties: 33 },
  { region: "West", year: 2004, num_swing_counties: 52 },
  { region: "West", year: 2008, num_swing_counties: 97 },
  { region: "West", year: 2012, num_swing_counties: 70 },
  { region: "West", year: 2016, num_swing_counties: 60 },
  { region: "West", year: 2020, num_swing_counties: 57 }
];

// Extract unique years and regions
const years = Array.from(new Set(data.map(d => d.year))).sort();
const regions = Array.from(new Set(data.map(d => d.region)));

// Compute a global maximum to keep y-axis consistent
const globalMax = d3.max(data, d => d.num_swing_counties);

// Create scales
const x = d3.scaleBand()
  .domain(regions)
  .range([0, width])
  .padding(0.3);

const y = d3.scaleLinear()
  .domain([0, globalMax]) // fixed domain using global max
  .range([height, 0])
  .nice();

// Define a color scale for the years
const colorScale = d3.scaleOrdinal()
  .domain(years)
  .range(d3.schemeTableau10); // Choose any scheme you like

// Add X axis
g.append("g")
  .attr("transform", `translate(0,${height})`)
  .call(d3.axisBottom(x));

// Add Y axis
const yAxis = g.append("g")
  .call(d3.axisLeft(y));

// Add Y axis label
g.append("text")
  .attr("transform", "rotate(-90)")
  .attr("y", -margin.left + 15)
  .attr("x", -height/2)
  .attr("dy", "0.75em")
  .attr("text-anchor", "middle")
  .style("font-size", "12px")
  .text("Number of Swing Counties");

// Add X axis label
g.append("text")
  .attr("text-anchor", "middle")
  .attr("x", width/2)
  .attr("y", height + margin.bottom - 20)
  .style("font-size", "12px")
  .text("Region");

// Function to update chart for a given year
function updateChart(year) {
  const yearData = data.filter(d => d.year === year);

  // JOIN new data with old elements
  const bars = g.selectAll(".bar")
    .data(yearData, d => d.region);

  // EXIT old elements
  bars.exit().remove();

  // UPDATE existing bars
  bars.transition().duration(1000)
    .attr("x", d => x(d.region))
    .attr("y", d => y(d.num_swing_counties))
    .attr("height", d => height - y(d.num_swing_counties))
    .attr("width", x.bandwidth())
    .attr("fill", colorScale(year));  // transition to the new color

  // ENTER new bars
  bars.enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", d => x(d.region))
    .attr("width", x.bandwidth())
    .attr("y", y(0))
    .attr("height", 0)
    .attr("fill", colorScale(year))
    .transition().duration(1000)
      .attr("y", d => y(d.num_swing_counties))
      .attr("height", d => height - y(d.num_swing_counties));
}

// Create a dropdown to choose the year
const dropdown = d3.select("#plot")
  .append("div")
  .attr("class", "dropdown-container")
  .append("select")
  .on("change", function(event) {
    const selectedYear = +event.target.value;
    updateChart(selectedYear);
  });

// Populate the dropdown
dropdown.selectAll("option")
  .data(years)
  .enter()
  .append("option")
    .attr("value", d => d)
    .text(d => d);

// Initialize the chart with the first year
updateChart(years[0]);