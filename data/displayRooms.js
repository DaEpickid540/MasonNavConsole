import { A_Rooms } from "./A_Rooms.js";
import { B_Rooms } from "./B_Rooms.js";
import { C_Rooms } from "./C_Rooms.js";
import { Z_Rooms } from "./Z_Rooms.js";
import { D_Rooms } from "./D_Rooms.js";
import { E_Rooms } from "./E_Rooms.js";
import { F_Rooms } from "./F_Rooms.js";

const specialNames = {
  // ── A Pod Floor 1 ──────────────────────────────────────────
  A11: "A11 – Front Desk",
  A118: "A118 – Bathroom (A Pod)",
  A122: "A122 – Student Entry (A Pod)",
  // ── B Pod Floor 1 ──────────────────────────────────────────
  B118: "B118 – Bathroom (B Pod)",
  B122: "B122 – Student Entry (B Pod)",
  B125: "B125 – Dream Center",
  B125b: "B125b – Maker Space",
  B125c: "B125c – Comet Cafe Seating / Library",
  B128: "B128 – Comet Cafe",
  B129: "B129 – Dream Center Annex",
  // ── C Pod Floor 1 ──────────────────────────────────────────
  C100: "C100 – Commons / Food Court",
  C111: "C111 – Media Center",
  C118: "C118 – Bathroom (C Pod)",
  C121: "C121 – Auditorium Lobby",
  C125: "C125 – Harvard Room",
  // ── Z Pod Floor 1 ──────────────────────────────────────────
  Z118: "Z118 – Bathroom (Z Pod)",
  Z122: "Z122 – Student Entry (Z Pod)",
  // ── D Wing Floor 1 ─────────────────────────────────────────
  D101: "D101 – Small Cafeteria",
  D123: "D123 – Field House / Gym",
  D136: "D136 – Pool",
  D138: "D138 – Auditorium",
  D150: "D150 – Large Commons / Cafeteria",
  D152: "D152 – Cafeteria Purchase Area",
  D158: "D158 – Music Private Rooms",
  D160: "D160 – Lunch Purchase Counters",
  // ── D Wing Floor 2 ─────────────────────────────────────────
  D212: "D212 – Drama Room",
  D213: "D213 – Weight Room",
  // ── A Pod Floor 2 (Admin) ───────────────────────────────────
  A218: "A218 – Bathroom (A Pod, Floor 2)",
  // ── B Pod Floor 2 ──────────────────────────────────────────
  B218: "B218 – Bathroom (B Pod, Floor 2)",
  B220: "B220 – Media Center (Open Below)",
  // ── C Pod Floor 2 ──────────────────────────────────────────
  C218: "C218 – Bathroom (C Pod, Floor 2)",
  // ── Z Pod Floor 2 ──────────────────────────────────────────
  Z218: "Z218 – Bathroom (Z Pod, Floor 2)",
  // ── Floor 3 bathrooms ───────────────────────────────────────
  A318: "A318 – Bathroom (A Pod, Floor 3)",
  B318: "B318 – Bathroom (B Pod, Floor 3)",
  C318: "C318 – Bathroom (C Pod, Floor 3)",
  Z318: "Z318 – Bathroom (Z Pod, Floor 3)",
};

export const displayRooms = Object.fromEntries(
  Object.entries({
    ...A_Rooms,
    ...B_Rooms,
    ...C_Rooms,
    ...Z_Rooms,
    ...D_Rooms,
    ...E_Rooms,
    ...F_Rooms,
  })
    .sort(([a], [b]) =>
      a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }),
    )
    .map(([room]) => [room, specialNames[room] || room]),
);
