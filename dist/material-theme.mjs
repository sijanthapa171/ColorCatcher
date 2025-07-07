var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function signum(num) {
  if (num < 0) {
    return -1;
  } else if (num === 0) {
    return 0;
  } else {
    return 1;
  }
}
function lerp(start, stop, amount) {
  return (1 - amount) * start + amount * stop;
}
function clampInt(min, max, input) {
  if (input < min) {
    return min;
  } else if (input > max) {
    return max;
  }
  return input;
}
function clampDouble(min, max, input) {
  if (input < min) {
    return min;
  } else if (input > max) {
    return max;
  }
  return input;
}
function sanitizeDegreesDouble(degrees) {
  degrees = degrees % 360;
  if (degrees < 0) {
    degrees = degrees + 360;
  }
  return degrees;
}
function rotationDirection(from, to) {
  const increasingDifference = sanitizeDegreesDouble(to - from);
  return increasingDifference <= 180 ? 1 : -1;
}
function differenceDegrees(a, b) {
  return 180 - Math.abs(Math.abs(a - b) - 180);
}
function matrixMultiply(row, matrix) {
  const a = row[0] * matrix[0][0] + row[1] * matrix[0][1] + row[2] * matrix[0][2];
  const b = row[0] * matrix[1][0] + row[1] * matrix[1][1] + row[2] * matrix[1][2];
  const c = row[0] * matrix[2][0] + row[1] * matrix[2][1] + row[2] * matrix[2][2];
  return [a, b, c];
}
/**
* @license
* Copyright 2021 Google LLC
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*      http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
const SRGB_TO_XYZ = [
  [0.41233895, 0.35762064, 0.18051042],
  [0.2126, 0.7152, 0.0722],
  [0.01932141, 0.11916382, 0.95034478]
];
const XYZ_TO_SRGB = [
  [
    3.2413774792388685,
    -1.5376652402851851,
    -0.49885366846268053
  ],
  [
    -0.9691452513005321,
    1.8758853451067872,
    0.04156585616912061
  ],
  [
    0.05562093689691305,
    -0.20395524564742123,
    1.0571799111220335
  ]
];
const WHITE_POINT_D65 = [95.047, 100, 108.883];
function argbFromRgb(red, green, blue) {
  return (255 << 24 | (red & 255) << 16 | (green & 255) << 8 | blue & 255) >>> 0;
}
function argbFromLinrgb(linrgb) {
  const r2 = delinearized(linrgb[0]);
  const g = delinearized(linrgb[1]);
  const b = delinearized(linrgb[2]);
  return argbFromRgb(r2, g, b);
}
function redFromArgb(argb) {
  return argb >> 16 & 255;
}
function greenFromArgb(argb) {
  return argb >> 8 & 255;
}
function blueFromArgb(argb) {
  return argb & 255;
}
function argbFromXyz(x, y, z) {
  const matrix = XYZ_TO_SRGB;
  const linearR = matrix[0][0] * x + matrix[0][1] * y + matrix[0][2] * z;
  const linearG = matrix[1][0] * x + matrix[1][1] * y + matrix[1][2] * z;
  const linearB = matrix[2][0] * x + matrix[2][1] * y + matrix[2][2] * z;
  const r2 = delinearized(linearR);
  const g = delinearized(linearG);
  const b = delinearized(linearB);
  return argbFromRgb(r2, g, b);
}
function xyzFromArgb(argb) {
  const r2 = linearized(redFromArgb(argb));
  const g = linearized(greenFromArgb(argb));
  const b = linearized(blueFromArgb(argb));
  return matrixMultiply([r2, g, b], SRGB_TO_XYZ);
}
function argbFromLstar(lstar) {
  const y = yFromLstar(lstar);
  const component = delinearized(y);
  return argbFromRgb(component, component, component);
}
function lstarFromArgb(argb) {
  const y = xyzFromArgb(argb)[1];
  return 116 * labF(y / 100) - 16;
}
function yFromLstar(lstar) {
  return 100 * labInvf((lstar + 16) / 116);
}
function lstarFromY(y) {
  return labF(y / 100) * 116 - 16;
}
function linearized(rgbComponent) {
  const normalized = rgbComponent / 255;
  if (normalized <= 0.040449936) {
    return normalized / 12.92 * 100;
  } else {
    return Math.pow((normalized + 0.055) / 1.055, 2.4) * 100;
  }
}
function delinearized(rgbComponent) {
  const normalized = rgbComponent / 100;
  let delinearized2 = 0;
  if (normalized <= 31308e-7) {
    delinearized2 = normalized * 12.92;
  } else {
    delinearized2 = 1.055 * Math.pow(normalized, 1 / 2.4) - 0.055;
  }
  return clampInt(0, 255, Math.round(delinearized2 * 255));
}
function whitePointD65() {
  return WHITE_POINT_D65;
}
function labF(t2) {
  const e2 = 216 / 24389;
  const kappa = 24389 / 27;
  if (t2 > e2) {
    return Math.pow(t2, 1 / 3);
  } else {
    return (kappa * t2 + 16) / 116;
  }
}
function labInvf(ft) {
  const e2 = 216 / 24389;
  const kappa = 24389 / 27;
  const ft3 = ft * ft * ft;
  if (ft3 > e2) {
    return ft3;
  } else {
    return (116 * ft - 16) / kappa;
  }
}
/**
* @license
* Copyright 2021 Google LLC
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*      http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
class ViewingConditions {
  /**
   * Create ViewingConditions from a simple, physically relevant, set of
   * parameters.
   *
   * @param whitePoint White point, measured in the XYZ color space.
   *     default = D65, or sunny day afternoon
   * @param adaptingLuminance The luminance of the adapting field. Informally,
   *     how bright it is in the room where the color is viewed. Can be
   *     calculated from lux by multiplying lux by 0.0586. default = 11.72,
   *     or 200 lux.
   * @param backgroundLstar The lightness of the area surrounding the color.
   *     measured by L* in L*a*b*. default = 50.0
   * @param surround A general description of the lighting surrounding the
   *     color. 0 is pitch dark, like watching a movie in a theater. 1.0 is a
   *     dimly light room, like watching TV at home at night. 2.0 means there
   *     is no difference between the lighting on the color and around it.
   *     default = 2.0
   * @param discountingIlluminant Whether the eye accounts for the tint of the
   *     ambient lighting, such as knowing an apple is still red in green light.
   *     default = false, the eye does not perform this process on
   *       self-luminous objects like displays.
   */
  static make(whitePoint = whitePointD65(), adaptingLuminance = 200 / Math.PI * yFromLstar(50) / 100, backgroundLstar = 50, surround = 2, discountingIlluminant = false) {
    const xyz = whitePoint;
    const rW = xyz[0] * 0.401288 + xyz[1] * 0.650173 + xyz[2] * -0.051461;
    const gW = xyz[0] * -0.250268 + xyz[1] * 1.204414 + xyz[2] * 0.045854;
    const bW = xyz[0] * -2079e-6 + xyz[1] * 0.048952 + xyz[2] * 0.953127;
    const f = 0.8 + surround / 10;
    const c = f >= 0.9 ? lerp(0.59, 0.69, (f - 0.9) * 10) : lerp(0.525, 0.59, (f - 0.8) * 10);
    let d = discountingIlluminant ? 1 : f * (1 - 1 / 3.6 * Math.exp((-adaptingLuminance - 42) / 92));
    d = d > 1 ? 1 : d < 0 ? 0 : d;
    const nc = f;
    const rgbD = [
      d * (100 / rW) + 1 - d,
      d * (100 / gW) + 1 - d,
      d * (100 / bW) + 1 - d
    ];
    const k = 1 / (5 * adaptingLuminance + 1);
    const k4 = k * k * k * k;
    const k4F = 1 - k4;
    const fl = k4 * adaptingLuminance + 0.1 * k4F * k4F * Math.cbrt(5 * adaptingLuminance);
    const n2 = yFromLstar(backgroundLstar) / whitePoint[1];
    const z = 1.48 + Math.sqrt(n2);
    const nbb = 0.725 / Math.pow(n2, 0.2);
    const ncb = nbb;
    const rgbAFactors = [
      Math.pow(fl * rgbD[0] * rW / 100, 0.42),
      Math.pow(fl * rgbD[1] * gW / 100, 0.42),
      Math.pow(fl * rgbD[2] * bW / 100, 0.42)
    ];
    const rgbA = [
      400 * rgbAFactors[0] / (rgbAFactors[0] + 27.13),
      400 * rgbAFactors[1] / (rgbAFactors[1] + 27.13),
      400 * rgbAFactors[2] / (rgbAFactors[2] + 27.13)
    ];
    const aw = (2 * rgbA[0] + rgbA[1] + 0.05 * rgbA[2]) * nbb;
    return new ViewingConditions(n2, aw, nbb, ncb, c, nc, rgbD, fl, Math.pow(fl, 0.25), z);
  }
  /**
   * Parameters are intermediate values of the CAM16 conversion process. Their
   * names are shorthand for technical color science terminology, this class
   * would not benefit from documenting them individually. A brief overview
   * is available in the CAM16 specification, and a complete overview requires
   * a color science textbook, such as Fairchild's Color Appearance Models.
   */
  constructor(n2, aw, nbb, ncb, c, nc, rgbD, fl, fLRoot, z) {
    this.n = n2;
    this.aw = aw;
    this.nbb = nbb;
    this.ncb = ncb;
    this.c = c;
    this.nc = nc;
    this.rgbD = rgbD;
    this.fl = fl;
    this.fLRoot = fLRoot;
    this.z = z;
  }
}
ViewingConditions.DEFAULT = ViewingConditions.make();
/**
* @license
* Copyright 2021 Google LLC
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*      http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
class Cam16 {
  /**
   * All of the CAM16 dimensions can be calculated from 3 of the dimensions, in
   * the following combinations:
   *      -  {j or q} and {c, m, or s} and hue
   *      - jstar, astar, bstar
   * Prefer using a static method that constructs from 3 of those dimensions.
   * This constructor is intended for those methods to use to return all
   * possible dimensions.
   *
   * @param hue
   * @param chroma informally, colorfulness / color intensity. like saturation
   *     in HSL, except perceptually accurate.
   * @param j lightness
   * @param q brightness; ratio of lightness to white point's lightness
   * @param m colorfulness
   * @param s saturation; ratio of chroma to white point's chroma
   * @param jstar CAM16-UCS J coordinate
   * @param astar CAM16-UCS a coordinate
   * @param bstar CAM16-UCS b coordinate
   */
  constructor(hue, chroma, j, q, m, s, jstar, astar, bstar) {
    this.hue = hue;
    this.chroma = chroma;
    this.j = j;
    this.q = q;
    this.m = m;
    this.s = s;
    this.jstar = jstar;
    this.astar = astar;
    this.bstar = bstar;
  }
  /**
   * CAM16 instances also have coordinates in the CAM16-UCS space, called J*,
   * a*, b*, or jstar, astar, bstar in code. CAM16-UCS is included in the CAM16
   * specification, and is used to measure distances between colors.
   */
  distance(other) {
    const dJ = this.jstar - other.jstar;
    const dA = this.astar - other.astar;
    const dB = this.bstar - other.bstar;
    const dEPrime = Math.sqrt(dJ * dJ + dA * dA + dB * dB);
    const dE = 1.41 * Math.pow(dEPrime, 0.63);
    return dE;
  }
  /**
   * @param argb ARGB representation of a color.
   * @return CAM16 color, assuming the color was viewed in default viewing
   *     conditions.
   */
  static fromInt(argb) {
    return Cam16.fromIntInViewingConditions(argb, ViewingConditions.DEFAULT);
  }
  /**
   * @param argb ARGB representation of a color.
   * @param viewingConditions Information about the environment where the color
   *     was observed.
   * @return CAM16 color.
   */
  static fromIntInViewingConditions(argb, viewingConditions) {
    const red = (argb & 16711680) >> 16;
    const green = (argb & 65280) >> 8;
    const blue = argb & 255;
    const redL = linearized(red);
    const greenL = linearized(green);
    const blueL = linearized(blue);
    const x = 0.41233895 * redL + 0.35762064 * greenL + 0.18051042 * blueL;
    const y = 0.2126 * redL + 0.7152 * greenL + 0.0722 * blueL;
    const z = 0.01932141 * redL + 0.11916382 * greenL + 0.95034478 * blueL;
    const rC = 0.401288 * x + 0.650173 * y - 0.051461 * z;
    const gC = -0.250268 * x + 1.204414 * y + 0.045854 * z;
    const bC = -2079e-6 * x + 0.048952 * y + 0.953127 * z;
    const rD = viewingConditions.rgbD[0] * rC;
    const gD = viewingConditions.rgbD[1] * gC;
    const bD = viewingConditions.rgbD[2] * bC;
    const rAF = Math.pow(viewingConditions.fl * Math.abs(rD) / 100, 0.42);
    const gAF = Math.pow(viewingConditions.fl * Math.abs(gD) / 100, 0.42);
    const bAF = Math.pow(viewingConditions.fl * Math.abs(bD) / 100, 0.42);
    const rA = signum(rD) * 400 * rAF / (rAF + 27.13);
    const gA = signum(gD) * 400 * gAF / (gAF + 27.13);
    const bA = signum(bD) * 400 * bAF / (bAF + 27.13);
    const a = (11 * rA + -12 * gA + bA) / 11;
    const b = (rA + gA - 2 * bA) / 9;
    const u2 = (20 * rA + 20 * gA + 21 * bA) / 20;
    const p2 = (40 * rA + 20 * gA + bA) / 20;
    const atan2 = Math.atan2(b, a);
    const atanDegrees = atan2 * 180 / Math.PI;
    const hue = atanDegrees < 0 ? atanDegrees + 360 : atanDegrees >= 360 ? atanDegrees - 360 : atanDegrees;
    const hueRadians = hue * Math.PI / 180;
    const ac = p2 * viewingConditions.nbb;
    const j = 100 * Math.pow(ac / viewingConditions.aw, viewingConditions.c * viewingConditions.z);
    const q = 4 / viewingConditions.c * Math.sqrt(j / 100) * (viewingConditions.aw + 4) * viewingConditions.fLRoot;
    const huePrime = hue < 20.14 ? hue + 360 : hue;
    const eHue = 0.25 * (Math.cos(huePrime * Math.PI / 180 + 2) + 3.8);
    const p1 = 5e4 / 13 * eHue * viewingConditions.nc * viewingConditions.ncb;
    const t2 = p1 * Math.sqrt(a * a + b * b) / (u2 + 0.305);
    const alpha = Math.pow(t2, 0.9) * Math.pow(1.64 - Math.pow(0.29, viewingConditions.n), 0.73);
    const c = alpha * Math.sqrt(j / 100);
    const m = c * viewingConditions.fLRoot;
    const s = 50 * Math.sqrt(alpha * viewingConditions.c / (viewingConditions.aw + 4));
    const jstar = (1 + 100 * 7e-3) * j / (1 + 7e-3 * j);
    const mstar = 1 / 0.0228 * Math.log(1 + 0.0228 * m);
    const astar = mstar * Math.cos(hueRadians);
    const bstar = mstar * Math.sin(hueRadians);
    return new Cam16(hue, c, j, q, m, s, jstar, astar, bstar);
  }
  /**
   * @param j CAM16 lightness
   * @param c CAM16 chroma
   * @param h CAM16 hue
   */
  static fromJch(j, c, h) {
    return Cam16.fromJchInViewingConditions(j, c, h, ViewingConditions.DEFAULT);
  }
  /**
   * @param j CAM16 lightness
   * @param c CAM16 chroma
   * @param h CAM16 hue
   * @param viewingConditions Information about the environment where the color
   *     was observed.
   */
  static fromJchInViewingConditions(j, c, h, viewingConditions) {
    const q = 4 / viewingConditions.c * Math.sqrt(j / 100) * (viewingConditions.aw + 4) * viewingConditions.fLRoot;
    const m = c * viewingConditions.fLRoot;
    const alpha = c / Math.sqrt(j / 100);
    const s = 50 * Math.sqrt(alpha * viewingConditions.c / (viewingConditions.aw + 4));
    const hueRadians = h * Math.PI / 180;
    const jstar = (1 + 100 * 7e-3) * j / (1 + 7e-3 * j);
    const mstar = 1 / 0.0228 * Math.log(1 + 0.0228 * m);
    const astar = mstar * Math.cos(hueRadians);
    const bstar = mstar * Math.sin(hueRadians);
    return new Cam16(h, c, j, q, m, s, jstar, astar, bstar);
  }
  /**
   * @param jstar CAM16-UCS lightness.
   * @param astar CAM16-UCS a dimension. Like a* in L*a*b*, it is a Cartesian
   *     coordinate on the Y axis.
   * @param bstar CAM16-UCS b dimension. Like a* in L*a*b*, it is a Cartesian
   *     coordinate on the X axis.
   */
  static fromUcs(jstar, astar, bstar) {
    return Cam16.fromUcsInViewingConditions(jstar, astar, bstar, ViewingConditions.DEFAULT);
  }
  /**
   * @param jstar CAM16-UCS lightness.
   * @param astar CAM16-UCS a dimension. Like a* in L*a*b*, it is a Cartesian
   *     coordinate on the Y axis.
   * @param bstar CAM16-UCS b dimension. Like a* in L*a*b*, it is a Cartesian
   *     coordinate on the X axis.
   * @param viewingConditions Information about the environment where the color
   *     was observed.
   */
  static fromUcsInViewingConditions(jstar, astar, bstar, viewingConditions) {
    const a = astar;
    const b = bstar;
    const m = Math.sqrt(a * a + b * b);
    const M = (Math.exp(m * 0.0228) - 1) / 0.0228;
    const c = M / viewingConditions.fLRoot;
    let h = Math.atan2(b, a) * (180 / Math.PI);
    if (h < 0) {
      h += 360;
    }
    const j = jstar / (1 - (jstar - 100) * 7e-3);
    return Cam16.fromJchInViewingConditions(j, c, h, viewingConditions);
  }
  /**
   *  @return ARGB representation of color, assuming the color was viewed in
   *     default viewing conditions, which are near-identical to the default
   *     viewing conditions for sRGB.
   */
  toInt() {
    return this.viewed(ViewingConditions.DEFAULT);
  }
  /**
   * @param viewingConditions Information about the environment where the color
   *     will be viewed.
   * @return ARGB representation of color
   */
  viewed(viewingConditions) {
    const alpha = this.chroma === 0 || this.j === 0 ? 0 : this.chroma / Math.sqrt(this.j / 100);
    const t2 = Math.pow(alpha / Math.pow(1.64 - Math.pow(0.29, viewingConditions.n), 0.73), 1 / 0.9);
    const hRad = this.hue * Math.PI / 180;
    const eHue = 0.25 * (Math.cos(hRad + 2) + 3.8);
    const ac = viewingConditions.aw * Math.pow(this.j / 100, 1 / viewingConditions.c / viewingConditions.z);
    const p1 = eHue * (5e4 / 13) * viewingConditions.nc * viewingConditions.ncb;
    const p2 = ac / viewingConditions.nbb;
    const hSin = Math.sin(hRad);
    const hCos = Math.cos(hRad);
    const gamma = 23 * (p2 + 0.305) * t2 / (23 * p1 + 11 * t2 * hCos + 108 * t2 * hSin);
    const a = gamma * hCos;
    const b = gamma * hSin;
    const rA = (460 * p2 + 451 * a + 288 * b) / 1403;
    const gA = (460 * p2 - 891 * a - 261 * b) / 1403;
    const bA = (460 * p2 - 220 * a - 6300 * b) / 1403;
    const rCBase = Math.max(0, 27.13 * Math.abs(rA) / (400 - Math.abs(rA)));
    const rC = signum(rA) * (100 / viewingConditions.fl) * Math.pow(rCBase, 1 / 0.42);
    const gCBase = Math.max(0, 27.13 * Math.abs(gA) / (400 - Math.abs(gA)));
    const gC = signum(gA) * (100 / viewingConditions.fl) * Math.pow(gCBase, 1 / 0.42);
    const bCBase = Math.max(0, 27.13 * Math.abs(bA) / (400 - Math.abs(bA)));
    const bC = signum(bA) * (100 / viewingConditions.fl) * Math.pow(bCBase, 1 / 0.42);
    const rF = rC / viewingConditions.rgbD[0];
    const gF = gC / viewingConditions.rgbD[1];
    const bF = bC / viewingConditions.rgbD[2];
    const x = 1.86206786 * rF - 1.01125463 * gF + 0.14918677 * bF;
    const y = 0.38752654 * rF + 0.62144744 * gF - 897398e-8 * bF;
    const z = -0.0158415 * rF - 0.03412294 * gF + 1.04996444 * bF;
    const argb = argbFromXyz(x, y, z);
    return argb;
  }
  /// Given color expressed in XYZ and viewed in [viewingConditions], convert to
  /// CAM16.
  static fromXyzInViewingConditions(x, y, z, viewingConditions) {
    const rC = 0.401288 * x + 0.650173 * y - 0.051461 * z;
    const gC = -0.250268 * x + 1.204414 * y + 0.045854 * z;
    const bC = -2079e-6 * x + 0.048952 * y + 0.953127 * z;
    const rD = viewingConditions.rgbD[0] * rC;
    const gD = viewingConditions.rgbD[1] * gC;
    const bD = viewingConditions.rgbD[2] * bC;
    const rAF = Math.pow(viewingConditions.fl * Math.abs(rD) / 100, 0.42);
    const gAF = Math.pow(viewingConditions.fl * Math.abs(gD) / 100, 0.42);
    const bAF = Math.pow(viewingConditions.fl * Math.abs(bD) / 100, 0.42);
    const rA = signum(rD) * 400 * rAF / (rAF + 27.13);
    const gA = signum(gD) * 400 * gAF / (gAF + 27.13);
    const bA = signum(bD) * 400 * bAF / (bAF + 27.13);
    const a = (11 * rA + -12 * gA + bA) / 11;
    const b = (rA + gA - 2 * bA) / 9;
    const u2 = (20 * rA + 20 * gA + 21 * bA) / 20;
    const p2 = (40 * rA + 20 * gA + bA) / 20;
    const atan2 = Math.atan2(b, a);
    const atanDegrees = atan2 * 180 / Math.PI;
    const hue = atanDegrees < 0 ? atanDegrees + 360 : atanDegrees >= 360 ? atanDegrees - 360 : atanDegrees;
    const hueRadians = hue * Math.PI / 180;
    const ac = p2 * viewingConditions.nbb;
    const J = 100 * Math.pow(ac / viewingConditions.aw, viewingConditions.c * viewingConditions.z);
    const Q = 4 / viewingConditions.c * Math.sqrt(J / 100) * (viewingConditions.aw + 4) * viewingConditions.fLRoot;
    const huePrime = hue < 20.14 ? hue + 360 : hue;
    const eHue = 1 / 4 * (Math.cos(huePrime * Math.PI / 180 + 2) + 3.8);
    const p1 = 5e4 / 13 * eHue * viewingConditions.nc * viewingConditions.ncb;
    const t2 = p1 * Math.sqrt(a * a + b * b) / (u2 + 0.305);
    const alpha = Math.pow(t2, 0.9) * Math.pow(1.64 - Math.pow(0.29, viewingConditions.n), 0.73);
    const C = alpha * Math.sqrt(J / 100);
    const M = C * viewingConditions.fLRoot;
    const s = 50 * Math.sqrt(alpha * viewingConditions.c / (viewingConditions.aw + 4));
    const jstar = (1 + 100 * 7e-3) * J / (1 + 7e-3 * J);
    const mstar = Math.log(1 + 0.0228 * M) / 0.0228;
    const astar = mstar * Math.cos(hueRadians);
    const bstar = mstar * Math.sin(hueRadians);
    return new Cam16(hue, C, J, Q, M, s, jstar, astar, bstar);
  }
  /// XYZ representation of CAM16 seen in [viewingConditions].
  xyzInViewingConditions(viewingConditions) {
    const alpha = this.chroma === 0 || this.j === 0 ? 0 : this.chroma / Math.sqrt(this.j / 100);
    const t2 = Math.pow(alpha / Math.pow(1.64 - Math.pow(0.29, viewingConditions.n), 0.73), 1 / 0.9);
    const hRad = this.hue * Math.PI / 180;
    const eHue = 0.25 * (Math.cos(hRad + 2) + 3.8);
    const ac = viewingConditions.aw * Math.pow(this.j / 100, 1 / viewingConditions.c / viewingConditions.z);
    const p1 = eHue * (5e4 / 13) * viewingConditions.nc * viewingConditions.ncb;
    const p2 = ac / viewingConditions.nbb;
    const hSin = Math.sin(hRad);
    const hCos = Math.cos(hRad);
    const gamma = 23 * (p2 + 0.305) * t2 / (23 * p1 + 11 * t2 * hCos + 108 * t2 * hSin);
    const a = gamma * hCos;
    const b = gamma * hSin;
    const rA = (460 * p2 + 451 * a + 288 * b) / 1403;
    const gA = (460 * p2 - 891 * a - 261 * b) / 1403;
    const bA = (460 * p2 - 220 * a - 6300 * b) / 1403;
    const rCBase = Math.max(0, 27.13 * Math.abs(rA) / (400 - Math.abs(rA)));
    const rC = signum(rA) * (100 / viewingConditions.fl) * Math.pow(rCBase, 1 / 0.42);
    const gCBase = Math.max(0, 27.13 * Math.abs(gA) / (400 - Math.abs(gA)));
    const gC = signum(gA) * (100 / viewingConditions.fl) * Math.pow(gCBase, 1 / 0.42);
    const bCBase = Math.max(0, 27.13 * Math.abs(bA) / (400 - Math.abs(bA)));
    const bC = signum(bA) * (100 / viewingConditions.fl) * Math.pow(bCBase, 1 / 0.42);
    const rF = rC / viewingConditions.rgbD[0];
    const gF = gC / viewingConditions.rgbD[1];
    const bF = bC / viewingConditions.rgbD[2];
    const x = 1.86206786 * rF - 1.01125463 * gF + 0.14918677 * bF;
    const y = 0.38752654 * rF + 0.62144744 * gF - 897398e-8 * bF;
    const z = -0.0158415 * rF - 0.03412294 * gF + 1.04996444 * bF;
    return [x, y, z];
  }
}
/**
* @license
* Copyright 2021 Google LLC
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*      http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
class HctSolver {
  /**
   * Sanitizes a small enough angle in radians.
   *
   * @param angle An angle in radians; must not deviate too much
   * from 0.
   * @return A coterminal angle between 0 and 2pi.
   */
  static sanitizeRadians(angle) {
    return (angle + Math.PI * 8) % (Math.PI * 2);
  }
  /**
   * Delinearizes an RGB component, returning a floating-point
   * number.
   *
   * @param rgbComponent 0.0 <= rgb_component <= 100.0, represents
   * linear R/G/B channel
   * @return 0.0 <= output <= 255.0, color channel converted to
   * regular RGB space
   */
  static trueDelinearized(rgbComponent) {
    const normalized = rgbComponent / 100;
    let delinearized2 = 0;
    if (normalized <= 31308e-7) {
      delinearized2 = normalized * 12.92;
    } else {
      delinearized2 = 1.055 * Math.pow(normalized, 1 / 2.4) - 0.055;
    }
    return delinearized2 * 255;
  }
  static chromaticAdaptation(component) {
    const af = Math.pow(Math.abs(component), 0.42);
    return signum(component) * 400 * af / (af + 27.13);
  }
  /**
   * Returns the hue of a linear RGB color in CAM16.
   *
   * @param linrgb The linear RGB coordinates of a color.
   * @return The hue of the color in CAM16, in radians.
   */
  static hueOf(linrgb) {
    const scaledDiscount = matrixMultiply(linrgb, HctSolver.SCALED_DISCOUNT_FROM_LINRGB);
    const rA = HctSolver.chromaticAdaptation(scaledDiscount[0]);
    const gA = HctSolver.chromaticAdaptation(scaledDiscount[1]);
    const bA = HctSolver.chromaticAdaptation(scaledDiscount[2]);
    const a = (11 * rA + -12 * gA + bA) / 11;
    const b = (rA + gA - 2 * bA) / 9;
    return Math.atan2(b, a);
  }
  static areInCyclicOrder(a, b, c) {
    const deltaAB = HctSolver.sanitizeRadians(b - a);
    const deltaAC = HctSolver.sanitizeRadians(c - a);
    return deltaAB < deltaAC;
  }
  /**
   * Solves the lerp equation.
   *
   * @param source The starting number.
   * @param mid The number in the middle.
   * @param target The ending number.
   * @return A number t such that lerp(source, target, t) = mid.
   */
  static intercept(source, mid, target) {
    return (mid - source) / (target - source);
  }
  static lerpPoint(source, t2, target) {
    return [
      source[0] + (target[0] - source[0]) * t2,
      source[1] + (target[1] - source[1]) * t2,
      source[2] + (target[2] - source[2]) * t2
    ];
  }
  /**
   * Intersects a segment with a plane.
   *
   * @param source The coordinates of point A.
   * @param coordinate The R-, G-, or B-coordinate of the plane.
   * @param target The coordinates of point B.
   * @param axis The axis the plane is perpendicular with. (0: R, 1:
   * G, 2: B)
   * @return The intersection point of the segment AB with the plane
   * R=coordinate, G=coordinate, or B=coordinate
   */
  static setCoordinate(source, coordinate, target, axis) {
    const t2 = HctSolver.intercept(source[axis], coordinate, target[axis]);
    return HctSolver.lerpPoint(source, t2, target);
  }
  static isBounded(x) {
    return 0 <= x && x <= 100;
  }
  /**
   * Returns the nth possible vertex of the polygonal intersection.
   *
   * @param y The Y value of the plane.
   * @param n The zero-based index of the point. 0 <= n <= 11.
   * @return The nth possible vertex of the polygonal intersection
   * of the y plane and the RGB cube, in linear RGB coordinates, if
   * it exists. If this possible vertex lies outside of the cube,
   * [-1.0, -1.0, -1.0] is returned.
   */
  static nthVertex(y, n2) {
    const kR = HctSolver.Y_FROM_LINRGB[0];
    const kG = HctSolver.Y_FROM_LINRGB[1];
    const kB = HctSolver.Y_FROM_LINRGB[2];
    const coordA = n2 % 4 <= 1 ? 0 : 100;
    const coordB = n2 % 2 === 0 ? 0 : 100;
    if (n2 < 4) {
      const g = coordA;
      const b = coordB;
      const r2 = (y - g * kG - b * kB) / kR;
      if (HctSolver.isBounded(r2)) {
        return [r2, g, b];
      } else {
        return [-1, -1, -1];
      }
    } else if (n2 < 8) {
      const b = coordA;
      const r2 = coordB;
      const g = (y - r2 * kR - b * kB) / kG;
      if (HctSolver.isBounded(g)) {
        return [r2, g, b];
      } else {
        return [-1, -1, -1];
      }
    } else {
      const r2 = coordA;
      const g = coordB;
      const b = (y - r2 * kR - g * kG) / kB;
      if (HctSolver.isBounded(b)) {
        return [r2, g, b];
      } else {
        return [-1, -1, -1];
      }
    }
  }
  /**
   * Finds the segment containing the desired color.
   *
   * @param y The Y value of the color.
   * @param targetHue The hue of the color.
   * @return A list of two sets of linear RGB coordinates, each
   * corresponding to an endpoint of the segment containing the
   * desired color.
   */
  static bisectToSegment(y, targetHue) {
    let left = [-1, -1, -1];
    let right = left;
    let leftHue = 0;
    let rightHue = 0;
    let initialized = false;
    let uncut = true;
    for (let n2 = 0; n2 < 12; n2++) {
      const mid = HctSolver.nthVertex(y, n2);
      if (mid[0] < 0) {
        continue;
      }
      const midHue = HctSolver.hueOf(mid);
      if (!initialized) {
        left = mid;
        right = mid;
        leftHue = midHue;
        rightHue = midHue;
        initialized = true;
        continue;
      }
      if (uncut || HctSolver.areInCyclicOrder(leftHue, midHue, rightHue)) {
        uncut = false;
        if (HctSolver.areInCyclicOrder(leftHue, targetHue, midHue)) {
          right = mid;
          rightHue = midHue;
        } else {
          left = mid;
          leftHue = midHue;
        }
      }
    }
    return [left, right];
  }
  static midpoint(a, b) {
    return [
      (a[0] + b[0]) / 2,
      (a[1] + b[1]) / 2,
      (a[2] + b[2]) / 2
    ];
  }
  static criticalPlaneBelow(x) {
    return Math.floor(x - 0.5);
  }
  static criticalPlaneAbove(x) {
    return Math.ceil(x - 0.5);
  }
  /**
   * Finds a color with the given Y and hue on the boundary of the
   * cube.
   *
   * @param y The Y value of the color.
   * @param targetHue The hue of the color.
   * @return The desired color, in linear RGB coordinates.
   */
  static bisectToLimit(y, targetHue) {
    const segment = HctSolver.bisectToSegment(y, targetHue);
    let left = segment[0];
    let leftHue = HctSolver.hueOf(left);
    let right = segment[1];
    for (let axis = 0; axis < 3; axis++) {
      if (left[axis] !== right[axis]) {
        let lPlane = -1;
        let rPlane = 255;
        if (left[axis] < right[axis]) {
          lPlane = HctSolver.criticalPlaneBelow(HctSolver.trueDelinearized(left[axis]));
          rPlane = HctSolver.criticalPlaneAbove(HctSolver.trueDelinearized(right[axis]));
        } else {
          lPlane = HctSolver.criticalPlaneAbove(HctSolver.trueDelinearized(left[axis]));
          rPlane = HctSolver.criticalPlaneBelow(HctSolver.trueDelinearized(right[axis]));
        }
        for (let i2 = 0; i2 < 8; i2++) {
          if (Math.abs(rPlane - lPlane) <= 1) {
            break;
          } else {
            const mPlane = Math.floor((lPlane + rPlane) / 2);
            const midPlaneCoordinate = HctSolver.CRITICAL_PLANES[mPlane];
            const mid = HctSolver.setCoordinate(left, midPlaneCoordinate, right, axis);
            const midHue = HctSolver.hueOf(mid);
            if (HctSolver.areInCyclicOrder(leftHue, targetHue, midHue)) {
              right = mid;
              rPlane = mPlane;
            } else {
              left = mid;
              leftHue = midHue;
              lPlane = mPlane;
            }
          }
        }
      }
    }
    return HctSolver.midpoint(left, right);
  }
  static inverseChromaticAdaptation(adapted) {
    const adaptedAbs = Math.abs(adapted);
    const base = Math.max(0, 27.13 * adaptedAbs / (400 - adaptedAbs));
    return signum(adapted) * Math.pow(base, 1 / 0.42);
  }
  /**
   * Finds a color with the given hue, chroma, and Y.
   *
   * @param hueRadians The desired hue in radians.
   * @param chroma The desired chroma.
   * @param y The desired Y.
   * @return The desired color as a hexadecimal integer, if found; 0
   * otherwise.
   */
  static findResultByJ(hueRadians, chroma, y) {
    let j = Math.sqrt(y) * 11;
    const viewingConditions = ViewingConditions.DEFAULT;
    const tInnerCoeff = 1 / Math.pow(1.64 - Math.pow(0.29, viewingConditions.n), 0.73);
    const eHue = 0.25 * (Math.cos(hueRadians + 2) + 3.8);
    const p1 = eHue * (5e4 / 13) * viewingConditions.nc * viewingConditions.ncb;
    const hSin = Math.sin(hueRadians);
    const hCos = Math.cos(hueRadians);
    for (let iterationRound = 0; iterationRound < 5; iterationRound++) {
      const jNormalized = j / 100;
      const alpha = chroma === 0 || j === 0 ? 0 : chroma / Math.sqrt(jNormalized);
      const t2 = Math.pow(alpha * tInnerCoeff, 1 / 0.9);
      const ac = viewingConditions.aw * Math.pow(jNormalized, 1 / viewingConditions.c / viewingConditions.z);
      const p2 = ac / viewingConditions.nbb;
      const gamma = 23 * (p2 + 0.305) * t2 / (23 * p1 + 11 * t2 * hCos + 108 * t2 * hSin);
      const a = gamma * hCos;
      const b = gamma * hSin;
      const rA = (460 * p2 + 451 * a + 288 * b) / 1403;
      const gA = (460 * p2 - 891 * a - 261 * b) / 1403;
      const bA = (460 * p2 - 220 * a - 6300 * b) / 1403;
      const rCScaled = HctSolver.inverseChromaticAdaptation(rA);
      const gCScaled = HctSolver.inverseChromaticAdaptation(gA);
      const bCScaled = HctSolver.inverseChromaticAdaptation(bA);
      const linrgb = matrixMultiply([rCScaled, gCScaled, bCScaled], HctSolver.LINRGB_FROM_SCALED_DISCOUNT);
      if (linrgb[0] < 0 || linrgb[1] < 0 || linrgb[2] < 0) {
        return 0;
      }
      const kR = HctSolver.Y_FROM_LINRGB[0];
      const kG = HctSolver.Y_FROM_LINRGB[1];
      const kB = HctSolver.Y_FROM_LINRGB[2];
      const fnj = kR * linrgb[0] + kG * linrgb[1] + kB * linrgb[2];
      if (fnj <= 0) {
        return 0;
      }
      if (iterationRound === 4 || Math.abs(fnj - y) < 2e-3) {
        if (linrgb[0] > 100.01 || linrgb[1] > 100.01 || linrgb[2] > 100.01) {
          return 0;
        }
        return argbFromLinrgb(linrgb);
      }
      j = j - (fnj - y) * j / (2 * fnj);
    }
    return 0;
  }
  /**
   * Finds an sRGB color with the given hue, chroma, and L*, if
   * possible.
   *
   * @param hueDegrees The desired hue, in degrees.
   * @param chroma The desired chroma.
   * @param lstar The desired L*.
   * @return A hexadecimal representing the sRGB color. The color
   * has sufficiently close hue, chroma, and L* to the desired
   * values, if possible; otherwise, the hue and L* will be
   * sufficiently close, and chroma will be maximized.
   */
  static solveToInt(hueDegrees, chroma, lstar) {
    if (chroma < 1e-4 || lstar < 1e-4 || lstar > 99.9999) {
      return argbFromLstar(lstar);
    }
    hueDegrees = sanitizeDegreesDouble(hueDegrees);
    const hueRadians = hueDegrees / 180 * Math.PI;
    const y = yFromLstar(lstar);
    const exactAnswer = HctSolver.findResultByJ(hueRadians, chroma, y);
    if (exactAnswer !== 0) {
      return exactAnswer;
    }
    const linrgb = HctSolver.bisectToLimit(y, hueRadians);
    return argbFromLinrgb(linrgb);
  }
  /**
   * Finds an sRGB color with the given hue, chroma, and L*, if
   * possible.
   *
   * @param hueDegrees The desired hue, in degrees.
   * @param chroma The desired chroma.
   * @param lstar The desired L*.
   * @return An CAM16 object representing the sRGB color. The color
   * has sufficiently close hue, chroma, and L* to the desired
   * values, if possible; otherwise, the hue and L* will be
   * sufficiently close, and chroma will be maximized.
   */
  static solveToCam(hueDegrees, chroma, lstar) {
    return Cam16.fromInt(HctSolver.solveToInt(hueDegrees, chroma, lstar));
  }
}
HctSolver.SCALED_DISCOUNT_FROM_LINRGB = [
  [
    0.001200833568784504,
    0.002389694492170889,
    2795742885861124e-19
  ],
  [
    5891086651375999e-19,
    0.0029785502573438758,
    3270666104008398e-19
  ],
  [
    10146692491640572e-20,
    5364214359186694e-19,
    0.0032979401770712076
  ]
];
HctSolver.LINRGB_FROM_SCALED_DISCOUNT = [
  [
    1373.2198709594231,
    -1100.4251190754821,
    -7.278681089101213
  ],
  [
    -271.815969077903,
    559.6580465940733,
    -32.46047482791194
  ],
  [
    1.9622899599665666,
    -57.173814538844006,
    308.7233197812385
  ]
];
HctSolver.Y_FROM_LINRGB = [0.2126, 0.7152, 0.0722];
HctSolver.CRITICAL_PLANES = [
  0.015176349177441876,
  0.045529047532325624,
  0.07588174588720938,
  0.10623444424209313,
  0.13658714259697685,
  0.16693984095186062,
  0.19729253930674434,
  0.2276452376616281,
  0.2579979360165119,
  0.28835063437139563,
  0.3188300904430532,
  0.350925934958123,
  0.3848314933096426,
  0.42057480301049466,
  0.458183274052838,
  0.4976837250274023,
  0.5391024159806381,
  0.5824650784040898,
  0.6277969426914107,
  0.6751227633498623,
  0.7244668422128921,
  0.775853049866786,
  0.829304845476233,
  0.8848452951698498,
  0.942497089126609,
  1.0022825574869039,
  1.0642236851973577,
  1.1283421258858297,
  1.1946592148522128,
  1.2631959812511864,
  1.3339731595349034,
  1.407011200216447,
  1.4823302800086415,
  1.5599503113873272,
  1.6398909516233677,
  1.7221716113234105,
  1.8068114625156377,
  1.8938294463134073,
  1.9832442801866852,
  2.075074464868551,
  2.1693382909216234,
  2.2660538449872063,
  2.36523901573795,
  2.4669114995532007,
  2.5710888059345764,
  2.6777882626779785,
  2.7870270208169257,
  2.898822059350997,
  3.0131901897720907,
  3.1301480604002863,
  3.2497121605402226,
  3.3718988244681087,
  3.4967242352587946,
  3.624204428461639,
  3.754355295633311,
  3.887192587735158,
  4.022731918402185,
  4.160988767090289,
  4.301978482107941,
  4.445716283538092,
  4.592217266055746,
  4.741496401646282,
  4.893568542229298,
  5.048448422192488,
  5.20615066083972,
  5.3666897647573375,
  5.5300801301023865,
  5.696336044816294,
  5.865471690767354,
  6.037501145825082,
  6.212438385869475,
  6.390297286737924,
  6.571091626112461,
  6.7548350853498045,
  6.941541251256611,
  7.131223617812143,
  7.323895587840543,
  7.5195704746346665,
  7.7182615035334345,
  7.919981813454504,
  8.124744458384042,
  8.332562408825165,
  8.543448553206703,
  8.757415699253682,
  8.974476575321063,
  9.194643831691977,
  9.417930041841839,
  9.644347703669503,
  9.873909240696694,
  10.106627003236781,
  10.342513269534024,
  10.58158024687427,
  10.8238400726681,
  11.069304815507364,
  11.317986476196008,
  11.569896988756009,
  11.825048221409341,
  12.083451977536606,
  12.345119996613247,
  12.610063955123938,
  12.878295467455942,
  13.149826086772048,
  13.42466730586372,
  13.702830557985108,
  13.984327217668513,
  14.269168601521828,
  14.55736596900856,
  14.848930523210871,
  15.143873411576273,
  15.44220572664832,
  15.743938506781891,
  16.04908273684337,
  16.35764934889634,
  16.66964922287304,
  16.985093187232053,
  17.30399201960269,
  17.62635644741625,
  17.95219714852476,
  18.281524751807332,
  18.614349837764564,
  18.95068293910138,
  19.290534541298456,
  19.633915083172692,
  19.98083495742689,
  20.331304511189067,
  20.685334046541502,
  21.042933821039977,
  21.404114048223256,
  21.76888489811322,
  22.137256497705877,
  22.50923893145328,
  22.884842241736916,
  23.264076429332462,
  23.6469514538663,
  24.033477234264016,
  24.42366364919083,
  24.817520537484558,
  25.21505769858089,
  25.61628489293138,
  26.021211842414342,
  26.429848230738664,
  26.842203703840827,
  27.258287870275353,
  27.678110301598522,
  28.10168053274597,
  28.529008062403893,
  28.96010235337422,
  29.39497283293396,
  29.83362889318845,
  30.276079891419332,
  30.722335150426627,
  31.172403958865512,
  31.62629557157785,
  32.08401920991837,
  32.54558406207592,
  33.010999283389665,
  33.4802739966603,
  33.953417292456834,
  34.430438229418264,
  34.911345834551085,
  35.39614910352207,
  35.88485700094671,
  36.37747846067349,
  36.87402238606382,
  37.37449765026789,
  37.87891309649659,
  38.38727753828926,
  38.89959975977785,
  39.41588851594697,
  39.93615253289054,
  40.460400508064545,
  40.98864111053629,
  41.520882981230194,
  42.05713473317016,
  42.597404951718396,
  43.141702194811224,
  43.6900349931913,
  44.24241185063697,
  44.798841244188324,
  45.35933162437017,
  45.92389141541209,
  46.49252901546552,
  47.065252796817916,
  47.64207110610409,
  48.22299226451468,
  48.808024568002054,
  49.3971762874833,
  49.9904556690408,
  50.587870934119984,
  51.189430279724725,
  51.79514187861014,
  52.40501387947288,
  53.0190544071392,
  53.637271562750364,
  54.259673423945976,
  54.88626804504493,
  55.517063457223934,
  56.15206766869424,
  56.79128866487574,
  57.43473440856916,
  58.08241284012621,
  58.734331877617365,
  59.39049941699807,
  60.05092333227251,
  60.715611475655585,
  61.38457167773311,
  62.057811747619894,
  62.7353394731159,
  63.417162620860914,
  64.10328893648692,
  64.79372614476921,
  65.48848194977529,
  66.18756403501224,
  66.89098006357258,
  67.59873767827808,
  68.31084450182222,
  69.02730813691093,
  69.74813616640164,
  70.47333615344107,
  71.20291564160104,
  71.93688215501312,
  72.67524319850172,
  73.41800625771542,
  74.16517879925733,
  74.9167682708136,
  75.67278210128072,
  76.43322770089146,
  77.1981124613393,
  77.96744375590167,
  78.74122893956174,
  79.51947534912904,
  80.30219030335869,
  81.08938110306934,
  81.88105503125999,
  82.67721935322541,
  83.4778813166706,
  84.28304815182372,
  85.09272707154808,
  85.90692527145302,
  86.72564993000343,
  87.54890820862819,
  88.3767072518277,
  89.2090541872801,
  90.04595612594655,
  90.88742016217518,
  91.73345337380438,
  92.58406282226491,
  93.43925555268066,
  94.29903859396902,
  95.16341895893969,
  96.03240364439274,
  96.9059996312159,
  97.78421388448044,
  98.6670533535366,
  99.55452497210776
];
/**
* @license
* Copyright 2021 Google LLC
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*      http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
class Hct {
  static from(hue, chroma, tone) {
    return new Hct(HctSolver.solveToInt(hue, chroma, tone));
  }
  /**
   * @param argb ARGB representation of a color.
   * @return HCT representation of a color in default viewing conditions
   */
  static fromInt(argb) {
    return new Hct(argb);
  }
  toInt() {
    return this.argb;
  }
  /**
   * A number, in degrees, representing ex. red, orange, yellow, etc.
   * Ranges from 0 <= hue < 360.
   */
  get hue() {
    return this.internalHue;
  }
  /**
   * @param newHue 0 <= newHue < 360; invalid values are corrected.
   * Chroma may decrease because chroma has a different maximum for any given
   * hue and tone.
   */
  set hue(newHue) {
    this.setInternalState(HctSolver.solveToInt(newHue, this.internalChroma, this.internalTone));
  }
  get chroma() {
    return this.internalChroma;
  }
  /**
   * @param newChroma 0 <= newChroma < ?
   * Chroma may decrease because chroma has a different maximum for any given
   * hue and tone.
   */
  set chroma(newChroma) {
    this.setInternalState(HctSolver.solveToInt(this.internalHue, newChroma, this.internalTone));
  }
  /** Lightness. Ranges from 0 to 100. */
  get tone() {
    return this.internalTone;
  }
  /**
   * @param newTone 0 <= newTone <= 100; invalid valids are corrected.
   * Chroma may decrease because chroma has a different maximum for any given
   * hue and tone.
   */
  set tone(newTone) {
    this.setInternalState(HctSolver.solveToInt(this.internalHue, this.internalChroma, newTone));
  }
  constructor(argb) {
    this.argb = argb;
    const cam = Cam16.fromInt(argb);
    this.internalHue = cam.hue;
    this.internalChroma = cam.chroma;
    this.internalTone = lstarFromArgb(argb);
    this.argb = argb;
  }
  setInternalState(argb) {
    const cam = Cam16.fromInt(argb);
    this.internalHue = cam.hue;
    this.internalChroma = cam.chroma;
    this.internalTone = lstarFromArgb(argb);
    this.argb = argb;
  }
  /**
   * Translates a color into different [ViewingConditions].
   *
   * Colors change appearance. They look different with lights on versus off,
   * the same color, as in hex code, on white looks different when on black.
   * This is called color relativity, most famously explicated by Josef Albers
   * in Interaction of Color.
   *
   * In color science, color appearance models can account for this and
   * calculate the appearance of a color in different settings. HCT is based on
   * CAM16, a color appearance model, and uses it to make these calculations.
   *
   * See [ViewingConditions.make] for parameters affecting color appearance.
   */
  inViewingConditions(vc) {
    const cam = Cam16.fromInt(this.toInt());
    const viewedInVc = cam.xyzInViewingConditions(vc);
    const recastInVc = Cam16.fromXyzInViewingConditions(viewedInVc[0], viewedInVc[1], viewedInVc[2], ViewingConditions.make());
    const recastHct = Hct.from(recastInVc.hue, recastInVc.chroma, lstarFromY(viewedInVc[1]));
    return recastHct;
  }
}
/**
* @license
* Copyright 2021 Google LLC
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*      http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
class Blend {
  /**
   * Blend the design color's HCT hue towards the key color's HCT
   * hue, in a way that leaves the original color recognizable and
   * recognizably shifted towards the key color.
   *
   * @param designColor ARGB representation of an arbitrary color.
   * @param sourceColor ARGB representation of the main theme color.
   * @return The design color with a hue shifted towards the
   * system's color, a slightly warmer/cooler variant of the design
   * color's hue.
   */
  static harmonize(designColor, sourceColor) {
    const fromHct = Hct.fromInt(designColor);
    const toHct = Hct.fromInt(sourceColor);
    const differenceDegrees$1 = differenceDegrees(fromHct.hue, toHct.hue);
    const rotationDegrees = Math.min(differenceDegrees$1 * 0.5, 15);
    const outputHue = sanitizeDegreesDouble(fromHct.hue + rotationDegrees * rotationDirection(fromHct.hue, toHct.hue));
    return Hct.from(outputHue, fromHct.chroma, fromHct.tone).toInt();
  }
  /**
   * Blends hue from one color into another. The chroma and tone of
   * the original color are maintained.
   *
   * @param from ARGB representation of color
   * @param to ARGB representation of color
   * @param amount how much blending to perform; 0.0 >= and <= 1.0
   * @return from, with a hue blended towards to. Chroma and tone
   * are constant.
   */
  static hctHue(from, to, amount) {
    const ucs = Blend.cam16Ucs(from, to, amount);
    const ucsCam = Cam16.fromInt(ucs);
    const fromCam = Cam16.fromInt(from);
    const blended = Hct.from(ucsCam.hue, fromCam.chroma, lstarFromArgb(from));
    return blended.toInt();
  }
  /**
   * Blend in CAM16-UCS space.
   *
   * @param from ARGB representation of color
   * @param to ARGB representation of color
   * @param amount how much blending to perform; 0.0 >= and <= 1.0
   * @return from, blended towards to. Hue, chroma, and tone will
   * change.
   */
  static cam16Ucs(from, to, amount) {
    const fromCam = Cam16.fromInt(from);
    const toCam = Cam16.fromInt(to);
    const fromJ = fromCam.jstar;
    const fromA = fromCam.astar;
    const fromB = fromCam.bstar;
    const toJ = toCam.jstar;
    const toA = toCam.astar;
    const toB = toCam.bstar;
    const jstar = fromJ + (toJ - fromJ) * amount;
    const astar = fromA + (toA - fromA) * amount;
    const bstar = fromB + (toB - fromB) * amount;
    return Cam16.fromUcs(jstar, astar, bstar).toInt();
  }
}
/**
* @license
* Copyright 2022 Google LLC
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*      http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
class Contrast {
  /**
   * Returns a contrast ratio, which ranges from 1 to 21.
   *
   * @param toneA Tone between 0 and 100. Values outside will be clamped.
   * @param toneB Tone between 0 and 100. Values outside will be clamped.
   */
  static ratioOfTones(toneA, toneB) {
    toneA = clampDouble(0, 100, toneA);
    toneB = clampDouble(0, 100, toneB);
    return Contrast.ratioOfYs(yFromLstar(toneA), yFromLstar(toneB));
  }
  static ratioOfYs(y1, y2) {
    const lighter = y1 > y2 ? y1 : y2;
    const darker = lighter === y2 ? y1 : y2;
    return (lighter + 5) / (darker + 5);
  }
  /**
   * Returns a tone >= tone parameter that ensures ratio parameter.
   * Return value is between 0 and 100.
   * Returns -1 if ratio cannot be achieved with tone parameter.
   *
   * @param tone Tone return value must contrast with.
   * Range is 0 to 100. Invalid values will result in -1 being returned.
   * @param ratio Contrast ratio of return value and tone.
   * Range is 1 to 21, invalid values have undefined behavior.
   */
  static lighter(tone, ratio) {
    if (tone < 0 || tone > 100) {
      return -1;
    }
    const darkY = yFromLstar(tone);
    const lightY = ratio * (darkY + 5) - 5;
    const realContrast = Contrast.ratioOfYs(lightY, darkY);
    const delta = Math.abs(realContrast - ratio);
    if (realContrast < ratio && delta > 0.04) {
      return -1;
    }
    const returnValue = lstarFromY(lightY) + 0.4;
    if (returnValue < 0 || returnValue > 100) {
      return -1;
    }
    return returnValue;
  }
  /**
   * Returns a tone <= tone parameter that ensures ratio parameter.
   * Return value is between 0 and 100.
   * Returns -1 if ratio cannot be achieved with tone parameter.
   *
   * @param tone Tone return value must contrast with.
   * Range is 0 to 100. Invalid values will result in -1 being returned.
   * @param ratio Contrast ratio of return value and tone.
   * Range is 1 to 21, invalid values have undefined behavior.
   */
  static darker(tone, ratio) {
    if (tone < 0 || tone > 100) {
      return -1;
    }
    const lightY = yFromLstar(tone);
    const darkY = (lightY + 5) / ratio - 5;
    const realContrast = Contrast.ratioOfYs(lightY, darkY);
    const delta = Math.abs(realContrast - ratio);
    if (realContrast < ratio && delta > 0.04) {
      return -1;
    }
    const returnValue = lstarFromY(darkY) - 0.4;
    if (returnValue < 0 || returnValue > 100) {
      return -1;
    }
    return returnValue;
  }
  /**
   * Returns a tone >= tone parameter that ensures ratio parameter.
   * Return value is between 0 and 100.
   * Returns 100 if ratio cannot be achieved with tone parameter.
   *
   * This method is unsafe because the returned value is guaranteed to be in
   * bounds for tone, i.e. between 0 and 100. However, that value may not reach
   * the ratio with tone. For example, there is no color lighter than T100.
   *
   * @param tone Tone return value must contrast with.
   * Range is 0 to 100. Invalid values will result in 100 being returned.
   * @param ratio Desired contrast ratio of return value and tone parameter.
   * Range is 1 to 21, invalid values have undefined behavior.
   */
  static lighterUnsafe(tone, ratio) {
    const lighterSafe = Contrast.lighter(tone, ratio);
    return lighterSafe < 0 ? 100 : lighterSafe;
  }
  /**
   * Returns a tone >= tone parameter that ensures ratio parameter.
   * Return value is between 0 and 100.
   * Returns 100 if ratio cannot be achieved with tone parameter.
   *
   * This method is unsafe because the returned value is guaranteed to be in
   * bounds for tone, i.e. between 0 and 100. However, that value may not reach
   * the [ratio with [tone]. For example, there is no color darker than T0.
   *
   * @param tone Tone return value must contrast with.
   * Range is 0 to 100. Invalid values will result in 0 being returned.
   * @param ratio Desired contrast ratio of return value and tone parameter.
   * Range is 1 to 21, invalid values have undefined behavior.
   */
  static darkerUnsafe(tone, ratio) {
    const darkerSafe = Contrast.darker(tone, ratio);
    return darkerSafe < 0 ? 0 : darkerSafe;
  }
}
/**
* @license
* Copyright 2023 Google LLC
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*      http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
class DislikeAnalyzer {
  /**
   * Returns true if a color is disliked.
   *
   * @param hct A color to be judged.
   * @return Whether the color is disliked.
   *
   * Disliked is defined as a dark yellow-green that is not neutral.
   */
  static isDisliked(hct) {
    const huePasses = Math.round(hct.hue) >= 90 && Math.round(hct.hue) <= 111;
    const chromaPasses = Math.round(hct.chroma) > 16;
    const tonePasses = Math.round(hct.tone) < 65;
    return huePasses && chromaPasses && tonePasses;
  }
  /**
   * If a color is disliked, lighten it to make it likable.
   *
   * @param hct A color to be judged.
   * @return A new color if the original color is disliked, or the original
   *   color if it is acceptable.
   */
  static fixIfDisliked(hct) {
    if (DislikeAnalyzer.isDisliked(hct)) {
      return Hct.from(hct.hue, hct.chroma, 70);
    }
    return hct;
  }
}
/**
* @license
* Copyright 2022 Google LLC
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*      http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
class DynamicColor {
  /**
   * Create a DynamicColor defined by a TonalPalette and HCT tone.
   *
   * @param args Functions with DynamicScheme as input. Must provide a palette
   * and tone. May provide a background DynamicColor and ToneDeltaConstraint.
   */
  static fromPalette(args) {
    return new DynamicColor(args.name ?? "", args.palette, args.tone, args.isBackground ?? false, args.background, args.secondBackground, args.contrastCurve, args.toneDeltaPair);
  }
  /**
   * The base constructor for DynamicColor.
   *
   * _Strongly_ prefer using one of the convenience constructors. This class is
   * arguably too flexible to ensure it can support any scenario. Functional
   * arguments allow  overriding without risks that come with subclasses.
   *
   * For example, the default behavior of adjust tone at max contrast
   * to be at a 7.0 ratio with its background is principled and
   * matches accessibility guidance. That does not mean it's the desired
   * approach for _every_ design system, and every color pairing,
   * always, in every case.
   *
   * @param name The name of the dynamic color. Defaults to empty.
   * @param palette Function that provides a TonalPalette given
   * DynamicScheme. A TonalPalette is defined by a hue and chroma, so this
   * replaces the need to specify hue/chroma. By providing a tonal palette, when
   * contrast adjustments are made, intended chroma can be preserved.
   * @param tone Function that provides a tone, given a DynamicScheme.
   * @param isBackground Whether this dynamic color is a background, with
   * some other color as the foreground. Defaults to false.
   * @param background The background of the dynamic color (as a function of a
   *     `DynamicScheme`), if it exists.
   * @param secondBackground A second background of the dynamic color (as a
   *     function of a `DynamicScheme`), if it
   * exists.
   * @param contrastCurve A `ContrastCurve` object specifying how its contrast
   * against its background should behave in various contrast levels options.
   * @param toneDeltaPair A `ToneDeltaPair` object specifying a tone delta
   * constraint between two colors. One of them must be the color being
   * constructed.
   */
  constructor(name, palette, tone, isBackground, background, secondBackground, contrastCurve, toneDeltaPair) {
    this.name = name;
    this.palette = palette;
    this.tone = tone;
    this.isBackground = isBackground;
    this.background = background;
    this.secondBackground = secondBackground;
    this.contrastCurve = contrastCurve;
    this.toneDeltaPair = toneDeltaPair;
    this.hctCache = /* @__PURE__ */ new Map();
    if (!background && secondBackground) {
      throw new Error(`Color ${name} has secondBackgrounddefined, but background is not defined.`);
    }
    if (!background && contrastCurve) {
      throw new Error(`Color ${name} has contrastCurvedefined, but background is not defined.`);
    }
    if (background && !contrastCurve) {
      throw new Error(`Color ${name} has backgrounddefined, but contrastCurve is not defined.`);
    }
  }
  /**
   * Return a ARGB integer (i.e. a hex code).
   *
   * @param scheme Defines the conditions of the user interface, for example,
   * whether or not it is dark mode or light mode, and what the desired
   * contrast level is.
   */
  getArgb(scheme) {
    return this.getHct(scheme).toInt();
  }
  /**
   * Return a color, expressed in the HCT color space, that this
   * DynamicColor is under the conditions in scheme.
   *
   * @param scheme Defines the conditions of the user interface, for example,
   * whether or not it is dark mode or light mode, and what the desired
   * contrast level is.
   */
  getHct(scheme) {
    const cachedAnswer = this.hctCache.get(scheme);
    if (cachedAnswer != null) {
      return cachedAnswer;
    }
    const tone = this.getTone(scheme);
    const answer = this.palette(scheme).getHct(tone);
    if (this.hctCache.size > 4) {
      this.hctCache.clear();
    }
    this.hctCache.set(scheme, answer);
    return answer;
  }
  /**
   * Return a tone, T in the HCT color space, that this DynamicColor is under
   * the conditions in scheme.
   *
   * @param scheme Defines the conditions of the user interface, for example,
   * whether or not it is dark mode or light mode, and what the desired
   * contrast level is.
   */
  getTone(scheme) {
    const decreasingContrast = scheme.contrastLevel < 0;
    if (this.toneDeltaPair) {
      const toneDeltaPair = this.toneDeltaPair(scheme);
      const roleA = toneDeltaPair.roleA;
      const roleB = toneDeltaPair.roleB;
      const delta = toneDeltaPair.delta;
      const polarity = toneDeltaPair.polarity;
      const stayTogether = toneDeltaPair.stayTogether;
      const bg = this.background(scheme);
      const bgTone = bg.getTone(scheme);
      const aIsNearer = polarity === "nearer" || polarity === "lighter" && !scheme.isDark || polarity === "darker" && scheme.isDark;
      const nearer = aIsNearer ? roleA : roleB;
      const farther = aIsNearer ? roleB : roleA;
      const amNearer = this.name === nearer.name;
      const expansionDir = scheme.isDark ? 1 : -1;
      const nContrast = nearer.contrastCurve.get(scheme.contrastLevel);
      const fContrast = farther.contrastCurve.get(scheme.contrastLevel);
      const nInitialTone = nearer.tone(scheme);
      let nTone = Contrast.ratioOfTones(bgTone, nInitialTone) >= nContrast ? nInitialTone : DynamicColor.foregroundTone(bgTone, nContrast);
      const fInitialTone = farther.tone(scheme);
      let fTone = Contrast.ratioOfTones(bgTone, fInitialTone) >= fContrast ? fInitialTone : DynamicColor.foregroundTone(bgTone, fContrast);
      if (decreasingContrast) {
        nTone = DynamicColor.foregroundTone(bgTone, nContrast);
        fTone = DynamicColor.foregroundTone(bgTone, fContrast);
      }
      if ((fTone - nTone) * expansionDir >= delta) ;
      else {
        fTone = clampDouble(0, 100, nTone + delta * expansionDir);
        if ((fTone - nTone) * expansionDir >= delta) ;
        else {
          nTone = clampDouble(0, 100, fTone - delta * expansionDir);
        }
      }
      if (50 <= nTone && nTone < 60) {
        if (expansionDir > 0) {
          nTone = 60;
          fTone = Math.max(fTone, nTone + delta * expansionDir);
        } else {
          nTone = 49;
          fTone = Math.min(fTone, nTone + delta * expansionDir);
        }
      } else if (50 <= fTone && fTone < 60) {
        if (stayTogether) {
          if (expansionDir > 0) {
            nTone = 60;
            fTone = Math.max(fTone, nTone + delta * expansionDir);
          } else {
            nTone = 49;
            fTone = Math.min(fTone, nTone + delta * expansionDir);
          }
        } else {
          if (expansionDir > 0) {
            fTone = 60;
          } else {
            fTone = 49;
          }
        }
      }
      return amNearer ? nTone : fTone;
    } else {
      let answer = this.tone(scheme);
      if (this.background == null) {
        return answer;
      }
      const bgTone = this.background(scheme).getTone(scheme);
      const desiredRatio = this.contrastCurve.get(scheme.contrastLevel);
      if (Contrast.ratioOfTones(bgTone, answer) >= desiredRatio) ;
      else {
        answer = DynamicColor.foregroundTone(bgTone, desiredRatio);
      }
      if (decreasingContrast) {
        answer = DynamicColor.foregroundTone(bgTone, desiredRatio);
      }
      if (this.isBackground && 50 <= answer && answer < 60) {
        if (Contrast.ratioOfTones(49, bgTone) >= desiredRatio) {
          answer = 49;
        } else {
          answer = 60;
        }
      }
      if (this.secondBackground) {
        const [bg1, bg2] = [this.background, this.secondBackground];
        const [bgTone1, bgTone2] = [bg1(scheme).getTone(scheme), bg2(scheme).getTone(scheme)];
        const [upper, lower] = [Math.max(bgTone1, bgTone2), Math.min(bgTone1, bgTone2)];
        if (Contrast.ratioOfTones(upper, answer) >= desiredRatio && Contrast.ratioOfTones(lower, answer) >= desiredRatio) {
          return answer;
        }
        const lightOption = Contrast.lighter(upper, desiredRatio);
        const darkOption = Contrast.darker(lower, desiredRatio);
        const availables = [];
        if (lightOption !== -1)
          availables.push(lightOption);
        if (darkOption !== -1)
          availables.push(darkOption);
        const prefersLight = DynamicColor.tonePrefersLightForeground(bgTone1) || DynamicColor.tonePrefersLightForeground(bgTone2);
        if (prefersLight) {
          return lightOption < 0 ? 100 : lightOption;
        }
        if (availables.length === 1) {
          return availables[0];
        }
        return darkOption < 0 ? 0 : darkOption;
      }
      return answer;
    }
  }
  /**
   * Given a background tone, find a foreground tone, while ensuring they reach
   * a contrast ratio that is as close to [ratio] as possible.
   *
   * @param bgTone Tone in HCT. Range is 0 to 100, undefined behavior when it
   *     falls outside that range.
   * @param ratio The contrast ratio desired between bgTone and the return
   *     value.
   */
  static foregroundTone(bgTone, ratio) {
    const lighterTone = Contrast.lighterUnsafe(bgTone, ratio);
    const darkerTone = Contrast.darkerUnsafe(bgTone, ratio);
    const lighterRatio = Contrast.ratioOfTones(lighterTone, bgTone);
    const darkerRatio = Contrast.ratioOfTones(darkerTone, bgTone);
    const preferLighter = DynamicColor.tonePrefersLightForeground(bgTone);
    if (preferLighter) {
      const negligibleDifference = Math.abs(lighterRatio - darkerRatio) < 0.1 && lighterRatio < ratio && darkerRatio < ratio;
      return lighterRatio >= ratio || lighterRatio >= darkerRatio || negligibleDifference ? lighterTone : darkerTone;
    } else {
      return darkerRatio >= ratio || darkerRatio >= lighterRatio ? darkerTone : lighterTone;
    }
  }
  /**
   * Returns whether [tone] prefers a light foreground.
   *
   * People prefer white foregrounds on ~T60-70. Observed over time, and also
   * by Andrew Somers during research for APCA.
   *
   * T60 used as to create the smallest discontinuity possible when skipping
   * down to T49 in order to ensure light foregrounds.
   * Since `tertiaryContainer` in dark monochrome scheme requires a tone of
   * 60, it should not be adjusted. Therefore, 60 is excluded here.
   */
  static tonePrefersLightForeground(tone) {
    return Math.round(tone) < 60;
  }
  /**
   * Returns whether [tone] can reach a contrast ratio of 4.5 with a lighter
   * color.
   */
  static toneAllowsLightForeground(tone) {
    return Math.round(tone) <= 49;
  }
  /**
   * Adjust a tone such that white has 4.5 contrast, if the tone is
   * reasonably close to supporting it.
   */
  static enableLightForeground(tone) {
    if (DynamicColor.tonePrefersLightForeground(tone) && !DynamicColor.toneAllowsLightForeground(tone)) {
      return 49;
    }
    return tone;
  }
}
/**
* @license
* Copyright 2021 Google LLC
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*      http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
class TonalPalette {
  /**
   * @param argb ARGB representation of a color
   * @return Tones matching that color's hue and chroma.
   */
  static fromInt(argb) {
    const hct = Hct.fromInt(argb);
    return TonalPalette.fromHct(hct);
  }
  /**
   * @param hct Hct
   * @return Tones matching that color's hue and chroma.
   */
  static fromHct(hct) {
    return new TonalPalette(hct.hue, hct.chroma, hct);
  }
  /**
   * @param hue HCT hue
   * @param chroma HCT chroma
   * @return Tones matching hue and chroma.
   */
  static fromHueAndChroma(hue, chroma) {
    const keyColor = new KeyColor(hue, chroma).create();
    return new TonalPalette(hue, chroma, keyColor);
  }
  constructor(hue, chroma, keyColor) {
    this.hue = hue;
    this.chroma = chroma;
    this.keyColor = keyColor;
    this.cache = /* @__PURE__ */ new Map();
  }
  /**
   * @param tone HCT tone, measured from 0 to 100.
   * @return ARGB representation of a color with that tone.
   */
  tone(tone) {
    let argb = this.cache.get(tone);
    if (argb === void 0) {
      argb = Hct.from(this.hue, this.chroma, tone).toInt();
      this.cache.set(tone, argb);
    }
    return argb;
  }
  /**
   * @param tone HCT tone.
   * @return HCT representation of a color with that tone.
   */
  getHct(tone) {
    return Hct.fromInt(this.tone(tone));
  }
}
class KeyColor {
  constructor(hue, requestedChroma) {
    this.hue = hue;
    this.requestedChroma = requestedChroma;
    this.chromaCache = /* @__PURE__ */ new Map();
    this.maxChromaValue = 200;
  }
  /**
   * Creates a key color from a [hue] and a [chroma].
   * The key color is the first tone, starting from T50, matching the given hue
   * and chroma.
   *
   * @return Key color [Hct]
   */
  create() {
    const pivotTone = 50;
    const toneStepSize = 1;
    const epsilon = 0.01;
    let lowerTone = 0;
    let upperTone = 100;
    while (lowerTone < upperTone) {
      const midTone = Math.floor((lowerTone + upperTone) / 2);
      const isAscending = this.maxChroma(midTone) < this.maxChroma(midTone + toneStepSize);
      const sufficientChroma = this.maxChroma(midTone) >= this.requestedChroma - epsilon;
      if (sufficientChroma) {
        if (Math.abs(lowerTone - pivotTone) < Math.abs(upperTone - pivotTone)) {
          upperTone = midTone;
        } else {
          if (lowerTone === midTone) {
            return Hct.from(this.hue, this.requestedChroma, lowerTone);
          }
          lowerTone = midTone;
        }
      } else {
        if (isAscending) {
          lowerTone = midTone + toneStepSize;
        } else {
          upperTone = midTone;
        }
      }
    }
    return Hct.from(this.hue, this.requestedChroma, lowerTone);
  }
  // Find the maximum chroma for a given tone
  maxChroma(tone) {
    if (this.chromaCache.has(tone)) {
      return this.chromaCache.get(tone);
    }
    const chroma = Hct.from(this.hue, this.maxChromaValue, tone).chroma;
    this.chromaCache.set(tone, chroma);
    return chroma;
  }
}
/**
* @license
* Copyright 2023 Google LLC
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*      http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
class ContrastCurve {
  /**
   * Creates a `ContrastCurve` object.
   *
   * @param low Value for contrast level -1.0
   * @param normal Value for contrast level 0.0
   * @param medium Value for contrast level 0.5
   * @param high Value for contrast level 1.0
   */
  constructor(low, normal, medium, high) {
    this.low = low;
    this.normal = normal;
    this.medium = medium;
    this.high = high;
  }
  /**
   * Returns the value at a given contrast level.
   *
   * @param contrastLevel The contrast level. 0.0 is the default (normal); -1.0
   *     is the lowest; 1.0 is the highest.
   * @return The value. For contrast ratios, a number between 1.0 and 21.0.
   */
  get(contrastLevel) {
    if (contrastLevel <= -1) {
      return this.low;
    } else if (contrastLevel < 0) {
      return lerp(this.low, this.normal, (contrastLevel - -1) / 1);
    } else if (contrastLevel < 0.5) {
      return lerp(this.normal, this.medium, (contrastLevel - 0) / 0.5);
    } else if (contrastLevel < 1) {
      return lerp(this.medium, this.high, (contrastLevel - 0.5) / 0.5);
    } else {
      return this.high;
    }
  }
}
/**
* @license
* Copyright 2023 Google LLC
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*      http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
class ToneDeltaPair {
  /**
   * Documents a constraint in tone distance between two DynamicColors.
   *
   * The polarity is an adjective that describes "A", compared to "B".
   *
   * For instance, ToneDeltaPair(A, B, 15, 'darker', stayTogether) states that
   * A's tone should be at least 15 darker than B's.
   *
   * 'nearer' and 'farther' describes closeness to the surface roles. For
   * instance, ToneDeltaPair(A, B, 10, 'nearer', stayTogether) states that A
   * should be 10 lighter than B in light mode, and 10 darker than B in dark
   * mode.
   *
   * @param roleA The first role in a pair.
   * @param roleB The second role in a pair.
   * @param delta Required difference between tones. Absolute value, negative
   * values have undefined behavior.
   * @param polarity The relative relation between tones of roleA and roleB,
   * as described above.
   * @param stayTogether Whether these two roles should stay on the same side of
   * the "awkward zone" (T50-59). This is necessary for certain cases where
   * one role has two backgrounds.
   */
  constructor(roleA, roleB, delta, polarity, stayTogether) {
    this.roleA = roleA;
    this.roleB = roleB;
    this.delta = delta;
    this.polarity = polarity;
    this.stayTogether = stayTogether;
  }
}
/**
* @license
* Copyright 2022 Google LLC
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*      http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
var Variant;
(function(Variant2) {
  Variant2[Variant2["MONOCHROME"] = 0] = "MONOCHROME";
  Variant2[Variant2["NEUTRAL"] = 1] = "NEUTRAL";
  Variant2[Variant2["TONAL_SPOT"] = 2] = "TONAL_SPOT";
  Variant2[Variant2["VIBRANT"] = 3] = "VIBRANT";
  Variant2[Variant2["EXPRESSIVE"] = 4] = "EXPRESSIVE";
  Variant2[Variant2["FIDELITY"] = 5] = "FIDELITY";
  Variant2[Variant2["CONTENT"] = 6] = "CONTENT";
  Variant2[Variant2["RAINBOW"] = 7] = "RAINBOW";
  Variant2[Variant2["FRUIT_SALAD"] = 8] = "FRUIT_SALAD";
})(Variant || (Variant = {}));
/**
* @license
* Copyright 2022 Google LLC
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*      http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
function isFidelity(scheme) {
  return scheme.variant === Variant.FIDELITY || scheme.variant === Variant.CONTENT;
}
function isMonochrome(scheme) {
  return scheme.variant === Variant.MONOCHROME;
}
function findDesiredChromaByTone(hue, chroma, tone, byDecreasingTone) {
  let answer = tone;
  let closestToChroma = Hct.from(hue, chroma, tone);
  if (closestToChroma.chroma < chroma) {
    let chromaPeak = closestToChroma.chroma;
    while (closestToChroma.chroma < chroma) {
      answer += byDecreasingTone ? -1 : 1;
      const potentialSolution = Hct.from(hue, chroma, answer);
      if (chromaPeak > potentialSolution.chroma) {
        break;
      }
      if (Math.abs(potentialSolution.chroma - chroma) < 0.4) {
        break;
      }
      const potentialDelta = Math.abs(potentialSolution.chroma - chroma);
      const currentDelta = Math.abs(closestToChroma.chroma - chroma);
      if (potentialDelta < currentDelta) {
        closestToChroma = potentialSolution;
      }
      chromaPeak = Math.max(chromaPeak, potentialSolution.chroma);
    }
  }
  return answer;
}
class MaterialDynamicColors {
  static highestSurface(s) {
    return s.isDark ? MaterialDynamicColors.surfaceBright : MaterialDynamicColors.surfaceDim;
  }
}
MaterialDynamicColors.contentAccentToneDelta = 15;
MaterialDynamicColors.primaryPaletteKeyColor = DynamicColor.fromPalette({
  name: "primary_palette_key_color",
  palette: (s) => s.primaryPalette,
  tone: (s) => s.primaryPalette.keyColor.tone
});
MaterialDynamicColors.secondaryPaletteKeyColor = DynamicColor.fromPalette({
  name: "secondary_palette_key_color",
  palette: (s) => s.secondaryPalette,
  tone: (s) => s.secondaryPalette.keyColor.tone
});
MaterialDynamicColors.tertiaryPaletteKeyColor = DynamicColor.fromPalette({
  name: "tertiary_palette_key_color",
  palette: (s) => s.tertiaryPalette,
  tone: (s) => s.tertiaryPalette.keyColor.tone
});
MaterialDynamicColors.neutralPaletteKeyColor = DynamicColor.fromPalette({
  name: "neutral_palette_key_color",
  palette: (s) => s.neutralPalette,
  tone: (s) => s.neutralPalette.keyColor.tone
});
MaterialDynamicColors.neutralVariantPaletteKeyColor = DynamicColor.fromPalette({
  name: "neutral_variant_palette_key_color",
  palette: (s) => s.neutralVariantPalette,
  tone: (s) => s.neutralVariantPalette.keyColor.tone
});
MaterialDynamicColors.background = DynamicColor.fromPalette({
  name: "background",
  palette: (s) => s.neutralPalette,
  tone: (s) => s.isDark ? 6 : 98,
  isBackground: true
});
MaterialDynamicColors.onBackground = DynamicColor.fromPalette({
  name: "on_background",
  palette: (s) => s.neutralPalette,
  tone: (s) => s.isDark ? 90 : 10,
  background: (s) => MaterialDynamicColors.background,
  contrastCurve: new ContrastCurve(3, 3, 4.5, 7)
});
MaterialDynamicColors.surface = DynamicColor.fromPalette({
  name: "surface",
  palette: (s) => s.neutralPalette,
  tone: (s) => s.isDark ? 6 : 98,
  isBackground: true
});
MaterialDynamicColors.surfaceDim = DynamicColor.fromPalette({
  name: "surface_dim",
  palette: (s) => s.neutralPalette,
  tone: (s) => s.isDark ? 6 : new ContrastCurve(87, 87, 80, 75).get(s.contrastLevel),
  isBackground: true
});
MaterialDynamicColors.surfaceBright = DynamicColor.fromPalette({
  name: "surface_bright",
  palette: (s) => s.neutralPalette,
  tone: (s) => s.isDark ? new ContrastCurve(24, 24, 29, 34).get(s.contrastLevel) : 98,
  isBackground: true
});
MaterialDynamicColors.surfaceContainerLowest = DynamicColor.fromPalette({
  name: "surface_container_lowest",
  palette: (s) => s.neutralPalette,
  tone: (s) => s.isDark ? new ContrastCurve(4, 4, 2, 0).get(s.contrastLevel) : 100,
  isBackground: true
});
MaterialDynamicColors.surfaceContainerLow = DynamicColor.fromPalette({
  name: "surface_container_low",
  palette: (s) => s.neutralPalette,
  tone: (s) => s.isDark ? new ContrastCurve(10, 10, 11, 12).get(s.contrastLevel) : new ContrastCurve(96, 96, 96, 95).get(s.contrastLevel),
  isBackground: true
});
MaterialDynamicColors.surfaceContainer = DynamicColor.fromPalette({
  name: "surface_container",
  palette: (s) => s.neutralPalette,
  tone: (s) => s.isDark ? new ContrastCurve(12, 12, 16, 20).get(s.contrastLevel) : new ContrastCurve(94, 94, 92, 90).get(s.contrastLevel),
  isBackground: true
});
MaterialDynamicColors.surfaceContainerHigh = DynamicColor.fromPalette({
  name: "surface_container_high",
  palette: (s) => s.neutralPalette,
  tone: (s) => s.isDark ? new ContrastCurve(17, 17, 21, 25).get(s.contrastLevel) : new ContrastCurve(92, 92, 88, 85).get(s.contrastLevel),
  isBackground: true
});
MaterialDynamicColors.surfaceContainerHighest = DynamicColor.fromPalette({
  name: "surface_container_highest",
  palette: (s) => s.neutralPalette,
  tone: (s) => s.isDark ? new ContrastCurve(22, 22, 26, 30).get(s.contrastLevel) : new ContrastCurve(90, 90, 84, 80).get(s.contrastLevel),
  isBackground: true
});
MaterialDynamicColors.onSurface = DynamicColor.fromPalette({
  name: "on_surface",
  palette: (s) => s.neutralPalette,
  tone: (s) => s.isDark ? 90 : 10,
  background: (s) => MaterialDynamicColors.highestSurface(s),
  contrastCurve: new ContrastCurve(4.5, 7, 11, 21)
});
MaterialDynamicColors.surfaceVariant = DynamicColor.fromPalette({
  name: "surface_variant",
  palette: (s) => s.neutralVariantPalette,
  tone: (s) => s.isDark ? 30 : 90,
  isBackground: true
});
MaterialDynamicColors.onSurfaceVariant = DynamicColor.fromPalette({
  name: "on_surface_variant",
  palette: (s) => s.neutralVariantPalette,
  tone: (s) => s.isDark ? 80 : 30,
  background: (s) => MaterialDynamicColors.highestSurface(s),
  contrastCurve: new ContrastCurve(3, 4.5, 7, 11)
});
MaterialDynamicColors.inverseSurface = DynamicColor.fromPalette({
  name: "inverse_surface",
  palette: (s) => s.neutralPalette,
  tone: (s) => s.isDark ? 90 : 20
});
MaterialDynamicColors.inverseOnSurface = DynamicColor.fromPalette({
  name: "inverse_on_surface",
  palette: (s) => s.neutralPalette,
  tone: (s) => s.isDark ? 20 : 95,
  background: (s) => MaterialDynamicColors.inverseSurface,
  contrastCurve: new ContrastCurve(4.5, 7, 11, 21)
});
MaterialDynamicColors.outline = DynamicColor.fromPalette({
  name: "outline",
  palette: (s) => s.neutralVariantPalette,
  tone: (s) => s.isDark ? 60 : 50,
  background: (s) => MaterialDynamicColors.highestSurface(s),
  contrastCurve: new ContrastCurve(1.5, 3, 4.5, 7)
});
MaterialDynamicColors.outlineVariant = DynamicColor.fromPalette({
  name: "outline_variant",
  palette: (s) => s.neutralVariantPalette,
  tone: (s) => s.isDark ? 30 : 80,
  background: (s) => MaterialDynamicColors.highestSurface(s),
  contrastCurve: new ContrastCurve(1, 1, 3, 4.5)
});
MaterialDynamicColors.shadow = DynamicColor.fromPalette({
  name: "shadow",
  palette: (s) => s.neutralPalette,
  tone: (s) => 0
});
MaterialDynamicColors.scrim = DynamicColor.fromPalette({
  name: "scrim",
  palette: (s) => s.neutralPalette,
  tone: (s) => 0
});
MaterialDynamicColors.surfaceTint = DynamicColor.fromPalette({
  name: "surface_tint",
  palette: (s) => s.primaryPalette,
  tone: (s) => s.isDark ? 80 : 40,
  isBackground: true
});
MaterialDynamicColors.primary = DynamicColor.fromPalette({
  name: "primary",
  palette: (s) => s.primaryPalette,
  tone: (s) => {
    if (isMonochrome(s)) {
      return s.isDark ? 100 : 0;
    }
    return s.isDark ? 80 : 40;
  },
  isBackground: true,
  background: (s) => MaterialDynamicColors.highestSurface(s),
  contrastCurve: new ContrastCurve(3, 4.5, 7, 7),
  toneDeltaPair: (s) => new ToneDeltaPair(MaterialDynamicColors.primaryContainer, MaterialDynamicColors.primary, 10, "nearer", false)
});
MaterialDynamicColors.onPrimary = DynamicColor.fromPalette({
  name: "on_primary",
  palette: (s) => s.primaryPalette,
  tone: (s) => {
    if (isMonochrome(s)) {
      return s.isDark ? 10 : 90;
    }
    return s.isDark ? 20 : 100;
  },
  background: (s) => MaterialDynamicColors.primary,
  contrastCurve: new ContrastCurve(4.5, 7, 11, 21)
});
MaterialDynamicColors.primaryContainer = DynamicColor.fromPalette({
  name: "primary_container",
  palette: (s) => s.primaryPalette,
  tone: (s) => {
    if (isFidelity(s)) {
      return s.sourceColorHct.tone;
    }
    if (isMonochrome(s)) {
      return s.isDark ? 85 : 25;
    }
    return s.isDark ? 30 : 90;
  },
  isBackground: true,
  background: (s) => MaterialDynamicColors.highestSurface(s),
  contrastCurve: new ContrastCurve(1, 1, 3, 4.5),
  toneDeltaPair: (s) => new ToneDeltaPair(MaterialDynamicColors.primaryContainer, MaterialDynamicColors.primary, 10, "nearer", false)
});
MaterialDynamicColors.onPrimaryContainer = DynamicColor.fromPalette({
  name: "on_primary_container",
  palette: (s) => s.primaryPalette,
  tone: (s) => {
    if (isFidelity(s)) {
      return DynamicColor.foregroundTone(MaterialDynamicColors.primaryContainer.tone(s), 4.5);
    }
    if (isMonochrome(s)) {
      return s.isDark ? 0 : 100;
    }
    return s.isDark ? 90 : 30;
  },
  background: (s) => MaterialDynamicColors.primaryContainer,
  contrastCurve: new ContrastCurve(3, 4.5, 7, 11)
});
MaterialDynamicColors.inversePrimary = DynamicColor.fromPalette({
  name: "inverse_primary",
  palette: (s) => s.primaryPalette,
  tone: (s) => s.isDark ? 40 : 80,
  background: (s) => MaterialDynamicColors.inverseSurface,
  contrastCurve: new ContrastCurve(3, 4.5, 7, 7)
});
MaterialDynamicColors.secondary = DynamicColor.fromPalette({
  name: "secondary",
  palette: (s) => s.secondaryPalette,
  tone: (s) => s.isDark ? 80 : 40,
  isBackground: true,
  background: (s) => MaterialDynamicColors.highestSurface(s),
  contrastCurve: new ContrastCurve(3, 4.5, 7, 7),
  toneDeltaPair: (s) => new ToneDeltaPair(MaterialDynamicColors.secondaryContainer, MaterialDynamicColors.secondary, 10, "nearer", false)
});
MaterialDynamicColors.onSecondary = DynamicColor.fromPalette({
  name: "on_secondary",
  palette: (s) => s.secondaryPalette,
  tone: (s) => {
    if (isMonochrome(s)) {
      return s.isDark ? 10 : 100;
    } else {
      return s.isDark ? 20 : 100;
    }
  },
  background: (s) => MaterialDynamicColors.secondary,
  contrastCurve: new ContrastCurve(4.5, 7, 11, 21)
});
MaterialDynamicColors.secondaryContainer = DynamicColor.fromPalette({
  name: "secondary_container",
  palette: (s) => s.secondaryPalette,
  tone: (s) => {
    const initialTone = s.isDark ? 30 : 90;
    if (isMonochrome(s)) {
      return s.isDark ? 30 : 85;
    }
    if (!isFidelity(s)) {
      return initialTone;
    }
    return findDesiredChromaByTone(s.secondaryPalette.hue, s.secondaryPalette.chroma, initialTone, s.isDark ? false : true);
  },
  isBackground: true,
  background: (s) => MaterialDynamicColors.highestSurface(s),
  contrastCurve: new ContrastCurve(1, 1, 3, 4.5),
  toneDeltaPair: (s) => new ToneDeltaPair(MaterialDynamicColors.secondaryContainer, MaterialDynamicColors.secondary, 10, "nearer", false)
});
MaterialDynamicColors.onSecondaryContainer = DynamicColor.fromPalette({
  name: "on_secondary_container",
  palette: (s) => s.secondaryPalette,
  tone: (s) => {
    if (isMonochrome(s)) {
      return s.isDark ? 90 : 10;
    }
    if (!isFidelity(s)) {
      return s.isDark ? 90 : 30;
    }
    return DynamicColor.foregroundTone(MaterialDynamicColors.secondaryContainer.tone(s), 4.5);
  },
  background: (s) => MaterialDynamicColors.secondaryContainer,
  contrastCurve: new ContrastCurve(3, 4.5, 7, 11)
});
MaterialDynamicColors.tertiary = DynamicColor.fromPalette({
  name: "tertiary",
  palette: (s) => s.tertiaryPalette,
  tone: (s) => {
    if (isMonochrome(s)) {
      return s.isDark ? 90 : 25;
    }
    return s.isDark ? 80 : 40;
  },
  isBackground: true,
  background: (s) => MaterialDynamicColors.highestSurface(s),
  contrastCurve: new ContrastCurve(3, 4.5, 7, 7),
  toneDeltaPair: (s) => new ToneDeltaPair(MaterialDynamicColors.tertiaryContainer, MaterialDynamicColors.tertiary, 10, "nearer", false)
});
MaterialDynamicColors.onTertiary = DynamicColor.fromPalette({
  name: "on_tertiary",
  palette: (s) => s.tertiaryPalette,
  tone: (s) => {
    if (isMonochrome(s)) {
      return s.isDark ? 10 : 90;
    }
    return s.isDark ? 20 : 100;
  },
  background: (s) => MaterialDynamicColors.tertiary,
  contrastCurve: new ContrastCurve(4.5, 7, 11, 21)
});
MaterialDynamicColors.tertiaryContainer = DynamicColor.fromPalette({
  name: "tertiary_container",
  palette: (s) => s.tertiaryPalette,
  tone: (s) => {
    if (isMonochrome(s)) {
      return s.isDark ? 60 : 49;
    }
    if (!isFidelity(s)) {
      return s.isDark ? 30 : 90;
    }
    const proposedHct = s.tertiaryPalette.getHct(s.sourceColorHct.tone);
    return DislikeAnalyzer.fixIfDisliked(proposedHct).tone;
  },
  isBackground: true,
  background: (s) => MaterialDynamicColors.highestSurface(s),
  contrastCurve: new ContrastCurve(1, 1, 3, 4.5),
  toneDeltaPair: (s) => new ToneDeltaPair(MaterialDynamicColors.tertiaryContainer, MaterialDynamicColors.tertiary, 10, "nearer", false)
});
MaterialDynamicColors.onTertiaryContainer = DynamicColor.fromPalette({
  name: "on_tertiary_container",
  palette: (s) => s.tertiaryPalette,
  tone: (s) => {
    if (isMonochrome(s)) {
      return s.isDark ? 0 : 100;
    }
    if (!isFidelity(s)) {
      return s.isDark ? 90 : 30;
    }
    return DynamicColor.foregroundTone(MaterialDynamicColors.tertiaryContainer.tone(s), 4.5);
  },
  background: (s) => MaterialDynamicColors.tertiaryContainer,
  contrastCurve: new ContrastCurve(3, 4.5, 7, 11)
});
MaterialDynamicColors.error = DynamicColor.fromPalette({
  name: "error",
  palette: (s) => s.errorPalette,
  tone: (s) => s.isDark ? 80 : 40,
  isBackground: true,
  background: (s) => MaterialDynamicColors.highestSurface(s),
  contrastCurve: new ContrastCurve(3, 4.5, 7, 7),
  toneDeltaPair: (s) => new ToneDeltaPair(MaterialDynamicColors.errorContainer, MaterialDynamicColors.error, 10, "nearer", false)
});
MaterialDynamicColors.onError = DynamicColor.fromPalette({
  name: "on_error",
  palette: (s) => s.errorPalette,
  tone: (s) => s.isDark ? 20 : 100,
  background: (s) => MaterialDynamicColors.error,
  contrastCurve: new ContrastCurve(4.5, 7, 11, 21)
});
MaterialDynamicColors.errorContainer = DynamicColor.fromPalette({
  name: "error_container",
  palette: (s) => s.errorPalette,
  tone: (s) => s.isDark ? 30 : 90,
  isBackground: true,
  background: (s) => MaterialDynamicColors.highestSurface(s),
  contrastCurve: new ContrastCurve(1, 1, 3, 4.5),
  toneDeltaPair: (s) => new ToneDeltaPair(MaterialDynamicColors.errorContainer, MaterialDynamicColors.error, 10, "nearer", false)
});
MaterialDynamicColors.onErrorContainer = DynamicColor.fromPalette({
  name: "on_error_container",
  palette: (s) => s.errorPalette,
  tone: (s) => {
    if (isMonochrome(s)) {
      return s.isDark ? 90 : 10;
    }
    return s.isDark ? 90 : 30;
  },
  background: (s) => MaterialDynamicColors.errorContainer,
  contrastCurve: new ContrastCurve(3, 4.5, 7, 11)
});
MaterialDynamicColors.primaryFixed = DynamicColor.fromPalette({
  name: "primary_fixed",
  palette: (s) => s.primaryPalette,
  tone: (s) => isMonochrome(s) ? 40 : 90,
  isBackground: true,
  background: (s) => MaterialDynamicColors.highestSurface(s),
  contrastCurve: new ContrastCurve(1, 1, 3, 4.5),
  toneDeltaPair: (s) => new ToneDeltaPair(MaterialDynamicColors.primaryFixed, MaterialDynamicColors.primaryFixedDim, 10, "lighter", true)
});
MaterialDynamicColors.primaryFixedDim = DynamicColor.fromPalette({
  name: "primary_fixed_dim",
  palette: (s) => s.primaryPalette,
  tone: (s) => isMonochrome(s) ? 30 : 80,
  isBackground: true,
  background: (s) => MaterialDynamicColors.highestSurface(s),
  contrastCurve: new ContrastCurve(1, 1, 3, 4.5),
  toneDeltaPair: (s) => new ToneDeltaPair(MaterialDynamicColors.primaryFixed, MaterialDynamicColors.primaryFixedDim, 10, "lighter", true)
});
MaterialDynamicColors.onPrimaryFixed = DynamicColor.fromPalette({
  name: "on_primary_fixed",
  palette: (s) => s.primaryPalette,
  tone: (s) => isMonochrome(s) ? 100 : 10,
  background: (s) => MaterialDynamicColors.primaryFixedDim,
  secondBackground: (s) => MaterialDynamicColors.primaryFixed,
  contrastCurve: new ContrastCurve(4.5, 7, 11, 21)
});
MaterialDynamicColors.onPrimaryFixedVariant = DynamicColor.fromPalette({
  name: "on_primary_fixed_variant",
  palette: (s) => s.primaryPalette,
  tone: (s) => isMonochrome(s) ? 90 : 30,
  background: (s) => MaterialDynamicColors.primaryFixedDim,
  secondBackground: (s) => MaterialDynamicColors.primaryFixed,
  contrastCurve: new ContrastCurve(3, 4.5, 7, 11)
});
MaterialDynamicColors.secondaryFixed = DynamicColor.fromPalette({
  name: "secondary_fixed",
  palette: (s) => s.secondaryPalette,
  tone: (s) => isMonochrome(s) ? 80 : 90,
  isBackground: true,
  background: (s) => MaterialDynamicColors.highestSurface(s),
  contrastCurve: new ContrastCurve(1, 1, 3, 4.5),
  toneDeltaPair: (s) => new ToneDeltaPair(MaterialDynamicColors.secondaryFixed, MaterialDynamicColors.secondaryFixedDim, 10, "lighter", true)
});
MaterialDynamicColors.secondaryFixedDim = DynamicColor.fromPalette({
  name: "secondary_fixed_dim",
  palette: (s) => s.secondaryPalette,
  tone: (s) => isMonochrome(s) ? 70 : 80,
  isBackground: true,
  background: (s) => MaterialDynamicColors.highestSurface(s),
  contrastCurve: new ContrastCurve(1, 1, 3, 4.5),
  toneDeltaPair: (s) => new ToneDeltaPair(MaterialDynamicColors.secondaryFixed, MaterialDynamicColors.secondaryFixedDim, 10, "lighter", true)
});
MaterialDynamicColors.onSecondaryFixed = DynamicColor.fromPalette({
  name: "on_secondary_fixed",
  palette: (s) => s.secondaryPalette,
  tone: (s) => 10,
  background: (s) => MaterialDynamicColors.secondaryFixedDim,
  secondBackground: (s) => MaterialDynamicColors.secondaryFixed,
  contrastCurve: new ContrastCurve(4.5, 7, 11, 21)
});
MaterialDynamicColors.onSecondaryFixedVariant = DynamicColor.fromPalette({
  name: "on_secondary_fixed_variant",
  palette: (s) => s.secondaryPalette,
  tone: (s) => isMonochrome(s) ? 25 : 30,
  background: (s) => MaterialDynamicColors.secondaryFixedDim,
  secondBackground: (s) => MaterialDynamicColors.secondaryFixed,
  contrastCurve: new ContrastCurve(3, 4.5, 7, 11)
});
MaterialDynamicColors.tertiaryFixed = DynamicColor.fromPalette({
  name: "tertiary_fixed",
  palette: (s) => s.tertiaryPalette,
  tone: (s) => isMonochrome(s) ? 40 : 90,
  isBackground: true,
  background: (s) => MaterialDynamicColors.highestSurface(s),
  contrastCurve: new ContrastCurve(1, 1, 3, 4.5),
  toneDeltaPair: (s) => new ToneDeltaPair(MaterialDynamicColors.tertiaryFixed, MaterialDynamicColors.tertiaryFixedDim, 10, "lighter", true)
});
MaterialDynamicColors.tertiaryFixedDim = DynamicColor.fromPalette({
  name: "tertiary_fixed_dim",
  palette: (s) => s.tertiaryPalette,
  tone: (s) => isMonochrome(s) ? 30 : 80,
  isBackground: true,
  background: (s) => MaterialDynamicColors.highestSurface(s),
  contrastCurve: new ContrastCurve(1, 1, 3, 4.5),
  toneDeltaPair: (s) => new ToneDeltaPair(MaterialDynamicColors.tertiaryFixed, MaterialDynamicColors.tertiaryFixedDim, 10, "lighter", true)
});
MaterialDynamicColors.onTertiaryFixed = DynamicColor.fromPalette({
  name: "on_tertiary_fixed",
  palette: (s) => s.tertiaryPalette,
  tone: (s) => isMonochrome(s) ? 100 : 10,
  background: (s) => MaterialDynamicColors.tertiaryFixedDim,
  secondBackground: (s) => MaterialDynamicColors.tertiaryFixed,
  contrastCurve: new ContrastCurve(4.5, 7, 11, 21)
});
MaterialDynamicColors.onTertiaryFixedVariant = DynamicColor.fromPalette({
  name: "on_tertiary_fixed_variant",
  palette: (s) => s.tertiaryPalette,
  tone: (s) => isMonochrome(s) ? 90 : 30,
  background: (s) => MaterialDynamicColors.tertiaryFixedDim,
  secondBackground: (s) => MaterialDynamicColors.tertiaryFixed,
  contrastCurve: new ContrastCurve(3, 4.5, 7, 11)
});
/**
* @license
* Copyright 2021 Google LLC
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*      http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
class CorePalette {
  /**
   * @param argb ARGB representation of a color
   */
  static of(argb) {
    return new CorePalette(argb, false);
  }
  /**
   * @param argb ARGB representation of a color
   */
  static contentOf(argb) {
    return new CorePalette(argb, true);
  }
  /**
   * Create a [CorePalette] from a set of colors
   */
  static fromColors(colors) {
    return CorePalette.createPaletteFromColors(false, colors);
  }
  /**
   * Create a content [CorePalette] from a set of colors
   */
  static contentFromColors(colors) {
    return CorePalette.createPaletteFromColors(true, colors);
  }
  static createPaletteFromColors(content, colors) {
    const palette = new CorePalette(colors.primary, content);
    if (colors.secondary) {
      const p = new CorePalette(colors.secondary, content);
      palette.a2 = p.a1;
    }
    if (colors.tertiary) {
      const p = new CorePalette(colors.tertiary, content);
      palette.a3 = p.a1;
    }
    if (colors.error) {
      const p = new CorePalette(colors.error, content);
      palette.error = p.a1;
    }
    if (colors.neutral) {
      const p = new CorePalette(colors.neutral, content);
      palette.n1 = p.n1;
    }
    if (colors.neutralVariant) {
      const p = new CorePalette(colors.neutralVariant, content);
      palette.n2 = p.n2;
    }
    return palette;
  }
  constructor(argb, isContent) {
    const hct = Hct.fromInt(argb);
    const hue = hct.hue;
    const chroma = hct.chroma;
    if (isContent) {
      this.a1 = TonalPalette.fromHueAndChroma(hue, chroma);
      this.a2 = TonalPalette.fromHueAndChroma(hue, chroma / 3);
      this.a3 = TonalPalette.fromHueAndChroma(hue + 60, chroma / 2);
      this.n1 = TonalPalette.fromHueAndChroma(hue, Math.min(chroma / 12, 4));
      this.n2 = TonalPalette.fromHueAndChroma(hue, Math.min(chroma / 6, 8));
    } else {
      this.a1 = TonalPalette.fromHueAndChroma(hue, Math.max(48, chroma));
      this.a2 = TonalPalette.fromHueAndChroma(hue, 16);
      this.a3 = TonalPalette.fromHueAndChroma(hue + 60, 24);
      this.n1 = TonalPalette.fromHueAndChroma(hue, 4);
      this.n2 = TonalPalette.fromHueAndChroma(hue, 8);
    }
    this.error = TonalPalette.fromHueAndChroma(25, 84);
  }
}
/**
* @license
* Copyright 2021 Google LLC
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*      http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
class Scheme {
  get primary() {
    return this.props.primary;
  }
  get onPrimary() {
    return this.props.onPrimary;
  }
  get primaryContainer() {
    return this.props.primaryContainer;
  }
  get onPrimaryContainer() {
    return this.props.onPrimaryContainer;
  }
  get secondary() {
    return this.props.secondary;
  }
  get onSecondary() {
    return this.props.onSecondary;
  }
  get secondaryContainer() {
    return this.props.secondaryContainer;
  }
  get onSecondaryContainer() {
    return this.props.onSecondaryContainer;
  }
  get tertiary() {
    return this.props.tertiary;
  }
  get onTertiary() {
    return this.props.onTertiary;
  }
  get tertiaryContainer() {
    return this.props.tertiaryContainer;
  }
  get onTertiaryContainer() {
    return this.props.onTertiaryContainer;
  }
  get error() {
    return this.props.error;
  }
  get onError() {
    return this.props.onError;
  }
  get errorContainer() {
    return this.props.errorContainer;
  }
  get onErrorContainer() {
    return this.props.onErrorContainer;
  }
  get background() {
    return this.props.background;
  }
  get onBackground() {
    return this.props.onBackground;
  }
  get surface() {
    return this.props.surface;
  }
  get onSurface() {
    return this.props.onSurface;
  }
  get surfaceVariant() {
    return this.props.surfaceVariant;
  }
  get onSurfaceVariant() {
    return this.props.onSurfaceVariant;
  }
  get outline() {
    return this.props.outline;
  }
  get outlineVariant() {
    return this.props.outlineVariant;
  }
  get shadow() {
    return this.props.shadow;
  }
  get scrim() {
    return this.props.scrim;
  }
  get inverseSurface() {
    return this.props.inverseSurface;
  }
  get inverseOnSurface() {
    return this.props.inverseOnSurface;
  }
  get inversePrimary() {
    return this.props.inversePrimary;
  }
  /**
   * @param argb ARGB representation of a color.
   * @return Light Material color scheme, based on the color's hue.
   */
  static light(argb) {
    return Scheme.lightFromCorePalette(CorePalette.of(argb));
  }
  /**
   * @param argb ARGB representation of a color.
   * @return Dark Material color scheme, based on the color's hue.
   */
  static dark(argb) {
    return Scheme.darkFromCorePalette(CorePalette.of(argb));
  }
  /**
   * @param argb ARGB representation of a color.
   * @return Light Material content color scheme, based on the color's hue.
   */
  static lightContent(argb) {
    return Scheme.lightFromCorePalette(CorePalette.contentOf(argb));
  }
  /**
   * @param argb ARGB representation of a color.
   * @return Dark Material content color scheme, based on the color's hue.
   */
  static darkContent(argb) {
    return Scheme.darkFromCorePalette(CorePalette.contentOf(argb));
  }
  /**
   * Light scheme from core palette
   */
  static lightFromCorePalette(core) {
    return new Scheme({
      primary: core.a1.tone(40),
      onPrimary: core.a1.tone(100),
      primaryContainer: core.a1.tone(90),
      onPrimaryContainer: core.a1.tone(10),
      secondary: core.a2.tone(40),
      onSecondary: core.a2.tone(100),
      secondaryContainer: core.a2.tone(90),
      onSecondaryContainer: core.a2.tone(10),
      tertiary: core.a3.tone(40),
      onTertiary: core.a3.tone(100),
      tertiaryContainer: core.a3.tone(90),
      onTertiaryContainer: core.a3.tone(10),
      error: core.error.tone(40),
      onError: core.error.tone(100),
      errorContainer: core.error.tone(90),
      onErrorContainer: core.error.tone(10),
      background: core.n1.tone(99),
      onBackground: core.n1.tone(10),
      surface: core.n1.tone(99),
      onSurface: core.n1.tone(10),
      surfaceVariant: core.n2.tone(90),
      onSurfaceVariant: core.n2.tone(30),
      outline: core.n2.tone(50),
      outlineVariant: core.n2.tone(80),
      shadow: core.n1.tone(0),
      scrim: core.n1.tone(0),
      inverseSurface: core.n1.tone(20),
      inverseOnSurface: core.n1.tone(95),
      inversePrimary: core.a1.tone(80)
    });
  }
  /**
   * Dark scheme from core palette
   */
  static darkFromCorePalette(core) {
    return new Scheme({
      primary: core.a1.tone(80),
      onPrimary: core.a1.tone(20),
      primaryContainer: core.a1.tone(30),
      onPrimaryContainer: core.a1.tone(90),
      secondary: core.a2.tone(80),
      onSecondary: core.a2.tone(20),
      secondaryContainer: core.a2.tone(30),
      onSecondaryContainer: core.a2.tone(90),
      tertiary: core.a3.tone(80),
      onTertiary: core.a3.tone(20),
      tertiaryContainer: core.a3.tone(30),
      onTertiaryContainer: core.a3.tone(90),
      error: core.error.tone(80),
      onError: core.error.tone(20),
      errorContainer: core.error.tone(30),
      onErrorContainer: core.error.tone(80),
      background: core.n1.tone(10),
      onBackground: core.n1.tone(90),
      surface: core.n1.tone(10),
      onSurface: core.n1.tone(90),
      surfaceVariant: core.n2.tone(30),
      onSurfaceVariant: core.n2.tone(80),
      outline: core.n2.tone(60),
      outlineVariant: core.n2.tone(30),
      shadow: core.n1.tone(0),
      scrim: core.n1.tone(0),
      inverseSurface: core.n1.tone(90),
      inverseOnSurface: core.n1.tone(20),
      inversePrimary: core.a1.tone(40)
    });
  }
  constructor(props) {
    this.props = props;
  }
  toJSON() {
    return {
      ...this.props
    };
  }
}
/**
* @license
* Copyright 2021 Google LLC
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*      http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
function hexFromArgb(argb) {
  const r2 = redFromArgb(argb);
  const g = greenFromArgb(argb);
  const b = blueFromArgb(argb);
  const outParts = [r2.toString(16), g.toString(16), b.toString(16)];
  for (const [i2, part] of outParts.entries()) {
    if (part.length === 1) {
      outParts[i2] = "0" + part;
    }
  }
  return "#" + outParts.join("");
}
/**
* @license
* Copyright 2021 Google LLC
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*      http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
function themeFromSourceColor(source, customColors = []) {
  const palette = CorePalette.of(source);
  return {
    source,
    schemes: {
      light: Scheme.light(source),
      dark: Scheme.dark(source)
    },
    palettes: {
      primary: palette.a1,
      secondary: palette.a2,
      tertiary: palette.a3,
      neutral: palette.n1,
      neutralVariant: palette.n2,
      error: palette.error
    },
    customColors: customColors.map((c) => customColor(source, c))
  };
}
function customColor(source, color) {
  let value = color.value;
  const from = value;
  const to = source;
  if (color.blend) {
    value = Blend.harmonize(from, to);
  }
  const palette = CorePalette.of(value);
  const tones = palette.a1;
  return {
    color,
    value,
    light: {
      color: tones.tone(40),
      onColor: tones.tone(100),
      colorContainer: tones.tone(90),
      onColorContainer: tones.tone(10)
    },
    dark: {
      color: tones.tone(80),
      onColor: tones.tone(20),
      colorContainer: tones.tone(30),
      onColorContainer: tones.tone(90)
    }
  };
}
function applyTheme(theme, options) {
  const target = (options == null ? void 0 : options.target) || document.body;
  const isDark = (options == null ? void 0 : options.dark) ?? false;
  const scheme = isDark ? theme.schemes.dark : theme.schemes.light;
  setSchemeProperties(target, scheme);
  if (options == null ? void 0 : options.brightnessSuffix) {
    setSchemeProperties(target, theme.schemes.dark, "-dark");
    setSchemeProperties(target, theme.schemes.light, "-light");
  }
  if (options == null ? void 0 : options.paletteTones) {
    const tones = (options == null ? void 0 : options.paletteTones) ?? [];
    for (const [key, palette] of Object.entries(theme.palettes)) {
      const paletteKey = key.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
      for (const tone of tones) {
        const token = `--md-ref-palette-${paletteKey}-${paletteKey}${tone}`;
        const color = hexFromArgb(palette.tone(tone));
        target.style.setProperty(token, color);
      }
    }
  }
}
function setSchemeProperties(target, scheme, suffix = "") {
  for (const [key, value] of Object.entries(scheme.toJSON())) {
    const token = key.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
    const color = hexFromArgb(value);
    target.style.setProperty(`--md-sys-color-${token}${suffix}`, color);
  }
}
var t = function(t2, r2) {
  return t2 < r2 ? -1 : t2 > r2 ? 1 : 0;
}, r = function(t2) {
  return t2.reduce(function(t3, r2) {
    return t3 + r2;
  }, 0);
}, n = /* @__PURE__ */ function() {
  function t2(t3) {
    this.colors = t3;
  }
  var r2 = t2.prototype;
  return r2.palette = function() {
    return this.colors;
  }, r2.map = function(t3) {
    return t3;
  }, t2;
}(), o = function() {
  function o2(t2, r2, n2) {
    return (t2 << 10) + (r2 << 5) + n2;
  }
  function e2(t2) {
    var r2 = [], n2 = false;
    function o3() {
      r2.sort(t2), n2 = true;
    }
    return { push: function(t3) {
      r2.push(t3), n2 = false;
    }, peek: function(t3) {
      return n2 || o3(), void 0 === t3 && (t3 = r2.length - 1), r2[t3];
    }, pop: function() {
      return n2 || o3(), r2.pop();
    }, size: function() {
      return r2.length;
    }, map: function(t3) {
      return r2.map(t3);
    }, debug: function() {
      return n2 || o3(), r2;
    } };
  }
  function i2(t2, r2, n2, o3, e3, i3, u3) {
    var a2 = this;
    a2.r1 = t2, a2.r2 = r2, a2.g1 = n2, a2.g2 = o3, a2.b1 = e3, a2.b2 = i3, a2.histo = u3;
  }
  function u2() {
    this.vboxes = new e2(function(r2, n2) {
      return t(r2.vbox.count() * r2.vbox.volume(), n2.vbox.count() * n2.vbox.volume());
    });
  }
  function a(t2, r2) {
    if (r2.count()) {
      var n2 = r2.r2 - r2.r1 + 1, e3 = r2.g2 - r2.g1 + 1, i3 = Math.max.apply(null, [n2, e3, r2.b2 - r2.b1 + 1]);
      if (1 == r2.count()) return [r2.copy()];
      var u3, a2, c, f, s = 0, h = [], v = [];
      if (i3 == n2) for (u3 = r2.r1; u3 <= r2.r2; u3++) {
        for (f = 0, a2 = r2.g1; a2 <= r2.g2; a2++) for (c = r2.b1; c <= r2.b2; c++) f += t2[o2(u3, a2, c)] || 0;
        h[u3] = s += f;
      }
      else if (i3 == e3) for (u3 = r2.g1; u3 <= r2.g2; u3++) {
        for (f = 0, a2 = r2.r1; a2 <= r2.r2; a2++) for (c = r2.b1; c <= r2.b2; c++) f += t2[o2(a2, u3, c)] || 0;
        h[u3] = s += f;
      }
      else for (u3 = r2.b1; u3 <= r2.b2; u3++) {
        for (f = 0, a2 = r2.r1; a2 <= r2.r2; a2++) for (c = r2.g1; c <= r2.g2; c++) f += t2[o2(a2, c, u3)] || 0;
        h[u3] = s += f;
      }
      return h.forEach(function(t3, r3) {
        v[r3] = s - t3;
      }), function(t3) {
        var n3, o3, e4, i4, a3, c2 = t3 + "1", f2 = t3 + "2", l = 0;
        for (u3 = r2[c2]; u3 <= r2[f2]; u3++) if (h[u3] > s / 2) {
          for (e4 = r2.copy(), i4 = r2.copy(), a3 = (n3 = u3 - r2[c2]) <= (o3 = r2[f2] - u3) ? Math.min(r2[f2] - 1, ~~(u3 + o3 / 2)) : Math.max(r2[c2], ~~(u3 - 1 - n3 / 2)); !h[a3]; ) a3++;
          for (l = v[a3]; !l && h[a3 - 1]; ) l = v[--a3];
          return e4[f2] = a3, i4[c2] = e4[f2] + 1, [e4, i4];
        }
      }(i3 == n2 ? "r" : i3 == e3 ? "g" : "b");
    }
  }
  return i2.prototype = { volume: function(t2) {
    var r2 = this;
    return r2._volume && !t2 || (r2._volume = (r2.r2 - r2.r1 + 1) * (r2.g2 - r2.g1 + 1) * (r2.b2 - r2.b1 + 1)), r2._volume;
  }, count: function(t2) {
    var r2 = this, n2 = r2.histo;
    if (!r2._count_set || t2) {
      var e3, i3, u3, a2 = 0;
      for (e3 = r2.r1; e3 <= r2.r2; e3++) for (i3 = r2.g1; i3 <= r2.g2; i3++) for (u3 = r2.b1; u3 <= r2.b2; u3++) a2 += n2[o2(e3, i3, u3)] || 0;
      r2._count = a2, r2._count_set = true;
    }
    return r2._count;
  }, copy: function() {
    var t2 = this;
    return new i2(t2.r1, t2.r2, t2.g1, t2.g2, t2.b1, t2.b2, t2.histo);
  }, avg: function(t2) {
    var r2 = this, n2 = r2.histo;
    if (!r2._avg || t2) {
      var e3, i3, u3, a2, c = 0, f = 0, s = 0, h = 0;
      if (r2.r1 === r2.r2 && r2.g1 === r2.g2 && r2.b1 === r2.b2) r2._avg = [r2.r1 << 3, r2.g1 << 3, r2.b1 << 3];
      else {
        for (i3 = r2.r1; i3 <= r2.r2; i3++) for (u3 = r2.g1; u3 <= r2.g2; u3++) for (a2 = r2.b1; a2 <= r2.b2; a2++) c += e3 = n2[o2(i3, u3, a2)] || 0, f += e3 * (i3 + 0.5) * 8, s += e3 * (u3 + 0.5) * 8, h += e3 * (a2 + 0.5) * 8;
        r2._avg = c ? [~~(f / c), ~~(s / c), ~~(h / c)] : [~~(8 * (r2.r1 + r2.r2 + 1) / 2), ~~(8 * (r2.g1 + r2.g2 + 1) / 2), ~~(8 * (r2.b1 + r2.b2 + 1) / 2)];
      }
    }
    return r2._avg;
  }, contains: function(t2) {
    var r2 = this, n2 = t2[0] >> 3;
    return gval = t2[1] >> 3, bval = t2[2] >> 3, n2 >= r2.r1 && n2 <= r2.r2 && gval >= r2.g1 && gval <= r2.g2 && bval >= r2.b1 && bval <= r2.b2;
  } }, u2.prototype = { push: function(t2) {
    this.vboxes.push({ vbox: t2, color: t2.avg() });
  }, palette: function() {
    return this.vboxes.map(function(t2) {
      return t2.color;
    });
  }, size: function() {
    return this.vboxes.size();
  }, map: function(t2) {
    for (var r2 = this.vboxes, n2 = 0; n2 < r2.size(); n2++) if (r2.peek(n2).vbox.contains(t2)) return r2.peek(n2).color;
    return this.nearest(t2);
  }, nearest: function(t2) {
    for (var r2, n2, o3, e3 = this.vboxes, i3 = 0; i3 < e3.size(); i3++) ((n2 = Math.sqrt(Math.pow(t2[0] - e3.peek(i3).color[0], 2) + Math.pow(t2[1] - e3.peek(i3).color[1], 2) + Math.pow(t2[2] - e3.peek(i3).color[2], 2))) < r2 || void 0 === r2) && (r2 = n2, o3 = e3.peek(i3).color);
    return o3;
  }, forcebw: function() {
    var n2 = this.vboxes;
    n2.sort(function(n3, o4) {
      return t(r(n3.color), r(o4.color));
    });
    var o3 = n2[0].color;
    o3[0] < 5 && o3[1] < 5 && o3[2] < 5 && (n2[0].color = [0, 0, 0]);
    var e3 = n2.length - 1, i3 = n2[e3].color;
    i3[0] > 251 && i3[1] > 251 && i3[2] > 251 && (n2[e3].color = [255, 255, 255]);
  } }, { quantize: function(r2, c) {
    if (!Number.isInteger(c) || c < 1 || c > 256) throw new Error("Invalid maximum color count. It must be an integer between 1 and 256.");
    if (!r2.length || c < 2 || c > 256) return false;
    if (!r2.length || c < 2 || c > 256) return false;
    for (var f = [], s = /* @__PURE__ */ new Set(), h = 0; h < r2.length; h++) {
      var v = r2[h], l = v.join(",");
      s.has(l) || (s.add(l), f.push(v));
    }
    if (f.length <= c) return new n(f);
    var g = function(t2) {
      var r3, n2 = new Array(32768);
      return t2.forEach(function(t3) {
        r3 = o2(t3[0] >> 3, t3[1] >> 3, t3[2] >> 3), n2[r3] = (n2[r3] || 0) + 1;
      }), n2;
    }(r2);
    g.forEach(function() {
    });
    var p = function(t2, r3) {
      var n2, o3, e3, u3 = 1e6, a2 = 0, c2 = 1e6, f2 = 0, s2 = 1e6, h2 = 0;
      return t2.forEach(function(t3) {
        (n2 = t3[0] >> 3) < u3 ? u3 = n2 : n2 > a2 && (a2 = n2), (o3 = t3[1] >> 3) < c2 ? c2 = o3 : o3 > f2 && (f2 = o3), (e3 = t3[2] >> 3) < s2 ? s2 = e3 : e3 > h2 && (h2 = e3);
      }), new i2(u3, a2, c2, f2, s2, h2, r3);
    }(r2, g), b = new e2(function(r3, n2) {
      return t(r3.count(), n2.count());
    });
    function m(t2, r3) {
      for (var n2, o3 = t2.size(), e3 = 0; e3 < 1e3; ) {
        if (o3 >= r3) return;
        if (e3++ > 1e3) return;
        if ((n2 = t2.pop()).count()) {
          var i3 = a(g, n2), u3 = i3[0], c2 = i3[1];
          if (!u3) return;
          t2.push(u3), c2 && (t2.push(c2), o3++);
        } else t2.push(n2), e3++;
      }
    }
    b.push(p), m(b, 0.75 * c);
    for (var d = new e2(function(r3, n2) {
      return t(r3.count() * r3.volume(), n2.count() * n2.volume());
    }); b.size(); ) d.push(b.pop());
    m(d, c);
    for (var w = new u2(); d.size(); ) w.push(d.pop());
    return w;
  } };
}().quantize, e = function(t2) {
  this.canvas = document.createElement("canvas"), this.context = this.canvas.getContext("2d"), this.width = this.canvas.width = t2.naturalWidth, this.height = this.canvas.height = t2.naturalHeight, this.context.drawImage(t2, 0, 0, this.width, this.height);
};
e.prototype.getImageData = function() {
  return this.context.getImageData(0, 0, this.width, this.height);
};
var u = function() {
};
u.prototype.getColor = function(t2, r2) {
  return void 0 === r2 && (r2 = 10), this.getPalette(t2, 5, r2)[0];
}, u.prototype.getPalette = function(t2, r2, n2) {
  var i2 = function(t3) {
    var r3 = t3.colorCount, n3 = t3.quality;
    if (void 0 !== r3 && Number.isInteger(r3)) {
      if (1 === r3) throw new Error("colorCount should be between 2 and 20. To get one color, call getColor() instead of getPalette()");
      r3 = Math.max(r3, 2), r3 = Math.min(r3, 20);
    } else r3 = 10;
    return (void 0 === n3 || !Number.isInteger(n3) || n3 < 1) && (n3 = 10), { colorCount: r3, quality: n3 };
  }({ colorCount: r2, quality: n2 }), u2 = new e(t2), a = function(t3, r3, n3) {
    for (var o2, e2, i3, u3, a2, c2 = t3, f = [], s = 0; s < r3; s += n3) e2 = c2[0 + (o2 = 4 * s)], i3 = c2[o2 + 1], u3 = c2[o2 + 2], (void 0 === (a2 = c2[o2 + 3]) || a2 >= 125) && (e2 > 250 && i3 > 250 && u3 > 250 || f.push([e2, i3, u3]));
    return f;
  }(u2.getImageData().data, u2.width * u2.height, i2.quality), c = o(a, i2.colorCount);
  return c ? c.palette() : null;
}, u.prototype.getColorFromUrl = function(t2, r2, n2) {
  var o2 = this, e2 = document.createElement("img");
  e2.addEventListener("load", function() {
    var i2 = o2.getPalette(e2, 5, n2);
    r2(i2[0], t2);
  }), e2.src = t2;
}, u.prototype.getImageData = function(t2, r2) {
  var n2 = new XMLHttpRequest();
  n2.open("GET", t2, true), n2.responseType = "arraybuffer", n2.onload = function() {
    if (200 == this.status) {
      var t3 = new Uint8Array(this.response);
      i = t3.length;
      for (var n3 = new Array(i), o2 = 0; o2 < t3.length; o2++) n3[o2] = String.fromCharCode(t3[o2]);
      var e2 = n3.join(""), u2 = window.btoa(e2);
      r2("data:image/png;base64," + u2);
    }
  }, n2.send();
}, u.prototype.getColorAsync = function(t2, r2, n2) {
  var o2 = this;
  this.getImageData(t2, function(t3) {
    var e2 = document.createElement("img");
    e2.addEventListener("load", function() {
      var t4 = o2.getPalette(e2, 5, n2);
      r2(t4[0], this);
    }), e2.src = t3;
  });
};
function injectViewTransitionStyles() {
  if (document.head.querySelector("#view-transition-styles")) return;
  const style = document.createElement("style");
  style.id = "view-transition-styles";
  style.textContent = `
      ::view-transition-new(root),
      ::view-transition-old(root) {
          animation: none !important;
      }
      body.apply-bg::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: var(--temp-bg-color);
          z-index: -1;
      }
      .reverse-bg::view-transition-old(root) {
          z-index: 100 !important;
      }
  `;
  if (document.head.firstChild) {
    document.head.insertBefore(style, document.head.firstChild);
  } else {
    document.head.appendChild(style);
  }
}
class ColorThemeExtractor {
  constructor({
    needTransition = true
  } = {}) {
    __publicField(this, "colorThief");
    __publicField(this, "needTransition");
    __publicField(this, "transitionAnimate", (reverse = false) => {
      let startX;
      let startY;
      if (reverse) {
        startX = window.innerWidth;
        startY = 0;
      } else {
        startX = 0;
        startY = 0;
      }
      const radius = Math.hypot(
        Math.max(startX, innerWidth - startX),
        Math.max(startY, innerHeight - startY)
      );
      const clipPath = [
        `circle(0% at ${startX}px ${startY}px)`,
        `circle(${radius}px at ${startX}px ${startY}px)`
      ];
      document.documentElement.animate(
        {
          clipPath: reverse ? clipPath.reverse() : clipPath
        },
        {
          duration: 350,
          pseudoElement: reverse ? "::view-transition-old(root)" : "::view-transition-new(root)"
        }
      );
    });
    this.colorThief = new u();
    this.needTransition = needTransition;
    if (needTransition) {
      injectViewTransitionStyles();
    }
  }
  hexFromArgb(argb) {
    return hexFromArgb(argb);
  }
  applyTheme(theme, options) {
    if (!this.needTransition) {
      applyTheme(theme, options);
      return;
    }
    const transition = document.startViewTransition(() => {
      applyTheme(theme, options);
      document.body.classList.add("apply-bg");
      const bgColor = this.hexFromArgb(
        theme.schemes.light.props.primaryContainer
      );
      document.body.style.setProperty("--temp-bg-color", bgColor);
    });
    transition.ready.then(() => {
      this.transitionAnimate();
    });
    transition.finished.then(() => {
      setTimeout(() => {
        document.documentElement.classList.add("reverse-bg");
        const transition2 = document.startViewTransition(() => {
          const bgColor = this.hexFromArgb(
            theme.schemes.light.props.background
          );
          document.body.style.setProperty("--temp-bg-color", bgColor);
        });
        transition2.ready.then(() => {
          this.transitionAnimate(true);
        });
        transition2.finished.then(() => {
          document.documentElement.classList.remove("reverse-bg");
        });
      }, 350);
    });
  }
  async extractMainColor(imageSource) {
    let img;
    if (typeof imageSource === "string") {
      img = new Image();
      img.crossOrigin = "Anonymous";
      img.src = imageSource;
      await new Promise((resolve) => {
        img.onload = resolve;
      });
    } else {
      img = imageSource;
    }
    const color = await this.colorThief.getColor(img);
    if (!color) {
      throw new Error("Failed to extract main color");
    }
    return { r: color[0], g: color[1], b: color[2] };
  }
  generateThemeScheme(baseColor) {
    const source = baseColor.r << 16 | baseColor.g << 8 | baseColor.b;
    return themeFromSourceColor(source);
  }
  async generateThemeSchemeFromImage(imageSource) {
    const baseColor = await this.extractMainColor(imageSource);
    return this.generateThemeScheme(baseColor);
  }
}
export {
  ColorThemeExtractor,
  ColorThemeExtractor as default
};
