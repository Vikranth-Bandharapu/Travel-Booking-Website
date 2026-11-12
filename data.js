/* ==========================================================================
   Meridian — Curated Destinations Dataset (8 Destinations)
   ========================================================================== */

(function (global) {
  'use strict';

  const Meridian = (global.Meridian = global.Meridian || {});
  Meridian.data = Meridian.data || {};

  Meridian.data.destinations = [
    {
      id: 'santorini',
      name: 'Santorini',
      country: 'Greece',
      region: 'Europe',
      vibe: 'Coastal',
      stayCount: 14,
      startingPrice: 265,
      bestSeason: 'May – Oct',
      tagline: 'Caldera cliffside suites, volcanic beaches & Aegean sunsets.',
      image: 'assets/santorini.webp',
      alt: 'Whitewashed cliffside architecture and blue domes in Oia, Santorini overlooking the Aegean Sea'
    },
    {
      id: 'kyoto',
      name: 'Kyoto',
      country: 'Japan',
      region: 'Asia',
      vibe: 'Cultural',
      stayCount: 18,
      startingPrice: 215,
      bestSeason: 'Mar – Nov',
      tagline: 'Cedar ryokans, lantern alleys, moss temples & kaiseki rituals.',
      image: 'assets/kyoto.webp',
      alt: 'Traditional wooden pagoda and stone lantern pathway framed by autumn foliage in Kyoto'
    },
    {
      id: 'amalfi',
      name: 'Amalfi Coast',
      country: 'Italy',
      region: 'Europe',
      vibe: 'Coastal',
      stayCount: 16,
      startingPrice: 295,
      bestSeason: 'May – Sep',
      tagline: 'Lemon-terraced villas perched above Positano & Ravello coves.',
      image: 'assets/amalfi.webp',
      alt: 'Colorful Positano cliffside village descending to the azure Amalfi Sea'
    },
    {
      id: 'bali',
      name: 'Ubud, Bali',
      country: 'Indonesia',
      region: 'Asia',
      vibe: 'Island',
      stayCount: 22,
      startingPrice: 155,
      bestSeason: 'Apr – Oct',
      tagline: 'Emerald river valleys, bamboo sanctuaries & open-air wellness.',
      image: 'assets/bali.webp',
      alt: 'Misty sunrise over emerald rice terraces and palm trees in Ubud, Bali'
    },
    {
      id: 'zermatt',
      name: 'Zermatt Alps',
      country: 'Switzerland',
      region: 'Europe',
      vibe: 'Alpine',
      stayCount: 11,
      startingPrice: 420,
      bestSeason: 'Dec – Mar · Jul',
      tagline: 'Car-free timber chalets beneath the Matterhorn snowline.',
      image: 'assets/zermatt.webp',
      alt: 'Matterhorn alpine peak rising behind cozy wooden chalets in Zermatt, Switzerland'
    },
    {
      id: 'marrakech',
      name: 'Marrakech',
      country: 'Morocco',
      region: 'Africa',
      vibe: 'Desert',
      stayCount: 15,
      startingPrice: 185,
      bestSeason: 'Mar – May · Oct',
      tagline: 'Restored zellige courtyard riads & Atlas Mountain horizons.',
      image: 'assets/marrakech.webp',
      alt: 'Traditional Marrakech courtyard riad with terracotta arches, fountain, and citrus trees'
    },
    {
      id: 'reykjavik',
      name: 'Reykjavik & South',
      country: 'Iceland',
      region: 'Europe',
      vibe: 'Alpine',
      stayCount: 9,
      startingPrice: 310,
      bestSeason: 'Sep – Mar',
      tagline: 'Basalt thermal lodges, geothermal lagoons & aurora skies.',
      image: 'assets/reykjavik.webp',
      alt: 'Steaming turquoise geothermal pool nestled against dramatic black volcanic cliffs in Iceland'
    },
    {
      id: 'maldives',
      name: 'Baa Atoll',
      country: 'Maldives',
      region: 'Asia',
      vibe: 'Island',
      stayCount: 10,
      startingPrice: 680,
      bestSeason: 'Nov – Apr',
      tagline: 'UNESCO coral reefs, sandbars & tranquil overwater villas.',
      image: 'assets/maldives.webp',
      alt: 'Crystal turquoise lagoon with wooden overwater villas in Baa Atoll, Maldives'
    }
  ];
})(window);


