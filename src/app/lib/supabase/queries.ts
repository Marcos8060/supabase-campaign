import { supabase } from './client';
import type {
  Profile,
  TaxonomyCategory,
  TaxonomyValue,
  AdvertisingPlatform,
  Campaign,
  CampaignAsset,
  PlatformConfiguration,
  CampaignTemplate,
  CampaignFormData,
  TaxonomyFormData,
  CampaignFilters,
  SearchParams,
  PaginatedResponse,
  ApiResponse
} from '@/app/types/database';

// Profile queries
export const profileQueries = {
  async getProfile(userId: string): Promise<ApiResponse<Profile | null>> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    return { data, error: error?.message };
  },

  async updateProfile(userId: string, updates: Partial<Profile>): Promise<ApiResponse<Profile>> {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    return { data, error: error?.message };
  },

  async createProfile(profile: Omit<Profile, 'created_at' | 'updated_at'>): Promise<ApiResponse<Profile>> {
    const { data, error } = await supabase
      .from('profiles')
      .insert(profile)
      .select()
      .single();

    return { data, error: error?.message };
  }
};

// Taxonomy queries
export const taxonomyQueries = {
  async getCategories(): Promise<ApiResponse<TaxonomyCategory[]>> {
    const { data, error } = await supabase
      .from('taxonomy_categories')
      .select('*')
      .order('sort_order', { ascending: true });

    return { data: data || [], error: error?.message };
  },

  async getValuesByCategory(categoryId: string): Promise<ApiResponse<TaxonomyValue[]>> {
    const { data, error } = await supabase
      .from('taxonomy_values')
      .select('*')
      .eq('category_id', categoryId)
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    return { data: data || [], error: error?.message };
  },

  async getAllValues(): Promise<ApiResponse<TaxonomyValue[]>> {
    const { data, error } = await supabase
      .from('taxonomy_values')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    return { data: data || [], error: error?.message };
  },

  async addValue(value: TaxonomyFormData): Promise<ApiResponse<TaxonomyValue>> {
    const { data, error } = await supabase
      .from('taxonomy_values')
      .insert(value)
      .select()
      .single();

    return { data, error: error?.message };
  },

  async updateValue(id: string, updates: Partial<TaxonomyValue>): Promise<ApiResponse<TaxonomyValue>> {
    const { data, error } = await supabase
      .from('taxonomy_values')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    return { data, error: error?.message };
  },

  async deleteValue(id: string): Promise<ApiResponse<void>> {
    const { error } = await supabase
      .from('taxonomy_values')
      .delete()
      .eq('id', id);

    return { data: undefined, error: error?.message };
  },

  async addCategory(category: Omit<TaxonomyCategory, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<TaxonomyCategory>> {
    const { data, error } = await supabase
      .from('taxonomy_categories')
      .insert(category)
      .select()
      .single();

    return { data, error: error?.message };
  },

  async updateCategory(id: string, updates: Partial<TaxonomyCategory>): Promise<ApiResponse<TaxonomyCategory>> {
    const { data, error } = await supabase
      .from('taxonomy_categories')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    return { data, error: error?.message };
  },

  async deleteCategory(id: string): Promise<ApiResponse<void>> {
    const { error } = await supabase
      .from('taxonomy_categories')
      .delete()
      .eq('id', id);

    return { data: undefined, error: error?.message };
  }
};

// Platform queries
export const platformQueries = {
  async getPlatforms(): Promise<ApiResponse<AdvertisingPlatform[]>> {
    const { data, error } = await supabase
      .from('advertising_platforms')
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true });

    return { data: data || [], error: error?.message };
  },

  async getPlatform(id: string): Promise<ApiResponse<AdvertisingPlatform>> {
    const { data, error } = await supabase
      .from('advertising_platforms')
      .select('*')
      .eq('id', id)
      .single();

    return { data, error: error?.message };
  },

  async getPlatformConfigurations(platformId: string): Promise<ApiResponse<PlatformConfiguration[]>> {
    const { data, error } = await supabase
      .from('platform_configurations')
      .select('*')
      .eq('platform_id', platformId)
      .order('config_key', { ascending: true });

    return { data: data || [], error: error?.message };
  }
};

