import React, { useState, useEffect } from 'react';
import { Tag } from '../types';
import './TagsManager.css';

interface TagsManagerProps {
  documentTags: string[];
  allTags: Tag[];
  onTagsUpdate: (tags: string[]) => void;
  onCreateTag: (tag: Omit<Tag, 'id'>) => void;
  onClose: () => void;
}

const TagsManager: React.FC<TagsManagerProps> = ({
  documentTags,
  allTags,
  onTagsUpdate,
  onCreateTag,
  onClose,
}) => {
  const [selectedTags, setSelectedTags] = useState<string[]>(documentTags || []);
  const [newTagName, setNewTagName] = useState<string>('');
  const [newTagColor, setNewTagColor] = useState<string>('#3498db');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Predefined colors for tags
  const colorOptions = [
    '#3498db', // Blue
    '#2ecc71', // Green
    '#e74c3c', // Red
    '#f39c12', // Orange
    '#9b59b6', // Purple
    '#1abc9c', // Turquoise
    '#34495e', // Dark Blue
    '#e67e22', // Dark Orange
    '#27ae60', // Dark Green
    '#8e44ad', // Dark Purple
  ];

  // Toggle tag selection
  const toggleTag = (tagId: string) => {
    if (selectedTags.includes(tagId)) {
      setSelectedTags(selectedTags.filter(id => id !== tagId));
    } else {
      setSelectedTags([...selectedTags, tagId]);
    }
  };

  // Create a new tag
  const handleCreateTag = () => {
    if (!newTagName.trim()) return;
    
    const newTag = {
      name: newTagName.trim(),
      color: newTagColor
    };
    
    onCreateTag(newTag);
    setNewTagName('');
  };

  // Apply changes and close
  const handleApply = () => {
    onTagsUpdate(selectedTags);
    onClose();
  };

  // Filter tags based on search query
  const filteredTags = allTags.filter(tag => 
    tag.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="tags-manager-modal">
      <div className="tags-manager-content">
        <h2>Manage Tags</h2>
        
        <div className="tags-search">
          <input
            type="text"
            placeholder="Search tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="tags-list">
          {filteredTags.length > 0 ? (
            filteredTags.map(tag => (
              <div 
                key={tag.id} 
                className={`tag-item ${selectedTags.includes(tag.id) ? 'selected' : ''}`}
                onClick={() => toggleTag(tag.id)}
              >
                <div 
                  className="tag-color" 
                  style={{ backgroundColor: tag.color }}
                ></div>
                <div className="tag-name">{tag.name}</div>
              </div>
            ))
          ) : (
            <div className="no-tags">
              {searchQuery ? 'No tags match your search' : 'No tags created yet'}
            </div>
          )}
        </div>
        
        <div className="create-tag-section">
          <h3>Create New Tag</h3>
          <div className="create-tag-form">
            <input
              type="text"
              placeholder="Tag name"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
            />
            
            <div className="color-picker">
              <span>Tag color:</span>
              <div className="color-options">
                {colorOptions.map(color => (
                  <div 
                    key={color}
                    className={`color-option ${color === newTagColor ? 'selected' : ''}`}
                    style={{ backgroundColor: color }}
                    onClick={() => setNewTagColor(color)}
                  ></div>
                ))}
              </div>
            </div>
            
            <button 
              className="create-tag-btn"
              onClick={handleCreateTag}
              disabled={!newTagName.trim()}
            >
              Create Tag
            </button>
          </div>
        </div>
        
        <div className="tags-manager-footer">
          <button className="cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <button className="apply-btn" onClick={handleApply}>
            Apply Tags
          </button>
        </div>
      </div>
    </div>
  );
};

export default TagsManager; 