/* ==========================================================================
   Meridian — Curated Travel Experiences Dataset (4 Interactive Tabs)
   ========================================================================== */

(function (global) {
  'use strict';

  const Meridian = (global.Meridian = global.Meridian || {});
  Meridian.data = Meridian.data || {};

  Meridian.data.experiences = [
    {
      id: 'coastal-romance',
      tabLabel: 'Coastal Romance',
      eyebrow: 'Aegean & Tyrrhenian Horizons',
      title: 'Sunset cliffside terraces & private infinity plunge pools.',
      description:
        'Designed for milestone celebrations and unhurried coastal mornings—featuring carved caldera suites, lemon-grove villas, and private wooden boat charters.',
      image: 'assets/caldera-horizon.webp',
      alt: 'Cliffside infinity pool overlooking the Aegean Sea at sunset in Santorini',
      highlights: [
        'Private sunset terrace & heated plunge pool access',
        'Complimentary artisanal Mediterranean breakfast daily',
        'Concierge-arranged sailing & coastal vineyard tastings'
      ],
      startingEstimate: 265,
      filterCategory: 'Boutique',
      featuredDestinations: ['Santorini', 'Amalfi Coast', 'Baa Atoll']
    },
    {
      id: 'wellness-onsen',
      tabLabel: 'Wellness & Retreats',
      eyebrow: 'Restorative Water & Canopy',
      title: 'Thermal mineral springs, cedar onsens & jungle yoga pavilions.',
      description:
        'Step away from city noise into geothermal lava pools, bamboo river sanctuaries, and private cedarwood soaking rituals surrounded by quiet nature.',
      image: 'assets/kamo-ryokan.webp',
      alt: 'Steaming private stone onsen bath beside a tranquil Japanese maple garden in Kyoto',
      highlights: [
        'Private mineral onsen or geothermal spring bathing',
        'Daily guided mindfulness, yoga & holistic spa rituals',
        'Seasonal farm-to-table & kaiseki nourishment menus'
      ],
      startingEstimate: 155,
      filterCategory: 'Resort',
      featuredDestinations: ['Ubud, Bali', 'Kyoto', 'Reykjavik & South']
    },
    {
      id: 'alpine-adventure',
      tabLabel: 'Alpine & Dark Skies',
      eyebrow: 'High Peaks & Nordic Trails',
      title: 'Car-free timber chalets & aurora-view thermal lodges.',
      description:
        'From ski-in larch-wood balconies beneath the Matterhorn to basalt retreats built along Iceland’s volcanic coastlines under northern aurora skies.',
      image: 'assets/matterhorn-chalet.webp',
      alt: 'Timber alpine chalet resort with warm lights and steaming thermal pools in Zermatt',
      highlights: [
        'Direct glacier slope access & private alpine saunas',
        'Heated outdoor mineral pools & fireplace lounges',
        'Evening aurora alerts & private mountain guide options'
      ],
      startingEstimate: 330,
      filterCategory: 'Alpine Chalet',
      featuredDestinations: ['Zermatt Alps', 'Reykjavik & South']
    },
    {
      id: 'cultural-heritage',
      tabLabel: 'Cultural Heritage',
      eyebrow: 'Living Architectural Craft',
      title: 'Restored zellige courtyard riads, machiya inns & cave suites.',
      description:
        'Stay inside living landmarks crafted with hand-carved cedarwork, zellige tile fountains, traditional tatami rooms, and centuries-old cycladic stone.',
      image: 'assets/marrakech.webp',
      alt: 'Marrakech courtyard riad with terracotta arches, citrus trees, and zellige fountain',
      highlights: [
        'Intimate 10-to-18 suite historic estates with quiet courtyards',
        'Private tea ceremonies, hammam rituals & artisan walks',
        'Walkable proximity to UNESCO quarters & local markets'
      ],
      startingEstimate: 185,
      filterCategory: 'Heritage',
      featuredDestinations: ['Marrakech', 'Kyoto', 'Santorini']
    }
  ];
})(window);


/* ==========================================================================
   Stackly — Signature Multi-Day Itineraries Dataset (3 Packages)
   ========================================================================== */

