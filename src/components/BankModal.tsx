import { useState } from 'react'  // 添加此行导入

interface BankModalProps {
  show: boolean
  balance: number
  cash: number
  onClose: () => void
  onDeposit: (amount: number) => void
  onWithdraw: (amount: number) => void
}

const BankModal = ({
  show,
  balance,
  cash,
  onClose,
  onDeposit,
  onWithdraw
}: BankModalProps) => {
  const [amount, setAmount] = useState('')  // 现在有正确导入的useState

  if (!show) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-deep-space p-6 rounded-xl w-96">
        <h2 className="text-2xl font-bold mb-4">銀行操作</h2>
        
        <div className="space-y-4 mb-6">
          <div className="flex justify-between">
            <span>現金：</span>
            <span>${cash}</span>
          </div>
          <div className="flex justify-between">
            <span>存款餘額：</span>
            <span>${balance}</span>
          </div>
        </div>

        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="input-field mb-4"
          placeholder="輸入金額"
        />

        <div className="grid grid-cols-2 gap-4">
          <button
            className="btn-primary"
            onClick={() => {
              onDeposit(Number(amount))
              setAmount('')
            }}
            disabled={!amount || Number(amount) > cash}
          >
            存入
          </button>
          <button
            className="btn-primary"
            onClick={() => {
              onWithdraw(Number(amount))
              setAmount('')
            }}
            disabled={!amount || Number(amount) > balance}
          >
            取出
          </button>
        </div>

        <button
          className="btn-secondary w-full mt-4"
          onClick={onClose}
        >
          關閉
        </button>
      </div>
    </div>
  )
}

export default BankModal