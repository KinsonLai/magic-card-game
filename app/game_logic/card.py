import random
import json

class Card:
    """卡牌基類"""
    def __init__(self, card_id, name, type, description, cost, rarity, effect, requires_target=False, image_url=None):
        self.id = card_id
        self.name = name
        self.type = type  # industry, attack, defense, missile, magic, contract, enchantment
        self.description = description
        self.cost = cost
        self.rarity = rarity  # common, uncommon, rare, epic, legendary
        self.effect = effect  # 效果，一個字典
        self.requires_target = requires_target
        self.image_url = image_url or f"/static/images/cards/{type}_{rarity}.png"
    
    def to_dict(self):
        """將卡牌轉換為字典"""
        return {
            'id': self.id,
            'name': self.name,
            'type': self.type,
            'description': self.description,
            'cost': self.cost,
            'rarity': self.rarity,
            'effect': self.effect,
            'requires_target': self.requires_target,
            'image_url': self.image_url
        }

# 定義一些示例卡牌
def get_all_cards():
    """獲取所有可用卡牌的列表"""
    cards = []
    
    # 產業卡
    cards.extend([
        Card(1, "小型農場", "industry", "每回合獲得5金錢", 50, "common", {"income": 5}),
        Card(2, "商店", "industry", "每回合獲得8金錢", 80, "common", {"income": 8}),
        Card(3, "工廠", "industry", "每回合獲得12金錢", 120, "uncommon", {"income": 12}),
        Card(4, "礦場", "industry", "每回合獲得15金錢", 150, "uncommon", {"income": 15}),
        Card(5, "塔樓", "industry", "每回合獲得20金錢", 200, "rare", {"income": 20}),
        Card(6, "大型商場", "industry", "每回合獲得25金錢", 250, "rare", {"income": 25}),
        Card(7, "魔法水晶礦", "industry", "每回合獲得30金錢", 300, "epic", {"income": 30}),
        Card(8, "巨龍寶庫", "industry", "每回合獲得40金錢", 400, "legendary", {"income": 40})
    ])
    
    # 攻擊卡
    cards.extend([
        Card(101, "小刀", "attack", "造成10點傷害", 30, "common", {"damage": 10}, True),
        Card(102, "弓箭", "attack", "造成15點傷害", 45, "common", {"damage": 15}, True),
        Card(103, "長劍", "attack", "造成20點傷害", 60, "uncommon", {"damage": 20}, True),
        Card(104, "手槍", "attack", "造成25點傷害", 75, "uncommon", {"damage": 25}, True),
        Card(105, "火球術", "attack", "造成30點傷害", 90, "rare", {"damage": 30}, True),
        Card(106, "狙擊槍", "attack", "造成40點傷害", 120, "rare", {"damage": 40}, True),
        Card(107, "魔法導彈", "attack", "造成50點傷害", 150, "epic", {"damage": 50}, True),
        Card(108, "核彈打擊", "attack", "造成70點傷害", 210, "legendary", {"damage": 70}, True)
    ])
    
    # 防禦卡
    cards.extend([
        Card(201, "木盾", "defense", "抵擋下一次15點傷害", 30, "common", {"block": 15}),
        Card(202, "鋼盾", "defense", "抵擋下一次25點傷害", 50, "uncommon", {"block": 25}),
        Card(203, "魔法護盾", "defense", "抵擋下一次40點傷害", 80, "rare", {"block": 40}),
        Card(204, "反射護盾", "defense", "抵擋並反彈下一次30點傷害", 100, "epic", {"block": 30, "reflect": True})
    ])
    
    # 導彈卡
    cards.extend([
        Card(301, "小型導彈", "missile", "摧毀目標一個產業", 70, "uncommon", {"destroy": 1}, True),
        Card(302, "大型導彈", "missile", "摧毀目標兩個產業", 150, "rare", {"destroy": 2}, True),
        Card(303, "核彈", "missile", "摧毀目標所有產業", 300, "legendary", {"destroy": "all"}, True)
    ])
    
    # 魔法卡
    cards.extend([
        Card(401, "治療術", "magic", "恢復30點生命，消耗20點魔力", 60, "uncommon", {"heal": 30, "mana_cost": 20}),
        Card(402, "地震術", "magic", "對所有其他玩家造成20點傷害，消耗40點魔力", 120, "rare", {"aoe_damage": 20, "mana_cost": 40}),
        Card(403, "時間凍結", "magic", "獲得一個額外回合，消耗70點魔力", 200, "epic", {"extra_turn": 1, "mana_cost": 70}),
        Card(404, "魔力再生", "magic", "恢復所有魔力，消耗30點魔力", 100, "rare", {"mana_restore": "full", "mana_cost": 30})
    ])
    
    # 契約卡
    cards.extend([
        Card(501, "血契", "contract", "失去20點生命，獲得100金錢", 0, "uncommon", {"life_cost": 20, "money_gain": 100}),
        Card(502, "魔力契約", "contract", "失去30點魔力，獲得60金錢", 0, "uncommon", {"mana_cost": 30, "money_gain": 60}),
        Card(503, "黑暗契約", "contract", "獲得'瘟疫'減益3回合，獲得200金錢", 0, "rare", {"debuff": {"type": "plague", "turns": 3}, "money_gain": 200}),
        Card(504, "靈魂交易", "contract", "每回合失去5點生命，增加所有產業收入50%", 150, "epic", {"life_drain": 5, "income_boost": 0.5})
    ])
    
    # 附魔卡
    cards.extend([
        Card(601, "力量附魔", "enchantment", "增加攻擊卡傷害30%", 80, "uncommon", {"attack_boost": 0.3}),
        Card(602, "堅固附魔", "enchantment", "增加防禦卡效果40%", 80, "uncommon", {"defense_boost": 0.4}),
        Card(603, "魔力親和", "enchantment", "減少魔法卡魔力消耗30%", 100, "rare", {"mana_cost_reduction": 0.3}),
        Card(604, "商業頭腦", "enchantment", "增加所有產業收入20%", 150, "rare", {"income_boost": 0.2})
    ])
    
    return cards

