import React from 'react';

interface MathVisualizerProps {
  visualType: string;
  visualData: any;
}

export const MathVisualizer: React.FC<MathVisualizerProps> = ({ visualType, visualData }) => {
  if (visualType === 'none' || !visualData) return null;

  switch (visualType) {
    case 'counting':
      return <CountingVisualizer data={visualData} />;
    case 'fraction':
      return <FractionVisualizer data={visualData} />;
    case 'fraction-shape':
      return (
        <FractionVisualizer
          data={{
            numerator: Number(visualData.shaded || 1),
            denominator: Number(visualData.parts || 4),
            shape: visualData.shape === 'circle' ? 'circle' : 'bar'
          }}
        />
      );
    case 'clock':
      return <ClockVisualizer data={visualData} />;
    case 'shapes':
      return <ShapesVisualizer data={visualData} />;
    case 'grid':
      return <GridVisualizer data={visualData} />;
    case 'geometry':
      return <GeometryVisualizer data={visualData} />;
    case 'pie-chart':
      return <PieChartVisualizer data={visualData} />;
    case 'number-line':
      return <NumberLineVisualizer data={visualData} />;
    case 'sequence': {
      const start = Number(visualData.start || 0);
      const step = Number(visualData.step || 1);
      const length = Number(visualData.length || 5);
      const missingIndex = Number(visualData.missing || 0);
      const sequence = Array.from({ length }).map((_, idx) => start + idx * step);
      return <NumberLineVisualizer data={{ sequence, missingIndex }} />;
    }
    case 'equation':
      return <EquationVisualizer data={visualData} />;
    case 'vertical-math':
      return <VerticalMathVisualizer data={visualData} />;
    case 'number-bond':
      return <NumberBondVisualizer data={visualData} />;
    case 'place-value':
      return <PlaceValueVisualizer data={visualData} />;
    case 'groups':
      return (
        <GroupsVisualizer
          data={{
            groups: Number(visualData.groups || 1),
            size: Number(visualData.size || 1),
            icon: visualData.icon || '🍎',
            showItemsInGroups: true
          }}
        />
      );
    case 'sharing': {
      const total = Number(visualData.total || 6);
      const groups = Number(visualData.groups || 3);
      const size = Math.floor(total / groups);
      return (
        <GroupsVisualizer
          data={{
            groups,
            size,
            icon: visualData.icon || '⭐',
            showItemsInGroups: false,
            total
          }}
        />
      );
    }
    case 'pictograph':
      return (
        <PictographVisualizer
          data={{
            apples: Number(visualData.apples || 3),
            bananas: Number(visualData.bananas || 3)
          }}
        />
      );
    default:
      return null;
  }
};

