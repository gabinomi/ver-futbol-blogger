const fetchConTimeout: typeof fetch = (input, init) =>
  fetch(input, { ...init, signal: AbortSignal.timeout(8000) })

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: { fetch: fetchConTimeout },
})
export const supabaseAdmin = () =>
  createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    global: { fetch: fetchConTimeout },
  })
