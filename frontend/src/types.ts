export interface User {
  id: number;
  email: string;
  name: string;
  role: 'resident' | 'admin';
}

export interface Facility {
  id: number;
  name: string;
  description: string;
  capacity: number;
  image_url: string;
}

export interface Reservation {
  id: number;
  user_id: number;
  facility_id: number;

  date: string;
  start_time: string;
  end_time: string;

  status: 'pending' | 'approved' | 'rejected';
  purpose: string;
  created_at: string;
  user_name?: string;
  facility_name?: string;
}
