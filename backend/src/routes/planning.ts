import { Router } from "express";
import { z } from "zod";
import { validate } from "../middleware/validate.js";
import { cache, CACHE_TTL } from "../cache/memoryCache.js";
import { logger } from "../config/logger.js";

const router = Router();

// Input validation schemas — sanitize ALL user input
const geocodeSchema = z.object({
  q: z.string().min(3).max(200).trim(),
});

const planningSchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  propId: z.string().max(50).optional(),
});

const daSchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  radius: z.coerce.number().min(50).max(5000).default(500),
  page: z.coerce.number().min(1).max(100).default(1),
});

// --- GEOCODE ---
router.get("/geocode", validate(geocodeSchema), async (req, res, next) => {
  try {
    const { q } = (req as any).validated;
    const cacheKey = `geocode:${q.toLowerCase()}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      res.json(cached);
      return;
    }

    const url = `https://api.geocode.earth/v1/autocomplete?api_key=ge-placeholder&text=${encodeURIComponent(q)}&boundary.country=AU&layers=address`;
    // TODO: Replace with NSW geocoding endpoint
    const response = await fetch(`https://maps.six.nsw.gov.au/arcgis/rest/services/public/NSW_Geocode/GeocodeServer/findAddressCandidates?SingleLine=${encodeURIComponent(q)}&f=json&maxLocations=5&outFields=*`);
    const data = await response.json();

    cache.set(cacheKey, data, CACHE_TTL.GEOCODE);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// --- PLANNING (Zoning + Controls) ---
router.get("/planning", validate(planningSchema), async (req, res, next) => {
  try {
    const { lat, lng, propId } = (req as any).validated;
    const cacheKey = `planning:${lat}:${lng}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      res.json(cached);
      return;
    }

    // NSW Planning Portal spatial API
    const baseUrl = "https://mapprod3.environment.nsw.gov.au/arcgis/rest/services/ePlanning/Planning_Portal_Principal_Planning/MapServer";
    const geometry = `${lng},${lat}`;
    const params = `geometry=${geometry}&geometryType=esriGeometryPoint&spatialRel=esriSpatialRelIntersects&outFields=*&f=json&inSR=4326`;

    // Fetch zoning (layer 0) + height (layer 2) + FSR (layer 4) + lot size (layer 6) in parallel
    const [zoningRes, heightRes, fsrRes, lotSizeRes] = await Promise.all([
      fetch(`${baseUrl}/0/query?${params}`),
      fetch(`${baseUrl}/2/query?${params}`),
      fetch(`${baseUrl}/4/query?${params}`),
      fetch(`${baseUrl}/6/query?${params}`),
    ]);

    const [zoning, height, fsr, lotSize] = await Promise.all([
      zoningRes.json(),
      heightRes.json(),
      fsrRes.json(),
      lotSizeRes.json(),
    ]);

    const result = { zoning, height, fsr, lotSize };
    cache.set(cacheKey, result, CACHE_TTL.ZONING);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// --- DAs ---
router.get("/da", validate(daSchema), async (req, res, next) => {
  try {
    const { lat, lng, radius, page } = (req as any).validated;
    const cacheKey = `da:${lat}:${lng}:${radius}:${page}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      res.json(cached);
      return;
    }

    const pageSize = 20;
    const offset = (page - 1) * pageSize;
    const url = `https://api.apps1.nsw.gov.au/eplanning/data/v0/OnlineDA?filters=EPI_CentreLatLong%3D%5B${lat},${lng},${radius}%5D&PageSize=${pageSize}&StartIndex=${offset}`;

    const response = await fetch(url);
    const data = await response.json();

    cache.set(cacheKey, data, CACHE_TTL.DA);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// --- HAZARDS ---
router.get("/hazard", validate(planningSchema), async (req, res, next) => {
  try {
    const { lat, lng } = (req as any).validated;
    const cacheKey = `hazard:${lat}:${lng}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      res.json(cached);
      return;
    }

    const geometry = `${lng},${lat}`;
    const params = `geometry=${geometry}&geometryType=esriGeometryPoint&spatialRel=esriSpatialRelIntersects&outFields=*&f=json&inSR=4326`;

    // NSW hazard layers
    const floodUrl = `https://mapprod3.environment.nsw.gov.au/arcgis/rest/services/ePlanning/Planning_Portal_Hazard/MapServer/0/query?${params}`;
    const bushfireUrl = `https://mapprod3.environment.nsw.gov.au/arcgis/rest/services/ePlanning/Planning_Portal_Hazard/MapServer/2/query?${params}`;

    const [floodRes, bushfireRes] = await Promise.all([
      fetch(floodUrl),
      fetch(bushfireUrl),
    ]);

    const [flood, bushfire] = await Promise.all([
      floodRes.json(),
      bushfireRes.json(),
    ]);

    const result = { flood, bushfire };
    cache.set(cacheKey, result, CACHE_TTL.HAZARD);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
