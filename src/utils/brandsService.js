import { supabase } from './supabaseClient';

// Get all brands
export const getBrands = async () => {
  try {
    const { data, error } = await supabase
      .from('brands')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching brands:', error);
      throw error;
    }

    // Transform to match your current data structure
    return (data || []).map(brand => ({
      id: brand.id,
      name: brand.name,
      username: brand.username,
      affiliateBadges: brand.affiliate_badges,
      xProfileLink: brand.x_profile_link,
      logoUrl: brand.logo_url
    }));
  } catch (error) {
    console.error('Error in getBrands:', error);
    return []; // Return empty array on error
  }
};

// Add a brand
export const addBrand = async (brand) => {
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

// Update a brand
export const updateBrand = async (id, brand) => {
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

// Delete a brand
export const deleteBrand = async (id) => {
  const { error } = await supabase
    .from('brands')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting brand:', error);
    throw error;
  }
};

// Subscribe to real-time changes
export const subscribeToBrands = (callback) => {
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