// Campaign queries
export const campaignQueries = {
  async getCampaigns(userId: string, filters?: CampaignFilters): Promise<ApiResponse<Campaign[]>> {
    let query = supabase
      .from('campaigns')
      .select(`
        *,
        platform:advertising_platforms(name, code),
        assets:campaign_assets(*)
      `)
      .eq('user_id', userId);

    if (filters?.platform_id) {
      query = query.eq('platform_id', filters.platform_id);
    }

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.date_range) {
      query = query
        .gte('start_date', filters.date_range.start)
        .lte('end_date', filters.date_range.end);
    }

    if (filters?.budget_range) {
      query = query
        .gte('budget', filters.budget_range.min)
        .lte('budget', filters.budget_range.max);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    return { data: data || [], error: error?.message };
  },

  async getCampaign(id: string, userId: string): Promise<ApiResponse<Campaign>> {
    const { data, error } = await supabase
      .from('campaigns')
      .select(`
        *,
        platform:advertising_platforms(*),
        assets:campaign_assets(*)
      `)
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    return { data, error: error?.message };
  },

  async createCampaign(campaign: Omit<Campaign, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<Campaign>> {
    const { data, error } = await supabase
      .from('campaigns')
      .insert(campaign)
      .select()
      .single();

    return { data, error: error?.message };
  },

  async updateCampaign(id: string, updates: Partial<Campaign>, userId: string): Promise<ApiResponse<Campaign>> {
    const { data, error } = await supabase
      .from('campaigns')
      .update(updates)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    return { data, error: error?.message };
  },

  async deleteCampaign(id: string, userId: string): Promise<ApiResponse<void>> {
    const { error } = await supabase
      .from('campaigns')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    return { data: undefined, error: error?.message };
  },

  async searchCampaigns(params: SearchParams, userId: string): Promise<ApiResponse<PaginatedResponse<Campaign>>> {
    const { query, filters, sort_by, sort_order, page, limit } = params;
    const offset = (page - 1) * limit;

    let supabaseQuery = supabase
      .from('campaigns')
      .select(`
        *,
        platform:advertising_platforms(name, code),
        assets:campaign_assets(*)
      `, { count: 'exact' })
      .eq('user_id', userId);

    // Apply search query
    if (query) {
      supabaseQuery = supabaseQuery.or(`name.ilike.%${query}%,objective.ilike.%${query}%,notes.ilike.%${query}%`);
    }

    // Apply filters
    if (filters?.platform_id) {
      supabaseQuery = supabaseQuery.eq('platform_id', filters.platform_id);
    }

    if (filters?.status) {
      supabaseQuery = supabaseQuery.eq('status', filters.status);
    }

    if (filters?.date_range) {
      supabaseQuery = supabaseQuery
        .gte('start_date', filters.date_range.start)
        .lte('end_date', filters.date_range.end);
    }

    if (filters?.budget_range) {
      supabaseQuery = supabaseQuery
        .gte('budget', filters.budget_range.min)
        .lte('budget', filters.budget_range.max);
    }

    // Apply sorting and pagination
    const { data, error, count } = await supabaseQuery
      .order(sort_by, { ascending: sort_order === 'asc' })
      .range(offset, offset + limit - 1);

    const total = count || 0;
    const total_pages = Math.ceil(total / limit);

    return {
      data: {
        data: data || [],
        pagination: {
          page,
          limit,
          total,
          total_pages
        }
      },
      error: error?.message
    };
  }
};

// Asset queries
export const assetQueries = {
  async getCampaignAssets(campaignId: string): Promise<ApiResponse<CampaignAsset[]>> {
    const { data, error } = await supabase
      .from('campaign_assets')
      .select('*')
      .eq('campaign_id', campaignId)
      .order('created_at', { ascending: false });

    return { data: data || [], error: error?.message };
  },

  async uploadAsset(asset: Omit<CampaignAsset, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<CampaignAsset>> {
    const { data, error } = await supabase
      .from('campaign_assets')
      .insert(asset)
      .select()
      .single();

    return { data, error: error?.message };
  },

  async deleteAsset(id: string): Promise<ApiResponse<void>> {
    const { error } = await supabase
      .from('campaign_assets')
      .delete()
      .eq('id', id);

    return { data: undefined, error: error?.message };
  }
};

// Template queries
export const templateQueries = {
  async getTemplates(userId: string): Promise<ApiResponse<CampaignTemplate[]>> {
    const { data, error } = await supabase
      .from('campaign_templates')
      .select(`
        *,
        platform:advertising_platforms(name, code)
      `)
      .or(`user_id.eq.${userId},is_public.eq.true`)
      .order('created_at', { ascending: false });

    return { data: data || [], error: error?.message };
  },

  async createTemplate(template: Omit<CampaignTemplate, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<CampaignTemplate>> {
    const { data, error } = await supabase
      .from('campaign_templates')
      .insert(template)
      .select()
      .single();

    return { data, error: error?.message };
  },

  async deleteTemplate(id: string, userId: string): Promise<ApiResponse<void>> {
    const { error } = await supabase
      .from('campaign_templates')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    return { data: undefined, error: error?.message };
  }
};

// Dashboard queries
export const dashboardQueries = {
  async getStats(userId: string) {
    const { data: campaigns, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      return { data: null, error: error.message };
    }

    const total_campaigns = campaigns?.length || 0;
    const active_campaigns = campaigns?.filter(c => c.status === 'active').length || 0;
    const total_budget = campaigns?.reduce((sum, c) => sum + (c.budget || 0), 0) || 0;

    const campaigns_by_platform: Record<string, number> = {};
    const campaigns_by_status: Record<string, number> = {};

    campaigns?.forEach(campaign => {
      campaigns_by_platform[campaign.platform_id] = (campaigns_by_platform[campaign.platform_id] || 0) + 1;
      campaigns_by_status[campaign.status] = (campaigns_by_status[campaign.status] || 0) + 1;
    });

    const recent_campaigns = campaigns?.slice(0, 5) || [];

    return {
      data: {
        total_campaigns,
        active_campaigns,
        total_budget,
        campaigns_by_platform,
        campaigns_by_status,
        recent_campaigns
      },
      error: undefined
    };
  }
};

// Utility functions
export const generateCampaignId = (name: string, platform: AdvertisingPlatform): string => {
  let generatedId = name;

  // Apply platform-specific naming conventions
  if (platform.naming_convention) {
    // Convert to lowercase if specified
    if (platform.naming_convention.toLowerCase().includes('lowercase')) {
      generatedId = generatedId.toLowerCase();
    }

    // Replace spaces with specified separator
    if (platform.naming_convention.includes('hyphens')) {
      generatedId = generatedId.replace(/\s+/g, '-');
    } else if (platform.naming_convention.includes('underscores')) {
      generatedId = generatedId.replace(/\s+/g, '_');
    }

    // Remove forbidden characters
    if (platform.forbidden_characters) {
      const forbiddenRegex = new RegExp(`[${platform.forbidden_characters.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}]`, 'g');
      generatedId = generatedId.replace(forbiddenRegex, '');
    }

    // Limit length
    if (platform.max_campaign_name_length) {
      generatedId = generatedId.substring(0, platform.max_campaign_name_length);
    }
  }

  return generatedId;
};

export const validateCampaignId = (id: string, platform: AdvertisingPlatform): { isValid: boolean; errors: string[]; warnings: string[] } => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check length
  if (platform.max_campaign_name_length && id.length > platform.max_campaign_name_length) {
    errors.push(`Campaign ID exceeds maximum length of ${platform.max_campaign_name_length} characters`);
  }

  // Check forbidden characters
  if (platform.forbidden_characters) {
    const forbiddenRegex = new RegExp(`[${platform.forbidden_characters.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}]`, 'g');
    if (forbiddenRegex.test(id)) {
      errors.push('Campaign ID contains forbidden characters');
    }
  }

  // Check allowed characters
  if (platform.allowed_characters) {
    const allowedRegex = new RegExp(`^[${platform.allowed_characters.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}]+$`);
    if (!allowedRegex.test(id)) {
      warnings.push('Campaign ID contains characters that may not be supported');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};