(function (global) {
  'use strict';

  const Meridian = (global.Meridian = global.Meridian || {});
  Meridian.data = Meridian.data || {};

  Meridian.data.itineraries = [
    {
      id: 'aegean-caldera-5d',
      duration: '5 Days · 4 Nights',
      region: 'Santorini, Greece',
      title: 'Aegean Caldera & Sunset Sailing Loop',
      route: ['Oia Cliffs', 'Finikia Vineyards', 'Red Beach Cove'],
      perPersonPrice: 1480,
      anchorHotelId: 'caldera-horizon-suites',
      image: 'assets/santorini.webp',
      alt: 'Santorini whitewashed cliffside homes and blue domes above the Aegean Sea',
      inclusions: ['Catamaran Sunset Cruise', 'Private Port Transfer', 'Daily Cliffside Breakfast'],
      days: [
        'Day 1: Private arrival transfer to Oia & golden-hour caldera welcome.',
        'Day 2: Guided Finikia vineyard walk & volcanic wine tasting.',
        'Day 3: Semi-private Aegean catamaran sail past hot springs & coves.',
        'Day 4: Leisure morning by your plunge pool & farewell cliffside dinner.',
        'Day 5: Artisanal Greek breakfast & private airport/ferry drop-off.'
      ]
    },
    {
      id: 'kyoto-heritage-6d',
      duration: '6 Days · 5 Nights',
      region: 'Kyoto, Japan',
      title: 'Cedar Ryokans, Bamboo Trails & Tea Rituals',
      route: ['Higashiyama', 'Arashiyama', 'Fushimi'],
      perPersonPrice: 1890,
      anchorHotelId: 'kamo-river-ryokan',
      image: 'assets/kyoto.webp',
      alt: 'Kyoto wooden pagoda and autumn stone lantern path',
      inclusions: ['Private Kaiseki Dinner', 'Machiya Tea Ceremony', 'Onsen Suite Access'],
      days: [
        'Day 1: Check into Kamo River Ryokan & evening lantern stroll.',
        'Day 2: Dawn walk at Fushimi Inari & private matcha tea ceremony.',
        'Day 3: Arashiyama bamboo grove cycling & cedarwood soaking ritual.',
        'Day 4: Nishiki Market culinary tour & artisan pottery workshop.',
        'Day 5: Philosopher’s Path temples & seasonal 9-course kaiseki dinner.',
        'Day 6: Morning zen garden breakfast & Kyoto Station express transfer.'
      ]
    },
    {
      id: 'bali-wellness-4d',
      duration: '4 Days · 3 Nights',
      region: 'Ubud, Bali',
      title: 'Rainforest Canopy, Rice Terraces & Holistic Reset',
      route: ['Ayung Gorge', 'Tegallalang', 'Campuhan Ridge'],
      perPersonPrice: 860,
      anchorHotelId: 'ayung-canopy-sanctuary',
      image: 'assets/bali.webp',
      alt: 'Emerald tiered rice terraces and morning mist in Ubud, Bali',
      inclusions: ['Daily Sunrise Yoga', '90-Min Balinese Spa', 'Organic Farm Dining'],
      days: [
        'Day 1: Airport pickup to Ayung Canopy Sanctuary & herbal welcome tonic.',
        'Day 2: Sunrise ridge yoga, infinity pool afternoon & 90-min holistic spa.',
        'Day 3: Guided Tegallalang rice terrace sunrise walk & organic lunch.',
        'Day 4: Floating breakfast in your jungle pavilion & late check-out.'
      ]
    }
  ];
})(window);


/* ==========================================================================
   Stackly — Seasonal Travel Planner Dataset (4 Seasons)
   ========================================================================== */

