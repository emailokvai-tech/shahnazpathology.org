import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import type { Session } from '@supabase/supabase-js';

export default function ClinicalDashboard() {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);

      if (session) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
          
        if (profileData) {
          setProfile(profileData);
          if (profileData.role === 'patient') {
            navigate('/patient-portal'); // Kick out patients trying to access admin
            return;
          }
        }

        // Fetch all appointments across the entire clinic
        const { data: apptData } = await supabase
          .from('appointments')
          .select('*, patients(profile_id)')
          .order('appointment_date', { ascending: true });
        
        if (apptData) setAppointments(apptData);
      }
      setLoading(false);
    };

    loadData();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/patient-login');
  };

  const markCompleted = async (id: string) => {
    const { error } = await supabase
      .from('appointments')
      .update({ status: 'completed' })
      .eq('id', id);
      
    if (!error) {
      setAppointments(appointments.map(a => a.id === id ? { ...a, status: 'completed' } : a));
    }
  };

  if (loading) return <div className="auth-wrapper"><div className="loading-screen" style={{ color: 'white' }}>Loading Clinic...</div></div>;

  return (
    <div style={{ background: 'hsl(var(--background))', minHeight: '100vh', paddingBottom: '4rem' }}>
      <header className="header-glass">
        <div className="logo-brand">
          <span style={{ fontSize: '1.8rem' }}>🩺</span>
          Clinical Dashboard
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span className="badge badge-completed">Role: {profile?.role}</span>
          <span style={{ fontWeight: '500' }}>
            Dr. {profile?.last_name || session?.user?.email}
          </span>
          <button onClick={handleSignOut} className="btn btn-secondary">Sign Out</button>
        </div>
      </header>

      <main className="dashboard-grid">
        
        <div className="dashboard-card full-width">
          <h3>Today's Schedule & Active Tests</h3>
          {appointments.filter(a => a.status === 'scheduled').length === 0 ? (
            <p style={{ color: 'hsl(var(--text-secondary))' }}>No active appointments.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--glass-border)' }}>
                    <th style={{ padding: '1rem' }}>Time</th>
                    <th style={{ padding: '1rem' }}>Patient ID Ref</th>
                    <th style={{ padding: '1rem' }}>Test Required</th>
                    <th style={{ padding: '1rem' }}>Status</th>
                    <th style={{ padding: '1rem' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.filter(a => a.status === 'scheduled').map(appt => (
                    <tr key={appt.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                      <td style={{ padding: '1rem' }}>{new Date(appt.appointment_date).toLocaleString()}</td>
                      <td style={{ padding: '1rem', fontSize: '0.8rem', color: 'gray' }}>{appt.patient_id.substring(0,8)}...</td>
                      <td style={{ padding: '1rem', fontWeight: '500' }}>{appt.notes}</td>
                      <td style={{ padding: '1rem' }}><span className="badge badge-scheduled">Scheduled</span></td>
                      <td style={{ padding: '1rem' }}>
                        <button onClick={() => markCompleted(appt.id)} className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                          Mark Done
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="dashboard-card full-width">
          <h3>Completed Test Archive</h3>
          {appointments.filter(a => a.status === 'completed').length === 0 ? (
            <p style={{ color: 'hsl(var(--text-secondary))' }}>No archived records.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--glass-border)' }}>
                    <th style={{ padding: '1rem' }}>Date Completed</th>
                    <th style={{ padding: '1rem' }}>Patient ID Ref</th>
                    <th style={{ padding: '1rem' }}>Test Type</th>
                    <th style={{ padding: '1rem' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.filter(a => a.status === 'completed').map(appt => (
                    <tr key={appt.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                      <td style={{ padding: '1rem' }}>{new Date(appt.appointment_date).toLocaleDateString()}</td>
                      <td style={{ padding: '1rem', fontSize: '0.8rem', color: 'gray' }}>{appt.patient_id.substring(0,8)}...</td>
                      <td style={{ padding: '1rem' }}>{appt.notes}</td>
                      <td style={{ padding: '1rem' }}><span className="badge badge-completed">Completed</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
