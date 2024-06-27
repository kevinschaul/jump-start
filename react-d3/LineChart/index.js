import { useEffect, useRef } from "react";
import { useResizeDetector } from "react-resize-detector";
import { select } from "d3-selection";
import { extent, max } from "d3-array";
import { scaleLinear, scaleTime } from "d3-scale";
import { line } from "d3-shape";
import { axisBottom, axisLeft } from "d3-axis";

const formatPercent = (s) => `${s.toFixed(1)}%`;

const LineChart = (props) => {
  const { data } = props;
  const { width, height, ref } = useResizeDetector();

  const isSkinny = width < 400;
  const margin = {
    top: 10,
    right: 60,
    bottom: 20,
    left: 30,
  };

  const chartWidth = width - margin.left - margin.right;
  const chartHeight = chartWidth * 0.4 - margin.top - margin.bottom;

  const fontSize = {
    valueLabel: isSkinny ? 14 : 14,
    annotation: isSkinny ? 16 : 16,
    axis: isSkinny ? 13 : 14,
  };

  useEffect(() => {
    const svg = select(ref.current)
      .html("")
      .selectAll("svg")
      .data([0])
      .join("svg")
      .attr("width", chartWidth + margin.left + margin.right)
      .attr("height", chartHeight + margin.top + margin.bottom);

    // Group to draw the actual chart data to
    const g = svg
      .selectAll("g.chart")
      .data([0])
      .join("g")
      .attr("class", "chart")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Group to draw annotations
    const gAbove = svg
      .selectAll("g.chart-above")
      .data([0])
      .join("g")
      .attr("class", "chart-above")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    const x = scaleTime()
      .domain(extent(data, (d) => d.date))
      .range([0, chartWidth]);

    const y = scaleLinear()
      .domain([0, max(data, (d) => d.rate)])
      .range([chartHeight, 0]);

    const gY = g.append("g").call(axisLeft(y).tickSize(-width).ticks(5));
    gY.selectAll(".domain").remove();

    const topTick = gY.selectAll(".tick:last-child");
    const bottomTick = gY.selectAll(".tick:first-child");

    // Add unit to the top tick
    topTick
      .append("text")
      .text("%")
      .attr("text-anchor", "start")
      .attr("x", -2)
      .attr("y", 0)
      .attr("dy", "0.32em")
      .style("font-weight", "400");

    // Slide top tick line over to make room for unit
    topTick.select("line").attr("x1", 14);

    gY.selectAll(".tick line").style("stroke", "#ccc");
    gY.selectAll(".tick text")
      .style("font-size", fontSize.axis)
      .style("fill", "#666");

    bottomTick.select("text").style("font-weight", "bold");
    bottomTick.select("line").style("stroke", "#333");

    const gX = g
      .append("g")
      .attr("transform", `translate(0, ${chartHeight})`)
      .call(axisBottom(x).ticks(4));
    gX.selectAll(".domain").remove();

    gX.selectAll(".tick line").remove();
    gX.selectAll(".tick text")
      .style("font-size", fontSize.axis)
      .style("fill", "#666");

    const l = line()
      .x((d) => x(d.date))
      .y((d) => y(d.rate));

    g.selectAll("path")
      .data([data])
      .join("path")
      .attr("d", l)
      .style("fill", "none")
      .style("stroke", "#0f7180")
      .style("stroke-width", 3);

    g.selectAll("circle")
      .data([data[0], data[data.length - 1]])
      .join("circle")
      .attr("cx", (d) => x(d.date))
      .attr("cy", (d) => y(d.rate))
      .attr("r", 6)
      .style("fill", "#0f7180")
      .style("stroke-width", 2)
      .style("stroke", "#fff");

    gAbove
      .selectAll(".label-value")
      .data([data[data.length - 1]])
      .join("text")
      .attr("class", "label-value")
      .attr("x", (d) => x(d.date) + 8)
      .attr("y", (d) => y(d.rate) - 4)
      .text((d) => formatPercent(d.rate))
      .style("font-size", fontSize.valueLabel)
      .style("font-weight", "bold");
  }, [margin]);

  return (
    <div ref={ref}>
      <svg style={{ width: "100%" }} />
    </div>
  );
};

export { LineChart as default };
