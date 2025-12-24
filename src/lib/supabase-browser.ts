import { createClient } from '@supabase/supabase-js'

// Client for browser/client components - used for real-time subscriptions
export function createBrowserClient() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
}