(function (global) {
  'use strict';

  const Meridian = (global.Meridian = global.Meridian || {});
  Meridian.data = Meridian.data || {};

  Meridian.data.seasons = [
    {
      id: 'spring',
      label: 'Spring',
      months: 'Mar – May',
      iconClass: 'fa-solid fa-seedling',
      headline: 'Blossoms, mild coastal breezes & uncrowded historic quarters.',
      picks: [
        {
          destinationId: 'kyoto',
          name: 'Kyoto, Japan',
          temp: '18°C · Crisp & Sunny',
          crowd: 'Peak Blossoms',
          highlight: 'Cherry blossom canal walks & cool evening cedar onsens.'
        },
        {
          destinationId: 'marrakech',
          name: 'Marrakech, Morocco',
          temp: '25°C · Warm Dry Sun',
          crowd: 'Ideal Weather',
          highlight: 'Orange blossom courtyards before summer desert heat arrives.'
        },
        {
          destinationId: 'amalfi',
          name: 'Amalfi Coast, Italy',
          temp: '21°C · Coastal Breeze',
          crowd: 'Shoulder Calm',
          highlight: 'Blooming lemon groves & quiet Positano cliffside trails.'
        },
        {
          destinationId: 'bali',
          name: 'Ubud, Bali',
          temp: '27°C · Lush Green',
          crowd: 'Balanced',
          highlight: 'Vibrant emerald rice paddies as dry season begins.'
        }
      ]
    },
    {
      id: 'summer',
      label: 'Summer',
      months: 'Jun – Aug',
      iconClass: 'fa-solid fa-sun',
      headline: 'Long Mediterranean golden hours, alpine trails & clear turquoise coves.',
      picks: [
        {
          destinationId: 'santorini',
          name: 'Santorini, Greece',
          temp: '29°C · Endless Sun',
          crowd: 'Peak Coastal',
          highlight: 'Warm Aegean swimming & late 8:30 PM caldera sunsets.'
        },
        {
          destinationId: 'amalfi',
          name: 'Amalfi Coast, Italy',
          temp: '30°C · Sea Breeze',
          crowd: 'Vibrant Summer',
          highlight: 'Private wooden boat charters & Ravello music evenings.'
        },
        {
          destinationId: 'bali',
          name: 'Ubud, Bali',
          temp: '26°C · Low Humidity',
          crowd: 'Best Dry Season',
          highlight: 'Clear volcanic mornings & open-air canopy yoga.'
        },
        {
          destinationId: 'zermatt',
          name: 'Zermatt Alps, Switzerland',
          temp: '19°C · Alpine Fresh',
          crowd: 'Hiking Season',
          highlight: 'Wildflower alpine trails & glacial lake picnics.'
        }
      ]
    },
    {
      id: 'autumn',
      label: 'Autumn',
      months: 'Sep – Nov',
      iconClass: 'fa-solid fa-leaf',
      headline: 'Warm seas without summer crowds, autumn maples & northern lights.',
      picks: [
        {
          destinationId: 'kyoto',
          name: 'Kyoto, Japan',
          temp: '17°C · Crisp Air',
          crowd: 'Autumn Foliage',
          highlight: 'Crimson maple gardens & seasonal harvest kaiseki menus.'
        },
        {
          destinationId: 'santorini',
          name: 'Santorini, Greece',
          temp: '23°C · Warm Sea',
          crowd: 'Ideal Shoulder',
          highlight: 'Vineyard grape harvest & peaceful sunset terraces.'
        },
        {
          destinationId: 'reykjavik',
          name: 'Reykjavik & South, Iceland',
          temp: '6°C · Clear Nights',
          crowd: 'Aurora Start',
          highlight: 'Early northern lights above steaming geothermal pools.'
        },
        {
          destinationId: 'marrakech',
          name: 'Marrakech, Morocco',
          temp: '24°C · Golden Light',
          crowd: 'Prime Season',
          highlight: 'Crisp rooftop dinners overlooking the Atlas peaks.'
        }
      ]
    },
    {
      id: 'winter',
      label: 'Winter',
      months: 'Dec – Feb',
      iconClass: 'fa-regular fa-snowflake',
      headline: 'Powder alpine slopes, aurora skies & tropical coral lagoons.',
      picks: [
        {
          destinationId: 'maldives',
          name: 'Baa Atoll, Maldives',
          temp: '29°C · Glass Calm',
          crowd: 'Prime Dry Season',
          highlight: 'Peak underwater visibility across UNESCO coral reefs.'
        },
        {
          destinationId: 'zermatt',
          name: 'Zermatt Alps, Switzerland',
          temp: '-2°C · Fresh Powder',
          crowd: 'Peak Ski Season',
          highlight: 'Ski-in timber chalets, fondue hearths & glacier runs.'
        },
        {
          destinationId: 'reykjavik',
          name: 'Reykjavik & South, Iceland',
          temp: '1°C · Dark Skies',
          crowd: 'Peak Aurora',
          highlight: 'Long starry nights ideal for aurora glass-roof lodges.'
        },
        {
          destinationId: 'marrakech',
          name: 'Marrakech, Morocco',
          temp: '20°C · Mild Sun',
          crowd: 'Winter Escape',
          highlight: 'Sunny courtyard pools & quiet medina artisan strolls.'
        }
      ]
    }
  ];
})(window);


