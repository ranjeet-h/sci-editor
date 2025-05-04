import React, { useState } from 'react';
import { Category } from '../types';
import './CategoriesManager.css';

interface CategoriesManagerProps {
  documentCategoryId: string | undefined;
  allCategories: Category[];
  onCategorySelect: (categoryId: string | undefined) => void;
  onCreateCategory: (category: Omit<Category, 'id'>) => void;
  onDeleteCategory: (categoryId: string) => void;
  onClose: () => void;
}

const CategoriesManager: React.FC<CategoriesManagerProps> = ({
  documentCategoryId,
  allCategories,
  onCategorySelect,
  onCreateCategory,
  onDeleteCategory,
  onClose,
}) => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>(documentCategoryId);
  const [newCategoryName, setNewCategoryName] = useState<string>('');
  const [newCategoryDescription, setNewCategoryDescription] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showConfirmDelete, setShowConfirmDelete] = useState<string | null>(null);

  // Create a new category
  const handleCreateCategory = () => {
    if (!newCategoryName.trim()) return;
    
    const newCategory = {
      name: newCategoryName.trim(),
      description: newCategoryDescription.trim() || undefined
    };
    
    onCreateCategory(newCategory);
    setNewCategoryName('');
    setNewCategoryDescription('');
  };

  // Handle category selection
  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategoryId(categoryId === selectedCategoryId ? undefined : categoryId);
  };

  // Confirm and delete a category
  const confirmDeleteCategory = (categoryId: string) => {
    setShowConfirmDelete(categoryId);
  };

  const handleDeleteCategory = (categoryId: string) => {
    onDeleteCategory(categoryId);
    setShowConfirmDelete(null);
    
    // Clear selection if the deleted category was selected
    if (selectedCategoryId === categoryId) {
      setSelectedCategoryId(undefined);
    }
  };

  // Apply changes and close
  const handleApply = () => {
    onCategorySelect(selectedCategoryId);
    onClose();
  };

  // Filter categories based on search query
  const filteredCategories = allCategories.filter(category => 
    category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (category.description && category.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="categories-manager-modal">
      <div className="categories-manager-content">
        <h2>Manage Categories</h2>
        
        <div className="categories-search">
          <input
            type="text"
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="categories-list">
          <div 
            className={`category-item ${!selectedCategoryId ? 'selected' : ''}`}
            onClick={() => setSelectedCategoryId(undefined)}
          >
            <div className="category-icon">📂</div>
            <div className="category-info">
              <div className="category-name">Uncategorized</div>
              <div className="category-description">Documents without a specific category</div>
            </div>
          </div>
          
          {filteredCategories.length > 0 ? (
            filteredCategories.map(category => (
              <div key={category.id} className="category-wrapper">
                <div 
                  className={`category-item ${category.id === selectedCategoryId ? 'selected' : ''}`}
                  onClick={() => handleCategorySelect(category.id)}
                >
                  <div className="category-icon">📁</div>
                  <div className="category-info">
                    <div className="category-name">{category.name}</div>
                    {category.description && (
                      <div className="category-description">{category.description}</div>
                    )}
                  </div>
                  
                  <button 
                    className="category-delete-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      confirmDeleteCategory(category.id);
                    }}
                  >
                    🗑️
                  </button>
                </div>
                
                {showConfirmDelete === category.id && (
                  <div className="delete-confirm">
                    <p>Delete this category? Documents will remain but become uncategorized.</p>
                    <div className="delete-actions">
                      <button 
                        className="delete-cancel"
                        onClick={() => setShowConfirmDelete(null)}
                      >
                        Cancel
                      </button>
                      <button 
                        className="delete-confirm-btn"
                        onClick={() => handleDeleteCategory(category.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="no-categories">
              {searchQuery ? 'No categories match your search' : 'No categories created yet'}
            </div>
          )}
        </div>
        
        <div className="create-category-section">
          <h3>Create New Category</h3>
          <div className="create-category-form">
            <input
              type="text"
              placeholder="Category name"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
            />
            
            <textarea
              placeholder="Category description (optional)"
              value={newCategoryDescription}
              onChange={(e) => setNewCategoryDescription(e.target.value)}
              rows={3}
            ></textarea>
            
            <button 
              className="create-category-btn"
              onClick={handleCreateCategory}
              disabled={!newCategoryName.trim()}
            >
              Create Category
            </button>
          </div>
        </div>
        
        <div className="categories-manager-footer">
          <button className="cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <button className="apply-btn" onClick={handleApply}>
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategoriesManager; 