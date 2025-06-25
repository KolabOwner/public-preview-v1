'use client';

import React, { useState, useRef, useEffect } from 'react';
import { GripVertical } from 'lucide-react';

interface DraggableSectionProps {
  sectionId: string;
  index: number;
  totalSections: number;
  onReorder: (dragIndex: number, dropIndex: number) => void;
  children: React.ReactNode;
  isDragging?: boolean;
  onDragStart?: (index: number) => void;
  onDragEnd?: () => void;
}

export const DraggableSection: React.FC<DraggableSectionProps> = ({
  sectionId,
  index,
  totalSections,
  onReorder,
  children,
  isDragging: externalIsDragging,
  onDragStart: externalOnDragStart,
  onDragEnd: externalOnDragEnd,
}) => {
  const [showHandle, setShowHandle] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const sectionRef = useRef<HTMLDivElement>(null);

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('sectionIndex', index.toString());
    
    // Create a custom drag image
    if (sectionRef.current) {
      const dragImage = sectionRef.current.cloneNode(true) as HTMLElement;
      dragImage.style.opacity = '0.8';
      dragImage.style.transform = 'rotate(2deg)';
      document.body.appendChild(dragImage);
      e.dataTransfer.setDragImage(dragImage, e.clientX - sectionRef.current.getBoundingClientRect().left, 20);
      setTimeout(() => document.body.removeChild(dragImage), 0);
    }
    
    externalOnDragStart?.(index);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setDragOverIndex(null);
    externalOnDragEnd?.();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    const rect = sectionRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const midpoint = rect.top + rect.height / 2;
    const dropIndex = e.clientY < midpoint ? index : index + 1;
    setDragOverIndex(dropIndex);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const draggedIndex = parseInt(e.dataTransfer.getData('sectionIndex'));
    
    if (!isNaN(draggedIndex) && draggedIndex !== index) {
      const rect = sectionRef.current?.getBoundingClientRect();
      if (!rect) return;
      
      const midpoint = rect.top + rect.height / 2;
      const dropIndex = e.clientY < midpoint ? index : index + 1;
      const adjustedDropIndex = draggedIndex < dropIndex ? dropIndex - 1 : dropIndex;
      
      onReorder(draggedIndex, adjustedDropIndex);
    }
    
    setDragOverIndex(null);
  };

  return (
    <>
      {/* Drop indicator line - top */}
      {dragOverIndex === index && (
        <div className="h-1 bg-blue-500 rounded-full mx-4 my-2 animate-pulse no-print" />
      )}
      
      <div
        ref={sectionRef}
        className={`resume-section-wrapper relative transition-all group ${
          isDragging || externalIsDragging ? 'opacity-50' : ''
        } ${showHandle ? 'ring-2 ring-blue-200' : ''}`}
        draggable={showHandle}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onMouseEnter={() => setShowHandle(true)}
        onMouseLeave={() => setShowHandle(false)}
      >
        {/* Drag handle */}
        {showHandle && (
          <div
            className="absolute left-0 top-4 -translate-x-10 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2 cursor-move no-print z-10 transition-all hover:scale-110 opacity-0 group-hover:opacity-100"
            title="Drag to reorder section"
            style={{ transition: 'opacity 0.2s ease-in-out' }}
          >
            <GripVertical className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </div>
        )}
        
        {/* Section content */}
        {children}
      </div>
      
      {/* Drop indicator line - bottom (for last section) */}
      {dragOverIndex === index + 1 && index === totalSections - 1 && (
        <div className="h-1 bg-blue-500 rounded-full mx-4 my-2 animate-pulse no-print" />
      )}
    </>
  );
};

// Hook for managing drag state across sections
export const useSectionDragState = () => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  
  return {
    draggedIndex,
    handleDragStart: (index: number) => setDraggedIndex(index),
    handleDragEnd: () => setDraggedIndex(null),
    isDragging: (index: number) => draggedIndex === index,
  };
};