/* ==========================================================================
   Meridian — Curated Hotels Dataset (12 Hotels)
   ========================================================================== */

(function (global) {
  'use strict';

  const Meridian = (global.Meridian = global.Meridian || {});
  Meridian.data = Meridian.data || {};

  Meridian.data.hotels = [
    {
      id: 'caldera-horizon-suites',
      name: 'Caldera Horizon Suites',
      destinationId: 'santorini',
      location: 'Oia, Santorini',
      country: 'Greece',
      category: 'Boutique',
      stars: 5,
      rating: 4.95,
      reviews: 318,
      pricePerNight: 390,
      featuredRank: 1,
      badge: 'Editor Pick',
      freeCancellation: true,
      amenities: ['Infinity Pool', 'Breakfast Included', 'Sunset Terrace', 'Airport Transfer'],
      description: 'Sculpted limestone suites hovering above the Aegean with heated caldera plunge pools.',
      image: 'assets/caldera-horizon.webp'
    },
    {
      id: 'kamo-river-ryokan',
      name: 'Kamo River Ryokan',
      destinationId: 'kyoto',
      location: 'Higashiyama, Kyoto',
      country: 'Japan',
      category: 'Heritage',
      stars: 5,
      rating: 4.92,
      reviews: 276,
      pricePerNight: 420,
      featuredRank: 2,
      badge: 'Top Rated',
      freeCancellation: true,
      amenities: ['Private Onsen', 'Kaiseki Dining', 'Zen Garden', 'Tea Ceremony'],
      description: 'Intimate 12-suite cedar sanctuary with cedarwood soaking tubs and seasonal Kyoto cuisine.',
      image: 'assets/kamo-ryokan.webp'
    },
    {
      id: 'villa-ravello-belvedere',
      name: 'Villa Ravello Belvedere',
      destinationId: 'amalfi',
      location: 'Ravello, Amalfi Coast',
      country: 'Italy',
      category: 'Resort',
      stars: 5,
      rating: 4.89,
      reviews: 243,
      pricePerNight: 485,
      featuredRank: 3,
      badge: 'Coastal Gem',
      freeCancellation: true,
      amenities: ['Cliffside Pool', 'Lemon Grove', 'Private Beach Club', 'Valet'],
      description: 'Restored 18th-century hillside estate framed by terraced citrus gardens and sea vistas.',
      image: 'assets/villa-ravello.webp'
    },
    {
      id: 'atoll-lagoon-villas',
      name: 'Baa Atoll Lagoon Villas',
      destinationId: 'maldives',
      location: 'Baa Atoll',
      country: 'Maldives',
      category: 'Overwater Villa',
      stars: 5,
      rating: 4.96,
      reviews: 329,
      pricePerNight: 890,
      featuredRank: 4,
      badge: 'Ultra Luxury',
      freeCancellation: false,
      amenities: ['Overwater Pool', 'Reef Snorkeling', 'Private Butler', 'Seaplane Lounge'],
      description: 'Solar-powered timber villas suspended over a protected biosphere coral lagoon.',
      image: 'assets/atoll-villas.webp'
    },
    {
      id: 'ayung-canopy-sanctuary',
      name: 'Ayung Canopy Sanctuary',
      destinationId: 'bali',
      location: 'Ubud, Bali',
      country: 'Indonesia',
      category: 'Resort',
      stars: 5,
      rating: 4.86,
      reviews: 412,
      pricePerNight: 240,
      featuredRank: 5,
      badge: 'Best Value',
      freeCancellation: true,
      amenities: ['Jungle Infinity Pool', 'Holistic Spa', 'Daily Yoga', 'Breakfast Included'],
      description: 'Open-pavilion jungle villas above the Ayung river gorge with farm-to-table dining.',
      image: 'assets/ayung-sanctuary.webp'
    },
    {
      id: 'matterhorn-timber-chalet',
      name: 'Matterhorn Timber Chalet',
      destinationId: 'zermatt',
      location: 'Zermatt, Alps',
      country: 'Switzerland',
      category: 'Alpine Chalet',
      stars: 5,
      rating: 4.91,
      reviews: 195,
      pricePerNight: 540,
      featuredRank: 6,
      badge: 'Alpine Icon',
      freeCancellation: true,
      amenities: ['Ski-in Ski-out', 'Alpine Sauna', 'Fireplace Lounge', 'Mountain Balcony'],
      description: 'Larch-wood alpine lodge offering direct glacier slopes access and panoramic sauna suites.',
      image: 'assets/matterhorn-chalet.webp'
    },
    {
      id: 'nordic-basalt-lodge',
      name: 'Nordic Basalt Thermal Lodge',
      destinationId: 'reykjavik',
      location: 'Reykjanes, Iceland',
      country: 'Iceland',
      category: 'Alpine Chalet',
      stars: 4,
      rating: 4.81,
      reviews: 174,
      pricePerNight: 330,
      featuredRank: 7,
      badge: 'Aurora Watch',
      freeCancellation: true,
      amenities: ['Geothermal Spring', 'Glass Roof', 'Nordic Sauna', 'EV Charging'],
      description: 'Minimalist lava-stone retreat built beside natural mineral hot springs under dark skies.',
      image: 'assets/nordic-basalt.webp'
    },
    {
      id: 'dar-zellige-riad',
      name: 'Dar Zellige Courtyard Riad',
      destinationId: 'marrakech',
      location: 'Medina, Marrakech',
      country: 'Morocco',
      category: 'Heritage',
      stars: 4,
      rating: 4.76,
      reviews: 267,
      pricePerNight: 185,
      featuredRank: 8,
      badge: 'Artisan Stay',
      freeCancellation: true,
      amenities: ['Courtyard Pool', 'Hammam Spa', 'Rooftop Dining', 'Breakfast Included'],
      description: 'Hand-carved plasterwork and emerald tile courtyard tucked inside a quiet medina lane.',
      image: 'assets/dar-zellige.webp'
    },
    {
      id: 'oia-limestone-retreat',
      name: 'Oia Limestone Retreat',
      destinationId: 'santorini',
      location: 'Finikia, Santorini',
      country: 'Greece',
      category: 'Heritage',
      stars: 4,
      rating: 4.78,
      reviews: 204,
      pricePerNight: 265,
      featuredRank: 9,
      badge: 'Quiet Village',
      freeCancellation: true,
      amenities: ['Cave Plunge Pool', 'Aegean Views', 'Spa Lounge', 'Free Wi-Fi'],
      description: 'Restored 19th-century captain houses surrounded by vineyards and cobbled paths.',
      image: 'assets/oia-limestone.webp'
    },
    {
      id: 'positano-casa-limonaia',
      name: 'Positano Casa Limonaia',
      destinationId: 'amalfi',
      location: 'Positano, Amalfi Coast',
      country: 'Italy',
      category: 'Boutique',
      stars: 4,
      rating: 4.58,
      reviews: 162,
      pricePerNight: 295,
      featuredRank: 10,
      badge: 'Sea Terrace',
      freeCancellation: true,
      amenities: ['Cliffside Balcony', 'Breakfast Included', 'Boat Charters', 'Rooftop Bar'],
      description: 'Sun-drenched Mediterranean rooms featuring hand-painted Vietri majolica floors.',
      image: 'assets/casa-limonaia.webp'
    },
    {
      id: 'arashiyama-cedar-inn',
      name: 'Arashiyama Cedar Inn',
      destinationId: 'kyoto',
      location: 'Arashiyama, Kyoto',
      country: 'Japan',
      category: 'Boutique',
      stars: 4,
      rating: 4.64,
      reviews: 189,
      pricePerNight: 215,
      featuredRank: 11,
      badge: 'Garden View',
      freeCancellation: true,
      amenities: ['Bamboo Access', 'Breakfast Included', 'Hinoki Bath', 'City Bicycles'],
      description: 'Warm modern tatami rooms steps from serene morning walks through Arashiyama.',
      image: 'assets/arashiyama-inn.webp'
    },
    {
      id: 'ubud-bamboo-pavilion',
      name: 'Ubud Bamboo Pavilion',
      destinationId: 'bali',
      location: 'Tegallalang, Bali',
      country: 'Indonesia',
      category: 'Boutique',
      stars: 3,
      rating: 4.42,
      reviews: 148,
      pricePerNight: 155,
      featuredRank: 12,
      badge: 'Eco Retreat',
      freeCancellation: true,
      amenities: ['Rice Terrace Deck', 'Organic Cafe', 'Scooter Rental', 'Free Wi-Fi'],
      description: 'Airy handcrafted bamboo eco-lofts overlooking emerald terraced paddies.',
      image: 'assets/ubud-bamboo.webp'
    }
  ];
})(window);


