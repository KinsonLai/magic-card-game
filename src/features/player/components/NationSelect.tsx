import { useDispatch } from 'react-redux'
import { selectNation } from '../playerSlice'
import type { Nation } from '../playerSlice' // 明確導入類型

const nations: {
  id: Nation  // 使用已定義的Nation類型
  name: string
  effect: string
}[] = [
  { id: 'warrior', name: '鬥士之國', effect: '生命+20% 攻擊強化' },
  { id: 'magic', name: '魔法之國', effect: '魔力上限+60%' },
  { id: 'merchant', name: '商業之國', effect: '初始收入+50' },
  { id: 'holy', name: '神聖之國', effect: '每回合魔力全恢復' }
]

export default function NationSelect() {
  const dispatch = useDispatch()

  return (
    <div className="nation-select" data-testid="nation-select">
      <h2>選擇你的國家</h2>
      <div className="nation-grid">
        {nations.map((nation) => (
          <button
            key={nation.id}
            onClick={() => dispatch(selectNation(nation.id))} // 移除不必要的類型斷言
            data-testid={`nation-${nation.id}`}
          >
            <h3>{nation.name}</h3>
            <p>{nation.effect}</p>
          </button>
        ))}
      </div>
    </div>
  )
}