from flask import Blueprint, render_template, redirect, url_for, request, jsonify, abort, flash
from flask_login import login_required, current_user
from app import db, socketio
from app.models.room import Room
from app.models.user import User
from app.game_logic.game_state import GameState
from app.game_logic.player_state import PlayerState
from app.game_logic.card import get_shop_cards
from flask_socketio import emit, join_room as socket_join_room, leave_room as socket_leave_room
import json

game = Blueprint('game', __name__)
# 儲存遊戲實例，鍵為房間代碼
active_games = {}

@game.route('/room/<room_code>')
@login_required
def room(room_code):
    """遊戲房間頁面"""
    room = Room.query.filter_by(code=room_code).first_or_404()
    
    # 檢查使用者是否已在房間中，如果不是則加入
    if not any(player.id == current_user.id for player in room.players):
        if len(room.players) < room.max_players and room.status == 'waiting':
            # 添加使用者到房間（使用User對象，而不是PlayerState）
            room.players.append(current_user)
            db.session.commit()
            
            # 使用SocketIO發送玩家列表更新
            players_data = [{'id': player.id, 'username': player.username, 'is_creator': player.id == room.creator_id} 
                            for player in room.players]
            socketio.emit('update_player_list', {'players': players_data}, room=room_code, namespace='/')
            
            # 向大廳發送更新的房間列表
            from app.routes.main import broadcast_lobby_update
            broadcast_lobby_update()
        else:
            flash('無法加入房間，房間已滿或遊戲已開始')
            return redirect(url_for('main.lobby'))
    
    # 將Room對象轉換為dict，以便在模板中訪問所有設定
    room_dict = room.to_dict()
    
    return render_template('game/room.html', room=room_dict)

@socketio.on('connect')
def handle_connect():
    print('Client connected')

@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected')

@socketio.on('join')
def on_join(data):
    """使用者加入房間的WebSocket事件"""
    room_code = data.get('room_code')
    socket_join_room(room_code)
    
    # 發送用戶加入的消息
    emit('status', {'msg': f'{current_user.username} 已加入房間'}, room=room_code)
    
    # 獲取最新的房間信息
    room = Room.query.filter_by(code=room_code).first()
    if room:
        # 向房間內所有人發送更新的玩家列表
        players_data = [{'id': player.id, 'username': player.username, 'is_creator': player.id == room.creator_id} 
                        for player in room.players]
        emit('update_player_list', {'players': players_data}, room=room_code)
        
        # 向大廳發送更新的房間列表
        from app.routes.main import broadcast_lobby_update
        broadcast_lobby_update()

@socketio.on('leave')
def on_leave(data):
    """使用者離開房間的WebSocket事件"""
    room_code = data.get('room_code')
    socket_leave_room(room_code)
    
    # 發送用戶離開的消息
    emit('status', {'msg': f'{current_user.username} 已離開房間'}, room=room_code)
    
    # 獲取最新的房間信息
    room = Room.query.filter_by(code=room_code).first()
    if room:
        # 向房間內所有人發送更新的玩家列表
        players_data = [{'id': player.id, 'username': player.username, 'is_creator': player.id == room.creator_id} 
                        for player in room.players]
        emit('update_player_list', {'players': players_data}, room=room_code)
        
        # 向大廳發送更新的房間列表
        from app.routes.main import broadcast_lobby_update
        broadcast_lobby_update()

@socketio.on('start_game')
def on_start_game(data):
    """開始遊戲"""
    room_code = data.get('room_code')
    room = Room.query.filter_by(code=room_code).first()
    
    if not room:
        emit('error', {'msg': '找不到房間'})
        return
    
    if current_user.id != room.creator_id:
        emit('error', {'msg': '只有房主可以開始遊戲'})
        return
    
    if len(room.players) < 2:
        emit('error', {'msg': '至少需要2位玩家才能開始遊戲'})
        return
    
    # 更新房間狀態
    room.status = 'playing'
    db.session.commit()
    
    # 創建遊戲狀態
    game_state = GameState(room.id, [player.id for player in room.players], room.mode)
    active_games[room_code] = game_state
    
    # 發送遊戲開始訊息
    emit('game_started', {'status': 'success'}, room=room_code)
    
    # 發送初始遊戲狀態
    emit('update_game_state', game_state.to_json(), room=room_code)
    
    # 開始第一個玩家的回合
    game_state.start_turn()
    emit('update_game_state', game_state.to_json(), room=room_code)

