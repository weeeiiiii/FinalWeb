export const currentUser = {
  id: 1,
  name: "User",
  email: "user@example.com"
};

export const placesData = [
  { id: 101, name: "東京鐵塔", city: "東京", country: "日本", category: "attraction" },
  { id: 102, name: "雷門淺草寺", city: "東京", country: "日本", category: "attraction" },
  { id: 103, name: "一蘭拉麵", city: "東京", country: "日本", category: "food" },
  { id: 104, name: "大阪環球影城", city: "大阪", country: "日本", category: "attraction" },
  { id: 105, name: "京都清水寺", city: "京都", country: "日本", category: "attraction" },
];

export const tripsData = [
  {
    id: 1,
    user_id: 1,
    title: "東京五天四夜",
    start_date: "2025-04-01",
    end_date: "2025-04-05",
    details: { total_budget: 50000, cover_photo_url: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1000&q=80" }
  }
];

export const eventsData = [
  {
    id: 1001,
    trip_id: 1,
    day_no: 1,
    title: "抵達 & 機場快線",
    place_name: "成田機場",
    start_time: "10:00",
    end_time: "11:30",
    cost: 2500,
    category: "transport" 
  },
  {
    id: 1002,
    trip_id: 1,
    day_no: 1,
    title: "一蘭拉麵午餐",
    place_name: "新宿店",
    start_time: "12:00",
    end_time: "13:00",
    cost: 1200,
    category: "food" 
  },
  {
    id: 1003,
    trip_id: 1,
    day_no: 2,
    title: "迪士尼門票",
    place_name: "東京迪士尼",
    start_time: "09:00",
    end_time: "20:00",
    cost: 8000,
    category: "fun" 
  }
];