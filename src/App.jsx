import React, { useState } from 'react';
import LoginPage from './Login';
import './App.css';
import { tripsData, eventsData as initialEvents, placesData, currentUser as initialUser } from './ApiData';

const API_HOST = "https://01da5078501d.ngrok-free.app";

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
        Travel Planner
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
// 珍藏頁面 
const FavoritesPage = ({ places, favorites, onToggleFavorite }) => {
  const [view, setView] = useState('saved');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [placeUserData, setPlaceUserData] = useState({});

  const sourcePlaces = view === 'saved' 
    ? places.filter(p => favorites.includes(p.id)) 
    : places;

  const displayPlaces = sourcePlaces.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSaveData = (placeId, data) => {
    setPlaceUserData(prev => ({
      ...prev,
      [placeId]: data
    }));
    setSelectedPlace(null); 
  };

  return (
    <div className="container">
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
        <h2 style={{margin:0, borderLeft:'5px solid #333', paddingLeft:'15px'}}>
          {view === 'saved' ? 'MY FAVORITES' : 'EXPLORE MORE'}
        </h2>
        <div style={{background:'#eee', borderRadius:'20px', padding:'5px'}}>
          <button 
            onClick={() => { setView('saved'); setSearchTerm(''); }} 
            style={{padding:'8px 20px', borderRadius:'15px', border:'none', cursor:'pointer', background: view==='saved'?'white':'transparent', boxShadow: view==='saved'?'0 2px 5px rgba(0,0,0,0.1)':'none', fontWeight: view==='saved'?'bold':'normal'}}
          >
            已珍藏
          </button>
          <button 
            onClick={() => { setView('explore'); setSearchTerm(''); }} 
            style={{padding:'8px 20px', borderRadius:'15px', border:'none', cursor:'pointer', background: view==='explore'?'white':'transparent', boxShadow: view==='explore'?'0 2px 5px rgba(0,0,0,0.1)':'none', fontWeight: view==='explore'?'bold':'normal'}}
          >
            探索更多
          </button>
        </div>
      </div>

      <div style={{textAlign: 'center', marginBottom: '30px'}}>
        <input
          type="text"
          placeholder={view === 'saved' ? "🔍 搜尋我的收藏..." : "🔍 搜尋景點、城市 (例如: 東京, 拉麵...)"}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%', maxWidth: '500px', padding: '12px 20px', fontSize: '1rem',
            borderRadius: '30px', border: '1px solid #ddd', boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            outline: 'none', transition: 'all 0.2s', background: 'white'
          }}
          onFocus={(e) => e.target.style.boxShadow = '0 2px 12px rgba(0,0,0,0.1)'}
          onBlur={(e) => e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)'}
        />
      </div>

      {displayPlaces.length === 0 ? (
        <div style={{padding:'50px', textAlign:'center', color:'#888', border:'2px dashed #ddd', borderRadius:'8px', background: '#f9f9f9'}}>
          {searchTerm 
            ? `找不到符合「${searchTerm}」的地點` 
            : (view === 'saved' ? '還沒有珍藏任何地點，快切換到「探索更多」吧！' : '目前資料庫沒有相關景點')
          }
        </div>
      ) : (
        <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(250px, 1fr))', gap:'20px'}}>
          {displayPlaces.map(place => {
            const isFav = favorites.includes(place.id);
            const userData = placeUserData[place.id]; 

            return (
              <div 
                key={place.id} 
                className="trip-card" 
                onClick={() => setSelectedPlace(place)}
                style={{cursor:'pointer', position:'relative', transition: 'transform 0.2s', border: '1px solid #eee'}}
              >
                <div style={{padding:'30px'}}>
                  <div style={{display:'flex', justifyContent:'space-between', alignItems:'start'}}>
                    <h3 style={{margin:0, fontSize:'1.1rem'}}>{place.name}</h3>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation(); 
                        onToggleFavorite(place.id);
                      }}
                      style={{background:'none', border:'none', cursor:'pointer', fontSize:'1.5rem', color: isFav ? '#e74c3c' : '#ccc', transition:'transform 0.2s', zIndex: 2}}
                    >
                      {isFav ? '❤️' : '🤍'}
                    </button>
                  </div>
                  
                  {userData && (
                     <div style={{marginTop: '10px', fontSize: '0.85rem', color: '#888', background:'#f9f9f9', padding:'8px', borderRadius:'6px'}}>
                        {userData.rating > 0 && <span style={{color: '#f39c12', marginRight:'5px'}}>★ {userData.rating}</span>}
                        {userData.note && <span>📝 已有記錄</span>}
                     </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedPlace && (
        <PlaceDetailsModal 
          place={selectedPlace}
          initialData={placeUserData[selectedPlace.id]}
          onSave={handleSaveData}
          onClose={() => setSelectedPlace(null)}
        />
      )}
    </div>
  );
};

// 評分與備註的彈窗元件
const PlaceDetailsModal = ({ place, initialData, onSave, onClose }) => {
  const [rating, setRating] = useState(initialData?.rating || 0);
  const [note, setNote] = useState(initialData?.note || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(place.id, { rating, note });
  };

  return (
    <div className="modal-overlay" style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
    }}>
      <div className="modal-content" style={{
        background: 'white', padding: '30px', borderRadius: '12px', width: '90%', maxWidth: '400px',
        boxShadow: '0 5px 15px rgba(0,0,0,0.2)', animation: 'slideIn 0.3s ease-out'
      }}>
        <h3 style={{marginTop: 0, marginBottom: '20px'}}>{place.name} - 旅遊評價與筆記</h3>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{marginBottom: '20px'}}>
            <label style={{display:'block', marginBottom:'8px', fontWeight:'bold'}}>您的評分</label>
            <div style={{display: 'flex', gap: '5px', cursor: 'pointer'}}>
              {[1, 2, 3, 4, 5].map((star) => (
                <span 
                  key={star} 
                  onClick={() => setRating(star)}
                  style={{
                    fontSize: '2rem', 
                    color: star <= rating ? '#FFD700' : '#ddd', 
                    transition: 'color 0.2s'
                  }}
                >
                  ★
                </span>
              ))}
              <span style={{marginLeft:'10px', lineHeight:'3rem', color:'#666', fontSize:'0.9rem'}}>
                {rating > 0 ? `${rating} 顆星` : '尚未評分'}
              </span>
            </div>
          </div>

          <div className="form-group" style={{marginBottom: '20px'}}>
            <label style={{display:'block', marginBottom:'8px', fontWeight:'bold'}}>備註</label>
            <textarea 
              rows="4"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="寫下這次旅遊感想..."
              style={{width: '100%', padding:'10px', borderRadius:'8px', border:'1px solid #ddd'}}
            />
          </div>

          <div className="modal-actions" style={{display:'flex', justifyContent:'flex-end', gap:'10px'}}>
            <button type="button" onClick={onClose} className="btn-secondary" style={{padding:'8px 16px', border:'1px solid #ddd', background:'white', borderRadius:'6px', cursor:'pointer'}}>取消</button>
            <button type="submit" className="btn-primary" style={{padding:'8px 16px', border:'none', background:'#333', color:'white', borderRadius:'6px', cursor:'pointer'}}>儲存</button>
          </div>
        </form>
      </div>
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
      <h2 style={{borderLeft:'5px solid #333', paddingLeft:'15px'}}>EXPENSE</h2>
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
            <div style={{fontWeight:'bold', color: totalSpent > budget ? '#e74c3c' : '#27ae60'}}>{totalSpent > budget ? '🆘 爆預算啦' : '✅ 預算內'}</div>
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
  const [isSaving, setIsSaving] = useState(false); // 新增：防止重複點擊
  
  // 行程列表視窗
  const [isTripsListOpen, setIsTripsListOpen] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true); // 開始載入

    // 呼叫 App.jsx 傳進來的 API 更新函式，並等待結果
    const success = await onUpdateUser(formData);
    
    setIsSaving(false); // 結束載入

    // 只有在 API 成功時，才關閉編輯模式
    if (success) {
      setIsEditing(false);
    }
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
   
              <div className="stat-item" onClick={() => setIsTripsListOpen(true)}>
                <div style={{fontSize:'1.5rem', fontWeight:'bold'}}>{trips.length}</div>
                <div style={{color:'#888', fontSize:'0.9rem'}}>規劃行程</div>
              </div>

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


