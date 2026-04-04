import { coordinates_floor1 } from "../data/coordinates_floor1.js";
import { coordinates_floor2 } from "../data/coordinates_floor2.js";
import { coordinates_floor3 } from "../data/coordinates_floor3.js";

export const COORDS = {
  1: coordinates_floor1,
  2: coordinates_floor2,
  3: coordinates_floor3,
};
export const IMG_SIZE = { 1: [2000, 1428], 2: [2000, 1428], 3: [2000, 1363] };
export const IMG_SRC = {
  1: "../assets/floor1.png",
  2: "../assets/floor2.png",
  3: "../assets/floor3.png",
};
export const SECONDARY = new Set(["Z2", "A2", "B2"]);

export const ROOM_CORRIDOR_ANCHORS = {
  1: {
    A_Pod_1: ["A_Pod_1", "A_Stair", "HW_AB_1", "HW_AZ_1"],
    B_Pod_1: ["B_Pod_1", "B_Stair", "HW_AB_1", "HW_BC_1"],
    C_Pod_1: ["C_Pod_1", "C_Stair", "HW_BC_1", "HW_main_1", "HW_main_2"],
    Z_Pod_1: ["Z_Pod_1", "Z_Stair", "HW_AZ_1"],
    D_Wing_1: ["D_Wing_1", "HW_D_entry", "HW_main_1"],
    Lobby_1: ["Lobby_1"],
  },
  2: {
    A_Pod_2: ["A_Pod_2", "A_Stair", "HW_AB_1", "HW_AZ_1"],
    B_Pod_2: ["B_Pod_2", "B_Stair", "HW_AB_1", "HW_BC_1"],
    C_Pod_2: ["C_Pod_2", "C_Stair", "HW_BC_1", "HW_main_1", "HW_main_2"],
    Z_Pod_2: ["Z_Pod_2", "Z_Stair", "HW_AZ_1"],
    D_Wing_2: ["D_Wing_2", "HW_D_entry", "HW_main_1"],
    Lobby_2: ["Lobby_2"],
  },
  3: {
    A_Pod_3: ["A_Pod_3", "A_Stair", "HW_AB_1", "HW_AZ_1"],
    B_Pod_3: ["B_Pod_3", "B_Stair", "HW_AB_1", "HW_BC_1"],
    C_Pod_3: ["C_Pod_3", "C_Stair", "HW_BC_1", "HW_main_1", "HW_main_2"],
    Z_Pod_3: ["Z_Pod_3", "Z_Stair", "HW_AZ_1"],
  },
};

