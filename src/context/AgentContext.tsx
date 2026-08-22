import React, { createContext, useContext, useState, useEffect } from 'react';
import { Agent, Book, Game, Winning, Ticket, ListPagination } from '../types';
import { apiUrl } from '../config/api';

interface AgentContextType {
  isAuthenticated: boolean;
  agent: Agent | null;
  books: Book[];
  games: Game[];
  winnings: Winning[];
  booksPagination: ListPagination;
  fetchAgentBooks: (limit?: number, offset?: number, append?: boolean) => Promise<void>;
  login: (agentId: string, password: string) => Promise<boolean>;
  logout: () => void;
  markBookAsSold: (bookId: string) => Promise<boolean>;
  markBookAsUnsold: (bookId: string) => Promise<boolean>;
  updateProfile: (profileData: Partial<Agent>) => void;
}

const AgentContext = createContext<AgentContextType | undefined>(undefined);

const EMPTY_BOOKS_PAGINATION: ListPagination = {
  total: 0,
  perPage: 10,
  currentPage: 1,
  lastPage: 1,
  nextPageUrl: null,
  prevPageUrl: null,
  hasMore: false
};

const normalizeBookStatus = (value: unknown): Book['status'] => {
  const status = String(value || '').trim().toLowerCase().replace(/[_-]+/g, ' ');
  if (status === 'sold') return 'Sold';
  if (status === 'unsold') return 'Unsold';
  if (status === 'unsold by admin' || status === 'expired' || status === 'reclaimed') return 'Unsold by Admin';
  if (status === 'in progress') return 'In Progress';
  if (status === 'available') return 'Available';
  return 'Assigned';
};

const DUMMY_AGENT: Agent = {
  id: 'AG1001',
  apiId: 4,
  name: 'Rajesh Kumar',
  agentId: 'AG1001',
  email: 'rajesh@gmail.com',
  mobile: '+91 98765 43210',
  whatsapp: '+91 98765 43210',
  address: 'Lucknow, Uttar Pradesh',
  agentType: 'First Party',
  status: 'Active'
};

const DUMMY_GAMES: Game[] = [
  { id: 'GM101', name: 'Mega Lucky Draw', gameCode: 'MGD101', ticketPrice: 100, bookSize: 10, totalBooks: 200, drawDate: '2026-08-25', drawTime: '18:00', startDate: '2026-08-15', endDate: '2026-08-24', status: 'Upcoming' },
  { id: 'GM102', name: 'Super Powerball', gameCode: 'SPB102', ticketPrice: 200, bookSize: 5, totalBooks: 300, drawDate: '2026-08-28', drawTime: '20:00', startDate: '2026-08-18', endDate: '2026-08-27', status: 'Upcoming' },
  { id: 'GM103', name: 'Emerald Raffle', gameCode: 'EMR103', ticketPrice: 500, bookSize: 10, totalBooks: 150, drawDate: '2026-08-30', drawTime: '17:00', startDate: '2026-08-20', endDate: '2026-08-29', status: 'Upcoming' }
];

const DUMMY_WINNINGS: Winning[] = [
  {
    ticketNumber: '00007',
    bookId: 'BK1101',
    game: 'Mega Lucky Draw',
    agentId: 'AG1001',
    agentType: 'First Party',
    prize: '1st Prize',
    prizeValue: 50000,
    winner: 'Amit Sharma',
    claimStatus: 'Pending'
  },
  {
    ticketNumber: '00032',
    bookId: 'BK1104',
    game: 'Super Powerball',
    agentId: 'AG1001',
    agentType: 'First Party',
    prize: '2nd Prize',
    prizeValue: 20000,
    winner: 'Priya Patel',
    claimStatus: 'Claimed'
  },
  {
    ticketNumber: '00055',
    bookId: 'BK1109',
    game: 'Emerald Raffle',
    agentId: 'AG1001',
    agentType: 'First Party',
    prize: '3rd Prize',
    prizeValue: 10000,
    winner: 'Sunil Verma',
    claimStatus: 'Claimed'
  },
  {
    ticketNumber: '00118',
    bookId: 'BK1115',
    game: 'Mega Lucky Draw',
    agentId: 'AG1001',
    agentType: 'First Party',
    prize: 'Consolation Prize',
    prizeValue: 2000,
    winner: 'Ramesh Singh',
    claimStatus: 'Pending'
  }
];

