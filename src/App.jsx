import React, { useState, useEffect } from 'react';
import LoginPage from './Login';
import './App.css';
import { tripsData, eventsData as initialEvents, placesData, currentUser as initialUser } from './ApiData';

const API_HOST = "https://01da5078501d.ngrok-free.app";


// 使用 Date 物件來解析後端傳來的複雜時間格式 (GMT)
const splitDateTime = (dtString) => {
  if (!dtString) return { date: '', time: '' };

  // 讓瀏覽器幫我們解析時間
  const dateObj = new Date(dtString);

  // 如果解析失敗 (Invalid Date)，回傳空值以免當機
  if (isNaN(dateObj.getTime())) {
    console.warn("無法解析日期:", dtString);
    return { date: '', time: '' };
  }

  // 轉成 YYYY-MM-DD
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  
  // 轉成 HH:mm
  const hours = String(dateObj.getHours()).padStart(2, '0');
  const minutes = String(dateObj.getMinutes()).padStart(2, '0');

  return {
    date: `${year}-${month}-${day}`,
    time: `${hours}:${minutes}`
  };
};

const EXPENSE_CATEGORIES = {
  food: { label: '餐飲', color: '#ff9800' },
  transport: { label: '交通', color: '#2196f3' },
  stay: { label: '住宿', color: '#9c27b0' },
  fun: { label: '娛樂', color: '#e91e63' },
  shop: { label: '購物', color: '#00bcd4' },
  other: { label: '其他', color: '#9e9e9e' }
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
const FavoritesPage = ({ places, favList, favorites, onToggleFavorite, onGetReview, onSaveReview, onSearch }) => {
  
  const [view, setView] = useState(() => {
    return localStorage.getItem('favorites_view_mode') || 'saved';
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlace, setSelectedPlace] = useState(null);

  useEffect(() => {
    localStorage.setItem('favorites_view_mode', view);
  }, [view]);

  
  let displayPlaces = [];

  if (view === 'saved') {
    // 已珍藏頁面：使用前端過濾 (因為資料量通常不大)
    displayPlaces = favList.filter(p => 
      p.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  } else {
    // 探索更多頁面：直接顯示後端回傳的搜尋結果
    displayPlaces = places;
  }

  // 處理搜尋輸入
  const handleInputChange = (e) => {
    const val = e.target.value;
    setSearchTerm(val);

    // 如果是在「探索更多」模式，就呼叫後端 API 搜尋
    if (view === 'explore') {
      onSearch(val);
    }
  };

  return (
    <div className="container">
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
        <h2 style={{margin:0, borderLeft:'5px solid #333', paddingLeft:'15px'}}>
          {view === 'saved' ? 'MY FAVORITES' : 'EXPLORE MORE'}
        </h2>
        <div style={{background:'#eee', borderRadius:'20px', padding:'5px'}}>
          <button onClick={() => { setView('saved'); setSearchTerm(''); }} style={{padding:'8px 20px', borderRadius:'15px', border:'none', cursor:'pointer', background: view==='saved'?'white':'transparent', fontWeight: view==='saved'?'bold':'normal'}}>已珍藏</button>
          <button onClick={() => { setView('explore'); setSearchTerm(''); onSearch(''); }} style={{padding:'8px 20px', borderRadius:'15px', border:'none', cursor:'pointer', background: view==='explore'?'white':'transparent', fontWeight: view==='explore'?'bold':'normal'}}>探索更多</button>
        </div>
      </div>

      <div style={{textAlign: 'center', marginBottom: '30px'}}>
        <input
          type="text"
          placeholder={view === 'saved' ? "🔍 我的收藏..." : "🔍 輸入關鍵字搜尋景點..."}
          value={searchTerm}
          onChange={handleInputChange}
          style={{width: '100%', maxWidth: '500px', padding: '12px 20px', fontSize: '1rem', borderRadius: '30px', border: '1px solid #ddd', outline: 'none'}}
        />
      </div>

      {view === 'explore' && searchTerm === '' && displayPlaces.length === 0 ? (
        // 探索模式且沒打字時的提示
        <div style={{padding:'50px', textAlign:'center', color:'#888', border:'2px dashed #ddd', borderRadius:'8px', background: '#f9f9f9'}}>
          請在上方輸入關鍵字開始搜尋...
        </div>
      ) : displayPlaces.length === 0 ? (
        // 找不到資料
        <div style={{padding:'50px', textAlign:'center', color:'#888', border:'2px dashed #ddd', borderRadius:'8px', background: '#f9f9f9'}}>
          {searchTerm ? `找不到符合「${searchTerm}」的景點` : '目前沒有資料'}
        </div>
      ) : (
        // 顯示列表
        <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(250px, 1fr))', gap:'20px'}}>
          {displayPlaces.map(place => {
            const isFav = favorites.includes(place.id);
            return (
              <div 
                key={place.id} 
                className="trip-card" 
                onClick={() => setSelectedPlace(place)}
                style={{cursor:'pointer', position:'relative', border: '1px solid #eee'}}
              >
                <div style={{padding:'30px'}}>
                  <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
                    <h3 style={{margin:0, fontSize:'1.1rem', lineHeight:'1.4'}}>{place.name}</h3>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation(); 
                        onToggleFavorite(place.id);
                      }}
                      style={{
                        background:'none', border:'none', cursor:'pointer', fontSize:'1.5rem', 
                        color: isFav ? '#e74c3c' : '#ccc', minWidth:'30px', padding:0
                      }}
                    >
                      {isFav ? '❤️' : '🤍'}
                    </button>
                  </div>
                  <div style={{marginTop:'15px', fontSize:'0.85rem', color:'#888', display:'flex', alignItems:'center', gap:'5px'}}>
                     <span>📝 點擊查看評價與筆記</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedPlace && (
        <PlaceDetailsModal 
          place={selectedPlace}
          onGetReview={onGetReview}
          onSaveReview={onSaveReview}
          onClose={() => setSelectedPlace(null)}
        />
      )}
    </div>
  );
};

// 評價與筆記視窗
const PlaceDetailsModal = ({ place, onGetReview, onSaveReview, onClose }) => {
  const [rating, setRating] = useState(0);
  const [note, setNote] = useState('');
  
  const [avgScore, setAvgScore] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  
  const [isLoading, setIsLoading] = useState(true);

  const getScoreColor = (score) => {
    const s = parseFloat(score);
    if (s === 0) return '#ccc';      // 0分 (無評價) -> 灰色
    if (s < 2) return '#e74c3c';     // 2分以下 -> 紅色
    if (s <= 3.5) return '#f39c12';  // 2~3.5分 -> 黃橘色
    return '#27ae60';                // 3.6分以上 -> 綠色
  };

  useEffect(() => {
    let isMounted = true;
    const loadReview = async () => {
      setIsLoading(true);
      const data = await onGetReview(place.id);
      
      if (isMounted && data) {
        setRating(data.score || 0);
        setNote(data.comment || '');
        setAvgScore(parseFloat(data.average_score || 0).toFixed(1));
        setTotalReviews(data.total_reviews || 0);
      }
      if (isMounted) setIsLoading(false);
    };
    loadReview();
    
    return () => { isMounted = false; };
  }, [place.id, onGetReview]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await onSaveReview(place.id, { score: rating, comment: note });
    if (success) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
    }}>
      <div className="modal-content" style={{
        background: 'white', padding: '30px', borderRadius: '12px', width: '90%', maxWidth: '400px',
        boxShadow: '0 5px 15px rgba(0,0,0,0.2)'
      }}>
        <h3 style={{marginTop: 0, marginBottom: '20px'}}>{place.name} - 您的評價</h3>
        
        <div style={{textAlign:'center', borderBottom:'1px solid #eee', paddingBottom:'20px', marginBottom:'20px'}}>
          
          <div style={{
            display:'inline-flex', justifyContent:'center', alignItems:'center', gap:'15px', 
            background:'#f8f9fa', padding:'15px 25px', borderRadius:'12px', 
            border: `2px solid ${getScoreColor(avgScore)}` // 邊框也跟著變色
          }}>
            <div style={{
              fontSize:'2.5rem', 
              fontWeight:'bold', 
              color: getScoreColor(avgScore) 
            }}>
              {avgScore}
            </div>
            
            <div style={{textAlign:'left', fontSize:'0.9rem', color:'#666'}}>
              <div style={{fontWeight:'bold', color:'#333'}}>綜合評分</div>
              <div>共 {totalReviews} 人評價</div>
            </div>
          </div>
        </div>
        
        {isLoading ? (
          <div style={{textAlign:'center', padding:'20px', color:'#666'}}>
            正在讀取資訊...
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{marginBottom: '20px'}}>
              <label style={{display:'block', marginBottom:'8px', fontWeight:'bold'}}>您的評分</label>
              <div style={{display: 'flex', gap: '5px', cursor: 'pointer'}}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <span 
                    key={star} 
                    onClick={() => {
                    // 如果點擊的這顆星剛好等於目前的分數，代表想取消 -> 設為 0
                    setRating(star === rating ? 0 : star);
                  }}
                    style={{
                      fontSize: '2rem', 
                      color: star <= rating ? '#FFD700' : '#ddd', 
                      transition: 'color 0.2s',
                      userSelect: 'none'
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
              <label style={{display:'block', marginBottom:'8px', fontWeight:'bold'}}>心得筆記</label>
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
              <button type="submit" className="btn-primary" style={{padding:'8px 16px', border:'none', background:'#333', color:'white', borderRadius:'6px', cursor:'pointer'}}>儲存評價</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

// 開銷頁面
const ExpensesPage = ({ trips }) => { 
  const [selectedTripId, setSelectedTripId] = useState(trips.length > 0 ? trips[0].id : null);
  
  const [stats, setStats] = useState({
    totalSpent: 0,
    categorySummaries: [] 
  });
  
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if ((!selectedTripId || !trips.find(t => t.id === parseInt(selectedTripId))) && trips.length > 0) {
      setSelectedTripId(trips[0].id);
    }
  }, [trips, selectedTripId]);


  // 取得目前選到的行程基本資料
  const currentTrip = trips.find(t => t.id === parseInt(selectedTripId));

  // 當選擇的 Trip 改變時，呼叫後端 API 取得最新統計
  useEffect(() => {
    if (!selectedTripId) return;

    const fetchStats = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${API_HOST}/api/trips/${selectedTripId}/events`, {
           headers: { "ngrok-skip-browser-warning": "true" }
        });
        const resData = await response.json();
        
        if (resData.code === "200" && resData.data) {
          setStats({
            totalSpent: Number(resData.data.total_spent) || 0,
            categorySummaries: (resData.data.category_summaries || []).map(item => ({
              ...item,
              total_amount: Number(item.total_amount) || 0
            }))
          });
        }
      } catch (e) {
        console.error("讀取開銷失敗", e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [selectedTripId]); 

  // 計算預算百分比
  const budget = currentTrip ? Number(currentTrip.details?.total_budget) || 0 : 0;
  const percentage = budget > 0 ? Math.min((Number(stats.totalSpent) / budget) * 100, 100) : 0;

  const categoryChartData = Object.entries(EXPENSE_CATEGORIES).map(([key, info]) => {
    const found = stats.categorySummaries.find(item => item.category === key);
    const amount = found ? Number(found.total_amount) : 0;
    
    return {
      key: key,
      label: info.label,
      color: info.color,
      amount: amount
    };
  });

  if (trips.length === 0) {
     return <div className="container" style={{padding:'40px', textAlign:'center', color:'#999'}}>載入行程中...</div>;
  }

  if (!currentTrip) {
     return <div className="container" style={{padding:'40px', textAlign:'center'}}>請先建立行程</div>;
  }

  return (
    <div className="container">
      <h2 style={{borderLeft:'5px solid #333', paddingLeft:'15px'}}>EXPENSE</h2>
      
      <div style={{marginBottom:'20px'}}>
        <label style={{marginRight:'10px', fontWeight:'bold'}}>選擇行程：</label>
        <select 
          value={selectedTripId} 
          onChange={(e) => setSelectedTripId(e.target.value)} 
          style={{padding:'8px', fontSize:'1rem', borderRadius:'4px', border:'1px solid #ddd'}}
        >
          {trips.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
        </select>
      </div>

      {isLoading ? (
        <div style={{textAlign:'center', padding:'40px', color:'#999'}}>載入數據中...</div>
      ) : (
        <>
          <div style={{background:'white', padding:'30px', borderRadius:'12px', boxShadow:'0 5px 15px rgba(0,0,0,0.05)', marginBottom:'30px'}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:'10px'}}>
              <div>
                <h3 style={{margin:0, color:'#666'}}>總花費 / 預算</h3>
                <div style={{fontSize:'2.5rem', fontWeight:'bold', color:'#333'}}>
                  ${Number(stats.totalSpent).toLocaleString()} 
                  <span style={{fontSize:'1rem', color:'#999'}}> / ${Number(budget).toLocaleString()}</span>
                </div>
              </div>
              <div style={{textAlign:'right'}}>
                <div style={{fontWeight:'bold', color: stats.totalSpent > budget ? '#e74c3c' : '#27ae60'}}>
                  {stats.totalSpent > budget ? '🆘 爆預算啦' : '✅ 預算內'}
                </div>
              </div>
            </div>
            
            <div style={{height:'10px', background:'#eee', borderRadius:'5px', overflow:'hidden'}}>
              <div style={{
                width: `${percentage}%`, 
                height:'100%', 
                background: stats.totalSpent > budget ? '#e74c3c' : '#27ae60', 
                transition:'width 0.5s'
              }}></div>
            </div>
          </div>

          <h3>花費類別統計</h3>
          <div style={{background:'white', padding:'20px', borderRadius:'12px', boxShadow:'0 2px 5px rgba(0,0,0,0.05)'}}>
            {categoryChartData.map((item) => {
              const barPercent = stats.totalSpent > 0 ? (item.amount / stats.totalSpent) * 100 : 0;
              
              return (
                <div key={item.key} style={{marginBottom:'15px'}}>
                  <div style={{display:'flex', justifyContent:'space-between', fontSize:'0.9rem', marginBottom:'5px'}}>
                    <span style={{display:'flex', alignItems:'center', gap:'5px'}}>
                      <span style={{width:'10px', height:'10px', borderRadius:'50%', background: item.color}}></span>
                      {item.label}
                    </span>
                    <span>${Number(item.amount).toLocaleString()} ({Math.round(barPercent)}%)</span>
                  </div>
                  <div style={{height:'8px', background:'#f5f5f5', borderRadius:'4px', overflow:'hidden'}}>
                    <div style={{width: `${barPercent}%`, height:'100%', background: item.color, transition:'width 0.5s'}}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

// 使用者頁面
const ProfilePage = ({ user, trips, favCount, onUpdateUser, onSelectTrip, onNavigateToFavorites }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: user.name, email: user.email });
  const [isSaving, setIsSaving] = useState(false); 
  
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

const TripPlanner = ({ trip, onBack, onUpdateTrip, onDeleteTrip, allEvents = [], onSaveEvent, onDeleteEvent }) => {
  const [currentDay, setCurrentDay] = useState(() => {
    try {
      const savedDay = localStorage.getItem(`trip_${trip.id}_day`);
      return savedDay ? parseInt(savedDay) : 1;
    } catch (e) {
      return 1;
    }
  });
  const [isEventFormOpen, setIsEventFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [isEditTripModalOpen, setIsEditTripModalOpen] = useState(false);

  useEffect(() => {
    if (trip && trip.id) {
      localStorage.setItem(`trip_${trip.id}_day`, currentDay);
    }
  }, [currentDay, trip.id]);

  const getDaysArray = (s, e) => {
    try {
      if (!s || !e) return [1];
      const start = new Date(s);
      const end = new Date(e);
      if (isNaN(start) || isNaN(end)) return [1];
      const diff = Math.abs(end - start);
      const days = Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
      return Array.from({ length: days }, (_, i) => i + 1);
    } catch (err) {
      return [1];
    }
  };

  // 計算天數陣列
  const days = getDaysArray(trip?.start_date, trip?.end_date);
  
  // 防止切換行程時天數溢出
  if (currentDay > days.length) setCurrentDay(1);

  // 篩選當日活動並排序 (加上安全保護)
  const dayEvents = (allEvents || [])
    .filter(e => e.trip_id === trip.id && e.day_no === currentDay)
    .sort((a,b) => (a.start_time || '').localeCompare(b.start_time || ''));
  
  // 計算總花費
  const totalSpent = (allEvents || [])
    .filter(e => e.trip_id === trip.id)
    .reduce((sum, e) => sum + (Number(e.cost) || 0), 0);

  // 計算當日花費
  const dailySpent = dayEvents.reduce((sum, e) => sum + (Number(e.cost) || 0), 0);


  // 改寫儲存邏輯 (呼叫後端 API)
  const handleSaveEventWrapper = async (data) => {
    const success = await onSaveEvent(data);
    if (success) {
      setIsEventFormOpen(false);
      setEditingEvent(null);
    }
  };

  // 刪除整趟行程
  const handleDeleteThisTrip = () => {
    if (window.confirm(`確定要刪除「${trip.title}」嗎？刪除後無法復原。`)) {
      onDeleteTrip(trip.id);
      onBack();
    }
  };

  // 日期顯示輔助函式
  const getDayDateString = (startDate, dayNumber) => {
    try {
      const date = new Date(startDate);
      date.setDate(date.getDate() + (dayNumber - 1));
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const dd = String(date.getDate()).padStart(2, '0');
      return `${mm}/${dd}`;
    } catch { return "--/--"; }
  };

  // 安全取得預算
  const budget = parseInt(trip.details?.total_budget || 0);

  return (
    <div className="container" style={{paddingBottom:'100px'}}>
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
          <div><strong>🗓️出發：</strong> {trip.start_date} {trip.start_time && <span style={{marginLeft:'10px'}}>{trip.start_time}</span>}</div>
          <div><strong>回程：</strong> {trip.end_date} {trip.end_time && <span style={{marginLeft:'10px'}}>{trip.end_time}</span>}</div>
        </div>

        <div style={{background:'#f8f9fa', padding:'15px 20px', borderRadius:'8px', display:'inline-flex', alignItems:'center', gap:'20px', border:'1px solid #eee', marginBottom: '5px'}}>
           <div style={{fontSize:'1rem'}}>總預算: <b style={{fontSize:'1.1rem'}}>${budget.toLocaleString()}</b></div>
           <div style={{height:'20px', width:'1px', background:'#ccc'}}></div>
           <div style={{fontSize:'1rem'}}>
             目前花費: <b style={{fontSize:'1.1rem', color: totalSpent > budget ? '#e74c3c' : '#27ae60'}}>
               ${totalSpent.toLocaleString()}
             </b>
           </div>
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
          dayEvents.map(ev => {
            const catConfig = EXPENSE_CATEGORIES[ev.category] || EXPENSE_CATEGORIES['other'];
            
            return (
              <div key={ev.id} style={{display:'flex', background:'white', padding:'15px', marginBottom:'12px', borderRadius:'8px', borderLeft:`5px solid ${catConfig.color}`, boxShadow:'0 2px 4px rgba(0,0,0,0.05)', border:'1px solid #f0f0f0'}}>
                <div style={{minWidth:'60px', fontWeight:'bold', color:'#333'}}>{ev.start_time}</div>
                <div style={{flex:1}}>
                  <b style={{fontSize:'1.05rem'}}>{ev.title}</b>
                  <div style={{fontSize:'0.9rem', color:'#666', marginTop:'3px'}}>{ev.place_name}</div>
                  <span style={{fontSize:'0.75rem', background:'#f4f4f4', padding:'3px 8px', borderRadius:'4px', color:'#666', marginTop:'5px', display:'inline-block'}}>
                    {catConfig.label}
                  </span>
                </div>
                <div style={{textAlign:'right', display:'flex', flexDirection:'column', justifyContent:'center'}}>
                  <div style={{fontWeight:'bold', fontSize:'1.1rem'}}>
                    {ev.cost ? `$${Number(ev.cost).toLocaleString()}` : ''}
                  </div>
                  <div style={{fontSize:'0.85rem', marginTop:'8px'}}>
                    <span onClick={()=>{setEditingEvent(ev); setIsEventFormOpen(true);}} style={{cursor:'pointer', marginRight:'12px', color:'#555', textDecoration:'underline'}}>編輯</span>
                    
                    <span 
                      onClick={(e)=>{
                        e.stopPropagation(); 
                        if(window.confirm('確定要刪除這個活動嗎？')) {
                          onDeleteEvent(ev.id);
                        }
                      }} 
                      style={{cursor:'pointer', color:'#e74c3c'}}
                    >
                      刪除
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {isEventFormOpen && (
        <EventForm 
          tripId={trip.id} 
          currentDay={currentDay} 
          initialData={editingEvent} 
          onSave={handleSaveEventWrapper} 
          onCancel={()=>setIsEventFormOpen(false)}
        />
      )}
      
      {isEditTripModalOpen && (
        <TripSetupModal 
          initialData={{
            title: trip.title,
            start_date: trip.start_date, start_time: trip.start_time,
            end_date: trip.end_date, end_time: trip.end_time,
            budget: trip.details?.total_budget, 
            note: trip.note
          }}
          onSave={(updatedData) => { onUpdateTrip(updatedData); setIsEditTripModalOpen(false); }}
          onCancel={() => setIsEditTripModalOpen(false)}
        />
      )}
    </div>
  );
};

// SQL 控制台
const SQLPage = () => {
  const [query, setQuery] = useState(''); 
  const [results, setResults] = useState([]);
  const [message, setMessage] = useState(''); 
  const [error, setError] = useState('');  
  const [isLoading, setIsLoading] = useState(false);

  const handleExecute = async () => {
    setIsLoading(true);
    setResults([]);
    setMessage('');
    setError('');

    try {
      const response = await fetch(`${API_HOST}/api/admin/sql`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          "ngrok-skip-browser-warning": "true" 
        },
        body: JSON.stringify({ query: query })
      });

      const resData = await response.json();

      if (resData.code === "200") {
        if (resData.type === 'query') {
          setResults(resData.data);
          setMessage(`查詢成功，共找到 ${resData.data.length} 筆資料`);
        } else {
          setMessage(resData.message);
        }
      } else {
        setError(resData.message || resData.error || '執行失敗');
      }
    } catch (err) {
      setError("連線錯誤：" + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container" style={{maxWidth: '1000px'}}>
      <h2 style={{borderLeft:'5px solid #040303ff', paddingLeft:'15px', color: '#060606ff'}}>
        SQL 資料庫後台
      </h2>

      <div style={{background:'white', padding:'20px', borderRadius:'12px', boxShadow:'0 2px 10px rgba(0,0,0,0.1)', marginBottom:'30px'}}>
        <textarea 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="請輸入 SQL 語法"
          rows="4"
          style={{
            width: '100%', padding: '15px', fontSize: '1.1rem', fontFamily: 'monospace',
            borderRadius: '8px', border: '1px solid #ddd', background: '#2d3436', color: '#f7f6f5ff',
            resize: 'vertical'
          }}
        />
        <div style={{display:'flex', justifyContent:'flex-end', marginTop:'10px'}}>
           <button 
             className="btn-primary" 
             onClick={handleExecute} 
             disabled={isLoading}
             style={{background: isLoading ? '#ffffffff' : '#000000bc'}}
           >
             {isLoading ? '執行中...' : '執行 SQL'}
           </button>
        </div>
      </div>

      {error && (
        <div style={{padding:'15px', background:'#fadbd8', color:'#c0392b', borderRadius:'8px', marginBottom:'20px', border:'1px solid #e6b0aa'}}>
          <strong>錯誤：</strong> {error}
        </div>
      )}
      {message && !error && (
        <div style={{padding:'15px', background:'#d4efdf', color:'#1e8449', borderRadius:'8px', marginBottom:'20px', border:'1px solid #a9dfbf'}}>
          <strong>系統訊息：</strong> {message}
        </div>
      )}

      {results.length > 0 && (
        <div style={{overflowX: 'auto', background:'white', borderRadius:'12px', boxShadow:'0 2px 10px rgba(0,0,0,0.05)'}}>
          <table style={{width:'100%', borderCollapse:'collapse', minWidth:'600px'}}>
            <thead>
              <tr style={{background:'#f8f9fa', borderBottom:'2px solid #ddd'}}>
                {Object.keys(results[0]).map(key => (
                  <th key={key} style={{padding:'12px 15px', textAlign:'left', color:'#555', fontSize:'0.9rem'}}>{key}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {results.map((row, index) => (
                <tr key={index} style={{borderBottom:'1px solid #eee'}}>
                  {Object.values(row).map((val, i) => (
                    <td key={i} style={{padding:'12px 15px', color:'#333', fontFamily:'monospace'}}>
                      {typeof val === 'object' && val !== null ? JSON.stringify(val) : String(val)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// 主程式
function App() {
  const [activeTab, setActiveTab] = useState(() => {
  // 嘗試讀取上次停留的分頁，如果沒有就預設回 HOME
  return localStorage.getItem('travel_app_active_tab') || 'HOME';
});
  const [trips, setTrips] = useState([]);
  const [allEvents, setAllEvents] = useState(initialEvents);
  const [planningTrip, setPlanningTrip] = useState(() => {
    try {
      const saved = localStorage.getItem('active_planning_trip');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [favList, setFavList] = useState([]);
  const [places, setPlaces] = useState([]);
  
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
    setUser(null);
    setPlanningTrip(null);
    setTrips([]);
    localStorage.removeItem('travel_app_user'); //清除使用者資料
    localStorage.removeItem('travel_app_token'); //清除Token
    localStorage.removeItem('active_planning_trip'); 
    localStorage.removeItem('travel_app_active_tab');
    localStorage.removeItem('favorites_view_mode');
    setActiveTab('HOME');
  };

  const toggleFavorite = (id) => {
    setFavorites(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleUpdateUser = async (updatedData) => {
    try {
      // 1. 檢查目前是否已登入 (要有 user.id)
      if (!user || !user.id) {
        alert("找不到使用者 ID，請重新登入");
        return;
      }

      // 2. 取出 Token (雖然這段 Python 代碼沒顯示驗證 token，但帶著比較保險)
      const token = localStorage.getItem('travel_app_token');
      
      // 3. 設定 API 網址
      const url = 'https://01da5078501d.ngrok-free.app/api/users/User'; 
      
      console.log("正在呼叫 API:", url);

      // 4. 組合要傳送的資料
      const payload = {
          id: user.id,             
          name: updatedData.name,   
      };

      const response = await fetch(url, {
        method: 'POST', // ★ 配合後端改成 POST
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '' 
        },
        body: JSON.stringify(payload) // 傳送包含 id 的完整資料
      });

      const result = await response.json();

      // 5. 判斷後端回傳結果
      // 後端成功時回傳 code: "200"
      if (result.code === "200") {
        console.log("資料庫更新成功:", result);

        // A. 更新前端 React State
        // 因為後端只回傳 name，我們手動把前端的資料更新
        const newUser = { ...user, ...updatedData }; 
        setUser(newUser);

        // B. 更新 LocalStorage (保持登入狀態資料最新)
        localStorage.setItem('travel_app_user', JSON.stringify(newUser)); 
        
        alert('個人資料修改成功！');
        return true;

      } else {
        throw new Error(result.message || '更新失敗');
      }

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



  // 1. 讀取行程 (GET) - 配合後端 datetime 格式
  const fetchUserTrips = async (userId) => {
    try {
      console.log(`正在抓取使用者 ${userId} 的行程...`);
      const response = await fetch(`${API_HOST}/api/trips/${userId}`, {
        method: 'GET',
        headers: {
            "ngrok-skip-browser-warning": "true", 
            "Content-Type": "application/json"
        }
      });

      // 先讀成純文字 (Text)，不要直接轉 JSON
      const textData = await response.text();

      // 手動解析 JSON
      let resData;
      try {
        resData = JSON.parse(textData);
      } catch (e) {
        console.error("解析失敗：後端回傳的不是 JSON，可能是 HTML 錯誤頁面或 Ngrok 警告");
        setTrips([]);
        return [];
      }

      if (resData.code === "200" && Array.isArray(resData.data)) {
        
        const formattedTrips = resData.data.map(dbTrip => {
          if (!dbTrip) return null;

          const getVal = (obj, key) => obj[key] || obj[key.toLowerCase()] || obj[key.toUpperCase()];
          
          const rawStart = getVal(dbTrip, 'start_datetime');
          const rawEnd = getVal(dbTrip, 'end_datetime');
          const rawTitle = getVal(dbTrip, 'title');
          const rawNote = getVal(dbTrip, 'note');
          const rawBudget = getVal(dbTrip, 'total_budget');
          const rawUserId = getVal(dbTrip, 'Users_id') || getVal(dbTrip, 'user_id');

          const start = splitDateTime(rawStart);
          const end = splitDateTime(rawEnd);

          return {
            id: dbTrip.id,
            user_id: rawUserId, 
            title: rawTitle || '未命名行程',
            note: rawNote || '',
            start_date: start.date,
            start_time: start.time,
            end_date: end.date,
            end_time: end.time,
            details: {
              total_budget: rawBudget || 0,
              actual_spent: 0,
              cover_photo_url: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1000&q=80'
            }
          };
        }).filter(t => t !== null); 

        console.log("成功轉換後的資料:", formattedTrips);
        setTrips(formattedTrips); 
        return formattedTrips;    
      } else {
        console.warn("後端回傳失敗或資料為空:", resData);
        setTrips([]); 
        return [];
      }
    } catch (error) {
      console.error("☠️ 連線嚴重錯誤:", error);
      setTrips([]); 
      return [];
    }
  };

  useEffect(() => {
    if (user && user.id) {
      fetchUserTrips(user.id);
    } else {
      setTrips([]);
    }
  }, [user]);



  // 2. 建立行程 (POST)

  const handleCreateTrip = async (formData) => {
  try {
    // 1. 發送資料給後端 (POST)
    const response = await fetch(`${API_HOST}/api/trips/${user.id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: formData.title,
        start_date: formData.start_date,
        start_time: formData.start_time || '00:00', // 若沒填給預設值
        end_date: formData.end_date,
        end_time: formData.end_time || '00:00',
        note: formData.note,
        total_budget: parseInt(formData.budget) || 0
      })
    });

    const resData = await response.json();

    if (resData.code === "200") {
      // 2. 建立成功！
      const freshTrips = await fetchUserTrips(user.id);

      // 3. 找出剛剛建立的那個行程 
      const newTripFromDB = freshTrips.find(t => t.title === formData.title); 
      
      // 4. 更新前端狀態
      setIsSetupModalOpen(false); // 關閉視窗

      if (newTripFromDB) {
        setPlanningTrip(newTripFromDB); 
      } else {
        alert("行程建立成功！請在列表中點選查看");
      }

    } else {
      alert(`建立失敗: ${resData.message}`);
    }
  } catch (error) {
    console.error("建立行程錯誤:", error);
    alert("連線失敗，請稍後再試");
  }
};



  // 3. 更新行程 (PUT)

  // 這裡接到 TripPlanner 的 onUpdateTrip
  const handleUpdateTrip = async (updatedData) => {
    if (!planningTrip) return;

    try {
      // 對應後端: @trip_bp.route('/<int:trip_id>', methods=['PUT'])
      const response = await fetch(`${API_HOST}/api/trips/${planningTrip.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: updatedData.title,
          start_date: updatedData.start_date,
          start_time: updatedData.start_time,
          end_date: updatedData.end_date,
          end_time: updatedData.end_time,
          note: updatedData.note,
          total_budget: parseInt(updatedData.budget) || 0
        })
      });

      const resData = await response.json();

      if (resData.code === "200") {
        console.log("更新成功");
        
        // 更新前端畫面
        const newTripData = {
          ...planningTrip,
          ...updatedData,
          details: { ...planningTrip.details, total_budget: parseInt(updatedData.budget) || 0 }
        };

        // 1. 更新列表
        setTrips(prev => prev.map(t => t.id === planningTrip.id ? newTripData : t));
        // 2. 更新當前檢視
        setPlanningTrip(newTripData);
        
        alert("行程修改已儲存");
      } else {
        alert(`更新失敗: ${resData.message}`);
      }
    } catch (error) {
      console.error("更新行程錯誤:", error);
    }
  };



  // 4. 刪除行程 (DELETE)

  const handleDeleteTrip = async (tripId) => {
    try {
      const response = await fetch(`${API_HOST}/api/trips/${tripId}`, {
        method: 'DELETE'
      });
      
      const resData = await response.json();

      if (resData.code === "200") {
         setTrips(prev => prev.filter(t => t.id !== tripId));
         if (planningTrip && planningTrip.id === tripId) {
             setPlanningTrip(null);
         }
      } else {
         alert(`刪除失敗: ${resData.message}`);
      }
    } catch (error) {
      console.error("刪除行程錯誤:", error);
    }
  };

  // 5. 取得特定行程的所有活動 (GET)
  const fetchTripEvents = async (tripId) => {
    try {
      const response = await fetch(`${API_HOST}/api/trips/${tripId}/events`, {
        method: 'GET',
        headers: {
          "ngrok-skip-browser-warning": "true", 
          "Content-Type": "application/json"
        }
      });

      const resData = await response.json();

      if (resData.code === "200" && resData.data && Array.isArray(resData.data.events)) {
        // ★★★ 修改重點：從 resData.data.events 拿陣列，而不是直接拿 resData.data
        const backendEvents = resData.data.events;

        const formattedEvents = backendEvents.map(e => ({
          id: e.id,
          trip_id: e.Trips_id,
          day_no: e.day_no,
          title: e.title,
          place_name: e.place_name,
          start_time: e.start_time ? String(e.start_time).slice(0, 5) : '',
          end_time: e.end_time ? String(e.end_time).slice(0, 5) : '',
          cost: e.actual_expense || e.planned_cost || 0, // 後端現在有 actual_expense
          category: e.category || 'other' 
        }));

        setAllEvents(formattedEvents);
        console.log("活動列表載入完成:", formattedEvents); 
      } else {
        console.warn("後端回傳資料格式不符:", resData);
        setAllEvents([]);
      }
    } catch (error) {
      console.error("抓取活動失敗:", error);
      setAllEvents([]);
    }
  };

// App 元件內部

  useEffect(() => {
    if (planningTrip && planningTrip.id) {
      // 1. 存檔到 localStorage (防重整消失)
      localStorage.setItem('active_planning_trip', JSON.stringify(planningTrip));
      
      fetchTripEvents(planningTrip.id);
      
    } else {
      // 沒行程 -> 清除 localStorage
      localStorage.removeItem('active_planning_trip');
      
      // 順便把活動清空，避免下次點進別的行程時閃爍舊資料
      setAllEvents([]);
    }
  }, [planningTrip]); // 只要 planningTrip 變動，就會自動執行


  // 6. 儲存活動 (新增 POST / 編輯 PUT)
  const handleSaveEvent = async (eventData) => {
    try {
      const isEdit = !!eventData.id; // 有 id 代表是編輯，沒有就是新增
      let url, method;

      if (isEdit) {
        url = `${API_HOST}/api/events/${eventData.id}`;
        method = 'PUT';
      } else {
        url = `${API_HOST}/api/events/${planningTrip.id}`;
        method = 'POST';
      }

      // 準備傳給後端的資料 (Payload)
      const payload = {
        day_no: eventData.day_no,
        title: eventData.title,
        start_time: eventData.start_time,
        end_time: eventData.end_time,
        place_name: eventData.place_name,
        cost: parseInt(eventData.cost) || 0,
        category: eventData.category 
      };

      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const resData = await response.json();

      if (resData.code === "200") {
        await fetchTripEvents(planningTrip.id);
        
        alert(isEdit ? "活動修改成功" : "活動新增成功");
        return true;
      } else {
        alert(`儲存失敗: ${resData.message}`);
        return false;
      }
    } catch (error) {
      console.error("儲存活動錯誤:", error);
      alert("連線失敗");
      return false;
    }
  };

  // 7. 刪除活動 (DELETE)
  const handleDeleteEvent = async (eventId) => {
    try {
      // DELETE /api/events/events/<event_id>
      const response = await fetch(`${API_HOST}/api/events/${eventId}`, {
        method: 'DELETE'
      });
      const resData = await response.json();

      if (resData.code === "200") {
        setAllEvents(prev => prev.filter(e => e.id !== eventId));
      } else {
        alert(`刪除失敗: ${resData.message}`);
      }
    } catch (error) {
      console.error("刪除活動錯誤:", error);
    }
  };

  // 8-1. 搜尋公共景點 (GET /api/places)
  const handleSearchPlaces = async (keyword) => {
    if (!keyword) {
      setPlaces([]); // 如果沒字，就清空列表
      return;
    }
    
    try {
      const response = await fetch(`${API_HOST}/api/places?q=${keyword}`, {
        headers: { "ngrok-skip-browser-warning": "true" }
      });
      const resData = await response.json();
      if (resData.code === "200") {
        const mappedPlaces = resData.data.map(p => ({
          id: p.place_id,
          name: p.name
        }));
        setPlaces(mappedPlaces);
      }
    } catch (error) {
      console.error("搜尋失敗:", error);
    }
  };

  useEffect(() => {
    localStorage.setItem('travel_app_active_tab', activeTab);
  }, [activeTab]);

  // 8-2. 取得使用者的收藏清單 (GET /users/<id>/favorites)
  const fetchFavorites = async () => {
    if (!user) return;
    try {
      const response = await fetch(`${API_HOST}/api/users/${user.id}/favorites`, {
        headers: { "ngrok-skip-browser-warning": "true" }
      });
      const resData = await response.json();
      if (resData.code === "200") {
        const rawData = resData.data;
        
        // 1. 存 ID 用於判斷愛心
        setFavorites(rawData.map(item => item.place_id));
        
        setFavList(rawData.map(item => ({
            id: item.place_id,
            name: item.name
        })));
      }
    } catch (error) {
      console.error("取得收藏失敗:", error);
    }
  };

  // 8-3. 切換收藏狀態 (POST /api/favorites)
  const handleToggleFavorite = async (placeId) => {
    try {
      const response = await fetch(`${API_HOST}/api/favorites`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, place_id: placeId })
      });
      const resData = await response.json();
      if (resData.code === "200") {
        // 成功後，重新抓取最新的收藏清單
        fetchFavorites();
      } else {
        alert(resData.message);
      }
    } catch (error) {
      console.error("收藏失敗:", error);
    }
  };

  // 8-4. 取得個人對某地點的評論 (GET)
  const handleGetReview = async (placeId) => {
    try {
      const response = await fetch(`${API_HOST}/api/users/${user.id}/places/${placeId}/review`, {
         headers: { "ngrok-skip-browser-warning": "true" }
      });
      const resData = await response.json();
      
      if (resData.code === "200" && resData.data) {
        // ★★★ 關鍵修改在這裡 ★★★
        // 後端給的是: { my_review: {...}, global_stat: {...} }
        // 我們要在這裡把它「攤平」，讓 Modal 可以直接讀到 score, average_score
        
        const myReview = resData.data.my_review || {};
        const globalStat = resData.data.global_stat || {};

        return {
          score: myReview.score || 0,
          comment: myReview.comment || "",
          average_score: globalStat.average_score || 0,
          total_reviews: globalStat.total_reviews || 0
        };
      }
      
      return { score: 0, comment: "", average_score: 0, total_reviews: 0 };
    } catch (error) {
      console.error("取得評論失敗:", error);
      return { score: 0, comment: "", average_score: 0, total_reviews: 0 };
    }
  };

  // 8-5. 儲存個人評論 (POST)
  const handleSaveReview = async (placeId, reviewData) => {
    try {
      const response = await fetch(`${API_HOST}/api/users/${user.id}/places/${placeId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewData)
      });
      const resData = await response.json();
      if (resData.code === "200") {
        alert("評論已儲存");
        return true;
      } else {
        alert("儲存失敗: " + resData.message);
        return false;
      }
    } catch (error) {
      console.error("儲存評論失敗:", error);
      return false;
    }
  };

 // 8-6. 當切換到 Favorites 頁籤時，只載入收藏清單，不預先載入搜尋結果
  useEffect(() => {
    if (activeTab === 'FAVORITES' && user) {
      fetchFavorites();
      setPlaces([]);
    }
  }, [activeTab, user]);

  return (
    !user ? (
      <LoginPage onLogin={handleLoginSuccess} />
    ) : (
      <div>
        <nav className="navbar">
          <div className="nav-menu">
            <button className={`nav-item ${activeTab==='HOME'?'active':''}`} onClick={()=>{setActiveTab('HOME'); setPlanningTrip(null);}}>首頁</button>
            <button className={`nav-item ${activeTab==='FAVORITES'?'active':''}`} onClick={()=>{setActiveTab('FAVORITES'); setPlanningTrip(null);}}>精選</button>
            <button className={`nav-item ${activeTab==='EXPENSES'?'active':''}`} onClick={()=>{setActiveTab('EXPENSES'); setPlanningTrip(null);}}>開銷</button>
            <button className={`nav-item ${activeTab==='PROFILE'?'active':''}`} onClick={()=>{setActiveTab('PROFILE'); setPlanningTrip(null);}}>使用者</button>
            <button className={`nav-item ${activeTab==='SQL'?'active':''}`} onClick={()=>{setActiveTab('SQL'); setPlanningTrip(null);}}>DB後台</button>
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
            onSaveEvent={handleSaveEvent}
            onDeleteEvent={handleDeleteEvent}
          />
        ) : (
          <>
            {activeTab === 'HOME' && renderHome()}
            {activeTab === 'FAVORITES' && (
              <FavoritesPage 
                places={places}          
                favList={favList}          
                favorites={favorites}     
                onToggleFavorite={handleToggleFavorite} 
                onGetReview={handleGetReview}     
                onSaveReview={handleSaveReview}
                onSearch={handleSearchPlaces} 
              />
            )}
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

            {activeTab === 'SQL' && <SQLPage />}
          </>
        )}
      </div>
    )
  );
}

export default App;