import { useEffect } from 'react'
import { useAppSelector, useAppDispatch } from '../store/store'
import { 
  setLoading,
  drawCard, 
  playCard, 
  purchaseCard,
  depositMoney,
  withdrawMoney,
  refreshShop,
  nextTurn
} from './gameSlice'
import { updateResources } from '../player/playerSlice'
import StatusPanel from '../../components/StatusPanel'
import NationSelect from '../player/components/NationSelect'
import Card from '../../components/Card'
import BankModal from '../../components/BankModal'
import {
  HeartIcon,
  SparklesIcon,
  CurrencyDollarIcon,
  ShoppingCartIcon,
  BriefcaseIcon,
  BanknotesIcon
} from '@heroicons/react/24/solid'
import { useState } from 'react'


// 确保使用默认导出
const GameLayout = () => {
  const dispatch = useAppDispatch()
  const { nation, life, mana, money, income } = useAppSelector(state => state.player)
  const { turnCount, shopCards, handCards, bankBalance, deckCount } = useAppSelector(state => state.game)
  const [showBank, setShowBank] = useState(false)

  useEffect(() => {
    dispatch(setLoading(false)); // 确保使用正确命名的action
    dispatch(refreshShop());
  }, [dispatch]);

  const handlePlayCard = (cardId: string) => {
    const card = handCards.find(c => c.id === cardId)
    if (card && mana >= card.cost) {
      dispatch(playCard(cardId))
      switch(card.type) {
        case 'property':
          dispatch(updateResources({ income: income + card.price }))
          break
        case 'attack':
          dispatch(updateResources({ mana: mana - card.cost }))
          break
        case 'defense':
          dispatch(updateResources({ 
            mana: mana - card.cost,
            life: life + 5 
          }))
          break
      }
    }
  }

  return (
    <div className="game-container min-h-screen p-8" data-testid="game-container">
      {!nation ? (
        <div className="nation-selection">
          <NationSelect />
        </div>
      ) : (
        <div className="main-interface grid grid-cols-1 md:grid-cols-2 gap-6" data-testid="main-interface">
          
          {/* 标题和状态区域 */}
          <div className="col-span-full space-y-6">
            <h1 className="text-4xl font-bold text-magic-purple">
              歡迎來到 {nation} 的國度！ 第 {turnCount} 回合
            </h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatusPanel
                icon={<HeartIcon />}
                value={life}
                label="生命值"
                color="text-red-400"
                testId="status-panel-life"
              />
              <StatusPanel
                icon={<SparklesIcon />}
                value={mana}
                label="魔力值"
                color="text-blue-400"
                testId="status-panel-mana"
              />
              <StatusPanel
                icon={<CurrencyDollarIcon />}
                value={money}
                label="現金"
                color="text-green-400"
                testId="status-panel-money"
              />
            </div>
          </div>

          {/* 游戏内容区域 */}
          <div className="space-y-6">
            {/* 商店模块 */}
            <div className="bg-deep-space/50 p-6 rounded-xl">
              <div className="flex items-center gap-2 mb-4">
                <ShoppingCartIcon className="w-6 h-6 text-fire-orange" />
                <h2 className="text-2xl font-bold text-fire-orange">魔法商店</h2>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {shopCards.map(card => (
                  <Card 
                    key={card.id}
                    {...card}
                    actionLabel={`購買 ($${card.price})`}
                    onAction={() => dispatch(purchaseCard(card.id))}
                    disabled={money < card.price}
                  />
                ))}
              </div>
            </div>

            {/* 背包模块 */}
            <div className="bg-deep-space/50 p-6 rounded-xl">
              <div className="flex items-center gap-2 mb-4">
                <BriefcaseIcon className="w-6 h-6 text-nature-green" />
                <h2 className="text-2xl font-bold text-nature-green">魔法背包（{handCards.length}/12）</h2>
              </div>
              
              <div className="grid grid-cols-4 gap-2">
                {handCards.map(card => (
                  <Card
                    key={card.id}
                    {...card}
                    actionLabel="使用"
                    onAction={() => handlePlayCard(card.id)}
                    disabled={mana < card.cost}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* 操作面板区域 */}
          <div className="space-y-6">
            {/* 银行模块 */}
            <div className="bg-deep-space/50 p-6 rounded-xl">
              <div className="flex items-center gap-2 mb-4">
                <BanknotesIcon className="w-6 h-6 text-magic-purple" />
                <h2 className="text-2xl font-bold text-magic-purple">王國銀行</h2>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <button 
                  className="btn-primary"
                  onClick={() => setShowBank(true)}
                >
                  存取款操作
                </button>
                <div className="text-center p-4 bg-gray-800/50 rounded-lg">
                  存款餘額：${bankBalance}
                </div>
              </div>
            </div>

            {/* 回合操作 */}
            <div className="bg-deep-space/50 p-6 rounded-xl space-y-4">
              <button 
                className="btn-primary w-full"
                onClick={() => dispatch(nextTurn())}
              >
                結束回合
              </button>
              
              <div className="grid grid-cols-2 gap-4">
                <button
                  className="btn-secondary"
                  onClick={() => dispatch(drawCard())}
                  disabled={handCards.length >= 12}
                >
                  抽卡（剩餘：{deckCount}）
                </button>
                <button
                  className="btn-secondary"
                  onClick={() => dispatch(refreshShop())}
                >
                  刷新商店
                </button>
              </div>
            </div>
          </div>

          {/* 银行操作模态框 */}
          <BankModal
            show={showBank}
            onClose={() => setShowBank(false)}
            onDeposit={(amount) => dispatch(depositMoney(amount))}
            onWithdraw={(amount) => dispatch(withdrawMoney(amount))}
            balance={bankBalance}
            cash={money}
          />
        </div>
      )}
    </div>
  )
}

export default GameLayout