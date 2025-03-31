import random
from app.models.user import User

class PlayerState:
    """玩家遊戲狀態類"""
    def __init__(self, user_id):
        self.user_id = user_id
        self.username = User.query.get(user_id).username
        self.nation = None  # 選擇的國家
        self.max_life = 100  # 最大生命值
        self.life = 100  # 當前生命值
        self.max_mana = 100  # 最大魔力值
        self.mana = 100  # 當前魔力值
        self.money_bank = 100  # 銀行存款
        self.money_cash = 100  # 現金
        self.income = 10  # 每回合收入
        self.backpack = []  # 背包，存儲卡牌
        self.land = []  # 土地，存放產業卡
        self.max_backpack = 12  # 背包最大容量
        self.max_land = 10  # 土地最大容量
        self.debuffs = []  # 減益列表
        self.buffs = []  # 增益列表
        self.played_cards = []  # 本回合已打出的卡牌類型
        
    def set_nation(self, nation):
        """設置國家並應用相應的初始效果"""
        self.nation = nation
        
        # 應用國家特殊效果
        if nation == 'fighter':  # 鬥士之國
            self.max_life = 120
            self.life = 120
        elif nation == 'holy':  # 神聖之國
            pass  # 特殊效果在使用魔力時觸發
        elif nation == 'merchant':  # 商業之國
            self.income = 15
        elif nation == 'magic':  # 魔法之國
            self.max_mana = 120
            self.mana = 120
    
    def calculate_income(self):
        """計算總收入（基礎收入 + 產業收入）"""
        industry_income = sum(card.effect['income'] for card in self.land if card.type == 'industry')
        
        # 商業之國增益
        if self.nation == 'merchant':
            industry_income = int(industry_income * 1.2)  # 增加20%產業收入
            
        return self.income + industry_income
    
    def recover_mana(self, recovery_rate_multiplier=1.0):
        """回合開始恢復魔力"""
        # 檢查魔力病減益
        has_mana_sickness = any(debuff['type'] == 'mana_sickness' for debuff in self.debuffs)
        
        recovery_rate = 0.5 if has_mana_sickness else 1.0
        # 應用自定義魔力回復率乘數
        recovery_rate *= recovery_rate_multiplier
        recovery_amount = int(self.max_mana * 0.2 * recovery_rate)  # 恢復最大魔力的20%
        
        self.mana = min(self.max_mana, self.mana + recovery_amount)
    
    def gain_income(self):
        """獲得收入"""
        total_income = self.calculate_income()
        self.money_cash += total_income
        return total_income
    
    def apply_debuffs(self):
        """應用減益效果"""
        damage = 0
        money_loss = 0
        
        for debuff in self.debuffs[:]:
            # 瘟疫：有機率造成生命損失
            if debuff['type'] == 'plague':
                if random.random() < 0.3:  # 30%機率
                    damage = int(self.max_life * 0.05)  # 扣除最大生命的5%
                    self.life = max(0, self.life - damage)
            
            # 投資失利：每回合損失金錢
            elif debuff['type'] == 'investment_failure':
                money_loss = int(self.money_cash * 0.1)  # 損失現金的10%
                self.money_cash = max(0, self.money_cash - money_loss)
            
            # 減少剩餘回合數
            debuff['turns'] -= 1
            if debuff['turns'] <= 0:
                self.debuffs.remove(debuff)
        
        # 神聖之國特殊效果：魔力滿時可消除減益
        if self.nation == 'holy' and self.mana == self.max_mana and self.debuffs:
            self.mana = 0  # 消耗全部魔力
            self.debuffs.pop(0)  # 移除一個減益
            # 隨機獲得一個增益
            buff_types = ['strength', 'protection', 'wealth']
            self.buffs.append({
                'type': random.choice(buff_types),
                'turns': 3
            })
        
        return damage, money_loss
    
    def deposit(self, amount):
        """存款到銀行"""
        if amount <= 0 or amount > self.money_cash:
            return False
        
        self.money_cash -= amount
        self.money_bank += amount
        return True
    
    def withdraw(self, amount):
        """從銀行提款"""
        if amount <= 0 or amount > self.money_bank:
            return False
        
        self.money_bank -= amount
        self.money_cash += amount
        return True
    
    def add_card_to_backpack(self, card):
        """添加卡片到背包"""
        if len(self.backpack) >= self.max_backpack:
            return False
        
        self.backpack.append(card)
        return True
    
    def play_card(self, card_index, target=None, land_index=None):
        """打出卡片"""
        if card_index < 0 or card_index >= len(self.backpack):
            return False
        
        card = self.backpack[card_index]
        
        # 檢查是否已經打出同類型的卡
        if card.type in self.played_cards:
            return False
        
        # 處理不同類型的卡
        success = False
        
        # 產業卡：放置在土地上
        if card.type == 'industry':
            if len(self.land) < self.max_land:
                self.land.append(card)
                self.backpack.pop(card_index)
                success = True
        
        # 魔法卡：需要消耗魔力
        elif card.type == 'magic':
            if self.mana >= card.effect.get('mana_cost', 0):
                self.mana -= card.effect.get('mana_cost', 0)
                # 這裡應該有更多的魔法卡效果處理
                self.backpack.pop(card_index)
                success = True
        
        # 其他類型的卡（攻擊，防禦等）
        else:
            # 這裡應該有更多的卡牌效果處理
            self.backpack.pop(card_index)
            success = True
        
        if success:
            self.played_cards.append(card.type)
        
        return success
    
    def reset_turn(self):
        """重置回合狀態"""
        self.played_cards = []
    
    def to_dict(self):
        """將玩家狀態轉換為字典"""
        return {
            'user_id': self.user_id,
            'username': self.username,
            'nation': self.nation,
            'life': self.life,
            'max_life': self.max_life,
            'mana': self.mana,
            'max_mana': self.max_mana,
            'money_bank': self.money_bank,
            'money_cash': self.money_cash,
            'income': self.income,
            'backpack': [card.to_dict() for card in self.backpack],
            'land': [card.to_dict() for card in self.land],
            'debuffs': self.debuffs,
            'buffs': self.buffs,
            'played_cards': self.played_cards
        } 