// Helper to seed 105 books to match user metrics
const generateMockBooks = (): Book[] => {
  const books: Book[] = [];
  let ticketCounter = 1;

  // 1. BK1025 - Active Assigned, Mega Lucky Draw
  books.push({
    id: 'BK1025',
    gameId: 'GM101',
    agentId: 'AG1001',
    tickets: Array.from({ length: 10 }, () => String(ticketCounter++).padStart(5, '0')),
    bookValue: 1000,
    assignedDate: '2026-08-10T10:00:00+05:30',
    expiryDate: '2026-08-20T18:00:00+05:30',
    status: 'Assigned'
  });

  books.push({
    id: 'BK1040',
    gameId: 'GM101',
    agentId: 'AG1001',
    tickets: Array.from({ length: 10 }, () => String(ticketCounter++).padStart(5, '0')),
    bookValue: 1000,
    assignedDate: '2026-08-11T12:00:00+05:30',
    expiryDate: '2026-08-15T15:36:00+05:30',
    status: 'Assigned'
  });

  books.push({
    id: 'BK1006',
    gameId: 'GM103',
    agentId: 'AG1001',
    tickets: Array.from({ length: 10 }, () => String(ticketCounter++).padStart(5, '0')),
    bookValue: 5000,
    assignedDate: '2026-08-14T09:00:00+05:30',
    expiryDate: '2026-08-22T18:00:00+05:30',
    status: 'Assigned'
  });

  books.push({
    id: 'BK1041',
    gameId: 'GM102',
    agentId: 'AG1001',
    tickets: Array.from({ length: 5 }, () => String(ticketCounter++).padStart(5, '0')),
    bookValue: 1000,
    assignedDate: '2026-08-13T14:00:00+05:30',
    expiryDate: '2026-08-18T18:00:00+05:30',
    status: 'Assigned'
  });

  books.push({
    id: 'BK1042',
    gameId: 'GM101',
    agentId: 'AG1001',
    tickets: Array.from({ length: 10 }, () => String(ticketCounter++).padStart(5, '0')),
    bookValue: 1000,
    assignedDate: '2026-08-14T15:00:00+05:30',
    expiryDate: '2026-08-19T18:00:00+05:30',
    status: 'Assigned'
  });

  for (let i = 1; i <= 82; i++) {
    const bookId = `BK${String(1100 + i)}`;
    const isGM101 = i % 2 === 0;
    const gameId = isGM101 ? 'GM101' : 'GM102';
    const soldDay = (i % 14) + 1;
    const soldDate = `2026-08-${String(soldDay).padStart(2, '0')}T17:30:00+05:30`;
    books.push({
      id: bookId,
      gameId,
      agentId: 'AG1001',
      tickets: Array.from({ length: isGM101 ? 10 : 5 }, () => String(ticketCounter++).padStart(5, '0')),
      bookValue: 1000,
      assignedDate: `2026-08-01T09:00:00+05:30`,
      expiryDate: `2026-08-15T18:00:00+05:30`,
      status: 'Sold',
      ...({ soldDate } as any)
    });
  }

  for (let i = 1; i <= 10; i++) {
    const bookId = `BK${String(1200 + i)}`;
    const unsoldDay = (i % 5) + 8;
    const unsoldDate = `2026-08-${String(unsoldDay).padStart(2, '0')}T18:30:00+05:30`;
    books.push({
      id: bookId,
      gameId: 'GM101',
      agentId: 'AG1001',
      tickets: Array.from({ length: 10 }, () => String(ticketCounter++).padStart(5, '0')),
      bookValue: 1000,
      assignedDate: `2026-08-05T09:00:00+05:30`,
      expiryDate: `2026-08-13T18:00:00+05:30`,
      status: 'Unsold',
      ...({ unsoldDate } as any)
    });
  }

  for (let i = 1; i <= 8; i++) {
    const bookId = `BK${String(1300 + i)}`;
    const expiredDate = `2026-08-12T12:00:00+05:30`;
    books.push({
      id: bookId,
      gameId: 'GM101',
      agentId: 'AG1001',
      tickets: Array.from({ length: 10 }, () => String(ticketCounter++).padStart(5, '0')),
      bookValue: 1000,
      assignedDate: `2026-08-05T09:00:00+05:30`,
      expiryDate: `2026-08-12T12:00:00+05:30`,
      status: 'Unsold by Admin',
      ...({ expiredDate } as any)
    });
  }

  return books;
};

