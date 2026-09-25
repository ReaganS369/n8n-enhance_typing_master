import { Destination, Trip } from '../types/trip';

export const INITIAL_DESTINATIONS: Destination[] = [
  {
    id: 'jaisalmer',
    name: 'Jaisalmer',
    state: 'Rajasthan',
    country: 'India',
    region: 'North',
    lat: 26.9157,
    lng: 70.9083,
    heroImage: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=80',
    description: 'The Golden City rising out of the Thar Desert, crowned by the living Jaisalmer Fort and rolling Sam sand dunes with starry desert night camps.',
    highlightQuote: 'Sleep under a canopy of stars in Thar desert dunes with folk music around a crackling campfire.',
    tags: ['Desert Safari', 'Living Fort', 'Stargazing', 'Heritage Havelis', 'Camping'],
    idealDaysMin: 4,
    idealDaysMax: 5,
    avgDailyBudgetInr: 4500,
    popularAttractions: ['Jaisalmer Fort (Sonar Qila)', 'Sam Sand Dunes & Desert Camp', 'Patwon Ki Haveli', 'Gadisar Lake boating', 'Kuldhara Ghost Village'],
    baseWeather: {
      tempMin: 10,
      tempMax: 24,
      condition: 'Sunny & Pleasant',
      weatherCode: 0,
      humidity: 38,
      precipitationProb: 0,
    },
    travelTimes: {
      'Delhi': { flight: 1.5, train: 14.5, road: 13.0 },
      'Bhopal': { flight: 5.5, train: 18.0, road: 15.5 },
    }
  },
  {
    id: 'udaipur',
    name: 'Udaipur',
    state: 'Rajasthan',
    country: 'India',
    region: 'North',
    lat: 24.5854,
    lng: 73.7125,
    heroImage: 'https://images.unsplash.com/photo-1615836245337-f5b9b230dd6c?auto=format&fit=crop&w=1200&q=80',
    description: 'The City of Lakes, romantic palaces, and Aravalli mountain views. Winter brings crystal clear lake reflections and regal heritage hospitality.',
    highlightQuote: 'Sunset boat cruise on Lake Pichola watching the marble Jag Mandir illuminated against dusk.',
    tags: ['Lakes & Palaces', 'Royal Heritage', 'Rooftop Dining', 'Art & Culture', 'Romantic'],
    idealDaysMin: 3,
    idealDaysMax: 4,
    avgDailyBudgetInr: 5200,
    popularAttractions: ['City Palace Complex', 'Lake Pichola Sunset Cruise', 'Bagore Ki Haveli Folk Dance', 'Sajjangarh Monsoon Palace', 'Saheliyon Ki Bari'],
    baseWeather: {
      tempMin: 12,
      tempMax: 26,
      condition: 'Clear Sky & Breezy',
      weatherCode: 1,
      humidity: 42,
      precipitationProb: 2,
    },
    travelTimes: {
      'Delhi': { flight: 1.25, train: 11.5, road: 11.0 },
      'Bhopal': { flight: 4.5, train: 10.5, road: 9.5 },
    }
  },
  {
    id: 'jodhpur',
    name: 'Jodhpur',
    state: 'Rajasthan',
    country: 'India',
    region: 'North',
    lat: 26.2389,
    lng: 73.0243,
    heroImage: 'https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?auto=format&fit=crop&w=1200&q=80',
    description: 'The iconic Blue City nestled beneath the towering, invincible Mehrangarh Fort, brimming with spiced tea stalls and bustling spice bazaars.',
    highlightQuote: 'Ziplining right across the battlements and desert lakes beneath majestic Mehrangarh Fort.',
    tags: ['Blue City', 'Imposing Forts', 'Street Food', 'Ziplining', 'Handicrafts'],
    idealDaysMin: 3,
    idealDaysMax: 4,
    avgDailyBudgetInr: 4200,
    popularAttractions: ['Mehrangarh Fort & Flying Fox', 'Jaswant Thada cenotaphs', 'Blue City Walking Tour', 'Umaid Bhawan Palace', 'Clock Tower & Sardar Market'],
    baseWeather: {
      tempMin: 11,
      tempMax: 25,
      condition: 'Sunny & Crisp',
      weatherCode: 0,
      humidity: 35,
      precipitationProb: 0,
    },
    travelTimes: {
      'Delhi': { flight: 1.2, train: 10.5, road: 10.0 },
      'Bhopal': { flight: 4.5, train: 13.0, road: 12.0 },
    }
  },
  {
    id: 'jaipur',
    name: 'Jaipur',
    state: 'Rajasthan',
    country: 'India',
    region: 'North',
    lat: 26.9124,
    lng: 75.7873,
    heroImage: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=1200&q=80',
    description: 'The Pink City of royalty, hilltop fortresses, UNESCO astronomical observatories, and vibrant textiles in walled city markets.',
    highlightQuote: 'Catch sunrise over the majestic Amber Fort reflecting in the calm waters of Maota Lake.',
    tags: ['Pink City', 'Forts & Fortresses', 'Shopping', 'Street Food', 'Architecture'],
    idealDaysMin: 3,
    idealDaysMax: 4,
    avgDailyBudgetInr: 4800,
    popularAttractions: ['Amber Fort & Palace', 'Hawa Mahal (Palace of Winds)', 'City Palace', 'Jantar Mantar', 'Nahargarh Fort sunset view'],
    baseWeather: {
      tempMin: 9,
      tempMax: 23,
      condition: 'Mild & Sunny',
      weatherCode: 0,
      humidity: 45,
      precipitationProb: 1,
    },
    travelTimes: {
      'Delhi': { flight: 0.9, train: 4.5, road: 4.5 },
      'Bhopal': { flight: 4.0, train: 10.0, road: 9.0 },
    }
  },
  {
    id: 'ranthambore',
    name: 'Ranthambore',
    state: 'Rajasthan',
    country: 'India',
    region: 'North',
    lat: 26.0173,
    lng: 76.5026,
    heroImage: 'https://images.unsplash.com/photo-1561731216-c3a4d99437d5?auto=format&fit=crop&w=1200&q=80',
    description: 'Premier Bengal tiger reserve set amidst rugged dry deciduous jungle and ancient 10th-century fort ruins with lakeside wildlife encounters.',
    highlightQuote: 'Spotting a majestic Bengal tiger lounging beside ancient banyan trees inside the fortress grounds.',
    tags: ['Wildlife Safari', 'Bengal Tigers', 'Ancient Ruins', 'Jungle Lodge', 'Birdwatching'],
    idealDaysMin: 3,
    idealDaysMax: 4,
    avgDailyBudgetInr: 6000,
    popularAttractions: ['Morning & Evening Jeep Safaris', 'Ranthambore Fort', 'Padam Talao lake', 'Trinetra Ganesha Temple', 'Rajbagh ruins'],
    baseWeather: {
      tempMin: 10,
      tempMax: 24,
      condition: 'Clear & Misty Mornings',
      weatherCode: 1,
      humidity: 50,
      precipitationProb: 0,
    },
    travelTimes: {
      'Delhi': { flight: 3.5, train: 4.0, road: 6.0 },
      'Bhopal': { flight: 5.0, train: 6.5, road: 7.5 },
    }
  },
  {
    id: 'orchha',
    name: 'Orchha & Khajuraho',
    state: 'Madhya Pradesh',
    country: 'India',
    region: 'Central',
    lat: 25.3512,
    lng: 78.6416,
    heroImage: 'https://images.unsplash.com/photo-1600100397608-f010f443a6d7?auto=format&fit=crop&w=1200&q=80',
    description: 'Enchanting medieval palaces, towering cenotaphs mirrored on the Betwa river, and world-renowned UNESCO sculpted temples.',
    highlightQuote: 'Kayaking on the Betwa river right past towering 16th-century royal chhatris at golden hour.',
    tags: ['Heritage Forts', 'River Kayaking', 'UNESCO Temples', 'Off the Beaten Path', 'Hidden Gem'],
    idealDaysMin: 4,
    idealDaysMax: 5,
    avgDailyBudgetInr: 3800,
    popularAttractions: ['Orchha Palace & Jahangir Mahal', 'Chhatris on Betwa River', 'Khajuraho Western Group of Temples', 'Raneh Falls canyon', 'Sound & Light Show'],
    baseWeather: {
      tempMin: 10,
      tempMax: 25,
      condition: 'Sunlit & Pleasant',
      weatherCode: 0,
      humidity: 48,
      precipitationProb: 0,
    },
    travelTimes: {
      'Delhi': { flight: 3.5, train: 4.5, road: 7.5 },
      'Bhopal': { flight: 4.0, train: 4.5, road: 6.0 },
    }
  },
  {
    id: 'pushkar',
    name: 'Pushkar',
    state: 'Rajasthan',
    country: 'India',
    region: 'North',
    lat: 26.4897,
    lng: 74.5511,
    heroImage: 'https://images.unsplash.com/photo-1598890777032-bde835ba27c2?auto=format&fit=crop&w=1200&q=80',
    description: 'A serene holy lake town surrounded by sand dunes and hills, famous for peaceful sunset ghats, cozy bohemian cafes, and camel rides.',
    highlightQuote: 'Watching the sacred evening prayers from Varaha Ghat with chiming temple bells and soft incense in the breeze.',
    tags: ['Lake Town', 'Bohemian Cafes', 'Sunset Views', 'Desert Camping', 'Spiritual'],
    idealDaysMin: 3,
    idealDaysMax: 4,
    avgDailyBudgetInr: 3400,
    popularAttractions: ['Pushkar Lake 52 Ghats', 'Brahma Temple', 'Savitri Temple hilltop sunrise', 'Desert quad biking & camel ride', 'Street food in main bazaar'],
    baseWeather: {
      tempMin: 11,
      tempMax: 24,
      condition: 'Dry & Pleasant',
      weatherCode: 0,
      humidity: 40,
      precipitationProb: 1,
    },
    travelTimes: {
      'Delhi': { flight: 3.0, train: 6.5, road: 7.0 },
      'Bhopal': { flight: 5.0, train: 11.0, road: 10.0 },
    }
  },
  {
    id: 'rishikesh',
    name: 'Rishikesh',
    state: 'Uttarakhand',
    country: 'India',
    region: 'North',
    lat: 30.0869,
    lng: 78.2676,
    heroImage: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80',
    description: 'The Himalayan foothills where emerald Ganga flows, offering river camping, white-water rapids, cliff jumping, and vibrant riverside evening aartis.',
    highlightQuote: 'Thrilling white-water rafting through Himalayan gorges followed by cliff jumps into fresh mountain currents.',
    tags: ['River Rafting', 'Himalayan Foothills', 'Ganga Aarti', 'Cafe Culture', 'Adventure'],
    idealDaysMin: 3,
    idealDaysMax: 4,
    avgDailyBudgetInr: 3600,
    popularAttractions: ['White Water Rafting at Shivpuri', 'Parmarth Niketan Ganga Aarti', 'Beatles Ashram', 'Bungee Jumping & Flying Fox', 'Neer Garh Waterfall hike'],
    baseWeather: {
      tempMin: 7,
      tempMax: 19,
      condition: 'Crisp Mountain Breeze',
      weatherCode: 2,
      humidity: 55,
      precipitationProb: 5,
    },
    travelTimes: {
      'Delhi': { flight: 1.0, train: 4.5, road: 5.0 },
      'Bhopal': { flight: 4.5, train: 14.0, road: 14.5 },
    }
  },
  {
    id: 'manali',
    name: 'Manali',
    state: 'Himachal Pradesh',
    country: 'India',
    region: 'North',
    lat: 32.2432,
    lng: 77.1892,
    heroImage: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1200&q=80',
    description: 'High altitude mountain valley covered in snow-capped pine forests, bustling Mall Road, and winter sports at Solang Valley and Atal Tunnel.',
    highlightQuote: 'Stepping into snowdrifts at Solang Valley with a warm cup of spiced cider.',
    tags: ['Snow Mountains', 'Winter Sports', 'Pine Valleys', 'Cafe Culture', 'High Altitude'],
    idealDaysMin: 4,
    idealDaysMax: 5,
    avgDailyBudgetInr: 4600,
    popularAttractions: ['Solang Valley Snow Sports', 'Atal Tunnel to Sissu', 'Old Manali Cafes', 'Hadimba Temple', 'Jogini Waterfall trek'],
    baseWeather: {
      tempMin: -2,
      tempMax: 8,
      condition: 'Freezing & Snow Chances',
      weatherCode: 71,
      humidity: 68,
      precipitationProb: 25,
    },
    travelTimes: {
      'Delhi': { flight: 1.2, train: 12.0, road: 11.5 },
      'Bhopal': { flight: 6.5, train: 20.0, road: 19.0 },
    }
  },
  {
    id: 'goa',
    name: 'Goa',
    state: 'Goa',
    country: 'India',
    region: 'West',
    lat: 15.2993,
    lng: 74.1240,
    heroImage: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80',
    description: 'Sun-drenched coastal state with palm-fringed golden beaches, beach shacks, Portuguese colonial villas, and festive late December nightlife.',
    highlightQuote: 'Watching the sunset from a cliffside shack in Vagator with seafood and live acoustic music.',
    tags: ['Beach Parties', 'Portuguese Quarters', 'Water Sports', 'Nightlife', 'Seafood'],
    idealDaysMin: 4,
    idealDaysMax: 6,
    avgDailyBudgetInr: 6500,
    popularAttractions: ['Anjuna & Vagator Sunset Cliffs', 'Fontainhas Latin Quarter', 'Dudhsagar Waterfalls', 'Chapora Fort', 'Scuba Diving at Grande Island'],
    baseWeather: {
      tempMin: 21,
      tempMax: 32,
      condition: 'Warm & Tropical Sun',
      weatherCode: 0,
      humidity: 65,
      precipitationProb: 2,
    },
    travelTimes: {
      'Delhi': { flight: 2.5, train: 26.0, road: 28.0 },
      'Bhopal': { flight: 4.5, train: 22.0, road: 24.0 },
    }
  }
];