export const ROUTE_WAYPOINTS = {
  "B_Pod_1->A_Pod_1": [
    { x: 1550, y: 740 },
    { x: 1550, y: 840 },
    { x: 1600, y: 870 },
    { x: 1600, y: 960 },
  ],
  "A_Pod_1->B_Pod_1": [
    { x: 1600, y: 960 },
    { x: 1600, y: 870 },
    { x: 1550, y: 840 },
    { x: 1550, y: 740 },
  ],
  "A_Pod_1->Z_Pod_1": [
    { x: 1600, y: 960 },
    { x: 1567, y: 968 },
    { x: 1507, y: 1040 },
  ],
  "Z_Pod_1->A_Pod_1": [
    { x: 1507, y: 1040 },
    { x: 1567, y: 968 },
    { x: 1600, y: 960 },
  ],
  "A_Pod_1->Lobby_1": [
    { x: 1600, y: 960 },
    { x: 1510, y: 960 },
    { x: 1445, y: 950 },
  ],
  "Lobby_1->A_Pod_1": [
    { x: 1445, y: 950 },
    { x: 1510, y: 960 },
    { x: 1600, y: 960 },
  ],
  "B_Pod_1->C_Pod_1": [
    { x: 1550, y: 740 },
    { x: 1415, y: 655 },
    { x: 1393, y: 660 },
    { x: 1310, y: 660 },
  ],
  "C_Pod_1->B_Pod_1": [
    { x: 1310, y: 660 },
    { x: 1393, y: 660 },
    { x: 1415, y: 655 },
    { x: 1550, y: 740 },
  ],
  "B_Pod_1->Commons_1": [
    { x: 1550, y: 740 },
    { x: 1415, y: 655 },
    { x: 1393, y: 660 },
    { x: 1295, y: 695 },
  ],
  "Commons_1->B_Pod_1": [
    { x: 1295, y: 695 },
    { x: 1393, y: 660 },
    { x: 1415, y: 655 },
    { x: 1550, y: 740 },
  ],
  "C_Pod_1->Commons_1": [
    { x: 1310, y: 660 },
    { x: 1295, y: 695 },
  ],
  "Commons_1->C_Pod_1": [
    { x: 1295, y: 695 },
    { x: 1310, y: 660 },
  ],
  "Commons_1->Z_Pod_1": [
    { x: 1295, y: 695 },
    { x: 1295, y: 860 },
    { x: 1445, y: 950 },
    { x: 1507, y: 1040 },
  ],
  "Z_Pod_1->Commons_1": [
    { x: 1507, y: 1040 },
    { x: 1445, y: 950 },
    { x: 1295, y: 860 },
    { x: 1295, y: 695 },
  ],
  "Commons_1->D_Wing_1": [
    { x: 1295, y: 695 },
    { x: 1230, y: 650 },
    { x: 1115, y: 500 },
    { x: 1060, y: 500 },
  ],
  "D_Wing_1->Commons_1": [
    { x: 1060, y: 500 },
    { x: 1115, y: 500 },
    { x: 1230, y: 650 },
    { x: 1295, y: 695 },
  ],
  "C_Pod_1->D_Wing_1": [
    { x: 1310, y: 660 },
    { x: 1230, y: 650 },
    { x: 1115, y: 500 },
    { x: 1060, y: 500 },
  ],
  "D_Wing_1->C_Pod_1": [
    { x: 1060, y: 500 },
    { x: 1115, y: 500 },
    { x: 1230, y: 650 },
    { x: 1310, y: 660 },
  ],
  "Lobby_1->C_Pod_1": [
    { x: 1445, y: 950 },
    { x: 1295, y: 860 },
    { x: 1295, y: 695 },
    { x: 1310, y: 660 },
  ],
  "C_Pod_1->Lobby_1": [
    { x: 1310, y: 660 },
    { x: 1295, y: 695 },
    { x: 1295, y: 860 },
    { x: 1445, y: 950 },
  ],
  "B_Pod_2->A_Pod_2": [
    { x: 1545, y: 742 },
    { x: 1545, y: 840 },
    { x: 1598, y: 870 },
    { x: 1600, y: 962 },
  ],
  "A_Pod_2->B_Pod_2": [
    { x: 1600, y: 962 },
    { x: 1598, y: 870 },
    { x: 1545, y: 840 },
    { x: 1545, y: 742 },
  ],
  "A_Pod_2->Z_Pod_2": [
    { x: 1600, y: 962 },
    { x: 1563, y: 968 },
    { x: 1503, y: 1043 },
  ],
  "Z_Pod_2->A_Pod_2": [
    { x: 1503, y: 1043 },
    { x: 1563, y: 968 },
    { x: 1600, y: 962 },
  ],
  "A_Pod_2->Lobby_2": [
    { x: 1600, y: 962 },
    { x: 1510, y: 962 },
    { x: 1445, y: 950 },
  ],
  "Lobby_2->A_Pod_2": [
    { x: 1445, y: 950 },
    { x: 1510, y: 962 },
    { x: 1600, y: 962 },
  ],
  "B_Pod_2->C_Pod_2": [
    { x: 1545, y: 742 },
    { x: 1412, y: 658 },
    { x: 1390, y: 660 },
    { x: 1302, y: 670 },
  ],
  "C_Pod_2->B_Pod_2": [
    { x: 1302, y: 670 },
    { x: 1390, y: 660 },
    { x: 1412, y: 658 },
    { x: 1545, y: 742 },
  ],
  "B_Pod_2->Commons_2": [
    { x: 1545, y: 742 },
    { x: 1412, y: 658 },
    { x: 1390, y: 660 },
    { x: 1290, y: 700 },
  ],
  "Commons_2->B_Pod_2": [
    { x: 1290, y: 700 },
    { x: 1390, y: 660 },
    { x: 1412, y: 658 },
    { x: 1545, y: 742 },
  ],
  "C_Pod_2->Commons_2": [
    { x: 1302, y: 670 },
    { x: 1290, y: 700 },
  ],
  "Commons_2->C_Pod_2": [
    { x: 1290, y: 700 },
    { x: 1302, y: 670 },
  ],
  "Commons_2->Z_Pod_2": [
    { x: 1290, y: 700 },
    { x: 1290, y: 860 },
    { x: 1445, y: 950 },
    { x: 1503, y: 1043 },
  ],
  "Z_Pod_2->Commons_2": [
    { x: 1503, y: 1043 },
    { x: 1445, y: 950 },
    { x: 1290, y: 860 },
    { x: 1290, y: 700 },
  ],
  "Commons_2->D_Wing_2": [
    { x: 1290, y: 700 },
    { x: 1225, y: 652 },
    { x: 1132, y: 588 },
    { x: 1069, y: 605 },
  ],
  "D_Wing_2->Commons_2": [
    { x: 1069, y: 605 },
    { x: 1132, y: 588 },
    { x: 1225, y: 652 },
    { x: 1290, y: 700 },
  ],
  "Lobby_2->C_Pod_2": [
    { x: 1445, y: 950 },
    { x: 1290, y: 860 },
    { x: 1290, y: 700 },
    { x: 1302, y: 670 },
  ],
  "C_Pod_2->Lobby_2": [
    { x: 1302, y: 670 },
    { x: 1290, y: 700 },
    { x: 1290, y: 860 },
    { x: 1445, y: 950 },
  ],
  "B_Pod_3->A_Pod_3": [
    { x: 1500, y: 712 },
    { x: 1500, y: 800 },
    { x: 1592, y: 785 },
    { x: 1600, y: 900 },
  ],
  "A_Pod_3->B_Pod_3": [
    { x: 1600, y: 900 },
    { x: 1592, y: 785 },
    { x: 1500, y: 800 },
    { x: 1500, y: 712 },
  ],
  "A_Pod_3->Z_Pod_3": [
    { x: 1600, y: 900 },
    { x: 1545, y: 912 },
    { x: 1500, y: 1012 },
  ],
  "Z_Pod_3->A_Pod_3": [
    { x: 1500, y: 1012 },
    { x: 1545, y: 912 },
    { x: 1600, y: 900 },
  ],
  "B_Pod_3->C_Pod_3": [
    { x: 1500, y: 712 },
    { x: 1435, y: 668 },
    { x: 1370, y: 645 },
    { x: 1205, y: 613 },
  ],
  "C_Pod_3->B_Pod_3": [
    { x: 1205, y: 613 },
    { x: 1370, y: 645 },
    { x: 1435, y: 668 },
    { x: 1500, y: 712 },
  ],
  "B_Pod_3->Commons_3": [
    { x: 1500, y: 712 },
    { x: 1435, y: 668 },
    { x: 1370, y: 645 },
    { x: 1205, y: 613 },
  ],
  "Commons_3->B_Pod_3": [
    { x: 1205, y: 613 },
    { x: 1370, y: 645 },
    { x: 1435, y: 668 },
    { x: 1500, y: 712 },
  ],
  "C_Pod_3->Commons_3": [
    { x: 1205, y: 613 },
    { x: 1205, y: 613 },
  ],
  "Commons_3->C_Pod_3": [
    { x: 1205, y: 613 },
    { x: 1205, y: 613 },
  ],
  "Commons_3->Z_Pod_3": [
    { x: 1205, y: 613 },
    { x: 1290, y: 860 },
    { x: 1500, y: 1012 },
  ],
  "Z_Pod_3->Commons_3": [
    { x: 1500, y: 1012 },
    { x: 1290, y: 860 },
    { x: 1205, y: 613 },
  ],
};

