'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  X,
  AlertCircle,
  Info
} from 'lucide-react';
import { 
  platformQueries, 
  taxonomyQueries, 
  campaignQueries,
  generateCampaignId,
  validateCampaignId 
} from '@/app/lib/supabase/queries';
import { useAuth } from '@/context/AuthProvider';
import type { 
  AdvertisingPlatform, 
  TaxonomyCategory, 
  TaxonomyValue, 
  CampaignFormData,
  WizardStep,
  GeneratedCampaignId 
} from '@/app/types/database';

interface CampaignWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const steps: WizardStep[] = [
  { id: 'platform', title: 'Platform', description: 'Select advertising platform', isCompleted: false, isActive: true },
  { id: 'basic', title: 'Basic Info', description: 'Campaign name and details', isCompleted: false, isActive: false },
  { id: 'taxonomy', title: 'Taxonomy', description: 'Categorize your campaign', isCompleted: false, isActive: false },
  { id: 'review', title: 'Review', description: 'Review and generate ID', isCompleted: false, isActive: false },
];

export default function CampaignWizard({ isOpen, onClose, onSuccess }: CampaignWizardProps) {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [wizardSteps, setWizardSteps] = useState<WizardStep[]>(steps);
  const [platforms, setPlatforms] = useState<AdvertisingPlatform[]>([]);
  const [taxonomyCategories, setTaxonomyCategories] = useState<TaxonomyCategory[]>([]);
  const [taxonomyValues, setTaxonomyValues] = useState<TaxonomyValue[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState<AdvertisingPlatform | null>(null);
  const [generatedId, setGeneratedId] = useState<GeneratedCampaignId | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<Partial<CampaignFormData>>({
    name: '',
    platform_id: '',
    budget: undefined,
    start_date: '',
    end_date: '',
    objective: '',
    target_audience: '',
    notes: '',
    taxonomy_data: {},
  });

  useEffect(() => {
    if (isOpen) {
      loadInitialData();
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedPlatform && formData.name) {
      generateCampaignIdentifier();
    }
  }, [selectedPlatform, formData.name, formData.taxonomy_data]);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      const [platformsResponse, categoriesResponse, valuesResponse] = await Promise.all([
        platformQueries.getPlatforms(),
        taxonomyQueries.getCategories(),
        taxonomyQueries.getAllValues()
      ]);

      if (platformsResponse.data) setPlatforms(platformsResponse.data);
      if (categoriesResponse.data) setTaxonomyCategories(categoriesResponse.data);
      if (valuesResponse.data) setTaxonomyValues(valuesResponse.data);
    } catch (error) {
      console.error('Error loading wizard data:', error);
      toast.error('Failed to load wizard data');
    } finally {
      setIsLoading(false);
    }
  };

  const generateCampaignIdentifier = () => {
    if (!selectedPlatform || !formData.name) return;

    const baseName = formData.name;
    const generatedIdString = generateCampaignId(baseName, selectedPlatform);
    const validation = validateCampaignId(generatedIdString, selectedPlatform);

    setGeneratedId({
      originalName: baseName,
      generatedId: generatedIdString,
      platform: selectedPlatform.name,
      validation
    });
  };

  const handlePlatformSelect = (platform: AdvertisingPlatform) => {
    setSelectedPlatform(platform);
    setFormData(prev => ({ ...prev, platform_id: platform.id }));
    updateStepCompletion(0, true);
  };

  const handleTaxonomyChange = (categoryName: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      taxonomy_data: {
        ...prev.taxonomy_data,
        [categoryName]: value
      }
    }));
  };

  const updateStepCompletion = (stepIndex: number, isCompleted: boolean) => {
    setWizardSteps(prev => prev.map((step, index) => 
      index === stepIndex ? { ...step, isCompleted } : step
    ));
  };

  const validateCurrentStep = (): boolean => {
    switch (currentStep) {
      case 0:
        return !!formData.platform_id;
      case 1:
        return !!(formData.name && formData.objective);
      case 2:
        const requiredCategories = taxonomyCategories.filter(cat => cat.is_required);
        return requiredCategories.every(cat => 
          formData.taxonomy_data?.[cat.name]
        );
      case 3:
        return !!generatedId?.validation.isValid;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (!validateCurrentStep()) {
      toast.error('Please complete all required fields');
      return;
    }

    updateStepCompletion(currentStep, true);
    
    if (currentStep < wizardSteps.length - 1) {
      setCurrentStep(currentStep + 1);
      setWizardSteps(prev => prev.map((step, index) => ({
        ...step,
        isActive: index === currentStep + 1
      })));
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setWizardSteps(prev => prev.map((step, index) => ({
        ...step,
        isActive: index === currentStep - 1
      })));
    }
  };

  const handleSubmit = async () => {
    if (!user || !selectedPlatform) return;

    setIsSubmitting(true);
    try {
      const campaignData = {
        ...formData,
        user_id: user.id,
        generated_id: generatedId?.generatedId,
        status: 'draft' as const,
      };

      const { data, error } = await campaignQueries.createCampaign(campaignData);
      
      if (error) {
        toast.error(error);
      } else {
        toast.success('Campaign created successfully!');
        onSuccess();
        onClose();
        resetWizard();
      }
    } catch (error) {
      console.error('Error creating campaign:', error);
      toast.error('Failed to create campaign');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetWizard = () => {
    setCurrentStep(0);
    setWizardSteps(steps);
    setFormData({
      name: '',
      platform_id: '',
      budget: undefined,
      start_date: '',
      end_date: '',
      objective: '',
      target_audience: '',
      notes: '',
      taxonomy_data: {},
    });
    setSelectedPlatform(null);
    setGeneratedId(null);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Select Advertising Platform</h3>
              <p className="text-sm text-gray-600 mb-6">Choose the platform where you'll run this campaign</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {platforms.map((platform) => (
                <div
                  key={platform.id}
                  onClick={() => handlePlatformSelect(platform)}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedPlatform?.id === platform.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">{platform.name}</h4>
                      <p className="text-sm text-gray-600">{platform.description}</p>
                      {platform.naming_convention && (
                        <p className="text-xs text-gray-500 mt-1">
                          Naming: {platform.naming_convention}
                        </p>
                      )}
                    </div>
                    {selectedPlatform?.id === platform.id && (
                      <Check className="h-5 w-5 text-blue-600" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Campaign Details</h3>
              <p className="text-sm text-gray-600 mb-6">Provide basic information about your campaign</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Campaign Name *
                </label>
                <Input
                  value={formData.name || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter campaign name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Objective *
                </label>
                <Input
                  value={formData.objective || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, objective: e.target.value }))}
                  placeholder="e.g., Brand awareness, Conversions"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Audience
                </label>
                <Input
                  value={formData.target_audience || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, target_audience: e.target.value }))}
                  placeholder="e.g., 25-45, Urban professionals"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Budget ($)
                </label>
                <Input
                  type="number"
                  value={formData.budget || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, budget: parseFloat(e.target.value) || undefined }))}
                  placeholder="0.00"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <Input
                  type="date"
                  value={formData.start_date || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <Input
                  type="date"
                  value={formData.end_date || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  value={formData.notes || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional notes about the campaign"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Campaign Taxonomy</h3>
              <p className="text-sm text-gray-600 mb-6">Categorize your campaign for better organization</p>
            </div>
            
            <div className="space-y-4">
              {taxonomyCategories.map((category) => {
                const categoryValues = taxonomyValues.filter(v => v.category_id === category.id);
                return (
                  <div key={category.id} className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      {category.name} {category.is_required && <span className="text-red-500">*</span>}
                    </label>
                    <select
                      value={formData.taxonomy_data?.[category.name] || ''}
                      onChange={(e) => handleTaxonomyChange(category.name, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select {category.name}</option>
                      {categoryValues.map((value) => (
                        <option key={value.id} value={value.value}>
                          {value.value}
                        </option>
                      ))}
                    </select>
                    {category.description && (
                      <p className="text-xs text-gray-500">{category.description}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Review & Generate ID</h3>
              <p className="text-sm text-gray-600 mb-6">Review your campaign details and generated platform ID</p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Campaign Details</h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Name:</span> {formData.name}</p>
                    <p><span className="font-medium">Platform:</span> {selectedPlatform?.name}</p>
                    <p><span className="font-medium">Objective:</span> {formData.objective}</p>
                    {formData.budget && <p><span className="font-medium">Budget:</span> ${formData.budget}</p>}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Generated Campaign ID</h4>
                  {generatedId ? (
                    <div className="space-y-2">
                      <div className="bg-white p-3 rounded border">
                        <p className="text-sm font-mono">{generatedId.generatedId}</p>
                      </div>
                      
                      {generatedId.validation.errors.length > 0 && (
                        <div className="flex items-start space-x-2 text-red-600">
                          <AlertCircle className="h-4 w-4 mt-0.5" />
                          <div className="text-sm">
                            {generatedId.validation.errors.map((error, index) => (
                              <p key={index}>{error}</p>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {generatedId.validation.warnings.length > 0 && (
                        <div className="flex items-start space-x-2 text-yellow-600">
                          <Info className="h-4 w-4 mt-0.5" />
                          <div className="text-sm">
                            {generatedId.validation.warnings.map((warning, index) => (
                              <p key={index}>{warning}</p>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">Generating ID...</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Create New Campaign</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          {/* Progress Steps */}
          <div className="mt-6">
            <div className="flex items-center justify-between">
              {wizardSteps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                    step.isCompleted
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : step.isActive
                      ? 'border-blue-600 text-blue-600'
                      : 'border-gray-300 text-gray-400'
                  }`}>
                    {step.isCompleted ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <span className="text-sm font-medium">{index + 1}</span>
                    )}
                  </div>
                  <div className="ml-3">
                    <p className={`text-sm font-medium ${
                      step.isActive ? 'text-blue-600' : 'text-gray-500'
                    }`}>
                      {step.title}
                    </p>
                    <p className="text-xs text-gray-400">{step.description}</p>
                  </div>
                  {index < wizardSteps.length - 1 && (
                    <div className={`w-16 h-0.5 mx-4 ${
                      step.isCompleted ? 'bg-blue-600' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6 overflow-y-auto max-h-[60vh]">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            renderStepContent()
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            
            <div className="flex space-x-3">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              
              {currentStep === wizardSteps.length - 1 ? (
                <Button
                  onClick={handleSubmit}
                  disabled={!validateCurrentStep() || isSubmitting}
                >
                  {isSubmitting ? 'Creating...' : 'Create Campaign'}
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  disabled={!validateCurrentStep()}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 