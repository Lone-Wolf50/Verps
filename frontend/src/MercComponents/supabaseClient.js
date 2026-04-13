import { createClient } from "@supabase/supabase-js";
import { getSupabaseStorage } from "../utils/sessionManager";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
if (!supabaseUrl || !supabaseAnonKey) {
	throw new Error("Missing Supabase environment variables!");
}

/* ── Use appropriate storage based on PWA vs Web ── */
const storage = getSupabaseStorage();

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
	auth: {
		storage: storage,
		autoRefreshToken: true,
		persistSession: true,
	},
});
