import React from "react";

const UnderLineText = ({
  text,
  color = "primary",
  thickness = "8px",
  className = "",
}) => {
  const underlineClass = `
    relative
    ${className}
  `;

  const textClass = `
    relative
    z-10
  `;

  const getBorderClass = () => {
    if (color.startsWith("#")) {
      // If color is a hex code
      return `bg-[${color}]`;
    } else if (color === "primary") {
      return "bg-primary";
    } else {
      return `bg-${color}-500`;
    }
  };

  const borderClass = `
    absolute
    bottom-0
    left-0
    w-full
    ${getBorderClass()}
    ${thickness === "8px" ? "h-2" : `h-${thickness.replace("px", "")}`}
    -z-10
  `;

  return (
    <span className={underlineClass}>
      <span className={textClass}>{text}</span>
      <span className={borderClass}></span>
    </span>
  );
};

export default UnderLineText;
