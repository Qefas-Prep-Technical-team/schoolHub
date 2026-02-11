import * as React from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string
  alt?: string
  size?: 'sm' | 'md' | 'lg'
  fallback?: string
}

const sizeClasses = {
  sm: 'w-6 h-6',
  md: 'w-10 h-10',
  lg: 'w-16 h-16',
}

export function Avatar({ 
  src, 
  alt, 
  size = 'md', 
  fallback,
  className,
  ...props 
}: AvatarProps) {
  const [error, setError] = React.useState(false)

  if (!src || error) {
    return (
      <div
        className={cn(
          'rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white',
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {fallback ? (
          <span className="text-sm font-medium">
            {fallback.charAt(0).toUpperCase()}
          </span>
        ) : null}
      </div>
    )
  }

  return (
    <div className={cn('relative rounded-full overflow-hidden', sizeClasses[size], className)} {...props}>
      <Image
        src={src}
        alt={alt || 'Avatar'}
        fill
        className="object-cover"
        sizes={size === 'sm' ? '24px' : size === 'md' ? '40px' : '64px'}
        onError={() => setError(true)}
      />
    </div>
  )
}