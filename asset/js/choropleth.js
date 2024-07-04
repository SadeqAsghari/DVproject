document.addEventListener("DOMContentLoaded", function () {
  const svg = d3
    .select("#map svg")
    .attr("preserveAspectRatio", "xMidYMid meet")
    .attr("viewBox", "0 0 960 500");
  const tooltip = d3.select(".tooltip");

  const color = d3
    .scaleThreshold()
    .domain([40, 60, 80])
    .range(["#d4e4f7", "#9cc3e4", "#5ba3d9", "#1d83cf"]);

  const projection = d3.geoMercator().scale(130).translate([480, 250]);

  const path = d3.geoPath().projection(projection);

  d3.csv("asset/data/avg_life_expectancy_by_year.csv").then((data) => {
    const years = [...new Set(data.map((d) => d.Year))];

    d3.select("#year-select")
      .selectAll("option")
      .data(years)
      .enter()
      .append("option")
      .attr("value", (d) => d)
      .text((d) => d);

    d3.json(
      "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson"
    ).then((world) => {
      const year = d3.select("#year-select").property("value");

      updateChoropleth(year, world, data);

      d3.select("#year-select").on("change", function () {
        const year = d3.select(this).property("value");
        updateChoropleth(year, world, data);
      });
    });
  });

  function updateChoropleth(year, world, data) {
    const dataByYear = data.filter((d) => d.Year === year);

    const lifeExpectancyByCountry = {};
    dataByYear.forEach((d) => {
      lifeExpectancyByCountry[d.Country] = +d["Average Life Expectancy"];
    });

    svg.selectAll("path").remove();

    svg
      .append("g")
      .selectAll("path")
      .data(world.features)
      .enter()
      .append("path")
      .attr("d", path)
      .attr("fill", (d) => {
        const country = d.properties.name;
        const lifeExpectancy = lifeExpectancyByCountry[country];
        return lifeExpectancy ? color(lifeExpectancy) : "#ccc";
      })
      .attr("class", "Country")
      .on("mouseover", function (event, d) {
        const country = d.properties.name;
        const lifeExpectancy = lifeExpectancyByCountry[country];

        d3.selectAll(".Country")
          .transition()
          .duration(200)
          .style("opacity", 0.5);
        d3.select(this)
          .transition()
          .duration(200)
          .style("opacity", 1)
          .style("stroke", "black");

        tooltip.transition().duration(200).style("opacity", 1);
        tooltip
          .html(
            `<strong>${country}</strong><br/>Life Expectancy: ${
              lifeExpectancy ? lifeExpectancy : "N/A"
            }`
          )
          .style("left", d3.pointer(event)[0] + 15 + "px")
          .style("top", d3.pointer(event)[1] - 28 + "px");
      })
      .on("mouseout", function (d) {
        tooltip.transition().duration(500).style("opacity", 0);
        d3.selectAll(".Country").transition().duration(200).style("opacity", 1);
        d3.select(this).transition().duration(200).style("stroke", null);
      });

    const legend = d3.select("#legend").html("");
    const legendItems = [
      { label: "<40", color: color(0) },
      { label: "40-60", color: color(50) },
      { label: "60-80", color: color(70) },
      { label: "80+", color: color(90) },
    ];

    const legendItem = legend
      .selectAll(".legend-item")
      .data(legendItems)
      .enter()
      .append("div")
      .attr("class", "legend-item flex items-center mb-2");

    legendItem
      .append("div")
      .style("width", "20px")
      .style("height", "20px")
      .style("background-color", (d) => d.color)
      .style("margin-right", "10px");

    legendItem.append("span").text((d) => d.label);
  }
});
