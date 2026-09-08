import { Router } from 'express';
import { supabase, isSupabaseReady } from '../db/supabase.js';
import { DEMO_PROPERTIES } from '../db/seedData.js';

const router = Router();

// GET /api/government/properties
router.get('/properties', async (req, res) => {
  try {
    if (!isSupabaseReady()) {
      let data = [...DEMO_PROPERTIES];
      if (req.query.status)   data = data.filter(p => p.verification_status === req.query.status);
      if (req.query.type)     data = data.filter(p => p.property_type === req.query.type);
      if (req.query.search) {
        const s = req.query.search.toLowerCase();
        data = data.filter(p =>
          p.v_ulpin?.toLowerCase().includes(s) ||
          p.property_id?.toLowerCase().includes(s) ||
          p.address?.toLowerCase().includes(s)
        );
      }
      return res.json({ success: true, source: 'mock', data });
    }
    let q = supabase.from('properties').select('*');
    if (req.query.status) q = q.eq('verification_status', req.query.status);
    if (req.query.type)   q = q.eq('property_type', req.query.type);
    const { data, error } = await q.order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ success: true, source: 'supabase', data });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// GET /api/government/properties/:id
router.get('/properties/:id', async (req, res) => {
  try {
    if (!isSupabaseReady()) {
      const p = DEMO_PROPERTIES.find(x => x.id === req.params.id || x.property_id === req.params.id);
      if (!p) return res.status(404).json({ success: false, error: 'Not found' });
      return res.json({ success: true, source: 'mock', data: p });
    }
    const { data, error } = await supabase
      .from('properties')
      .select('*, buildings(*), government_records(*), audit_logs(*)')
      .or(`id.eq.${req.params.id},property_id.eq.${req.params.id}`)
      .single();
    if (error) throw error;
    res.json({ success: true, source: 'supabase', data });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// PUT /api/government/properties/:id/verify
router.put('/properties/:id/verify', async (req, res) => {
  try {
    const { verified_by, remarks } = req.body;
    if (!isSupabaseReady()) {
      return res.json({ success: true, source: 'mock', message: 'Property verified (mock)' });
    }
    const { data, error } = await supabase
      .from('properties')
      .update({ verification_status: 'Verified', updated_at: new Date().toISOString() })
      .eq('id', req.params.id).select().single();
    if (error) throw error;
    // Log the action
    await supabase.from('audit_logs').insert({
      entity_type: 'property', entity_id: req.params.id,
      action: 'VERIFY', performed_by: verified_by,
      details: { remarks },
    });
    res.json({ success: true, source: 'supabase', data });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// PUT /api/government/properties/:id/status
router.put('/properties/:id/status', async (req, res) => {
  try {
    const { status, performed_by, remarks } = req.body;
    if (!isSupabaseReady()) {
      return res.json({ success: true, source: 'mock', message: `Status updated to ${status} (mock)` });
    }
    const { data, error } = await supabase
      .from('properties')
      .update({ verification_status: status, updated_at: new Date().toISOString() })
      .eq('id', req.params.id).select().single();
    if (error) throw error;
    await supabase.from('audit_logs').insert({
      entity_type: 'property', entity_id: req.params.id,
      action: `STATUS_CHANGE_${status.toUpperCase()}`, performed_by,
      details: { remarks, new_status: status },
    });
    res.json({ success: true, source: 'supabase', data });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

export default router;
