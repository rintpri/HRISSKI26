import { WorkLocation } from '../types/hris';

/**
 * Calculates distance in meters between two coordinates using the Haversine formula
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${meters} meter`;
  }
  return `${(meters / 1000).toFixed(2)} km`;
}

/**
 * Get current coordinates from the browser Geolocation API
 */
export async function getBrowserLocation(): Promise<{ latitude: number; longitude: number; accuracy: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Perangkat atau browser Anda tidak mendukung Geolocation GPS.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy || 10,
        });
      },
      (err) => {
        let msg = 'Gagal mengakses GPS perangkat.';
        if (err.code === 1) msg = 'Izin lokasi GPS ditolak oleh pengguna.';
        if (err.code === 2) msg = 'Sinyal posisi GPS tidak tersedia.';
        if (err.code === 3) msg = 'Waktu permintaan lokasi habis (timeout).';
        reject(new Error(msg));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  });
}

export interface GeofenceCheckResult {
  isAllowed: boolean;
  closestLocation?: WorkLocation;
  distanceMeters?: number;
  message: string;
}

/**
 * Evaluates whether coordinates are within allowed locations
 */
export function verifyGeofence(
  currentLat: number,
  currentLng: number,
  isGeofencingActive: boolean,
  gpsToleranceMeters: number,
  assignedLocations: WorkLocation[]
): GeofenceCheckResult {
  // If geofencing policy is turned OFF or employee has no assigned locations:
  if (!isGeofencingActive) {
    return {
      isAllowed: true,
      message: 'Kunci lokasi saat ini nonaktif. Absensi diterima dari lokasi mana pun.',
    };
  }

  if (assignedLocations.length === 0) {
    return {
      isAllowed: true,
      message: 'Karyawan belum ditugaskan ke lokasi tertentu. Bebas absen dari mana saja.',
    };
  }

  let minDistance = Infinity;
  let nearestLoc: WorkLocation | undefined;
  let matchesAny = false;

  for (const loc of assignedLocations) {
    const dist = calculateHaversineDistance(currentLat, currentLng, loc.latitude, loc.longitude);
    if (dist < minDistance) {
      minDistance = dist;
      nearestLoc = loc;
    }

    const effectiveRadius = (loc.radius || 100) + gpsToleranceMeters;
    if (dist <= effectiveRadius) {
      matchesAny = true;
      nearestLoc = loc;
      minDistance = dist;
      break;
    }
  }

  if (matchesAny && nearestLoc) {
    return {
      isAllowed: true,
      closestLocation: nearestLoc,
      distanceMeters: minDistance,
      message: `Terverifikasi! Anda berada di lokasi ${nearestLoc.name} (${minDistance}m dari titik pusat).`,
    };
  }

  return {
    isAllowed: false,
    closestLocation: nearestLoc,
    distanceMeters: minDistance,
    message: nearestLoc
      ? `Absen ditolak! Anda berjarak ${formatDistance(minDistance)} dari ${nearestLoc.name} (Radius diizinkan ${nearestLoc.radius}m + toleransi GPS ${gpsToleranceMeters}m).`
      : 'Absen ditolak! Anda berada di luar radius lokasi kerja yang ditugaskan.',
  };
}