export function scalePoint(point, width, height, floor) {
  if (!point) return null;
  const [iw, ih] = IMG_SIZE[floor];
  return {
    x: point.x * (width / iw),
    y: point.y * (height / ih),
  };
}

export function scalePoints(points, width, height, floor) {
  return points.map((p) => scalePoint(p, width, height, floor)).filter(Boolean);
}

export function getWaypointsBetween(fromNode, toNode, floor) {
  const key = `${fromNode}->${toNode}`;
  const pts = ROUTE_WAYPOINTS[key];
  if (!pts) return null;
  return pts.filter((p) => Number.isFinite(p.x) && Number.isFinite(p.y));
}

export function isRoomNode(node) {
  return !node.includes("_");
}

export function getCorridorAnchors(hubNode, floor) {
  const anchorNames = ROOM_CORRIDOR_ANCHORS[floor]?.[hubNode];
  if (!anchorNames) return [];
  return anchorNames.map((name) => COORDS[floor][name]).filter(Boolean);
}

export function manhattanDistance(a, b) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

export function chooseRoomApproachPoint(roomPt, hubPt, anchors) {
  const candidates = [
    { x: roomPt.x, y: hubPt.y },
    { x: hubPt.x, y: roomPt.y },
  ].filter(
    (pt) =>
      !(pt.x === hubPt.x && pt.y === hubPt.y) &&
      !(pt.x === roomPt.x && pt.y === roomPt.y),
  );

  if (candidates.length === 0) return null;
  if (anchors.length === 0) return candidates[0];

  const scored = candidates.map((candidate) => {
    const nearest = Math.min(
      ...anchors.map((anchor) => manhattanDistance(candidate, anchor)),
    );
    return { candidate, score: nearest };
  });
  scored.sort((a, b) => a.score - b.score);
  return scored[0].candidate;
}

