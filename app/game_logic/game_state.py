import random
import json
from app.game_logic.player_state import PlayerState
from app.game_logic.card import get_shop_cards
from app.models.user import User
from app.models.room import Room

class GameState:
    """遊戲狀態管理類"""
    def __init__(self, room_id, player_ids, mode='normal'):
        self.room_id = room_id
        self.player_ids = player_ids
        self.players = [PlayerState(player_id) for player_id in player_ids]
        self.current_player = 0  # 當前輪到的玩家索引
        self.round = 0  # 當前回合數
        self.mode = mode
        self.shop_cards = []  # 商店卡牌
        self.event = None  # 當前活躍的遊戲事件
        self.game_over = False  # 遊戲是否結束
        
        # 獲取房間設定
        self.room_settings = self._get_room_settings(room_id)
        
        # 初始化遊戲設置
        self._initialize_game()
    
    def _get_room_settings(self, room_id):
        """獲取房間設定"""
        room = Room.query.get(room_id)
        if not room:
            return {
                'disaster_enabled': True,
                'blessing_enabled': True,
                'initial_money': 100,
                'income_multiplier': 1.0,
                'mana_recovery_rate': 1.0,
                'event_frequency': 5,
                'random_nation': False,
                'allow_duplicate_nations': True,
                'initial_life': 100,
                'initial_mana': 100
            }
        
        return {
            'disaster_enabled': room.disaster_enabled,
            'blessing_enabled': room.blessing_enabled,
            'initial_money': room.initial_money,
            'income_multiplier': room.income_multiplier,
            'mana_recovery_rate': room.mana_recovery_rate,
            'event_frequency': room.event_frequency,
            'random_nation': room.random_nation,
            'allow_duplicate_nations': room.allow_duplicate_nations,
            'initial_life': room.initial_life,
            'initial_mana': room.initial_mana
        }
    
    def _initialize_game(self):
        """初始化遊戲，設置初始資源"""
        # 設置玩家初始資源
        for player in self.players:
            player.money_cash = self.room_settings['initial_money']
            player.money_bank = self.room_settings['initial_money']
            player.income = int(10 * self.room_settings['income_multiplier'])
            
            # 設置生命和魔力（自訂模式）
            if self.mode == 'custom':
                player.max_life = self.room_settings['initial_life']
                player.life = self.room_settings['initial_life']
                player.max_mana = self.room_settings['initial_mana']
                player.mana = self.room_settings['initial_mana']
        
        # 如果啟用了隨機國家分配
        if self.room_settings['random_nation']:
            self._assign_random_nations()
        
        # 填充商店
        self.refresh_shop()
    
    def _assign_random_nations(self):
        """隨機分配國家給玩家"""
        nations = ['fighter', 'holy', 'merchant', 'magic']
        
        # 如果不允許重複國家，且玩家數量不超過國家數量
        if not self.room_settings['allow_duplicate_nations'] and len(self.players) <= len(nations):
            random.shuffle(nations)
            for i, player in enumerate(self.players):
                player.set_nation(nations[i])
        else:
            # 允許重複國家
            for player in self.players:
                player.set_nation(random.choice(nations))
    
    def get_player_index(self, user_id):
        """根據使用者ID獲取玩家索引"""
        for i, player in enumerate(self.players):
            if player.user_id == user_id:
                return i
        return None
    
    def start_turn(self):
        """開始當前玩家的回合"""
        player = self.players[self.current_player]
        
        # 恢復魔力
        player.recover_mana(self.room_settings['mana_recovery_rate'])
        
        # 獲得收入
        player.gain_income()
        
        # 應用減益效果
        player.apply_debuffs()
        
        # 重置回合狀態
        player.reset_turn()
    
    def end_turn(self):
        """結束當前玩家的回合"""
        # 進入下一個玩家的回合
        self.current_player = (self.current_player + 1) % len(self.players)
        
        # 如果回到第一個玩家，增加回合數
        if self.current_player == 0:
            self.round += 1
            
            # 檢查是否需要觸發事件
            if self.round >= 5 and self.round % self.room_settings['event_frequency'] == 0:
                self._trigger_event()
    
    def refresh_shop(self):
        """刷新商店卡牌"""
        num_cards = 6  # 商店卡牌數量
        rarity_factor = min(1.0, (self.round / 20))  # 回合數增加，稀有卡概率增加
        self.shop_cards = get_shop_cards(num_cards, rarity_factor)
    
    def buy_card(self, player_index, card_index):
        """玩家購買卡牌"""
        if player_index < 0 or player_index >= len(self.players):
            return False
        
        if card_index < 0 or card_index >= len(self.shop_cards):
            return False
        
        player = self.players[player_index]
        card = self.shop_cards[card_index]
        
        # 檢查玩家金錢是否足夠
        if player.money_cash < card.cost:
            return False
        
        # 扣除金錢並添加卡牌到背包
        if player.add_card_to_backpack(card):
            player.money_cash -= card.cost
            self.shop_cards.pop(card_index)
            return True
        
        return False
    
    def play_card(self, player_index, card_index, target_index=None, land_index=None):
        """玩家打出卡牌"""
        if player_index < 0 or player_index >= len(self.players):
            return False
        
        player = self.players[player_index]
        
        # 檢查卡片索引是否有效
        if card_index < 0 or card_index >= len(player.backpack):
            return False
        
        card = player.backpack[card_index]
        
        # 處理需要目標的卡牌
        if card.requires_target and target_index is not None:
            if target_index < 0 or target_index >= len(self.players):
                return False
            
            target = self.players[target_index]
            
            # 根據卡牌類型處理效果
            if card.type == 'attack':
                # 處理攻擊卡
                damage = card.effect.get('damage', 0)
                
                # 鬥士之國增益
                if player.nation == 'fighter':
                    damage = int(damage * 1.2)  # 增加20%攻擊力
                
                target.life = max(0, target.life - damage)
                
                # 檢查目標是否被擊敗
                if target.life <= 0:
                    self._player_defeated(target_index)
            
            elif card.type == 'missile':
                # 處理導彈卡（破壞產業）
                if land_index is not None and 0 <= land_index < len(target.land):
                    target.land.pop(land_index)
        
        # 使用卡牌
        return player.play_card(card_index, target_index, land_index)
    
    def _player_defeated(self, player_index):
        """處理玩家被擊敗"""
        # 將玩家標記為被擊敗
        self.players[player_index].defeated = True
        
        # 檢查是否只剩下一個玩家
        active_players = [p for p in self.players if not getattr(p, 'defeated', False)]
        if len(active_players) == 1:
            self.game_over = True
            self.winner = active_players[0].user_id
    
    def _trigger_event(self):
        """觸發遊戲事件"""
        # 定義可能的災害
        disasters = [
            {
                'type': 'mana_anomaly',
                'name': '魔力異常',
                'description': '所有玩家的魔力清空',
                'effect': self._apply_mana_anomaly
            },
            {
                'type': 'natural_disaster',
                'name': '大規模天災',
                'description': '所有玩家每回合都有機率扣減生命值',
                'effect': self._apply_natural_disaster
            },
            {
                'type': 'supply_chain_disruption',
                'name': '供應鏈破裂',
                'description': '商品價格上升兩倍',
                'effect': self._apply_supply_chain_disruption
            },
            {
                'type': 'desertification',
                'name': '沙漠化',
                'description': '破壞隨機產業',
                'effect': self._apply_desertification
            }
        ]
        
        # 定義可能的祝福
        blessings = [
            {
                'type': 'divine_blessing',
                'name': '魔神的祝福',
                'description': '所有玩家恢復20%魔力',
                'effect': self._apply_divine_blessing
            },
            {
                'type': 'guardian_descent',
                'name': '守護神降臨',
                'description': '所有玩家期間不會獲得任何減益',
                'effect': self._apply_guardian_descent
            },
            {
                'type': 'economic_boom',
                'name': '經濟發達',
                'description': '所有玩家額外獲得10%金錢',
                'effect': self._apply_economic_boom
            },
            {
                'type': 'harvest',
                'name': '大豐收',
                'description': '商店內的商品七折',
                'effect': self._apply_harvest
            }
        ]
        
        # 根據房間設定選擇是災害還是祝福
        available_events = []
        if self.room_settings['disaster_enabled']:
            available_events.extend(disasters)
        if self.room_settings['blessing_enabled']:
            available_events.extend(blessings)
        
        # 如果沒有可用事件，則跳過
        if not available_events:
            return
        
        # 隨機選擇一個事件
        self.event = random.choice(available_events)
        
        # 應用事件效果
        self.event['effect']()
    
    def _apply_mana_anomaly(self):
        """應用魔力異常效果"""
        for player in self.players:
            player.mana = 0
    
    def _apply_natural_disaster(self):
        """應用大規模天災效果"""
        for player in self.players:
            player.debuffs.append({
                'type': 'plague',
                'name': '瘟疫',
                'description': '每回合有30%機率損失5%最大生命值',
                'turns': 5
            })
    
    def _apply_supply_chain_disruption(self):
        """應用供應鏈破裂效果"""
        for card in self.shop_cards:
            card.cost *= 2
    
    def _apply_desertification(self):
        """應用沙漠化效果"""
        for player in self.players:
            if player.land:
                index = random.randint(0, len(player.land) - 1)
                player.land.pop(index)
    
    def _apply_divine_blessing(self):
        """應用魔神祝福效果"""
        for player in self.players:
            recovery = int(player.max_mana * 0.2)
            player.mana = min(player.max_mana, player.mana + recovery)
    
    def _apply_guardian_descent(self):
        """應用守護神效果"""
        for player in self.players:
            player.buffs.append({
                'type': 'divine_protection',
                'name': '神聖保護',
                'description': '免疫所有減益',
                'turns': 5
            })
    
    def _apply_economic_boom(self):
        """應用經濟繁榮效果"""
        for player in self.players:
            bonus = int(player.money_cash * 0.1)
            player.money_cash += bonus
    
    def _apply_harvest(self):
        """應用大豐收效果"""
        for card in self.shop_cards:
            card.cost = int(card.cost * 0.7)
    
    def check_events(self):
        """檢查並更新事件狀態"""
        # 這裡添加更多事件處理邏輯
        pass
    
    def to_json(self):
        """將遊戲狀態轉換為JSON格式"""
        return json.dumps({
            'room_id': self.room_id,
            'players': [player.to_dict() for player in self.players],
            'current_player': self.current_player,
            'current_player_id': self.players[self.current_player].user_id if self.players else None,
            'round': self.round,
            'mode': self.mode,
            'shop_cards': [card.to_dict() for card in self.shop_cards],
            'event': self.event,
            'game_over': self.game_over,
            'winner': getattr(self, 'winner', None)
        }) 