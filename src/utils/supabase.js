// src/utils/supabase.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xbcburyoyzpqstvhgkww.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhiY2J1cnlveXpwcXN0dmhna3d3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg1MTQxODIsImV4cCI6MjA3NDA5MDE4Mn0.uLBNQNDsHOAlgpEoF3w7VMXoxX0Rtu--zKjFpEFgfyQ';

export const supabase = createClient(supabaseUrl, supabaseKey);