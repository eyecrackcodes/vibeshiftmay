/**
 * Environment Variables Template
 * 
 * Copy this content to create your .env file in the root directory:
 * 
 * # Supabase credentials
 * VITE_SUPABASE_URL=https://kasmotdooovubdralpxo.supabase.co
 * VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imthc21vdGRvb292dWJkcmFscHhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYxOTI4MDAsImV4cCI6MjA2MTc2ODgwMH0.R8gL3b47nCzks9tEBlw87-paghVMuxe-D-LJqc7s19I
 * VITE_SUPABASE_SERVICE_ROLE=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imthc21vdGRvb292dWJkcmFscHhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjE5MjgwMCwiZXhwIjoyMDYxNzY4ODAwfQ.dQMwjLN5KhqonerEPbpP5VsetwHcZzrzY3uUTLROIlw
 * 
 * # Temporary auth mode flag
 * VITE_AUTH_MODE=simple
 * 
 * # Later when integrating Clerk, add:
 * # VITE_CLERK_PUBLISHABLE_KEY=your_clerk_key
 */

// Default environment values for development (in case .env is not set up)
export const ENV = {
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || 'https://kasmotdooovubdralpxo.supabase.co',
  SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imthc21vdGRvb292dWJkcmFscHhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYxOTI4MDAsImV4cCI6MjA2MTc2ODgwMH0.R8gL3b47nCzks9tEBlw87-paghVMuxe-D-LJqc7s19I',
  SUPABASE_SERVICE_ROLE: import.meta.env.VITE_SUPABASE_SERVICE_ROLE || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imthc21vdGRvb292dWJkcmFscHhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjE5MjgwMCwiZXhwIjoyMDYxNzY4ODAwfQ.dQMwjLN5KhqonerEPbpP5VsetwHcZzrzY3uUTLROIlw',
  AUTH_MODE: import.meta.env.VITE_AUTH_MODE || 'simple',
}; 