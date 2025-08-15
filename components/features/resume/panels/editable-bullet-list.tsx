'use client';

import React, { useState, useEffect, memo } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/config/firebase-config';

interface EditableBulletListProps {
  items: string[];
  styles: Record<string, any>;
  resumeId: string;
  sectionType: 'experience' | 'project' | 'involvement' | 'volunteer';
  itemIndex: number;
  onUpdate?: (newBullets: string[]) => void;
  className?: string;
  isEditing?: boolean;
  typewriterText?: string;
  isTypewriting?: boolean;
  onTypewriterComplete?: () => void;
}

interface TypewriterEffectProps {
  text: string;
  speed?: number;
  onComplete?: () => void;
  style?: React.CSSProperties;
}

const TypewriterEffect = memo<TypewriterEffectProps>(({
  text,
  speed = 30,
  onComplete,
  style
}) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);

      return () => clearTimeout(timer);
    } else if (currentIndex === text.length && onComplete) {
      onComplete();
    }
  }, [currentIndex, text, speed, onComplete]);

  useEffect(() => {
    setDisplayText('');
    setCurrentIndex(0);
  }, [text]);

  return (
    <span style={style}>
      {displayText}
      {currentIndex < text.length && (
        <span className="animate-pulse">|</span>
      )}
    </span>
  );
});

TypewriterEffect.displayName = 'TypewriterEffect';

const EditableBulletList = memo<EditableBulletListProps>(({
  items,
  styles,
  resumeId,
  sectionType,
  itemIndex,
  onUpdate,
  className = '',
  isEditing = false,
  typewriterText,
  isTypewriting = false,
  onTypewriterComplete
}) => {
  const [typewriterComplete, setTypewriterComplete] = useState(false);
  const [editableItems, setEditableItems] = useState(items);

  useEffect(() => {
    setEditableItems(items);
  }, [items]);

  const saveToFirestore = async (newItems: string[]) => {
    if (!resumeId) return;

    const fieldMapping = {
      experience: `rms_experience_${itemIndex}_description`,
      project: `rms_project_${itemIndex}_description`,
      involvement: `rms_involvement_${itemIndex}_description`,
      volunteer: `rms_volunteer_${itemIndex}_description`
    };

    try {
      const resumeRef = doc(db, 'resumes', resumeId);
      await updateDoc(resumeRef, {
        [fieldMapping[sectionType]]: newItems.join('\n'),
        updatedAt: new Date().toISOString()
      });
      onUpdate?.(newItems);
    } catch (error) {
      console.error('Error updating Firestore:', error);
    }
  };

  const handleBulletEdit = (index: number, newText: string) => {
    const newItems = [...editableItems];
    newItems[index] = newText;
    setEditableItems(newItems);
    saveToFirestore(newItems);
  };

  if (!isEditing && !isTypewriting) {
    return (
      <ul className={`p-0 m-0 ml-0 pl-0 list-none ${className}`} style={{...styles.bulletList, paddingLeft: 0, marginLeft: 0}}>
        {items.map((item, index) => {
          const cleanText = item.replace(/^[•·▪-]\s*/, '');
          return (
            <li key={index} className="flex leading-[1.35em]" style={{...styles.bulletItem, marginBottom: '0.2em'}}>
              <span className="flex-shrink-0 pr-0.5 w-1.5">•</span>
              <span className="flex-1" style={styles.bodyText}>{cleanText}</span>
            </li>
          );
        })}
      </ul>
    );
  }

  const displayItems = [...editableItems];
  if (isTypewriting && typewriterText && !typewriterComplete) {
    displayItems.push('');
  }

  return (
    <ul className={`p-0 m-0 ml-0 pl-0 list-none ${className}`} style={{...styles.bulletList, paddingLeft: 0, marginLeft: 0}}>
      {displayItems.map((item, index) => {
        const isTypewriterItem = isTypewriting && index === displayItems.length - 1 && !typewriterComplete;
        const cleanText = isTypewriterItem ? '' : item.replace(/^[•·▪-]\s*/, '');

        if (isTypewriterItem) {
          return (
            <li key={index} className="flex leading-[1.35em]" style={{...styles.bulletItem, marginBottom: '0.2em'}}>
              <span className="flex-shrink-0 pr-0.5 w-1.5">•</span>
              <span className="flex-1">
                <TypewriterEffect
                  text={typewriterText || ''}
                  speed={30}
                  onComplete={() => {
                    setTypewriterComplete(true);
                    onTypewriterComplete?.();
                  }}
                  style={{...styles.bodyText, color: '#2563eb'}}
                />
              </span>
            </li>
          );
        }

        return (
          <li key={index} className="flex leading-[1.35em]" style={{...styles.bulletItem, marginBottom: '0.2em'}}>
            <span className="flex-shrink-0 pr-0.5 w-1.5">•</span>
            <div className="flex-1">
              <div
                contentEditable={isEditing}
                suppressContentEditableWarning
                style={{
                  ...styles.bodyText,
                  outline: 'none',
                  minHeight: '1.35em',
                  lineHeight: '1.35em'
                }}
                onBlur={(e) => {
                  const newText = e.target.textContent || '';
                  if (newText !== cleanText) {
                    handleBulletEdit(index, newText);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    (e.target as HTMLDivElement).blur();
                  }
                }}
              >
                {cleanText}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
});

EditableBulletList.displayName = 'EditableBulletList';

export default EditableBulletList;