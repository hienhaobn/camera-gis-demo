// Deterministic random number generator for reproducible camera placements
function createRandom(seed: number) {
  let value = seed;
  return function() {
    value = (value * 1664525 + 1013904223) % 4294967296;
    return value / 4294967296;
  };
}

export interface Camera {
  id: string;
  name: string;
  lng: number;
  lat: number;
  status: 'online' | 'offline' | 'maintenance';
  zone: string;
  type: 'PTZ' | 'Fixed' | 'Dome';
  lastSeen: string;
  resolution: '4K' | '2K' | '1080p';
  area: string;
  streamUrl?: string;
}

const zonesInfo = [
  { name: 'Hải Châu', center: [108.2201, 16.0594], radius: 0.02, count: 50 },
  { name: 'Thanh Khê', center: [108.1834, 16.0645], radius: 0.025, count: 30 },
  { name: 'Sơn Trà', center: [108.2435, 16.0841], radius: 0.03, count: 35 },
  { name: 'Ngũ Hành Sơn', center: [108.2612, 16.0124], radius: 0.04, count: 25 },
  { name: 'Liên Chiểu', center: [108.1456, 16.0789], radius: 0.035, count: 20 },
  { name: 'Cẩm Lệ', center: [108.2012, 15.9989], radius: 0.03, count: 15 },
  { name: 'Hòa Vang', center: [108.1123, 15.9789], radius: 0.08, count: 10 },
  { name: 'Hội An', center: [108.3289, 15.8801], radius: 0.02, count: 15 },
];

const streetsByZone: Record<string, string[]> = {
  'Hải Châu': ['Bạch Đằng', 'Trần Phú', 'Lê Duẩn', 'Nguyễn Văn Linh', 'Hùng Vương', 'Phan Châu Trinh', '2 Tháng 9', 'Đống Đa', 'Lê Lợi'],
  'Thanh Khê': ['Điện Biên Phủ', 'Nguyễn Tất Thành', 'Hùng Vương', 'Trần Cao Vân', 'Hà Huy Tập', 'Lê Độ'],
  'Sơn Trà': ['Võ Nguyên Giáp', 'Ngô Quyền', 'Phạm Văn Đồng', 'Lê Đức Thọ', 'Hoàng Sa', 'Trần Hưng Đạo'],
  'Ngũ Hành Sơn': ['Trường Sa', 'Lê Văn Hiến', 'Hồ Xuân Hương', 'Mai Đăng Chơn', 'Nam Kỳ Khởi Nghĩa'],
  'Liên Chiểu': ['Tôn Đức Thắng', 'Nguyễn Lương Bằng', 'Âu Cơ', 'Nguyễn Sinh Sắc', 'Nguyễn Tất Thành'],
  'Cẩm Lệ': ['Cách Mạng Tháng 8', 'Ông Ích Đường', 'Nguyễn Hữu Thọ', 'Trường Chinh', 'Lê Đại Hành'],
  'Hòa Vang': ['Quốc lộ 1A', 'Quốc lộ 14B', 'Tỉnh lộ 602', 'Tỉnh lộ 605', 'Đường tránh Đà Nẵng'],
  'Hội An': ['Trần Hưng Đạo', 'Hai Bà Trưng', 'Cửa Đại', 'Lạc Long Quân', 'Nguyễn Duy Hiệu', 'Trần Phú'],
};

const cameraTypes = ['PTZ', 'Fixed', 'Dome'] as const;
const resolutions = ['4K', '2K', '1080p'] as const;

const random = createRandom(12345); // Fixed seed

export const cameras: Camera[] = [];

let camIndex = 1;

zonesInfo.forEach(zone => {
  for (let i = 0; i < zone.count; i++) {
    const angle = random() * Math.PI * 2;
    const r = random() * zone.radius;
    const lng = zone.center[0] + Math.cos(angle) * r;
    const lat = zone.center[1] + Math.sin(angle) * r;

    const streets = streetsByZone[zone.name] || ['Đường chính'];
    const street = streets[Math.floor(random() * streets.length)];
    const num = Math.floor(random() * 150) + 1;
    const type = cameraTypes[Math.floor(random() * cameraTypes.length)];
    const resolution = resolutions[Math.floor(random() * resolutions.length)];

    // 70% online, 15% offline, 15% maintenance
    const randStatus = random();
    const status = randStatus < 0.7 ? 'online' : randStatus < 0.85 ? 'offline' : 'maintenance';

    const id = `CAM-${String(camIndex).padStart(3, '0')}`;
    const name = `Camera ${street} - Số ${num}`;
    
    // Generate ISO timestamp within past 24 hours
    const hoursAgo = Math.floor(random() * 24);
    const minsAgo = Math.floor(random() * 60);
    const date = new Date(Date.now() - (hoursAgo * 60 + minsAgo) * 60000);
    const lastSeen = date.toISOString();

    // Setup public stream URLs for online cameras (both MP4 loops and HLS .m3u8 streams)
    const publicStreams = [
      'https://assets.mixkit.co/videos/preview/mixkit-traffic-in-a-large-city-street-during-the-day-34351-large.mp4',
      'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
      'https://assets.mixkit.co/videos/preview/mixkit-night-traffic-in-a-modern-city-43063-large.mp4',
      'https://ntv1.akamaized.net/hls/live/2014075/NASA-NTV1-HLS/master.m3u8',
      'https://assets.mixkit.co/videos/preview/mixkit-subway-train-arriving-at-the-station-43093-large.mp4',
      'https://assets.mixkit.co/videos/preview/mixkit-security-camera-footage-of-a-street-at-night-42289-large.mp4',
    ];
    const streamUrl = status === 'online' ? publicStreams[camIndex % publicStreams.length] : undefined;

    cameras.push({
      id,
      name,
      lng,
      lat,
      status,
      zone: zone.name,
      type,
      lastSeen,
      resolution,
      area: `${street}, Q. ${zone.name}, Đà Nẵng`,
      streamUrl,
    });

    camIndex++;
  }
});

export const camerasGeoJSON = {
  type: 'FeatureCollection',
  features: cameras.map(cam => ({
    type: 'Feature',
    properties: { ...cam },
    geometry: {
      type: 'Point',
      coordinates: [cam.lng, cam.lat]
    }
  }))
};

export function generateInitialCameras(): Camera[] {
  return cameras.map(cam => ({ ...cam }));
}
