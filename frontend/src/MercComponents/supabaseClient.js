import { createClient } from "@supabase/supabase-js";
import { getSupabaseStorage } from "../utils/sessionManager";

/* Fetch Supabase configuration from environment variables */
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
if (!supabaseUrl || !supabaseAnonKey) {
	throw new Error("Missing Supabase environment variables!");
}

/* Select storage adapter: PWA uses localStorage (persistent), Web uses sessionStorage (cleared on tab close) */
const storage = getSupabaseStorage();

/* Initialize Supabase client with dynamic storage selection and auto-refresh token handling */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
	auth: {
		storage: storage,
		autoRefreshToken: true,
		persistSession: true,
	},
});
