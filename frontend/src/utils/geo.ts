// Simplified polygons for NE India to filter out synthetic points falling in neighboring countries
// Coordinates in [longitude, latitude]

const SIKKIM_POLY = [
  [88.0, 27.1], [88.0, 28.1], [88.9, 28.1], [88.9, 27.1]
];

const SEVEN_SISTERS_POLY = [
  [89.8, 25.8], // Assam/Meghalaya west
  [89.8, 26.8], // Assam NW (below Bhutan)
  [92.0, 26.8], // Bhutan east edge
  [91.5, 27.8], // Arunachal West
  [97.5, 29.5], // Arunachal NE
  [97.5, 27.0], // Arunachal SE
  [95.5, 26.5], // Nagaland East
  [94.8, 24.5], // Manipur East
  [93.2, 21.9], // Mizoram South
  [92.2, 22.5], // Mizoram West
  [91.1, 22.9], // Tripura South
  [91.1, 24.5], // Tripura North
  [92.5, 25.0], // Meghalaya East/BD border
  [89.8, 25.0], // Meghalaya West/BD border
];

// Ray-casting algorithm for point in polygon
function pointInPolygon(point: [number, number], vs: number[][]) {
  const x = point[0], y = point[1];
  let inside = false;
  for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
    const xi = vs[i][0], yi = vs[i][1];
    const xj = vs[j][0], yj = vs[j][1];
    const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

export function isWithinNortheastIndia(lat: number, lon: number): boolean {
  const pt: [number, number] = [lon, lat];
  return pointInPolygon(pt, SIKKIM_POLY) || pointInPolygon(pt, SEVEN_SISTERS_POLY);
}
