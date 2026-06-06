import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import type { Session } from '@supabase/supabase-js';

export default function PatientPortal() {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [patientId, setPatientId] = useState<string | null>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Booking Form State
  const [showBooking, setShowBooking] = useState(false);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingNotes, setBookingNotes] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);

      if (session) {
        // 1. Fetch Profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
          
        if (profileData) setProfile(profileData);

        // 2. Fetch or Create Patient Record
        let { data: patientData } = await supabase
          .from('patients')
          .select('id')
          .eq('profile_id', session.user.id)
          .single();

        if (!patientData) {
           const { data: newPatient } = await supabase
             .from('patients')
             .insert([{ profile_id: session.user.id }])
             .select()
             .single();
           patientData = newPatient;
        }

        if (patientData) {
          setPatientId(patientData.id);
          // 3. Fetch Appointments
          const { data: apptData } = await supabase
            .from('appointments')
            .select('*')
            .eq('patient_id', patientData.id)
            .order('appointment_date', { ascending: true });
          
          if (apptData) setAppointments(apptData);
        }
      }
      setLoading(false);
    };

    loadData();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/patient-login');
  };

  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId || !bookingDate) return;
    
    setBookingLoading(true);
    const { data, error } = await supabase
      .from('appointments')
      .insert([
        { 
          patient_id: patientId, 
          appointment_date: new Date(bookingDate).toISOString(),
          notes: bookingNotes,
          status: 'scheduled'
        }
      ])
      .select()
      .single();

    if (!error && data) {
      setAppointments([...appointments, data].sort((a, b) => new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime()));
      setShowBooking(false);
      setBookingDate('');
      setBookingNotes('');
    } else {
      alert("Failed to book appointment. Please check database permissions.");
    }
    setBookingLoading(false);
  };

  if (loading) return <div className="auth-wrapper"><div className="loading-screen" style={{ color: 'white' }}>Loading Portal...</div></div>;

  return (
    <div style={{ background: 'hsl(var(--background))', minHeight: '100vh', paddingBottom: '4rem' }}>
      <header className="header-glass">
        <div className="logo-brand">
          <span style={{ fontSize: '1.8rem' }}>🔬</span>
          Patient Portal
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontWeight: '500' }}>
            {profile?.first_name || session?.user?.email}
          </span>
          <button onClick={handleSignOut} className="btn btn-secondary">Sign Out</button>
        </div>
      </header>

      <main className="dashboard-grid">
        
        <div className="dashboard-card full-width" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3>Book a New Test</h3>
            <p style={{ color: 'hsl(var(--text-secondary))' }}>Schedule your next laboratory visit.</p>
          </div>
          <button onClick={() => setShowBooking(!showBooking)} className="btn btn-primary">
            {showBooking ? 'Cancel Booking' : '+ Book Appointment'}
          </button>
        </div>

        {showBooking && (
          <div className="dashboard-card full-width">
            <h3 style={{ borderBottom: 'none' }}>Appointment Details</h3>
            <form onSubmit={handleBookAppointment} style={{ display: 'grid', gap: '1rem', maxWidth: '500px' }}>
              <div className="form-group">
                <label>Date and Time</label>
                <input 
                  type="datetime-local" 
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Test Type / Notes</label>
                <input 
                  type="text" 
                  placeholder="e.g. Complete Blood Count (CBC)"
                  value={bookingNotes}
                  onChange={(e) => setBookingNotes(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary" disabled={bookingLoading}>
                {bookingLoading ? 'Confirming...' : 'Confirm Booking'}
              </button>
            </form>
          </div>
        )}

        <div className="dashboard-card">
          <h3>Upcoming Appointments</h3>
          {appointments.filter(a => a.status === 'scheduled').length === 0 ? (
            <p style={{ color: 'hsl(var(--text-secondary))' }}>No upcoming appointments.</p>
          ) : (
            appointments.filter(a => a.status === 'scheduled').map(appt => (
              <div key={appt.id} className="appointment-item">
                <div className="appointment-info">
                  <h4>{new Date(appt.appointment_date).toLocaleString()}</h4>
                  <p>{appt.notes || 'General Checkup'}</p>
                </div>
                <span className="badge badge-scheduled">Scheduled</span>
              </div>
            ))
          )}
        </div>

        <div className="dashboard-card">
          <h3>Past Appointments & Results</h3>
          {appointments.filter(a => a.status === 'completed').length === 0 ? (
            <p style={{ color: 'hsl(var(--text-secondary))' }}>No past records found.</p>
          ) : (
            appointments.filter(a => a.status === 'completed').map(appt => (
              <div key={appt.id} className="appointment-item">
                <div className="appointment-info">
                  <h4>{new Date(appt.appointment_date).toLocaleDateString()}</h4>
                  <p>{appt.notes}</p>
                </div>
                <span className="badge badge-completed">Completed</span>
              </div>
            ))
          )}
        </div>

      </main>
    </div>
  );
}
