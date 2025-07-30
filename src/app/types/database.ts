export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  role: 'admin' | 'user' | 'manager';
  organization?: string;
  created_at: string;
  updated_at: string;
}

export interface TaxonomyCategory {
  id: string;
  name: string;
  description?: string;
  is_required: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface TaxonomyValue {
  id: string;
  category_id: string;
  value: string;
  description?: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface AdvertisingPlatform {
  id: string;
  name: string;
  code: string;
  description?: string;
  is_active: boolean;
  naming_convention?: string;
  max_campaign_name_length?: number;
  allowed_characters?: string;
  forbidden_characters?: string;
  created_at: string;
  updated_at: string;
}

export interface Campaign {
  id: string;
  name: string;
  platform_id: string;
  user_id: string;
  status: 'draft' | 'active' | 'paused' | 'completed';
  budget?: number;
  start_date?: string;
  end_date?: string;
  objective?: string;
  target_audience?: string;
  notes?: string;
  generated_id?: string;
  taxonomy_data?: Record<string, string>;
  created_at: string;
  updated_at: string;
}

export interface CampaignAsset {
  id: string;
  campaign_id: string;
  name: string;
  file_path: string;
  file_type: string;
  file_size?: number;
  description?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

export interface PlatformConfiguration {
  id: string;
  platform_id: string;
  config_key: string;
  config_value?: string;
  config_type: 'string' | 'number' | 'boolean' | 'json';
  is_required: boolean;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface CampaignTemplate {
  id: string;
  name: string;
  description?: string;
  platform_id: string;
  user_id: string;
  template_data: Record<string, any>;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

// Extended types with relationships
export interface TaxonomyCategoryWithValues extends TaxonomyCategory {
  values: TaxonomyValue[];
}

export interface CampaignWithRelations extends Campaign {
  platform: AdvertisingPlatform;
  assets: CampaignAsset[];
  user: Profile;
}

export interface AdvertisingPlatformWithConfigs extends AdvertisingPlatform {
  configurations: PlatformConfiguration[];
}

// Form types
export interface CampaignFormData {
  name: string;
  platform_id: string;
  budget?: number;
  start_date?: string;
  end_date?: string;
  objective?: string;
  target_audience?: string;
  notes?: string;
  taxonomy_data: Record<string, string>;
}

export interface TaxonomyFormData {
  category_id: string;
  value: string;
  description?: string;
}

// Wizard step types
export interface WizardStep {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
  isActive: boolean;
}

export interface CampaignWizardData {
  currentStep: number;
  steps: WizardStep[];
  formData: Partial<CampaignFormData>;
}

// Export types
export interface ExportFormat {
  id: string;
  name: string;
  description: string;
  fileExtension: string;
  mimeType: string;
}

export interface ExportData {
  campaigns: Campaign[];
  format: ExportFormat;
  includeAssets: boolean;
  includeTaxonomy: boolean;
}

// Platform-specific types
export interface PlatformNamingRules {
  maxLength: number;
  allowedCharacters: string;
  forbiddenCharacters: string;
  separator: string;
  case: 'lowercase' | 'uppercase' | 'titlecase';
}

export interface GeneratedCampaignId {
  originalName: string;
  generatedId: string;
  platform: string;
  validation: {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  };
}

// Search and filter types
export interface CampaignFilters {
  platform_id?: string;
  status?: string;
  date_range?: {
    start: string;
    end: string;
  };
  budget_range?: {
    min: number;
    max: number;
  };
  taxonomy_filters?: Record<string, string>;
}

export interface SearchParams {
  query: string;
  filters: CampaignFilters;
  sort_by: string;
  sort_order: 'asc' | 'desc';
  page: number;
  limit: number;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

// Authentication types
export interface AuthUser {
  id: string;
  email: string;
  role: string;
  profile?: Profile;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  full_name?: string;
  organization?: string;
}

// File upload types
export interface FileUpload {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
}

export interface AssetUploadData {
  campaign_id: string;
  name: string;
  description?: string;
  tags?: string[];
}

// Notification types
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Dashboard types
export interface DashboardStats {
  total_campaigns: number;
  active_campaigns: number;
  total_budget: number;
  campaigns_by_platform: Record<string, number>;
  campaigns_by_status: Record<string, number>;
  recent_campaigns: Campaign[];
}

// Template types
export interface TemplateFormData {
  name: string;
  description?: string;
  platform_id: string;
  is_public: boolean;
  template_data: Record<string, any>;
}

// Validation types
export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// Settings types
export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  notifications: {
    email: boolean;
    push: boolean;
    campaign_updates: boolean;
    system_updates: boolean;
  };
  default_platform?: string;
  default_taxonomy?: Record<string, string>;
} 