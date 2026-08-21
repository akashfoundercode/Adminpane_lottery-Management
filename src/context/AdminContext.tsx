import React, { createContext, useContext, useState, useEffect } from 'react';
import { Game, Agent, Book, Winning, Prize, Result, ResultPrize, AssignmentHistory, ListPagination } from '../types';


interface AdminContextType {
  // Auth
  isAdminAuthenticated: boolean;
  adminUser: { email: string; name: string; role: string } | null;
  adminLogin: (email: string, password: string) => Promise<boolean>;
  adminLogout: () => Promise<void>;

  // Data State
  games: Game[];
  books: Book[];
  agents: Agent[];
  winnings: Winning[];
  prizes: Prize[];
  results: Result[];
  assignmentHistory: AssignmentHistory[];
  booksTotal: number;
  ticketsTotal: number;
  booksPagination: ListPagination;
  gamesPagination: ListPagination;
  agentsPagination: ListPagination;
  assignmentHistoryPagination: ListPagination;
  resultsPagination: ListPagination;
  loadingGames: boolean;
  loadingBooks: boolean;
  loadingAgents: boolean;
  loadingHistory: boolean;
  loadingResults: boolean;

  fetchGames: (limit?: number, offset?: number, append?: boolean) => Promise<void>;
  fetchBooks: (limit?: number, page?: number, append?: boolean) => Promise<void>;
  fetchAgents: (limit?: number, offset?: number, append?: boolean) => Promise<void>;
  fetchAssignmentHistory: (limit?: number, offset?: number, append?: boolean, gameId?: string) => Promise<void>;
  fetchResults: (limit?: number, offset?: number, append?: boolean) => Promise<void>;
  fetchResult: (id: string) => Promise<Result | null>;
  createGame: (game: Omit<Game, 'id'>) => Promise<void>;
  updateGame: (id: string, updatedGame: Partial<Game>) => Promise<void>;
  deleteGame: (id: string) => void;
  toggleGameStatus: (id: string) => Promise<void>;

  generateBooks: (gameId: string, count: number, bookSize: number, ticketPrice: number) => { count: number; tickets: number; serialRange: string };
  importBooks: (gameId: string, file: File) => Promise<void>;
  assignBooks: (gameId: string, bookIds: string[], agentId: string, expiryDate: string) => Promise<void>;
  revokeAssignment: (bookId: string) => void;
  updateBookStatus: (bookId: string, status: 'Sold' | 'Unsold') => Promise<void>;

  createAgent: (agent: Omit<Agent, 'id' | 'agentId'> & { password: string }) => Promise<void>;
  updateAgent: (id: string, updatedAgent: Partial<Agent>) => void;
  toggleAgentStatus: (id: string) => void;

  createPrize: (prize: Omit<Prize, 'id'>) => void;
  updatePrize: (id: string, updatedPrize: Partial<Prize>) => void;
  deletePrize: (id: string) => void;
  togglePrizeStatus: (id: string) => void;

  createResult: (result: Omit<Result, 'id' | 'gameName' | 'status' | 'publishedDate'>, prizes?: any[]) => Promise<void>;
  updateResult: (id: string, updatedResult: Partial<Result>, prizes?: any[]) => Promise<void>;
  deleteResult: (id: string) => Promise<void>;
  publishResult: (id: string) => void;
  unpublishResult: (id: string) => void;
  toggleResultStatus: (id: string) => Promise<void>;
  restoreResult: (id: string) => Promise<void>;

  updateWinnerClaimStatus: (ticketNumber: string, bookId: string, claimStatus: 'Pending' | 'Claimed' | 'Rejected') => void;
  updateSettings: (settings: any) => void;
  resetSystem: () => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

const EMPTY_PAGINATION: ListPagination = {
  total: 0,
  perPage: 10,
  currentPage: 1,
  lastPage: 1,
  nextPageUrl: null,
  prevPageUrl: null,
  hasMore: false
};

const readPagination = (json: any, itemCount: number, limit: number, offset: number): ListPagination => {
  const meta = json?.data && !Array.isArray(json.data) ? json.data : json;
  const total = Number(meta?.total ?? meta?.total_count ?? meta?.total_items ?? offset + itemCount);
  const perPage = Number(meta?.per_page ?? meta?.perPage ?? limit);
  const currentPage = Number(meta?.current_page ?? Math.floor(offset / limit) + 1);
  const lastPage = Number(meta?.last_page ?? Math.max(Math.ceil(total / perPage), currentPage));
  const nextPageUrl = meta?.next_page_url ?? null;
  const prevPageUrl = meta?.prev_page_url ?? null;
  return {
    total,
    perPage,
    currentPage,
    lastPage,
    nextPageUrl,
    prevPageUrl,
    hasMore: nextPageUrl !== null ? Boolean(nextPageUrl) : currentPage < lastPage
  };
};

const toTitle = (value: string) =>
  value
    .replace(/\[[^\]]*\]/g, '')
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, char => char.toUpperCase());

const extractApiErrorMessage = (body: unknown, fallback = 'Something went wrong. Please try again.') => {
  let parsed = body;

  if (typeof body === 'string') {
    const trimmed = body.trim();
    if (!trimmed) return fallback;
    try {
      parsed = JSON.parse(trimmed);
    } catch {
      return trimmed.length > 180 ? `${trimmed.slice(0, 180)}...` : trimmed;
    }
  }

  if (parsed && typeof parsed === 'object') {
    const data = parsed as any;
    const errors = data.errors || data.error;
    if (errors && typeof errors === 'object' && !Array.isArray(errors)) {
      const firstKey = Object.keys(errors)[0];
      const firstValue = errors[firstKey];
      const firstMessage = Array.isArray(firstValue) ? firstValue[0] : firstValue;
      if (firstMessage) {
        const fieldName = toTitle(firstKey);
        return fieldName ? `${fieldName}: ${String(firstMessage)}` : String(firstMessage);
      }
    }

    if (Array.isArray(errors) && errors.length > 0) return String(errors[0]);
    if (data.message) return String(data.message);
  }

  return fallback;
};

const appendUnique = <T extends { id: string }>(current: T[], incoming: T[]) => {
  const byId = new Map(current.map(item => [item.id, item]));
  incoming.forEach(item => byId.set(item.id, item));
  return Array.from(byId.values());
};

