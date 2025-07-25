"use client";

import React from "react";
import { Svg, G, Path } from "@react-pdf/renderer";

const Logo = ({ color: fillColor }: { color: string }) => (
  <Svg width="51mm" height="14mm" viewBox="0 0 51 14">
    <G transform="translate(0,-283)">
      <G transform="matrix(0.26458333,0,0,0.26458333,-162.48689,246.22541)">
        <G transform="translate(623.446,182)">
          <Path
            style={{
              fill: fillColor,
            }}
            d="m 2.5546875,0 v -23.0625 q 0,-4.289062 2.6015625,-7.007812 2.6015625,-2.71875 6.75,-2.71875 4.921875,0 7.570312,4.523437 1.617188,-2.4375 3.46875,-3.46875 1.851563,-1.054687 4.570313,-1.054687 4.3125,0 6.609375,2.71875 2.296875,2.71875 2.296875,7.828125 V 0 H 26.90625 v -20.8125 q 0,-1.546875 -0.257813,-2.039062 -0.234375,-0.515625 -0.984375,-0.515625 -1.40625,0 -1.40625,2.390625 V 0 h -9.515624 v -20.8125 q 0,-1.523437 -0.257813,-2.039062 -0.257812,-0.515625 -1.007812,-0.515625 -1.40625,0 -1.40625,2.554687 V 0 Z"
          />
          <Path
            style={{
              fill: fillColor,
            }}
            d="m 53.8125,-16.054687 v 8.4374995 H 51.070312 V 0 h -9.515625 v -20.34375 q 0,-5.90625 3.210938,-9.164062 3.234375,-3.28125 9.070312,-3.28125 5.625,0 8.320313,2.976562 2.695312,2.953125 2.695312,9.140625 V 0 h -9.515625 v -20.039062 q 0,-1.875 -0.445312,-2.601563 -0.445313,-0.726562 -1.59375,-0.726562 -2.226563,0 -2.226563,3.328125 v 3.984375 z"
          />
          <Path
            style={{
              fill: fillColor,
            }}
            d="m 92.648437,-31.992187 -8.320312,15.5625 L 92.929687,0 H 82.921875 L 78.984375,-7.7578125 75.65625,0 H 65.8125 l 8.789062,-16.171875 -8.320312,-15.820312 h 9.914062 l 3.726563,7.265625 3,-7.265625 z"
          />
          <Path
            style={{
              fill: fillColor,
            }}
            d="M 104.03906,-31.992187 V 0 h -9.515623 v -31.992187 z"
          />
          <Path
            style={{
              fill: fillColor,
            }}
            d="m 109.80469,0 v -23.0625 q 0,-4.289062 2.60156,-7.007812 2.60156,-2.71875 6.75,-2.71875 4.92188,0 7.57031,4.523437 1.61719,-2.4375 3.46875,-3.46875 1.85156,-1.054687 4.57031,-1.054687 4.3125,0 6.60938,2.71875 2.29687,2.71875 2.29687,7.828125 V 0 h -9.51562 v -20.8125 q 0,-1.546875 -0.25781,-2.039062 -0.23438,-0.515625 -0.98438,-0.515625 -1.40625,0 -1.40625,2.390625 V 0 h -9.51562 v -20.8125 q 0,-1.523437 -0.25781,-2.039062 -0.25782,-0.515625 -1.00782,-0.515625 -1.40625,0 -1.40625,2.554687 V 0 Z"
          />
          <Path
            style={{
              fill: fillColor,
            }}
            d="m 161.0625,-16.054687 v 8.4374995 h -2.74219 V 0 h -9.51562 v -20.34375 q 0,-5.90625 3.21093,-9.164062 3.23438,-3.28125 9.07032,-3.28125 5.625,0 8.32031,2.976562 2.69531,2.953125 2.69531,9.140625 V 0 h -9.51562 v -20.039062 q 0,-1.875 -0.44532,-2.601563 -0.44531,-0.726562 -1.59375,-0.726562 -2.22656,0 -2.22656,3.328125 v 3.984375 z"
          />
        </G>
      </G>
      <G transform="matrix(0.27707016,0,0,0.26423611,-171.49057,245.88363)">
        <Path
          style={{
            stroke: fillColor,
            strokeWidth: 4,
          }}
          d="m 621,143 h 180 v 48 H 621 Z"
        />
      </G>
    </G>
  </Svg>
);
export default Logo;
