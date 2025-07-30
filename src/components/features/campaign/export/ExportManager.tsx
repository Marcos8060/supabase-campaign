'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { 
  Download, 
  FileText, 
  FileSpreadsheet, 
  FileJson,
  CheckSquare,
  Square,
  Filter,
  Search
} from 'lucide-react';
import { saveAs } from 'file-saver';
import Papa from 'papaparse';
import { campaignQueries, platformQueries } from '@/app/lib/supabase/queries';
import { useAuth } from '@/context/AuthProvider';
import type { Campaign, AdvertisingPlatform, ExportFormat, ExportData } from '@/app/types/database';

interface ExportManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

const exportFormats: ExportFormat[] = [
  {
    id: 'csv',
    name: 'CSV',
    description: 'Comma-separated values for spreadsheet import',
    fileExtension: 'csv',
    mimeType: 'text/csv'
  },
  {
    id: 'json',
    name: 'JSON',
    description: 'Structured data format',
    fileExtension: 'json',
    mimeType: 'application/json'
  },
  {
    id: 'implementation-guide',
    name: 'Implementation Guide',
    description: 'Detailed setup instructions for each platform',
    fileExtension: 'md',
    mimeType: 'text/markdown'
  }
];

export default function ExportManager({ isOpen, onClose }: ExportManagerProps) {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [platforms, setPlatforms] = useState<AdvertisingPlatform[]>([]);
  const [selectedCampaigns, setSelectedCampaigns] = useState<Set<string>>(new Set());
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>(exportFormats[0]);
  const [includeAssets, setIncludeAssets] = useState(false);
  const [includeTaxonomy, setIncludeTaxonomy] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [platformFilter, setPlatformFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      loadData();
    }
  }, [isOpen, user]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [campaignsResponse, platformsResponse] = await Promise.all([
        campaignQueries.getCampaigns(user!.id),
        platformQueries.getPlatforms()
      ]);

      if (campaignsResponse.data) {
        setCampaigns(campaignsResponse.data);
        // Select all campaigns by default
        setSelectedCampaigns(new Set(campaignsResponse.data.map(c => c.id)));
      }

      if (platformsResponse.data) {
        setPlatforms(platformsResponse.data);
      }
    } catch (error) {
      console.error('Error loading export data:', error);
      toast.error('Failed to load campaigns');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         campaign.objective?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPlatform = !platformFilter || campaign.platform_id === platformFilter;
    const matchesStatus = !statusFilter || campaign.status === statusFilter;
    
    return matchesSearch && matchesPlatform && matchesStatus;
  });

  const handleSelectAll = () => {
    if (selectedCampaigns.size === filteredCampaigns.length) {
      setSelectedCampaigns(new Set());
    } else {
      setSelectedCampaigns(new Set(filteredCampaigns.map(c => c.id)));
    }
  };

  const handleSelectCampaign = (campaignId: string) => {
    const newSelected = new Set(selectedCampaigns);
    if (newSelected.has(campaignId)) {
      newSelected.delete(campaignId);
    } else {
      newSelected.add(campaignId);
    }
    setSelectedCampaigns(newSelected);
  };

  const generateCSV = (selectedCampaignsData: Campaign[]): string => {
    const csvData = selectedCampaignsData.map(campaign => ({
      'Campaign Name': campaign.name,
      'Platform': platforms.find(p => p.id === campaign.platform_id)?.name || '',
      'Status': campaign.status,
      'Objective': campaign.objective || '',
      'Budget': campaign.budget || '',
      'Start Date': campaign.start_date || '',
      'End Date': campaign.end_date || '',
      'Target Audience': campaign.target_audience || '',
      'Generated ID': campaign.generated_id || '',
      'Notes': campaign.notes || '',
      'Created': new Date(campaign.created_at).toLocaleDateString(),
      ...(includeTaxonomy && campaign.taxonomy_data ? campaign.taxonomy_data : {})
    }));

    return Papa.unparse(csvData);
  };

  const generateJSON = (selectedCampaignsData: Campaign[]): string => {
    const jsonData = selectedCampaignsData.map(campaign => ({
      ...campaign,
      platform: platforms.find(p => p.id === campaign.platform_id),
      assets: includeAssets ? campaign.assets : undefined
    }));

    return JSON.stringify(jsonData, null, 2);
  };

  const generateImplementationGuide = (selectedCampaignsData: Campaign[]): string => {
    const platformGroups = selectedCampaignsData.reduce((groups, campaign) => {
      const platform = platforms.find(p => p.id === campaign.platform_id);
      const platformName = platform?.name || 'Unknown';
      
      if (!groups[platformName]) {
        groups[platformName] = [];
      }
      groups[platformName].push({ ...campaign, platform });
      return groups;
    }, {} as Record<string, any[]>);

    let guide = '# Campaign Implementation Guide\n\n';
    guide += `Generated on: ${new Date().toLocaleDateString()}\n`;
    guide += `Total Campaigns: ${selectedCampaignsData.length}\n\n`;

    Object.entries(platformGroups).forEach(([platformName, platformCampaigns]) => {
      guide += `## ${platformName}\n\n`;
      
      platformCampaigns.forEach((campaign, index) => {
        guide += `### ${index + 1}. ${campaign.name}\n\n`;
        guide += `**Campaign ID:** \`${campaign.generated_id}\`\n\n`;
        guide += `**Details:**\n`;
        guide += `- Status: ${campaign.status}\n`;
        guide += `- Objective: ${campaign.objective || 'Not specified'}\n`;
        if (campaign.budget) guide += `- Budget: $${campaign.budget}\n`;
        if (campaign.start_date) guide += `- Start Date: ${campaign.start_date}\n`;
        if (campaign.end_date) guide += `- End Date: ${campaign.end_date}\n`;
        if (campaign.target_audience) guide += `- Target Audience: ${campaign.target_audience}\n`;
        
        if (includeTaxonomy && campaign.taxonomy_data) {
          guide += `\n**Taxonomy:**\n`;
          Object.entries(campaign.taxonomy_data).forEach(([key, value]) => {
            guide += `- ${key}: ${value}\n`;
          });
        }
        
        if (includeAssets && campaign.assets && campaign.assets.length > 0) {
          guide += `\n**Assets:**\n`;
          campaign.assets.forEach(asset => {
            guide += `- ${asset.name} (${asset.file_type})\n`;
          });
        }
        
        if (campaign.notes) {
          guide += `\n**Notes:**\n${campaign.notes}\n`;
        }
        
        guide += `\n---\n\n`;
      });
    });

    return guide;
  };

  const handleExport = async () => {
    if (selectedCampaigns.size === 0) {
      toast.error('Please select at least one campaign to export');
      return;
    }

    setIsExporting(true);
    try {
      const selectedCampaignsData = campaigns.filter(c => selectedCampaigns.has(c.id));
      let content: string;
      let filename: string;

      switch (selectedFormat.id) {
        case 'csv':
          content = generateCSV(selectedCampaignsData);
          filename = `campaigns_${new Date().toISOString().split('T')[0]}.csv`;
          break;
        case 'json':
          content = generateJSON(selectedCampaignsData);
          filename = `campaigns_${new Date().toISOString().split('T')[0]}.json`;
          break;
        case 'implementation-guide':
          content = generateImplementationGuide(selectedCampaignsData);
          filename = `implementation_guide_${new Date().toISOString().split('T')[0]}.md`;
          break;
        default:
          throw new Error('Unsupported export format');
      }

      const blob = new Blob([content], { type: selectedFormat.mimeType });
      saveAs(blob, filename);
      
      toast.success(`Exported ${selectedCampaignsData.length} campaigns successfully`);
      onClose();
    } catch (error) {
      console.error('Error exporting campaigns:', error);
      toast.error('Failed to export campaigns');
    } finally {
      setIsExporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Export Campaigns</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="flex h-[calc(90vh-120px)]">
          {/* Left Panel - Campaign Selection */}
          <div className="w-2/3 border-r border-gray-200 flex flex-col">
            {/* Filters */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search campaigns..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <select
                  value={platformFilter}
                  onChange={(e) => setPlatformFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Platforms</option>
                  {platforms.map(platform => (
                    <option key={platform.id} value={platform.id}>
                      {platform.name}
                    </option>
                  ))}
                </select>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Statuses</option>
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleSelectAll}
                    className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900"
                  >
                    {selectedCampaigns.size === filteredCampaigns.length ? (
                      <CheckSquare className="h-4 w-4" />
                    ) : (
                      <Square className="h-4 w-4" />
                    )}
                    <span>
                      {selectedCampaigns.size === filteredCampaigns.length ? 'Deselect All' : 'Select All'}
                    </span>
                  </button>
                </div>
                <span className="text-sm text-gray-500">
                  {selectedCampaigns.size} of {filteredCampaigns.length} selected
                </span>
              </div>
            </div>

            {/* Campaigns List */}
            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : filteredCampaigns.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  No campaigns found matching your filters
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {filteredCampaigns.map((campaign) => {
                    const platform = platforms.find(p => p.id === campaign.platform_id);
                    const isSelected = selectedCampaigns.has(campaign.id);

                    return (
                      <div key={campaign.id} className="p-4 hover:bg-gray-50">
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => handleSelectCampaign(campaign.id)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            {isSelected ? (
                              <CheckSquare className="h-5 w-5" />
                            ) : (
                              <Square className="h-5 w-5" />
                            )}
                          </button>
                          
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h3 className="font-medium text-gray-900">{campaign.name}</h3>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                campaign.status === 'active' ? 'bg-green-100 text-green-800' :
                                campaign.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                                campaign.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {campaign.status}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">{campaign.objective}</p>
                            <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                              <span>{platform?.name}</span>
                              {campaign.budget && <span>${campaign.budget}</span>}
                              {campaign.generated_id && <span>ID: {campaign.generated_id}</span>}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Export Options */}
          <div className="w-1/3 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Export Options</h3>
            
            {/* Format Selection */}
            <div className="space-y-3 mb-6">
              <label className="block text-sm font-medium text-gray-700">Export Format</label>
              {exportFormats.map((format) => (
                <div
                  key={format.id}
                  onClick={() => setSelectedFormat(format)}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedFormat.id === format.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    {format.id === 'csv' && <FileSpreadsheet className="h-5 w-5 text-green-600" />}
                    {format.id === 'json' && <FileJson className="h-5 w-5 text-blue-600" />}
                    {format.id === 'implementation-guide' && <FileText className="h-5 w-5 text-purple-600" />}
                    <div>
                      <p className="font-medium text-gray-900">{format.name}</p>
                      <p className="text-sm text-gray-600">{format.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Options */}
            <div className="space-y-4 mb-6">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="includeAssets"
                  checked={includeAssets}
                  onChange={(e) => setIncludeAssets(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="includeAssets" className="text-sm text-gray-700">
                  Include campaign assets
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="includeTaxonomy"
                  checked={includeTaxonomy}
                  onChange={(e) => setIncludeTaxonomy(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="includeTaxonomy" className="text-sm text-gray-700">
                  Include taxonomy data
                </label>
              </div>
            </div>

            {/* Export Button */}
            <Button
              onClick={handleExport}
              disabled={selectedCampaigns.size === 0 || isExporting}
              className="w-full"
            >
              <Download className="h-4 w-4 mr-2" />
              {isExporting ? 'Exporting...' : `Export ${selectedCampaigns.size} Campaigns`}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 