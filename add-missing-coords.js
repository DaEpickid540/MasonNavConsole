#!/usr/bin/env node
/**
 * Add intelligent coordinate estimates for rooms still missing parent coords
 * Uses nearby room references and pod/hub positions
 */

const fs = require("fs");
const path = require("path");

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

// Read current coordinates
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

const coordinates_floor1 = parseCoordinatesFromText(coord1Raw);
const coordinates_floor2 = parseCoordinatesFromText(coord2Raw);
const coordinates_floor3 = parseCoordinatesFromText(coord3Raw);

// Load room definitions
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

// Estimate coordinates based on pod and nearby rooms
function estimateCoordinates(room, pod, floorCoords) {
  // Look for similar numbered rooms in the same pod
  const roomNum = room.replace(/[A-Z]/g, "").substring(1);
  const podRooms = Object.entries(floorCoords)
    .filter(([key]) => key.match(/\d{3}/) && key.startsWith(room[0]))
    .map(([key, coords]) => [parseInt(key.substring(1)), coords]);

  if (podRooms.length > 0) {
    // Average nearby rooms as base estimate
    const avg = podRooms.reduce(
      (acc, [_, coords]) => ({
        x: acc.x + coords.x / podRooms.length,
        y: acc.y + coords.y / podRooms.length,
      }),
      { x: 0, y: 0 },
    );

    return { x: Math.round(avg.x), y: Math.round(avg.y) };
  }

  // Fall back to pod center with some offset
  const podCoords = floorCoords[pod];
  if (podCoords) {
    const offset = room.charCodeAt(room.length - 1) - 65;
    return {
      x: podCoords.x + (offset % 5) * 20 - 40,
      y: podCoords.y + Math.floor(offset / 5) * 20 - 40,
    };
  }

  return null;
}

// Add missing rooms to each floor
function addMissingParentRooms(floorCoords, roomDefs, floor) {
  const roomsOnFloor = Object.keys(roomDefs).filter((room) => {
    if (floor === 1) return room.match(/^[A-Z]1\d{2}$/) && !room.includes("0");
    if (floor === 2) return room.match(/^[A-Z]2\d{2}$/) && !room.includes("0");
    if (floor === 3) return room.match(/^[A-Z]3\d{2}$/) && !room.includes("0");
    return false;
  });

  let added = 0;

  roomsOnFloor.forEach((room) => {
    if (!floorCoords[room]) {
      const coords = estimateCoordinates(room, roomDefs[room], floorCoords);
      if (coords) {
        floorCoords[room] = coords;
        added++;
      }
    }
  });

  console.log(
    `Floor ${floor}: Added ${added} estimated parent room coordinates`,
  );
  return floorCoords;
}

// Process each floor
addMissingParentRooms(coordinates_floor1, allRoomDefs, 1);
addMissingParentRooms(coordinates_floor2, allRoomDefs, 2);
addMissingParentRooms(coordinates_floor3, allRoomDefs, 3);

// Generate output files
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

const output1 = generateCoordinateFile(coordinates_floor1, 1);
const output2 = generateCoordinateFile(coordinates_floor2, 2);
const output3 = generateCoordinateFile(coordinates_floor3, 3);

// Write files
fs.writeFileSync(path.join(__dirname, "data/coordinates_floor1.js"), output1);
fs.writeFileSync(path.join(__dirname, "data/coordinates_floor2.js"), output2);
fs.writeFileSync(path.join(__dirname, "data/coordinates_floor3.js"), output3);

console.log("\n✓ Final coordinate files:");
console.log(
  `  - coordinates_floor1.js: ${Object.keys(coordinates_floor1).length} rooms`,
);
console.log(
  `  - coordinates_floor2.js: ${Object.keys(coordinates_floor2).length} rooms`,
);
console.log(
  `  - coordinates_floor3.js: ${Object.keys(coordinates_floor3).length} rooms`,
);
