// src/components/StatusPanel.tsx
import React from 'react'
import { useSelector } from 'react-redux'
import type { RootState } from '../features/store/store'
import {
  HeartIcon,
  SparklesIcon,
  CurrencyDollarIcon,
  CubeIcon
} from '@heroicons/react/24/solid'

// 扩展图标组件props类型
interface IconProps {
  className?: string
}

interface StatusPanelProps {
  icon: React.ReactElement<IconProps> // 明确要求className属性
  value: number
  label: string
  color: string
}

const StatusPanel = ({ icon, value, label, color }: StatusPanelProps) => {
  const isLoading = useSelector((state: RootState) => state.game.isLoading)

  return (
    <div className={`p-4 rounded-xl bg-gray-800/50 backdrop-blur-sm border-l-4 border-${color} 
      transition-all ${isLoading ? 'animate-pulse' : ''}`}>
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-lg bg-${color}/10`}>
          {React.cloneElement(icon, { 
            className: `w-6 h-6 text-${color} ${isLoading ? 'opacity-50' : ''}`
          } as React.HTMLAttributes<SVGElement>)} {/* 添加类型断言 */}
        </div>
        {/* ...其余代码保持不变 */}
      </div>
    </div>
  )
}

export default StatusPanel