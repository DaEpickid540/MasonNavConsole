/**
 * hallways.js — Mason High School Hallway Network
 * Defines hallway segments, their paths, and connected classrooms for each floor
 */

// ═══════════════════════════════════════════════════════════════════════════
// FLOOR 1 HALLWAYS
// ═══════════════════════════════════════════════════════════════════════════

export const hallways = {
  floor1: {
    // ── A POD CORRIDOR ──────────────────────────────────────────────────────
    // East-west hallway running through the center of A Pod
    A_Pod_Corridor_1: {
      name: "A Pod Main Corridor",
      floor: 1,
      description: "Main east-west corridor through A Pod (north side)",
      hubStart: "A_Pod_1",
      hubEnd: "A_Pod_1",
      waypoints: [
        { x: 1630, y: 875 }, // East end near A108-A115
        { x: 1600, y: 875 }, // Center
        { x: 1550, y: 875 }, // West section
      ],
      connectedRooms: [
        "A100",
        "A101",
        "A101A",
        "A101B",
        "A101C",
        "A101D",
        "A101E",
        "A101F",
        "A102",
        "A102A",
        "A103",
        "A103A",
        "A104",
        "A105",
        "A105A",
        "A106",
        "A107",
        "A108",
        "A108A",
        "A109",
        "A109A",
        "A110",
        "A111",
        "A112",
        "A112A",
        "A113",
        "A113A",
        "A113B",
        "A114",
        "A114A",
        "A115",
        "A119",
        "A118",
        "A122",
        "A125",
        "A126",
        "A127",
      ],
    },

    // ── ADMIN/LOBBY CORRIDOR ─────────────────────────────────────────────────
    // Front office and lobby area (A11-A34 rooms)
    Lobby_Corridor_1: {
      name: "Front Office / Lobby Corridor",
      floor: 1,
      description: "Admin corridor connecting front desk and lobby",
      hubStart: "Lobby_1",
      hubEnd: "A_Pod_1",
      waypoints: [
        { x: 1330, y: 955 }, // Front desk area (A11)
        { x: 1380, y: 960 },
        { x: 1445, y: 950 }, // Lobby_1
      ],
      connectedRooms: [
        "A11",
        "A12",
        "A12A",
        "A13A",
        "A13B",
        "A14",
        "A15",
        "A16",
        "A17",
        "A18",
        "A19",
        "A20",
        "A21",
        "A22",
        "A23",
        "A24",
        "A25",
        "A26",
        "A27",
        "A28",
        "A29",
        "A30",
        "A31",
        "A32",
        "A32A",
        "A33",
        "A34",
        "A10",
      ],
    },

    // ── B POD CORRIDOR ──────────────────────────────────────────────────────
    // North-south orientation, main B Pod traffic
    B_Pod_Corridor_1: {
      name: "B Pod Main Corridor",
      floor: 1,
      description: "Main north-south corridor through B Pod",
      hubStart: "B_Pod_1",
      hubEnd: "B_Pod_1",
      waypoints: [
        { x: 1550, y: 755 }, // North end (B100 area)
        { x: 1550, y: 740 },
        { x: 1545, y: 700 }, // Center
        { x: 1540, y: 650 }, // South end (cafeteria area)
      ],
      connectedRooms: [
        "B100",
        "B101",
        "B101A",
        "B101B",
        "B101C",
        "B101D",
        "B101E",
        "B102",
        "B102A",
        "B103",
        "B103A",
        "B104",
        "B105",
        "B106",
        "B107",
        "B108",
        "B108A",
        "B109",
        "B110",
        "B111",
        "B112",
        "B113",
        "B114",
        "B114A",
        "B115",
        "B118",
        "B119",
        "B122",
        "B125",
        "B125A",
        "B125b",
        "B125c",
        "B126",
        "B126c",
        "B127",
        "B128",
        "B128A",
        "B128B",
        "B129",
      ],
    },

    // ── C POD CORRIDOR ──────────────────────────────────────────────────────
    // C Pod main circulation (curved/angled layout)
    C_Pod_Corridor_1: {
      name: "C Pod Main Corridor",
      floor: 1,
      description:
        "Main corridor through C Pod with media center and auditorium lobby",
      hubStart: "C_Pod_1",
      hubEnd: "C_Pod_1",
      waypoints: [
        { x: 1185, y: 448 }, // West end (C111 area)
        { x: 1250, y: 500 }, // Center-west
        { x: 1310, y: 660 }, // Center
        { x: 1350, y: 700 }, // East side
      ],
      connectedRooms: [
        "C100",
        "C101",
        "C101A",
        "C102",
        "C102A",
        "C103",
        "C103A",
        "C103B",
        "C103C",
        "C104",
        "C105",
        "C106",
        "C107",
        "C108",
        "C110",
        "C111",
        "C112",
        "C113",
        "C113A",
        "C114",
        "C114A",
        "C115",
        "C115A",
        "C118",
        "C119",
        "C120",
        "C120A",
        "C120B",
        "C121",
        "C121A",
        "C122",
        "C122A",
        "C122B",
        "C123",
        "C123A",
        "C124",
        "C125",
        "C126",
        "C126A",
        "C126B",
        "C126C",
        "C126D",
        "C126E",
        "C126F",
        "C126G",
        "C126H",
        "C126J",
        "C126K",
        "C126L",
        "C126M",
        "C126N",
        "C126P",
        "C130",
        "C131",
        "C133",
        "C134",
        "C136",
      ],
    },

    // ── Z POD CORRIDOR ──────────────────────────────────────────────────────
    // South side pod corridor
    Z_Pod_Corridor_1: {
      name: "Z Pod Main Corridor",
      floor: 1,
      description: "South pod corridor with student entry and attendance",
      hubStart: "Z_Pod_1",
      hubEnd: "Z_Pod_1",
      waypoints: [
        { x: 1450, y: 1200 }, // West end (Z122 area)
        { x: 1500, y: 1100 }, // Center
        { x: 1550, y: 1050 }, // East
        { x: 1600, y: 1000 }, // North toward A Pod
      ],
      connectedRooms: [
        "Z100",
        "Z101",
        "Z102",
        "Z103",
        "Z104",
        "Z105",
        "Z106",
        "Z107",
        "Z108",
        "Z109",
        "Z110",
        "Z111",
        "Z112",
        "Z113",
        "Z114",
        "Z115",
        "Z118",
        "Z119",
        "Z122",
        "Z125",
        "Z126",
        "Z127",
        "Z128",
        "Z129",
        "Z130",
        "Z131",
        "Z132",
        "Z133",
        "Z134",
        "Z135",
      ],
    },

    // ── A-B CONNECTOR HALLWAY ────────────────────────────────────────────────
    // Connects A Pod (south side) to B Pod (north side)
    A_B_Connector_1: {
      name: "A-B Connector Hallway",
      floor: 1,
      description:
        "Hallway connecting A Pod to B Pod, passes A2 stairwell (B100-B125b area)",
      hubStart: "A_Pod_1",
      hubEnd: "B_Pod_1",
      waypoints: [
        { x: 1600, y: 900 }, // A Pod side
        { x: 1575, y: 850 }, // Middle section
        { x: 1555, y: 830 }, // A2 stairwell area / intersection
        { x: 1545, y: 795 }, // B Pod approach
        { x: 1520, y: 760 }, // B Pod (B100-B125 area)
      ],
      connectedRooms: [
        "A_Stair",
        "A2",
        "B100",
        "B101",
        "B125",
        "B125b",
        "B125c",
        "B126",
        "B126c",
      ],
    },

    // ── B-C CONNECTOR HALLWAY ────────────────────────────────────────────────
    // Connects B Pod to C Pod
    B_C_Connector_1: {
      name: "B-C Connector Hallway",
      floor: 1,
      description:
        "Hallway between B Pod and Commons/C Pod, near B114 and B Stairwell",
      hubStart: "B_Pod_1",
      hubEnd: "C_Pod_1",
      waypoints: [
        { x: 1510, y: 740 }, // B Pod center
        { x: 1460, y: 700 }, // Middle approach
        { x: 1415, y: 655 }, // B_Stair area
        { x: 1393, y: 660 }, // HW_BC_1
        { x: 1350, y: 665 }, // C Pod approach
        { x: 1310, y: 665 }, // C Pod center
      ],
      connectedRooms: [
        "B114",
        "B115",
        "B_Stair",
        "B2",
        "C100",
        "C101",
        "C102",
        "C110",
        "C111",
      ],
    },

    // ── A POD TO LOBBY HALLWAY ───────────────────────────────────────────────
    // Connects inner A Pod to front lobby
    A_Pod_To_Lobby_1: {
      name: "A Pod to Lobby Hallway",
      floor: 1,
      description: "Hallway from A Pod interior to front lobby/office",
      hubStart: "A_Pod_1",
      hubEnd: "Lobby_1",
      waypoints: [
        { x: 1550, y: 960 }, // A Pod side
        { x: 1500, y: 960 },
        { x: 1445, y: 955 }, // Lobby_1 / A11 area
      ],
      connectedRooms: ["A108", "A109", "A110", "A11"],
    },

    // ── A POD TO Z POD HALLWAY ───────────────────────────────────────────────
    // Connects A Pod to Z Pod via Z_Stair
    A_Z_Connector_1: {
      name: "A-Z Connector Hallway",
      floor: 1,
      description: "South corridor connecting A Pod to Z Pod via Z Stairwell",
      hubStart: "A_Pod_1",
      hubEnd: "Z_Pod_1",
      waypoints: [
        { x: 1600, y: 960 }, // A Pod side
        { x: 1567, y: 968 }, // Z_Stair junction
        { x: 1507, y: 1040 }, // Z Pod center
      ],
      connectedRooms: ["A122", "A125", "Z_Stair", "Z2", "Z122", "Z125"],
    },

    // ── COMMONS AREA ─────────────────────────────────────────────────────────
    // Central hub connecting B, C, Z pods and D Wing
    Commons_Central_1: {
      name: "Commons Central Area",
      floor: 1,
      description: "Central commons/cafeteria area connecting multiple pods",
      hubStart: "Commons_1",
      hubEnd: "Commons_1",
      waypoints: [
        { x: 1310, y: 720 }, // C Pod side
        { x: 1280, y: 700 }, // Center-north
        { x: 1295, y: 695 }, // Commons_1 hub
        { x: 1250, y: 650 }, // Center-south
      ],
      connectedRooms: ["C100", "C121", "C123", "B125c", "B128", "B129", "Z122"],
    },

    // ── COMMONS TO D WING HALLWAY ────────────────────────────────────────────
    // Hallway from Commons westward into D Wing
    Commons_To_D_Wing_1: {
      name: "Commons to D Wing Hallway",
      floor: 1,
      description:
        "Corridor from Commons area into D Wing (cafeteria expansion)",
      hubStart: "Commons_1",
      hubEnd: "D_Wing_1",
      waypoints: [
        { x: 1295, y: 695 }, // Commons_1 center
        { x: 1230, y: 650 }, // HW_main_1
        { x: 1150, y: 550 }, // Middle approach
        { x: 1060, y: 500 }, // D_Wing_1
      ],
      connectedRooms: ["C121", "C122", "C111", "D101", "D105", "D106"],
    },

    // ── D WING MAIN CORRIDOR ─────────────────────────────────────────────────
    // Large west wing with gym, auditorium, cafeteria
    D_Wing_Corridor_1: {
      name: "D Wing Main Corridor",
      floor: 1,
      description:
        "Large D Wing corridor with athletic facilities, auditorium, cafeteria",
      hubStart: "D_Wing_1",
      hubEnd: "D_Wing_1",
      waypoints: [
        { x: 1065, y: 367 }, // North end (D101)
        { x: 1000, y: 350 },
        { x: 920, y: 300 }, // D123 / Gym area
        { x: 880, y: 400 }, // West extension
        { x: 897, y: 672 }, // D138 / Auditorium
      ],
      connectedRooms: [
        "D101",
        "D102",
        "D103",
        "D104",
        "D105",
        "D106",
        "D107",
        "D108",
        "D109",
        "D110",
        "D111",
        "D112",
        "D113",
        "D114",
        "D115",
        "D123",
        "D125",
        "D127",
        "D128",
        "D129",
        "D130",
        "D131",
        "D132",
        "D133",
        "D134",
        "D136",
        "D137",
        "D138",
        "D140",
        "D147",
        "D148",
        "D149",
        "D150",
        "D151",
        "D152",
        "D153",
        "D154",
        "D155",
        "D156",
        "D157",
        "D158",
        "D160",
        "D163",
        "D165",
        "D167",
      ],
    },

    // ── D WING TO E WING HALLWAY ────────────────────────────────────────────
    // Connects D Wing to E Wing
    D_E_Connector_1: {
      name: "D-E Connector",
      floor: 1,
      description: "Hallway extending from D Wing to E Wing",
      hubStart: "D_Wing_1",
      hubEnd: "E_Wing_1",
      waypoints: [
        { x: 950, y: 350 },
        { x: 898, y: 410 },
      ],
      connectedRooms: ["D106", "D107", "E135", "E136", "E137", "E137A"],
    },

    // ── D WING TO F WING HALLWAY ────────────────────────────────────────────
    // Connects D Wing to F Wing
    D_F_Connector_1: {
      name: "D-F Connector",
      floor: 1,
      description: "Hallway extending from D Wing to F Wing",
      hubStart: "D_Wing_1",
      hubEnd: "F_Wing_1",
      waypoints: [
        { x: 897, y: 500 },
        { x: 914, y: 563 },
      ],
      connectedRooms: ["D108", "D109", "F137"],
    },
  },

  // ═════════════════════════════════════════════════════════════════════════
  // FLOOR 2 HALLWAYS (Similar structure to Floor 1)
  // ═════════════════════════════════════════════════════════════════════════

  floor2: {
    A_Pod_Corridor_2: {
      name: "A Pod Main Corridor (Floor 2)",
      floor: 2,
      hubStart: "A_Pod_2",
      hubEnd: "A_Pod_2",
      waypoints: [
        { x: 1630, y: 875 },
        { x: 1600, y: 875 },
        { x: 1550, y: 875 },
      ],
      connectedRooms: [
        "A200",
        "A201",
        "A201A",
        "A202",
        "A203",
        "A203A",
        "A204",
        "A205",
        "A205A",
        "A206",
        "A207",
        "A208",
        "A208A",
        "A209",
        "A209A",
        "A210",
        "A211",
        "A212",
        "A212A",
        "A213",
        "A213A",
        "A213B",
        "A214",
        "A214A",
        "A215",
        "A218",
        "A219",
      ],
    },

    B_Pod_Corridor_2: {
      name: "B Pod Main Corridor (Floor 2)",
      floor: 2,
      hubStart: "B_Pod_2",
      hubEnd: "B_Pod_2",
      waypoints: [
        { x: 1550, y: 755 },
        { x: 1545, y: 700 },
        { x: 1540, y: 650 },
      ],
      connectedRooms: [
        "B200",
        "B201",
        "B201A",
        "B201B",
        "B201C",
        "B201D",
        "B201E",
        "B201F",
        "B201G",
        "B201H",
        "B201J",
        "B201K",
        "B202",
        "B202A",
        "B202B",
        "B202C",
        "B203",
        "B204",
        "B205",
        "B205A",
        "B206",
        "B206A",
        "B207",
        "B208",
        "B208A",
        "B209",
        "B209A",
        "B210",
        "B211",
        "B212",
        "B212A",
        "B213",
        "B213A",
        "B213B",
        "B214",
        "B214A",
        "B215",
        "B218",
        "B219",
        "B220",
        "B221",
      ],
    },

    C_Pod_Corridor_2: {
      name: "C Pod Main Corridor (Floor 2)",
      floor: 2,
      hubStart: "C_Pod_2",
      hubEnd: "C_Pod_2",
      waypoints: [
        { x: 1185, y: 448 },
        { x: 1250, y: 500 },
        { x: 1310, y: 660 },
        { x: 1350, y: 700 },
      ],
      connectedRooms: [
        "C200",
        "C201",
        "C201A",
        "C201B",
        "C201C",
        "C201D",
        "C201E",
        "C201F",
        "C202",
        "C202A",
        "C203",
        "C204",
        "C205",
        "C206",
        "C207",
        "C208",
        "C209",
        "C210",
        "C211",
        "C212",
        "C213",
        "C213A",
        "C213B",
        "C214",
        "C215",
        "C218",
        "C219",
        "C220",
        "C220A",
        "C221",
        "C221A",
        "C222",
        "C222A",
        "C222B",
        "C223",
        "C224",
        "C225",
        "C226",
        "C227",
        "C227B",
      ],
    },

    Z_Pod_Corridor_2: {
      name: "Z Pod Main Corridor (Floor 2)",
      floor: 2,
      hubStart: "Z_Pod_2",
      hubEnd: "Z_Pod_2",
      waypoints: [
        { x: 1450, y: 1200 },
        { x: 1500, y: 1100 },
        { x: 1550, y: 1050 },
        { x: 1600, y: 1000 },
      ],
      connectedRooms: [
        "Z200",
        "Z201",
        "Z201A",
        "Z201B",
        "Z201C",
        "Z201D",
        "Z201E",
        "Z201F",
        "Z201G",
        "Z202",
        "Z202A",
        "Z203",
        "Z204",
        "Z205",
        "Z205A",
        "Z206",
        "Z207",
        "Z208",
        "Z208A",
        "Z209",
        "Z209A",
        "Z210",
        "Z211",
        "Z211A",
        "Z212",
        "Z212A",
        "Z213",
        "Z213A",
        "Z213B",
        "Z214",
        "Z214A",
        "Z215",
        "Z215A",
        "Z218",
        "Z219",
        "Z221",
        "Z222",
        "Z223",
        "Z224",
        "Z225",
        "Z226",
        "Z227",
        "Z228",
        "Z229",
        "Z230",
        "Z231",
        "Z232",
      ],
    },

    Commons_Central_2: {
      name: "Commons Central Area (Floor 2)",
      floor: 2,
      hubStart: "Commons_2",
      hubEnd: "Commons_2",
      waypoints: [
        { x: 1310, y: 720 },
        { x: 1295, y: 695 },
        { x: 1250, y: 650 },
      ],
      connectedRooms: ["C200", "C220", "B220", "Z225"],
    },

    D_Wing_Corridor_2: {
      name: "D Wing Main Corridor (Floor 2)",
      floor: 2,
      hubStart: "D_Wing_2",
      hubEnd: "D_Wing_2",
      waypoints: [
        { x: 1060, y: 500 },
        { x: 920, y: 400 },
      ],
      connectedRooms: ["D212", "D213"],
    },
  },

  // ═════════════════════════════════════════════════════════════════════════
  // FLOOR 3 HALLWAYS
  // ═════════════════════════════════════════════════════════════════════════

  floor3: {
    A_Pod_Corridor_3: {
      name: "A Pod Main Corridor (Floor 3)",
      floor: 3,
      hubStart: "A_Pod_3",
      hubEnd: "A_Pod_3",
      waypoints: [
        { x: 1630, y: 875 },
        { x: 1600, y: 875 },
        { x: 1550, y: 875 },
      ],
      connectedRooms: [
        "A300",
        "A301",
        "A301A",
        "A302",
        "A303",
        "A303A",
        "A304",
        "A305",
        "A305A",
        "A306",
        "A307",
        "A308",
        "A308A",
        "A309",
        "A309A",
        "A310",
        "A311",
        "A312",
        "A312A",
        "A313",
        "A313A",
        "A314",
        "A314A",
        "A315",
        "A318",
        "A319",
        "A325A",
        "A326",
      ],
    },

    B_Pod_Corridor_3: {
      name: "B Pod Main Corridor (Floor 3)",
      floor: 3,
      hubStart: "B_Pod_3",
      hubEnd: "B_Pod_3",
      waypoints: [
        { x: 1550, y: 755 },
        { x: 1545, y: 700 },
        { x: 1540, y: 650 },
      ],
      connectedRooms: [
        "B300",
        "B301",
        "B301A",
        "B301B",
        "B301C",
        "B301D",
        "B301E",
        "B301F",
        "B301G",
        "B301H",
        "B302",
        "B303",
        "B304",
        "B305",
        "B305A",
        "B306",
        "B306A",
        "B307",
        "B308",
        "B308A",
        "B309",
        "B310",
        "B311",
        "B312",
        "B312A",
        "B313",
        "B313A",
        "B313B",
        "B314",
        "B314A",
        "B315",
        "B316",
        "B318",
        "B319",
      ],
    },

    C_Pod_Corridor_3: {
      name: "C Pod Main Corridor (Floor 3)",
      floor: 3,
      hubStart: "C_Pod_3",
      hubEnd: "C_Pod_3",
      waypoints: [
        { x: 1185, y: 448 },
        { x: 1250, y: 500 },
        { x: 1310, y: 660 },
        { x: 1350, y: 700 },
      ],
      connectedRooms: [
        "C300",
        "C301",
        "C301A",
        "C301B",
        "C302",
        "C303",
        "C303A",
        "C304",
        "C304A",
        "C305",
        "C305A",
        "C306",
        "C306A",
        "C307",
        "C308",
        "C308A",
        "C309",
        "C310",
        "C311",
        "C311A",
        "C312",
        "C312A",
        "C313",
        "C313A",
        "C313B",
        "C314",
        "C314A",
        "C315",
        "C315A",
        "C318",
        "C319",
      ],
    },

    Z_Pod_Corridor_3: {
      name: "Z Pod Main Corridor (Floor 3)",
      floor: 3,
      hubStart: "Z_Pod_3",
      hubEnd: "Z_Pod_3",
      waypoints: [
        { x: 1450, y: 1200 },
        { x: 1500, y: 1100 },
        { x: 1550, y: 1050 },
        { x: 1600, y: 1000 },
      ],
      connectedRooms: [
        "Z300",
        "Z301",
        "Z301A",
        "Z301B",
        "Z302",
        "Z303",
        "Z304",
        "Z305",
        "Z305A",
        "Z306",
        "Z307",
        "Z308",
        "Z309",
        "Z309A",
        "Z310",
        "Z311",
        "Z311A",
        "Z312",
        "Z312A",
        "Z313",
        "Z313A",
        "Z314",
        "Z314A",
        "Z315",
        "Z315A",
        "Z316",
        "Z317",
        "Z318",
        "Z319",
        "Z319A",
        "Z320",
        "Z321",
        "Z322",
        "Z323",
        "Z324",
        "Z325",
        "Z326",
      ],
    },

    Commons_Central_3: {
      name: "Commons Central Area (Floor 3)",
      floor: 3,
      hubStart: "Commons_3",
      hubEnd: "Commons_3",
      waypoints: [
        { x: 1310, y: 720 },
        { x: 1295, y: 695 },
        { x: 1250, y: 650 },
      ],
      connectedRooms: ["C300", "Z325"],
    },
  },
};

/**
 * Helper function to get all hallways on a specific floor
 */
export function getHallwaysForFloor(floor) {
  const key = `floor${floor}`;
  return hallways[key] || {};
}

/**
 * Helper function to find which hallway a room connects to
 */
export function getHallwayForRoom(roomName) {
  for (const floor of [1, 2, 3]) {
    const floorHallways = getHallwaysForFloor(floor);
    for (const [hallwayId, hallwayData] of Object.entries(floorHallways)) {
      if (hallwayData.connectedRooms.includes(roomName)) {
        return { hallwayId, ...hallwayData };
      }
    }
  }
  return null;
}

/**
 * Helper function to get waypoints for a hallway
 */
export function getHallwayWaypoints(hallwayId, floor) {
  const floorHallways = getHallwaysForFloor(floor);
  return floorHallways[hallwayId]?.waypoints || [];
}