/* ==========================================================================
   Meridian — Promotional Offers Dataset (4 Offers)
   ========================================================================== */

(function (global) {
  'use strict';

  const Meridian = (global.Meridian = global.Meridian || {});
  Meridian.data = Meridian.data || {};

  Meridian.data.offers = [
    {
      id: 'earlybird',
      code: 'EARLYBIRD20',
      badge: 'Limited Time',
      discountLabel: '20% OFF',
      title: 'Early Planner Coastal & Alpine Escape',
      description: 'Save 20% across all destinations when reserving a stay of 3 nights or longer.',
      validUntil: 'Valid through Dec 31, 2026',
      type: 'percent',
      value: 20,
      minNights: 3,
      minSpend: 0,
      eligibleCategories: null,
      tone: 'primary'
    },
    {
      id: 'member',
      code: 'STACKLY15',
      badge: 'Member Exclusive',
      discountLabel: '15% OFF',
      title: 'Curated Boutique & Heritage Stays',
      description: 'Instant 15% savings on any length of stay at our Boutique and Heritage properties.',
      validUntil: 'No minimum nights required',
      type: 'percent',
      value: 15,
      minNights: 1,
      minSpend: 0,
      eligibleCategories: ['Boutique', 'Heritage'],
      tone: 'accent'
    },
    {
      id: 'island100',
      code: 'ISLAND100',
      badge: 'Villa & Resort Deal',
      discountLabel: '$100 OFF',
      title: 'Sanctuary & Overwater Villa Credit',
      description: 'Enjoy $100 off your total stay estimate on bookings totaling $500 or more.',
      validUntil: 'Valid on Resort & Villa stays',
      type: 'fixed',
      value: 100,
      minNights: 1,
      minSpend: 500,
      eligibleCategories: null,
      tone: 'dark'
    },
    {
      id: 'weekend',
      code: 'WEEKEND12',
      badge: 'Spontaneous Trip',
      discountLabel: '12% OFF',
      title: 'Short-Break Rest & Reset Offer',
      description: 'Unlock 12% off spontaneous 2+ night escapes across every hotel in our collection.',
      validUntil: 'Applies to all stay categories',
      type: 'percent',
      value: 12,
      minNights: 2,
      minSpend: 0,
      eligibleCategories: null,
      tone: 'sand'
    }
  ];
})(window);


