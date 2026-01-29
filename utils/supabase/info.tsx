// Supabase Configuration
// Using environment variables with fallback to production values

export const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID || "bozyjacxywvxxhvywttw"
export const publicAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvenlqYWN4eXd2eHhodnl3dHR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgyNTM1MTQsImV4cCI6MjA2MzgyOTUxNH0.tT1D8WkBIhGhB7R-k8mkY4Y5pu4NeaCX5pLF4qG3GgE"