export const INITIAL_TRIP: Trip = {
  id: 'trip-dec-2026',
  name: 'Winter Getaway 2026',
  startDate: '2026-12-25',
  endDate: '2026-12-29',
  durationDays: 5,
  overlapThreshold: 25, // default 25% (up to 1 person visited allowed)
  preferences: {
    preferredTempMin: 12,
    preferredTempMax: 26,
    maxAcceptableTravelTime: 8, // hours
    travelPreference: 'any',
  },
  travelers: [
    {
      id: 'traveler-1',
      name: 'Aarav Sharma',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200&q=80',
      departureCity: 'Delhi',
      preferredTransit: 'flight',
      visitedDestinations: ['Delhi', 'Goa', 'Jaipur', 'Manali'],
      role: 'Trip Organizer',
    },
    {
      id: 'traveler-2',
      name: 'Rohan Verma',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&h=200&q=80',
      departureCity: 'Delhi',
      preferredTransit: 'any',
      visitedDestinations: ['Goa', 'Jaipur'],
      role: 'Foodie Explorer',
    },
    {
      id: 'traveler-3',
      name: 'Priya Iyer',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&h=200&q=80',
      departureCity: 'Delhi',
      preferredTransit: 'train',
      visitedDestinations: ['Manali'],
      role: 'Photographer',
    },
    {
      id: 'traveler-4',
      name: 'Karan Patel',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&h=200&q=80',
      departureCity: 'Bhopal',
      preferredTransit: 'flight',
      visitedDestinations: ['Goa', 'Udaipur'],
      role: 'Adventure Seeker',
    },
  ],
  itineraries: [
    {
      id: 'itin-option-a',
      name: 'Option A — Relaxed Dunes & Havelis',
      subtitle: 'Jaisalmer · 4 Days · Desert Camp & Living Fort',
      themeTag: 'Relaxed',
      daysCount: 4,
      destinationIds: ['jaisalmer'],
      destinationNames: ['Jaisalmer'],
      estimatedTotalBudgetInr: 18000,
      days: [
        {
          dayNumber: 1,
          dateStr: 'Dec 25, 2026',
          title: 'Arrival in the Golden City & Fort Vista',
          location: 'Jaisalmer City',
          activities: [
            {
              id: 'act-1-1',
              time: '11:30 AM',
              title: 'Arrival & Check-in at Haveli Heritage Hotel',
              category: 'stay',
              location: 'Near Gadisar Gate, Jaisalmer',
              costEstimateInr: 4500,
              notes: 'Flights arrive from Delhi & connecting from Bhopal. Unpack & refresh with ginger-mint tea.'
            },
            {
              id: 'act-1-2',
              time: '03:30 PM',
              title: 'Exploration of Sonar Qila (Living Golden Fort)',
              category: 'sightseeing',
              location: 'Jaisalmer Fort',
              costEstimateInr: 400,
              notes: 'Walk along the living fort walls where 3,000 residents still reside. Visit Jain temples.'
            },
            {
              id: 'act-1-3',
              time: '07:30 PM',
              title: 'Sunset Rooftop Dinner overlooking Fort ramparts',
              category: 'dining',
              location: 'Kaku Rooftop Cafe',
              costEstimateInr: 1200,
              notes: 'Try traditional Ker Sangri, Laal Maas, and warm Bajra Rotis with desert breeze.'
            }
          ]
        },
        {
          dayNumber: 2,
          dateStr: 'Dec 26, 2026',
          title: 'Intricate Havelis & Journey to Sam Dunes',
          location: 'Thar Desert / Sam Dunes',
          activities: [
            {
              id: 'act-2-1',
              time: '09:30 AM',
              title: 'Patwon Ki Haveli & Nathmalji Ki Haveli Tour',
              category: 'sightseeing',
              location: 'Old Town Jaisalmer',
              costEstimateInr: 500,
              notes: 'Admire the unbelievable stone jali lace carvings done by wealthy silk merchants.'
            },
            {
              id: 'act-2-2',
              time: '02:30 PM',
              title: '4x4 Desert Jeep Transfer to Sam Sand Dunes',
              category: 'travel',
              location: 'Sam Dunes, 42 km west',
              costEstimateInr: 2000,
              notes: 'Stop at the mysterious abandoned ruins of Kuldhara village along the way.'
            },
            {
              id: 'act-2-3',
              time: '04:45 PM',
              title: 'Sunset Camel Safari on Dunes & Stargazing Camp',
              category: 'leisure',
              location: 'Sam Dunes Luxury Camp',
              costEstimateInr: 5500,
              notes: 'Spectacular sunset over endless golden dunes followed by Rajasthani Kalbelia folk performance.'
            }
          ]
        },
        {
          dayNumber: 3,
          dateStr: 'Dec 27, 2026',
          title: 'Desert Sunrise & Desert National Park',
          location: 'Thar Desert & Jaisalmer',
          activities: [
            {
              id: 'act-3-1',
              time: '06:30 AM',
              title: 'Crisp Desert Sunrise & Dune Quad Biking',
              category: 'leisure',
              location: 'Sam Sand Dunes',
              costEstimateInr: 1500,
              notes: 'Watch the sunrise paint the sand ripples in violet and orange.'
            },
            {
              id: 'act-3-2',
              time: '12:00 PM',
              title: 'Return to City & Gadisar Lake Boat Ride',
              category: 'leisure',
              location: 'Gadisar Lake',
              costEstimateInr: 300,
              notes: 'Peaceful pedal boating past ancient stone cenotaphs surrounded by migratory winter birds.'
            },
            {
              id: 'act-3-3',
              time: '04:00 PM',
              title: 'Artisan Leather & Camel Wool Market Shopping',
              category: 'sightseeing',
              location: 'Bhatia Bazaar & Sadar Bazaar',
              costEstimateInr: 1000,
              notes: 'Handmade leather journals, mirror-work quilts, and desert fossils.'
            }
          ]
        },
        {
          dayNumber: 4,
          dateStr: 'Dec 28, 2026',
          title: 'Royal Cenotaphs & Farewell Feast',
          location: 'Bada Bagh & Jaisalmer Airport',
          activities: [
            {
              id: 'act-4-1',
              time: '09:00 AM',
              title: 'Bada Bagh Royal Cenotaphs Photography',
              category: 'sightseeing',
              location: 'Bada Bagh (6 km north)',
              costEstimateInr: 350,
              notes: 'Stunning sandstone memorials of Bhatti royal rulers set on a windswept hill with wind turbines.'
            },
            {
              id: 'act-4-2',
              time: '01:00 PM',
              title: 'Farewell Royal Lunch & Group Departure',
              category: 'dining',
              location: 'Suryagarh Courtyard',
              costEstimateInr: 2200,
              notes: 'Final grand feast celebrating the winter desert getaway before heading to airport.'
            }
          ]
        }
      ]
    },
    {
      id: 'itin-option-b',
      name: 'Option B — Regal Culture & Palaces',
      subtitle: 'Udaipur · 4 Days · City of Lakes & Romance',
      themeTag: 'Culture',
      daysCount: 4,
      destinationIds: ['udaipur'],
      destinationNames: ['Udaipur'],
      estimatedTotalBudgetInr: 21000,
      days: [
        {
          dayNumber: 1,
          dateStr: 'Dec 25, 2026',
          title: 'Arrival in the Venice of the East',
          location: 'Lake Pichola, Udaipur',
          activities: [
            {
              id: 'act-b1-1',
              time: '12:00 PM',
              title: 'Check-in at Lake-facing Haveli',
              category: 'stay',
              location: 'Lal Ghat, Udaipur',
              costEstimateInr: 5500,
              notes: 'Check into rooms with traditional jharokhas looking out over the calm waters of Pichola.'
            },
            {
              id: 'act-b1-2',
              time: '04:30 PM',
              title: 'Lake Pichola Sunset Cruise to Jag Mandir',
              category: 'sightseeing',
              location: 'Rameshwar Ghat to Jag Mandir Island',
              costEstimateInr: 950,
              notes: 'Float past the floating Lake Palace and take tea inside the marble courtyard of Jag Mandir.'
            },
            {
              id: 'act-b1-3',
              time: '07:30 PM',
              title: 'Bagore Ki Haveli Dharohar Dance Show',
              category: 'sightseeing',
              location: 'Gangaur Ghat',
              costEstimateInr: 300,
              notes: 'Incredible traditional puppet theater, fire dances, and Rajasthani pot balance performances.'
            }
          ]
        },
        {
          dayNumber: 2,
          dateStr: 'Dec 26, 2026',
          title: 'Royal Splendor at City Palace Complex',
          location: 'Old City Udaipur',
          activities: [
            {
              id: 'act-b2-1',
              time: '09:30 AM',
              title: 'Comprehensive City Palace Guided Walk',
              category: 'sightseeing',
              location: 'City Palace Museum',
              costEstimateInr: 800,
              notes: 'Explore the Sheesh Mahal, peacock mosaic courtyard, and crystal gallery.'
            },
            {
              id: 'act-b2-2',
              time: '01:30 PM',
              title: 'Traditional Mewari Thali Lunch at Natraj',
              category: 'dining',
              location: 'Bapu Bazaar',
              costEstimateInr: 450,
              notes: 'Unlimited ghee-laden dal baati churma and gatte ki sabzi.'
            },
            {
              id: 'act-b2-3',
              time: '04:30 PM',
              title: 'Sajjangarh (Monsoon Palace) Sunset Vista',
              category: 'sightseeing',
              location: 'Bansdara Hill Peak',
              costEstimateInr: 600,
              notes: 'Panoramas of the entire valley, lakes, and twinkling lights as night falls.'
            }
          ]
        },
        {
          dayNumber: 3,
          dateStr: 'Dec 27, 2026',
          title: 'Artisan Villages & Fateh Sagar Walk',
          location: 'Fateh Sagar & Shilpgram',
          activities: [
            {
              id: 'act-b3-1',
              time: '10:00 AM',
              title: 'Shilpgram Rural Arts and Crafts Complex',
              category: 'sightseeing',
              location: 'Near Havala Village',
              costEstimateInr: 400,
              notes: 'Interactive pottery, live miniature painting demonstrations, and folk music.'
            },
            {
              id: 'act-b3-2',
              time: '03:00 PM',
              title: 'Saheliyon Ki Bari (Garden of the Maids)',
              category: 'leisure',
              location: 'Saheli Marg',
              costEstimateInr: 150,
              notes: 'Fountains, marble elephants, and lush bougainvillea gardens.'
            },
            {
              id: 'act-b3-3',
              time: '05:30 PM',
              title: 'Fateh Sagar Lake Drive & Kulhad Coffee',
              category: 'dining',
              location: 'Fateh Sagar Promenade',
              costEstimateInr: 250,
              notes: 'Taste famous hot cold coffee and bread pakoras alongside lake breeze.'
            }
          ]
        },
        {
          dayNumber: 4,
          dateStr: 'Dec 28, 2026',
          title: 'Jagdish Temple, Souvenirs & Departure',
          location: 'Udaipur City Center',
          activities: [
            {
              id: 'act-b4-1',
              time: '09:00 AM',
              title: '1651 AD Jagdish Temple Morning Aarti',
              category: 'sightseeing',
              location: 'City Center',
              costEstimateInr: 100,
              notes: 'Carved stone pillars and morning devotional hymns.'
            },
            {
              id: 'act-b4-2',
              time: '11:00 AM',
              title: 'Hathi Pol Bazaar Miniature Art & Leather Shopping',
              category: 'sightseeing',
              location: 'Hathi Pol',
              costEstimateInr: 1500,
              notes: 'Pick up famous Pichwai art prints and bandhani silk scarves.'
            }
          ]
        }
      ]
    },
    {
      id: 'itin-option-c',
      name: 'Option C — Multi-City Desert Explorer',
      subtitle: 'Jodhpur + Jaisalmer · 5 Days · The Grand Rajasthan Circuit',
      themeTag: 'Multi-city',
      daysCount: 5,
      destinationIds: ['jodhpur', 'jaisalmer'],
      destinationNames: ['Jodhpur', 'Jaisalmer'],
      estimatedTotalBudgetInr: 24500,
      days: [
        {
          dayNumber: 1,
          dateStr: 'Dec 25, 2026',
          title: 'Touchdown in the Blue City Jodhpur',
          location: 'Jodhpur',
          activities: [
            {
              id: 'act-c1-1',
              time: '11:00 AM',
              title: 'Arrival in Jodhpur & Old City Check-in',
              category: 'stay',
              location: 'Navchokiya / Blue Quarter',
              costEstimateInr: 4000,
              notes: 'Delhi & Bhopal friends rendezvous at boutique heritage stay.'
            },
            {
              id: 'act-c1-2',
              time: '02:30 PM',
              title: 'Mehrangarh Fort Tour & Flying Fox Zipline',
              category: 'sightseeing',
              location: 'Mehrangarh Fort',
              costEstimateInr: 2200,
              notes: 'Zip across fort lakes with birds-eye views of the blue indigo houses below.'
            },
            {
              id: 'act-c1-3',
              time: '06:30 PM',
              title: 'Blue City Sunset Photowalk through Navchokiya',
              category: 'leisure',
              location: 'Old Town Jodhpur',
              costEstimateInr: 200,
              notes: 'Wander labyrinthine indigo blue lanes and capture golden hour silhouettes.'
            }
          ]
        },
        {
          dayNumber: 2,
          dateStr: 'Dec 26, 2026',
          title: 'Jodhpur Highlights & Scenic Desert Drive',
          location: 'Jodhpur to Jaisalmer (280 km)',
          activities: [
            {
              id: 'act-c2-1',
              time: '08:30 AM',
              title: 'Jaswant Thada Marble Cenotaphs & Shahi Samosa',
              category: 'sightseeing',
              location: 'Clock Tower & Jaswant Thada',
              costEstimateInr: 300,
              notes: 'Translucent marble monuments followed by Jodhpur famous mawa kachori breakfast.'
            },
            {
              id: 'act-c2-2',
              time: '11:30 AM',
              title: 'Private AC Cruiser Highway Drive to Jaisalmer',
              category: 'travel',
              location: 'NH 11 Thar Highway',
              costEstimateInr: 3500,
              notes: 'Scenic 4.5 hour drive across arid landscapes with peacock sightings along the way.'
            },
            {
              id: 'act-c2-3',
              time: '05:30 PM',
              title: 'Sunset View at Gadisar Lake Ghats',
              category: 'leisure',
              location: 'Gadisar Lake, Jaisalmer',
              costEstimateInr: 250,
              notes: 'Arrival in Jaisalmer, unwind with hot chai as temple lights turn on.'
            }
          ]
        },
        {
          dayNumber: 3,
          dateStr: 'Dec 27, 2026',
          title: 'Golden Fort & Sam Desert Dunes Camping',
          location: 'Jaisalmer & Sam Dunes',
          activities: [
            {
              id: 'act-c3-1',
              time: '09:30 AM',
              title: 'Golden Fort Walk & Cannon Vantage Point',
              category: 'sightseeing',
              location: 'Jaisalmer Fort Ramparts',
              costEstimateInr: 400,
              notes: 'See the entire golden sandstone city and Thar plains from the upper bastion.'
            },
            {
              id: 'act-c3-2',
              time: '03:00 PM',
              title: 'Transfer to Luxury Desert Camp at Sam',
              category: 'stay',
              location: 'Thar Desert Sand Dunes',
              costEstimateInr: 6000,
              notes: 'Swiss luxury tents with private washrooms, camel rides, and dune buggy safari.'
            },
            {
              id: 'act-c3-3',
              time: '07:30 PM',
              title: 'Rajasthani Campfire Gala, Folk Dance & Buffet',
              category: 'dining',
              location: 'Desert Camp Amphitheater',
              costEstimateInr: 1500,
              notes: 'Campfire warmth against crisp desert winter night under millions of stars.'
            }
          ]
        },
        {
          dayNumber: 4,
          dateStr: 'Dec 28, 2026',
          title: 'Ghost Village & Haveli Masterpieces',
          location: 'Kuldhara & Jaisalmer',
          activities: [
            {
              id: 'act-c4-1',
              time: '10:00 AM',
              title: 'Kuldhara Haunted Heritage Village Walk',
              category: 'sightseeing',
              location: 'Kuldhara',
              costEstimateInr: 200,
              notes: 'Fascinating 13th-century abandoned Paliwal Brahmin village frozen in time.'
            },
            {
              id: 'act-c4-2',
              time: '02:30 PM',
              title: 'Patwon Ki Haveli Jali Architecture Exploration',
              category: 'sightseeing',
              location: 'Old Jaisalmer',
              costEstimateInr: 300,
              notes: 'Five adjoining havelis built over 50 years with mind-bending stonework.'
            },
            {
              id: 'act-c4-3',
              time: '07:00 PM',
              title: 'Traditional Group Dinner at The Trio',
              category: 'dining',
              location: 'Mandir Palace Road',
              costEstimateInr: 1200,
              notes: 'Live classical sitar melodies and exquisite Rajasthani delicacies.'
            }
          ]
        },
        {
          dayNumber: 5,
          dateStr: 'Dec 29, 2026',
          title: 'Morning Souvenir Hunt & Departure Flights',
          location: 'Jaisalmer / Jodhpur Airport',
          activities: [
            {
              id: 'act-c5-1',
              time: '09:00 AM',
              title: 'Local Spices & Handicrafts Pickups',
              category: 'leisure',
              location: 'Fort Gate Market',
              costEstimateInr: 1000,
              notes: 'Mathania red chillies, camel leather satchels, and desert fossils.'
            },
            {
              id: 'act-c5-2',
              time: '12:30 PM',
              title: 'Group Return Departures to Delhi & Bhopal',
              category: 'travel',
              location: 'Jaisalmer Airport',
              costEstimateInr: 3500,
              notes: 'Head back refreshed after an unforgettable multi-city desert expedition.'
            }
          ]
        }
      ]
    }
  ]
};
