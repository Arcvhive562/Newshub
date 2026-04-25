import React, { useState, useEffect } from 'react';
import './App.css';

export default function App() {
  const [interests, setInterests] = useState(() => {
    const saved = localStorage.getItem('interests');
    return saved ? JSON.parse(saved) : [];
  });
  const [newInterest, setNewInterest] = useState('');
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('feed');
  const [digest, setDigest] = useState(null);
  const [digestTime, setDigestTime] = useState(() => {
    return localStorage.getItem('digestTime') || '21:00';
  });

  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  // Save interests to localStorage
  useEffect(() => {
    localStorage.setItem('interests', JSON.stringify(interests));
  }, [interests]);

  // Save digest time to localStorage
  useEffect(() => {
    localStorage.setItem('digestTime', digestTime);
  }, [digestTime]);

  // Fetch news when interests change
  useEffect(() => {
    if (interests.length > 0) {
      fetchNews();
      const interval = setInterval(fetchNews, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [interests]);

  // Check for digest time
  useEffect(() => {
    const checkDigest = setInterval(() => {
      const now = new Date();
      const [hours, mins] = digestTime.split(':');
      if (now.getHours() === parseInt(hours) && now.getMinutes() === parseInt(mins)) {
        fetchDigest();
      }
    }, 60000);
    return () => clearInterval(checkDigest);
  }, [digestTime]);

  const fetchNews = async () => {
    if (interests.length === 0) return;
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/news`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ interests })
      });
      const data = await response.json();
      setNews(data.articles || []);
    } catch (error) {
      console.error('Error:', error);
    }
    setLoading(false);
  };

  const fetchDigest = async () => {
    if (interests.length === 0) return;
    try {
      const response = await fetch(`${API_BASE}/api/digest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ interests })
      });
      const data = await response.json();
      setDigest(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const addInterest = () => {
    if (newInterest.trim() && !interests.includes(newInterest)) {
      setInterests([...interests, newInterest]);
      setNewInterest('');
    }
  };

  const removeInterest = (interest) => {
    setInterests(interests.filter(i => i !== interest));
  };

  return (
    <div className="app">
      <header className="header">
        <h1>📰 NewsHub</h1>
        <p>Real-time news from your interests</p>
      </header>

      <div className="tabs">
        <button className={`tab ${activeTab === 'feed' ? 'active' : ''}`} onClick={() => setActiveTab('feed')}> 
          Feed
        </button>
        <button className={`tab ${activeTab === 'interests' ? 'active' : ''}`} onClick={() => setActiveTab('interests')}> 
          Interests
        </button>
        <button className={`tab ${activeTab === 'digest' ? 'active' : ''}`} onClick={() => setActiveTab('digest')}> 
          Digest
        </button>
      </div>

      <div className="container">
        {activeTab === 'feed' && (
          <section>
            <h2>Real-Time News</h2>
            <button onClick={fetchNews} className="refresh-btn">🔄 Refresh</button>
            {loading && <p className="loading">Loading...</p>}
            {news.length === 0 && !loading && <p>Add interests to see news</p>}
            <div className="news-grid">
              {news.map((article, i) => (
                <a key={i} href={article.url} target="_blank" rel="noopener noreferrer" className="news-card">
                  {article.image && <img src={article.image} alt="" />}
                  <div className="content">
                    <h3>{article.title}</h3>
                    <p>{article.description}</p>
                    <span className="time">{new Date(article.publishedAt).toLocaleString('en-IN')}</span>
                  </div>
                </a>
              ))}
            </div>
          </section>
        )}

        {activeTab === 'interests' && (
          <section>
            <h2>Manage Interests</h2>
            <div className="input-group">
              <input
                type="text"
                value={newInterest}
                onChange={(e) => setNewInterest(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addInterest()}
                placeholder="Add interest (Technology, Sports, Science...)"
              />
              <button onClick={addInterest}>Add</button>
            </div>
            <div className="interests">
              {interests.map(i => (
                <div key={i} className="tag">
                  {i}
                  <button onClick={() => removeInterest(i)}>×</button>
                </div>
              ))}
            </div>
            <div className="time-setting">
              <label>Daily Digest Time (IST):</label>
              <input
                type="time"
                value={digestTime}
                onChange={(e) => setDigestTime(e.target.value)}
              />
            </div>
          </section>
        )}

        {activeTab === 'digest' && (
          <section>
            <h2>Daily Digest</h2>
            <button onClick={fetchDigest} className="refresh-btn">📋 Generate Now</button>
            {digest && (
              <div className="digest">
                <h3>{digest.date}</h3>
                <p>{digest.summary}</p>
                <div className="digest-items">
                  {digest.articles?.map((a, i) => (
                    <div key={i} className="digest-item">
                      <h4>{a.title}</h4>
                      <p>{a.summary}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}