// ==========================================
// 1. COUNTING VISUALIZER (Grid of icons)
// ==========================================
const CountingVisualizer: React.FC<{ data: { count: number; item: string; icon?: string } }> = ({ data }) => {
  const { count, item, icon } = data;

  const renderIcon = (index: number) => {
    const size = 64;
    switch (item) {
      case 'star':
        return (
          <svg key={index} width={size} height={size} viewBox="0 0 24 24" className="counting-icon animate-bounce-slow">
            <defs>
              <linearGradient id="star-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFE066" />
                <stop offset="100%" stopColor="#F5A623" />
              </linearGradient>
            </defs>
            <path
              fill="url(#star-grad)"
              stroke="#D08700"
              strokeWidth="1.5"
              d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.787 1.4 8.168L12 18.896l-7.334 3.857 1.4-8.168L.132 9.21l8.2-1.192L12 .587z"
            />
          </svg>
        );
      case 'apple':
        return (
          <svg key={index} width={size} height={size} viewBox="0 0 24 24" className="counting-icon animate-bounce-slow">
            <defs>
              <linearGradient id="apple-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FF6B6B" />
                <stop offset="100%" stopColor="#E84A5F" />
              </linearGradient>
            </defs>
            {/* Stem & Leaf */}
            <path d="M12 2c0 2-1 3-3 3" fill="none" stroke="#8B572A" strokeWidth="2" />
            <path d="M12 2c2 1 3 0 4-2c0 2-1 3-4 2" fill="#7ED321" />
            {/* Body */}
            <path
              fill="url(#apple-grad)"
              stroke="#C0392B"
              strokeWidth="1.5"
              d="M12 5c-3 0-6 2-6 6c0 5 3 8 6 8s6-3 6-8c0-4-3-6-6-6z"
            />
            {/* Highlights */}
            <circle cx="9" cy="9" r="1.5" fill="#FFF" opacity="0.6" />
          </svg>
        );
      case 'car':
        return (
          <svg key={index} width={size} height={size} viewBox="0 0 24 24" className="counting-icon animate-bounce-slow">
            <defs>
              <linearGradient id="car-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#4A90E2" />
                <stop offset="100%" stopColor="#357ABD" />
              </linearGradient>
            </defs>
            {/* Body */}
            <path
              fill="url(#car-grad)"
              stroke="#214E75"
              strokeWidth="1.5"
              d="M2 15h20v2H2v-2zm1-5l3-4h10l3 4v5H3v-5z"
            />
            {/* Windows */}
            <path fill="#E6F2FF" d="M7 7h3v3H6l1-3zm5 0h3l1 3h-4V7z" />
            {/* Wheels */}
            <circle cx="6" cy="16" r="3" fill="#333" stroke="#FFF" strokeWidth="1" />
            <circle cx="18" cy="16" r="3" fill="#333" stroke="#FFF" strokeWidth="1" />
            <circle cx="6" cy="16" r="1" fill="#FFF" />
            <circle cx="18" cy="16" r="1" fill="#FFF" />
          </svg>
        );
      case 'dinosaur':
        return (
          <svg key={index} width={size} height={size} viewBox="0 0 24 24" className="counting-icon animate-bounce-slow">
            <defs>
              <linearGradient id="dino-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#50E3C2" />
                <stop offset="100%" stopColor="#0EAD69" />
              </linearGradient>
            </defs>
            {/* Body & Tail */}
            <path
              fill="url(#dino-grad)"
              stroke="#087043"
              strokeWidth="1.5"
              d="M3 17c3-1 6-2 8-2c4 0 5 3 6 4s2 2 4 2c-3-2-2-5-3-7c2-1 4-3 4-5c0-4-3-4-5-3c-3 0-5 2-6 4c-2-1-3-1-5 0s-3 3-3 7z"
            />
            {/* Spikes */}
            <path fill="#FF6B6B" d="M19 5l1-2l1 2M15 6l1-2l1 2M11 9l1-2l1 2" />
            {/* Eye */}
            <circle cx="20" cy="9" r="1" fill="#000" />
            {/* Legs */}
            <rect x="9" y="16" width="2" height="4" fill="#0EAD69" stroke="#087043" strokeWidth="1.5" rx="0.5" />
            <rect x="13" y="16" width="2" height="4" fill="#0EAD69" stroke="#087043" strokeWidth="1.5" rx="0.5" />
          </svg>
        );
      case 'butterfly':
        return (
          <svg key={index} width={size} height={size} viewBox="0 0 24 24" className="counting-icon animate-bounce-slow">
            <defs>
              <linearGradient id="wing-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#D35400" />
                <stop offset="100%" stopColor="#E67E22" />
              </linearGradient>
            </defs>
            {/* Left wings */}
            <path fill="url(#wing-grad)" stroke="#A04000" strokeWidth="1" d="M12 12C9 5 2 7 4 12c-2 5 5 7 8 0" />
            {/* Right wings */}
            <path fill="url(#wing-grad)" stroke="#A04000" strokeWidth="1" d="M12 12c3-7 10-5 8 0c2 5-5 7-8 0" />
            {/* Body */}
            <rect x="11.25" y="4" width="1.5" height="15" fill="#2C3E50" rx="0.75" />
            <path d="M11 4C9 2 9 1 9 1M13 4C15 2 15 1 15 1" fill="none" stroke="#2C3E50" strokeWidth="1.2" />
          </svg>
        );
      default:
        if (icon) {
          return (
            <div 
              key={index} 
              style={{ width: size, height: size, fontSize: '3.2rem' }}
              className="counting-icon animate-bounce-slow flex items-center justify-center select-none"
            >
              {icon}
            </div>
          );
        }
        return (
          <svg key={index} width={size} height={size} viewBox="0 0 24 24" className="counting-icon animate-bounce-slow">
            <defs>
              <linearGradient id="wing-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#D35400" />
                <stop offset="100%" stopColor="#E67E22" />
              </linearGradient>
            </defs>
            {/* Left wings */}
            <path fill="url(#wing-grad)" stroke="#A04000" strokeWidth="1" d="M12 12C9 5 2 7 4 12c-2 5 5 7 8 0" />
            {/* Right wings */}
            <path fill="url(#wing-grad)" stroke="#A04000" strokeWidth="1" d="M12 12c3-7 10-5 8 0c2 5-5 7-8 0" />
            {/* Body */}
            <rect x="11.25" y="4" width="1.5" height="15" fill="#2C3E50" rx="0.75" />
            <path d="M11 4C9 2 9 1 9 1M13 4C15 2 15 1 15 1" fill="none" stroke="#2C3E50" strokeWidth="1.2" />
          </svg>
        );
    }
  };

  return (
    <div className="counting-container flex flex-wrap gap-4 items-center justify-center p-4 bg-white/40 rounded-3xl border-2 border-white/60 shadow-inner max-w-lg mx-auto my-4 min-h-[120px]">
      {Array.from({ length: count }).map((_, idx) => renderIcon(idx))}
    </div>
  );
};