@socketio.on('select_nation')
def on_select_nation(data):
    """選擇國家"""
    room_code = data.get('room_code')
    nation = data.get('nation')
    
    game_state = active_games.get(room_code)
    if not game_state:
        emit('error', {'msg': '遊戲未開始'})
        return
    
    player_index = game_state.get_player_index(current_user.id)
    if player_index is None:
        emit('error', {'msg': '您不是該遊戲的玩家'})
        return
    
    # 設置玩家國家
    game_state.players[player_index].set_nation(nation)
    
    # 發送更新的遊戲狀態
    emit('update_game_state', game_state.to_json(), room=room_code)

@socketio.on('bank_operation')
def on_bank_operation(data):
    """存款/提款操作"""
    room_code = data.get('room_code')
    operation = data.get('operation')  # 'deposit' 或 'withdraw'
    amount = data.get('amount', 0)
    
    game_state = active_games.get(room_code)
    if not game_state:
        emit('error', {'msg': '遊戲未開始'})
        return
    
    player_index = game_state.get_player_index(current_user.id)
    if player_index is None or game_state.current_player != player_index:
        emit('error', {'msg': '不是您的回合'})
        return
    
    player = game_state.players[player_index]
    success = False
    
    if operation == 'deposit':
        success = player.deposit(amount)
    elif operation == 'withdraw':
        success = player.withdraw(amount)
    
    if not success:
        emit('error', {'msg': '操作失敗，請檢查金額是否正確'})
        return
    
    emit('update_game_state', game_state.to_json(), room=room_code)

@socketio.on('buy_card')
def on_buy_card(data):
    """購買卡片"""
    room_code = data.get('room_code')
    card_index = data.get('card_index')
    
    game_state = active_games.get(room_code)
    if not game_state:
        emit('error', {'msg': '遊戲未開始'})
        return
    
    player_index = game_state.get_player_index(current_user.id)
    if player_index is None or game_state.current_player != player_index:
        emit('error', {'msg': '不是您的回合'})
        return
    
    success = game_state.buy_card(player_index, card_index)
    if not success:
        emit('error', {'msg': '無法購買卡片，請檢查金錢是否足夠或背包是否已滿'})
        return
    
    emit('update_game_state', game_state.to_json(), room=room_code)

@socketio.on('play_card')
def on_play_card(data):
    """打出卡片"""
    room_code = data.get('room_code')
    card_index = data.get('card_index')
    target_index = data.get('target_index')  # 對於需要目標的卡片
    land_index = data.get('land_index')      # 對於產業卡
    
    game_state = active_games.get(room_code)
    if not game_state:
        emit('error', {'msg': '遊戲未開始'})
        return
    
    player_index = game_state.get_player_index(current_user.id)
    if player_index is None or game_state.current_player != player_index:
        emit('error', {'msg': '不是您的回合'})
        return
    
    success = game_state.play_card(player_index, card_index, target_index, land_index)
    if not success:
        emit('error', {'msg': '無法打出卡片'})
        return
    
    emit('update_game_state', game_state.to_json(), room=room_code)

@socketio.on('end_turn')
def on_end_turn(data):
    """結束回合"""
    room_code = data.get('room_code')
    
    game_state = active_games.get(room_code)
    if not game_state:
        emit('error', {'msg': '遊戲未開始'})
        return
    
    player_index = game_state.get_player_index(current_user.id)
    if player_index is None or game_state.current_player != player_index:
        emit('error', {'msg': '不是您的回合'})
        return
    
    # 結束當前回合，並開始下一個回合
    game_state.end_turn()
    
    # 如果所有玩家都完成一輪，則刷新商店並檢查遊戲事件
    if game_state.current_player == 0:
        game_state.refresh_shop()
        game_state.check_events()
    
    # 開始下一個玩家的回合
    game_state.start_turn()
    
    emit('update_game_state', game_state.to_json(), room=room_code)

