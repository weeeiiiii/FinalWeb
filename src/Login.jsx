import React, { useState } from 'react';

const LoginPage = ({ onLogin }) => {
  const [isLoginMode, setIsLoginMode] = useState(true);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (isLoginMode) {
      // 登入
      const storedUser = JSON.parse(localStorage.getItem('temp_user_db'));

      if (storedUser && storedUser.email === formData.email && storedUser.password === formData.password) {
        
        // 登入成功
        const userData = {
          id: storedUser.id,
          name: storedUser.name,
          email: storedUser.email,
          token: "mock-token-12345"
        };
        onLogin(userData); 

      } else {
        
        // 登入失敗
        alert('登入失敗 \n帳號或密碼錯誤，請檢查！\n(若尚未註冊請先註冊)');
      }

    } else {
      // 註冊
      console.log("註冊資料送出:", formData);

      const newUser = {
        id: Date.now(),
        name: formData.name,
        email: formData.email,
        password: formData.password 
      };
      localStorage.setItem('temp_user_db', JSON.stringify(newUser));

      alert(`註冊成功！HiHi ${formData.name}，請使用剛註冊的帳號登入。`);
      
      setIsLoginMode(true);
      setFormData(prev => ({ ...prev, password: '' }));
    }
  };

  return (
    <div className="Login-container">
      <div className="Login-card">
        <h2 style={{textAlign: 'center', marginBottom: '20px', fontSize: '1.7rem'}}>
          {isLoginMode ? '旅遊行程規劃網站' : '加入我們，開始你的旅程！'}
        </h2>
        
        <form onSubmit={handleSubmit}>
          {!isLoginMode && (
            <div className="form-group">
              <label>暱稱</label>
              <input 
                type="text" 
                required 
                placeholder="ex.小明"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
          )}

          <div className="form-group">
            <label>Email</label>
            <input 
              type="email" 
              required 
              placeholder="name@gmail.com"
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
            />
          </div>

          <div className="form-group">
            <label>密碼</label>
            <input 
              type="password" 
              required 
              placeholder="••••••••"
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
            />
          </div>

          <button type="submit" className="btn-primary" style={{width: '100%', marginTop: '10px'}}>
            {isLoginMode ? '登入' : '註冊'}
          </button>
        </form>

        <div style={{textAlign: 'center', marginTop: '20px', fontSize: '0.9rem', color: '#666'}}>
          {isLoginMode ? '還沒有帳號嗎？' : '已經有帳號了？'}
          <span 
            onClick={() => setIsLoginMode(!isLoginMode)}
            style={{color: '#333', fontWeight: 'bold', cursor: 'pointer', marginLeft: '5px', textDecoration: 'underline'}}
          >
            {isLoginMode ? '立即註冊' : '直接登入'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;