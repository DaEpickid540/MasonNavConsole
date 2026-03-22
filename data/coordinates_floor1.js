// coordinates_floor1.js
// Pixel coordinates in floor1.png (2000 × 1428)
// Re-mapped by visual inspection — hub/stair nodes placed in corridor centerlines.

export const coordinates_floor1 = {
  // ── Structural hubs — corridor centerlines ──────────────────────
  // A_Pod_1: A Pod main corridor (between A100 and A32 hallway)
  A_Pod_1: { x: 1600, y: 960 },
  // B_Pod_1: B Pod central corridor (between B100 and B119)
  B_Pod_1: { x: 1550, y: 740 },
  // C_Pod_1: C Pod hallway (between C100 and C101, the main corridor centerline)
  C_Pod_1: { x: 1310, y: 660 },
  // Commons_1: Commons/C100 area (the wide hallway junction between C Pod, B Pod, Z Pod and D Wing)
  Commons_1: { x: 1295, y: 695 },
  // D_Wing_1: D Wing entry corridor
  D_Wing_1: { x: 1060, y: 500 },
  // E_Wing_1 / F_Wing_1: far D Wing branches
  E_Wing_1: { x: 898, y: 410 },
  F_Wing_1: { x: 914, y: 563 },
  // Z_Pod_1: Z Pod main corridor (between Z100 and Z127 hallway area, ~x1507 y1040)
  Z_Pod_1: { x: 1507, y: 1040 },
  // Lobby_1: front office lobby corridor (the long hallway at A11/A12, ~x1445 y950)
  Lobby_1: { x: 1445, y: 950 },

  // ── Stairwells — at actual stairwell symbols ────────────────────
  // A_Stair: at the B-A connector stairwell (near B126c / where B meets A100 corridor)
  A_Stair: { x: 1600, y: 867 },
  // B_Stair: B Pod / C Pod connector stairwell (near B114 area, ~x1415 y655)
  B_Stair: { x: 1415, y: 655 },
  // C_Stair: C Pod internal stairwell (near C115/C119, ~x1295 y445)
  C_Stair: { x: 1295, y: 445 },
  // Z_Stair: Z-A connector stairwell (between Z127 and A100 area, ~x1567 y968)
  Z_Stair: { x: 1567, y: 968 },

  // ── Hallway waypoints ───────────────────────────────────────────
  HW_AB_1: { x: 1555, y: 830 }, // mid A-B connector corridor
  HW_AZ_1: { x: 1553, y: 975 }, // A-Z corridor junction
  HW_BC_1: { x: 1393, y: 660 }, // B-C connector hallway
  HW_main_1: { x: 1230, y: 650 }, // main hallway near Commons west side
  HW_main_2: { x: 1295, y: 700 }, // main hallway center junction
  HW_D_entry: { x: 1115, y: 500 }, // D Wing entry

  // ── A Pod rooms ─────────────────────────────────────────────────
  A10: { x: 1331, y: 931 },
  A11: { x: 1380, y: 955 },
  A12: { x: 1430, y: 965 },
  A32: { x: 1510, y: 975 },
  A100: { x: 1620, y: 905 },
  A101: { x: 1622, y: 1010 },
  A102: { x: 1669, y: 1002 },
  A103: { x: 1723, y: 1010 },
  A104: { x: 1732, y: 938 },
  A105: { x: 1704, y: 935 },
  A106: { x: 1753, y: 1026 },
  A107: { x: 1801, y: 1025 },
  A108: { x: 1792, y: 936 },
  A109: { x: 1707, y: 907 },
  A110: { x: 1802, y: 848 },
  A111: { x: 1757, y: 850 },
  A112: { x: 1708, y: 864 },
  A113: { x: 1668, y: 875 },
  A114: { x: 1638, y: 862 },
  A115: { x: 1768, y: 909 },
  A119: { x: 1660, y: 940 },

  // ── B Pod rooms ─────────────────────────────────────────────────
  B100: { x: 1487, y: 755 },
  B102: { x: 1562, y: 768 },
  B103: { x: 1638, y: 748 },
  B104: { x: 1658, y: 695 },
  B105: { x: 1750, y: 700 },
  B106: { x: 1720, y: 657 },
  B108: { x: 1663, y: 623 },
  B109: { x: 1690, y: 588 },
  B110: { x: 1625, y: 540 },
  B112: { x: 1583, y: 600 },
  B113: { x: 1622, y: 648 },
  B114: { x: 1398, y: 643 },
  B115: { x: 1638, y: 598 },
  B119: { x: 1545, y: 753 },
  B125: { x: 1355, y: 818 },
  B127: { x: 1453, y: 810 },
  B128: { x: 1310, y: 628 },
  B129: { x: 1253, y: 678 },
  B108A: { x: 1718, y: 648 },
  B125b: { x: 1432, y: 875 },
  B126C: { x: 1483, y: 843 },

  // ── C Pod rooms ─────────────────────────────────────────────────
  C100: { x: 1268, y: 660 },
  C101: { x: 1348, y: 610 },
  C102: { x: 1408, y: 580 },
  C103: { x: 1362, y: 548 },
  C104: { x: 1337, y: 492 },
  C106: { x: 1418, y: 483 },
  C107: { x: 1399, y: 450 },
  C108: { x: 1276, y: 339 },
  C110: { x: 1268, y: 525 },
  C111: { x: 1185, y: 448 },
  C112: { x: 1147, y: 595 },
  C113: { x: 1085, y: 568 },
  C114: { x: 1115, y: 490 },
  C115: { x: 1280, y: 375 },
  C119: { x: 1258, y: 442 },
  C120: { x: 1073, y: 625 },
  C121: { x: 1245, y: 780 },
  C122: { x: 1072, y: 718 },
  C123: { x: 1302, y: 723 },
  C124: { x: 1068, y: 710 },

  // ── Z Pod rooms ─────────────────────────────────────────────────
  Z100: { x: 1503, y: 1062 },
  Z101: { x: 1500, y: 1107 },
  Z102: { x: 1572, y: 1097 },
  Z103: { x: 1442, y: 1120 },
  Z104: { x: 1437, y: 1152 },
  Z105: { x: 1483, y: 1197 },
  Z106: { x: 1568, y: 1178 },
  Z107: { x: 1520, y: 1217 },
  Z108: { x: 1592, y: 1165 },
  Z109: { x: 1594, y: 1202 },
  Z110: { x: 1557, y: 1253 },
  Z111: { x: 1605, y: 1252 },
  Z112: { x: 1570, y: 1292 },
  Z113: { x: 1648, y: 1150 },
  Z114: { x: 1688, y: 1177 },
  Z119: { x: 1662, y: 1230 },
  Z122: { x: 1492, y: 1282 },
  Z125: { x: 1652, y: 1262 },
  Z126: { x: 1717, y: 1202 },
  Z127: { x: 1582, y: 1055 },

  // ── D Wing rooms ────────────────────────────────────────────────
  D101: { x: 1065, y: 367 },
  D105: { x: 997, y: 407 },
  D106: { x: 1150, y: 260 },
  D107: { x: 939, y: 409 },
  D108: { x: 915, y: 473 },
  D109: { x: 883, y: 323 },
  D111: { x: 964, y: 411 },
  D112: { x: 934, y: 335 },
  D114: { x: 981, y: 307 },
  D123: { x: 920, y: 238 },
  D125: { x: 995, y: 247 },
  D138: { x: 897, y: 672 },
  D150: { x: 1248, y: 202 },
  D152: { x: 1349, y: 202 },
  D153: { x: 1843, y: 898 },
  D158: { x: 1842, y: 940 },
  D160: { x: 1846, y: 971 },
  D114A: { x: 1843, y: 1027 },

  // ── E/F Wing ────────────────────────────────────────────────────
  E135: { x: 1629, y: 1365 },
  E137: { x: 1668, y: 1332 },
  F137: { x: 1717, y: 1276 },
};
