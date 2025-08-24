
import { create } from 'zustand';

export interface PantryItem {
  id: string;
  name: string;
  category: 'produce' | 'dairy' | 'meat' | 'pantry' | 'frozen' | 'beverages' | 'spices' | 'other';
  quantity: number;
  unit: string;
  expirationDate: Date;
  imageUrl?: string;
  isExpiring: boolean;
  isExpired: boolean;
}

interface PantryState {
  items: PantryItem[];
  // This is a placeholder initialization function.
  // In a real app, this would fetch from Firestore.
  initializePantry: () => void;
  addItem: (item: Omit<PantryItem, 'id' | 'isExpiring' | 'isExpired'>) => void;
  updateItem: (id: string, updates: Partial<PantryItem>) => void;
  removeItem: (id: string) => void;
}


// This mock data will be used to initialize the store until Firestore is connected.
const mockPantryItems: PantryItem[] = [
  // Produce
  { id: '1', name: 'Apples', category: 'produce', quantity: 5, unit: 'pieces', expirationDate: new Date(new Date().setDate(new Date().getDate() + 7)), isExpiring: false, isExpired: false, imageUrl: 'https://placehold.co/100x100.png' },
  { id: '2', name: 'Avocado', category: 'produce', quantity: 2, unit: 'pieces', expirationDate: new Date(new Date().setDate(new Date().getDate() + 2)), isExpiring: true, isExpired: false, imageUrl: 'https://placehold.co/100x100.png' },
  // Dairy
  { id: '3', name: 'Milk', category: 'dairy', quantity: 1, unit: 'gallons', expirationDate: new Date(new Date().setDate(new Date().getDate() + 5)), isExpiring: false, isExpired: false, imageUrl: 'https://placehold.co/100x100.png' },
  { id: '4', name: 'Eggs', category: 'dairy', quantity: 12, unit: 'pieces', expirationDate: new Date(new Date().setDate(new Date().getDate() + 20)), isExpiring: false, isExpired: false, imageUrl: 'https://placehold.co/100x100.png' },
  { id: '5', name: 'Yogurt', category: 'dairy', quantity: 1, unit: 'pieces', expirationDate: new Date(new Date().setDate(new Date().getDate() - 1)), isExpiring: false, isExpired: true, imageUrl: 'https://placehold.co/100x100.png' },
  // Pantry
  { id: '6', name: 'All-Purpose Flour', category: 'pantry', quantity: 1, unit: 'bags', expirationDate: new Date(new Date().setDate(new Date().getDate() + 365)), isExpiring: false, isExpired: false, imageUrl: 'https://placehold.co/100x100.png' },
  { id: '7', name: 'Olive Oil', category: 'pantry', quantity: 1, unit: 'liters', expirationDate: new Date(new Date().setDate(new Date().getDate() + 730)), isExpiring: false, isExpired: false, imageUrl: 'https://placehold.co/100x100.png' },
];


export const usePantryStore = create<PantryState>((set) => ({
  items: [],
  initializePantry: () => set({ items: mockPantryItems }),
  addItem: (item) => set((state) => ({
    items: [...state.items, { 
        ...item, 
        id: new Date().toISOString(),
        isExpiring: false, // This would be calculated based on expirationDate
        isExpired: false, // This would be calculated based on expirationDate
    }]
  })),
  updateItem: (id, updates) => set((state) => ({
    items: state.items.map((item) => (item.id === id ? { ...item, ...updates } : item))
  })),
  removeItem: (id) => set((state) => ({
    items: state.items.filter((item) => item.id !== id)
  })),
}));
