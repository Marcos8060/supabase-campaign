-- Campaign Tracker Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user', 'manager')),
  organization TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Taxonomy categories table
CREATE TABLE IF NOT EXISTS public.taxonomy_categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  is_required BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Taxonomy values table
CREATE TABLE IF NOT EXISTS public.taxonomy_values (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  category_id UUID REFERENCES public.taxonomy_categories(id) ON DELETE CASCADE,
  value TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(category_id, value)
);

-- Advertising platforms table
CREATE TABLE IF NOT EXISTS public.advertising_platforms (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  naming_convention TEXT,
  max_campaign_name_length INTEGER,
  allowed_characters TEXT,
  forbidden_characters TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Campaigns table
CREATE TABLE IF NOT EXISTS public.campaigns (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  platform_id UUID REFERENCES public.advertising_platforms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed')),
  budget DECIMAL(10,2),
  start_date DATE,
  end_date DATE,
  objective TEXT,
  target_audience TEXT,
  notes TEXT,
  generated_id TEXT,
  taxonomy_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Campaign assets table
CREATE TABLE IF NOT EXISTS public.campaign_assets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER,
  description TEXT,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Platform configurations table
CREATE TABLE IF NOT EXISTS public.platform_configurations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  platform_id UUID REFERENCES public.advertising_platforms(id) ON DELETE CASCADE,
  config_key TEXT NOT NULL,
  config_value TEXT,
  config_type TEXT DEFAULT 'string' CHECK (config_type IN ('string', 'number', 'boolean', 'json')),
  is_required BOOLEAN DEFAULT false,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(platform_id, config_key)
);

-- Campaign templates table
CREATE TABLE IF NOT EXISTS public.campaign_templates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  platform_id UUID REFERENCES public.advertising_platforms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  template_data JSONB NOT NULL,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default taxonomy categories
INSERT INTO public.taxonomy_categories (name, description, is_required, sort_order) VALUES
('Platform', 'Advertising platform (Meta, Google Ads, TikTok, etc.)', true, 1),
('Industry', 'Business industry or vertical', true, 2),
('Objective', 'Campaign objective (awareness, consideration, conversion)', true, 3),
('Channel', 'Marketing channel (social, search, display, video)', true, 4),
('Audience', 'Target audience segment', false, 5),
('Geographic', 'Geographic targeting', false, 6),
('Seasonal', 'Seasonal campaign indicator', false, 7),
('Product', 'Product or service being promoted', false, 8)
ON CONFLICT (name) DO NOTHING;

-- Insert default advertising platforms
INSERT INTO public.advertising_platforms (name, code, description, naming_convention, max_campaign_name_length, allowed_characters, forbidden_characters) VALUES
('Meta Ads', 'meta', 'Facebook and Instagram advertising', 'Lowercase with hyphens, no special characters', 40, 'a-z0-9-_', '!@#$%^&*()+=[]{}|\\:;"\'<>?,./'),
('Google Ads', 'google', 'Google Search and Display Network', 'Title case with spaces, limited special characters', 255, 'a-zA-Z0-9 _-', '[]{}|\\:;"\'<>?'),
('TikTok Ads', 'tiktok', 'TikTok advertising platform', 'Lowercase with underscores', 512, 'a-z0-9_', '!@#$%^&*()+=[]{}|\\:;"\'<>?,./'),
('DV360', 'dv360', 'Display & Video 360', 'Title case with spaces', 100, 'a-zA-Z0-9 _-', '[]{}|\\:;"\'<>?'),
('LinkedIn Ads', 'linkedin', 'LinkedIn advertising platform', 'Title case with spaces', 255, 'a-zA-Z0-9 _-', '[]{}|\\:;"\'<>?'),
('Twitter Ads', 'twitter', 'Twitter/X advertising platform', 'Title case with spaces', 255, 'a-zA-Z0-9 _-', '[]{}|\\:;"\'<>?')
ON CONFLICT (code) DO NOTHING;

-- Insert default taxonomy values
INSERT INTO public.taxonomy_values (category_id, value, description, sort_order) 
SELECT 
  tc.id,
  val.value,
  val.description,
  val.sort_order
FROM public.taxonomy_categories tc
CROSS JOIN (VALUES
  ('Platform', 'Meta', 'Facebook and Instagram', 1),
  ('Platform', 'Google', 'Google Search and Display', 2),
  ('Platform', 'TikTok', 'TikTok platform', 3),
  ('Platform', 'DV360', 'Display & Video 360', 4),
  ('Platform', 'LinkedIn', 'LinkedIn platform', 5),
  ('Platform', 'Twitter', 'Twitter/X platform', 6),
  ('Industry', 'E-commerce', 'Online retail', 1),
  ('Industry', 'SaaS', 'Software as a Service', 2),
  ('Industry', 'Finance', 'Financial services', 3),
  ('Industry', 'Healthcare', 'Healthcare services', 4),
  ('Industry', 'Education', 'Educational services', 5),
  ('Industry', 'Travel', 'Travel and tourism', 6),
  ('Objective', 'Awareness', 'Brand awareness campaigns', 1),
  ('Objective', 'Consideration', 'Consideration campaigns', 2),
  ('Objective', 'Conversion', 'Conversion campaigns', 3),
  ('Objective', 'Retention', 'Customer retention', 4),
  ('Channel', 'Social', 'Social media advertising', 1),
  ('Channel', 'Search', 'Search engine advertising', 2),
  ('Channel', 'Display', 'Display advertising', 3),
  ('Channel', 'Video', 'Video advertising', 4),
  ('Channel', 'Shopping', 'Shopping ads', 5),
  ('Audience', 'New', 'New customer acquisition', 1),
  ('Audience', 'Existing', 'Existing customer retention', 2),
  ('Audience', 'Lookalike', 'Lookalike audiences', 3),
  ('Audience', 'Custom', 'Custom audiences', 4),
  ('Geographic', 'US', 'United States', 1),
  ('Geographic', 'EU', 'European Union', 2),
  ('Geographic', 'APAC', 'Asia Pacific', 3),
  ('Geographic', 'Global', 'Global campaigns', 4),
  ('Seasonal', 'Q1', 'Q1 campaigns', 1),
  ('Seasonal', 'Q2', 'Q2 campaigns', 2),
  ('Seasonal', 'Q3', 'Q3 campaigns', 3),
  ('Seasonal', 'Q4', 'Q4 campaigns', 4),
  ('Seasonal', 'Holiday', 'Holiday campaigns', 5),
  ('Product', 'Core', 'Core product', 1),
  ('Product', 'Premium', 'Premium product', 2),
  ('Product', 'New', 'New product launch', 3)
) AS val(category_name, value, description, sort_order)
WHERE tc.name = val.category_name
ON CONFLICT (category_id, value) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_campaigns_user_id ON public.campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_platform_id ON public.campaigns(platform_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON public.campaigns(status);
CREATE INDEX IF NOT EXISTS idx_taxonomy_values_category_id ON public.taxonomy_values(category_id);
CREATE INDEX IF NOT EXISTS idx_campaign_assets_campaign_id ON public.campaign_assets(campaign_id);
CREATE INDEX IF NOT EXISTS idx_platform_configurations_platform_id ON public.platform_configurations(platform_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.taxonomy_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.taxonomy_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advertising_platforms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Profiles: Users can only see their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Taxonomy: Read-only for all authenticated users
CREATE POLICY "Authenticated users can view taxonomy" ON public.taxonomy_categories
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view taxonomy values" ON public.taxonomy_values
  FOR SELECT USING (auth.role() = 'authenticated');

-- Platforms: Read-only for all authenticated users
CREATE POLICY "Authenticated users can view platforms" ON public.advertising_platforms
  FOR SELECT USING (auth.role() = 'authenticated');

-- Campaigns: Users can only see their own campaigns
CREATE POLICY "Users can view own campaigns" ON public.campaigns
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own campaigns" ON public.campaigns
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own campaigns" ON public.campaigns
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own campaigns" ON public.campaigns
  FOR DELETE USING (auth.uid() = user_id);

-- Campaign assets: Users can only see assets for their campaigns
CREATE POLICY "Users can view own campaign assets" ON public.campaign_assets
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.campaigns 
      WHERE campaigns.id = campaign_assets.campaign_id 
      AND campaigns.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own campaign assets" ON public.campaign_assets
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.campaigns 
      WHERE campaigns.id = campaign_assets.campaign_id 
      AND campaigns.user_id = auth.uid()
    )
  );

-- Platform configurations: Read-only for all authenticated users
CREATE POLICY "Authenticated users can view platform configs" ON public.platform_configurations
  FOR SELECT USING (auth.role() = 'authenticated');

-- Campaign templates: Users can see their own and public templates
CREATE POLICY "Users can view own and public templates" ON public.campaign_templates
  FOR SELECT USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can insert own templates" ON public.campaign_templates
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Functions for automatic updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_taxonomy_categories_updated_at BEFORE UPDATE ON public.taxonomy_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_taxonomy_values_updated_at BEFORE UPDATE ON public.taxonomy_values FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_advertising_platforms_updated_at BEFORE UPDATE ON public.advertising_platforms FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON public.campaigns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_campaign_assets_updated_at BEFORE UPDATE ON public.campaign_assets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_platform_configurations_updated_at BEFORE UPDATE ON public.platform_configurations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_campaign_templates_updated_at BEFORE UPDATE ON public.campaign_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 