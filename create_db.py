from app import db, create_app
import os
import shutil

app = create_app()

with app.app_context():
    # 取得資料庫位置
    db_uri = app.config['SQLALCHEMY_DATABASE_URI']
    print(f"資料庫位置: {db_uri}")
    
    # 檢查instance目錄是否存在，如果存在則刪除其中的所有檔案
    instance_dir = 'instance'
    if os.path.exists(instance_dir):
        print(f"清空 {instance_dir} 目錄")
        for file in os.listdir(instance_dir):
            file_path = os.path.join(instance_dir, file)
            if file.endswith('.db') or file.endswith('.sqlite'):
                os.remove(file_path)
                print(f"已刪除資料庫檔案: {file_path}")
    else:
        # 如果目錄不存在，則創建它
        os.makedirs(instance_dir)
        print(f"已創建 {instance_dir} 目錄")
    
    # 刪除所有表格並重新創建
    print("刪除所有現有表格...")
    db.drop_all()
    
    print("創建所有表格...")
    db.create_all()
    
    print("資料庫初始化完成！") 