def get_shop_cards(num_cards, rarity_factor=0.0):
    """
    生成商店中可購買的卡牌
    
    參數:
    - num_cards: 生成的卡牌數量
    - rarity_factor: 稀有度因子，值越高稀有卡出現幾率越大 (0.0-1.0)
    """
    all_cards = get_all_cards()
    
    # 根據稀有度給卡牌分配權重
    weights = []
    for card in all_cards:
        if card.rarity == "common":
            weight = max(0.5, 1.0 - rarity_factor * 0.8)
        elif card.rarity == "uncommon":
            weight = max(0.3, 0.5 - rarity_factor * 0.3)
        elif card.rarity == "rare":
            weight = min(0.4, 0.2 + rarity_factor * 0.3)
        elif card.rarity == "epic":
            weight = min(0.2, 0.05 + rarity_factor * 0.3)
        elif card.rarity == "legendary":
            weight = min(0.1, 0.01 + rarity_factor * 0.15)
        else:
            weight = 0.1
        weights.append(weight)
    
    # 正規化權重
    total_weight = sum(weights)
    normalized_weights = [w / total_weight for w in weights]
    
    # 選擇卡牌
    selected_indices = random.choices(range(len(all_cards)), weights=normalized_weights, k=num_cards)
    
    # 調整價格（根據回合數）
    shop_cards = []
    for idx in selected_indices:
        card = all_cards[idx]
        # 創建卡牌的副本
        new_card = Card(
            card.id,
            card.name,
            card.type,
            card.description,
            card.cost,
            card.rarity,
            card.effect.copy(),
            card.requires_target,
            card.image_url
        )
        
        # 應用回合數價格增加（這裡不直接使用，由game_state決定）
        # new_card.cost = int(new_card.cost * (1 + rarity_factor * 0.5))
        
        shop_cards.append(new_card)
    
    return shop_cards 