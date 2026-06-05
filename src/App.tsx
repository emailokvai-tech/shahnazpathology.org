
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { blueprintMarkdown } from './blueprint';
import './App.css';

function App() {
  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-content">
          <div className="logo-section">
            <div className="logo-icon">🔬</div>
            <h1>Shahnaz Pathology</h1>
          </div>
          <nav>
            <a href="#blueprint" className="active">Architecture Blueprint</a>
            <a href="#about">About</a>
            <a href="#contact">Contact</a>
          </nav>
        </div>
      </header>
      
      <main className="main-content">
        <div className="hero-section">
          <h2>Enterprise Architecture</h2>
          <p>A modern, secure, and compliant digital pathology platform designed for scale.</p>
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
      </main>
      
      <footer className="app-footer">
        <p>&copy; {new Date().getFullYear()} Shahnaz Pathology. Proprietary & Confidential.</p>
      </footer>
    </div>
  );
}

export default App;
