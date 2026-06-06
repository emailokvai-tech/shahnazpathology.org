import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import type { Session } from '@supabase/supabase-js';

export default function PatientPortal() {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);

      if (session) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
          
        if (!error && data) {
          setProfile(data);
        }
      }
      setLoading(false);
    };

    loadProfile();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/patient-login');
  };

  if (loading) return <div className="loading-screen">Loading Portal...</div>;

  return (
    <div className="portal-container">
      <header className="portal-header">
        <div className="portal-brand">
          <span className="logo-icon">🔬</span>
          <h2>Patient Portal</h2>
        </div>
        <div className="portal-user-actions">
          <span className="welcome-text">
            Welcome, {profile?.first_name || session?.user?.email}
          </span>
          <button onClick={handleSignOut} className="secondary-btn">Sign Out</button>
        </div>
      </header>

      <main className="portal-dashboard">
        <div className="dashboard-grid">
          
          <div className="dashboard-card">
            <h3>My Test Results</h3>
            <div className="empty-state">
              <p>No recent test results found.</p>
              <button className="primary-btn">Request Old Records</button>
            </div>
          </div>

          <div className="dashboard-card">
            <h3>Upcoming Appointments</h3>
            <div className="empty-state">
              <p>You have no scheduled appointments.</p>
              <button className="primary-btn">Book Appointment</button>
            </div>
          </div>

          <div className="dashboard-card full-width">
            <h3>Profile & Demographics</h3>
            <div className="profile-details">
              <p><strong>Email:</strong> {session?.user?.email}</p>
              <p><strong>Role:</strong> {profile?.role || 'patient'}</p>
              <p><em>Additional clinical profile data will appear here.</em></p>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
