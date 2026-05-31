import React from 'react'
import { Star } from 'lucide-react'

interface RatingsProps {
  rating?: number
  count?: number
  interactive?: boolean
  onRate?: (rating: number) => void
  size?: 'sm' | 'md' | 'lg'
}

export default function Ratings({
  rating = 4.5,
  count = 0,
  interactive = false,
  onRate,
  size = 'md'
}: RatingsProps) {
  const [hoverRating, setHoverRating] = React.useState(0)

  const sizeMap = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }

  const renderStars = () => {
    const stars = []
    const displayRating = interactive ? hoverRating || rating : rating

    for (let i = 1; i <= 5; i++) {
      const diff = displayRating - i
      let fillPercentage = 0

      if (diff >= 0) {
        fillPercentage = 100
      } else if (diff > -1) {
        fillPercentage = (diff + 1) * 100
      }

      stars.push(
        <div
          key={i}
          className="relative"
          onMouseEnter={() => interactive && setHoverRating(i)}
          onMouseLeave={() => interactive && setHoverRating(0)}
          onClick={() => interactive && onRate?.(i)}
          style={{
            cursor: interactive ? 'pointer' : 'default'
          }}
        >
          <Star className={`${sizeMap[size]} text-gray-300 transition-colors`} />
          <div
            className="absolute top-0 left-0 overflow-hidden transition-all"
            style={{ width: `${fillPercentage}%` }}
          >
            <Star
              className={`${sizeMap[size]} text-yellow-400 fill-yellow-400`}
              fill="currentColor"
            />
          </div>
        </div>
      )
    }
    return stars
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1">
        {renderStars()}
      </div>
      <span className="text-sm text-gray-600">
        {rating.toFixed(1)}
        {count > 0 && <span className="text-xs ml-1">({count})</span>}
      </span>
    </div>
  )
}
