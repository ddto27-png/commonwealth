import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
// Only a publishable key belongs in the browser. RLS protects private data.
export const supabase = url && key ? createClient(url, key) : null;
