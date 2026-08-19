import React, { createContext, useContext, useState, useEffect } from 'react';
import { Agent, Book, Game, Winning, Ticket } from '../types';

interface AgentContextType {
  isAuthenticated: boolean;
  agent: Agent | null;
  books: Book[];
  games: Game[];
  winnings: Winning[];
  login: (agentId: string, password: string) => Promise<boolean>;
  logout: () => void;
  markBookAsSold: (bookId: string) => void;
  markBookAsUnsold: (bookId: string) => void;
  updateProfile: (profileData: Partial<Agent>) => void;
}

const AgentContext = createContext<AgentContextType | undefined>(undefined);

const DUMMY_AGENT: Agent = {
  id: 'AG1001',
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
    expiryDate: '2026-08-20T18:00:00+05:30', // In the future
    status: 'Assigned'
  });

  // 2. BK1040 - Active Assigned, Mega Lucky Draw, Expires in ~2.5 hours from local time Aug 15 13:02
  // Let's set it to expire at August 15, 2026 15:36:00
  books.push({
    id: 'BK1040',
    gameId: 'GM101',
    agentId: 'AG1001',
    tickets: Array.from({ length: 10 }, () => String(ticketCounter++).padStart(5, '0')),
    bookValue: 1000,
    assignedDate: '2026-08-11T12:00:00+05:30',
    expiryDate: '2026-08-15T15:36:00+05:30', // Expiry soon
    status: 'Assigned'
  });

  // 3. BK1006 - Active Assigned, Emerald Raffle
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

  // 4. Two more active books to make it 5 active books
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

  // 5. 82 Sold Books (all values ₹1,000 to total exactly ₹82,000 sales)
  // Let's scatter their sold dates over the last 15 days
  for (let i = 1; i <= 82; i++) {
    const bookId = `BK${String(1100 + i)}`;
    const isGM101 = i % 2 === 0;
    const gameId = isGM101 ? 'GM101' : 'GM102';
    
    // Spread sold date between Aug 1 and Aug 15
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
      // Store custom attribute for history & sales aggregation
      ...({ soldDate } as any)
    });
  }

  // 6. 10 Unsold Books (marked by Agent)
  for (let i = 1; i <= 10; i++) {
    const bookId = `BK${String(1200 + i)}`;
    const unsoldDay = (i % 5) + 8; // Aug 8 to Aug 12
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

  // 7. 8 Unsold by Admin Books (Expired automatically)
  // Expiry date must be clearly in the past
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
      expiryDate: `2026-08-12T12:00:00+05:30`, // Past
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

  // Save books to local storage whenever they change
  useEffect(() => {
    localStorage.setItem('lucky_draw_books', JSON.stringify(books));
  }, [books]);

  // Expiry Checker: checks and transitions expired books to 'Unsold by Admin'
  useEffect(() => {
    const checkExpirations = () => {
      const now = new Date();
      let updated = false;

      const newBooks = books.map(book => {
        // Only transition Assigned or In Progress books
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

    // Run once on load
    checkExpirations();

    // Check every 30 seconds
    const interval = setInterval(checkExpirations, 30000);
    return () => clearInterval(interval);
  }, [books]);

  const login = async (agentId: string, password: string): Promise<boolean> => {
    // Simulate API delay
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

  const markBookAsSold = (bookId: string) => {
    setBooks(prev =>
      prev.map(book => {
        if (book.id === bookId) {
          // If already expired, do not allow changes
          if (book.status === 'Unsold by Admin') return book;
          
          return {
            ...book,
            status: 'Sold',
            soldDate: new Date().toISOString()
          } as Book;
        }
        return book;
      })
    );
  };

  const markBookAsUnsold = (bookId: string) => {
    setBooks(prev =>
      prev.map(book => {
        if (book.id === bookId) {
          // If already expired, do not allow changes
          if (book.status === 'Unsold by Admin') return book;

          return {
            ...book,
            status: 'Unsold',
            unsoldDate: new Date().toISOString()
          } as Book;
        }
        return book;
      })
    );
  };

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
