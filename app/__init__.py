from flask import Flask
from flask_socketio import SocketIO
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from flask_migrate import Migrate
import os

# 初始化擴展
db = SQLAlchemy()
socketio = SocketIO()
login_manager = LoginManager()
migrate = Migrate()

def create_app():
    """
    初始化並配置應用
    """
    app = Flask(__name__)
    
    # 配置
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev_key_replace_in_production')
    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///magic_card.db')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # 初始化插件
    db.init_app(app)
    socketio.init_app(app, cors_allowed_origins="*", logger=True, engineio_logger=True)
    login_manager.init_app(app)
    login_manager.login_view = 'auth.login'
    migrate.init_app(app, db)
    
    # 註冊藍圖
    from app.routes.auth import auth as auth_blueprint
    app.register_blueprint(auth_blueprint)
    
    from app.routes.main import main as main_blueprint
    app.register_blueprint(main_blueprint)
    
    from app.routes.game import game as game_blueprint
    app.register_blueprint(game_blueprint)
    
    # 確保實例資料夾存在
    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass
    
    return app 