export function getRoomApproachWaypoints(fromNode, toNode, floor) {
  if (!isRoomNode(fromNode) && !isRoomNode(toNode)) return null;

  const roomNode = isRoomNode(fromNode) ? fromNode : toNode;
  const hubNode = isRoomNode(fromNode) ? toNode : fromNode;
  const roomPt = COORDS[floor]?.[roomNode];
  const hubPt = COORDS[floor]?.[hubNode];
  if (!roomPt || !hubPt) return null;

  const anchors = getCorridorAnchors(hubNode, floor);
  const waypoint = chooseRoomApproachPoint(roomPt, hubPt, anchors);
  if (waypoint) {
    return [waypoint];
  }

  const nearestAnchor = anchors.reduce((best, anchor) => {
    if (
      !best ||
      manhattanDistance(anchor, roomPt) < manhattanDistance(best, roomPt)
    ) {
      return anchor;
    }
    return best;
  }, null);

  if (
    nearestAnchor &&
    nearestAnchor.x !== hubPt.x &&
    nearestAnchor.y !== hubPt.y
  ) {
    return [nearestAnchor];
  }

  return null;
}

export const POD_LABELS = {
  A_Pod: "A Pod",
  B_Pod: "B Pod",
  C_Pod: "C Pod",
  Z_Pod: "Z Pod",
  D_Wing: "D Wing",
  E_Wing: "E Wing",
  F_Wing: "F Wing",
  Commons: "Commons",
  Lobby: "Front Office / Lobby",
};

export const STAIR_DESC = {
  C_Stair: "C Stairwell (inside C Pod, near C108/C115)",
  B_Stair: "B Stairwell (B Pod/Commons junction, near B114)",
  A_Stair: "A Stairwell (B Pod/A Pod connector, near B101)",
  Z_Stair: "Z Stairwell (A Pod/Z Pod junction, near A122 area/Z127)",
  Z2: "Z2 connector stairwell (between Z Pod and A Pod)",
  A2: "A2 connector stairwell (between A Pod and B Pod) — going up: B is RIGHT, A is LEFT",
  B2: "B2 connector stairwell (between B Pod and C Pod)",
  Front_Stair: "front office stairwell (connects floors 1 and 2 only)",
};