const toNumber = (value: any, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

// Core Mock Data matching screen statistics
const INITIAL_GAMES: Game[] = [
  { id: 'GM001', name: 'Summer Lucky Draw', gameCode: 'SLD100', ticketPrice: 100, bookSize: 10, totalBooks: 200, drawDate: '2026-09-20', drawTime: '17:00', startDate: '2026-08-01', endDate: '2026-09-19', status: 'Live', description: 'Exciting summer special lucky draw with a bumper first prize.' },
  { id: 'GM002', name: 'Mega Bumper Draw', gameCode: 'MGD200', ticketPrice: 200, bookSize: 10, totalBooks: 300, drawDate: '2026-09-25', drawTime: '18:00', startDate: '2026-08-05', endDate: '2026-09-24', status: 'Upcoming', description: 'The grandest draw of the month with bumper rewards.' },
  { id: 'GM003', name: 'Diwali Special Draw', gameCode: 'DSD300', ticketPrice: 500, bookSize: 10, totalBooks: 250, drawDate: '2026-10-30', drawTime: '20:00', startDate: '2026-08-10', endDate: '2026-10-29', status: 'Upcoming', description: 'Celebrate Diwali with special chances of winning big.' },
  { id: 'GM004', name: 'Holiday Lucky Draw', gameCode: 'HLD400', ticketPrice: 150, bookSize: 10, totalBooks: 150, drawDate: '2026-08-10', drawTime: '16:00', startDate: '2026-07-10', endDate: '2026-08-09', status: 'Completed', description: 'Holiday draw held for agents and buyers.' },
  { id: 'GM005', name: 'New Year Bumper Draw', gameCode: 'NYD500', ticketPrice: 250, bookSize: 10, totalBooks: 350, drawDate: '2026-08-01', drawTime: '19:00', startDate: '2026-07-01', endDate: '2026-07-31', status: 'Completed', description: 'Annual bumper draw on the occasion of New Year.' },
  // Adding more dummy games to make 12 games in total (2 Live, 4 Upcoming, 6 Completed)
  { id: 'GM006', name: 'Monsoon Draw', gameCode: 'MSD600', ticketPrice: 100, bookSize: 10, totalBooks: 50, drawDate: '2026-08-05', drawTime: '15:00', startDate: '2026-07-05', endDate: '2026-08-04', status: 'Completed' },
  { id: 'GM007', name: 'Weekly Cash Blast', gameCode: 'WCB700', ticketPrice: 50, bookSize: 10, totalBooks: 50, drawDate: '2026-08-12', drawTime: '15:00', startDate: '2026-08-05', endDate: '2026-08-11', status: 'Completed' },
  { id: 'GM008', name: 'Super Sunday Draw', gameCode: 'SSD800', ticketPrice: 100, bookSize: 10, totalBooks: 50, drawDate: '2026-09-06', drawTime: '14:00', startDate: '2026-08-25', endDate: '2026-09-05', status: 'Upcoming' },
  { id: 'GM009', name: 'Friday Mega Raffle', gameCode: 'FMR900', ticketPrice: 150, bookSize: 10, totalBooks: 50, drawDate: '2026-09-11', drawTime: '21:00', startDate: '2026-09-01', endDate: '2026-09-10', status: 'Upcoming' },
  { id: 'GM010', name: 'Independence Day Bumper', gameCode: 'IDB010', ticketPrice: 200, bookSize: 10, totalBooks: 100, drawDate: '2026-08-30', drawTime: '12:00', startDate: '2026-08-01', endDate: '2026-08-29', status: 'Live' },
  { id: 'GM011', name: 'Ganesh Utsav Draw', gameCode: 'GUD011', ticketPrice: 300, bookSize: 10, totalBooks: 100, drawDate: '2026-08-15', drawTime: '18:00', startDate: '2026-07-15', endDate: '2026-08-14', status: 'Completed' },
  { id: 'GM012', name: 'Raksha Bandhan Draw', gameCode: 'RBD012', ticketPrice: 150, bookSize: 10, totalBooks: 100, drawDate: '2026-08-18', drawTime: '18:00', startDate: '2026-08-01', endDate: '2026-08-17', status: 'Completed' }
];

const INITIAL_AGENTS: Agent[] = [
  { id: 'AG1001', agentId: 'AG1001', name: 'Ramesh Kumar', email: 'ramesh@gmail.com', mobile: '+91 98765 43210', address: 'Patna, Bihar', agentType: 'First Party', status: 'Active' },
  { id: 'AG1002', agentId: 'AG1002', name: 'Suresh Singh', email: 'suresh@gmail.com', mobile: '+91 87654 32109', address: 'Ranchi, Jharkhand', agentType: 'First Party', status: 'Active' },
  { id: 'AG1003', agentId: 'AG1003', name: 'Amit Verma', email: 'amit@gmail.com', mobile: '+91 76543 21098', address: 'Lucknow, Uttar Pradesh', agentType: 'Third Party', status: 'Active' },
  { id: 'AG1004', agentId: 'AG1004', name: 'Vikash Gupta', email: 'vikash@gmail.com', mobile: '+91 65432 10987', address: 'Kolkata, West Bengal', agentType: 'First Party', status: 'Active' },
  { id: 'AG1005', agentId: 'AG1005', name: 'Pawan Kumar', email: 'pawan@gmail.com', mobile: '+91 54321 09876', address: 'New Delhi, Delhi', agentType: 'Third Party', status: 'Active' },
  // Adding more dummy agents to make it rich
  { id: 'AG1006', agentId: 'AG1006', name: 'Rohan Sharma', email: 'rohan@gmail.com', mobile: '+91 99999 88888', address: 'Mumbai, Maharashtra', agentType: 'First Party', status: 'Active' },
  { id: 'AG1007', agentId: 'AG1007', name: 'Karan Singh', email: 'karan@gmail.com', mobile: '+91 88888 77777', address: 'Jaipur, Rajasthan', agentType: 'Third Party', status: 'Inactive' }
];

const INITIAL_PRIZES: Prize[] = [
  { id: 'PR001', position: '1st Prize', name: 'Grand Bumper Cash', amount: 1000000, winnersCount: 1, status: 'Active' },
  { id: 'PR002', position: '2nd Prize', name: 'Super Cash Prize', amount: 500000, winnersCount: 2, status: 'Active' },
  { id: 'PR003', position: '3rd Prize', name: 'Mega Reward', amount: 200000, winnersCount: 5, status: 'Active' },
  { id: 'PR004', position: 'Consolation Prize', name: 'Assured Cash', amount: 10000, winnersCount: 100, status: 'Active' }
];

const INITIAL_RESULTS: Result[] = [
  { id: 'RS001', gameId: 'GM004', gameName: 'Holiday Lucky Draw', drawDate: '2026-08-10', image: 'https://images.unsplash.com/photo-1518655061766-48f23af9304a?w=400', status: 'Published', publishedDate: '2026-08-10T17:00:00.000Z' },
  { id: 'RS002', gameId: 'GM005', gameName: 'New Year Bumper Draw', drawDate: '2026-08-01', image: 'https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?w=400', status: 'Published', publishedDate: '2026-08-01T20:00:00.000Z' },
  { id: 'RS003', gameId: 'GM001', gameName: 'Summer Lucky Draw', drawDate: '2026-09-20', image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400', status: 'Draft' }
];

// Helper to seed exactly 1250 books mapping the required totals
// Sold: 850, Unsold: 150, Unsold by Admin (Expired): 80, Available: 170
const generateGlobalMockBooks = (games: Game[], agents: Agent[]): Book[] => {
  const books: Book[] = [];
  let ticketCounter = 10000;

  // Let's build a deterministic list of books
  // We distribute them across games
  // Let's create categories
  const targetCounts = {
    Sold: 850,
    Unsold: 150,
    'Unsold by Admin': 80,
    Available: 170
  };

  const statusList = Object.keys(targetCounts) as Array<keyof typeof targetCounts>;

  // To make loading snappier and not blow up localStorage, we can generate a small dense dataset of ~120 books,
  // but report the inflated mock numbers in statistics and charts.
  // Wait, let's seed exactly the detailed books for the active agents and games so lists work,
  // but also support generating real lists. To make lists responsive, we can generate ~150 books
  // and multiply counts or generate a dense subset.
  // Wait! Let's generate a list of 150-200 actual books in detail, and mock the remaining ones mathematically
  // OR we can generate all 1250 books. 1250 books with 10 tickets each is just 1250 objects.
  // Let's actually generate all 1250 books. It runs in a fraction of a millisecond and is fully searchable!
  // Let's do that!

  let idCounter = 1000;

  statusList.forEach(status => {
    const count = targetCounts[status];
    for (let i = 0; i < count; i++) {
      idCounter++;
      const bookId = `BK${idCounter}`;

      // Select game based on index to distribute
      // GM001 (Summer Lucky Draw - Live) - gets mostly Live/Sold/Available
      // GM002 (Mega Bumper - Upcoming) - gets mostly Available/Sold
      // GM003 (Diwali - Upcoming) - gets mostly Available
      // GM004/GM005 (Completed) - get Completed/Sold/Unsold
      let gameIdx = 0;
      if (status === 'Sold') {
        // Sold books distributed: 350 to GM005, 150 to GM004, 150 to GM001, 80 to GM002, 60 to GM003, 60 to others
        if (i < 320) gameIdx = 4; // GM005 (New Year Bumper)
        else if (i < 470) gameIdx = 3; // GM004 (Holiday Lucky Draw)
        else if (i < 620) gameIdx = 0; // GM001 (Summer Lucky Draw)
        else if (i < 700) gameIdx = 1; // GM002 (Mega Bumper)
        else if (i < 760) gameIdx = 2; // GM003 (Diwali Bumper)
        else gameIdx = 10; // GM011
      } else if (status === 'Unsold') {
        if (i < 60) gameIdx = 0;
        else if (i < 100) gameIdx = 1;
        else gameIdx = 2;
      } else if (status === 'Unsold by Admin') {
        if (i < 30) gameIdx = 0;
        else if (i < 50) gameIdx = 1;
        else gameIdx = 2;
      } else { // Available
        if (i < 50) gameIdx = 1;
        else if (i < 100) gameIdx = 2;
        else gameIdx = 7; // GM008 (Upcoming)
      }

      const game = games[gameIdx] || games[0];

      // Assign Agent (Ramesh, Suresh, Amit, Vikash, Pawan)
      // রমেশ কুমার gets most first party, etc.
      let agentIdx = -1;
      let agentId = '';
      let agentName = '';

      if (status !== 'Available') {
        // Distribute to agents:
        // Ramesh: 120 books, 110 sold, 10 unsold/expired
        // Suresh: 100 books, 95 sold, 5 unsold/expired
        // Amit: 80 books, 70 sold, 10 unsold/expired
        // Vikash: 90 books, 65 sold, 25 unsold/expired
        // Pawan: 70 books, 60 sold, 10 unsold/expired
        // Remaining to AG1006 / AG1007
        if (status === 'Sold') {
          if (i < 110) agentIdx = 0;
          else if (i < 205) agentIdx = 1;
          else if (i < 275) agentIdx = 2;
          else if (i < 340) agentIdx = 3;
          else if (i < 400) agentIdx = 4;
          else if (i < 700) agentIdx = 5; // Rohan
          else agentIdx = 0; // fallback Ramesh
        } else {
          // Unsold & Unsold by Admin
          if (i < 10) agentIdx = 0; // Ramesh
          else if (i < 15) agentIdx = 1; // Suresh
          else if (i < 25) agentIdx = 2; // Amit
          else if (i < 50) agentIdx = 3; // Vikash
          else if (i < 60) agentIdx = 4; // Pawan
          else agentIdx = 5;
        }
        const agent = agents[agentIdx] || agents[0];
        agentId = agent.id;
        agentName = agent.name;
      }

      const tickets: string[] = [];
      const size = game.bookSize || 10;
      for (let t = 0; t < size; t++) {
        ticketCounter++;
        tickets.push(String(ticketCounter));
      }

      books.push({
        id: bookId,
        gameId: game.id,
        gameName: game.name,
        agentId,
        agentName,
        tickets,
        bookValue: (game.ticketPrice || 100) * size,
        bookNumber: String(i + 1),
        serialNumber: `SN-${game.gameCode}-${String(i + 1).padStart(4, '0')}`,
        totalTickets: size,
        soldTickets: status === 'Sold' ? size : 0,
        unsoldTickets: status === 'Unsold' || status === 'Unsold by Admin' ? size : 0,
        assignedDate: status !== 'Available' ? '2026-08-05T10:00:00+05:30' : '',
        expiryDate: status !== 'Available' ? '2026-08-20T18:00:00+05:30' : '',
        createdDate: '2026-08-01T09:00:00+05:30',
        status
      });
    }
  });

  return books;
};

const INITIAL_WINNINGS: Winning[] = [
  { ticketNumber: '11005', bookId: 'BK1005', game: 'Summer Lucky Draw', agentId: 'AG1001', agentType: 'First Party', prize: '1st Prize', prizeValue: 1000000, winner: 'Rajesh Sharma', claimStatus: 'Pending' },
  { ticketNumber: '12108', bookId: 'BK1210', game: 'Mega Bumper Draw', agentId: 'AG1002', agentType: 'First Party', prize: '2nd Prize', prizeValue: 500000, winner: 'Sunita Patel', claimStatus: 'Claimed' },
  { ticketNumber: '13554', bookId: 'BK1355', game: 'Diwali Special Draw', agentId: 'AG1003', agentType: 'Third Party', prize: '3rd Prize', prizeValue: 200000, winner: 'Vinay Verma', claimStatus: 'Claimed' },
  { ticketNumber: '14102', bookId: 'BK1410', game: 'Holiday Lucky Draw', agentId: 'AG1004', agentType: 'First Party', prize: 'Consolation Prize', prizeValue: 10000, winner: 'Ramesh Singh', claimStatus: 'Pending' },
  { ticketNumber: '15099', bookId: 'BK1509', game: 'New Year Bumper Draw', agentId: 'AG1005', agentType: 'Third Party', prize: 'Consolation Prize', prizeValue: 10000, winner: 'Gopal Dutt', claimStatus: 'Rejected' }
];

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('admin_auth') === 'true';
  });

  const [adminUser, setAdminUser] = useState<any>(() => {
    const stored = localStorage.getItem('admin_profile');
    return stored ? JSON.parse(stored) : null;
  });

  const getFullImageUrl = (path: string | null | undefined): string => {
    if (!path) return 'https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?w=600';
    if (path.startsWith('http://') || path.startsWith('https://')) {
      try {
        const url = new URL(path);
        const isLocalBackend = ['localhost', '127.0.0.1'].includes(url.hostname);
        if (isLocalBackend && url.pathname.startsWith('/storage/')) {
          return url.pathname;
        }
      } catch {
        return path;
      }
      return path;
    }

    let cleanPath = path;
    if (cleanPath.startsWith('/')) {
      cleanPath = cleanPath.substring(1);
    }

    if (!cleanPath.startsWith('storage/')) {
      cleanPath = 'storage/' + cleanPath;
    }

    return '/' + cleanPath;
  };

  const [games, setGames] = useState<Game[]>([]);
  const gamesRef = React.useRef<Game[]>([]);
  useEffect(() => { gamesRef.current = games; }, [games]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [booksTotal, setBooksTotal] = useState(0);
  const [ticketsTotal, setTicketsTotal] = useState(0);
  const [booksPagination, setBooksPagination] = useState<ListPagination>(EMPTY_PAGINATION);
  const [gamesPagination, setGamesPagination] = useState<ListPagination>(EMPTY_PAGINATION);
  const [agentsPagination, setAgentsPagination] = useState<ListPagination>(EMPTY_PAGINATION);
  const [assignmentHistoryPagination, setAssignmentHistoryPagination] = useState<ListPagination>(EMPTY_PAGINATION);
  const [resultsPagination, setResultsPagination] = useState<ListPagination>(EMPTY_PAGINATION);
  const [loadingGames, setLoadingGames] = useState(false);
  const [loadingBooks, setLoadingBooks] = useState(false);
  const [loadingAgents, setLoadingAgents] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [loadingResults, setLoadingResults] = useState(false);

  const [winnings, setWinnings] = useState<Winning[]>(() => {
    const stored = localStorage.getItem('lucky_draw_winnings');
    return stored ? JSON.parse(stored) : INITIAL_WINNINGS;
  });

  const [prizes, setPrizes] = useState<Prize[]>(() => {
    const stored = localStorage.getItem('lucky_draw_prizes');
    return stored ? JSON.parse(stored) : INITIAL_PRIZES;
  });

  const [results, setResults] = useState<Result[]>(() => {
    const stored = localStorage.getItem('lucky_draw_results');
    return stored ? JSON.parse(stored) : INITIAL_RESULTS;
  });

  const [assignmentHistory, setAssignmentHistory] = useState<AssignmentHistory[]>(() => {
    const stored = localStorage.getItem('lucky_draw_assignment_history');
    if (stored) return JSON.parse(stored);

    // Seed initial assignment history based on the initial books that are assigned
    const history: AssignmentHistory[] = [];
    let counter = 1;
    // Just select a few assigned/sold books to populate the log
    const assignedBooks = generateGlobalMockBooks(INITIAL_GAMES, INITIAL_AGENTS).filter(b => b.status !== 'Available').slice(0, 10);
    assignedBooks.forEach(b => {
      history.push({
        id: `AH${String(counter++).padStart(3, '0')}`,
        bookId: b.id,
        gameName: b.gameName || 'Lucky Draw',
        agentName: b.agentName || 'Ramesh Kumar',
        agentType: b.id.includes('BK110') ? 'Third Party' : 'First Party',
        assignedDate: b.assignedDate || '2026-08-05T10:00:00+05:30',
        expiryDate: b.expiryDate || '2026-08-20T18:00:00+05:30',
        status: b.status
      });
    });
    return history;
  });

  // Sync state with localStorage
  useEffect(() => {
    localStorage.setItem('lucky_draw_games', JSON.stringify(games));
  }, [games]);

  useEffect(() => {
    localStorage.setItem('lucky_draw_agents', JSON.stringify(agents));
  }, [agents]);

  useEffect(() => {
    localStorage.setItem('lucky_draw_books', JSON.stringify(books));
  }, [books]);

  useEffect(() => {
    localStorage.setItem('lucky_draw_winnings', JSON.stringify(winnings));
  }, [winnings]);

  useEffect(() => {
    localStorage.setItem('lucky_draw_prizes', JSON.stringify(prizes));
  }, [prizes]);

  useEffect(() => {
    localStorage.setItem('lucky_draw_results', JSON.stringify(results));
  }, [results]);

  useEffect(() => {
    localStorage.setItem('lucky_draw_assignment_history', JSON.stringify(assignmentHistory));
  }, [assignmentHistory]);

  const fetchGames = async (limit = 10000, offset = 0, append = false) => {
    const token = localStorage.getItem('admin_token') || '3|bpXivPtgjfWxYkYX107oloDEn2EhL2RsZeYWYctTde478c0d';
    setLoadingGames(true);
    try {
      const response = await fetch(`/api/v1/admin/games?limit=${limit}&offset=${offset}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const json = await response.json();
        let rawGames: any[] = [];

        if (json.success && json.data) {
          if (Array.isArray(json.data.data)) {
            rawGames = json.data.data;
          } else if (Array.isArray(json.data)) {
            rawGames = json.data;
          }
        }

        if (json.success) {
          const mappedGames: Game[] = rawGames.map((g: any) => {
            let mappedStatus: Game['status'] = 'Upcoming';
            if (g.status === 'active') mappedStatus = 'Live';
            else if (g.status === 'completed') mappedStatus = 'Completed';
            else if (g.status === 'inactive') mappedStatus = 'Upcoming';
            else if (g.status === 'cancelled') mappedStatus = 'Cancelled';

            const cleanDate = g.draw_date ? g.draw_date.split('T')[0] : '2026-08-20';

            return {
              id: String(g.id),
              name: g.game_name || g.game_id || 'Unknown Game',
              gameCode: g.game_id || 'MLD001',
              ticketPrice: Number(g.ticket_price || 100),
              bookSize: Number(g.book_size || 10),
              totalBooks: Number(g.total_books || 0),
              drawDate: cleanDate,
              drawTime: g.draw_time || '20:00:00',
              startDate: g.created_at ? g.created_at.split('T')[0] : '2026-08-14',
              endDate: cleanDate,
              status: mappedStatus,
              description: g.youtube_live_url || '',
              image: getFullImageUrl(g.game_image),
              youtubeLiveUrl: g.youtube_live_url || '',
              facebookLiveUrl: g.facebook_live_url || ''
            };
          });
          setGames(prev => append ? appendUnique(prev, mappedGames) : mappedGames);
          setGamesPagination(readPagination(json, mappedGames.length, limit, offset));
        }
      }
    } catch (err) {
      console.error('API Error fetching games:', err);
    } finally {
      setLoadingGames(false);
    }
  };

  const fetchBooks = async (limit = 50, page = 1, append = false) => {
    const token = localStorage.getItem('admin_token') || '3|bpXivPtgjfWxYkYX107oloDEn2EhL2RsZeYWYctTde478c0d';
    setLoadingBooks(true);
    try {
      const response = await fetch(`/api/v1/admin/books?page=${page}&limit=${limit}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const json = await response.json();
        let rawBooks: any[] = [];

        if (json.success && json.data) {
          if (Array.isArray(json.data.data)) {
            rawBooks = json.data.data;
          } else if (Array.isArray(json.data)) {
            rawBooks = json.data;
          }
        }

        const pg = json.pagination ?? (json.data && !Array.isArray(json.data) ? json.data : json);
        const total = Number(pg.total ?? 0);
        const lastPage = Number(pg.last_page ?? 1);
        const currentPage = Number(pg.current_page ?? page);
        const hasMore = Boolean(pg.has_more ?? (currentPage < lastPage));

        setBooksTotal(total);
        const bookSize = Number(rawBooks[0]?.game?.book_size ?? rawBooks[0]?.total_tickets ?? 10);
        setTicketsTotal(total * bookSize);
        setBooksPagination({
          total,
          perPage: limit,
          currentPage,
          lastPage,
          nextPageUrl: hasMore ? String(currentPage + 1) : null,
          prevPageUrl: currentPage > 1 ? String(currentPage - 1) : null,
          hasMore
        });

        if (json.success) {
          const mappedBooks: Book[] = rawBooks.map((b: any) => {
            let mappedStatus: Book['status'] = 'Available';
            const apiStatus = String(b.status).toLowerCase();
            if (apiStatus === 'assigned') mappedStatus = 'Assigned';
            else if (apiStatus === 'in progress') mappedStatus = 'In Progress';
            else if (apiStatus === 'sold') mappedStatus = 'Sold';
            else if (apiStatus === 'unsold') mappedStatus = 'Unsold';
            else if (apiStatus === 'unsold by admin') mappedStatus = 'Unsold by Admin';

            const gameName = b.game?.game_name
              || gamesRef.current.find(g => g.id === String(b.game_id))?.name
              || b.game?.game_id
              || 'Unknown Game';
            const bookName = b.book_name || b.name || b.book?.book_name || b.book_id || `BK${b.id}`;
            const ticketCount = Number(b.game?.book_size || b.total_tickets || 10);

            const tickets: string[] = [];
            for (let i = 0; i < ticketCount; i++) {
              tickets.push(String(50000 + (b.id * ticketCount) + i));
            }

            return {
              id: b.book_id || `BK${b.id}`,
              apiId: Number(b.id),
              gameId: String(b.game_id),
              gameName: gameName,
              bookName: bookName,
              agentId: b.agent_id ? String(b.agent_id) : '',
              agentName: b.agent?.agent_name || b.agent_name || '',
              tickets: tickets,
              bookValue: ticketCount * 100,
              bookNumber: String(b.id),
              serialNumber: `SN-${b.book_id || b.id}`,
              totalTickets: ticketCount,
              soldTickets: b.sold_tickets || 0,
              unsoldTickets: b.unsold_tickets || 0,
              assignedDate: b.assigned_at || '',
              expiryDate: b.expiry_at || '',
              createdDate: b.created_at || new Date().toISOString(),
              soldDate: b.sold_at || b.sold_date || '',
              unsoldDate: b.unsold_at || b.unsold_date || '',
              expiredDate: b.expired_at || b.expired_date || '',
              status: mappedStatus
            };
          });
          setBooks(prev => append ? appendUnique(prev, mappedBooks) : mappedBooks);
        }
      }
    } catch (err) {
      console.error('API Error fetching books:', err);
    } finally {
      setLoadingBooks(false);
    }
  };

  const fetchAgents = async (limit = 10000, offset = 0, append = false) => {
    const token = localStorage.getItem('admin_token') || '3|bpXivPtgjfWxYkYX107oloDEn2EhL2RsZeYWYctTde478c0d';
    setLoadingAgents(true);
    try {
      const response = await fetch(`/api/v1/admin/agents?limit=${limit}&offset=${offset}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const json = await response.json();
        let rawAgents: any[] = [];

        if (json.success && json.data) {
          if (Array.isArray(json.data.data)) {
            rawAgents = json.data.data;
          } else if (Array.isArray(json.data)) {
            rawAgents = json.data;
          }
        }

        if (json.success) {
          const mappedAgents: Agent[] = rawAgents.map((a: any) => {
            const mappedType: Agent['agentType'] = a.agent_type === 'first_party' ? 'First Party' : 'Third Party';
            const mappedStatus: Agent['status'] = a.status === 'active' ? 'Active' : 'Inactive';
            return {
              id: String(a.id),
              agentId: a.agent_id || `AG${a.id}`,
              name: a.agent_name || 'Agent User',
              email: a.email || '',
              mobile: a.mobile_number || '',
              whatsapp: a.whatsapp_number || '',
              address: a.address || '',
              agentType: mappedType,
              status: mappedStatus
            };
          });
          setAgents(prev => append ? appendUnique(prev, mappedAgents) : mappedAgents);
          setAgentsPagination(readPagination(json, mappedAgents.length, limit, offset));
        }
      }
    } catch (err) {
      console.error('API Error fetching agents:', err);
    } finally {
      setLoadingAgents(false);
    }
  };

  const fetchAssignmentHistory = async (limit = 10000, offset = 0, append = false, gameId?: string) => {
    const token = localStorage.getItem('admin_token') || '3|bpXivPtgjfWxYkYX107oloDEn2EhL2RsZeYWYctTde478c0d';
    setLoadingHistory(true);
    try {
      const gameParam = gameId ? `&game_id=${gameId}` : '';
      const response = await fetch(`/api/v1/admin/book-assignments/history?limit=${limit}&offset=${offset}${gameParam}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const json = await response.json();
        let rawHistory: any[] = [];

        if (json.success && json.data) {
          if (Array.isArray(json.data.data)) {
            rawHistory = json.data.data;
          } else if (Array.isArray(json.data)) {
            rawHistory = json.data;
          }
        }

        if (json.success) {
          const mappedHistory: AssignmentHistory[] = rawHistory.map((h: any) => {
            const bookCode = h.book?.book_id || h.book_id || String(h.book_id || '');
            const bookName = h.book?.book_name || h.book?.name || h.book_name || bookCode;
            const gameName = h.game?.game_name
              || h.book?.game?.game_name
              || gamesRef.current.find(g => g.id === String(h.game_id || h.book?.game_id))?.name
              || h.game?.game_id
              || h.book?.game?.game_id
              || 'Unknown Game';
            const agentName = h.agent?.agent_name || h.agent_name || 'Agent User';
            const agentId = h.agent?.agent_id || h.agent_id || '';
            const agentType = (h.agent?.agent_type || h.agent_type) === 'first_party' ? 'First Party' : 'Third Party';

            let mappedStatus = 'Assigned';
            const apiStatus = String(h.status || '').toLowerCase();
            if (apiStatus === 'assigned' || apiStatus === 'active') mappedStatus = 'Assigned';
            else if (apiStatus === 'sold') mappedStatus = 'Sold';
            else if (apiStatus === 'unsold') mappedStatus = 'Unsold';
            else if (apiStatus === 'unassigned' || apiStatus === 'revoked') mappedStatus = 'Unassigned';
            else if (apiStatus === 'unsold by admin' || apiStatus === 'expired') mappedStatus = 'Unsold by Admin';

            return {
              id: String(h.id),
              bookId: bookCode,
              bookName,
              gameName: gameName,
              agentName: agentName,
              agentId: String(agentId),
              agentType: agentType as any,
              assignedDate: h.assigned_at || h.assigned_date || h.created_at || '',
              expiryDate: h.expiry_at || h.expiry_date || '',
              status: mappedStatus
            };
          });
          setAssignmentHistory(prev => append ? appendUnique(prev, mappedHistory) : mappedHistory);
          setAssignmentHistoryPagination(readPagination(json, mappedHistory.length, limit, offset));
        }
      }
    } catch (err) {
      console.error('API Error fetching assignment history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const getRawResultPrizes = (result: any): any[] => {
    if (result.book_winner_prizes || result.ticket_winner_prizes) {
      return [];
    }
    return result.prizes || result.result_prizes || result.resultPrizes || [];
  };

  const normalizePrizeType = (value: any): ResultPrize['prize_type'] => {
    const type = String(value || '').toLowerCase();
    if (type === 'book_winner' || type === 'book' || type === 'book_winner_prize') return 'book_winner';
    if (type === 'ticket_winner' || type === 'ticket' || type === 'ticket_winner_prize') return 'ticket_winner';
    return undefined;
  };

  const getPrizeImagePath = (p: any): string | undefined =>
    p.prize_image_url
    || p.prize_image
    || p.prize_image_path
    || p.image_url
    || p.image_path
    || p.image
    || p.media?.url
    || p.file?.url;

  const mapResultPrizes = (raw: any[] = []): ResultPrize[] =>
    raw
      .filter(Boolean)
      .map((p: any, index: number) => {
        const prizeType = normalizePrizeType(p.prize_type ?? p.type ?? p.winner_type);
        return {
          id: p.id !== undefined && p.id !== null ? String(p.id) : undefined,
          rank: toNumber(p.rank ?? p.position ?? index + 1, index + 1),
          prize_type: prizeType,
          prize_name: p.prize_name || p.name || p.title || p.book_prize_name || p.ticket_prize_name || '',
          book_prize_name: p.book_prize_name,
          ticket_prize_name: p.ticket_prize_name,
          book_prize_amount: prizeType === 'book_winner' ? toNumber(p.prize_amount ?? p.book_prize_amount) : toNumber(p.book_prize_amount),
          ticket_prize_amount: prizeType === 'ticket_winner' ? toNumber(p.prize_amount ?? p.ticket_prize_amount) : toNumber(p.ticket_prize_amount),
          prize_image: getPrizeImagePath(p) ? getFullImageUrl(getPrizeImagePath(p)) : undefined,
          total_books_sold: toNumber(p.total_books_sold ?? p.books_sold),
          total_tickets: toNumber(p.total_tickets ?? p.tickets_count),
          book_price: toNumber(p.book_price),
          ticket_price: toNumber(p.ticket_price),
        };
      });

  const mapResult = (r: any): Result => ({
    id: String(r.id),
    gameId: String(r.game_id ?? r.game?.id ?? ''),
    gameName: r.game?.game_name || r.game_name || r.game?.name || r.title || 'Lucky Draw Result',
    drawDate: r.result_date || r.draw_date || r.date || '',
    image: getFullImageUrl(r.result_image || r.image),
    title: r.title || '',
    status: r.status === 'active' || r.status === 'published' ? 'Published' : 'Draft',
    publishedDate: r.created_at || '',
    updatedAt: r.updated_at || '',
    deletedAt: r.deleted_at || undefined,
    prizes: (() => {
      const raw: any[] = r.book_winner_prizes || r.ticket_winner_prizes
        ? [
            ...(r.book_winner_prizes || []).map((p: any) => ({ ...p, prize_type: 'book_winner' })),
            ...(r.ticket_winner_prizes || []).map((p: any) => ({ ...p, prize_type: 'ticket_winner' }))
          ]
        : getRawResultPrizes(r);
      return mapResultPrizes(raw);
    })(),
  });

  const getResultPayload = (json: any): any => {
    if (json?.data?.data && !Array.isArray(json.data.data)) return json.data.data;
    if (json?.data && !Array.isArray(json.data)) return json.data;
    return json;
  };

  const fetchResults = async (limit = 10000, offset = 0, append = false) => {
    const token = localStorage.getItem('admin_token') || '3|bpXivPtgjfWxYkYX107oloDEn2EhL2RsZeYWYctTde478c0d';
    setLoadingResults(true);
    try {
      const response = await fetch(`/api/v1/admin/results?limit=${limit}&offset=${offset}`, {
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const json = await response.json();
        let rawResults: any[] = [];
        if ((json.success ?? true) && json.data) {
          if (Array.isArray(json.data.data)) rawResults = json.data.data;
          else if (Array.isArray(json.data)) rawResults = json.data;
          else if (Array.isArray(json.data.results)) rawResults = json.data.results;
        } else if (Array.isArray(json.results)) {
          rawResults = json.results;
        } else if (Array.isArray(json)) {
          rawResults = json;
        }
        if (json.success ?? true) {
          const mappedResults: Result[] = rawResults.map(mapResult);
          setResults(prev => append ? appendUnique(prev, mappedResults) : mappedResults);
          setResultsPagination(readPagination(json, mappedResults.length, limit, offset));
        }
      }
    } catch (err) {
      console.error('API Error fetching results:', err);
    } finally {
      setLoadingResults(false);
    }
  };

  const fetchResult = async (id: string): Promise<Result | null> => {
    const token = localStorage.getItem('admin_token') || '3|bpXivPtgjfWxYkYX107oloDEn2EhL2RsZeYWYctTde478c0d';
    const response = await fetch(`/api/v1/admin/results/${id}`, {
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
    });

    let json: any = null;
    try {
      json = await response.json();
    } catch {
      // Empty API responses are handled by the ok check below.
    }

    if (!response.ok || json?.success === false) {
      throw new Error(json?.message || 'Failed to fetch result details.');
    }

    const rawResult = getResultPayload(json);
    if (!rawResult || Array.isArray(rawResult)) return null;
    const mapped = mapResult(rawResult);
    setResults(prev => appendUnique(prev, [mapped]));
    return mapped;
  };

  // Fetch games, books, agents, assignment history and results automatically when admin becomes authenticated
  useEffect(() => {
    if (isAdminAuthenticated) {
      fetchGames();
      fetchBooks(50, 1, false);
      fetchAgents();
      fetchAssignmentHistory();
      fetchResults();
    }
  }, [isAdminAuthenticated]);

  const adminLogin = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/v1/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        throw new Error('Invalid email or password. Please try again.');
      }

      const data = await response.json();

      // Parse token from potential response schemas
      const receivedToken = data.token ||
        data.access_token ||
        (data.data && (data.data.token || data.data.access_token)) ||
        '3|bpXivPtgjfWxYkYX107oloDEn2EhL2RsZeYWYctTde478c0d'; // fallback to user token

      // Extract details
      const adminName = (data.admin && data.admin.name) || (data.data && data.data.name) || 'Admin User';
      const role = (data.admin && data.admin.role) || (data.data && data.data.role) || 'Super Admin';
      const profile = { email, name: adminName, role };

      setIsAdminAuthenticated(true);
      setAdminUser(profile);

      localStorage.setItem('admin_auth', 'true');
      localStorage.setItem('admin_profile', JSON.stringify(profile));
      localStorage.setItem('admin_token', receivedToken);

      return true;
    } catch (err: any) {
      console.error('API Error in adminLogin:', err);
      throw new Error(err.message || 'API connection failed. Please check if backend server is running.');
    }
  };

  const adminLogout = async () => {
    const token = localStorage.getItem('admin_token');
    try {
      if (token) {
        await fetch('/api/v1/admin/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
      }
    } catch (err) {
      console.error('API Error in adminLogout:', err);
    } finally {
      setIsAdminAuthenticated(false);
      setAdminUser(null);
      localStorage.removeItem('admin_auth');
      localStorage.removeItem('admin_profile');
      localStorage.removeItem('admin_token');
    }
  };

  // Game Mutators
  const createGame = async (gameData: Omit<Game, 'id'>) => {
    const token = localStorage.getItem('admin_token') || '3|bpXivPtgjfWxYkYX107oloDEn2EhL2RsZeYWYctTde478c0d';
    const apiStatus = gameData.status === 'Live' ? 'active' : 'inactive';

    let formattedTime = gameData.drawTime;
    if (formattedTime && formattedTime.split(':').length === 2) {
      formattedTime += ':00';
    }

    try {
      // If there is a raw file uploaded, send via multipart/form-data (FormData)
      if (gameData.imageFile) {
        const formData = new FormData();
        formData.append('game_name', gameData.name);
        formData.append('game_id', gameData.gameCode);
        formData.append('game_image', gameData.imageFile); // Raw File object
        formData.append('ticket_price', String(gameData.ticketPrice));
        formData.append('book_size', String(gameData.bookSize));
        formData.append('total_books', String(Math.max(1, gameData.totalBooks || 0)));
        formData.append('draw_date', gameData.drawDate);
        formData.append('draw_time', formattedTime || '18:00:00');
        formData.append('youtube_live_url', gameData.youtubeLiveUrl || 'https://youtube.com/live/demo');
        formData.append('facebook_live_url', gameData.facebookLiveUrl || 'https://facebook.com/live/demo');
        formData.append('status', apiStatus);

        const response = await fetch('/api/v1/admin/games', {
          method: 'POST',
          headers: {
            // Note: DO NOT set 'Content-Type' header here, browser sets it automatically with correct boundary
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || 'Server responded with an error during multipart image upload.');
        }

        await fetchGames();
        return;
      }

      // JSON Fallback
      const payload = {
        game_name: gameData.name,
        game_id: gameData.gameCode,
        game_image: 'game1.png',
        ticket_price: Number(gameData.ticketPrice),
        book_size: Number(gameData.bookSize),
        total_books: Math.max(1, Number(gameData.totalBooks || 0)),
        draw_date: gameData.drawDate,
        draw_time: formattedTime || '18:00:00',
        youtube_live_url: gameData.youtubeLiveUrl || 'https://youtube.com/live/demo',
        facebook_live_url: gameData.facebookLiveUrl || 'https://facebook.com/live/demo',
        status: apiStatus
      };

      const response = await fetch('/api/v1/admin/games', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Server responded with an error status.');
      }

      await fetchGames();
    } catch (err: any) {
      console.error('API Error in createGame:', err);
      throw new Error(err.message || 'API connection failed. Please check if server is running.');
    }
  };

  const updateGame = async (id: string, updatedGame: Partial<Game>): Promise<void> => {
    const token = localStorage.getItem('admin_token') || '';
    const apiStatus = updatedGame.status === 'Live' ? 'active' : updatedGame.status === 'Completed' ? 'completed' : 'inactive';

    let formattedTime = updatedGame.drawTime;
    if (formattedTime && formattedTime.split(':').length === 2) formattedTime += ':00';

    try {
      if (updatedGame.imageFile) {
        const formData = new FormData();
        if (updatedGame.name) formData.append('game_name', updatedGame.name);
        if (updatedGame.gameCode) formData.append('game_id', updatedGame.gameCode);
        formData.append('game_image', updatedGame.imageFile);
        if (updatedGame.ticketPrice) formData.append('ticket_price', String(updatedGame.ticketPrice));
        if (updatedGame.bookSize) formData.append('book_size', String(updatedGame.bookSize));
        if (updatedGame.drawDate) formData.append('draw_date', updatedGame.drawDate);
        formData.append('draw_time', formattedTime || '18:00:00');
        if (updatedGame.youtubeLiveUrl) formData.append('youtube_live_url', updatedGame.youtubeLiveUrl);
        if (updatedGame.facebookLiveUrl) formData.append('facebook_live_url', updatedGame.facebookLiveUrl);
        if (updatedGame.status) formData.append('status', apiStatus);
        formData.append('_method', 'PUT');

        const res = await fetch(`/api/v1/admin/games/${id}`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData
        });
        if (!res.ok) {
          const t = await res.text();
          try { const j = JSON.parse(t); throw new Error(j.message || t || 'Update failed.'); } catch { throw new Error(t || 'Update failed.'); }
        }
      } else {
        const payload: any = { draw_time: formattedTime || '18:00:00' };
        if (updatedGame.name !== undefined) payload.game_name = updatedGame.name;
        if (updatedGame.gameCode !== undefined) payload.game_id = updatedGame.gameCode;
        if (updatedGame.ticketPrice !== undefined) payload.ticket_price = Number(updatedGame.ticketPrice);
        if (updatedGame.bookSize !== undefined) payload.book_size = Number(updatedGame.bookSize);
        if (updatedGame.drawDate !== undefined) payload.draw_date = updatedGame.drawDate;
        if (updatedGame.youtubeLiveUrl !== undefined) payload.youtube_live_url = updatedGame.youtubeLiveUrl;
        if (updatedGame.facebookLiveUrl !== undefined) payload.facebook_live_url = updatedGame.facebookLiveUrl;
        if (updatedGame.status !== undefined) payload.status = apiStatus;

        const res = await fetch(`/api/v1/admin/games/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify(payload)
        });
        if (!res.ok) {
          const t = await res.text();
          try { const j = JSON.parse(t); throw new Error(j.message || t || 'Update failed.'); } catch { throw new Error(t || 'Update failed.'); }
        }
      }
      await fetchGames();
    } catch (err: any) {
      throw new Error(err.message || 'API connection failed.');
    }
  };

  const deleteGame = (id: string) => {
    setGames(prev => prev.filter(g => g.id !== id));
  };

  const toggleGameStatus = async (id: string) => {
    const game = games.find(g => g.id === id);
    if (!game) throw new Error('Game not found.');

    const nextStatus: Game['status'] = game.status === 'Live' ? 'Upcoming' : 'Live';

    setGames(prev => prev.map(g => g.id === id ? { ...g, status: nextStatus } : g));

    try {
      await updateGame(id, {
        name: game.name,
        gameCode: game.gameCode,
        ticketPrice: game.ticketPrice,
        bookSize: game.bookSize,
        drawDate: game.drawDate,
        drawTime: game.drawTime,
        startDate: game.startDate,
        endDate: game.endDate,
        status: nextStatus,
        youtubeLiveUrl: game.youtubeLiveUrl,
        facebookLiveUrl: game.facebookLiveUrl
      });
    } catch (err) {
      setGames(prev => prev.map(g => g.id === id ? { ...g, status: game.status } : g));
      throw err;
    }
  };

  // Book Generation
  const generateBooks = (gameId: string, count: number, bookSize: number, ticketPrice: number) => {
    const game = games.find(g => g.id === gameId);
    if (!game) throw new Error('Game not found');

    const generated: Book[] = [];
    let ticketCounter = 50000 + (books.length * bookSize);
    const startBookNumber = books.filter(b => b.gameId === gameId).length + 1;

    for (let i = 0; i < count; i++) {
      const bookNum = startBookNumber + i;
      const bookId = `BK${String(1000 + books.length + i + 1)}`;

      const tickets: string[] = [];
      for (let t = 0; t < bookSize; t++) {
        ticketCounter++;
        tickets.push(String(ticketCounter));
      }

      generated.push({
        id: bookId,
        gameId,
        gameName: game.name,
        agentId: '',
        agentName: '',
        tickets,
        bookValue: bookSize * ticketPrice,
        bookNumber: String(bookNum),
        serialNumber: `SN-${game.gameCode}-${String(bookNum).padStart(4, '0')}`,
        totalTickets: bookSize,
        soldTickets: 0,
        unsoldTickets: 0,
        assignedDate: '',
        expiryDate: '',
        createdDate: new Date().toISOString(),
        status: 'Available' as any
      });
    }

    setBooks(prev => [...prev, ...generated]);

    // Update game total books count
    setGames(prev => prev.map(g => g.id === gameId ? { ...g, totalBooks: (g.totalBooks || 0) + count } : g));

    return {
      count,
      tickets: count * bookSize,
      serialRange: `${generated[0].serialNumber} - ${generated[generated.length - 1].serialNumber}`
    };
  };

  const importBooks = async (gameId: string, file: File) => {
    const token = localStorage.getItem('admin_token') || '3|bpXivPtgjfWxYkYX107oloDEn2EhL2RsZeYWYctTde478c0d';
    const formData = new FormData();
    formData.append('game_id', gameId);
    formData.append('file', file);
    formData.append('import_file', file);
    formData.append('excel_file', file);
    formData.append('books_file', file);

    try {
      const response = await fetch('/api/v1/admin/books/import', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errMsg = 'Server responded with an error during book spreadsheet import.';
        try {
          const parsed = JSON.parse(errorText);
          if (parsed.message) {
            errMsg = parsed.message;
            if (parsed.errors) {
              const firstErrKey = Object.keys(parsed.errors)[0];
              const firstErrVal = parsed.errors[firstErrKey];
              if (Array.isArray(firstErrVal) && firstErrVal.length > 0) {
                errMsg += ` (${firstErrVal[0]})`;
              }
            }
          }
        } catch (e) {
          if (errorText) {
            errMsg = errorText.length > 150 ? errorText.substring(0, 150) + '...' : errorText;
          }
        }
        throw new Error(errMsg);
      }

      await fetchBooks();
      await fetchGames();
    } catch (err: any) {
      console.error('API Error in importBooks:', err);
      throw new Error(err.message || 'API connection failed. Please check if server is running.');
    }
  };

  // Book Assignment
  const assignBooks = async (gameId: string, bookIds: string[], agentId: string, expiryDate: string) => {
    const token = localStorage.getItem('admin_token') || '3|bpXivPtgjfWxYkYX107oloDEn2EhL2RsZeYWYctTde478c0d';

    // Find numeric database IDs for books
    const numericBookIds = bookIds.map(bId => {
      const bookObj = books.find(b => b.id === bId);
      if (bookObj && bookObj.bookNumber) return Number(bookObj.bookNumber);
      const digits = bId.replace(/\D/g, '');
      return digits ? Number(digits) : Number(bId);
    });

    const payload = {
      game_id: Number(gameId),
      agent_id: Number(agentId),
      book_ids: numericBookIds,
      expiry_date: expiryDate
    };

    try {
      const response = await fetch('/api/v1/admin/book-assignments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errMsg = 'Failed to assign books on server.';
        try {
          const parsed = JSON.parse(errorText);
          if (parsed.message) errMsg = parsed.message;
        } catch (e) { }
        throw new Error(errMsg);
      }

      // Reload lists to sync live state
      await fetchBooks();
      await fetchGames();
      await fetchAssignmentHistory();
    } catch (err: any) {
      console.error('API Error in assignBooks:', err);
      throw new Error(err.message || 'API connection failed. Please check if server is running.');
    }
  };

  const revokeAssignment = (bookId: string) => {
    let oldBook = books.find(b => b.id === bookId);

    setBooks(prev => prev.map(book => {
      if (book.id === bookId) {
        return {
          ...book,
          agentId: '',
          agentName: '',
          assignedDate: '',
          expiryDate: '',
          status: 'Available' as any
        };
      }
      return book;
    }));

    if (oldBook) {
      const log: AssignmentHistory = {
        id: `AH${String(assignmentHistory.length + 1).padStart(3, '0')}`,
        bookId,
        gameName: oldBook.gameName || '',
        agentName: oldBook.agentName || '',
        agentType: 'First Party', // placeholder
        assignedDate: new Date().toISOString(),
        expiryDate: '',
        status: 'Unassigned'
      };
      setAssignmentHistory(prev => [log, ...prev]);
    }
  };

  const updateBookStatus = async (bookId: string, status: 'Sold' | 'Unsold') => {
    const book = books.find(item => item.id === bookId);
    const apiBookId = Number(book?.apiId || book?.bookNumber || book?.id.replace(/^BK/i, ''));
    if (!book || !Number.isInteger(apiBookId)) {
      throw new Error('Book ID is missing or invalid.');
    }

    const token = localStorage.getItem('admin_token');
    const response = await fetch('/api/v1/admin/books/update-status', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify({
        book_id: apiBookId,
        status: status.toLowerCase()
      })
    });

    let result: any = null;
    try {
      result = await response.json();
    } catch {
      // The API may return an empty success response.
    }

    if (!response.ok || result?.success === false) {
      throw new Error(result?.message || `Failed to update book status to ${status}.`);
    }

    const updatedStatus = result?.data?.status?.toLowerCase() === 'sold' ? 'Sold' : 'Unsold';
    setBooks(prev => prev.map(item => item.id === bookId ? {
      ...item,
      status: updatedStatus,
      ...(updatedStatus === 'Sold' ? { soldDate: result?.data?.sold_at || new Date().toISOString() } : { unsoldDate: result?.data?.unsold_at || new Date().toISOString() })
    } : item));
    await fetchBooks();
  };

  // Agent CRUD
  const createAgent = async (agentData: Omit<Agent, 'id' | 'agentId'> & { password: string }) => {
    const token = localStorage.getItem('admin_token') || '3|bpXivPtgjfWxYkYX107oloDEn2EhL2RsZeYWYctTde478c0d';

    // Auto-generate agent ID if not present
    const generatedAgentId = `AG1${String(agents.length + 1).padStart(3, '0')}`;
    const apiType = agentData.agentType === 'First Party' ? 'first_party' : 'third_party';

    const payload = {
      agent_name: agentData.name,
      agent_id: generatedAgentId,
      mobile_number: agentData.mobile,
      whatsapp_number: agentData.whatsapp,
      address: agentData.address,
      agent_type: apiType,
      email: agentData.email,
      password: agentData.password,
      status: agentData.status === 'Active' ? 'active' : 'inactive'
    };

    try {
      const response = await fetch('/api/v1/admin/agents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Server responded with an error during agent creation.');
      }

      await fetchAgents();
    } catch (err: any) {
      console.error('API Error in createAgent:', err);
      throw new Error(err.message || 'API connection failed. Please check if server is running.');
    }
  };

  const updateAgent = (id: string, updatedAgent: Partial<Agent>) => {
    setAgents(prev => prev.map(a => a.id === id ? { ...a, ...updatedAgent } : a));
  };

  const toggleAgentStatus = (id: string) => {
    setAgents(prev => prev.map(a => a.id === id ? { ...a, status: a.status === 'Active' ? 'Inactive' : 'Active' } : a));
  };

  // Prize CRUD
  const createPrize = (prizeData: Omit<Prize, 'id'>) => {
    const newPrize: Prize = {
      ...prizeData,
      id: `PR${String(prizes.length + 1).padStart(3, '0')}`
    };
    setPrizes(prev => [...prev, newPrize]);
  };

  const updatePrize = (id: string, updatedPrize: Partial<Prize>) => {
    setPrizes(prev => prev.map(p => p.id === id ? { ...p, ...updatedPrize } : p));
  };

  const deletePrize = (id: string) => {
    setPrizes(prev => prev.filter(p => p.id !== id));
  };

  const togglePrizeStatus = (id: string) => {
    setPrizes(prev => prev.map(p => p.id === id ? { ...p, status: p.status === 'Active' ? 'Inactive' : 'Active' } : p));
  };

  const buildResultFormData = (resultData: Partial<Result>, prizes: any[] = [], includeFallbackImage = false) => {
    const formData = new FormData();

    const gameObj = games.find(g => g.id === resultData.gameId);
    const gameId = toNumber(gameObj?.id ?? resultData.gameId, 0);

    if (gameId > 0) formData.append('game_id', String(gameId));
    if (resultData.drawDate) formData.append('result_date', resultData.drawDate);
    if (resultData.title !== undefined) formData.append('title', resultData.title || 'Daily Lottery Result');

    if (resultData.imageFile) {
      formData.append('result_image', resultData.imageFile);
    } else if (includeFallbackImage) {
      const blob = new Blob(['mock_image_content'], { type: 'image/png' });
      formData.append('result_image', new File([blob], 'result_board.png', { type: 'image/png' }));
    } else if (resultData.image) {
      formData.append('existing_result_image', resultData.image);
    }

    const appendPrize = (p: any, index: number, prizeType: 'book_winner' | 'ticket_winner') => {
      formData.append(`prizes[${index}][rank]`, String(toNumber(p.rank, index + 1)));
      formData.append(`prizes[${index}][prize_name]`, String(p.prize_name || p.book_prize_name || p.ticket_prize_name || `${toNumber(p.rank, index + 1)} Prize`));
      formData.append(`prizes[${index}][prize_type]`, prizeType);
      formData.append(
        `prizes[${index}][prize_amount]`,
        String(prizeType === 'book_winner' ? toNumber(p.book_prize_amount ?? p.prize_amount) : toNumber(p.ticket_prize_amount ?? p.prize_amount))
      );
      if (p.prize_image instanceof File) {
        formData.append(`prizes[${index}][prize_image]`, p.prize_image);
      }
      // No image field appended when no new file — backend preserves existing image
    };

    let prizeIndex = 0;
    prizes
      .filter(p => p && (p.prize_name || p.book_prize_name || p.ticket_prize_name || toNumber(p.book_prize_amount) > 0 || toNumber(p.ticket_prize_amount) > 0 || toNumber(p.prize_amount) > 0 || p.prize_image instanceof File))
      .forEach((p, i) => {
        const typedPrizeType = normalizePrizeType(p.prize_type ?? p.type ?? p.winner_type);
        if (typedPrizeType) {
          appendPrize(p, prizeIndex, typedPrizeType);
          prizeIndex += 1;
          return;
        }

        appendPrize({ ...p, prize_name: p.book_prize_name || p.prize_name, rank: p.rank ?? i + 1 }, prizeIndex, 'book_winner');
        prizeIndex += 1;
        appendPrize({ ...p, prize_name: p.ticket_prize_name || p.prize_name, rank: p.rank ?? i + 1 }, prizeIndex, 'ticket_winner');
        prizeIndex += 1;
      });

    return formData;
  };

  const createResult = async (resultData: Omit<Result, 'id' | 'gameName' | 'status' | 'publishedDate'>, prizes: any[] = []) => {
    const token = localStorage.getItem('admin_token') || '3|bpXivPtgjfWxYkYX107oloDEn2EhL2RsZeYWYctTde478c0d';
    const formData = buildResultFormData(resultData, prizes, false);

    try {
      const response = await fetch('/api/v1/admin/results', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(extractApiErrorMessage(errorText, 'Failed to store result on server.'));
      }
      await fetchResults();
    } catch (err: any) {
      console.error('API Error in createResult:', err);
      throw new Error(extractApiErrorMessage(err.message, 'API connection failed.'));
    }
  };

  const updateResult = async (id: string, updatedResult: Partial<Result>, prizes: any[] = []) => {
    const token = localStorage.getItem('admin_token') || '';
    const formData = buildResultFormData(updatedResult, prizes, false);
    formData.append('_method', 'PUT');
    try {
      const response = await fetch(`/api/v1/admin/results/${id}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      const responseText = await response.text();
      let json: any = null;
      try {
        json = responseText ? JSON.parse(responseText) : null;
      } catch {
        // Successful update endpoints may return an empty or non-JSON body.
      }

      if (!response.ok || json?.success === false) {
        throw new Error(extractApiErrorMessage(json || responseText, 'Failed to update result.'));
      }

      if (json) {
        const rawResult = getResultPayload(json);
        if (rawResult && !Array.isArray(rawResult)) {
          setResults(prev => appendUnique(prev, [mapResult(rawResult)]));
          return;
        }
      }
      await fetchResults();
    } catch (err: any) {
      console.error('API Error in updateResult:', err);
      throw new Error(extractApiErrorMessage(err.message, 'Update failed.'));
    }
  };

  const deleteResult = async (id: string) => {
    const token = localStorage.getItem('admin_token') || '';
    try {
      const res = await fetch(`/api/v1/admin/results/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Delete failed.');
      await fetchResults();
    } catch (err) {
      console.error('API Error in deleteResult:', err);
      throw err;
    }
  };

  const publishResult = (id: string) => {
    setResults(prev => prev.map(r => r.id === id ? { ...r, status: 'Published', publishedDate: new Date().toISOString() } : r));
  };

  const unpublishResult = (id: string) => {
    setResults(prev => prev.map(r => r.id === id ? { ...r, status: 'Draft', publishedDate: undefined } : r));
  };

  const toggleResultStatus = async (id: string) => {
    const token = localStorage.getItem('admin_token') || '';
    try {
      const res = await fetch(`/api/v1/admin/results/${id}/toggle-status`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Toggle failed.');
      await fetchResults();
    } catch (err: any) {
      console.error('API Error in toggleResultStatus:', err);
      throw new Error(err.message || 'Toggle failed.');
    }
  };

  const restoreResult = async (id: string) => {
    const token = localStorage.getItem('admin_token') || '';
    try {
      const res = await fetch(`/api/v1/admin/results/${id}/restore`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Restore failed.');
      await fetchResults();
    } catch (err: any) {
      console.error('API Error in restoreResult:', err);
      throw new Error(err.message || 'Restore failed.');
    }
  };

  // Winners claim status
  const updateWinnerClaimStatus = (ticketNumber: string, bookId: string, claimStatus: 'Pending' | 'Claimed' | 'Rejected') => {
    setWinnings(prev => prev.map(w => w.ticketNumber === ticketNumber && w.bookId === bookId ? { ...w, claimStatus } : w));
  };

  const updateSettings = (settings: any) => {
    localStorage.setItem('admin_settings', JSON.stringify(settings));
  };

  const resetSystem = () => {
    localStorage.removeItem('lucky_draw_games');
    localStorage.removeItem('lucky_draw_books');
    localStorage.removeItem('lucky_draw_agents');
    localStorage.removeItem('lucky_draw_winnings');
    localStorage.removeItem('lucky_draw_prizes');
    localStorage.removeItem('lucky_draw_results');
    localStorage.removeItem('lucky_draw_assignment_history');
    setGames(INITIAL_GAMES);
    setAgents(INITIAL_AGENTS);
    setBooks(generateGlobalMockBooks(INITIAL_GAMES, INITIAL_AGENTS));
    setWinnings(INITIAL_WINNINGS);
    setPrizes(INITIAL_PRIZES);
    setResults(INITIAL_RESULTS);
    setAssignmentHistory([]);
  };

  return (
    <AdminContext.Provider value={{
      isAdminAuthenticated,
      adminUser,
      adminLogin,
      adminLogout,
      games,
      books,
      booksTotal,
      ticketsTotal,
      booksPagination,
      gamesPagination,
      agentsPagination,
      assignmentHistoryPagination,
      resultsPagination,
      agents,
      winnings,
      prizes,
      results,
      assignmentHistory,
      fetchGames,
      fetchBooks,
      fetchAgents,
      fetchAssignmentHistory,
      fetchResults,
      fetchResult,
      loadingGames,
      loadingBooks,
      loadingAgents,
      loadingHistory,
      loadingResults,
      createGame,
      updateGame,
      deleteGame,
      toggleGameStatus,
      generateBooks,
      importBooks,
      assignBooks,
      revokeAssignment,
      updateBookStatus,
      createAgent,
      updateAgent,
      toggleAgentStatus,
      createPrize,
      updatePrize,
      deletePrize,
      togglePrizeStatus,
      createResult,
      updateResult,
      deleteResult,
      publishResult,
      unpublishResult,
      toggleResultStatus,
      restoreResult,
      updateWinnerClaimStatus,
      updateSettings,
      resetSystem
    }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};
