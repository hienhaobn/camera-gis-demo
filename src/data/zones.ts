export interface ZoneProperties {
  name: string;
  color: string;
  cameraCount: number;
  priority: 'high' | 'medium' | 'low';
}

export const zones = {
  type: 'FeatureCollection' as const,
  features: [
    {
      type: 'Feature',
      properties: {
        name: 'Khu vực Hải Châu',
        color: '#00d4ff', // Cyan
        cameraCount: 50,
        priority: 'high'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [108.20, 16.08],
          [108.24, 16.08],
          [108.24, 16.03],
          [108.20, 16.03],
          [108.20, 16.08]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: {
        name: 'Khu vực Sơn Trà',
        color: '#a855f7', // Violet/Purple
        cameraCount: 35,
        priority: 'medium'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [108.23, 16.13],
          [108.29, 16.13],
          [108.29, 16.06],
          [108.22, 16.06],
          [108.23, 16.13]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: {
        name: 'Khu vực Ngũ Hành Sơn',
        color: '#3b82f6', // Blue
        cameraCount: 25,
        priority: 'medium'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [108.23, 16.03],
          [108.28, 16.03],
          [108.29, 15.95],
          [108.23, 15.95],
          [108.23, 16.03]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: {
        name: 'Khu vực Liên Chiểu',
        color: '#eab308', // Amber/Yellow
        cameraCount: 20,
        priority: 'medium'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [108.11, 16.12],
          [108.17, 16.08],
          [108.17, 16.04],
          [108.11, 16.04],
          [108.11, 16.12]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: {
        name: 'Khu vực Cẩm Lệ',
        color: '#10b981', // Emerald/Green
        cameraCount: 15,
        priority: 'low'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [108.17, 16.03],
          [108.23, 16.03],
          [108.23, 15.98],
          [108.17, 15.98],
          [108.17, 16.03]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: {
        name: 'Khu vực Hội An',
        color: '#f43f5e', // Rose/Red
        cameraCount: 15,
        priority: 'high'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [108.30, 15.91],
          [108.36, 15.91],
          [108.36, 15.85],
          [108.30, 15.85],
          [108.30, 15.91]
        ]]
      }
    }
  ]
};
