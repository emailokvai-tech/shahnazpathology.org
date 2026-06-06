-- Add these policies to allow patients to insert their own records
CREATE POLICY "Patients can insert own patient record" 
  ON public.patients FOR INSERT 
  WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Patients can insert own appointments" 
  ON public.appointments FOR INSERT 
  WITH CHECK (
    patient_id IN (
      SELECT id FROM public.patients WHERE profile_id = auth.uid()
    )
  );
