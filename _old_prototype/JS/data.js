// Mock Events Data
const mockEvents = [
  {
    id: "evt-1",
    title: "DIMENSION IV: The Awakening",
    date: "2026-04-15T23:00:00",
    location: "Warehouse District, Porto",
    image: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=80",
    description: "Enter the fourth dimension with the hardest techno lineup of the year. Featuring international headliners and the best local talent.",
    lineup: [
      {
        id: "art-1",
        name: "KOBOSIL",
        bio: "Berlin-based techno producer known for his relentless, industrial sound",
        image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&q=80",
        genre: "Hard Techno",
      },
      {
        id: "art-2",
        name: "AMELIE LENS",
        bio: "Belgian DJ and producer, label owner of LENSKE",
        image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&q=80",
        genre: "Techno",
      },
      {
        id: "art-3",
        name: "STRANGER",
        bio: "Moscow's hardest export, known for aggressive, peak-time sets",
        image: "https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=400&q=80",
        genre: "Hard Techno",
      },
    ],
    ticketPhases: [
      {
        id: "phase-1",
        name: "Early Entry",
        price: 15,
        available: 0,
        total: 50,
        active: false,
      },
      {
        id: "phase-2",
        name: "1st Phase",
        price: 20,
        available: 23,
        total: 100,
        active: true,
      },
      {
        id: "phase-3",
        name: "2nd Phase",
        price: 25,
        available: 100,
        total: 100,
        active: false,
      },
    ],
    status: "upcoming",
  },
  {
    id: "evt-2",
    title: "UNDERGROUND SESSIONS #12",
    date: "2026-04-28T23:00:00",
    location: "Club Noir, Lisboa",
    image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80",
    description: "Monthly underground techno session featuring emerging artists and local heroes",
    lineup: [
      {
        id: "art-4",
        name: "REBEKAH",
        bio: "UK techno DJ and founder of Elements label",
        image: "https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=400&q=80",
        genre: "Techno",
      },
      {
        id: "art-5",
        name: "LOCAL HERO",
        bio: "Porto's finest underground selector",
        image: "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=400&q=80",
        genre: "Hard Techno",
      },
    ],
    ticketPhases: [
      {
        id: "phase-4",
        name: "Early Bird",
        price: 12,
        available: 35,
        total: 50,
        active: true,
      },
      {
        id: "phase-5",
        name: "Regular",
        price: 15,
        available: 75,
        total: 75,
        active: false,
      },
    ],
    status: "upcoming",
  },
  {
    id: "evt-3",
    title: "PAST EVENT: DIMENSION III",
    date: "2026-03-10T23:00:00",
    location: "Warehouse District, Porto",
    image: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800&q=80",
    description: "Past techno event - check out the photo gallery and after-party memories",
    lineup: [
      {
        id: "art-6",
        name: "ANNA",
        bio: "Berlin techno legend",
        image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&q=80",
        genre: "Techno",
      },
    ],
    ticketPhases: [],
    status: "past",
  },
];

const mockMediaItems = [
  {
    id: "media-1",
    type: "photo",
    title: "DIMENSION IV Pre-Event",
    thumbnail: "https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=400&q=80",
    eventId: "evt-1",
    eventTitle: "DIMENSION IV: The Awakening",
    date: "2026-04-15",
  },
  {
    id: "media-2",
    type: "video",
    title: "Aftermovie DIMENSION III",
    thumbnail: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400&q=80",
    eventId: "evt-3",
    eventTitle: "DIMENSION III",
    date: "2026-03-10",
  },
  {
    id: "media-3",
    type: "set",
    title: "KOBOSIL Live Set",
    thumbnail: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400&q=80",
    eventId: "evt-1",
    eventTitle: "DIMENSION IV",
    date: "2026-04-15",
  },
];

const mockTickets = [
  {
    id: "tk-1",
    eventId: "evt-1",
    eventTitle: "DIMENSION IV: The Awakening",
    eventDate: "2026-04-15",
    eventLocation: "Warehouse District, Porto",
    phase: "1st Phase",
    price: 20,
    purchaseDate: "2026-03-15",
    qrCode: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect fill='%23fff' width='200' height='200'/%3E%3Crect fill='%23000' width='40' height='40'/%3E%3Crect fill='%23000' x='160' width='40' height='40'/%3E%3Crect fill='%23000' y='160' width='40' height='40'/%3E%3C/svg%3E",
  },
  {
    id: "tk-2",
    eventId: "evt-2",
    eventTitle: "UNDERGROUND SESSIONS #12",
    eventDate: "2026-04-28",
    eventLocation: "Club Noir, Lisboa",
    phase: "Early Bird",
    price: 12,
    purchaseDate: "2026-04-01",
    qrCode: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect fill='%23fff' width='200' height='200'/%3E%3Crect fill='%23000' width='40' height='40'/%3E%3Crect fill='%23000' x='160' width='40' height='40'/%3E%3Crect fill='%23000' y='160' width='40' height='40'/%3E%3C/svg%3E",
  },
];

// Format Date Helper
function formatDate(dateString, format = "pt-PT") {
  const options = {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  };
  return new Date(dateString).toLocaleDateString(format, options);
}
