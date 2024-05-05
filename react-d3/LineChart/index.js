import { useEffect, useRef } from "react";
import { SizeMe } from "react-sizeme";
import { select } from "d3-selection";
import { extent } from "d3-array";
import { scaleLinear } from "d3-scale";
import { line } from "d3-shape";

const data = [
  { year: 2020, value: 10 },
  { year: 2021, value: 8 },
  { year: 2022, value: 6 },
  { year: 2023, value: 14 },
]

const LineChart = (props) => {
  const { size } = props;

  const margin = {
    top: 10,
    right: 10,
    bottom: 10,
    left: 10,
  };

  const width = size.width - margin.left - margin.right;
  const height = (width * 0.5) - margin.top - margin.bottom;

  const ref = useRef();

  useEffect(() => {
    const svg = select(ref.current).select("svg").html("");

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = scaleLinear()
      .domain(extent(data, d => d.year))
      .range([0, width])

    const y = scaleLinear()
      .domain(extent(data, d => d.value))
      .range([height, 0])

    const l = line()
      .x(d => x(d.year))
      .y(d => y(d.value))

    g.selectAll('path')
      .data([data])
      .join('path')
      .attr('d', l)
      .style('fill', 'none')
      .style('stroke', '#000')
      .style('stroke-width', 3)
    
  }, [margin]);

  return (
    <div ref={ref}>
      <svg
        style={{ width: "100%" }}
        width={width + margin.left + margin.right}
        height={height + margin.top + margin.bottom}
      />
    </div>
  );
};

const SizedChart = (props) => {
  return <SizeMe>{({ size }) => <LineChart size={size} />}</SizeMe>;
};

export { SizedChart as default };
