// Types for The Fourth Lobby

export type UserRole = 'customer' | 'promoter' | 'organizer';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  avatar?: string;
}

export interface Artist {
  id: string;
  name: string;
  genre: string;
  bio?: string;
  image_url?: string;
}

export interface TicketType {
  id: string;
  event_id: string;
  name: string;
  price: number;
  total_quantity: number;
  sold_quantity: number;
  start_date: string;
  end_date: string;
}

export interface Event {
  id: string;
  organizer_id: string;
  name: string;
  slug?: string;
  date: string;
  location: string;
  image_url: string;
  description: string;
  capacity: number;
  status: 'draft' | 'published' | 'live' | 'finished' | 'cancelled';
  artists?: Artist[];
  ticket_types?: TicketType[];
}

export interface Ticket {
  id: string;
  user_id: string;
  event_id: string;
  ticket_type_id: string;
  order_id: string;
  price_paid: number;
  status: 'valid' | 'used' | 'cancelled';
  qr_code: string;
  purchased_at: string;
  
  // Joined fields for UI
  events?: Event;
  ticket_types?: TicketType;
}

export interface PromoterStats {
  activeEvents: number;
  totalSales: number;
  revenue: number;
  occupancy: number;
}

export interface OrganizerStats {
  totalEvents: number;
  ticketsSold: number;
  revenue: number;
  capacity: number;
}
