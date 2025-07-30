'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X,
  ChevronDown,
  ChevronRight,
  Tag
} from 'lucide-react';
import { taxonomyQueries } from '@/app/lib/supabase/queries';
import type { TaxonomyCategory, TaxonomyValue, TaxonomyFormData } from '@/app/types/database';

export default function TaxonomyManager() {
  const [categories, setCategories] = useState<TaxonomyCategory[]>([]);
  const [values, setValues] = useState<TaxonomyValue[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showAddValue, setShowAddValue] = useState<string | null>(null);

  // Form states
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    is_required: false,
    sort_order: 0
  });

  const [valueForm, setValueForm] = useState<TaxonomyFormData>({
    category_id: '',
    value: '',
    description: ''
  });

  useEffect(() => {
    loadTaxonomyData();
  }, []);

  const loadTaxonomyData = async () => {
    setIsLoading(true);
    try {
      const [categoriesResponse, valuesResponse] = await Promise.all([
        taxonomyQueries.getCategories(),
        taxonomyQueries.getAllValues()
      ]);

      if (categoriesResponse.data) {
        setCategories(categoriesResponse.data);
      }

      if (valuesResponse.data) {
        setValues(valuesResponse.data);
      }
    } catch (error) {
      console.error('Error loading taxonomy data:', error);
      toast.error('Failed to load taxonomy data');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCategoryExpansion = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const handleAddCategory = async () => {
    if (!categoryForm.name.trim()) {
      toast.error('Category name is required');
      return;
    }

    try {
      const { data, error } = await taxonomyQueries.addCategory(categoryForm);
      
      if (error) {
        toast.error(error);
      } else {
        toast.success('Category added successfully');
        setCategoryForm({ name: '', description: '', is_required: false, sort_order: 0 });
        setShowAddCategory(false);
        loadTaxonomyData();
      }
    } catch (error) {
      console.error('Error adding category:', error);
      toast.error('Failed to add category');
    }
  };

  const handleUpdateCategory = async (categoryId: string, updates: Partial<TaxonomyCategory>) => {
    try {
      const { data, error } = await taxonomyQueries.updateCategory(categoryId, updates);
      
      if (error) {
        toast.error(error);
      } else {
        toast.success('Category updated successfully');
        setEditingCategory(null);
        loadTaxonomyData();
      }
    } catch (error) {
      console.error('Error updating category:', error);
      toast.error('Failed to update category');
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm('Are you sure you want to delete this category? This will also delete all associated values.')) {
      return;
    }

    try {
      const { error } = await taxonomyQueries.deleteCategory(categoryId);
      
      if (error) {
        toast.error(error);
      } else {
        toast.success('Category deleted successfully');
        loadTaxonomyData();
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Failed to delete category');
    }
  };

  const handleAddValue = async () => {
    if (!valueForm.category_id || !valueForm.value.trim()) {
      toast.error('Category and value are required');
      return;
    }

    try {
      const { data, error } = await taxonomyQueries.addValue(valueForm);
      
      if (error) {
        toast.error(error);
      } else {
        toast.success('Value added successfully');
        setValueForm({ category_id: '', value: '', description: '' });
        setShowAddValue(null);
        loadTaxonomyData();
      }
    } catch (error) {
      console.error('Error adding value:', error);
      toast.error('Failed to add value');
    }
  };

  const handleUpdateValue = async (valueId: string, updates: Partial<TaxonomyValue>) => {
    try {
      const { data, error } = await taxonomyQueries.updateValue(valueId, updates);
      
      if (error) {
        toast.error(error);
      } else {
        toast.success('Value updated successfully');
        setEditingValue(null);
        loadTaxonomyData();
      }
    } catch (error) {
      console.error('Error updating value:', error);
      toast.error('Failed to update value');
    }
  };

  const handleDeleteValue = async (valueId: string) => {
    if (!confirm('Are you sure you want to delete this value?')) {
      return;
    }

    try {
      const { error } = await taxonomyQueries.deleteValue(valueId);
      
      if (error) {
        toast.error(error);
      } else {
        toast.success('Value deleted successfully');
        loadTaxonomyData();
      }
    } catch (error) {
      console.error('Error deleting value:', error);
      toast.error('Failed to delete value');
    }
  };

  const getValuesForCategory = (categoryId: string) => {
    return values.filter(value => value.category_id === categoryId);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900">Taxonomy Management</h2>
          <Button onClick={() => setShowAddCategory(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </Button>
        </div>
      </div>

      <div className="divide-y divide-gray-200">
        {categories.map((category) => {
          const categoryValues = getValuesForCategory(category.id);
          const isExpanded = expandedCategories.has(category.id);
          const isEditing = editingCategory === category.id;

          return (
            <div key={category.id} className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => toggleCategoryExpansion(category.id)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>
                  
                  <Tag className="h-5 w-5 text-blue-600" />
                  
                  {isEditing ? (
                    <div className="flex items-center space-x-2">
                      <Input
                        value={category.name}
                        onChange={(e) => {
                          const updatedCategories = categories.map(cat =>
                            cat.id === category.id ? { ...cat, name: e.target.value } : cat
                          );
                          setCategories(updatedCategories);
                        }}
                        className="w-48"
                      />
                      <Button
                        size="sm"
                        onClick={() => handleUpdateCategory(category.id, { name: category.name })}
                      >
                        <Save className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingCategory(null)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {category.name}
                        {category.is_required && (
                          <span className="ml-2 text-red-500 text-sm">*</span>
                        )}
                      </h3>
                      {category.description && (
                        <p className="text-sm text-gray-600">{category.description}</p>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">
                    {categoryValues.length} values
                  </span>
                  
                  {!isEditing && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingCategory(category.id)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowAddValue(category.id)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteCategory(category.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {isExpanded && (
                <div className="mt-4 ml-8">
                  {/* Add Value Form */}
                  {showAddValue === category.id && (
                    <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Input
                          placeholder="Value"
                          value={valueForm.value}
                          onChange={(e) => setValueForm(prev => ({ ...prev, value: e.target.value }))}
                        />
                        <Input
                          placeholder="Description (optional)"
                          value={valueForm.description || ''}
                          onChange={(e) => setValueForm(prev => ({ ...prev, description: e.target.value }))}
                        />
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            onClick={() => {
                              setValueForm(prev => ({ ...prev, category_id: category.id }));
                              handleAddValue();
                            }}
                          >
                            Add
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setShowAddValue(null)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Values List */}
                  <div className="space-y-2">
                    {categoryValues.map((value) => {
                      const isEditingValue = editingValue === value.id;

                      return (
                        <div key={value.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          {isEditingValue ? (
                            <div className="flex items-center space-x-2 flex-1">
                              <Input
                                value={value.value}
                                onChange={(e) => {
                                  const updatedValues = values.map(val =>
                                    val.id === value.id ? { ...val, value: e.target.value } : val
                                  );
                                  setValues(updatedValues);
                                }}
                                className="flex-1"
                              />
                              <Input
                                value={value.description || ''}
                                onChange={(e) => {
                                  const updatedValues = values.map(val =>
                                    val.id === value.id ? { ...val, description: e.target.value } : val
                                  );
                                  setValues(updatedValues);
                                }}
                                placeholder="Description"
                                className="flex-1"
                              />
                              <Button
                                size="sm"
                                onClick={() => handleUpdateValue(value.id, { 
                                  value: value.value, 
                                  description: value.description 
                                })}
                              >
                                <Save className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditingValue(null)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <>
                              <div>
                                <p className="font-medium text-gray-900">{value.value}</p>
                                {value.description && (
                                  <p className="text-sm text-gray-600">{value.description}</p>
                                )}
                              </div>
                              <div className="flex items-center space-x-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setEditingValue(value.id)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDeleteValue(value.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Category Modal */}
      {showAddCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Category</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category Name *
                </label>
                <Input
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter category name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter category description"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_required"
                  checked={categoryForm.is_required}
                  onChange={(e) => setCategoryForm(prev => ({ ...prev, is_required: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="is_required" className="text-sm text-gray-700">
                  Required for campaigns
                </label>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort Order
                </label>
                <Input
                  type="number"
                  value={categoryForm.sort_order}
                  onChange={(e) => setCategoryForm(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))}
                  placeholder="0"
                />
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <Button onClick={handleAddCategory} className="flex-1">
                Add Category
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowAddCategory(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 