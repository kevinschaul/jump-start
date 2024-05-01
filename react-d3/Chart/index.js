import { useEffect, useRef } from "react";
import { SizeMe } from "react-sizeme";
import { select } from "d3-selection";

const Chart = (props) => {
  const { size } = props;

  const margin = {
    top: 10,
    right: 10,
    bottom: 10,
    left: 10,
  };

  const width = size.width - margin.left - margin.right;
  const height = size.height - margin.top - margin.bottom;

  const ref = useRef();

  useEffect(() => {
    const svg = select(ref.current).select("svg").html("");

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
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
  return <SizeMe>{({ size }) => <Chart size={size} />}</SizeMe>;
};

export { SizedChart as default };
