'use client';

import React, { useState, useEffect, memo } from 'react';

interface BulletListProps {
  items: string[];
  styles: Record<string, any>;
  className?: string;
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

const BulletList = memo<BulletListProps>(({ 
  items,
  styles,
  className = '',
  typewriterText,
  isTypewriting = false,
  onTypewriterComplete
}) => {
  const [typewriterComplete, setTypewriterComplete] = useState(false);

  const displayItems = [...items];
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
            <span className="flex-1" style={styles.bodyText}>{cleanText}</span>
          </li>
        );
      })}
    </ul>
  );
});

BulletList.displayName = 'BulletList';

export default BulletList;
