import { useEffect, useRef } from "react";
import { useResizeDetector } from "react-resize-detector";
import { select } from "d3-selection";
import { extent, max } from "d3-array";
import { scaleLinear, scaleTime } from "d3-scale";
import { line } from "d3-shape";
import { axisBottom, axisLeft } from "d3-axis";

const LineChart = (props) => {
  const { data } = props;
  const { width, height, ref } = useResizeDetector();

  const margin = {
    top: 10,
    right: 30,
    bottom: 20,
    left: 30,
  };

  const chartWidth = width - margin.left - margin.right;
  const chartHeight = chartWidth * 0.4 - margin.top - margin.bottom;

  useEffect(() => {
    const svg = select(ref.current).select("svg").html("");

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = scaleTime()
      .domain(extent(data, (d) => d.date))
      .range([0, chartWidth]);

    const y = scaleLinear()
      .domain([0, max(data, (d) => d.rate)])
      .range([chartHeight, 0]);

    const gY = g.append("g").call(axisLeft(y).tickSize(-width).ticks(5));

    gY.selectAll(".tick line").style("stroke", "#ccc");

    gY.selectAll(".domain").remove();

    const gX = g
      .append("g")
      .attr("transform", `translate(0, ${chartHeight})`)
      .call(axisBottom(x));

    gX.selectAll(".tick line").remove();
    gX.selectAll(".domain").remove();

    const l = line()
      .x((d) => x(d.date))
      .y((d) => y(d.rate));

    g.append("g")
      .selectAll("path")
      .data([data])
      .join("path")
      .attr("d", l)
      .style("fill", "none")
      .style("stroke", "#000")
      .style("stroke-width", 3);
  }, [margin]);

  return (
    <div ref={ref}>
      <svg
        style={{ width: "100%" }}
        width={chartWidth + margin.left + margin.right}
        height={chartHeight + margin.top + margin.bottom}
      />
    </div>
  );
};

export { LineChart as default };
