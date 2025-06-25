'use client';

import React, { useState, useRef, useCallback, memo } from 'react';
import { GripVertical } from 'lucide-react';

interface DraggableResumeContentProps {
  children: React.ReactNode;
  sectionOrder: string[];
  sectionComponents: Record<string, React.ReactNode>;
  onSectionOrderChange: (newOrder: string[]) => void;
  styles: any;
  resumeStyles: any;
  paperDimensions: { width: number; height: number };
}

interface DragHandle {
  sectionId: string;
  top: number;
  height: number;
}

export const DraggableResumeContent = memo(({
  children,
  sectionOrder,
  sectionComponents,
  onSectionOrderChange,
  styles: inlineStyles,
  resumeStyles,
  paperDimensions
}: DraggableResumeContentProps) => {
  const [showHandles, setShowHandles] = useState(false);
  const [dragHandles, setDragHandles] = useState<DragHandle[]>([]);
  const [draggedSection, setDraggedSection] = useState<string | null>(null);
  const [dragOverSection, setDragOverSection] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const leftMarginRef = useRef<HTMLDivElement>(null);

  // Calculate section positions for drag handles
  const updateDragHandles = useCallback(() => {
    if (!containerRef.current) return;
    
    const handles: DragHandle[] = [];
    const sections = containerRef.current.querySelectorAll('[data-section-id]');
    
    sections.forEach((section) => {
      const rect = section.getBoundingClientRect();
      const containerRect = containerRef.current!.getBoundingClientRect();
      const sectionId = section.getAttribute('data-section-id');
      
      if (sectionId) {
        handles.push({
          sectionId,
          top: rect.top - containerRect.top,
          height: rect.height
        });
      }
    });
    
    setDragHandles(handles);
  }, []);

  // Handle mouse movement in left margin
  const handleMarginMouseMove = useCallback((e: React.MouseEvent) => {
    setMousePosition({ x: e.clientX, y: e.clientY });
    setShowHandles(true);
    updateDragHandles();
  }, [updateDragHandles]);

  const handleMarginMouseLeave = useCallback(() => {
    if (!draggedSection) {
      setShowHandles(false);
    }
  }, [draggedSection]);

  // Drag handlers
  const handleDragStart = useCallback((e: React.DragEvent, sectionId: string) => {
    setDraggedSection(sectionId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', sectionId);
    
    // Create custom drag image
    const dragImage = document.createElement('div');
    dragImage.style.cssText = `
      position: absolute;
      top: -1000px;
      left: -1000px;
      background: rgba(59, 130, 246, 0.1);
      border: 2px solid #3b82f6;
      border-radius: 8px;
      padding: 12px 24px;
      font-size: 14px;
      font-weight: 500;
      color: #3b82f6;
      backdrop-filter: blur(8px);
    `;
    dragImage.textContent = sectionId.charAt(0).toUpperCase() + sectionId.slice(1);
    document.body.appendChild(dragImage);
    e.dataTransfer.setDragImage(dragImage, 0, 0);
    setTimeout(() => document.body.removeChild(dragImage), 0);
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggedSection(null);
    setDragOverSection(null);
    if (!showHandles) {
      setShowHandles(false);
    }
  }, [showHandles]);

  const handleDragOver = useCallback((e: React.DragEvent, sectionId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverSection(sectionId);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, targetSectionId: string) => {
    e.preventDefault();
    const draggedSectionId = e.dataTransfer.getData('text/plain');
    
    if (draggedSectionId && draggedSectionId !== targetSectionId) {
      const filteredOrder = sectionOrder.filter(id => sectionComponents[id]);
      const dragIndex = filteredOrder.indexOf(draggedSectionId);
      const dropIndex = filteredOrder.indexOf(targetSectionId);
      
      if (dragIndex !== -1 && dropIndex !== -1) {
        const newFilteredOrder = [...filteredOrder];
        newFilteredOrder.splice(dragIndex, 1);
        newFilteredOrder.splice(dropIndex, 0, draggedSectionId);
        
        // Map back to full section order
        const newOrder = sectionOrder.map(id => {
          const idx = newFilteredOrder.indexOf(id);
          return idx !== -1 ? newFilteredOrder[idx] : id;
        });
        
        onSectionOrderChange(newOrder);
      }
    }
    
    setDraggedSection(null);
    setDragOverSection(null);
  }, [sectionOrder, sectionComponents, onSectionOrderChange]);

  return (
    <div className="resume-container" style={inlineStyles.container}>
      <div 
        ref={containerRef}
        style={{
          padding: resumeStyles.spacing.documentPadding,
          minHeight: '11in',
          boxSizing: 'border-box',
          position: 'relative'
        }}
      >
        {/* Left margin hover zone */}
        <div
          ref={leftMarginRef}
          className="absolute left-0 top-0 bottom-0 w-16 -ml-16 no-print"
          onMouseMove={handleMarginMouseMove}
          onMouseLeave={handleMarginMouseLeave}
          style={{ zIndex: 20 }}
        />

        {/* Drag handles */}
        {showHandles && dragHandles.map((handle) => {
          const isDragging = draggedSection === handle.sectionId;
          const isDragOver = dragOverSection === handle.sectionId;
          
          return (
            <div
              key={handle.sectionId}
              className={`absolute no-print transition-all duration-200 ${
                isDragging ? 'opacity-30' : 'opacity-100'
              }`}
              style={{
                left: '-48px',
                top: `${handle.top + handle.height / 2 - 20}px`,
                zIndex: 30,
                transform: isDragging ? 'scale(0.9)' : 'scale(1)',
              }}
            >
              <div
                draggable
                onDragStart={(e) => handleDragStart(e, handle.sectionId)}
                onDragEnd={handleDragEnd}
                className={`
                  flex items-center gap-2 px-3 py-2 rounded-lg cursor-move
                  bg-white dark:bg-gray-800 shadow-lg border
                  transition-all duration-200 hover:scale-105
                  ${isDragOver ? 'border-blue-500 shadow-blue-200' : 'border-gray-200 dark:border-gray-700'}
                `}
                style={{
                  backdropFilter: 'blur(10px)',
                  background: 'rgba(255, 255, 255, 0.9)'
                }}
              >
                <GripVertical className="w-4 h-4 text-gray-400" />
                <span className="text-xs font-medium text-gray-600 dark:text-gray-300 select-none">
                  {handle.sectionId.charAt(0).toUpperCase() + handle.sectionId.slice(1)}
                </span>
              </div>
            </div>
          );
        })}

        {/* Header (always first) */}
        {children}

        {/* Draggable sections */}
        {sectionOrder
          .filter(sectionId => sectionComponents[sectionId])
          .map((sectionId, index) => (
            <div
              key={sectionId}
              data-section-id={sectionId}
              onDragOver={(e) => handleDragOver(e, sectionId)}
              onDrop={(e) => handleDrop(e, sectionId)}
              className={`resume-section-draggable transition-all duration-300 ${
                draggedSection === sectionId ? 'opacity-50' : ''
              }`}
              style={{
                transform: dragOverSection === sectionId ? 'translateY(4px)' : 'translateY(0)',
              }}
            >
              {/* Drop indicator */}
              {dragOverSection === sectionId && draggedSection !== sectionId && (
                <div 
                  className="h-0.5 bg-blue-500 rounded-full -mt-2 mb-2 animate-pulse no-print"
                  style={{ 
                    background: 'linear-gradient(90deg, transparent 0%, #3b82f6 50%, transparent 100%)',
                  }}
                />
              )}
              
              {sectionComponents[sectionId]}
            </div>
          ))
        }
      </div>
    </div>
  );
});

DraggableResumeContent.displayName = 'DraggableResumeContent';