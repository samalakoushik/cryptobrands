import { supabase } from './supabaseClient';
import brandsData from '../data/brands.json';

// Check if Supabase is configured
const isSupabaseConfigured = () => {
  const url = process.env.REACT_APP_SUPABASE_URL;
  const key = process.env.REACT_APP_SUPABASE_ANON_KEY;
  return url && key && url !== 'https://placeholder.supabase.co' && key !== 'placeholder-key';
};

// Get all brands - fallback to brands.json if Supabase not configured
export const getBrands = async () => {
  // If Supabase not configured, use brands.json
  if (!isSupabaseConfigured()) {
    return brandsData.brands || [];
  }

  try {
    const { data, error } = await supabase
      .from('brands')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching brands from Supabase, falling back to brands.json:', error);
      return brandsData.brands || [];
    }

    // If Supabase returns empty, fallback to brands.json
    if (!data || data.length === 0) {
      return brandsData.brands || [];
    }

    // Transform to match your current data structure
    return data.map(brand => ({
      id: brand.id,
      name: brand.name,
      username: brand.username,
      affiliateBadges: brand.affiliate_badges,
      xProfileLink: brand.x_profile_link,
      logoUrl: brand.logo_url
    }));
  } catch (error) {
    console.error('Error in getBrands, falling back to brands.json:', error);
    return brandsData.brands || [];
  }
};

// Add a brand - only works if Supabase is configured
export const addBrand = async (brand) => {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase not configured. Please set up Supabase first.');
  }

  const { data, error } = await supabase
    .from('brands')
    .insert({
      name: brand.name,
      username: brand.username,
      affiliate_badges: parseInt(brand.affiliateBadges) || 0,
      x_profile_link: brand.xProfileLink || null,
      logo_url: brand.logoUrl || null
    })
    .select()
    .single();

  if (error) {
    console.error('Error adding brand:', error);
    throw error;
  }

  return {
    id: data.id,
    name: data.name,
    username: data.username,
    affiliateBadges: data.affiliate_badges,
    xProfileLink: data.x_profile_link,
    logoUrl: data.logo_url
  };
};

// Update a brand - only works if Supabase is configured
export const updateBrand = async (id, brand) => {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase not configured. Please set up Supabase first.');
  }

  const { data, error } = await supabase
    .from('brands')
    .update({
      name: brand.name,
      username: brand.username,
      affiliate_badges: parseInt(brand.affiliateBadges) || 0,
      x_profile_link: brand.xProfileLink || null,
      logo_url: brand.logoUrl || null,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating brand:', error);
    throw error;
  }

  return {
    id: data.id,
    name: data.name,
    username: data.username,
    affiliateBadges: data.affiliate_badges,
    xProfileLink: data.x_profile_link,
    logoUrl: data.logo_url
  };
};

// Delete a brand - only works if Supabase is configured
export const deleteBrand = async (id) => {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase not configured. Please set up Supabase first.');
  }

  const { error } = await supabase
    .from('brands')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting brand:', error);
    throw error;
  }
};

// Subscribe to real-time changes - only if Supabase is configured
export const subscribeToBrands = (callback) => {
  if (!isSupabaseConfigured()) {
    // Return a no-op unsubscribe function
    return () => {};
  }

  const subscription = supabase
    .channel('brands-changes')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'brands' },
      (payload) => {
        console.log('Real-time update:', payload);
        callback(payload);
      }
    )
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
};

