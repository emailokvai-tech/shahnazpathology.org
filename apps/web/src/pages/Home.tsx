import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { blueprintMarkdown } from '../blueprint';

function Home() {
  const [content, setContent] = useState({
    logo: '🔬',
    heroText: 'Enterprise Architecture',
    heroSubtext: 'A modern, secure, and compliant digital pathology platform designed for scale.',
    contactEmail: 'contact@shahnazpathology.org',
    contactPhone: '+880 1716-235481'
  });

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const docRef = doc(db, 'content', 'homepage');
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setContent(prev => ({...prev, ...docSnap.data()}));
        }
      } catch (error) {
        console.error("Error fetching content:", error);
      }
    };
    
    fetchContent();
  }, []);

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-content">
          <div className="logo-section">
            <div className="logo-icon">{content.logo}</div>
            <h1>Shahnaz Pathology</h1>
          </div>
          <nav>
            <a href="#blueprint" className="active">Architecture Blueprint</a>
            <a href="#about">About</a>
            <a href="#contact">Contact</a>
            <Link to="/admin" className="admin-link">Admin</Link>
          </nav>
        </div>
      </header>
      
      <main className="main-content">
        <div className="hero-section">
          <h2>{content.heroText}</h2>
          <p>{content.heroSubtext}</p>
          <div className="hero-actions">
            <button className="primary-btn">View Documentation</button>
            <button className="secondary-btn">System Status</button>
          </div>
        </div>

        <section className="markdown-section" id="blueprint">
          <div className="markdown-container">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {blueprintMarkdown}
            </ReactMarkdown>
          </div>
        </section>

        <section className="markdown-section" id="about">
          <div className="markdown-container">
            <h2>About</h2>
            <p>Shahnaz Pathology is a state-of-the-art diagnostic center focused on delivering high-precision pathology using digital workflows and AI-driven insights.</p>
          </div>
        </section>

        <section className="markdown-section" id="contact">
          <div className="markdown-container">
            <h2>Contact</h2>
            <p>Email: {content.contactEmail}</p>
            <p>Phone: <a href={`tel:${content.contactPhone}`} className="contact-link">{content.contactPhone}</a></p>
          </div>
        </section>
      </main>
      
      <footer className="app-footer">
        <p>&copy; {new Date().getFullYear()} Shahnaz Pathology. Proprietary & Confidential.</p>
      </footer>
    </div>
  );
}

export default Home;
