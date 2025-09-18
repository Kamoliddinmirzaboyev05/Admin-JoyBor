export interface AttendanceStudent {
  id: number;
  student: {
    id: number;
    name: string;
    last_name: string;
  };
}

export interface AttendanceRoom {
  room_id: number;
  room_name: string;
  students: AttendanceStudent[];
}

export interface AttendanceFloor {
  id: number;
  name: string;
}

export interface AttendanceLeader {
  id: number;
  floor: string;
  user: string;
}

export interface AttendanceSession {
  id: number;
  date: string;
  floor: AttendanceFloor[];
  leader: AttendanceLeader;
  rooms: AttendanceRoom[];
}

export interface AttendanceSessionResponse {
  sessions: AttendanceSession[];
  total_count: number;
  page: number;
  page_size: number;
}