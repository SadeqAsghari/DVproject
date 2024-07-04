document.addEventListener("DOMContentLoaded", function () {
  const margin = { top: 20, right: 30, bottom: 50, left: 60 },
    width = 960 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

  const svg = d3
    .select("#line-chart svg")
    .attr(
      "viewBox",
      `0 0 ${width + margin.left + margin.right} ${
        height + margin.top + margin.bottom
      }`
    )
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const tooltip = d3
    .select("#line-chart .tooltip")
    .style("position", "absolute")
    .style("z-index", "1000");
  function updateTooltip(event) {
    const svgRect = svg.node().getBoundingClientRect();
    tooltip.transition().duration(200).style("opacity", 0.9);
    tooltip
      .style("left", event.clientX - svgRect.left + "px")
      .style("top", event.clientY - svgRect.top + "px");
  }
  const x = d3.scaleTime().range([0, width]);
  const y = d3.scaleLinear().range([height, 0]);

  const line = d3
    .line()
    .x((d) => x(d.Year))
    .y((d) => y(d["Average Life Expectancy"]));

  d3.csv("asset/data/avg_life_expectancy_by_year.csv").then((data) => {
    data.forEach((d) => {
      d.Year = d3.timeParse("%Y")(d.Year);
      d["Average Life Expectancy"] = +d["Average Life Expectancy"];
    });

    const countries = [...new Set(data.map((d) => d.Country))];

    d3.select("#country-select")
      .selectAll("option")
      .data(countries)
      .enter()
      .append("option")
      .attr("value", (d) => d)
      .text((d) => d);

    const country = d3.select("#country-select").property("value");
    updateLineChart(country, data);

    d3.select("#country-select").on("change", function () {
      const country = d3.select(this).property("value");
      updateLineChart(country, data);
    });
  });

  function updateLineChart(country, data) {
    const countryData = data.filter((d) => d.Country === country);

    x.domain(d3.extent(countryData, (d) => d.Year));
    y.domain([40, 100]);

    svg.selectAll(".line").remove();
    svg.selectAll(".dot").remove();
    svg.selectAll(".axis").remove();

    svg
      .append("path")
      .datum(countryData)
      .attr("class", "line")
      .attr("d", line)
      .style("fill", "none")
      .style("stroke", "steelblue")
      .style("stroke-width", "2px");

    svg
      .selectAll(".dot")
      .data(countryData)
      .enter()
      .append("circle")
      .attr("class", "dot")
      .attr("cx", (d) => x(d.Year))
      .attr("cy", (d) => y(d["Average Life Expectancy"]))
      .attr("r", 5)
      .style("fill", "steelblue")
      .on("mouseover", function (event, d) {
        updateTooltip(event);
        tooltip.html(
          `Year: ${d3.timeFormat("%Y")(d.Year)}<br/>Life Expectancy: ${
            d["Average Life Expectancy"]
          }`
        );
        // .style("position", "absolute")

        // .style("left", d3.pointer(event)[0] + "px")
        // .style("top", d3.pointer(event)[1] + "px");
      })
      .on("mouseout", function () {
        tooltip.transition().duration(500).style("opacity", 0);
      });

    svg
      .append("g")
      .attr("class", "axis axis--x")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%Y")));

    svg.append("g").attr("class", "axis axis--y").call(d3.axisLeft(y));

    svg
      .append("text")
      .attr("transform", `translate(${width / 2},${height + margin.bottom})`)
      .style("text-anchor", "middle")
      .text("Year");

    svg
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - height / 2)
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("Average Life Expectancy");
  }
});
