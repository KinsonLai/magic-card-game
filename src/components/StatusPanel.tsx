import React from 'react'
import { useAppSelector } from '../features/store/store'
import {
  HeartIcon,
  SparklesIcon,
  CurrencyDollarIcon,
  CubeIcon
} from '@heroicons/react/24/solid'

interface IconProps extends React.ComponentPropsWithoutRef<'svg'> {
  className?: string
}

interface StatusPanelProps {
  icon: React.ReactElement<IconProps>
  value: number
  label: string
  color: `text-${string}-${number}` | `#${string}`
}

const StatusPanel = ({ icon, value, label, color }: StatusPanelProps) => {
  const isLoading = useAppSelector((state) => state.game.isLoading)

  return (
    <div className={`p-4 rounded-xl bg-gray-800/50 border-l-4 ${color.startsWith('#') 
      ? `border-[${color}]` 
      : `border-${color}`} transition-colors`}
    >
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-lg ${color.startsWith('#') 
          ? `bg-[${color}]/10` 
          : `bg-${color.split('-')[1]}-400/10`}`}
        >
          {React.cloneElement(icon, { 
            className: `w-6 h-6 ${color} ${isLoading ? 'animate-pulse' : ''}`,
            'aria-hidden': true
          } as React.HTMLAttributes<SVGSVGElement>)}
        </div>
        <div>
          <div className={`text-2xl font-bold ${color}`}>
            {isLoading ? '--' : value}
          </div>
          <div className="text-sm text-gray-300">
            {label}
          </div>
        </div>
      </div>
    </div>
  )
}

export default StatusPanel