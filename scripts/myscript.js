// add your JavaScript/D3 to this file

// Load GeoJSON and Swing Dataset
Promise.all([
    d3.json("counties.geojson"), // GeoJSON file
    d3.csv("swing_counties.csv") // Updated Swing dataset
]).then(([geoData, swingData]) => {
    // Preprocess swingData
    swingData.forEach(d => {
        d.county_fips = d.county_fips.padStart(5, "0"); // Ensure 5-digit string
    });

    // Group swing data by year
    const swingByYear = d3.group(swingData, d => d.year);

    // Create a map projection and path generator
    const projection = d3.geoAlbersUsa().scale(1000).translate([400, 250]);
    const path = d3.geoPath().projection(projection);

    // Set up SVG canvas
    const svg = d3.select("#map").append("svg")
        .attr("width", 800)
        .attr("height", 500);

    // Tooltip for interactivity
    const tooltip = d3.select("#tooltip");

    // Draw counties
    svg.append("g")
        .selectAll("path")
        .data(geoData.features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("fill", d => getSwingColor(d.properties.GEOID, 2000)) // Default year
        .attr("stroke", "#ccc")
        .on("mouseover", (event, d) => {
            const data = getSwingData(d.properties.GEOID, 2000); // Default year
            tooltip.style("display", "block")
                .html(`
                    <strong>${data.county_name}, ${data.state_po}</strong><br>
                    Swing Status: ${data.is_swing === "TRUE" ? "Swing" : "No Swing"}<br>
                    Year: 2000
                `)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 10) + "px");
        })
        .on("mouseout", () => tooltip.style("display", "none"));

    // Add year slider
    const yearLabel = d3.select("#yearLabel");
    d3.select("#yearSlider").on("input", function () {
        const year = +this.value;
        yearLabel.text(year);
        d3.selectAll("path")
            .attr("fill", d => getSwingColor(d.properties.GEOID, year));
    });

    // Helper functions
    function getSwingColor(geoid, year) {
        const data = getSwingData(geoid, year);
        return data.is_swing === "TRUE" ? "orange" : "blue";
    }

    function getSwingData(geoid, year) {
        const yearData = swingByYear.get(String(year)); // Get data for the year
        if (!yearData) {
            return { is_swing: "FALSE", county_name: "Unknown", state_po: "Unknown" };
        }
        const countyData = yearData.find(d => d.county_fips === geoid);
        return countyData || { is_swing: "FALSE", county_name: "Unknown", state_po: "Unknown" };
    }
});

