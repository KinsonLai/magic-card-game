import React from 'react'
import { useSelector } from 'react-redux'
import type { RootState } from '../store/store'
import NationSelect from '../player/components/NationSelect'
import Loading from '../../components/core/Loading'
import StatusPanel from '../../components/StatusPanel'
import {
  HeartIcon,
  SparklesIcon,
  CurrencyDollarIcon,
  CubeIcon
} from '@heroicons/react/24/solid'

const GameLayout = () => {
  const { nation, life, mana, money } = useSelector((state: RootState) => state.player)
  const isLoading = useSelector((state: RootState) => state.game.isLoading)

  return (
    <div className="game-container min-h-screen p-8">
      {isLoading && <Loading />}
      
      {!nation ? (
        <NationSelect />
      ) : (
        <div className="game-main max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8 text-purple-300">
            歡迎來到 {nation} 的國度！
          </h1>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
            <StatusPanel
              icon={<HeartIcon />}
              value={life}
              label="生命值"
              color="red-400"
            />
            <StatusPanel
              icon={<SparklesIcon />}
              value={mana}
              label="魔力值"
              color="blue-400"
            />
            <StatusPanel
              icon={<CurrencyDollarIcon />}
              value={money}
              label="持有金幣"
              color="green-400"
            />
            <StatusPanel
              icon={<CubeIcon />}
              value={12}
              label="卡牌容量"
              color="purple-400"
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default GameLayout