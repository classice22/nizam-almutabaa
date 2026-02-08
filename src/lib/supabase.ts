import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vwcmflkdcsblcffjnagr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3Y21mbGtkY3NibGNmZmpuYWdyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwOTE5OTIsImV4cCI6MjA4NTY2Nzk5Mn0.RzOMAjbPi2AigfrM2dnVRm1wDBb8VFR-9cU3He2jUS4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
