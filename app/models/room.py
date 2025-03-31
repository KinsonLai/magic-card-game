from app import db
from app.models.user import User
import json

# 房間和玩家關聯表
room_players = db.Table('room_players',
    db.Column('room_id', db.Integer, db.ForeignKey('room.id')),
    db.Column('user_id', db.Integer, db.ForeignKey('user.id'))
)

class Room(db.Model):
    """遊戲房間模型"""
    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(6), unique=True, index=True)
    creator_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    max_players = db.Column(db.Integer, default=4)
    mode = db.Column(db.String(20), default='normal')  # normal, quick, custom
    password = db.Column(db.String(64), default='')
    status = db.Column(db.String(20), default='waiting')  # waiting, playing, finished
    
    # 遊戲設定
    disaster_enabled = db.Column(db.Boolean, default=True)
    blessing_enabled = db.Column(db.Boolean, default=True)
    initial_money = db.Column(db.Integer, default=100)
    income_multiplier = db.Column(db.Float, default=1.0)
    mana_recovery_rate = db.Column(db.Float, default=1.0)
    event_frequency = db.Column(db.Integer, default=5)
    random_nation = db.Column(db.Boolean, default=False)
    allow_duplicate_nations = db.Column(db.Boolean, default=True)
    initial_life = db.Column(db.Integer, default=100)
    initial_mana = db.Column(db.Integer, default=100)
    
    # 關聯
    creator = db.relationship('User', foreign_keys=[creator_id])
    players = db.relationship('User', secondary=room_players, backref=db.backref('joined_rooms', lazy='dynamic'))
    
    def __repr__(self):
        return f'<Room {self.code}>'
    
    def to_dict(self):
        """將房間資料轉換為字典"""
        return {
            'id': self.id,
            'code': self.code,
            'creator_id': self.creator_id,
            'creator_name': User.query.get(self.creator_id).username,
            'max_players': self.max_players,
            'mode': self.mode,
            'has_password': bool(self.password),
            'status': self.status,
            'players': [{'id': player.id, 'username': player.username} for player in self.players],
            'player_count': len(self.players),
            'disaster_enabled': self.disaster_enabled,
            'blessing_enabled': self.blessing_enabled,
            'initial_money': self.initial_money,
            'income_multiplier': self.income_multiplier,
            'mana_recovery_rate': self.mana_recovery_rate,
            'event_frequency': self.event_frequency,
            'random_nation': self.random_nation,
            'allow_duplicate_nations': self.allow_duplicate_nations,
            'initial_life': self.initial_life,
            'initial_mana': self.initial_mana
        } 