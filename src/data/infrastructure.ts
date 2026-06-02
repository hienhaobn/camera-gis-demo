export interface ControlCenter {
  id: string;
  name: string;
  lng: number;
  lat: number;
  type: 'primary' | 'secondary';
  phone: string;
}

export interface Checkpoint {
  id: string;
  name: string;
  lng: number;
  lat: number;
  status: 'active' | 'inactive';
}

export interface RestrictedArea {
  id: string;
  name: string;
  level: 'restricted' | 'forbidden';
  coordinates: [number, number][][];
}

export interface FiberRoute {
  id: string;
  name: string;
  coordinates: [number, number][];
}

export const controlCenters: ControlCenter[] = [
  { id: 'CC-01', name: 'Trung tâm Chỉ huy Hải Châu', lng: 108.2201, lat: 16.0594, type: 'primary', phone: '0236.3822301' },
  { id: 'CC-02', name: 'Trung tâm Giám sát Sơn Trà', lng: 108.2435, lat: 16.0841, type: 'secondary', phone: '0236.3844002' },
  { id: 'CC-03', name: 'Trạm Điều phối Ngũ Hành Sơn', lng: 108.2612, lat: 16.0124, type: 'secondary', phone: '0236.3861003' },
];

export const checkpoints: Checkpoint[] = [
  { id: 'CP-01', name: 'Chốt Cầu Rồng (Đông)', lng: 108.2322, lat: 16.0612, status: 'active' },
  { id: 'CP-02', name: 'Chốt Cầu Rồng (Tây)', lng: 108.2215, lat: 16.0609, status: 'active' },
  { id: 'CP-03', name: 'Chốt Cầu Sông Hàn (Tây)', lng: 108.2235, lat: 16.0722, status: 'active' },
  { id: 'CP-04', name: 'Chốt Cầu Sông Hàn (Đông)', lng: 108.2312, lat: 16.0725, status: 'active' },
  { id: 'CP-05', name: 'Chốt Cầu Thuận Phước', lng: 108.2205, lat: 16.0965, status: 'active' },
  { id: 'CP-06', name: 'Chốt Ngã Tư Lê Duẩn - Trần Phú', lng: 108.2229, lat: 16.0682, status: 'active' },
  { id: 'CP-07', name: 'Chốt Nút Giao Nguyễn Văn Linh', lng: 108.2198, lat: 16.0589, status: 'active' },
  { id: 'CP-08', name: 'Chốt Cầu Nguyễn Văn Trỗi', lng: 108.2255, lat: 16.0505, status: 'active' },
  { id: 'CP-09', name: 'Chốt Cầu Tuyên Sơn', lng: 108.2355, lat: 16.0289, status: 'active' },
  { id: 'CP-10', name: 'Chốt Sân Bay Đà Nẵng', lng: 108.2045, lat: 16.0562, status: 'active' },
];

export const restrictedAreas: RestrictedArea[] = [
  {
    id: 'RA-01',
    name: 'Khu vực Sân bay Quân sự',
    level: 'forbidden',
    coordinates: [[
      [108.188, 16.063],
      [108.208, 16.063],
      [108.208, 16.035],
      [108.188, 16.035],
      [108.188, 16.063]
    ]]
  },
  {
    id: 'RA-02',
    name: 'Khu vực Cảng Tiên Sa (Quân sự)',
    level: 'restricted',
    coordinates: [[
      [108.208, 16.126],
      [108.220, 16.126],
      [108.220, 16.115],
      [108.208, 16.115],
      [108.208, 16.126]
    ]]
  }
];

export const fiberRoutes: FiberRoute[] = [
  {
    id: 'FR-01',
    name: 'Tuyến cáp Bạch Đằng - Nguyễn Tất Thành',
    coordinates: [
      [108.2241, 16.0465],
      [108.2238, 16.0612],
      [108.2229, 16.0722],
      [108.2225, 16.0825],
      [108.2105, 16.0855],
      [108.1802, 16.0755],
      [108.1501, 16.0768]
    ]
  },
  {
    id: 'FR-02',
    name: 'Tuyến cáp Ngô Quyền - Trường Sa',
    coordinates: [
      [108.2325, 16.0965],
      [108.2328, 16.0725],
      [108.2331, 16.0612],
      [108.2435, 16.0325],
      [108.2612, 16.0124],
      [108.2815, 15.9555]
    ]
  }
];
