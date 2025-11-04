import { useState } from 'react';
import { Icons } from 'react-basics';
import styles from './TagManager.module.css';

export interface TagManagerProps {
  availableTags: string[];
  onCreateTag: (tag: string) => void;
  onDeleteTag: (tag: string) => void;
}

export function TagManager({ availableTags, onCreateTag, onDeleteTag }: TagManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [newTag, setNewTag] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedTag = newTag.trim();
    if (!trimmedTag) return;
    if (availableTags.includes(trimmedTag)) {
      alert('Tag already exists');
      return;
    }

    onCreateTag(trimmedTag);
    setNewTag('');
  };

  const handleDelete = (tag: string) => {
    if (confirm(`Delete tag "${tag}"? This will remove it from all domains.`)) {
      onDeleteTag(tag);
    }
  };

  if (!isOpen) {
    return (
      <button className={styles.openBtn} onClick={() => setIsOpen(true)}>
        <Icons.Gear width={16} height={16} />
        Manage Tags
      </button>
    );
  }

  return (
    <div className={styles.modal}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Manage Tags</h2>
          <button className={styles.closeBtn} onClick={() => setIsOpen(false)} aria-label="Close">
            <Icons.Close width={20} height={20} />
          </button>
        </div>

        {/* Create new tag */}
        <form className={styles.form} onSubmit={handleSubmit}>
          <input
            type="text"
            className={styles.input}
            placeholder="New tag name..."
            value={newTag}
            onChange={e => setNewTag(e.target.value)}
            maxLength={50}
          />
          <button type="submit" className={styles.submitBtn} disabled={!newTag.trim()}>
            <Icons.Plus width={16} height={16} />
            Add
          </button>
        </form>

        {/* Existing tags */}
        <div className={styles.tags}>
          {availableTags.length === 0 ? (
            <p className={styles.empty}>No tags yet. Create your first tag above.</p>
          ) : (
            availableTags.map(tag => (
              <div key={tag} className={styles.tag}>
                <span className={styles.tagName}>{tag}</span>
                <button
                  className={styles.deleteBtn}
                  onClick={() => handleDelete(tag)}
                  aria-label={`Delete ${tag}`}
                >
                  <Icons.Close width={14} height={14} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default TagManager;
