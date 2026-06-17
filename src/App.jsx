import React, { useState } from 'react';
import { BookOpen, Edit3, HelpCircle, FileText, RefreshCw, AlertTriangle, Sparkles, Languages, GraduationCap } from 'lucide-react';
import './index.css';

function App() {
  const [formData, setFormData] = useState({
    classLevel: 'Class 10',
    subject: '',
    topic: '',
    language: 'Hindi'
  });
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState(null);

  const classesList = [
    "Nursery", "LKG", "UKG", "Class 1", "Class 2", "Class 3", "Class 4", "Class 5",
    "Class 6", "Class 7", "Class 8", "Class 9", "Class 10", "Class 11", "Class 12"
  ];

  const languagesList = [
    "Hindi", "English", "Assamese", "Hinglish", "Bengali", "Odia", "Punjabi", "Gujarati", "Marathi", "Tamil", "Telugu"
  ];

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const parseMarkdownToHtml = (text) => {
    if (!text) return '';
    let html = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/^\s*[-*]\s+(.*$)/gim, '<li>$1</li>');
    html = html.replace(/\n/g, '<br/>');
    
    return html;
  };

  const generateContent = async (section, isRetry = false) => {
    if (!formData.subject.trim() || !formData.topic.trim()) {
      alert("⚠️ Please enter both Subject and Chapter/Topic Name first!");
      return;
    }
    
    setLoading(true);
    setError(null);
    if (!isRetry) setOutput('');
    setActiveSection(section);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, section })
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Kuch galat hua. Kripya dobara prayas karein.');
      }
      
      setOutput(data.output);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Server standard rate limits hit block. Click Retry.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <header className="hero-section">
        <div className="logo-area">
          <h1><span>APNA</span> MASTER <Sparkles className="sparkle-icon" /></h1>
          <p>AI-Powered High-Quality Study Material Generator</p>
          <div className="badge-container">
            <span className="badge">Nursery to Class 12</span>
            <span className="badge">All Board Formats</span>
            <span className="badge">Multi-Lingual Support</span>
          </div>
        </div>
      </header>

      <main className="main-content">
        <div className="control-panel">
          <div className="input-grid">
            <div className="input-field-wrapper">
              <label><GraduationCap size={16} /> Select Class</label>
              <select name="classLevel" value={formData.classLevel} onChange={handleInputChange}>
                {classesList.map((cls) => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
            </div>

            <div className="input-field-wrapper">
              <label>Subject Name</label>
              <input 
                name="subject" 
                type="text" 
                placeholder="e.g., Science, Social Science" 
                value={formData.subject}
                onChange={handleInputChange} 
              />
            </div>

            <div className="input-field-wrapper">
              <label>Chapter / Topic Name</label>
              <input 
                name="topic" 
                type="text" 
                placeholder="e.g., Light Reflection, Mughal Empire" 
                value={formData.topic}
                onChange={handleInputChange} 
              />
            </div>

            <div className="input-field-wrapper">
              <label><Languages size={16} /> Material Language</label>
              <select name="language" value={formData.language} onChange={handleInputChange}>
                {languagesList.map((lang) => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="button-group-heading">Click on any section to generate deep content:</div>
          <div className="button-group">
            <button className={activeSection === 'Explanation' ? 'btn-active' : ''} onClick={() => generateContent('Explanation')} disabled={loading}>
              <BookOpen size={18}/> Story-style Explanation
            </button>
            <button className={activeSection === 'Notes' ? 'btn-active' : ''} onClick={() => generateContent('Notes')} disabled={loading}>
              <Edit3 size={18}/> Exam Bullet Notes
            </button>
            <button className={activeSection === 'Textbook Q&A' ? 'btn-active' : ''} onClick={() => generateContent('Textbook Q&A')} disabled={loading}>
              <FileText size={18}/> NCERT / Board Q&A
            </button>
            <button className={activeSection === 'Additional Q&A' ? 'btn-active' : ''} onClick={() => generateContent('Additional Q&A')} disabled={loading}>
              <HelpCircle size={18}/> HOTS & Extra PYQs
            </button>
          </div>
        </div>

        <div className="notebook">
          <div className="notebook-spine"></div>
          <div className="notebook-header">
            <div className="sticker-label">
              <strong>SUBJECT:</strong> <span>{formData.subject.toUpperCase() || '__________________'}</span>
            </div>
            <div className="sticker-label">
              <strong>CLASS:</strong> <span>{formData.classLevel.toUpperCase()}</span>
            </div>
            <div className="sticker-label date-sticker">
              <strong>LANG:</strong> <span>{formData.language.toUpperCase()}</span>
            </div>
          </div>
          
          <div className="notebook-page">
            <div className="margin-line"></div>
            <div className="horizontal-top-line"></div>
            
            <div className="page-content">
              {loading && (
                <div className="loader-box">
                  <RefreshCw className="spin-loader" size={28} />
                  <h3>Generating {activeSection}...</h3>
                  <p>Hum behtareen comprehensive study material taiyar kar rahe hain. Isme thoda samay lag sakta hai. Kripya pratiksha karein!</p>
                </div>
              )}
              
              {error && !loading && (
                <div className="error-card">
                  <AlertTriangle size={32} color="#ff4d4d" />
                  <h4>Oops! Server thoda vyast hai</h4>
                  <p>{error}</p>
                  <div className="error-actions">
                    <button className="action-btn retry-btn" onClick={() => generateContent(activeSection, true)}>
                      <RefreshCw size={14} /> Retry Generation
                    </button>
                  </div>
                </div>
              )}

              {!loading && !error && output && (
                <div className="output-container">
                  <div className="notebook-title-tag">
                    ✨ {activeSection.toUpperCase()} : {formData.topic || 'Selected Topic'}
                  </div>
                  <div className="generated-markdown-content" dangerouslySetInnerHTML={{ __html: parseMarkdownToHtml(output) }} />
                  <div className="notebook-footer-refresh-hint">
                    Galti ya adhoora content dikhne par aap dobara generate kar sakte hain:
                    <button className="action-btn refresh-btn" onClick={() => generateContent(activeSection, true)}>
                      <RefreshCw size={14} /> Regenerate This Section
                    </button>
                  </div>
                </div>
              )}
              
              {!loading && !error && !output && (
                <div className="notebook-placeholder">
                  <p>✍️ Notebook Khali Hai...</p>
                  <span>Apna Subject aur Chapter upar box me bharein, fir padhne ke liye kisi bhi ek button par click karein! Master ji turant aapke liye detailed chapters likh denge.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <footer>
        <p>Developed by <strong>Anurag Gogoi</strong> · Made with ❤️ in Assam</p>
        <p className="sub-foot">Powered by OpenRouter AI Fallbacks · Responsive School Notebook Architecture © 2026</p>
      </footer>
    </div>
  );
}

export default App;
            
