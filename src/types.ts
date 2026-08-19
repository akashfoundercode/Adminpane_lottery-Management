export interface Game {
  id: string;
  name: string;
  gameCode: string;
  ticketPrice: number;
  bookSize: number;
  totalBooks: number;
  drawDate: string;
  drawTime: string;
  startDate: string;
  endDate: string;
  status: 'Upcoming' | 'Live' | 'Completed' | 'Cancelled';
  description?: string;
  image?: string;
  imageFile?: any;
  youtubeLiveUrl?: string;
  facebookLiveUrl?: string;
}

export interface Agent {
  id: string; // Same as agentId
  name: string;
  agentId: string;
  email: string;
  mobile: string;
  whatsapp?: string;
  address: string;
  agentType: 'First Party' | 'Third Party';
  status: 'Active' | 'Inactive';
}

export interface Book {
  id: string; // Book ID, e.g. BK1001
  gameId: string;
  gameName?: string;
  agentId: string;
  agentName?: string;
  tickets: string[]; // List of ticket numbers in this book
  bookValue: number;
  bookNumber?: string;
  serialNumber?: string;
  totalTickets?: number;
  soldTickets?: number;
  unsoldTickets?: number;
  assignedDate: string;
  expiryDate: string;
  createdDate?: string;
  status: 'Available' | 'Assigned' | 'In Progress' | 'Sold' | 'Unsold' | 'Unsold by Admin';
}

export interface Ticket {
  id: string; // Combined bookId + ticketNumber
  bookId: string;
  ticketNumber: string;
  status: 'Available' | 'Sold' | 'Winning';
}

export interface Winning {
  ticketNumber: string;
  bookId: string;
  game: string;
  agentId: string;
  agentType: 'First Party' | 'Third Party';
  prize: string;
  prizeValue: number;
  winner: string;
  claimStatus: 'Pending' | 'Claimed' | 'Rejected';
}

export interface Prize {
  id: string;
  position: string; // e.g. "1st Prize", "2nd Prize"
  name: string;
  amount: number;
  image?: string;
  winnersCount: number;
  status: 'Active' | 'Inactive';
}

export interface Result {
  id: string;
  gameId: string;
  gameName: string;
  drawDate: string;
  image: string;
  imageFile?: File;
  title?: string;
  status: 'Draft' | 'Published';
  publishedDate?: string;
}

export interface AssignmentHistory {
  id: string;
  bookId: string;
  gameName: string;
  agentName: string;
  agentType: 'First Party' | 'Third Party';
  assignedDate: string;
  expiryDate: string;
  status: string;
}
