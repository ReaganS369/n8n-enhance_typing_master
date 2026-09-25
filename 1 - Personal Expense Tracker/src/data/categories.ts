import { CategoryId, CategoryInfo } from '../types/expense';

export const CATEGORIES: Record<CategoryId, CategoryInfo> = {
  food: {
    id: 'food',
    name: 'Food & Dining',
    icon: 'Utensils',
    color: '#f97316', // Orange
    bgColor: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
    borderColor: 'border-orange-500',
    description: 'Restaurants, cafes, food delivery, dining out',
    defaultKeywords: [
      'swiggy', 'zomato', 'starbucks', 'mcdonalds', 'kfc', 'burger king', 'pizza', 'dominos',
      'subway', 'cafe', 'coffee', 'tea', 'chai', 'dinner', 'lunch', 'breakfast', 'brunch',
      'restaurant', 'bistro', 'bar', 'pub', 'bakery', 'tacos', 'sushi', 'diner', 'snack',
      'shake', 'ice cream', 'dessert', 'biryani', 'noodles', 'shawarma', 'haldiram'
    ],
  },
  groceries: {
    id: 'groceries',
    name: 'Groceries',
    icon: 'ShoppingBag',
    color: '#10b981', // Emerald
    bgColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    borderColor: 'border-emerald-500',
    description: 'Supermarket, vegetables, milk, pantry staples',
    defaultKeywords: [
      'milk', 'bread', 'butter', 'cheese', 'eggs', 'vegetables', 'fruits', 'apple', 'banana',
      'grocery', 'groceries', 'supermarket', 'bigbasket', 'blinkit', 'zepto', 'instamart',
      'dmart', 'nature basket', 'reliance fresh', 'spencer', 'walmart', 'trader joe',
      'whole foods', 'costco', 'flour', 'rice', 'oil', 'sugar', 'salt', 'meat', 'chicken',
      'fish', 'paneer', 'yogurt', 'curd', 'potatoes', 'onions', 'tomatoes', 'spices'
    ],
  },
  travel: {
    id: 'travel',
    name: 'Travel & Transport',
    icon: 'Plane',
    color: '#3b82f6', // Blue
    bgColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    borderColor: 'border-blue-500',
    description: 'Flights, train, metro, cabs, fuel, hotels',
    defaultKeywords: [
      'flight', 'flights', 'plane', 'airline', 'indigo', 'air india', 'vistara', 'emirates',
      'train', 'trains', 'train tickets', 'irctc', 'railway', 'metro', 'subway ticket',
      'uber', 'ola', 'rapido', 'lyft', 'grab', 'cab', 'taxi', 'auto', 'rickshaw',
      'bus', 'redbus', 'toll', 'fastag', 'fuel', 'petrol', 'diesel', 'gas station',
      'shell', 'hp fuel', 'parking', 'hotel', 'airbnb', 'booking.com', 'makemytrip',
      'agoda', 'stay', 'resort', 'flight ticket', 'train ticket'
    ],
  },
  shopping: {
    id: 'shopping',
    name: 'Shopping',
    icon: 'Tag',
    color: '#ec4899', // Pink
    bgColor: 'bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20',
    borderColor: 'border-pink-500',
    description: 'Clothing, electronics, home goods, personal care',
    defaultKeywords: [
      'amazon', 'flipkart', 'myntra', 'zara', 'h&m', 'uniqlo', 'nike', 'adidas',
      'shoes', 'clothes', 'clothing', 'shirt', 'pants', 'tshirt', 'jeans', 'dress',
      'jacket', 'electronics', 'apple store', 'croma', 'reliance digital', 'headphone',
      'laptop', 'gadget', 'perfume', 'makeup', 'skincare', 'nykaa', 'sephora', 'watch',
      'eyewear', 'lenskart', 'bag', 'wallet', 'jewellery', 'ikea', 'furniture'
    ],
  },
  bills: {
    id: 'bills',
    name: 'Bills & Utilities',
    icon: 'Receipt',
    color: '#eab308', // Amber / Yellow
    bgColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    borderColor: 'border-amber-500',
    description: 'Rent, electricity, water, internet, phone bills',
    defaultKeywords: [
      'electricity', 'power bill', 'water bill', 'gas bill', 'wifi', 'internet', 'broadband',
      'airtel', 'jio', 'vi', 'vodafone', 'verizon', 'mobile recharge', 'phone bill',
      'rent', 'maintenance', 'society dues', 'credit card bill', 'loan emi', 'insurance',
      'property tax', 'cylinder', 'lpg', 'pipe gas', 'tata sky', 'dth'
    ],
  },
  entertainment: {
    id: 'entertainment',
    name: 'Entertainment',
    icon: 'Film',
    color: '#8b5cf6', // Violet
    bgColor: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20',
    borderColor: 'border-violet-500',
    description: 'Movies, streaming subscriptions, games, concerts',
    defaultKeywords: [
      'netflix', 'spotify', 'prime video', 'disney', 'hotstar', 'apple tv', 'youtube premium',
      'movie', 'movies', 'cinema', 'pvr', 'inox', 'bookmyshow', 'theatre', 'concert',
      'ticketmaster', 'steam', 'playstation', 'xbox', 'nintendo', 'game', 'gaming',
      'bowling', 'theme park', 'arcade', 'audible', 'kindle'
    ],
  },
  health: {
    id: 'health',
    name: 'Health & Fitness',
    icon: 'HeartPulse',
    color: '#06b6d4', // Cyan
    bgColor: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20',
    borderColor: 'border-cyan-500',
    description: 'Doctor, pharmacy, medicine, gym, wellness',
    defaultKeywords: [
      'doctor', 'hospital', 'clinic', 'dentist', 'eye checkup', 'apollo', 'pharmeasy',
      '1mg', 'medplus', 'pharmacy', 'medicine', 'medicines', 'tablets', 'syrup',
      'gym', 'cult.fit', 'fitness', 'crossfit', 'yoga', 'protein', 'supplements',
      'lab test', 'blood test', 'pathology', 'therapy', 'spa', 'massage'
    ],
  },
  education: {
    id: 'education',
    name: 'Education & Career',
    icon: 'GraduationCap',
    color: '#6366f1', // Indigo
    bgColor: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
    borderColor: 'border-indigo-500',
    description: 'Courses, books, tuition, certifications',
    defaultKeywords: [
      'udemy', 'coursera', 'course', 'training', 'certification', 'aws cert', 'books',
      'textbook', 'kindle book', 'tuition', 'coaching', 'school fee', 'college fee',
      'bootcamp', 'workshop', 'webinar', 'subscription substack', 'medium'
    ],
  },
  other: {
    id: 'other',
    name: 'Other & Miscellaneous',
    icon: 'MoreHorizontal',
    color: '#64748b', // Slate
    bgColor: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
    borderColor: 'border-slate-500',
    description: 'Uncategorized or miscellaneous spending',
    defaultKeywords: ['atm withdrawal', 'cash', 'transfer', 'charity', 'donation', 'gift', 'fee'],
  },
};

export const CATEGORY_LIST = Object.values(CATEGORIES);
