const fs = require("fs");

// Parse coordinates
function parseCoords(text) {
  const result = {};
  text.split("\n").forEach((line) => {
    const m = line.match(/^\s*(\w+):\s*\{[\s]*x:\s*(\d+),[\s]*y:\s*(\d+)\s*\}/);
    if (m) result[m[1]] = { x: parseInt(m[2]), y: parseInt(m[3]) };
  });
  return result;
}

const coord1 = parseCoords(
  fs.readFileSync("data/coordinates_floor1.js", "utf8"),
);
const coord2 = parseCoords(
  fs.readFileSync("data/coordinates_floor2.js", "utf8"),
);
const coord3 = parseCoords(
  fs.readFileSync("data/coordinates_floor3.js", "utf8"),
);

// Load all room defs
let allRooms = {};
[
  "A_Rooms.js",
  "B_Rooms.js",
  "C_Rooms.js",
  "Z_Rooms.js",
  "D_Rooms.js",
  "E_Rooms.js",
  "F_Rooms.js",
].forEach((f) => {
  const content = fs.readFileSync("data/" + f, "utf8");
  const matches = content.match(/^\s*(\w+):\s*"([^"]+)"/gm);
  if (matches) {
    matches.forEach((m) => {
      const [, r, p] = m.match(/^\s*(\w+):\s*"([^"]+)"/);
      allRooms[r] = p;
    });
  }
});

// Check coverage
const floor1Rooms = Object.keys(allRooms).filter((r) => r.match(/[A-Z]1\d{2}/));
const floor2Rooms = Object.keys(allRooms).filter((r) => r.match(/[A-Z]2\d{2}/));
const floor3Rooms = Object.keys(allRooms).filter((r) => r.match(/[A-Z]3\d{2}/));

const missing1 = floor1Rooms.filter((r) => !coord1[r]);
const missing2 = floor2Rooms.filter((r) => !coord2[r]);
const missing3 = floor3Rooms.filter((r) => !coord3[r]);

console.log("Coverage Report:");
console.log(
  "Floor 1:",
  floor1Rooms.length,
  "defined,",
  Object.keys(coord1).length,
  "with coords,",
  "missing:",
  missing1.length,
);
if (missing1.length > 0 && missing1.length <= 20)
  console.log("  Missing:", missing1.join(", "));
console.log(
  "Floor 2:",
  floor2Rooms.length,
  "defined,",
  Object.keys(coord2).length,
  "with coords,",
  "missing:",
  missing2.length,
);
if (missing2.length > 0 && missing2.length <= 20)
  console.log("  Missing:", missing2.join(", "));
console.log(
  "Floor 3:",
  floor3Rooms.length,
  "defined,",
  Object.keys(coord3).length,
  "with coords,",
  "missing:",
  missing3.length,
);
if (missing3.length > 0 && missing3.length <= 20)
  console.log("  Missing:", missing3.join(", "));

console.log("\n✓ Coordinate update complete!");
console.log(
  `Total rooms with coordinates: ${Object.keys(coord1).length + Object.keys(coord2).length + Object.keys(coord3).length}`,
);
