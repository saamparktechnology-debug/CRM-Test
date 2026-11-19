import { DISTRICTS_BY_STATE } from "./indiaStatesDistricts.constants"

export const CITIES_BY_DISTRICT: Record<string, string[]> = {
  // 1. Paschim Medinipur
  "Paschim Medinipur": [
    "Midnapore",
    "Kharagpur",
    "Balichak",
    "Debra",
    "Ghatal",
    "Belda",
    "Dantan",
    "Pingla",
    "Sabang",
    "Garhbeta",
    "Chandrakona",
    "Keshpur",
    "Mohanpur",
    "Narayangarh",
    "Daspur",
    "Salboni",
    "Goaltore",
    "Khirpai",
    "Ramjibanpur",
  ],
  // 2. Purba Medinipur
  "Purba Medinipur": [
    "Tamluk",
    "Haldia",
    "Contai (Kanthi)",
    "Digha",
    "Moyna",
    "Egra",
    "Mecheda",
    "Panskura",
    "Kolaghat",
    "Nandigram",
    "Mahisadal",
    "Sutahata",
    "Ramnagar",
    "Tajpur",
    "Mandarmoni",
    "Chandipur",
    "Khejuri",
    "Bhagabanpur",
    "Patashpur",
  ],
  // 3. Jhargram
  "Jhargram": [
    "Jhargram",
    "Gopiballavpur",
    "Belpahari",
    "Nayagram",
    "Binpur",
    "Sankrail",
    "Jamboni",
    "Silda",
  ],
  // 4. Kolkata
  "Kolkata": [
    "Kolkata",
    "Park Street",
    "Bhowanipore",
    "Alipore",
    "Salt Lake (Bidhannagar)",
    "New Town",
    "Rajarhat",
    "Dum Dum",
    "Behala",
    "Garia",
    "Jadavpur",
    "Tollygunge",
    "Shyambazar",
    "Burrabazar",
    "Sealdah",
    "Esplanade",
    "Kasba",
    "Ballygunge",
    "Lake Gardens",
    "Barisha",
    "Thakurpukur",
  ],
  // 5. Howrah
  "Howrah": [
    "Howrah",
    "Bally",
    "Uluberia",
    "Shibpur",
    "Domjur",
    "Amta",
    "Bagnan",
    "Sankrail",
    "Panchla",
    "Jagatballavpur",
    "Mahiari",
    "Andul",
  ],
  // 6. Hooghly
  "Hooghly": [
    "Chinsurah",
    "Chandannagar",
    "Serampore",
    "Bhadreswar",
    "Rishra",
    "Uttarpara",
    "Konnagar",
    "Dankuni",
    "Singur",
    "Tarakeswar",
    "Arambagh",
    "Bansberia",
    "Mogra",
    "Pandua",
    "Balagarh",
    "Haripal",
    "Dhaniakhali",
    "Khanakul",
    "Goghat",
    "Pursurah",
  ],
  // 7. North 24 Parganas
  "North 24 Parganas": [
    "Barasat",
    "Barrackpore",
    "Bidhannagar",
    "New Town",
    "Rajarhat",
    "Madhyamgram",
    "Habra",
    "Bangaon",
    "Basirhat",
    "Naihati",
    "Bhatpara",
    "Kanchrapara",
    "Halisahar",
    "Panihati",
    "Kamarhati",
    "Baranagar",
    "Dum Dum",
    "North Dumdum",
    "South Dumdum",
    "Deganga",
    "Baduria",
    "Taki",
    "Hasnabad",
    "Hingalganj",
    "Minakhan",
    "Sandeshkhali",
  ],
  // 8. South 24 Parganas
  "South 24 Parganas": [
    "Baruipur",
    "Sonarpur",
    "Diamond Harbour",
    "Canning",
    "Budge Budge",
    "Maheshtala",
    "Pujali",
    "Jayanagar-Majilpur",
    "Kakdwip",
    "Namkhana",
    "Bakkhali",
    "Gosaba",
    "Basanti",
    "Kultali",
    "Mandirbazar",
    "Magrahat",
    "Bhangar",
  ],
  // 9. Paschim Bardhaman
  "Paschim Bardhaman": [
    "Asansol",
    "Durgapur",
    "Raniganj",
    "Kulti",
    "Jamuria",
    "Andal",
    "Pandaveswar",
    "Barakar",
    "Chittaranjan",
    "Ukhra",
  ],
  // 10. Purba Bardhaman
  "Purba Bardhaman": [
    "Bardhaman (Burdwan)",
    "Kalna",
    "Katwa",
    "Memari",
    "Guskara",
    "Bhatar",
    "Monteswar",
    "Purbasthali",
    "Khandaghosh",
    "Raina",
    "Jamalpur",
  ],
  // 11. Bankura
  "Bankura": [
    "Bankura",
    "Bishnupur",
    "Khatra",
    "Sonamukhi",
    "Barjora",
    "Mejia",
    "Kotulpur",
    "Joypur",
    "Patrasayer",
    "Indas",
    "Onda",
    "Chhatna",
    "Taldangra",
    "Simlapal",
    "Ranibandh",
    "Raipur",
    "Mukutmanipur",
  ],
  // 12. Purulia
  "Purulia": [
    "Purulia",
    "Raghunathpur",
    "Jhalda",
    "Balarampur",
    "Manbazar",
    "Baghmundi",
    "Ayodhya Hills",
    "Kashipur",
    "Para",
    "Hura",
    "Puncha",
    "Bandwan",
    "Neturia",
    "Santaldih",
    "Adra",
  ],
  // 13. Birbhum
  "Birbhum": [
    "Suri",
    "Bolpur",
    "Santiniketan",
    "Rampurhat",
    "Sainthia",
    "Dubrajpur",
    "Ilambazar",
    "Nalhati",
    "Murarai",
    "Mayureswar",
    "Labpur",
    "Nanoor",
    "Tarapith",
    "Bakreshwar",
  ],
  // 14. Nadia
  "Nadia": [
    "Krishnanagar",
    "Kalyani",
    "Ranaghat",
    "Nabadwip",
    "Santipur",
    "Chakdaha",
    "Tehatta",
    "Karimpur",
    "Bethuadahari",
    "Nakashipara",
    "Chapra",
    "Hanskhali",
    "Haringhata",
    "Gayeshpur",
    "Taherpur",
  ],
  // 15. Murshidabad
  "Murshidabad": [
    "Berhampore",
    "Murshidabad",
    "Jiaganj",
    "Azimganj",
    "Jangipur",
    "Dhulian",
    "Kandi",
    "Domkal",
    "Beldanga",
    "Lalgola",
    "Raghunathganj",
    "Hariharpara",
    "Jalangi",
    "Raninagar",
    "Bhagabangola",
    "Suti",
    "Farakka",
  ],
  // 16. Malda
  "Malda": [
    "English Bazar (Malda)",
    "Old Malda",
    "Chanchal",
    "Samsi",
    "Gazole",
    "Harischandrapur",
    "Ratua",
    "Manikchak",
    "Kaliachak",
    "Baishnabnagar",
    "Habibpur",
    "Bamangola",
  ],
  // 17. Uttar Dinajpur
  "Uttar Dinajpur": [
    "Raiganj",
    "Kaliyaganj",
    "Islampur",
    "Dalkhola",
    "Hemtabad",
    "Itahar",
    "Karandighi",
    "Chopra",
    "Goalpokhar",
  ],
  // 18. Dakshin Dinajpur
  "Dakshin Dinajpur": [
    "Balurghat",
    "Gangarampur",
    "Buniadpur",
    "Tapan",
    "Kumarganj",
    "Hili",
    "Harirampur",
    "Kushmandi",
  ],
  // 19. Jalpaiguri
  "Jalpaiguri": [
    "Jalpaiguri",
    "Malbazar",
    "Dhupguri",
    "Mainaguri",
    "Rajganj",
    "Nagrakata",
    "Matiali",
    "Banarhat",
    "Chalsa",
    "Gorumara",
    "Lataguri",
  ],
  // 20. Alipurduar
  "Alipurduar": [
    "Alipurduar",
    "Falakata",
    "Jaigaon",
    "Birpara",
    "Madarihat",
    "Kalchini",
    "Kumargram",
    "Buxa",
    "Hasimara",
    "Shamuktala",
  ],
  // 21. Cooch Behar
  "Cooch Behar": [
    "Cooch Behar",
    "Dinhata",
    "Mathabhanga",
    "Tufanganj",
    "Mekhliganj",
    "Haldibari",
    "Sitalkuchi",
    "Sitai",
    "Baxirhat",
  ],
  // 22. Darjeeling
  "Darjeeling": [
    "Darjeeling",
    "Siliguri",
    "Kurseong",
    "Mirik",
    "Sukna",
    "Bijanbari",
    "Takdah",
    "Rongli",
    "Pedong",
    "Batasia",
    "Ghum",
  ],
  // 23. Kalimpong
  "Kalimpong": [
    "Kalimpong",
    "Gorubathan",
    "Lava",
    "Rishyap",
    "Lolegaon",
    "Pedong",
    "Algarah",
  ],

  // Other Major State Hubs
  "Patna": ["Patna", "Danapur", "Phulwari Sharif", "Fatwah", "Barh", "Mokama", "Bikram"],
  "Gaya": ["Gaya", "Bodh Gaya", "Sherghati", "Tekari"],
  "Ranchi": ["Ranchi", "Kanke", "Hatia", "Namkum", "Tatisilwai", "Bundu"],
  "East Singhbhum (Jamshedpur)": ["Jamshedpur", "Tatanagar", "Ghatshila", "Jugsalai", "Mango", "Potka"],
  "Dhanbad": ["Dhanbad", "Jharia", "Katras", "Sindri", "Chirkunda", "Nirsa"],
  "Bokaro": ["Bokaro Steel City", "Chas", "Bermo", "Phusro", "Gomia"],
  "Khordha (Bhubaneswar)": ["Bhubaneswar", "Khordha", "Jatni", "Banapur", "Balipatna"],
  "Cuttack": ["Cuttack", "Choudwar", "Banki", "Athagarh", "Salepur"],
  "Sundargarh (Rourkela)": ["Rourkela", "Sundargarh", "Rajgangpur", "Biramitrapur"],
  "Kamrup Metropolitan (Guwahati)": ["Guwahati", "Dispur", "North Guwahati", "Azara", "Chandrapur"],
  "Mumbai City": ["Mumbai", "South Mumbai", "Colaba", "Dadar", "Nariman Point", "Fort"],
  "Mumbai Suburban": ["Bandra", "Andheri", "Borivali", "Goregaon", "Juhu", "Kandivali", "Malad", "Kurla", "Ghatkopar", "Mulund"],
  "Pune": ["Pune", "Pimpri-Chinchwad", "Hinjawadi", "Kothrud", "Hadapsar", "Viman Nagar", "Shivajinagar", "Wakad", "Baner"],
  "Thane": ["Thane", "Kalyan", "Dombivli", "Navi Mumbai", "Mira-Bhayandar", "Ulhasnagar", "Badlapur"],
  "Nagpur": ["Nagpur", "Kamptee", "Hingna", "Katol", "Ramtek", "Umred"],
  "New Delhi": ["Connaught Place", "Chanakyapuri", "Lodhi Road", "Barakhamba", "India Gate"],
  "South Delhi": ["Saket", "Hauz Khas", "Greater Kailash", "Malviya Nagar", "Nehru Place", "Lajpat Nagar"],
  "Lucknow": ["Lucknow", "Hazratganj", "Gomti Nagar", "Alambagh", "Indira Nagar", "Charbagh"],
  "Kanpur Nagar": ["Kanpur", "Kalyanpur", "Civil Lines", "Govind Nagar", "Panki"],
  "Bengaluru Urban": ["Bengaluru", "Whitefield", "Koramangala", "Indiranagar", "Electronic City", "HSR Layout", "Jayanagar", "Marathahalli", "Yelahanka"],
  "Chennai": ["Chennai", "T. Nagar", "Adyar", "Velachery", "Anna Nagar", "Mylapore", "Guindy", "Tambaram"],
  "Hyderabad": ["Hyderabad", "Secunderabad", "Hitec City", "Gachibowli", "Madhapur", "Banjara Hills", "Jubilee Hills", "Kukatpally"],
  "Ahmedabad": ["Ahmedabad", "Navrangpura", "Maninagar", "Bodakdev", "Satellite", "Vastrapur", "SG Highway"],
}

