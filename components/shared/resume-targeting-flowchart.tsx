import React from 'react';

interface ResumeTargetingFlowchartProps {
  width?: number;
  height?: number;
  className?: string;
}

export default function ResumeTargetingFlowchart({ 
  width = 800, 
  height = 600, 
  className = "w-full max-w-4xl h-auto" 
}: ResumeTargetingFlowchartProps) {
  return (
    <div className="w-full h-screen bg-gray-900 flex items-center justify-center">
      <svg
        width={width}
        height={height}
        viewBox="0 0 800 600"
        className={className}
      >
        {/* Background */}
        <rect width="800" height="600" fill="#1a1d29" />
        
        {/* Dashed lines */}
        <defs>
          <pattern id="dashedLine" patternUnits="userSpaceOnUse" width="10" height="2">
            <rect width="6" height="2" fill="#4a90e2" />
            <rect x="6" width="4" height="2" fill="transparent" />
          </pattern>
        </defs>
        
        {/* Main curved dashed line from bottom-left to top-right */}
        <path
          d="M 50 550 Q 200 400, 350 300 Q 500 200, 750 50"
          stroke="#4a90e2"
          strokeWidth="2"
          fill="none"
          strokeDasharray="8,4"
        />
        
        {/* Additional curved dashed line */}
        <path
          d="M 100 500 Q 250 350, 400 250 Q 550 150, 700 100"
          stroke="#4a90e2"
          strokeWidth="2"
          fill="none"
          strokeDasharray="8,4"
        />
        
        {/* Reverse button (top left) */}
        <g>
          <rect
            x="50"
            y="150"
            width="120"
            height="50"
            rx="25"
            fill="white"
          />
          <text
            x="110"
            y="180"
            textAnchor="middle"
            className="fill-gray-800 text-lg font-semibold"
          >
            Reverse
          </text>
        </g>
        
        {/* Arrow from Reverse to Resume Format */}
        <path
          d="M 170 175 Q 250 200, 320 250"
          stroke="#4a90e2"
          strokeWidth="2"
          fill="none"
          markerEnd="url(#arrowhead)"
        />
        
        {/* YES button (bottom left) */}
        <g>
          <rect
            x="80"
            y="420"
            width="80"
            height="50"
            rx="8"
            fill="#22c55e"
          />
          <text
            x="120"
            y="450"
            textAnchor="middle"
            className="fill-white text-lg font-semibold"
          >
            YES
          </text>
        </g>
        
        {/* Arrow from YES to Resume Format */}
        <path
          d="M 160 445 Q 220 400, 280 350 Q 320 320, 350 300"
          stroke="#4a90e2"
          strokeWidth="2"
          fill="none"
          strokeDasharray="8,4"
          markerEnd="url(#arrowhead)"
        />
        
        {/* Central Resume Format box */}
        <g>
          <rect
            x="280"
            y="250"
            width="240"
            height="100"
            rx="12"
            fill="#3b4a73"
          />
          <text
            x="400"
            y="310"
            textAnchor="middle"
            className="fill-white text-3xl font-bold"
          >
            Resume Format
          </text>
        </g>
        
        {/* Vertical-dashed line from top */}
        <line
          x1="400"
          y1="50"
          x2="400"
          y2="250"
          stroke="#4a90e2"
          strokeWidth="2"
          strokeDasharray="8,4"
        />
        
        {/* Arrow pointing down to Resume Format */}
        <polygon
          points="395,240 400,250 405,240"
          fill="#4a90e2"
        />
        
        {/* Combination button (bottom center) */}
        <g>
          <rect
            x="320"
            y="420"
            width="160"
            height="50"
            rx="25"
            fill="white"
          />
          <text
            x="400"
            y="450"
            textAnchor="middle"
            className="fill-gray-800 text-lg font-semibold"
          >
            Combination
          </text>
        </g>
        
        {/* Arrow from Combination to Resume Format */}
        <path
          d="M 400 420 L 400 350"
          stroke="#4a90e2"
          strokeWidth="2"
          fill="none"
          markerEnd="url(#arrowhead)"
        />
        
        {/* NO button (top right) */}
        <g>
          <rect
            x="620"
            y="150"
            width="80"
            height="50"
            rx="8"
            fill="#ef4444"
          />
          <text
            x="660"
            y="180"
            textAnchor="middle"
            className="fill-white text-lg font-semibold"
          >
            NO
          </text>
        </g>
        
        {/* Curved line from Resume Format to NO */}
        <path
          d="M 520 280 Q 580 220, 620 175"
          stroke="#4a90e2"
          strokeWidth="2"
          fill="none"
          markerEnd="url(#arrowhead)"
        />
        
        {/* Arrow marker definition */}
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon
              points="0 0, 10 3.5, 0 7"
              fill="#4a90e2"
            />
          </marker>
        </defs>
      </svg>
    </div>
  );
}