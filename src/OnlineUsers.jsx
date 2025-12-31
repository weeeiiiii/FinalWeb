import React, { useState, useEffect } from 'react';

// 你的後端網址
const API_HOST = "https://01da5078501d.ngrok-free.app";

const OnlineUsers = ({ userId }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let isMounted = true; // 防止元件卸載後更新狀態的警告

    // 定義查詢函式
    const fetchTodayCount = async () => {
      try {
        const response = await fetch(`${API_HOST}/api/stats/today-online`, {
          method: 'GET',
          headers: { 
            'Content-Type': 'application/json',
            "ngrok-skip-browser-warning": "true"
          }
        });
        const resData = await response.json();
        if (isMounted && resData.code === "200") {
          setCount(resData.today_count);
        }
      } catch (error) {
        console.error("無法取得人數", error);
      }
    };

    // 定義登記函式
    const checkInAndFetch = async () => {
      if (userId) {
        try {
          // 1. 先等待登記完成 (await)
          await fetch(`${API_HOST}/api/users/check-in`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              "ngrok-skip-browser-warning": "true"
            },
            body: JSON.stringify({ user_id: userId })
          });
          // console.log("登記成功，準備更新人數...");
        } catch (error) {
          console.error("登記失敗", error);
        }
      }
      
      // 2. 登記完成後（或是沒登入），才去抓最新人數
      // 這樣保證抓到的數字一定包含剛剛登入的自己
      fetchTodayCount();
    };

    // --- 執行邏輯 ---
    
    // 1. 畫面載入或 userId 改變時，執行「先登記、再查詢」
    checkInAndFetch();

    // 2. 設定輪詢：之後每 30 秒單純更新數字即可 (不需要重複登記)
    const intervalId = setInterval(fetchTodayCount, 30000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [userId]); // 只要 userId 變動就會重新觸發整個流程

  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      padding: '5px 12px',
      backgroundColor: '#e6fffa', 
      borderRadius: '20px',
      border: '1px solid #b2f5ea',
      fontSize: '0.85rem',
      color: '#2c7a7b',
      fontWeight: '500'
    }}>
      <span style={{
        width: '8px',
        height: '8px',
        backgroundColor: '#38b2ac',
        borderRadius: '50%',
        boxShadow: '0 0 0 0 rgba(56, 178, 172, 0.7)',
        animation: 'pulse-green 2s infinite'
      }}></span>
      
      <span>今日上線人數: {count}</span>

      <style>{`
        @keyframes pulse-green {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(56, 178, 172, 0.7); }
          70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(56, 178, 172, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(56, 178, 172, 0); }
        }
      `}</style>
    </div>
  );
};

export default OnlineUsers;