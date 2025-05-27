import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tiybfgrqtodfytwguepb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRpeWJmZ3JxdG9kZnl0d2d1ZXBiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5OTgyNzQsImV4cCI6MjA2MjU3NDI3NH0._8V6y1dCuS29dxSg34fzNcVcowLwpE7ZBNKntjyMkAI';
export const supabase = createClient(supabaseUrl, supabaseKey);