const TripSetupModal = ({ initialData, onSave, onCancel }) => {
  const [formData, setFormData] = useState(initialData || { 
    title: '', 
    start_date: '', start_time: '', 
    end_date: '', end_time: '', 
    budget: '', note: '' 
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>{initialData ? '編輯旅程資訊' : '建立新旅程'}</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>行程名稱</label>
            <input 
              value={formData.title} 
              onChange={e => setFormData({...formData, title: e.target.value})} 
              required placeholder="例如: 京都五日遊"
            />
          </div>
          <div className="form-group" style={{display:'flex', gap:'10px'}}>
             <div style={{flex:1}}>
                <label>出發日期</label>
                <input type="date" value={formData.start_date} onChange={e => setFormData({...formData, start_date: e.target.value})} required/>
             </div>
             <div style={{flex:1}}>
                <label>時間</label>
                <input type="time" value={formData.start_time} onChange={e => setFormData({...formData, start_time: e.target.value})} required/>
             </div>
          </div>
          <div className="form-group" style={{display:'flex', gap:'10px'}}>
             <div style={{flex:1}}>
                <label>回程日期</label>
                <input type="date" value={formData.end_date} onChange={e => setFormData({...formData, end_date: e.target.value})} required/>
             </div>
             <div style={{flex:1}}>
                <label>時間</label>
                <input type="time" value={formData.end_time} onChange={e => setFormData({...formData, end_time: e.target.value})} required/>
             </div>
          </div>
          <div className="form-group">
            <label>總預算</label>
            <input type="number" value={formData.budget} onChange={e => setFormData({...formData, budget: e.target.value})} required placeholder="例如: 30000"/>
          </div>
          <div className="form-group">
            <label>備註</label>
            <textarea 
              rows="3" 
              value={formData.note} 
              onChange={e => setFormData({...formData, note: e.target.value})} 
              placeholder="例如: 記得帶護照、訂網卡..."
            />
          </div>
          <div className="modal-actions">
            <button type="button" onClick={onCancel} className="btn-secondary">取消</button>
            <button type="submit" className="btn-primary">儲存</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const EventForm = ({ tripId, currentDay, initialData, onSave, onCancel }) => {
  const [formData, setFormData] = useState(initialData || { title: '', place_name: '', start_time: '10:00', end_time: '12:00', cost: '', category: 'food' });

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
          <div className="form-group"><label>地點</label><input value={formData.place_name} onChange={e=>setFormData({...formData, place_name:e.target.value})} required placeholder="例如: 新宿東口店"/></div>
          <div className="form-group" style={{display:'flex', gap:'10px'}}>
            <div style={{flex:1}}><label>花費金額 ($)</label><input type="number" value={formData.cost} onChange={e=>{
              const val = e.target.value;
              setFormData({...formData, cost: val === '' ? '' : parseInt(val, 10) || 0});
            }}/></div>
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

const TripPlanner = ({ trip, onBack, onUpdateTrip, onDeleteTrip, allEvents, setAllEvents }) => {
  const [currentDay, setCurrentDay] = useState(1);
  const [isEventFormOpen, setIsEventFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [isEditTripModalOpen, setIsEditTripModalOpen] = useState(false);

  const days = getDaysArray(trip.start_date, trip.end_date);
  if (currentDay > days.length) setCurrentDay(1);

  const dayEvents = allEvents
    .filter(e => e.trip_id === trip.id && e.day_no === currentDay)
    .sort((a,b)=>a.start_time.localeCompare(b.start_time));
  
  const totalSpent = allEvents
    .filter(e => e.trip_id === trip.id)
    .reduce((sum, e) => sum + (e.cost || 0), 0);

  const dailySpent = dayEvents.reduce((sum, e) => sum + (e.cost || 0), 0);

  const handleSaveEvent = (data) => {
    if(editingEvent) setAllEvents(prev => prev.map(e => e.id === editingEvent.id ? {...data, id: e.id} : e));
    else setAllEvents(prev => [...prev, {...data, id: Date.now()}]);
    setIsEventFormOpen(false);
  };

  const handleDeleteThisTrip = () => {
    if (window.confirm(`確定要刪除「${trip.title}」嗎？刪除後無法復原。`)) {
      onDeleteTrip(trip.id);
      onBack();
    }
  };

  const getDayDateString = (startDate, dayNumber) => {
  const date = new Date(startDate);
  date.setDate(date.getDate() + (dayNumber - 1)); //處理跨月分
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${mm}/${dd}`;
  };

  return (
    <div className="container">
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
        <button className="btn-back" onClick={onBack} style={{margin:0}}>← 返回行程列表</button>
        <div style={{display:'flex', gap:'10px'}}>
          <button className="btn-secondary" onClick={() => setIsEditTripModalOpen(true)}>編輯行程</button>
          <button className="btn-secondary" onClick={handleDeleteThisTrip} style={{color:'#e74c3c', borderColor:'#e74c3c'}}>刪除</button>
        </div>
      </div>

      <div style={{background:'white', padding:'25px', borderRadius:'12px', boxShadow:'0 2px 10px rgba(0,0,0,0.05)', marginBottom:'25px', border:'1px solid #eee'}}>
        <h1 style={{margin:'0 0 15px 0', fontSize:'2rem'}}>{trip.title}</h1>
        
        <div style={{display:'flex', flexWrap:'wrap', gap:'30px', color:'#333', fontSize:'1rem', marginBottom:'20px'}}>
          <div>
            <span style={{fontSize:'1.2rem', marginRight:'5px'}}></span> 
            <strong>🗓️出發：</strong> {trip.start_date} 
            {trip.start_time && <span style={{marginLeft:'10px', color:'#333'}}>{trip.start_time}</span>}
          </div>
          <div>
            <span style={{fontSize:'1.2rem', marginRight:'5px'}}></span> 
            <strong>回程：</strong> {trip.end_date} 
            {trip.end_time && <span style={{marginLeft:'10px', color:'#333'}}>{trip.end_time}</span>}
          </div>
        </div>

        <div style={{
          background:'#f8f9fa', 
          padding:'15px 20px', 
          borderRadius:'8px', 
          display:'inline-flex', 
          alignItems:'center', 
          gap:'20px', 
          border:'1px solid #eee',
          marginBottom: '5px'
        }}>
           <div style={{fontSize:'1rem'}}>總預算: <b style={{fontSize:'1.1rem'}}>${parseInt(trip.details.total_budget).toLocaleString()}</b></div>
           <div style={{height:'20px', width:'1px', background:'#ccc'}}></div>
           <div style={{fontSize:'1rem'}}>目前花費: <b style={{fontSize:'1.1rem', color: totalSpent > trip.details.total_budget ? '#e74c3c' : '#27ae60'}}>${totalSpent.toLocaleString()}</b></div>
        </div>

        {trip.note && (
          <div style={{marginTop:'5px', color:'#555', fontSize:'0.95rem', lineHeight:'1.6', borderTop:'1px dashed #eee', paddingTop:'5px'}}>
            <strong style={{display:'block', marginBottom:'5px', color:'#333'}}>備註：</strong>
            <div style={{whiteSpace: 'pre-line'}}>{trip.note}</div>
          </div>
        )}
      </div>

      <div style={{display:'flex', gap:'10px', overflowX:'auto', paddingBottom:'10px'}}>
        {days.map(d => (
          <button 
            key={d} 
            onClick={()=>setCurrentDay(d)} 
            style={{
              padding:'8px 20px', borderRadius:'20px', border:'none', cursor:'pointer', fontWeight:'500', whiteSpace: 'nowrap',
              background: currentDay===d?'#222':'#e0e0e0', 
              color: currentDay===d?'white':'#555'
            }}
          >
            {getDayDateString(trip.start_date, d)} (Day {d})
          </button>
        ))}
      </div>

      <div style={{marginTop:'20px'}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'15px'}}>
           <div style={{display:'flex', alignItems:'baseline', gap:'12px'}}>
             <h3 style={{fontSize:'1.2rem', margin:0}}>Day {currentDay} 行程</h3>
             <span style={{fontSize:'1.1rem', color:'#454444ff', fontWeight:'500', background:'#eeebebff', padding:'2px 8px', borderRadius:'4px'}}>
               本日花費: ${dailySpent.toLocaleString()}
             </span>
           </div>
           <button className="btn-primary" onClick={()=>{setEditingEvent(null); setIsEventFormOpen(true)}}>+ 新增活動</button>
        </div>
        
        {dayEvents.length === 0 ? (
          <div style={{textAlign:'center', padding:'40px', color:'#999', background:'white', borderRadius:'8px', border:'1px dashed #ddd'}}>
            本日尚無行程，點擊右上方按鈕新增
          </div>
        ) : (
          dayEvents.map(ev => (
            <div key={ev.id} style={{display:'flex', background:'white', padding:'15px', marginBottom:'12px', borderRadius:'8px', borderLeft:`5px solid ${EXPENSE_CATEGORIES[ev.category]?.color || '#999'}`, boxShadow:'0 2px 4px rgba(0,0,0,0.05)', border:'1px solid #f0f0f0'}}>
              <div style={{minWidth:'60px', fontWeight:'bold', color:'#333'}}>{ev.start_time}</div>
              <div style={{flex:1}}>
                <b style={{fontSize:'1.05rem'}}>{ev.title}</b>
                <div style={{fontSize:'0.9rem', color:'#666', marginTop:'3px'}}>{ev.place_name}</div>
                <span style={{fontSize:'0.75rem', background:'#f4f4f4', padding:'3px 8px', borderRadius:'4px', color:'#666', marginTop:'5px', display:'inline-block'}}>{EXPENSE_CATEGORIES[ev.category]?.label || '其他'}</span>
              </div>
              <div style={{textAlign:'right', display:'flex', flexDirection:'column', justifyContent:'center'}}>
                <div style={{fontWeight:'bold', fontSize:'1.1rem'}}>{
                  ev.cost === '' || ev.cost === null || ev.cost === undefined
                    ? ''
                    : `$${Number(ev.cost).toLocaleString()}`
                }</div>
                <div style={{fontSize:'0.85rem', marginTop:'8px'}}>
                   <span onClick={()=>{setEditingEvent(ev); setIsEventFormOpen(true);}} style={{cursor:'pointer', marginRight:'12px', color:'#555', textDecoration:'underline'}}>編輯</span>
                   <span onClick={(e)=>{e.stopPropagation(); setAllEvents(prev=>prev.filter(x=>x.id!==ev.id));}} style={{cursor:'pointer', color:'#e74c3c'}}>刪除</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {isEventFormOpen && <EventForm tripId={trip.id} currentDay={currentDay} initialData={editingEvent} onSave={handleSaveEvent} onCancel={()=>setIsEventFormOpen(false)}/>}
      
      {isEditTripModalOpen && (
        <TripSetupModal 
          initialData={{
            title: trip.title,
            start_date: trip.start_date, start_time: trip.start_time,
            end_date: trip.end_date, end_time: trip.end_time,
            budget: trip.details.total_budget, note: trip.note
          }}
          onSave={(updatedData) => { onUpdateTrip(updatedData); setIsEditTripModalOpen(false); }}
          onCancel={() => setIsEditTripModalOpen(false)}
        />
      )}
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
  
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('travel_app_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  // 登入成功
  const handleLoginSuccess = (userData) => {
    localStorage.setItem('travel_app_user', JSON.stringify(userData)); //存入瀏覽器
    setUser(userData); 
  };

  // 登出時清除localStorage
  const handleLogout = () => {
    if(window.confirm('確定要登出嗎？')) {
      localStorage.removeItem('travel_app_user'); 
      setUser(null);
      setActiveTab('HOME');
      setPlanningTrip(null);
    }
  };

  const toggleFavorite = (id) => {
    setFavorites(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleCreateTrip = (formData) => {
    const newTrip = {
      id: Date.now(), 
      user_id: user.id,
      ...formData,
      details: { 
        total_budget: parseInt(formData.budget) || 0, 
        actual_spent: 0, 
        cover_photo_url: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1000&q=80' 
      }
    };
    setTrips([newTrip, ...trips]);
    setIsSetupModalOpen(false);
    setPlanningTrip(newTrip);
  };

  // 更新使用者資料(待修改)
  const handleUpdateUser = async (updatedData) => {
    try {
      if (!user || !user.id) {
        alert("找不到使用者 ID，請重新登入");
        return;
      }

      const url = `${API_HOST}/api/users/${user.id}`;
      
      console.log("正在呼叫 API:", url);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || '更新失敗');
      }

      console.log("資料庫更新成功:", data);
      
      // 更新前端
      const newUser = { ...user, ...updatedData }; 
      localStorage.setItem('travel_app_user', JSON.stringify(newUser)); 
      setUser(newUser);
      
      alert('個人資料修改成功！');
      return true;

    } catch (error) {
      console.error("更新錯誤:", error);
      alert(`修改失敗: ${error.message}`);
      return false;
    }
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

  if (!user) {
    return <LoginPage onLogin={handleLoginSuccess} />;
  }

  // 行程更新
  const handleUpdateTrip = (updatedData) => {
    const updatedTrip = {
      ...planningTrip, 
      ...updatedData,  
      details: {
        ...planningTrip.details,
        total_budget: parseInt(updatedData.budget) || 0
      }
    };

    setTrips(prev => prev.map(t => t.id === planningTrip.id ? updatedTrip : t));
    setPlanningTrip(updatedTrip);
  };

  // 刪除行程
  const handleDeleteTrip = (id) => {
    setTrips(prev => prev.filter(t => t.id !== id));
  };

  return (
    <div>
      <nav className="navbar">
        <div className="nav-menu">
          <button className={`nav-item ${activeTab==='HOME'?'active':''}`} onClick={()=>{setActiveTab('HOME'); setPlanningTrip(null);}}>首頁</button>
          <button className={`nav-item ${activeTab==='FAVORITES'?'active':''}`} onClick={()=>{setActiveTab('FAVORITES'); setPlanningTrip(null);}}>精選</button>
          <button className={`nav-item ${activeTab==='EXPENSES'?'active':''}`} onClick={()=>{setActiveTab('EXPENSES'); setPlanningTrip(null);}}>開銷</button>
          <button className={`nav-item ${activeTab==='PROFILE'?'active':''}`} onClick={()=>{setActiveTab('PROFILE'); setPlanningTrip(null);}}>使用者</button>
        </div>
      
        <button onClick={handleLogout} style={{position:'absolute', right:'20px', background:'none', border:'none', cursor:'pointer', color:'#999', fontSize:'0.8rem'}}>
          登出 ➔
        </button>
      </nav>

      {planningTrip ? (
        <TripPlanner 
          trip={planningTrip} 
          onBack={() => setPlanningTrip(null)} 
          onUpdateTrip={handleUpdateTrip}   
          onDeleteTrip={handleDeleteTrip}  
          allEvents={allEvents} 
          setAllEvents={setAllEvents} 
        />
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