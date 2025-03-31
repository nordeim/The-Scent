import { useEffect, useRef } from 'react';

interface ScentProfile {
  id: number;
  name: string;
  intensity: number;
  position?: {
    top: number;
    left: number;
  };
}

interface ScentProfileChartProps {
  profiles: ScentProfile[];
}

export function ScentProfileChart({ profiles }: ScentProfileChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Make sure chart is rendered before adding tooltips
    if (chartRef.current) {
      const tooltipElements = chartRef.current.querySelectorAll('.scent-profile-marker');
      
      tooltipElements.forEach(element => {
        element.addEventListener('mouseenter', (e) => {
          const target = e.currentTarget as HTMLElement;
          const tooltipText = target.getAttribute('data-tooltip');
          
          // Create tooltip element
          const tooltip = document.createElement('div');
          tooltip.classList.add('absolute', 'z-50', 'bg-primary', 'text-white', 'px-2', 'py-1', 'text-xs', 'rounded', 'pointer-events-none');
          tooltip.innerText = tooltipText || '';
          
          // Position tooltip above the marker
          tooltip.style.bottom = '100%';
          tooltip.style.left = '50%';
          tooltip.style.transform = 'translateX(-50%) translateY(-5px)';
          target.appendChild(tooltip);
        });
        
        element.addEventListener('mouseleave', (e) => {
          const target = e.currentTarget as HTMLElement;
          const tooltip = target.querySelector('div');
          if (tooltip) {
            tooltip.remove();
          }
        });
      });
    }
  }, [profiles]);

  return (
    <div className="mb-8">
      <h3 className="text-xl font-heading mb-4">Scent Profile</h3>
      <div ref={chartRef} className="relative h-60 bg-neutral-light rounded-lg border border-secondary p-4">
        {/* Axes */}
        <div className="absolute top-1/2 left-0 right-0 border-t border-neutral-mid/30 transform -translate-y-1/2"></div>
        <div className="absolute bottom-0 top-0 left-1/2 border-l border-neutral-mid/30 transform -translate-x-1/2"></div>
        
        {/* Quadrant Labels */}
        <div className="absolute top-2 left-2 text-xs text-neutral-mid">Floral</div>
        <div className="absolute top-2 right-2 text-xs text-neutral-mid">Citrus</div>
        <div className="absolute bottom-2 right-2 text-xs text-neutral-mid">Spicy</div>
        <div className="absolute bottom-2 left-2 text-xs text-neutral-mid">Woody</div>
        
        {/* Scent Markers */}
        {profiles.map((profile) => (
          <div 
            key={profile.id}
            className="scent-profile-marker"
            style={{
              top: profile.position ? `${profile.position.top}%` : '50%',
              left: profile.position ? `${profile.position.left}%` : '50%',
              width: `${15 + (profile.intensity * 1)}px`,
              height: `${15 + (profile.intensity * 1)}px`,
              backgroundColor: 'var(--accent)',
            }}
            data-tooltip={`${profile.name} (${profile.intensity}/10)`}
          ></div>
        ))}
      </div>
    </div>
  );
}