// Helper to get exhaustive districts for any State
export function getDistrictsForState(stateName: string): string[] {
  const trimmed = (stateName || "").trim()
  if (!trimmed) return DISTRICTS_BY_STATE["West Bengal"]
  
  // Exact match
  if (DISTRICTS_BY_STATE[trimmed]) return DISTRICTS_BY_STATE[trimmed]

  // Case-insensitive match
  const key = Object.keys(DISTRICTS_BY_STATE).find(
    k => k.toLowerCase() === trimmed.toLowerCase()
  )
  if (key) return DISTRICTS_BY_STATE[key]

  return DISTRICTS_BY_STATE["West Bengal"]
}

// Helper to get exhaustive cities for any State and District
export function getCitiesForDistrict(stateName: string, districtName?: string): string[] {
  const dTrimmed = (districtName || "").trim()
  const sTrimmed = (stateName || "").trim()

  // 1. If district is provided and found in CITIES_BY_DISTRICT
  if (dTrimmed) {
    if (CITIES_BY_DISTRICT[dTrimmed]) return CITIES_BY_DISTRICT[dTrimmed]

    const dKey = Object.keys(CITIES_BY_DISTRICT).find(
      k => k.toLowerCase() === dTrimmed.toLowerCase()
    )
    if (dKey) return CITIES_BY_DISTRICT[dKey]
  }

  // 2. If state is West Bengal, combine all major cities of West Bengal
  if (sTrimmed.toLowerCase().includes("bengal") || !sTrimmed) {
    const wbCities: string[] = []
    DISTRICTS_BY_STATE["West Bengal"].forEach(d => {
      if (CITIES_BY_DISTRICT[d]) {
        wbCities.push(...CITIES_BY_DISTRICT[d])
      }
    })
    return Array.from(new Set(wbCities))
  }

  // 3. For any other state, check if there are district-level cities mapped
  const stateDists = getDistrictsForState(sTrimmed)
  const stateCities: string[] = []
  stateDists.forEach(d => {
    if (CITIES_BY_DISTRICT[d]) {
      stateCities.push(...CITIES_BY_DISTRICT[d])
    }
  })

  if (stateCities.length > 0) {
    return Array.from(new Set(stateCities))
  }

  // Fallback: return state districts themselves as city options
  return stateDists
}
