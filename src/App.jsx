import React, { useState } from 'react';
import './App.css';
import { tripsData, eventsData as initialEvents, placesData, currentUser as initialUser } from './ApiData';

const EXPENSE_CATEGORIES = {
  food: { label: '餐飲', color: '#ff9800' },
  transport: { label: '交通', color: '#2196f3' },
  stay: { label: '住宿', color: '#9c27b0' },
  fun: { label: '娛樂', color: '#e91e63' },
  shop: { label: '購物', color: '#00bcd4' },
  other: { label: '其他', color: '#9e9e9e' }
};

const getDaysArray = (start, end) => {
    const s = new Date(start);
    const e = new Date(end);
    const diffDays = Math.ceil(Math.abs(e - s) / (1000 * 60 * 60 * 24)) + 1; 
    return Array.from({ length: diffDays }, (_, i) => i + 1);
};

// 主視覺
const HeroSection = ({ onStart }) => (
  <div className="hero-section">
    <div className="hero-content-box">
      <div className="hero-title">
        網頁名稱？
      </div>
      <p className="hero-desc">
        Start planning your next journey!
      </p>
      <button className="btn-primary" onClick={onStart}>
        START PLANNING
      </button>
    </div>
  </div>
);

// --- [精選] 頁面 ---
const FavoritesPage = ({ places, favorites, onToggleFavorite }) => {
  const [view, setView] = useState('saved');
  const displayPlaces = view === 'saved' ? places.filter(p => favorites.includes(p.id)) : places;

  return (
    <div className="container">
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
        <h2 style={{margin:0, borderLeft:'5px solid #333', paddingLeft:'15px'}}>
          {view === 'saved' ? 'MY FAVORITES' : 'EXPLORE ALL'}
        </h2>
        <div style={{background:'#eee', borderRadius:'20px', padding:'5px'}}>
          <button onClick={() => setView('saved')} style={{padding:'8px 20px', borderRadius:'15px', border:'none', cursor:'pointer', background: view==='saved'?'white':'transparent', boxShadow: view==='saved'?'0 2px 5px rgba(0,0,0,0.1)':'none', fontWeight: view==='saved'?'bold':'normal'}}>已珍藏</button>
          <button onClick={() => setView('explore')} style={{padding:'8px 20px', borderRadius:'15px', border:'none', cursor:'pointer', background: view==='explore'?'white':'transparent', boxShadow: view==='explore'?'0 2px 5px rgba(0,0,0,0.1)':'none', fontWeight: view==='explore'?'bold':'normal'}}>探索更多</button>
        </div>
      </div>
      {displayPlaces.length === 0 && view === 'saved' ? (
        <div style={{padding:'50px', textAlign:'center', color:'#888', border:'2px dashed #ddd', borderRadius:'8px'}}>還沒有珍藏任何地點，快切換到「探索更多」按愛心吧！</div>
      ) : (
        <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(250px, 1fr))', gap:'20px'}}>
          {displayPlaces.map(place => {
            const isFav = favorites.includes(place.id);
            return (
              <div key={place.id} className="trip-card" style={{cursor:'default'}}>
                <div style={{padding:'20px'}}>
                  <div style={{display:'flex', justifyContent:'space-between', alignItems:'start'}}>
                    <h3 style={{margin:0, fontSize:'1.1rem'}}>{place.name}</h3>
                    <button onClick={() => onToggleFavorite(place.id)} style={{background:'none', border:'none', cursor:'pointer', fontSize:'1.5rem', color: isFav ? '#e74c3c' : '#ccc', transition:'0.2s'}}>{isFav ? '❤️' : '🤍'}</button>
                  </div>
                  <p style={{color:'#666', fontSize:'0.9rem'}}>📍 {place.city}, {place.country}</p>
                  <span style={{background:'#f0f0f0', padding:'2px 8px', borderRadius:'4px', fontSize:'0.8rem', color:'#555', marginTop:'10px', display:'inline-block'}}>{place.category.toUpperCase()}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// 開銷頁面
const ExpensesPage = ({ trips, allEvents }) => {
  const [selectedTripId, setSelectedTripId] = useState(trips.length > 0 ? trips[0].id : null);
  const currentTrip = trips.find(t => t.id === parseInt(selectedTripId));
  const tripEvents = allEvents.filter(e => e.trip_id === parseInt(selectedTripId));
  const totalSpent = tripEvents.reduce((sum, e) => sum + (e.cost || 0), 0);
  const budget = currentTrip ? currentTrip.details.total_budget : 0;
  const percentage = budget > 0 ? Math.min((totalSpent / budget) * 100, 100) : 0;
  
  const stats = {};
  Object.keys(EXPENSE_CATEGORIES).forEach(key => stats[key] = 0);
  tripEvents.forEach(e => {
    if (e.cost && e.category && stats[e.category] !== undefined) stats[e.category] += e.cost;
    else if (e.cost) stats['other'] += e.cost;
  });

  if (!currentTrip) return <div className="container">請先建立行程</div>;

  return (
    <div className="container">
      <h2 style={{borderLeft:'5px solid #333', paddingLeft:'15px'}}>EXPENSE TRACKER</h2>
      <div style={{marginBottom:'20px'}}>
        <label style={{marginRight:'10px', fontWeight:'bold'}}>選擇行程：</label>
        <select value={selectedTripId} onChange={(e) => setSelectedTripId(e.target.value)} style={{padding:'8px', fontSize:'1rem', borderRadius:'4px', border:'1px solid #ddd'}}>
          {trips.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
        </select>
      </div>
      <div style={{background:'white', padding:'30px', borderRadius:'12px', boxShadow:'0 5px 15px rgba(0,0,0,0.05)', marginBottom:'30px'}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:'10px'}}>
          <div>
            <h3 style={{margin:0, color:'#666'}}>總花費 / 預算</h3>
            <div style={{fontSize:'2.5rem', fontWeight:'bold', color:'#333'}}>${totalSpent.toLocaleString()} <span style={{fontSize:'1rem', color:'#999'}}>/ ${parseInt(budget).toLocaleString()}</span></div>
          </div>
          <div style={{textAlign:'right'}}>
            <div style={{fontWeight:'bold', color: totalSpent > budget ? '#e74c3c' : '#27ae60'}}>{totalSpent > budget ? '⚠️ 已超支' : '✅ 預算內'}</div>
          </div>
        </div>
        <div style={{height:'10px', background:'#eee', borderRadius:'5px', overflow:'hidden'}}>
          <div style={{width: `${percentage}%`, height:'100%', background: totalSpent > budget ? '#e74c3c' : '#27ae60', transition:'width 0.5s'}}></div>
        </div>
      </div>
      <h3>花費類別分析</h3>
      <div style={{background:'white', padding:'20px', borderRadius:'12px', boxShadow:'0 2px 5px rgba(0,0,0,0.05)'}}>
        {Object.entries(EXPENSE_CATEGORIES).map(([key, info]) => {
          const amount = stats[key];
          const barPercent = totalSpent > 0 ? (amount / totalSpent) * 100 : 0;
          return (
            <div key={key} style={{marginBottom:'15px'}}>
              <div style={{display:'flex', justifyContent:'space-between', fontSize:'0.9rem', marginBottom:'5px'}}>
                <span>{info.label}</span>
                <span>${amount.toLocaleString()} ({Math.round(barPercent)}%)</span>
              </div>
              <div style={{height:'8px', background:'#f5f5f5', borderRadius:'4px', overflow:'hidden'}}>
                <div style={{width: `${barPercent}%`, height:'100%', background: info.color}}></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// 使用者頁面
const ProfilePage = ({ user, trips, favCount, onUpdateUser, onSelectTrip, onNavigateToFavorites }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: user.name, email: user.email });
  
  // 行程列表視窗
  const [isTripsListOpen, setIsTripsListOpen] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    onUpdateUser(formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({ name: user.name, email: user.email });
    setIsEditing(false);
  };

  return (
    <div className="container" style={{maxWidth:'600px', marginTop:'40px'}}>
      <div style={{background:'white', padding:'40px', borderRadius:'12px', boxShadow:'0 5px 15px rgba(0,0,0,0.1)', textAlign:'center'}}>
        <div style={{width:'80px', height:'80px', background:'#333', color:'white', borderRadius:'50%', margin:'0 auto 20px', lineHeight:'80px', fontSize:'2rem'}}>
          {user.name[0].toUpperCase()}
        </div>

        {isEditing ? (
          <form onSubmit={handleSave} style={{textAlign:'left', maxWidth:'400px', margin:'0 auto'}}>
            <div className="form-group">
              <label>使用者名稱</label>
              <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
            </div>
            <div className="form-group">
              <label>電子郵件</label>
              <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
            </div>
            <div style={{display:'flex', gap:'10px', justifyContent:'center', marginTop:'20px'}}>
              <button type="button" onClick={handleCancel} className="btn-secondary" style={{width:'100%'}}>取消</button>
              <button type="submit" className="btn-primary" style={{width:'100%'}}>儲存變更</button>
            </div>
          </form>
        ) : (
          <>
            <h2 style={{marginBottom:'5px'}}>{user.name}</h2>
            <p style={{color:'#666', marginBottom:'20px'}}>{user.email}</p>
            <button onClick={() => setIsEditing(true)} className="btn-secondary" style={{fontSize:'0.85rem', padding:'5px 15px', borderRadius:'20px'}}>✎ 編輯資料</button>

            <div style={{display:'flex', justifyContent:'center', gap:'20px', marginTop:'30px', borderTop:'1px solid #eee', paddingTop:'20px'}}>
              
              {/* 1. 規劃行程按鈕 (點擊跳出列表) */}
              <div className="stat-item" onClick={() => setIsTripsListOpen(true)}>
                <div style={{fontSize:'1.5rem', fontWeight:'bold'}}>{trips.length}</div>
                <div style={{color:'#888', fontSize:'0.9rem'}}>規劃行程</div>
              </div>

              {/* 2. 珍藏景點按鈕 (點擊跳轉頁面) */}
              <div className="stat-item" onClick={onNavigateToFavorites}>
                <div style={{fontSize:'1.5rem', fontWeight:'bold'}}>{favCount}</div>
                <div style={{color:'#888', fontSize:'0.9rem'}}>珍藏景點</div>
              </div>

            </div>
          </>
        )}
      </div>

      {isTripsListOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{maxWidth:'500px'}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'15px'}}>
              <h3 style={{margin:0}}>My Trips</h3>
              <button onClick={() => setIsTripsListOpen(false)} style={{background:'none', border:'none', fontSize:'1.2rem', cursor:'pointer'}}>✕</button>
            </div>
            
            {trips.length === 0 ? (
              <p style={{color:'#999', textAlign:'center'}}>目前沒有行程</p>
            ) : (
              <div className="mini-trip-list">
                {trips.map(trip => (
                  <div 
                    key={trip.id} 
                    className="mini-trip-item"
                    onClick={() => {
                      onSelectTrip(trip);
                      setIsTripsListOpen(false); 
                    }}
                  >
                    <div style={{fontWeight:'bold', color:'#333'}}>{trip.title}</div>
                    <div style={{fontSize:'0.85rem', color:'#888'}}>📅 {trip.start_date} ~ {trip.end_date}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};


const TripSetupModal = ({ onSave, onCancel }) => {
  const [formData, setFormData] = useState({ title: '', start_date: '', end_date: '', budget: '', note: '' });
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>✈️ 建立新旅程</h3>
        <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }}>
          <div className="form-group"><label>行程名稱</label><input value={formData.title} onChange={e=>setFormData({...formData, title:e.target.value})} required placeholder="例如: 京都五日遊"/></div>
          <div className="form-group" style={{display:'flex', gap:'10px'}}>
             <div style={{flex:1}}><label>出發</label><input type="date" value={formData.start_date} onChange={e=>setFormData({...formData, start_date:e.target.value})} required/></div>
             <div style={{flex:1}}><label>回程</label><input type="date" value={formData.end_date} onChange={e=>setFormData({...formData, end_date:e.target.value})} required/></div>
          </div>
          <div className="form-group"><label>總預算</label><input type="number" value={formData.budget} onChange={e=>setFormData({...formData, budget:e.target.value})} placeholder="例如: 30000"/></div>
          <div className="modal-actions"><button type="button" onClick={onCancel} className="btn-secondary">取消</button><button type="submit" className="btn-primary">下一步 →</button></div>
        </form>
      </div>
    </div>
  );
};

const EventForm = ({ tripId, currentDay, initialData, onSave, onCancel }) => {
  const [formData, setFormData] = useState(initialData || { title: '', place_name: '', start_time: '10:00', end_time: '12:00', cost: 0, category: 'food' });

  return (
    <div className="modal-overlay" style={{zIndex: 1100}}>
      <div className="modal-content">
        <h3>{initialData ? '編輯活動' : '新增活動'}</h3>
        <form onSubmit={(e) => { e.preventDefault(); onSave({...formData, trip_id: tripId, day_no: currentDay}); }}>
          <div className="form-group"><label>活動名稱</label><input value={formData.title} onChange={e=>setFormData({...formData, title:e.target.value})} required placeholder="例如: 吃一蘭拉麵"/></div>
          <div className="form-group" style={{display:'flex', gap:'10px'}}>
             <div style={{flex:1}}><label>開始</label><input type="time" value={formData.start_time} onChange={e=>setFormData({...formData, start_time:e.target.value})}/></div>
             <div style={{flex:1}}><label>結束</label><input type="time" value={formData.end_time} onChange={e=>setFormData({...formData, end_time:e.target.value})}/></div>
          </div>
          <div className="form-group"><label>地點</label><input value={formData.place_name} onChange={e=>setFormData({...formData, place_name:e.target.value})} placeholder="例如: 新宿東口店"/></div>
          <div className="form-group" style={{display:'flex', gap:'10px'}}>
            <div style={{flex:1}}><label>花費金額 ($)</label><input type="number" value={formData.cost} onChange={e=>setFormData({...formData, cost:parseInt(e.target.value)||0})}/></div>
            <div style={{flex:1}}>
              <label>消費類別</label>
              <select value={formData.category} onChange={e=>setFormData({...formData, category:e.target.value})}>
                {Object.entries(EXPENSE_CATEGORIES).map(([key, info]) => (<option key={key} value={key}>{info.label}</option>))}
              </select>
            </div>
          </div>
          <div className="modal-actions"><button type="button" onClick={onCancel} className="btn-secondary">取消</button><button type="submit" className="btn-primary">儲存</button></div>
        </form>
      </div>
    </div>
  );
};

const TripPlanner = ({ trip, onBack, allEvents, setAllEvents }) => {
  const [currentDay, setCurrentDay] = useState(1);
  const [isEventFormOpen, setIsEventFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const days = getDaysArray(trip.start_date, trip.end_date);
  const dayEvents = allEvents.filter(e => e.trip_id === trip.id && e.day_no === currentDay).sort((a,b)=>a.start_time.localeCompare(b.start_time));
  const totalSpent = allEvents.filter(e => e.trip_id === trip.id).reduce((sum, e) => sum + (e.cost || 0), 0);

  const handleSave = (data) => {
    if(editingEvent) setAllEvents(prev => prev.map(e => e.id === editingEvent.id ? {...data, id: e.id} : e));
    else setAllEvents(prev => [...prev, {...data, id: Date.now()}]);
    setIsEventFormOpen(false);
  };

  return (
    <div className="container">
      <button className="btn-back" onClick={onBack}>← 返回行程列表</button>
      <div style={{background:'white', padding:'20px', borderRadius:'12px', boxShadow:'0 2px 5px rgba(0,0,0,0.05)', marginBottom:'20px', border:'1px solid #eee'}}>
        <h1 style={{margin:0, fontSize:'1.8rem'}}>{trip.title}</h1>
        <p style={{color:'#666', marginTop:'5px'}}>📅 {trip.start_date} ~ {trip.end_date}</p>
        <div style={{marginTop:'15px', padding:'10px', background:'#f9f9f9', borderRadius:'8px', display:'inline-block'}}>
            預算: <b>${parseInt(trip.details.total_budget).toLocaleString()}</b> <span style={{margin:'0 10px', color:'#ddd'}}>|</span> 目前花費: <b style={{color: totalSpent > trip.details.total_budget ? '#e74c3c' : '#27ae60'}}>${totalSpent.toLocaleString()}</b>
        </div>
      </div>
      <div style={{display:'flex', gap:'10px', overflowX:'auto', paddingBottom:'10px'}}>
        {days.map(d => <button key={d} onClick={()=>setCurrentDay(d)} style={{padding:'8px 20px', borderRadius:'20px', border:'none', cursor:'pointer', background: currentDay===d?'#222':'#e0e0e0', color: currentDay===d?'white':'#555', fontWeight:'500'}}>Day {d}</button>)}
      </div>
      <div style={{marginTop:'20px'}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'15px'}}>
           <h3 style={{fontSize:'1.2rem'}}>Day {currentDay}</h3>
           <button className="btn-primary" onClick={()=>{setEditingEvent(null); setIsEventFormOpen(true)}}>+ 新增活動</button>
        </div>
        {dayEvents.map(ev => (
          <div key={ev.id} style={{display:'flex', background:'white', padding:'15px', marginBottom:'12px', borderRadius:'8px', borderLeft:`5px solid ${EXPENSE_CATEGORIES[ev.category]?.color || '#999'}`, boxShadow:'0 2px 4px rgba(0,0,0,0.05)', border:'1px solid #f0f0f0'}}>
            <div style={{minWidth:'60px', fontWeight:'bold', color:'#333'}}>{ev.start_time}</div>
            <div style={{flex:1}}>
              <b style={{fontSize:'1.05rem'}}>{ev.title}</b>
              <div style={{fontSize:'0.9rem', color:'#666', marginTop:'3px'}}>{ev.place_name}</div>
              <span style={{fontSize:'0.75rem', background:'#f4f4f4', padding:'3px 8px', borderRadius:'4px', color:'#666', marginTop:'5px', display:'inline-block'}}>{EXPENSE_CATEGORIES[ev.category]?.label || '其他'}</span>
            </div>
            <div style={{textAlign:'right', display:'flex', flexDirection:'column', justifyContent:'center'}}>
              <div style={{fontWeight:'bold', fontSize:'1.1rem'}}>${ev.cost}</div>
              <div style={{fontSize:'0.85rem', marginTop:'8px'}}>
                 <span onClick={()=>{setEditingEvent(ev); setIsEventFormOpen(true);}} style={{cursor:'pointer', marginRight:'12px', color:'#555', textDecoration:'underline'}}>編輯</span>
                 <span onClick={(e)=>{e.stopPropagation(); setAllEvents(prev=>prev.filter(x=>x.id!==ev.id));}} style={{cursor:'pointer', color:'#e74c3c'}}>刪除</span>
              </div>
            </div>
          </div>
        ))}
        {dayEvents.length === 0 && <div style={{textAlign:'center', padding:'40px', color:'#999', background:'white', borderRadius:'8px', border:'1px dashed #ddd'}}>本日尚無行程，點擊右上方按鈕新增</div>}
      </div>
      {isEventFormOpen && <EventForm tripId={trip.id} currentDay={currentDay} initialData={editingEvent} onSave={handleSave} onCancel={()=>setIsEventFormOpen(false)}/>}
    </div>
  );
};

// 主程式

function App() {
  const [activeTab, setActiveTab] = useState('HOME');
  const [trips, setTrips] = useState(tripsData);
  const [allEvents, setAllEvents] = useState(initialEvents);
  const [planningTrip, setPlanningTrip] = useState(null);
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);
  const [favorites, setFavorites] = useState([101, 103]);
  
  const [user, setUser] = useState(initialUser);

  const toggleFavorite = (id) => {
    setFavorites(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleCreateTrip = (formData) => {
    const newTrip = {
      id: Date.now(), user_id: user.id, ...formData,
      details: { total_budget: parseInt(formData.budget)||0, actual_spent: 0, cover_photo_url: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1000&q=80' }
    };
    setTrips([newTrip, ...trips]);
    setIsSetupModalOpen(false);
    setPlanningTrip(newTrip);
  };

  // 更新使用者資料
  const handleUpdateUser = (updatedData) => {
    setUser(prev => ({ ...prev, ...updatedData }));
  };

  const renderHome = () => (
    <div>
      <HeroSection onStart={() => setIsSetupModalOpen(true)} />
      <div className="container">
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
          <h2 style={{margin:0, borderLeft:'5px solid #333', paddingLeft:'15px'}}>MY TRIPS</h2>
          <button className="btn-primary" onClick={() => setIsSetupModalOpen(true)}>+ 建立新行程</button>
        </div>
        <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px, 1fr))', gap:'20px'}}>
          {trips.map(trip => (
            <div key={trip.id} className="trip-card" onClick={() => setPlanningTrip(trip)}>
              <div style={{height:'140px', background:'#ddd', overflow:'hidden', borderRadius:'8px 8px 0 0'}}>
                <img src={trip.details.cover_photo_url} alt="" style={{width:'100%', height:'100%', objectFit:'cover'}}/>
              </div>
              <div style={{padding:'20px'}}>
                <h3 style={{margin:'0 0 10px 0'}}>{trip.title}</h3>
                <p style={{color:'#888', fontSize:'0.9rem'}}>📅 {trip.start_date} ~ {trip.end_date}</p>
              </div>
            </div>
          ))}
        </div>
        {isSetupModalOpen && <TripSetupModal onSave={handleCreateTrip} onCancel={() => setIsSetupModalOpen(false)} />}
      </div>
    </div>
  );

  return (
    <div>
      <nav className="navbar">
        <div className="nav-menu">
          <button className={`nav-item ${activeTab==='HOME'?'active':''}`} onClick={()=>{setActiveTab('HOME'); setPlanningTrip(null);}}>首頁</button>
          <button className={`nav-item ${activeTab==='FAVORITES'?'active':''}`} onClick={()=>{setActiveTab('FAVORITES'); setPlanningTrip(null);}}>精選</button>
          <button className={`nav-item ${activeTab==='EXPENSES'?'active':''}`} onClick={()=>{setActiveTab('EXPENSES'); setPlanningTrip(null);}}>開銷</button>
          <button className={`nav-item ${activeTab==='PROFILE'?'active':''}`} onClick={()=>{setActiveTab('PROFILE'); setPlanningTrip(null);}}>使用者</button>
        </div>
      </nav>

      {planningTrip ? (
        <TripPlanner trip={planningTrip} onBack={() => setPlanningTrip(null)} allEvents={allEvents} setAllEvents={setAllEvents} />
      ) : (
        <>
          {activeTab === 'HOME' && renderHome()}
          {activeTab === 'FAVORITES' && <FavoritesPage places={placesData} favorites={favorites} onToggleFavorite={toggleFavorite} />}
          {activeTab === 'EXPENSES' && <ExpensesPage trips={trips} allEvents={allEvents} />}
          
          {activeTab === 'PROFILE' && (
            <ProfilePage 
              user={user} 
              trips={trips} 
              favCount={favorites.length} 
              onUpdateUser={handleUpdateUser} 
              onSelectTrip={setPlanningTrip} 
              onNavigateToFavorites={() => setActiveTab('FAVORITES')} 
            />
          )}
        </>
      )}
    </div>
  );
}

export default App;