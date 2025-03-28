// File: src/components/Card.tsx
import React from 'react'

interface CardProps {
  id: string
  name: string
  type: string
  price: number
  cost: number
  effect: string
  actionLabel: string
  onAction: () => void
  disabled?: boolean
  testId?: string
}

const Card = ({
  name,
  effect,
  actionLabel,
  onAction,
  disabled,
  testId
}: CardProps) => {
  return (
    <div
      className="card bg-deep-space/80 p-4 rounded-lg border-2 border-magic-purple/30 transition-all"
      data-testid={testId}
    >
      <h3 className="text-lg font-bold text-fire-orange mb-2">{name}</h3>
      <p className="text-sm text-text-light/80 mb-4">{effect}</p>
      <button
        className={`btn-primary w-full ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={onAction}
        disabled={disabled}
      >
        {actionLabel}
      </button>
    </div>
  )
}

export default Card