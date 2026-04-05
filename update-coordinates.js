#!/usr/bin/env node
/**
 * Update coordinates files by adding missing rooms from _Rooms definitions
 * Strategy: Use parent room coordinates for sub-rooms (A101A uses A101's coords)
 */

const fs = require("fs");
const path = require("path");

// ── Load existing coordinates ──
const coord1Raw = fs.readFileSync(
  path.join(__dirname, "data/coordinates_floor1.js"),
  "utf8",
);
const coord2Raw = fs.readFileSync(
  path.join(__dirname, "data/coordinates_floor2.js"),
  "utf8",
);
const coord3Raw = fs.readFileSync(
  path.join(__dirname, "data/coordinates_floor3.js"),
  "utf8",
);

// Parse coordinates from file content
function parseCoordinatesFromText(text) {
  const result = {};
  const lines = text.split("\n");

  lines.forEach((line) => {
    const match = line.match(
      /^\s*(\w+):\s*\{[\s]*x:\s*(\d+),[\s]*y:\s*(\d+)\s*\}/,
    );
    if (match) {
      const [, key, x, y] = match;
      result[key] = { x: parseInt(x), y: parseInt(y) };
    }
  });

  return result;
}

const coordinates_floor1 = parseCoordinatesFromText(coord1Raw);
const coordinates_floor2 = parseCoordinatesFromText(coord2Raw);
const coordinates_floor3 = parseCoordinatesFromText(coord3Raw);

console.log(
  `Loaded ${Object.keys(coordinates_floor1).length} rooms for floor 1`,
);
console.log(
  `Loaded ${Object.keys(coordinates_floor2).length} rooms for floor 2`,
);
console.log(
  `Loaded ${Object.keys(coordinates_floor3).length} rooms for floor 3`,
);

// ── Load room definitions ──
const roomFiles = [
  "A_Rooms.js",
  "B_Rooms.js",
  "C_Rooms.js",
  "Z_Rooms.js",
  "D_Rooms.js",
  "E_Rooms.js",
  "F_Rooms.js",
];
const allRoomDefs = {};

roomFiles.forEach((file) => {
  try {
    const content = fs.readFileSync(path.join(__dirname, "data", file), "utf8");
    const rooms = {};
    const matches = content.match(/^\s*(\w+):\s*"([^"]+)"/gm);
    if (matches) {
      matches.forEach((match) => {
        const [, room, pod] = match.match(/^\s*(\w+):\s*"([^"]+)"/m);
        allRoomDefs[room] = pod;
      });
    }
  } catch (e) {
    console.error(`Error reading ${file}:`, e.message);
  }
});

console.log(`\nLoaded ${Object.keys(allRoomDefs).length} room definitions\n`);

// ── Generate missing coordinates ──
function getParentRoom(room) {
  // A101A -> A101, B201B -> B201, etc.
  return room.replace(/[A-Z]$/, "");
}

function addMissingCoordinates(floorCoords, roomDefs, floor) {
  const floorNum = floor;
  const floorPattern = new RegExp(`^[A-Z]${floorNum}\\d{2}`);
  const roomsOnFloor = Object.keys(roomDefs).filter((room) => {
    // Match rooms like A100-A199, A200-A299, etc.
    if (floorNum === 1) return room.match(/^[A-Z]1\d{2}/);
    if (floorNum === 2) return room.match(/^[A-Z]2\d{2}/);
    if (floorNum === 3) return room.match(/^[A-Z]3\d{2}/);
    return false;
  });

  let added = 0;
  let missing = [];

  roomsOnFloor.forEach((room) => {
    if (!floorCoords[room]) {
      const parent = getParentRoom(room);
      if (floorCoords[parent]) {
        // Use parent room's coordinates
        const coords = floorCoords[parent];
        // Slight offset for sub-rooms
        const offset = room.charCodeAt(room.length - 1) - 65; // A=0, B=1, etc.
        floorCoords[room] = {
          x: coords.x + (offset % 3) * 15 - 15,
          y: coords.y + Math.floor(offset / 3) * 15 - 15,
        };
        added++;
      } else {
        missing.push(room);
      }
    }
  });

  console.log(`Floor ${floor}: Added ${added} missing rooms`);
  if (missing.length > 0) {
    console.log(
      `  Still missing parent coords for: ${missing.slice(0, 5).join(", ")}${missing.length > 5 ? "..." : ""}`,
    );
  }

  return floorCoords;
}

// Add missing coordinates
addMissingCoordinates(coordinates_floor1, allRoomDefs, 1);
addMissingCoordinates(coordinates_floor2, allRoomDefs, 2);
addMissingCoordinates(coordinates_floor3, allRoomDefs, 3);

// ── Generate output files ──
function generateCoordinateFile(coords, floorNum) {
  const entries = Object.entries(coords)
    .sort((a, b) => {
      // Sort: hubs first, then stairs, then hallways, then rooms
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

      // Within same type, sort alphabetically
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

const output1 = generateCoordinateFile(coordinates_floor1, 1);
const output2 = generateCoordinateFile(coordinates_floor2, 2);
const output3 = generateCoordinateFile(coordinates_floor3, 3);

// ── Write files ──
fs.writeFileSync(path.join(__dirname, "data/coordinates_floor1.js"), output1);
fs.writeFileSync(path.join(__dirname, "data/coordinates_floor2.js"), output2);
fs.writeFileSync(path.join(__dirname, "data/coordinates_floor3.js"), output3);

console.log("\n✓ Updated all coordinate files:");
console.log(
  `  - coordinates_floor1.js: ${Object.keys(coordinates_floor1).length} rooms`,
);
console.log(
  `  - coordinates_floor2.js: ${Object.keys(coordinates_floor2).length} rooms`,
);
console.log(
  `  - coordinates_floor3.js: ${Object.keys(coordinates_floor3).length} rooms`,
);
