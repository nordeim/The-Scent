interface RatingProps {
  value: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  showCount?: boolean;
  count?: number;
  className?: string;
}

export function Rating({
  value,
  max = 5,
  size = "md",
  showCount = false,
  count = 0,
  className = "",
}: RatingProps) {
  // Calculate the filled stars and half stars
  const filledStars = Math.floor(value);
  const hasHalfStar = value - filledStars >= 0.5;
  
  // Determine star size based on prop
  let starClass = "text-xs";
  if (size === "md") starClass = "text-sm";
  if (size === "lg") starClass = "text-base";
  
  return (
    <div className={`flex items-center ${className}`}>
      <div className="flex">
        {Array.from({ length: max }).map((_, i) => {
          if (i < filledStars) {
            // Filled star
            return (
              <i key={i} className={`fas fa-star text-accent ${starClass}`}></i>
            );
          } else if (i === filledStars && hasHalfStar) {
            // Half star
            return (
              <i key={i} className={`fas fa-star-half-alt text-accent ${starClass}`}></i>
            );
          } else {
            // Empty star
            return (
              <i key={i} className={`far fa-star text-accent ${starClass}`}></i>
            );
          }
        })}
      </div>
      
      {showCount && (
        <span className="text-xs text-neutral-mid ml-2">({count} reviews)</span>
      )}
    </div>
  );
}
