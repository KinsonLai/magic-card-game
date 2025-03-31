from flask import Blueprint, render_template, redirect, url_for, request, jsonify
from flask_login import login_required, current_user
from app import db, socketio
from app.models.room import Room
from flask_socketio import emit
import random
import string

main = Blueprint('main', __name__)

@main.route('/')
def index():
    """首頁"""
    return render_template('index.html')

@main.route('/tutorial')
def tutorial():
    """遊戲教學頁面"""
    return render_template('tutorial.html')

@main.route('/lobby')
@login_required
def lobby():
    """遊戲大廳，顯示所有可加入的房間"""
    rooms_query = Room.query.filter(Room.status == 'waiting').all()
    rooms = [room.to_dict() for room in rooms_query]
    return render_template('lobby.html', rooms=rooms)

@socketio.on('connect')
def handle_lobby_connect():
    """用戶連接到大廳"""
    print('Client connected to lobby')

@socketio.on('request_lobby_update')
def handle_lobby_update():
    """處理大廳更新請求"""
    # 獲取最新的房間列表
    rooms_query = Room.query.filter(Room.status == 'waiting').all()
    rooms = [room.to_dict() for room in rooms_query]
    
    # 將房間列表發送給請求的客戶端
    emit('refresh_lobby', {'rooms': rooms}, broadcast=False)

@socketio.on('update_lobby')
def socket_broadcast_lobby_update(data=None):
    """Socket.IO 事件處理函數：廣播大廳更新"""
    broadcast_lobby_update()

def broadcast_lobby_update():
    """廣播大廳更新 - 同時可在 HTTP 和 Socket.IO 上下文中使用"""
    # 獲取最新的房間列表
    rooms_query = Room.query.filter(Room.status == 'waiting').all()
    rooms = [room.to_dict() for room in rooms_query]
    
    # 使用 socketio.emit 而不是 emit，這樣可以在 HTTP 請求中使用
    # 從伺服器端直接發送的訊息默認會廣播給所有客戶端
    socketio.emit('refresh_lobby', {'rooms': rooms}, namespace='/')

@main.route('/create_room', methods=['GET', 'POST'])
@login_required
def create_room():
    """創建新房間"""
    if request.method == 'POST':
        # 生成一個隨機的6位數房間代碼
        room_code = ''.join(random.choices(string.digits, k=6))
        
        # 獲取基本表單數據
        player_count = request.form.get('player_count', 4, type=int)
        mode = request.form.get('mode', 'normal')
        password = request.form.get('password', '')
        
        # 創建新房間
        new_room = Room(
            code=room_code,
            creator_id=current_user.id,
            max_players=player_count,
            mode=mode,
            password=password,
            status='waiting'
        )
        
        # 獲取附加設定
        # 災害與祝福系統
        new_room.disaster_enabled = 'disaster_enabled' in request.form
        new_room.blessing_enabled = 'blessing_enabled' in request.form
        
        # 如果是快速模式或自訂模式，設置額外參數
        if mode in ['quick', 'custom']:
            new_room.initial_money = request.form.get('initial_money', 100, type=int)
            new_room.income_multiplier = request.form.get('income_multiplier', 1.0, type=float)
            new_room.mana_recovery_rate = request.form.get('mana_recovery_rate', 1.0, type=float)
            new_room.event_frequency = request.form.get('event_frequency', 5, type=int)
            new_room.random_nation = 'random_nation' in request.form
            new_room.allow_duplicate_nations = 'allow_duplicate_nations' in request.form
            
            # 為快速模式設置預設值
            if mode == 'quick' and not request.form.get('initial_money'):
                new_room.initial_money = 200
                new_room.income_multiplier = 1.5
                new_room.mana_recovery_rate = 1.5
                new_room.event_frequency = 3
        
        # 如果是自訂模式，設置額外參數
        if mode == 'custom':
            new_room.initial_life = request.form.get('initial_life', 100, type=int)
            new_room.initial_mana = request.form.get('initial_mana', 100, type=int)
        
        db.session.add(new_room)
        db.session.commit()
        
        # 廣播大廳更新
        broadcast_lobby_update()
        
        # 重定向到房間頁面
        return redirect(url_for('game.room', room_code=room_code))
    
    return render_template('create_room.html')

@main.route('/join_room', methods=['POST'])
@login_required
def join_room():
    """加入房間"""
    data = request.get_json()
    room_code = data.get('room_code')
    password = data.get('password', '')
    
    room = Room.query.filter_by(code=room_code).first()
    
    if not room:
        return jsonify({'success': False, 'error': '找不到該房間'})
    
    if room.status != 'waiting':
        return jsonify({'success': False, 'error': '遊戲已經開始或房間已關閉'})
    
    if room.password and room.password != password:
        return jsonify({'success': False, 'error': '密碼錯誤'})
    
    # 檢查房間是否已滿
    if len(room.players) >= room.max_players:
        return jsonify({'success': False, 'error': '房間已滿'})
    
    # 重定向到房間頁面
    return jsonify({'success': True, 'redirect': f'/room/{room_code}'}) 