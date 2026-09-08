import { Router } from 'express';
import { supabase, isSupabaseReady } from '../db/supabase.js';
import { getAnalyticsFromMock } from '../db/seedData.js';

const router = Router();

// GET /api/analytics/overview
router.get('/overview', async (req, res) => {
  try {
    if (!isSupabaseReady()) {
      return res.json({ success: true, source: 'mock', data: getAnalyticsFromMock() });
    }
    const { data: props, error } = await supabase.from('properties').select('verification_status');
    if (error) throw error;
    const { count: totalBuildings } = await supabase.from('buildings').select('*', { count: 'exact', head: true });
    const { count: totalUnits }     = await supabase.from('units').select('*', { count: 'exact', head: true });

    const total    = props.length;
    const verified = props.filter(p => p.verification_status === 'Verified').length;
    const pending  = props.filter(p => p.verification_status === 'Pending').length;
    const rejected = props.filter(p => p.verification_status === 'Rejected').length;

    res.json({ success: true, source: 'supabase', data: { total, verified, pending, rejected, totalBuildings, totalUnits } });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

export default router;
