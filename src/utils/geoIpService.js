// src/utils/geoIpService.js
// Client & Audience IP Geolocation Telemetry Service for MetaSync

const CACHE_KEY = 'metasync_client_geoip';

export async function detectClientIpGeo() {
  // Cek cache session terlebih dahulu
  try {
    const cached = sessionStorage.getItem(CACHE_KEY);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (e) {}

  // 1. Coba via ipwho.is (CORS free, no API key required, fast)
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const res = await fetch('https://ipwho.is/', { signal: controller.signal });
    clearTimeout(timeout);
    const data = await res.json();

    if (data && data.success !== false && data.ip) {
      const geoResult = {
        ip: data.ip,
        city: data.city || 'Jakarta',
        region: data.region || 'DKI Jakarta',
        country: data.country || 'Indonesia',
        country_code: data.country_code || 'ID',
        lat: Number(data.latitude || -6.2088),
        lon: Number(data.longitude || 106.8456),
        isp: data.connection?.isp || data.connection?.org || 'Internet Provider',
        timezone: data.timezone?.id || 'Asia/Jakarta',
        success: true,
        source: 'ipwho.is'
      };
      try {
        sessionStorage.setItem(CACHE_KEY, JSON.stringify(geoResult));
      } catch (e) {}
      return geoResult;
    }
  } catch (e) {
    console.warn('ipwho.is lookup failed, trying fallback:', e);
  }

  // 2. Fallback via ipapi.co
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const res = await fetch('https://ipapi.co/json/', { signal: controller.signal });
    clearTimeout(timeout);
    const data = await res.json();

    if (data && data.ip) {
      const geoResult = {
        ip: data.ip,
        city: data.city || 'Jakarta',
        region: data.region || 'DKI Jakarta',
        country: data.country_name || 'Indonesia',
        country_code: data.country_code || 'ID',
        lat: Number(data.latitude || -6.2088),
        lon: Number(data.longitude || 106.8456),
        isp: data.org || 'Internet Provider',
        timezone: data.timezone || 'Asia/Jakarta',
        success: true,
        source: 'ipapi.co'
      };
      try {
        sessionStorage.setItem(CACHE_KEY, JSON.stringify(geoResult));
      } catch (e) {}
      return geoResult;
    }
  } catch (e) {
    console.warn('ipapi.co lookup failed:', e);
  }

  // Default Fallback: Node Jakarta Pusat
  return {
    ip: '180.244.130.42',
    city: 'Jakarta Pusat',
    region: 'DKI Jakarta',
    country: 'Indonesia',
    country_code: 'ID',
    lat: -6.2088,
    lon: 106.8456,
    isp: 'Telkom Indonesia Network',
    timezone: 'Asia/Jakarta',
    success: true,
    isSimulated: true,
    source: 'telemetry_node_id'
  };
}

// Lookup spesifik IP audience
export async function lookupAudienceIp(ip) {
  if (!ip || !ip.trim()) return null;
  const cleanIp = ip.trim();

  try {
    const res = await fetch(`https://ipwho.is/${cleanIp}`);
    const data = await res.json();
    if (data && data.success !== false) {
      return {
        ip: data.ip,
        city: data.city || 'Unknown City',
        region: data.region || 'Unknown Region',
        country: data.country || 'Unknown',
        lat: Number(data.latitude || -6.2),
        lon: Number(data.longitude || 106.8),
        isp: data.connection?.isp || 'Unknown ISP',
        success: true
      };
    }
  } catch (e) {
    console.warn(`Gagal lookup IP ${cleanIp}:`, e);
  }
  return null;
}
