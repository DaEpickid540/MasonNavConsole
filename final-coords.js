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

// Find missing and estimate
function addMissing(coords, roomDefs, floor) {
  let roomsOnFloor = Object.keys(roomDefs).filter((r) => {
    if (floor === 1) return r.match(/[A-Z]1\d{2}/);
    if (floor === 2) return r.match(/[A-Z]2\d{2}/);
    if (floor === 3) return r.match(/[A-Z]3\d{2}/);
  });

  let added = 0;
  roomsOnFloor.forEach((room) => {
    if (!coords[room]) {
      const pod = roomDefs[room];
      const podCoords = coords[pod];
      if (podCoords) {
        // Create slight variation based on room number pattern
        const hash = room.charCodeAt(0) + room.charCodeAt(room.length - 1);
        coords[room] = {
          x: podCoords.x + (hash % 5) * 25 - 50,
          y: podCoords.y + Math.floor(hash / 5) * 25 - 50,
        };
        added++;
      }
    }
  });

  console.log(`Floor ${floor}: Added ${added} pod-based coordinates`);
  return coords;
}

addMissing(coord1, allRooms, 1);
addMissing(coord2, allRooms, 2);
addMissing(coord3, allRooms, 3);

// Write back
function generateCoordinateFile(coords, floorNum) {
  const entries = Object.entries(coords)
    .sort((a, b) => {
      const order = { hub: 0, stair: 1, hallway: 2, room: 3 };
      const getType = (key) => {
        if (
          key.includes("Pod") ||
          key.includes("Wing") ||
          key.includes("Commons") ||
          key.includes("Lobby")
        )
          return "hub";
        if (key.includes("Stair")) return "stair";
        if (key.includes("HW")) return "hallway";
        return "room";
      };

      const typeA = getType(a[0]);
      const typeB = getType(b[0]);
      if (typeA !== typeB) return order[typeA] - order[typeB];

      return a[0].localeCompare(b[0], undefined, { numeric: true });
    })
    .map(([key, { x, y }]) => `  ${key}: { x: ${x}, y: ${y} },`)
    .join("\n");

  return `// coordinates_floor${floorNum}.js
// Pixel coordinates in floor${floorNum}.png
// Data extracted from CVAT annotations and generated from room definitions

export const coordinates_floor${floorNum} = {
${entries}
};
`;
}

fs.writeFileSync(
  "data/coordinates_floor1.js",
  generateCoordinateFile(coord1, 1),
);
fs.writeFileSync(
  "data/coordinates_floor2.js",
  generateCoordinateFile(coord2, 2),
);
fs.writeFileSync(
  "data/coordinates_floor3.js",
  generateCoordinateFile(coord3, 3),
);

console.log("\n✓ Final update complete!");
console.log(`Floor 1: ${Object.keys(coord1).length} rooms`);
console.log(`Floor 2: ${Object.keys(coord2).length} rooms`);
console.log(`Floor 3: ${Object.keys(coord3).length} rooms`);
