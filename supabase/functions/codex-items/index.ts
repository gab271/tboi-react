
import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const url = new URL(req.url)
    const path = url.pathname.replace(/\/$/, '') // remove trailing slash
    // path might be /codex-items, /codex-items/search, /codex-items/:slug

    // Helper to get query params
    const getParam = (name: string) => url.searchParams.get(name)
    const getIntParam = (name: string, def: number) => {
        const val = url.searchParams.get(name)
        return val ? parseInt(val) : def
    }

    // 1. Search Endpoint
    // GET /codex-items/search?q=...
    if (path.endsWith('/search')) {
        const q = getParam('q') || ''
        const type = getParam('type')
        const tags = getParam('tags') ? getParam('tags')?.split(',') : null
        
        const { data, error } = await supabaseClient.rpc('search_items', {
            search_query: q,
            filter_type: type,
            page_int: getIntParam('page', 1),
            page_size_int: getIntParam('pageSize', 24)
        })

        if (error) throw error
        
        return new Response(JSON.stringify({ data }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })
    }

    // 2. Random Endpoint
    // GET /codex-items/random?n=3
    if (path.endsWith('/random')) {
        const n = getIntParam('n', 3)
        const { data, error } = await supabaseClient.rpc('get_random_items', { limit_cnt: n })
        
        if (error) throw error

        return new Response(JSON.stringify({ data }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })
    }

    // 3. Get Single Item by Slug (last part of path)
    const slugMatch = path.split('/').pop()
    if (slugMatch && slugMatch !== 'codex-items') {
        // Assume it's a slug if it's not one of the reserved words
        const { data, error } = await supabaseClient.rpc('get_item_by_slug', { slug_param: slugMatch })
        
        if (error) throw error
        
        if (!data || data.length === 0) {
             return new Response(JSON.stringify({ error: 'Not Found' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 404,
            })
        }

        return new Response(JSON.stringify({ data: data[0] }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })
    }
    
    // 4. Default List (Get all/filtered)
    // GET /codex-items
     const page = getIntParam('page', 1)
     const pageSize = getIntParam('pageSize', 24)
     const type = getParam('type')

     let query = supabaseClient
        .from('codex_items')
        .select('*', { count: 'exact' })
        .eq('is_published', true)
        .range((page - 1) * pageSize, page * pageSize - 1)
    
    if (type) {
        query = query.eq('item_type', type)
    }

    const { data, error, count } = await query

    if (error) throw error

    return new Response(JSON.stringify({ 
        data, 
        meta: { 
            page, 
            pageSize, 
            total: count 
        } 
    }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
    })

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