// ==========================================
// 2. FRACTION VISUALIZER (Pizza or Bar)
// ==========================================
const FractionVisualizer: React.FC<{ data: { numerator: number; denominator: number; shape: 'circle' | 'bar' } }> = ({ data }) => {
  const { numerator, denominator, shape } = data;
  const size = 180;
  const center = size / 2;
  const radius = size / 2 - 10;

  if (shape === 'circle') {
    // Generate slice paths
    const paths = [];
    for (let i = 0; i < denominator; i++) {
      const angleStep = 360 / denominator;
      const startAngle = i * angleStep - 90;
      const endAngle = (i + 1) * angleStep - 90;

      const radStart = (startAngle * Math.PI) / 180;
      const radEnd = (endAngle * Math.PI) / 180;

      const x1 = center + radius * Math.cos(radStart);
      const y1 = center + radius * Math.sin(radStart);
      const x2 = center + radius * Math.cos(radEnd);
      const y2 = center + radius * Math.sin(radEnd);

      const largeArc = angleStep > 180 ? 1 : 0;
      const d = `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
      const isShaded = i < numerator;

      paths.push(
        <path
          key={i}
          d={d}
          fill={isShaded ? '#8B5CF6' : '#F3F4F6'}
          stroke="#4B5563"
          strokeWidth="2"
          className="transition-all duration-300"
        />
      );
    }

    return (
      <div className="flex items-center justify-center my-4">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {paths}
          <circle cx={center} cy={center} r={radius} fill="none" stroke="#1F2937" strokeWidth="3" />
        </svg>
      </div>
    );
  } else {
    // Render horizontal bar
    const bars = [];
    const barWidth = 240;
    const barHeight = 44;
    const cellWidth = barWidth / denominator;

    for (let i = 0; i < denominator; i++) {
      const isShaded = i < numerator;
      bars.push(
        <rect
          key={i}
          x={i * cellWidth}
          y={0}
          width={cellWidth}
          height={barHeight}
          fill={isShaded ? '#8B5CF6' : '#F3F4F6'}
          stroke="#4B5563"
          strokeWidth="2.5"
        />
      );
    }

    return (
      <div className="flex items-center justify-center my-6">
        <svg width={barWidth} height={barHeight} viewBox={`0 0 ${barWidth} ${barHeight}`}>
          {bars}
        </svg>
      </div>
    );
  }
};

// ==========================================
// 3. CLOCK VISUALIZER (Analog clock)
// ==========================================
const ClockVisualizer: React.FC<{ data: { hour: number; minute: number } }> = ({ data }) => {
  const { hour, minute } = data;
  const size = 180;
  const center = size / 2;
  const radius = size / 2 - 8;

  // Calculate hand angles
  const minAngle = minute * 6; // 6 deg per minute
  const hrAngle = (hour % 12) * 30 + minute * 0.5; // 30 deg per hour, plus 0.5 deg per minute

  // Clock numbers
  const numberPositions = Array.from({ length: 12 }).map((_, idx) => {
    const num = idx + 1;
    const angle = (num * 30 - 90) * (Math.PI / 180);
    const textRadius = radius - 20;
    return {
      num,
      x: center + textRadius * Math.cos(angle),
      y: center + textRadius * Math.sin(angle) + 5, // offset vertical offset for centering
    };
  });

  return (
    <div className="flex items-center justify-center my-4">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Clock Face */}
        <circle cx={center} cy={center} r={radius} fill="#FFFFFF" stroke="#374151" strokeWidth="4" />
        
        {/* Tick Marks */}
        {Array.from({ length: 12 }).map((_, idx) => {
          const angle = idx * 30 * (Math.PI / 180);
          const x1 = center + radius * Math.cos(angle);
          const y1 = center + radius * Math.sin(angle);
          const x2 = center + (radius - 6) * Math.cos(angle);
          const y2 = center + (radius - 6) * Math.sin(angle);
          return (
            <line key={idx} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#4B5563" strokeWidth={idx % 3 === 0 ? '3.5' : '1.5'} />
          );
        })}

        {/* Clock Numbers */}
        {numberPositions.map(({ num, x, y }) => (
          <text
            key={num}
            x={x}
            y={y}
            textAnchor="middle"
            fill="#1F2937"
            fontSize="14"
            fontWeight="bold"
            fontFamily="Fredoka, sans-serif"
          >
            {num}
          </text>
        ))}

        {/* Hour Hand (Thicker, Shorter) */}
        <line
          x1={center}
          y1={center}
          x2={center + (radius - 42) * Math.cos(((hrAngle - 90) * Math.PI) / 180)}
          y2={center + (radius - 42) * Math.sin(((hrAngle - 90) * Math.PI) / 180)}
          stroke="#1F2937"
          strokeWidth="5"
          strokeLinecap="round"
        />

        {/* Minute Hand (Thinner, Longer) */}
        <line
          x1={center}
          y1={center}
          x2={center + (radius - 22) * Math.cos(((minAngle - 90) * Math.PI) / 180)}
          y2={center + (radius - 22) * Math.sin(((minAngle - 90) * Math.PI) / 180)}
          stroke="#EF4444"
          strokeWidth="3"
          strokeLinecap="round"
        />

        {/* Center pin */}
        <circle cx={center} cy={center} r="6" fill="#1F2937" />
        <circle cx={center} cy={center} r="2.5" fill="#EF4444" />
      </svg>
    </div>
  );
};

// ==========================================
// 4. SHAPES VISUALIZER (2D Shape render)
// ==========================================
const ShapesVisualizer: React.FC<{ data: { shapeName: string } }> = ({ data }) => {
  const { shapeName } = data;
  const size = 140;

  const renderShape = () => {
    switch (shapeName.toLowerCase()) {
      case 'circle':
        return (
          <circle
            cx="70"
            cy="70"
            r="50"
            fill="url(#shape-grad)"
            stroke="#0D9488"
            strokeWidth="3.5"
          />
        );
      case 'triangle':
        return (
          <polygon
            points="70,16 120,110 20,110"
            fill="url(#shape-grad)"
            stroke="#0D9488"
            strokeWidth="3.5"
          />
        );
      case 'square':
        return (
          <rect
            x="20"
            y="20"
            width="100"
            height="100"
            rx="8"
            fill="url(#shape-grad)"
            stroke="#0D9488"
            strokeWidth="3.5"
          />
        );
      case 'rectangle':
        return (
          <rect
            x="10"
            y="30"
            width="120"
            height="80"
            rx="8"
            fill="url(#shape-grad)"
            stroke="#0D9488"
            strokeWidth="3.5"
          />
        );
      case 'pentagon':
        return (
          <polygon
            points="70,14 118,48 99,105 41,105 22,48"
            fill="url(#shape-grad)"
            stroke="#0D9488"
            strokeWidth="3.5"
          />
        );
      case 'hexagon':
        return (
          <polygon
            points="70,14 114,39 114,89 70,114 26,89 26,39"
            fill="url(#shape-grad)"
            stroke="#0D9488"
            strokeWidth="3.5"
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex items-center justify-center my-4">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <linearGradient id="shape-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2DD4BF" />
            <stop offset="100%" stopColor="#0D9488" />
          </linearGradient>
        </defs>
        {renderShape()}
      </svg>
    </div>
  );
};

// ==========================================
// 5. GRID VISUALIZER (Area/Perimeter rectangle)
// ==========================================
const GridVisualizer: React.FC<{ data: { width: number; height: number; rows: number; cols: number } }> = ({ data }) => {
  const { width, height, rows, cols } = data;
  const cellSize = 30;
  const svgWidth = cols * cellSize;
  const svgHeight = rows * cellSize;

  return (
    <div className="flex items-center justify-center my-4">
      <svg width={svgWidth + 10} height={svgHeight + 10} viewBox={`0 0 ${svgWidth} ${svgHeight}`}>
        {/* Draw all background grid cells */}
        {Array.from({ length: rows }).map((_, r) =>
          Array.from({ length: cols }).map((_, c) => (
            <rect
              key={`${r}-${c}`}
              x={c * cellSize}
              y={r * cellSize}
              width={cellSize}
              height={cellSize}
              fill="#FFFFFF"
              stroke="#D1D5DB"
              strokeWidth="1"
            />
          ))
        )}

        {/* Draw shaded target area (centered in grid) */}
        <rect
          x={0}
          y={0}
          width={width * cellSize}
          height={height * cellSize}
          fill="#3B82F6"
          fillOpacity="0.4"
          stroke="#2563EB"
          strokeWidth="3"
        />
      </svg>
    </div>
  );
};

// ==========================================
// 6. GEOMETRY VISUALIZER (Triangle angles)
// ==========================================
const GeometryVisualizer: React.FC<{ data: { type: string; angle1: number; angle2: number; missingAngle: number } }> = ({ data }) => {
  const { angle1, angle2 } = data;
  const size = 180;

  // Simple hardcoded triangle coordinates fitting in 180x150
  const pA = { x: 90, y: 20 };  // Top vertex
  const pB = { x: 20, y: 130 }; // Bottom-left
  const pC = { x: 160, y: 130 };// Bottom-right

  return (
    <div className="flex items-center justify-center my-4">
      <svg width={size} height={150} viewBox={`0 0 ${size} 150`}>
        {/* Draw Triangle */}
        <polygon points={`${pA.x},${pA.y} ${pB.x},${pB.y} ${pC.x},${pC.y}`} fill="#F3F4F6" stroke="#4B5563" strokeWidth="2.5" />
        
        {/* Angle label arches */}
        {/* Bottom Left Angle label */}
        <path d={`M 35 130 A 15 15 0 0 0 31 115`} fill="none" stroke="#8B5CF6" strokeWidth="2" />
        <text x="44" y="122" fontSize="12" fill="#4C1D95" fontWeight="bold">{angle1}°</text>

        {/* Bottom Right Angle label */}
        <path d={`M 145 130 A 15 15 0 0 1 149 115`} fill="none" stroke="#8B5CF6" strokeWidth="2" />
        <text x="122" y="122" fontSize="12" fill="#4C1D95" fontWeight="bold">{angle2}°</text>

        {/* Top Angle label (Missing '?') */}
        <text x="90" y="45" fontSize="14" fill="#EF4444" fontWeight="bold" textAnchor="middle">?</text>
      </svg>
    </div>
  );
};

// ==========================================
// 7. PIE CHART VISUALIZER (Sectors)
// ==========================================
const PieChartVisualizer: React.FC<{ data: { total: number; percent: number } }> = ({ data }) => {
  const { percent } = data;
  const size = 150;
  const center = size / 2;
  const radius = size / 2 - 8;

  // Pie calculations
  const angle = (percent / 100) * 360;
  const radEnd = ((angle - 90) * Math.PI) / 180;
  const radStart = (-90 * Math.PI) / 180;

  const x1 = center + radius * Math.cos(radStart);
  const y1 = center + radius * Math.sin(radStart);
  const x2 = center + radius * Math.cos(radEnd);
  const y2 = center + radius * Math.sin(radEnd);

  const largeArc = angle > 180 ? 1 : 0;
  const d = `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;

  return (
    <div className="flex items-center justify-center my-4">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Full grey circle */}
        <circle cx={center} cy={center} r={radius} fill="#E5E7EB" stroke="#4B5563" strokeWidth="2" />
        {/* Highlighted sector */}
        <path d={d} fill="#3B82F6" stroke="#1D4ED8" strokeWidth="2" />
        {/* Percent Label */}
        <text x={center} y={center + 35} textAnchor="middle" fill="#1E40AF" fontSize="13" fontWeight="bold">
          {percent}%
        </text>
      </svg>
    </div>
  );
};

// ==========================================
// 8. NUMBER LINE VISUALIZER
// ==========================================
const NumberLineVisualizer: React.FC<{ data: { sequence: number[]; missingIndex: number } }> = ({ data }) => {
  const { sequence, missingIndex } = data;
  const width = 440;
  const height = 80;
  const startX = 30;
  const stepX = (width - 60) / (sequence.length - 1);
  const lineY = 30;

  return (
    <div className="flex items-center justify-center my-4 w-full">
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ maxWidth: '100%' }}>
        {/* Main Line */}
        <line x1={startX} y1={lineY} x2={width - startX} y2={lineY} stroke="#4B5563" strokeWidth="4" />
        
        {/* Left Arrow */}
        <polygon points={`${startX},${lineY} ${startX + 12},${lineY - 7} ${startX + 12},${lineY + 7}`} fill="#4B5563" />
        
        {/* Right Arrow */}
        <polygon points={`${width - startX},${lineY} ${width - startX - 12},${lineY - 7} ${width - startX - 12},${lineY + 7}`} fill="#4B5563" />

        {/* Ticks and values */}
        {sequence.map((val, idx) => {
          const x = startX + idx * stepX;
          const isMissing = idx === missingIndex;
          return (
            <g key={idx}>
              {/* Tick line */}
              <line x1={x} y1={lineY - 8} x2={x} y2={lineY + 8} stroke="#374151" strokeWidth="3.5" />
              
              {/* Value Text */}
              {isMissing ? (
                <rect x={x - 13} y={lineY + 14} width="26" height="26" rx="6" fill="#EF4444" />
              ) : null}
              <text
                x={x}
                y={lineY + (isMissing ? 32 : 30)}
                textAnchor="middle"
                fontSize={isMissing ? '17' : '16'}
                fontWeight="bold"
                fill={isMissing ? '#FFFFFF' : '#1F2937'}
                fontFamily="Fredoka, sans-serif"
              >
                {isMissing ? '?' : val}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

// ==========================================
// 9. EQUATION VISUALIZER (Bespoke card)
// ==========================================
const EquationVisualizer: React.FC<{ data: { left: string; right: string } }> = ({ data }) => {
  const { left, right } = data;
  return (
    <div className="flex items-center justify-center my-2 w-full">
      <div 
        className="font-fun text-3xl md:text-4xl text-slate-800 bg-purple-50/50 border-4 border-dashed border-purple-400 rounded-3xl p-6 shadow-chunky text-center"
        style={{ minWidth: '220px' }}
      >
        <span>{left} = {right}</span>
      </div>
    </div>
  );
};

// ==========================================
// 9.5 VERTICAL MATH VISUALIZER (Bentuk Lazim)
// ==========================================
const VerticalMathVisualizer: React.FC<{
  data: {
    num1: number | string;
    num2: number | string;
    op: string;
  };
}> = ({ data }) => {
  const { num1, num2, op } = data;
  const str1 = String(num1);
  const str2 = String(num2);
  const maxLen = Math.max(str1.length, str2.length);

  const pad1 = str1.padStart(maxLen, ' ');
  const pad2 = str2.padStart(maxLen, ' ');
  const opSymbol = op === '*' ? '×' : (op === '/' ? '÷' : op);

  if (opSymbol === '÷') {
    return (
      <div className="flex items-center justify-center my-4 w-full">
        <div 
          className="font-mono text-3xl text-slate-800 bg-white border-4 border-slate-800 rounded-3xl p-6 shadow-chunky leading-none inline-flex flex-col items-end"
          style={{ minWidth: '180px', letterSpacing: '4px' }}
        >
          {/* Top row: Quotient (aligned with dividend) */}
          <div className="flex justify-end w-full mb-1">
            <div className="pr-2 select-none text-slate-800">
              ?
            </div>
          </div>
          
          {/* Bottom row: Divisor, Curve, Dividend */}
          <div className="flex items-stretch w-full justify-end">
            {/* Divisor */}
            <div className="text-indigo-600 font-bold mr-2 select-none flex items-center">
              {num2}
            </div>
            {/* Curve */}
            <div className="flex items-center">
              <svg 
                className="w-3 text-slate-800 self-stretch" 
                viewBox="0 0 12 40" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="4.5" 
                strokeLinecap="round"
                preserveAspectRatio="none"
              >
                <path d="M10 2 C 2 10, 2 30, 10 38" />
              </svg>
            </div>
            {/* Dividend with top border */}
            <div 
              className="border-t-4 border-slate-800 pt-2 pl-3 pr-2 font-bold"
            >
              {num1}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center my-4 w-full">
      <div 
        className="font-mono text-3xl text-slate-800 bg-white border-4 border-slate-800 rounded-3xl p-6 shadow-chunky text-right leading-none"
        style={{ minWidth: '160px', letterSpacing: '4px' }}
      >
        <div className="pr-6">{pad1}</div>
        <div className="border-b-4 border-slate-800 pb-2 mt-1 flex justify-between">
          <span className="font-bold text-indigo-600">{opSymbol}</span>
          <span>{pad2}</span>
        </div>
        <div className="pt-2 pb-1 border-b-4 border-slate-800 text-indigo-600 font-bold pr-6">?</div>
      </div>
    </div>
  );
};


// ==========================================
// 10. NUMBER BOND VISUALIZER (Singapore Style)
// ==========================================
const NumberBondVisualizer: React.FC<{ data: { whole: string | number; part1: string | number; part2: string | number } }> = ({ data }) => {
  const { whole, part1, part2 } = data;
  const width = 240;
  const height = 180;
  return (
    <div className="flex items-center justify-center my-2">
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        {/* Connecting Lines */}
        <line x1="120" y1="55" x2="65" y2="120" stroke="#8B5CF6" strokeWidth="6" strokeLinecap="round" />
        <line x1="120" y1="55" x2="175" y2="120" stroke="#8B5CF6" strokeWidth="6" strokeLinecap="round" />

        {/* Whole Circle */}
        <circle cx="120" cy="50" r="38" fill="#FFFFFF" stroke="#8B5CF6" strokeWidth="4.5" />
        <text x="120" y="58" textAnchor="middle" fontSize="24" fontWeight="bold" fill="#1F2937" fontFamily="Fredoka, sans-serif">
          {whole}
        </text>

        {/* Part 1 Circle */}
        <circle cx="60" cy="130" r="32" fill="#FFFFFF" stroke="#3B82F6" strokeWidth="4.5" />
        <text x="60" y="137" textAnchor="middle" fontSize="20" fontWeight="bold" fill="#1D4ED8" fontFamily="Fredoka, sans-serif">
          {part1}
        </text>

        {/* Part 2 Circle */}
        <circle cx="180" cy="130" r="32" fill="#FFFFFF" stroke="#10B981" strokeWidth="4.5" />
        <text x="180" y="137" textAnchor="middle" fontSize="20" fontWeight="bold" fill="#047857" fontFamily="Fredoka, sans-serif">
          {part2}
        </text>
      </svg>
    </div>
  );
};

// ==========================================
// 11. PLACE VALUE VISUALIZER (Tens & Ones Column)
// ==========================================
const PlaceValueVisualizer: React.FC<{
  data: {
    num?: number;
    thousands?: number;
    hundreds?: number;
    tens: number;
    ones: string | number;
  };
}> = ({ data }) => {
  const { thousands, hundreds, tens, ones } = data;
  const hasThousands = thousands !== undefined;
  const hasHundreds = hundreds !== undefined;

  if (hasThousands) {
    const thousandsDigit = thousands >= 1000 ? Math.floor(thousands / 1000) : thousands;
    const hundredsDigit = hundreds !== undefined ? (hundreds >= 100 ? Math.floor(hundreds / 100) : hundreds) : 0;
    const tensDigit = tens >= 10 ? Math.floor(tens / 10) : tens;
    const width = 450;
    const height = 110;

    return (
      <div className="flex items-center justify-center my-2 w-full">
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
          {/* Background panels */}
          <rect x="12" y="12" width="102" height="86" rx="12" fill="#FAE8FF" />
          <rect x="119" y="12" width="102" height="86" rx="12" fill="#FCE7F3" />
          <rect x="226" y="12" width="102" height="86" rx="12" fill="#E0E7FF" />
          <rect x="333" y="12" width="102" height="86" rx="12" fill="#D1FAE5" />

          {/* Outer border & dividing lines */}
          <rect x="10" y="10" width="430" height="90" rx="16" fill="none" stroke="#1F2937" strokeWidth="4" />
          <line x1="116" y1="10" x2="116" y2="100" stroke="#1F2937" strokeWidth="4" />
          <line x1="223" y1="10" x2="223" y2="100" stroke="#1F2937" strokeWidth="4" />
          <line x1="330" y1="10" x2="330" y2="100" stroke="#1F2937" strokeWidth="4" />

          {/* Labels */}
          <text x="63" y="34" textAnchor="middle" fontSize="9.5" fontWeight="bold" fill="#701A75" fontFamily="Fredoka, sans-serif">
            THOUSANDS / RIBU
          </text>
          <text x="170" y="34" textAnchor="middle" fontSize="9.5" fontWeight="bold" fill="#9D174D" fontFamily="Fredoka, sans-serif">
            HUNDREDS / RATUS
          </text>
          <text x="277" y="34" textAnchor="middle" fontSize="9.5" fontWeight="bold" fill="#3730A3" fontFamily="Fredoka, sans-serif">
            TENS / PULUH
          </text>
          <text x="384" y="34" textAnchor="middle" fontSize="9.5" fontWeight="bold" fill="#065F46" fontFamily="Fredoka, sans-serif">
            ONES / SA
          </text>

          {/* Values */}
          <text x="63" y="78" textAnchor="middle" fontSize="36" fontWeight="bold" fill="#701A75" fontFamily="Fredoka, sans-serif">
            {thousandsDigit}
          </text>
          <text x="170" y="78" textAnchor="middle" fontSize="36" fontWeight="bold" fill="#9D174D" fontFamily="Fredoka, sans-serif">
            {hundredsDigit}
          </text>
          <text x="277" y="78" textAnchor="middle" fontSize="36" fontWeight="bold" fill="#3730A3" fontFamily="Fredoka, sans-serif">
            {tensDigit}
          </text>
          <text x="384" y="78" textAnchor="middle" fontSize="36" fontWeight="bold" fill="#065F46" fontFamily="Fredoka, sans-serif">
            {ones}
          </text>
        </svg>
      </div>
    );
  } else if (hasHundreds) {
    const hundredsDigit = hundreds >= 100 ? Math.floor(hundreds / 100) : hundreds;
    const tensDigit = tens >= 10 ? Math.floor(tens / 10) : tens;
    const width = 340;
    const height = 110;

    return (
      <div className="flex items-center justify-center my-2 w-full">
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
          {/* Background panels */}
          <rect x="12" y="12" width="102" height="86" rx="12" fill="#F5F3FF" />
          <rect x="119" y="12" width="102" height="86" rx="12" fill="#EEF2FF" />
          <rect x="226" y="12" width="102" height="86" rx="12" fill="#ECFDF5" />

          {/* Outer border & dividing lines */}
          <rect x="10" y="10" width="320" height="90" rx="16" fill="none" stroke="#1F2937" strokeWidth="4" />
          <line x1="116" y1="10" x2="116" y2="100" stroke="#1F2937" strokeWidth="4" />
          <line x1="223" y1="10" x2="223" y2="100" stroke="#1F2937" strokeWidth="4" />

          {/* Labels */}
          <text x="63" y="34" textAnchor="middle" fontSize="9.5" fontWeight="bold" fill="#7C3AED" fontFamily="Fredoka, sans-serif">
            HUNDREDS / RATUS
          </text>
          <text x="170" y="34" textAnchor="middle" fontSize="9.5" fontWeight="bold" fill="#4F46E5" fontFamily="Fredoka, sans-serif">
            TENS / PULUH
          </text>
          <text x="277" y="34" textAnchor="middle" fontSize="9.5" fontWeight="bold" fill="#059669" fontFamily="Fredoka, sans-serif">
            ONES / SA
          </text>

          {/* Values */}
          <text x="63" y="78" textAnchor="middle" fontSize="36" fontWeight="bold" fill="#5B21B6" fontFamily="Fredoka, sans-serif">
            {hundredsDigit}
          </text>
          <text x="170" y="78" textAnchor="middle" fontSize="36" fontWeight="bold" fill="#312E81" fontFamily="Fredoka, sans-serif">
            {tensDigit}
          </text>
          <text x="277" y="78" textAnchor="middle" fontSize="36" fontWeight="bold" fill="#064E3B" fontFamily="Fredoka, sans-serif">
            {ones}
          </text>
        </svg>
      </div>
    );
  } else {
    const tensDigit = tens >= 10 ? Math.floor(tens / 10) : tens;
    const width = 240;
    const height = 110;

    return (
      <div className="flex items-center justify-center my-2 w-full">
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
          {/* Background panels */}
          <rect x="12" y="12" width="106" height="86" rx="12" fill="#EEF2FF" />
          <rect x="122" y="12" width="106" height="86" rx="12" fill="#ECFDF5" />

          {/* Outer border & dividing line */}
          <rect x="10" y="10" width="220" height="90" rx="16" fill="none" stroke="#1F2937" strokeWidth="4" />
          <line x1="120" y1="10" x2="120" y2="100" stroke="#1F2937" strokeWidth="4" />

          {/* Labels */}
          <text x="65" y="34" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#4F46E5" fontFamily="Fredoka, sans-serif">
            TENS / PULUH
          </text>
          <text x="175" y="34" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#059669" fontFamily="Fredoka, sans-serif">
            ONES / SA
          </text>

          {/* Values */}
          <text x="65" y="78" textAnchor="middle" fontSize="36" fontWeight="bold" fill="#312E81" fontFamily="Fredoka, sans-serif">
            {tensDigit}
          </text>
          <text x="175" y="78" textAnchor="middle" fontSize="36" fontWeight="bold" fill="#064E3B" fontFamily="Fredoka, sans-serif">
            {ones}
          </text>
        </svg>
      </div>
    );
  }
};

// ==========================================
// 12. GROUPS & SHARING VISUALIZER
// ==========================================
const GroupsVisualizer: React.FC<{
  data: {
    groups: number;
    size: number;
    icon: string;
    showItemsInGroups?: boolean;
    total?: number;
  };
}> = ({ data }) => {
  const { groups, size, icon, showItemsInGroups = true, total = 0 } = data;

  if (showItemsInGroups) {
    // Render items inside groups (for Repeated Addition / Groups)
    return (
      <div className="groups-container">
        {Array.from({ length: groups }).map((_, gIdx) => (
          <div key={gIdx} className="group-box">
            {Array.from({ length: size }).map((_, iIdx) => (
              <span key={iIdx} className="group-item-icon">{icon}</span>
            ))}
          </div>
        ))}
      </div>
    );
  } else {
    // Render items outside and empty boxes below (for Sharing Equally)
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', margin: '12px 0', width: '100%' }}>
        {/* Total Items Pile */}
        <div 
          style={{
            border: '2.5px dashed #9CA3AF',
            borderRadius: '16px',
            backgroundColor: '#F9FAFB',
            padding: '10px 20px',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
            justifyContent: 'center',
            alignItems: 'center',
            maxWidth: '90%',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06)'
          }}
        >
          {Array.from({ length: total }).map((_, idx) => (
            <span key={idx} className="group-item-icon">{icon}</span>
          ))}
        </div>

        {/* Empty Target Boxes */}
        <div className="groups-container" style={{ margin: 0 }}>
          {Array.from({ length: groups }).map((_, gIdx) => (
            <div key={gIdx} className="group-box empty">
              {/* Empty box! */}
            </div>
          ))}
        </div>
      </div>
    );
  }
};

// ==========================================
// 13. PICTOGRAPH VISUALIZER
// ==========================================
const PictographVisualizer: React.FC<{ data: { apples: number; bananas: number } }> = ({ data }) => {
  const { apples, bananas } = data;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', maxWidth: '280px', margin: '12px auto' }}>
      {/* Apples Row */}
      <div 
        style={{
          border: '3px solid #EF4444',
          borderRadius: '16px',
          backgroundColor: '#FEF2F2',
          padding: '8px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 4px 0 #EF4444'
        }}
      >
        <span style={{ fontWeight: 'bold', color: '#B91C1C', fontFamily: 'Fredoka, sans-serif' }}>🍎 Apples / Epal</span>
        <div style={{ display: 'flex', gap: '4px' }}>
          {Array.from({ length: apples }).map((_, idx) => (
            <span key={idx} style={{ fontSize: '1.6rem' }}>🍎</span>
          ))}
        </div>
      </div>

      {/* Bananas Row */}
      <div 
        style={{
          border: '3px solid #F59E0B',
          borderRadius: '16px',
          backgroundColor: '#FEF3C7',
          padding: '8px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 4px 0 #F59E0B'
        }}
      >
        <span style={{ fontWeight: 'bold', color: '#B45309', fontFamily: 'Fredoka, sans-serif' }}>🍌 Bananas / Pisang</span>
        <div style={{ display: 'flex', gap: '4px' }}>
          {Array.from({ length: bananas }).map((_, idx) => (
            <span key={idx} style={{ fontSize: '1.6rem' }}>🍌</span>
          ))}
        </div>
      </div>
    </div>
  );
};
