import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { db, auth } from '../firebase';

function AdminDashboard() {
  const [logo, setLogo] = useState('🔬');
  const [heroText, setHeroText] = useState('Enterprise Architecture');
  const [heroSubtext, setHeroSubtext] = useState('A modern, secure, and compliant digital pathology platform designed for scale.');
  const [contactEmail, setContactEmail] = useState('contact@shahnazpathology.org');
  const [contactPhone, setContactPhone] = useState('+880 1716-235481');
  const [loading, setLoading] = useState(true);
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const docRef = doc(db, 'content', 'homepage');
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.logo) setLogo(data.logo);
          if (data.heroText) setHeroText(data.heroText);
          if (data.heroSubtext) setHeroSubtext(data.heroSubtext);
          if (data.contactEmail) setContactEmail(data.contactEmail);
          if (data.contactPhone) setContactPhone(data.contactPhone);
        }
      } catch (error) {
        console.error("Error fetching content:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchContent();
  }, []);

  const handleSave = async () => {
    try {
      await setDoc(doc(db, 'content', 'homepage'), {
        logo,
        heroText,
        heroSubtext,
        contactEmail,
        contactPhone
      });
      alert('Changes saved successfully to Firestore!');
    } catch (error) {
      console.error("Error saving content:", error);
      alert('Error saving changes. Ensure Firestore is set up and rules allow writing.');
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/admin');
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (loading) return <div>Loading dashboard...</div>;

  return (
    <div className="admin-dashboard-container">
      <header className="dashboard-header">
        <h2>Admin Dashboard</h2>
        <div>
          <button onClick={() => navigate('/')} className="secondary-btn" style={{ marginRight: '1rem' }}>View Site</button>
          <button onClick={handleLogout} className="primary-btn">Logout</button>
        </div>
      </header>

      <main className="dashboard-content">
        <section className="dashboard-section">
          <h3>Website Branding</h3>
          <div className="form-group">
            <label>Logo (Emoji or text)</label>
            <input type="text" value={logo} onChange={e => setLogo(e.target.value)} />
          </div>
        </section>

        <section className="dashboard-section">
          <h3>Hero Section</h3>
          <div className="form-group">
            <label>Hero Title</label>
            <input type="text" value={heroText} onChange={e => setHeroText(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Hero Subtext</label>
            <textarea value={heroSubtext} onChange={e => setHeroSubtext(e.target.value)} rows={3} />
          </div>
        </section>

        <section className="dashboard-section">
          <h3>Contact Details</h3>
          <div className="form-group">
            <label>Email Address</label>
            <input type="email" value={contactEmail} onChange={e => setContactEmail(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Phone Number</label>
            <input type="tel" value={contactPhone} onChange={e => setContactPhone(e.target.value)} />
          </div>
        </section>

        <button onClick={handleSave} className="primary-btn save-btn">Save Changes</button>
      </main>
    </div>
  );
}

export default AdminDashboard;