export const WALK_DESC = {
  "C_Pod->Commons":
    "Walk south through C Pod past C100 (Food Court) into the Commons",
  "Commons->C_Pod": "Walk north from the Commons through C100 into C Pod",
  "B_Pod->Commons": "Walk west from B Pod through B100 into the Commons",
  "Commons->B_Pod": "Walk east from the Commons into B Pod through B100",
  "B_Pod->C_Pod":
    "Walk northwest through B Pod toward C Pod, passing the B Stairwell area near B114.",
  "C_Pod->B_Pod":
    "Walk southeast through C Pod toward B Pod, passing the C101/C102 area.",
  "A_Pod->B_Pod":
    "Walk northwest through the A–B connector hallway into B Pod. The A2 stairwell is in this connector — B Pod is on the right, A Pod is on the left.",
  "B_Pod->A_Pod":
    "Walk southeast through the A–B connector hallway into A Pod. The A2 stairwell is in this connector — B Pod is on the right, A Pod is on the left.",
  "A_Pod->Z_Pod":
    "Walk south through A Pod toward the lobby area (near A11 / A122) into Z Pod.",
  "Z_Pod->A_Pod":
    "Walk north through Z Pod past the lobby (near A11 / A122) into A Pod.",
  "Commons->D_Wing":
    "Walk west from the Commons into D Wing. Shortcut: from C Pod, use the C115 cutthrough hallway to reach C131 (Small Cafeteria) directly.",
  "D_Wing->Commons":
    "Walk east through D Wing back into the Commons. D Wing contains the auditorium, gym, pool, and D150 large cafeteria.",
  "D_Wing->E_Wing":
    "Continue west through D Wing past the gym area into E Wing.",
  "E_Wing->D_Wing": "Walk east through E Wing back into D Wing.",
  "D_Wing->F_Wing": "Continue west through D Wing into F Wing.",
  "F_Wing->D_Wing": "Walk east through F Wing back into D Wing.",
  "A_Pod->Lobby":
    "Walk toward the front of A Pod — follow the hallway past the display cases to the front office lobby.",
  "Lobby->A_Pod":
    "Exit the front office lobby and walk down the hallway past the display cases into A Pod (A100 area).",
  "C_Pod->Lobby":
    "Walk through C Pod toward the Harvard Room area — continue down that hallway to the front office lobby.",
  "Lobby->C_Pod":
    "Exit the front office lobby and walk down the hallway past the Harvard Room area into C Pod (C100 area).",
};

export function getPodKey(node) {
  if (!node) return null;
  const m = node.match(/^([A-Z](?:_Pod|_Wing))_\d$/);
  if (m) return m[1];
  if (node.startsWith("Commons_")) return "Commons";
  return null;
}

export function podLabel(node) {
  const k = getPodKey(node);
  return k ? POD_LABELS[k] || k.replace(/_/g, " ") : node.replace(/_/g, " ");
}

export function floorLabel(f) {
  return f === 1 ? "1st floor" : f === 2 ? "2nd floor" : "3rd floor";
}

export function getWalkDescription(fromNode, toNode, floor) {
  const from =
    getPodKey(fromNode) ||
    (fromNode?.startsWith("Commons") ? "Commons" : fromNode);
  const to =
    getPodKey(toNode) || (toNode?.startsWith("Commons") ? "Commons" : toNode);
  const f = floor || 1;

  const interPodCorridor = {
    1: "inter-pod corridor (Z100 → A100 → B100 → C100 → ends at D150 Large Cafeteria)",
    2: "inter-pod corridor (Z200 → A200 → B200 → C200 → ends at D213 Weight Room)",
    3: "inter-pod corridor (Z300 → A300 → B300 → C300)",
  };

  const key = `${from}->${to}`;
  return (
    WALK_DESC[key] || `Walk from ${podLabel(fromNode)} to ${podLabel(toNode)}`
  );
}
