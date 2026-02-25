const Arrow = ({ direction = "left", size = 24 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 19.676 7.809"
    style={{
      width: size,
      height: "auto",
      transform: direction === "right" ? "scaleX(-1)" : undefined,
    }}
  >
    <line
      x1="19.463"
      y1="3.923"
      x2="6.163"
      y2="3.923"
      fill="none"
      stroke="currentColor"
      strokeMiterlimit="10"
    />
    <polygon
      points="8.972 .22 7.399 3.923 8.972 7.626 .194 3.923 8.972 .22"
      fill="currentColor"
    />
  </svg>
);

export default Arrow;
