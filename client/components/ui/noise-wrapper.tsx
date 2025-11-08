import { cn } from '@/lib/utils'
import React from 'react'

const NoiseWrapper = (
    {
        children,
        opacity = 0.15,
        className

    }: {
        children: React.ReactNode,
        opacity?: number,
        className?: string
    }
) => {
  return (
    <div className={cn('relative overflow-hidden', className)}>
        <svg
          className={cn("pointer-events-none absolute inset-0 isolate z-50 size-full")}
          width="100%"
          height="100%"
          style={{ opacity }}
        >
          <filter id="noise">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.9"
              numOctaves="1"
              stitchTiles="stitch"
            />
          </filter>
          <rect width="100%" height="100%" filter="url(#noise)" />
        </svg>
        {children}
    </div>
  )
}

export default NoiseWrapper