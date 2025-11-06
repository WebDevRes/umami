import { useState } from 'react';
import { Icons } from 'react-basics';
import TagManager from './TagManager';
import styles from './TagsSection.module.css';

export interface TagsSectionProps {
  availableTags: string[];
  selectedTags: string[];
  onTagToggle: (tag: string) => void;
  onClearTags: () => void;
  onCreateTag: (tag: string) => void;
  onDeleteTag: (tag: string) => void;
}

export function TagsSection({
  availableTags,
  selectedTags,
  onTagToggle,
  onClearTags,
  onCreateTag,
  onDeleteTag,
}: TagsSectionProps) {
  const [isTagManagerOpen, setIsTagManagerOpen] = useState(false);

  return (
    <div className={styles.container}>
      {availableTags.length > 0 && (
        <div className={styles.tagsRow}>
          <span className={styles.tagsLabel}>Tags:</span>
          <div className={styles.tags}>
            {availableTags.map(tag => {
              const isSelected = selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  className={`${styles.tagPill} ${isSelected ? styles.tagPillActive : ''}`}
                  onClick={() => onTagToggle(tag)}
                >
                  {tag}
                  {isSelected && (
                    <Icons.Close width={12} height={12} className={styles.tagPillClose} />
                  )}
                </button>
              );
            })}
          </div>
          <div className={styles.actions}>
            {selectedTags.length > 0 && (
              <button className={styles.clearTagsBtn} onClick={onClearTags}>
                Clear all
              </button>
            )}
            <button className={styles.manageBtn} onClick={() => setIsTagManagerOpen(true)}>
              Manage Tags
            </button>
          </div>
        </div>
      )}

      {isTagManagerOpen && (
        <TagManager
          availableTags={availableTags}
          onCreateTag={onCreateTag}
          onDeleteTag={onDeleteTag}
          onClose={() => setIsTagManagerOpen(false)}
        />
      )}
    </div>
  );
}

export default TagsSection;
