// src/features/player/components/NationSelect.tsx
import { useDispatch, useSelector } from 'react-redux'
import { selectNation } from '../playerSlice'
import type { Nation } from '../playerSlice'
import { RootState } from '../../../features/store/store'

const nations = [
  { id: 'warrior', name: '鬥士之國', effect: '生命+20% 攻擊強化' },
  { id: 'magic', name: '魔法之國', effect: '魔力上限+60%' },
  { id: 'merchant', name: '商業之國', effect: '初始收入+50' },
  { id: 'holy', name: '神聖之國', effect: '每回合魔力全恢復' }
] as const

export default function NationSelect() {
  const dispatch = useDispatch()
  const selectedNation = useSelector((state: RootState) => state.player.nation)

  return (
    <div className="nation-select max-w-4xl mx-auto p-6">
      <h2 className="text-3xl font-bold text-magic-purple mb-8 text-center">
        選擇你的魔法陣營
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {nations.map((nation) => (
          <button
            key={nation.id}
            onClick={() => dispatch(selectNation(nation.id))}
            data-testid={`nation-${nation.id}`}
            className={`nation-card relative p-6 rounded-xl transition-all duration-300 
              border-2 ${
                selectedNation === nation.id
                  ? 'border-magic-purple bg-magic-purple/10 shadow-lg'
                  : 'border-transparent hover:border-nature-green/50 bg-deep-space/30'
              }`}
          >
            {selectedNation === nation.id && (
              <div className="absolute top-2 right-2 w-6 h-6 bg-nature-green rounded-full 
                flex items-center justify-center text-deep-space font-bold">
                ✓
              </div>
            )}
            <h3 className="text-xl font-bold text-fire-orange mb-2">
              {nation.name}
            </h3>
            <p className="text-sm text-text-light/80">{nation.effect}</p>
          </button>
        ))}
      </div>
    </div>
  )
}