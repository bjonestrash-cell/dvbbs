/**
 * Static city -> [lng, lat] dictionary for the Tour map.
 *
 * Shows do not store geocoordinates; we lean on a small lookup of
 * the touring cities we expect to see. If a city is unknown we fall
 * back to country center so the pin still lands somewhere reasonable
 * and the routing stays readable.
 *
 * If a city is missing here, add it. We deliberately keep this static
 * to avoid runtime geocoding API calls.
 */

type Coord = [number, number]; // [longitude, latitude]

const CITY_COORDS: Record<string, Coord> = {
  // North America
  "los angeles": [-118.2437, 34.0522],
  "beverly hills": [-118.4004, 34.0736],
  "new york": [-74.006, 40.7128],
  "brooklyn": [-73.9442, 40.6782],
  "miami": [-80.1918, 25.7617],
  "chicago": [-87.6298, 41.8781],
  "las vegas": [-115.1398, 36.1699],
  "san francisco": [-122.4194, 37.7749],
  "washington": [-77.0369, 38.9072],
  "seattle": [-122.3321, 47.6062],
  "austin": [-97.7431, 30.2672],
  "houston": [-95.3698, 29.7604],
  "denver": [-104.9903, 39.7392],
  "atlanta": [-84.388, 33.749],
  "boston": [-71.0589, 42.3601],
  "detroit": [-83.0458, 42.3314],
  "toronto": [-79.3832, 43.6532],
  "vancouver": [-123.1207, 49.2827],
  "montreal": [-73.5673, 45.5017],
  "mexico city": [-99.1332, 19.4326],

  // Europe
  "ibiza": [1.4821, 38.9067],
  "barcelona": [2.1734, 41.3851],
  "madrid": [-3.7038, 40.4168],
  "london": [-0.1276, 51.5074],
  "manchester": [-2.2426, 53.4808],
  "paris": [2.3522, 48.8566],
  "amsterdam": [4.9041, 52.3676],
  "rotterdam": [4.4777, 51.9244],
  "berlin": [13.405, 52.52],
  "munich": [11.582, 48.1351],
  "boom": [4.3676, 51.0913],
  "antwerp": [4.4025, 51.2194],
  "brussels": [4.3517, 50.8503],
  "rome": [12.4964, 41.9028],
  "milan": [9.19, 45.4642],
  "vienna": [16.3738, 48.2082],
  "zurich": [8.5417, 47.3769],
  "stockholm": [18.0686, 59.3293],
  "copenhagen": [12.5683, 55.6761],
  "oslo": [10.7522, 59.9139],
  "helsinki": [24.9384, 60.1699],
  "warsaw": [21.0122, 52.2297],
  "prague": [14.4378, 50.0755],
  "budapest": [19.0402, 47.4979],
  "lisbon": [-9.1393, 38.7223],
  "athens": [23.7275, 37.9838],
  "moscow": [37.6173, 55.7558],
  "saint petersburg": [30.3351, 59.9343],

  // Asia / Oceania
  "tokyo": [139.6503, 35.6762],
  "osaka": [135.5023, 34.6937],
  "seoul": [126.978, 37.5665],
  "shanghai": [121.4737, 31.2304],
  "hong kong": [114.1694, 22.3193],
  "singapore": [103.8198, 1.3521],
  "bangkok": [100.5018, 13.7563],
  "bali": [115.1889, -8.4095],
  "jakarta": [106.8456, -6.2088],
  "manila": [120.9842, 14.5995],
  "dubai": [55.2708, 25.2048],
  "tel aviv": [34.7818, 32.0853],
  "sydney": [151.2093, -33.8688],
  "melbourne": [144.9631, -37.8136],
  "auckland": [174.7633, -36.8485],

  // South America
  "sao paulo": [-46.6333, -23.5505],
  "rio de janeiro": [-43.1729, -22.9068],
  "buenos aires": [-58.3816, -34.6037],
  "lima": [-77.0428, -12.0464],
  "bogota": [-74.0721, 4.711],
};

const COUNTRY_COORDS: Record<string, Coord> = {
  US: [-98.5795, 39.8283],
  CA: [-106.3468, 56.1304],
  MX: [-102.5528, 23.6345],
  GB: [-3.4359, 55.3781],
  ES: [-3.7492, 40.4637],
  FR: [2.2137, 46.2276],
  DE: [10.4515, 51.1657],
  NL: [5.2913, 52.1326],
  BE: [4.4699, 50.5039],
  IT: [12.5674, 41.8719],
  AT: [14.5501, 47.5162],
  CH: [8.2275, 46.8182],
  SE: [18.6435, 60.1282],
  DK: [9.5018, 56.2639],
  NO: [8.4689, 60.472],
  FI: [25.7482, 61.9241],
  PL: [19.1451, 51.9194],
  CZ: [15.473, 49.8175],
  PT: [-8.2245, 39.3999],
  GR: [21.8243, 39.0742],
  RU: [105.3188, 61.524],
  JP: [138.2529, 36.2048],
  KR: [127.7669, 35.9078],
  CN: [104.1954, 35.8617],
  HK: [114.1095, 22.3964],
  SG: [103.8198, 1.3521],
  TH: [100.9925, 15.87],
  ID: [113.9213, -0.7893],
  PH: [121.774, 12.8797],
  AE: [53.8478, 23.4241],
  IL: [34.8516, 31.0461],
  AU: [133.7751, -25.2744],
  NZ: [174.886, -40.9006],
  BR: [-51.9253, -14.235],
  AR: [-63.6167, -38.4161],
  PE: [-75.0152, -9.19],
  CO: [-74.2973, 4.5709],
};

const norm = (s: string | null | undefined): string =>
  (s ?? "").toLowerCase().trim();

/** Resolve a coordinate for a show. Returns null if neither city nor
 *  country match the dictionary. */
export function coordFor(
  city: string | null,
  country: string | null,
): Coord | null {
  const c = CITY_COORDS[norm(city)];
  if (c) return c;
  const cc = country?.toUpperCase().trim();
  if (cc && COUNTRY_COORDS[cc]) return COUNTRY_COORDS[cc];
  return null;
}
