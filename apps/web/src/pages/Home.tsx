import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

function Home() {
  const [markdown, setMarkdown] = useState('');
  const [content, setContent] = useState({
    heroTitle: "Digital Pathology Built for Tomorrow",
    contactInfo: ""
  });

  useEffect(() => {
    fetch('/shahnaz_pathology_blueprint.md')
      .then((response) => response.text())
      .then((text) => setMarkdown(text));

    const fetchContent = async () => {
      try {
        const docRef = doc(db, 'content', 'home');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.heroTitle) setContent(prev => ({ ...prev, heroTitle: data.heroTitle }));
          if (data.contactInfo) setContent(prev => ({ ...prev, contactInfo: data.contactInfo }));
        }
      } catch (error) {
        console.log("Firebase not configured or content not found. Using defaults.");
      }
    };
    fetchContent();
  }, []);

  return (
    <>
      <header className="header-glass">
        <div className="logo-brand">
          <span style={{ fontSize: '1.8rem' }}>🔬</span>
          Shahnaz Pathology
        </div>
        <nav className="nav-links">
          <a href="#blueprint">Blueprint</a>
          <a href="#about">About</a>
          {content.contactInfo && (
            <a href={`tel:${content.contactInfo}`} style={{ fontWeight: 'bold' }}>
              📞 {content.contactInfo}
            </a>
          )}
          <Link to="/patient-login" className="btn btn-primary">Patient Portal</Link>
          <Link to="/admin" className="btn btn-secondary">Admin</Link>
        </nav>
      </header>

      <section className="hero-section">
        <h1 className="hero-title">{content.heroTitle}</h1>
        <p className="hero-subtitle">
          Secure, compliant, and scalable healthcare infrastructure. 
          Manage lab results and appointments seamlessly.
        </p>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link to="/patient-login" className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
            Access Your Results
          </Link>
          <a href="#blueprint" className="btn btn-secondary" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
            View Architecture
          </a>
        </div>
      </section>

      <section id="blueprint" className="markdown-container glass-panel" style={{ margin: '2rem auto' }}>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
      </section>
      
      <footer style={{ textAlign: 'center', padding: '2rem', color: 'hsl(var(--text-secondary))' }}>
        &copy; {new Date().getFullYear()} Shahnaz Pathology. All rights reserved.
      </footer>
    </>
  );
}

export default Home;
