import { APP_UA, NOMINATIM_URL, PHOTON_URL } from "./constants";
import type { Place } from "../state/types";

const cache = new Map<string, Place[]>();

function headers(): HeadersInit {
  return {
    Accept: "application/json",
    "Accept-Language": "en-US",
  };
}

interface NominatimHit {
  display_name: string;
  lat: string;
  lon: string;
  name?: string;
  type?: string;
  address?: {
    road?: string;
    house_number?: string;
    city?: string;
    town?: string;
    village?: string;
    state?: string;
  };
}

function fromNominatim(hit: NominatimHit): Place {
  const street = [hit.address?.house_number, hit.address?.road]
    .filter(Boolean)
    .join(" ");
  const name = hit.name || street || hit.display_name.split(",")[0];
  return {
    name,
    label: hit.display_name,
    lng: Number(hit.lon),
    lat: Number(hit.lat),
  };
}

async function nominatimSearch(query: string): Promise<Place[]> {
  const url = new URL(`${NOMINATIM_URL}/search`);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("q", query);
  url.searchParams.set("limit", "6");
  url.searchParams.set("addressdetails", "1");
  const res = await fetch(url, { headers: headers() });
  if (!res.ok) throw new Error(`Nominatim ${res.status}`);
  const data = (await res.json()) as NominatimHit[];
  return data.map(fromNominatim);
}

interface PhotonHit {
  geometry: { coordinates: [number, number] };
  properties: {
    name?: string;
    street?: string;
    housenumber?: string;
    city?: string;
    state?: string;
    country?: string;
  };
}

async function photonSearch(query: string): Promise<Place[]> {
  const url = new URL(PHOTON_URL);
  url.searchParams.set("q", query);
  url.searchParams.set("limit", "6");
  url.searchParams.set("lang", "en");
  const res = await fetch(url, { headers: headers() });
  if (!res.ok) throw new Error(`Photon ${res.status}`);
  const data = (await res.json()) as { features: PhotonHit[] };
  return (data.features ?? []).map((f) => {
    const p = f.properties;
    const name =
      p.name ||
      [p.housenumber, p.street].filter(Boolean).join(" ") ||
      "Place";
    const label = [name, p.city, p.state, p.country].filter(Boolean).join(", ");
    return { name, label, lng: f.geometry.coordinates[0], lat: f.geometry.coordinates[1] };
  });
}

export async function searchPlaces(query: string): Promise<Place[]> {
  const q = query.trim();
  if (q.length < 3) return [];
  const key = q.toLowerCase();
  const cached = cache.get(key);
  if (cached) return cached;
  try {
    const hits = await nominatimSearch(q);
    cache.set(key, hits);
    return hits;
  } catch {
    const hits = await photonSearch(q);
    cache.set(key, hits);
    return hits;
  }
}

export async function reverseGeocode(lng: number, lat: number): Promise<Place> {
  const url = new URL(`${NOMINATIM_URL}/reverse`);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("lat", String(lat));
  url.searchParams.set("lon", String(lng));
  try {
    const res = await fetch(url, { headers: headers() });
    if (!res.ok) throw new Error("reverse failed");
    const hit = (await res.json()) as NominatimHit;
    return fromNominatim(hit);
  } catch {
    return {
      name: "Dropped pin",
      label: `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
      lng,
      lat,
    };
  }
}

/** Identifiable UA is set on non-browser clients; browsers send Referer instead. */
export const GEOCODER_UA = APP_UA;