/* ==========================================================================
   Meridian — Customer Testimonials Dataset (8 Reviews)
   ========================================================================== */

(function (global) {
  'use strict';

  const Meridian = (global.Meridian = global.Meridian || {});
  Meridian.data = Meridian.data || {};

  Meridian.data.testimonials = [
    {
      id: 'rev-1',
      name: 'Elena Vance',
      initials: 'EV',
      avatarColor: '#0E5A64',
      location: 'San Francisco, USA',
      stayedAt: 'Caldera Horizon Suites, Santorini',
      date: 'September 2026',
      rating: 5,
      quote: 'Every detail matched the curation. Having taxes, nights, and promo savings calculated upfront made planning our anniversary stay effortless.'
    },
    {
      id: 'rev-2',
      name: 'Kenji Takahashi',
      initials: 'KT',
      avatarColor: '#D96B43',
      location: 'Singapore',
      stayedAt: 'Kamo River Ryokan, Kyoto',
      date: 'October 2026',
      rating: 5,
      quote: 'The cedar onsen overlooking the maple garden felt deeply restorative. Stackly’s local concierge even secured a last-minute kaiseki table for us.'
    },
    {
      id: 'rev-3',
      name: 'Sofia Lindqvist',
      initials: 'SL',
      avatarColor: '#2B5B84',
      location: 'Stockholm, Sweden',
      stayedAt: 'Villa Ravello Belvedere, Amalfi',
      date: 'August 2026',
      rating: 5,
      quote: 'Saved three villas in my wishlist while comparing dates over a week, applied the EARLYBIRD20 code, and locked in the exact cliffside room we wanted.'
    },
    {
      id: 'rev-4',
      name: 'Marcus Bell',
      initials: 'MB',
      avatarColor: '#5B4E77',
      location: 'London, UK',
      stayedAt: 'Matterhorn Timber Chalet, Zermatt',
      date: 'February 2026',
      rating: 5,
      quote: 'Ski-in convenience with architectural warmth instead of sterile resort luxury. Transparent pricing with zero checkout surprises.'
    },
    {
      id: 'rev-5',
      name: 'Amira El-Mansouri',
      initials: 'AE',
      avatarColor: '#8B5A2B',
      location: 'Paris, France',
      stayedAt: 'Dar Zellige Courtyard Riad, Marrakech',
      date: 'April 2026',
      rating: 5,
      quote: 'Stepping inside the quiet orange-blossom courtyard after the bustle of the medina was unforgettable. Truly handpicked hospitality.'
    },
    {
      id: 'rev-6',
      name: 'Priya Nair',
      initials: 'PN',
      avatarColor: '#1B7A52',
      location: 'Bengaluru, India',
      stayedAt: 'Ayung Canopy Sanctuary, Bali',
      date: 'July 2026',
      rating: 5,
      quote: 'We filtered for jungle retreats under $250/night and discovered Ayung Canopy. Morning yoga above the misty canopy exceeded every expectation.'
    },
    {
      id: 'rev-7',
      name: 'Lucas Meyer',
      initials: 'LM',
      avatarColor: '#3E6B65',
      location: 'Zurich, Switzerland',
      stayedAt: 'Nordic Basalt Thermal Lodge, Iceland',
      date: 'October 2026',
      rating: 5,
      quote: 'Soaking in mineral geothermal pools while watching the northern lights above the glass roof was pure magic. Seamless booking experience.'
    },
    {
      id: 'rev-8',
      name: 'Claire Beaumont',
      initials: 'CB',
      avatarColor: '#A64B38',
      location: 'Montreal, Canada',
      stayedAt: 'Baa Atoll Lagoon Villas, Maldives',
      date: 'January 2026',
      rating: 5,
      quote: 'The ISLAND100 credit and clear add-on breakdown helped us tailor transfers and diving effortlessly. Our overwater villa felt completely private.'
    }
  ];
})(window);