export const AgentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('agent_auth') === 'true';
  });

  const [agent, setAgent] = useState<Agent | null>(() => {
    const stored = localStorage.getItem('agent_profile');
    return stored ? JSON.parse(stored) : null;
  });

  const [books, setBooks] = useState<Book[]>(() => {
    const stored = localStorage.getItem('lucky_draw_books');
    if (stored) {
      return JSON.parse(stored);
    }
    return generateMockBooks();
  });
  const [booksPagination, setBooksPagination] = useState<ListPagination>(EMPTY_BOOKS_PAGINATION);

  // Save books to local storage whenever they change
  useEffect(() => {
    localStorage.setItem('lucky_draw_books', JSON.stringify(books));
  }, [books]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchAgentBooks(10, 0, false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const refreshBooks = () => fetchAgentBooks(50, 0, false);
    const interval = setInterval(refreshBooks, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // Expiry Checker: checks and transitions expired books to 'Unsold by Admin'
  useEffect(() => {
    const checkExpirations = () => {
      const now = new Date();
      let updated = false;

      const newBooks = books.map(book => {
        if ((book.status === 'Assigned' || book.status === 'In Progress')) {
          const expiryTime = new Date(book.expiryDate);
          if (expiryTime < now) {
            updated = true;
            return {
              ...book,
              status: 'Unsold by Admin',
              expiredDate: now.toISOString()
            } as Book;
          }
        }
        return book;
      });

      if (updated) {
        setBooks(newBooks);
      }
    };

    checkExpirations();
    const interval = setInterval(checkExpirations, 30000);
    return () => clearInterval(interval);
  }, [books]);

  const login = async (agentId: string, password: string): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 800));

    if (agentId === 'AG1001' && password === '123456') {
      setIsAuthenticated(true);
      setAgent(DUMMY_AGENT);
      localStorage.setItem('agent_auth', 'true');
      localStorage.setItem('agent_profile', JSON.stringify(DUMMY_AGENT));
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setAgent(null);
    localStorage.removeItem('agent_auth');
    localStorage.removeItem('agent_profile');
  };

  const fetchAgentBooks = async (limit = 10, offset = 0, append = false) => {
    const token = localStorage.getItem('agent_token');
    try {
      const response = await fetch(apiUrl(`/api/v1/agent/books?limit=${limit}&offset=${offset}`), {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });
      if (!response.ok) return;

      const json = await response.json();
      const payload = json?.data && !Array.isArray(json.data) ? json.data : json;
      const rawBooks = Array.isArray(json?.data)
        ? json.data
        : Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload)
            ? payload
            : [];
      const mappedBooks: Book[] = rawBooks.map((item: any) => {
        const bookId = item.book_id || item.book_number || `BK${item.id}`;
        const ticketCount = Number(item.total_tickets || item.tickets_count || item.book?.total_tickets || 0);
        return {
          id: String(bookId),
          apiId: Number(item.id || item.book_id),
          gameId: String(item.game_id || item.game?.id || ''),
          gameName: item.game?.game_name || item.game_name || 'Lucky Draw',
          bookName: item.book_name || item.name || bookId,
          agentId: String(item.agent_id || agent?.apiId || agent?.id || ''),
          agentName: item.agent?.agent_name || item.agent_name || agent?.name,
          tickets: Array.from({ length: ticketCount }, (_, index) => String(item.tickets?.[index]?.ticket_number || item.tickets?.[index] || index + 1)),
          bookValue: Number(item.book_value || item.book?.book_value || 0),
          bookNumber: String(item.id || item.book_number || ''),
          serialNumber: item.serial_number || '',
          totalTickets: ticketCount,
          soldTickets: Number(item.sold_tickets || 0),
          unsoldTickets: Number(item.unsold_tickets || 0),
          assignedDate: item.assigned_date || item.created_at || '',
          expiryDate: item.expiry_date || '',
          createdDate: item.created_at || '',
          soldDate: item.sold_at || item.sold_date || '',
          unsoldDate: item.unsold_at || item.unsold_date || '',
          status: normalizeBookStatus(item.status)
        };
      });

      const meta = payload || json;
      const total = Number(meta.total ?? offset + mappedBooks.length);
      const perPage = Number(meta.per_page ?? limit);
      const currentPage = Number(meta.current_page ?? Math.floor(offset / limit) + 1);
      const lastPage = Number(meta.last_page ?? Math.max(Math.ceil(total / perPage), currentPage));
      setBooksPagination({
        total,
        perPage,
        currentPage,
        lastPage,
        nextPageUrl: meta.next_page_url ?? null,
        prevPageUrl: meta.prev_page_url ?? null,
        hasMore: meta.next_page_url !== null && meta.next_page_url !== undefined
          ? Boolean(meta.next_page_url)
          : currentPage < lastPage
      });
      setBooks(prev => append ? Array.from(new Map([...prev, ...mappedBooks].map(book => [book.id, book])).values()) : mappedBooks);
    } catch (error) {
      console.error('API Error fetching agent books:', error);
    }
  };

  const updateBookStatus = async (bookId: string, status: 'Sold' | 'Unsold'): Promise<boolean> => {
    const book = books.find(item => item.id === bookId);
    if (!book || book.status === 'Unsold by Admin') return false;

    const apiBookId = Number(book.apiId || book.bookNumber || book.id.replace(/^BK/i, ''));
    const storedAgentId = localStorage.getItem('agent_api_id') || localStorage.getItem('agent_id');
    const apiAgentId = Number(storedAgentId || agent?.apiId || agent?.id?.replace(/\D/g, ''));
    if (!Number.isInteger(apiBookId) || !Number.isInteger(apiAgentId)) {
      throw new Error('Book ID or Agent ID is missing for this status update.');
    }

    const token = localStorage.getItem('agent_token');
    const response = await fetch(apiUrl(`/api/v1/agent/books/${status.toLowerCase()}`), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify({
        book_id: apiBookId,
        agent_id: apiAgentId
      })
    });

    let result: any = null;
    try {
      result = await response.json();
    } catch {
      // Some successful action endpoints return an empty response body.
    }

    if (!response.ok || (result && result.success === false)) {
      throw new Error(result?.message || `Failed to mark book as ${status.toLowerCase()}.`);
    }

    const responseBookId = result?.data?.book_id;
    const responseBookNumber = result?.data?.book_number;
    const updatedAt = result?.data?.[status === 'Sold' ? 'sold_at' : 'unsold_at'] || new Date().toISOString();
    setBooks(prev => prev.map(item => {
      const itemApiId = Number(item.apiId || item.bookNumber || item.id.replace(/^BK/i, ''));
      const isUpdatedBook = item.id === bookId ||
        (responseBookId && itemApiId === Number(responseBookId)) ||
        (responseBookNumber && item.id === responseBookNumber);
      if (!isUpdatedBook) return item;
      return status === 'Sold'
        ? { ...item, status, soldDate: updatedAt } as Book
        : { ...item, status, unsoldDate: updatedAt } as Book;
    }));
    await fetchAgentBooks(50, 0, false);
    return true;
  };

  const markBookAsSold = (bookId: string) => updateBookStatus(bookId, 'Sold');

  const markBookAsUnsold = (bookId: string) => updateBookStatus(bookId, 'Unsold');

  const updateProfile = (profileData: Partial<Agent>) => {
    if (agent) {
      const updatedAgent = { ...agent, ...profileData };
      setAgent(updatedAgent);
      localStorage.setItem('agent_profile', JSON.stringify(updatedAgent));
    }
  };

  return (
    <AgentContext.Provider
      value={{
        isAuthenticated,
        agent,
        books,
        games: DUMMY_GAMES,
        winnings: DUMMY_WINNINGS,
        booksPagination,
        fetchAgentBooks,
        login,
        logout,
        markBookAsSold,
        markBookAsUnsold,
        updateProfile
      }}
    >
      {children}
    </AgentContext.Provider>
  );
};

export const useAgent = () => {
  const context = useContext(AgentContext);
  if (context === undefined) {
    throw new Error('useAgent must be used within an AgentProvider');
  }
  return context;
};
