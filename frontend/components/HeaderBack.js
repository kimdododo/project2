import React from "react";
import ButtonBackHome from "./ButtonBackHome";

const HeaderBack = (props) => {
  return (
    <div className=" flex flex-row justify-between mb-10">
      <div className="relative top-0">
        <ButtonBackHome className={"w-8 h-8"} />
      </div>
      <h1 className="text-xl md:text-2xl font-extrabold">{props.title}</h1>
      <div className="w-10 h-10"></div>
    </div>
  );
};

export default HeaderBack;