/* ==========================================================================
   Meridian — Traveler FAQ Dataset (6 Questions)
   ========================================================================== */

(function (global) {
  'use strict';

  const Meridian = (global.Meridian = global.Meridian || {});
  Meridian.data = Meridian.data || {};

  Meridian.data.faqs = [
    {
      id: 'faq-1',
      question: 'How does Stackly calculate the live booking price estimate?',
      answer:
        'Every hotel card and estimator modal calculates your nightly rate multiplied by your selected nights and rooms, adds any extra-guest occupancy adjustments above 2 guests per room, applies eligible promotional coupon savings, and includes a transparent 12% hospitality tax & fee estimate.'
    },
    {
      id: 'faq-2',
      question: 'Can I save favorite stays and price quotes across browser sessions?',
      answer:
        'Yes. Your wishlist hearts, applied promo code, recent search dates, newsletter status, and saved reservation quotes are automatically persisted in your browser’s LocalStorage—available anytime via the "Saved" button in the top bar.'
    },
    {
      id: 'faq-3',
      question: 'How do promotional coupon codes work with stay estimates?',
      answer:
        'Copy any code in Special Offers or click "Apply to Stays" to activate it across all hotel cards and the Booking Estimator. Some codes require minimum nights (e.g., EARLYBIRD20 requires 3+ nights) or specific stay styles (e.g., STACKLY15 applies to Boutique & Heritage stays).'
    },
    {
      id: 'faq-4',
      question: 'What is included in your 72-hour flexible modification policy?',
      answer:
        'Over 90% of Stackly properties allow complimentary date shifts or room-count updates up to 72 hours prior to check-in without administrative penalties.'
    },
    {
      id: 'faq-5',
      question: 'Are airport transfers and breakfast included automatically?',
      answer:
        'Select properties include daily breakfast or transfers in their base nightly rate (listed on each hotel’s amenity chips). You can also toggle Private Transfer, Chef Breakfast, or Thermal Spa Passes inside the Booking Price Estimator to preview exact add-on totals.'
    },
    {
      id: 'faq-6',
      question: 'What is the maximum number of guests per room?',
      answer:
        'Standard occupancy covers up to 2 guests per room, with a maximum capacity of 4 guests per room. Our guest selector automatically adjusts recommended rooms if your party exceeds 4 guests per room.'
    }
  ];
})(window);
