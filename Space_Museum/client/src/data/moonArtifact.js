// =====================================================================
// THE ONE ARTIFACT ON THE MOON
// Everything the Moon section shows comes from this file, so the Writer
// can edit the story without touching any React code.
// =====================================================================

// Set to false once every "verify" fact below has been checked on NASA's pages.
export const SHOW_VERIFY_FLAGS = true;

export const GUIDE_NAME = "Patch"; // change to your guide's name

export const MOON_ARTIFACT = {
  id: "apollo-11-lunar-module",
  name: "Apollo 11 Lunar Module (Eagle)",
  shortName: "EAGLE",
  site: "Tranquility Base",
  year: 1969,

  // NASA 3D models (both come from NASA's 3D Resources collection)
  model: "/models/apollo-lm.glb",          // Apollo Lunar Module (GLB)
  terrain: "/models/apollo11-site.stl",    // Apollo 11 landing-site terrain (STL)

  // NASA's catalog entry for this object (from the challenge's resource list)
  nssdca: {
    id: "1969-059C",
    url: "https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1969-059C",
  },

  // What the guide says, one line at a time. Keep each line short.
  lines: [
    "I'm what's left of Eagle. In 1969 I carried two astronauts down to the Moon's surface. When they flew home, I stayed behind.",
    "I wasn't forgotten. The descent stages of the Lunar Modules were left behind on purpose, to act as launch pads for the trip back up.",
    "I'm still here at Tranquility Base, on the Moon's Sea of Tranquility. Drag me around and take a good look.",
    "Now press Dismantle and watch me come apart. Tap any piece to learn what it did.",
  ],

  // Quick facts shown under the 3D scene. verify:true shows a small tag until you confirm.
  facts: [
    { label: "MISSION", value: "Apollo 11" },
    { label: "LANDED", value: "20 July 1969", verify: true },
    { label: "SITE", value: "Sea of Tranquility", verify: true },
    { label: "STATUS", value: "Descent stage left on the Moon" },
  ],

  // ------------------------------------------------------------------
  // DISMANTLE VIEW
  // Each part: which pieces of the 3D model belong to it (meshIds are
  // positions in the NASA model's piece list), how far it flies apart,
  // three reading levels, and an optional real photo.
  //   photo: { src, alt, credit, kind: "photo" | "render" }  -> shown on the part card
  //   photo: null  -> the card shows a slot + a link to NASA's image library.
  // To add a photo: drop the file in public/images/parts/ and fill in photo.
  // verify:true shows a small VERIFY tag next to numbers to check on NASA's pages.
  // ------------------------------------------------------------------
  parts: [
    {
      id: "ascent-stage",
      name: "Ascent stage",
      short: "The crew cabin",
      meshIds: "ascent", // everything high up that is not listed in another part
      lift: [0, 2.2, 0],
      kid: "This is where the two astronauts lived and flew the lander. It's the part that blasted off the Moon to take them home.",
      curious: "The ascent stage held the crew cabin, the controls and its own rocket engine. After the astronauts finished on the surface, it lifted off and docked with the command module in lunar orbit.",
      engineer: "A pressurised crew compartment with its own ascent propulsion engine and propellant tanks. It used the descent stage as a launch platform, which is why only the lower half was left behind.",
      photo: null,
      search: "apollo lunar module ascent stage",
    },
    {
      id: "antennas",
      name: "Antennas and radar",
      short: "How it talked and found its way home",
      meshIds: [102, 120, 121, 122, 124, 86, 87, 88, 89, 96, 97, 105, 106, 129, 130, 132],
      lift: [0, 5, 0],
      kid: "These are the lander's ears and mouth. They sent the astronauts' voices and pictures to Earth, and helped find the ship waiting overhead.",
      curious: "The top of the lander carried a dish for talking to Earth, smaller antennas for talking to the command module, and a radar used to meet up with it again.",
      engineer: "S-band communications to Earth, VHF links for ranging and voice with the command module, and a rendezvous radar for the orbital meeting. Exact antenna layout on this model is simplified.",
      photo: null,
      search: "apollo lunar module antenna",
    },
    {
      id: "thrusters",
      name: "Steering thrusters",
      short: "Small rockets that turned the lander",
      meshIds: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,113,114],
      radial: 3.8,
      lift: [0, 3, 0],
      kid: "Tiny rocket puffs on the corners. They nudged the lander left, right, up and round so it could point the right way.",
      curious: "The lander had small thrusters grouped in four clusters, one at each corner of the upper stage. Firing different ones turned and steadied it, like paddles on a boat.",
      engineer: "A reaction control system of 16 thrusters in four clusters of four. It gave attitude control and small translations during descent, ascent and docking.",
      photo: null,
      search: "apollo lunar module reaction control thruster",
    },
    {
      id: "legs",
      name: "Landing legs",
      short: "Four crushable legs",
      meshIds: [70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,90,91,92,93,94,95,98,99,100,115,116,117],
      radial: 3.4,
      lift: [0, 0, 0],
      kid: "Four spindly legs that caught the lander when it touched down, a bit like a cat landing on its paws.",
      curious: "The legs folded out before landing. Parts of each leg were built to crumple a little on touchdown, soaking up the bump so the astronauts and instruments stayed safe.",
      engineer: "Four legs with crushable energy-absorbing struts to take the landing load. The forward leg carried the ladder and a plaque.",
      photo: null,
      search: "apollo 11 lunar module landing leg",
    },
    {
      id: "ladder",
      name: "Ladder",
      short: "Nine rungs to the Moon",
      meshIds: [119, 126, 127],
      lift: [0, 0, 6],
      kid: "The ladder the astronauts climbed down. The very first human step on the Moon came from this ladder.",
      curious: "The ladder sat on the front leg. Neil Armstrong climbed down it and stepped onto the surface on 20 July 1969.",
      engineer: "A short ladder on the forward leg. The last rung stood well above the ground because the legs compressed only a little on landing.",
      verify: true,
      photo: null,
      search: "apollo 11 lunar module ladder",
    },
    {
      id: "descent-stage",
      name: "Descent stage",
      short: "The part that stayed",
      meshIds: "descent",
      lift: [0, 0, 0],
      kid: "This is the bottom half, and it's still on the Moon today. It carried the lander down, then became the launch pad for the trip home.",
      curious: "The descent stage held the big landing engine, fuel tanks and supplies. When the astronauts left, the upper half launched from its top and the lower half stayed on the surface.",
      engineer: "Contained the throttleable descent engine, propellant tanks, batteries and stowed equipment. It was never meant to return, so it is the artifact that remains at Tranquility Base.",
      photo: null,
      search: "apollo lunar module descent stage",
    },
    {
      id: "descent-engine",
      name: "Descent engine",
      short: "The rocket that slowed the fall",
      meshIds: [17],
      lift: [0, -2.4, 0],
      kid: "A rocket pointing down. It pushed against the Moon's pull so the lander could come down gently.",
      curious: "This engine could change how hard it pushed, so the astronauts could slow down and hover before landing. It was only ever used once on each mission.",
      engineer: "A throttleable descent propulsion engine. Variable thrust allowed a soft, controlled landing and some hover capability.",
      photo: null,
      search: "apollo lunar module descent engine",
    },
    {
      id: "footpads",
      name: "Footpads",
      short: "Wide feet for soft dust",
      meshIds: [27, 28],
      lift: [0, -4.8, 0],
      kid: "Big round feet at the bottom of each leg, so the lander wouldn't sink into the soft Moon dust.",
      curious: "Wide, flat footpads spread the lander's weight over more ground. The photo shows an Apollo 11 bootprint in the same dust. It is the other thing that touched down at Tranquility Base.",
      engineer: "Footpads sized to keep ground pressure low in fine lunar regolith. Some pads also carried probes that lit a cabin light on first contact with the surface.",
      photo: {
        src: "/images/parts/bootprint.webp",
        alt: "An astronaut's bootprint in fine lunar soil, photographed during Apollo 11",
        credit: "NASA / Apollo 11 (via NASA 3D Resources). This is a bootprint, not the footpad itself.",
        kind: "photo",
      },
      search: "apollo lunar module footpad",
    },
  ],

  credits: [
    {
      label: "Apollo Lunar Module (3D model)",
      by: "NASA 3D Resources",
      url: "https://github.com/nasa/NASA-3D-Resources",
    },
    {
      label: "Apollo 11 Landing Site (terrain model)",
      by: "NASA 3D Resources",
      url: "https://github.com/nasa/NASA-3D-Resources",
    },
    {
      label: "Mission record 1969-059C",
      by: "NASA NSSDCA",
      url: "https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1969-059C",
    },
    {
      label: "Moon photograph",
      by: "NASA / Apollo",
      url: "https://github.com/nasa/NASA-3D-Resources",
    },
  ],
};
