import { Router } from 'express';
import { supabase, isSupabaseReady } from '../db/supabase.js';
import { DEMO_PROPERTIES } from '../db/seedData.js';

const router = Router();

function applyFilters(data, q) {
  let r = [...data];
  if (q.status)   r = r.filter(p => p.verification_status === q.status);
  if (q.type)     r = r.filter(p => p.property_type === q.type);
  if (q.occupancy) r = r.filter(p => p.occupancy_status === q.occupancy);
  if (q.search) {
    const s = q.search.toLowerCase();
    r = r.filter(p =>
      p.v_ulpin?.toLowerCase().includes(s) ||
      p.property_id?.toLowerCase().includes(s) ||
      p.address?.toLowerCase().includes(s) ||
      p.owner_name?.toLowerCase().includes(s)
    );
  }
  return r;
}

// GET /api/properties
router.get('/', async (req, res) => {
  try {
    if (!isSupabaseReady()) {
      return res.json({ success: true, source: 'mock', data: applyFilters(DEMO_PROPERTIES, req.query) });
    }
    let q = supabase.from('properties').select('*');
    if (req.query.status)    q = q.eq('verification_status', req.query.status);
    if (req.query.type)      q = q.eq('property_type', req.query.type);
    if (req.query.occupancy) q = q.eq('occupancy_status', req.query.occupancy);
    if (req.query.search) {
      const s = req.query.search;
      q = q.or(`v_ulpin.ilike.%${s}%,property_id.ilike.%${s}%,address.ilike.%${s}%,owner_name.ilike.%${s}%`);
    }
    const { data, error } = await q.order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ success: true, source: 'supabase', data });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// GET /api/properties/:id
router.get('/:id', async (req, res) => {
  try {
    if (!isSupabaseReady()) {
      const p = DEMO_PROPERTIES.find(x => x.id === req.params.id || x.property_id === req.params.id);
      if (!p) return res.status(404).json({ success: false, error: 'Not found' });
      return res.json({ success: true, source: 'mock', data: p });
    }
    const { data, error } = await supabase
      .from('properties')
      .select('*, buildings(*), government_records(*)')
      .or(`id.eq.${req.params.id},property_id.eq.${req.params.id}`)
      .single();
    if (error) throw error;
    res.json({ success: true, source: 'supabase', data });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// POST /api/properties
router.post('/', async (req, res) => {
  try {
    if (!isSupabaseReady()) return res.json({ success: true, source: 'mock', data: { ...req.body, id: `mock-${Date.now()}` } });
    const { data, error } = await supabase.from('properties').insert(req.body).select().single();
    if (error) throw error;
    res.status(201).json({ success: true, source: 'supabase', data });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// PUT /api/properties/:id
router.put('/:id', async (req, res) => {
  try {
    if (!isSupabaseReady()) return res.json({ success: true, source: 'mock', data: { ...req.body, id: req.params.id } });
    const { data, error } = await supabase
      .from('properties').update({ ...req.body, updated_at: new Date().toISOString() })
      .eq('id', req.params.id).select().single();
    if (error) throw error;
    res.json({ success: true, source: 'supabase', data });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

export default router;
