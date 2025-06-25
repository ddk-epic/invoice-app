import { Svg, Line } from "@react-pdf/renderer";
import React from "react";

export const Overline = () => (
  <Svg height="8" width="600">
    <Line x1="0" y1="6" x2="526" y2="6" strokeWidth={1.5} stroke="rgb(0,0,0)" />
  </Svg>
);
export const UnderLine = () => (
  <Svg height="5" width="600">
    <Line x1="0" y1="1" x2="526" y2="1" strokeWidth={1.5} stroke="rgb(0,0,0)" />
  </Svg>
);
