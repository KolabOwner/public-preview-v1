'use client';

import React, { useState, useRef } from 'react';

interface InlineDraggableSectionProps {
  sectionId: string;
  index: number;
  onReorder: (dragIndex: number, dropIndex: number) => void;
  children: React.ReactNode;
  className?: string;
}

export const InlineDraggableSection: React.FC<InlineDraggableSectionProps> = ({
  sectionId,
  index,
  onReorder,
  children,
  className = ''
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [showHandle, setShowHandle] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const dragNodeRef = useRef<HTMLDivElement>(null);

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('sectionIndex', index.toString());
    
    // Create a subtle drag image
    if (dragNodeRef.current) {
      const clone = dragNodeRef.current.cloneNode(true) as HTMLElement;
      clone.style.opacity = '0.5';
      clone.style.position = 'absolute';
      clone.style.top = '-1000px';
      document.body.appendChild(clone);
      e.dataTransfer.setDragImage(clone, 0, 0);
      setTimeout(() => document.body.removeChild(clone), 0);
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const draggedIndex = parseInt(e.dataTransfer.getData('sectionIndex'));
    if (!isNaN(draggedIndex) && draggedIndex !== index) {
      onReorder(draggedIndex, index);
    }
    setIsDragging(false);
    setIsDragOver(false);
  };

  return (
    <>
      {/* Drop indicator line above */}
      {isDragOver && (
        <div className="h-0.5 bg-blue-500 mx-4 mb-2 transition-all" />
      )}
      
      <li
        ref={dragNodeRef}
        className={`${sectionId} group relative leading-snug ${className}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{
          opacity: isDragging ? 0.5 : 1,
          transition: 'opacity 0.2s ease'
        }}
      >
      {/* Hover zone with integrated drag handle */}
      <div
        className="absolute -left-10 top-0 bottom-0 w-16 z-40"
        onMouseEnter={() => setShowHandle(true)}
        onMouseLeave={() => setShowHandle(false)}
      >
        {/* Drag handle inside the hover zone */}
        <div
          className={`absolute left-2 top-1 cursor-grab text-gray-400 
            transition duration-300 ${showHandle ? 'opacity-100' : 'opacity-0'}`}
          draggable
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          aria-hidden="true"
        >
          <svg 
            width="12" 
            height="16" 
            viewBox="0 0 12 16" 
            fill="currentColor"
            className="w-3 h-4"
          >
            <path d="M0 2h12v2H0zm0 5h12v2H0zm0 5h12v2H0z" />
          </svg>
        </div>
      </div>
      
        {children}
      </li>
    </>
  );
};

// For the main sections container
export const InlineDraggableSectionsContainer: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => {
  return (
    <ul className={`sortable-container col-span-12 z-10 transition-all ${className}`}>
      {children}
    </ul>
  );
};