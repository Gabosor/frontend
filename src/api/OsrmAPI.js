const OSRM_BASE_URL = import.meta.env.VITE_OSRM_URL;

export const getRoute = async (from, to) => {
  const url = `${OSRM_BASE_URL}/route/v1/driving/${from[1]},${from[0]};${to[1]},${to[0]}?overview=full&geometries=geojson`;

  const response = await fetch(url);
  if (!response.ok) throw new Error("No se pudo obtener la ruta");

  const data = await response.json();
  return data.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]);
};