@socketio.on('chat')
def on_chat(data):
    """處理聊天訊息"""
    room_code = data.get('room_code')
    message = data.get('message', '')
    
    if not message.strip():
        return
    
    # 格式化聊天訊息
    formatted_message = f"{current_user.username}: {message}"
    
    # 向房間內所有玩家廣播訊息
    emit('chat_message', {'msg': formatted_message}, room=room_code)

@socketio.on('leave_room')
def handle_leave_room(data):
    """處理玩家離開房間"""
    room_code = data.get('room_code')
    user_id = current_user.id
    
    room = Room.query.filter_by(code=room_code).first()
    if not room:
        emit('error', {'msg': '找不到房間'})
        return
    
    # 1. 從玩家列表中移除玩家
    user = User.query.get(user_id)
    if user in room.players:
        room.players.remove(user)
        
        # 2. 如果是房主離開且房間還有其他玩家，轉讓房主權限
        if user_id == room.creator_id and room.players:
            # 將房主權限轉讓給第一個其他玩家
            room.creator_id = room.players[0].id
            emit('status', {'msg': f'房主已變更為 {room.players[0].username}'}, room=room_code)
        
        # 3. 如果房間沒有玩家了，自動刪除房間
        if not room.players:
            # 如果遊戲已開始，則先關閉遊戲實例
            if room_code in active_games:
                del active_games[room_code]
            
            # 刪除房間
            db.session.delete(room)
        
        # 提交資料庫變更
        db.session.commit()
        
        # 發送用戶離開的消息
        emit('status', {'msg': f'{user.username} 已離開房間'}, room=room_code)
        
        # 如果房間還存在，更新房間內玩家列表
        if room.players:
            players_data = [{'id': player.id, 'username': player.username, 'is_creator': player.id == room.creator_id} 
                            for player in room.players]
            emit('update_player_list', {'players': players_data}, room=room_code)
        
        # 向大廳發送更新的房間列表
        from app.routes.main import broadcast_lobby_update
        broadcast_lobby_update()
        
        # 通知前端離開成功
        emit('leave_success', {'redirect': '/lobby'})
    else:
        emit('error', {'msg': '您不在此房間中'})
        return 

@game.route('/leave/<room_code>')
@login_required
def leave_room_http(room_code):
    """HTTP 路由：離開房間"""
    room = Room.query.filter_by(code=room_code).first_or_404()
    user_id = current_user.id
    
    # 從玩家列表中移除玩家
    user = User.query.get(user_id)
    if user in room.players:
        room.players.remove(user)
        
        # 如果是房主離開且房間還有其他玩家，轉讓房主權限
        if user_id == room.creator_id and room.players:
            # 將房主權限轉讓給第一個其他玩家
            room.creator_id = room.players[0].id
        
        # 如果房間沒有玩家了，自動刪除房間
        if not room.players:
            # 如果遊戲已開始，則先關閉遊戲實例
            if room_code in active_games:
                del active_games[room_code]
            
            # 刪除房間
            db.session.delete(room)
        
        # 提交資料庫變更
        db.session.commit()
        
        # 向大廳發送更新的房間列表
        from app.routes.main import broadcast_lobby_update
        broadcast_lobby_update()
        
        # 發送房間內玩家列表更新 (使用 socketio 而不是 emit，因為這是 HTTP 請求)
        if room.players:
            players_data = [{'id': player.id, 'username': player.username, 'is_creator': player.id == room.creator_id} 
                           for player in room.players]
            socketio.emit('update_player_list', {'players': players_data}, room=room_code)
        
        # 發送用戶離開的消息
        socketio.emit('status', {'msg': f'{user.username} 已離開房間'}, room=room_code)
    
    return redirect(url_for('main.lobby')) 