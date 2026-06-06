-- 创建数据库
CREATE DATABASE IF NOT EXISTS sharing_station
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE sharing_station;

-- 区域表
CREATE TABLE IF NOT EXISTS region (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL COMMENT '区域名称',
  parent_id INT DEFAULT 0 COMMENT '父区域ID',
  level TINYINT DEFAULT 1 COMMENT '层级:1-省,2-市,3-区',
  sort INT DEFAULT 0 COMMENT '排序',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_parent(parent_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='区域表';

-- 点位表
CREATE TABLE IF NOT EXISTS point (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL COMMENT '点位名称',
  address VARCHAR(255) NOT NULL COMMENT '详细地址',
  longitude DECIMAL(10,6) COMMENT '经度',
  latitude DECIMAL(10,6) COMMENT '纬度',
  region_id INT NOT NULL COMMENT '区域ID',
  manager VARCHAR(50) COMMENT '负责人',
  phone VARCHAR(20) COMMENT '联系电话',
  images JSON COMMENT '点位图片',
  status VARCHAR(20) DEFAULT 'active' COMMENT '状态:active,inactive,maintenance',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (region_id) REFERENCES region(id),
  INDEX idx_region(region_id),
  INDEX idx_status(status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='点位档案表';

-- 设备表
CREATE TABLE IF NOT EXISTS device (
  id INT PRIMARY KEY AUTO_INCREMENT,
  device_no VARCHAR(50) UNIQUE NOT NULL COMMENT '设备编号',
  sn_code VARCHAR(100) UNIQUE NOT NULL COMMENT 'SN码',
  type VARCHAR(20) NOT NULL COMMENT '设备类型:umbrella,charger',
  point_id INT NOT NULL COMMENT '所属点位ID',
  capacity INT DEFAULT 0 COMMENT '容量',
  current_stock INT DEFAULT 0 COMMENT '当前库存',
  status VARCHAR(20) DEFAULT 'online' COMMENT '状态:online,offline,fault,maintenance',
  launch_time DATETIME COMMENT '投放时间',
  rent_count INT DEFAULT 0 COMMENT '租借次数',
  images JSON COMMENT '设备图片',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (point_id) REFERENCES point(id),
  INDEX idx_point(point_id),
  INDEX idx_status(status),
  INDEX idx_type(type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='设备台账表';

-- 报修表
CREATE TABLE IF NOT EXISTS repair (
  id INT PRIMARY KEY AUTO_INCREMENT,
  repair_no VARCHAR(50) UNIQUE NOT NULL COMMENT '报修单号',
  device_id INT NOT NULL COMMENT '设备ID',
  point_id INT NOT NULL COMMENT '点位ID',
  fault_type VARCHAR(50) NOT NULL COMMENT '故障类型',
  description TEXT COMMENT '故障描述',
  images JSON COMMENT '故障图片',
  priority VARCHAR(20) DEFAULT 'medium' COMMENT '优先级:low,medium,high,urgent',
  status VARCHAR(20) DEFAULT 'pending' COMMENT '状态:pending,processing,resolved,closed',
  reporter VARCHAR(50) COMMENT '上报人',
  handler VARCHAR(50) COMMENT '处理人',
  report_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '上报时间',
  resolve_time DATETIME COMMENT '解决时间',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (device_id) REFERENCES device(id),
  FOREIGN KEY (point_id) REFERENCES point(id),
  INDEX idx_device(device_id),
  INDEX idx_status(status),
  INDEX idx_priority(priority)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='故障报修表';

-- 补货表
CREATE TABLE IF NOT EXISTS restock (
  id INT PRIMARY KEY AUTO_INCREMENT,
  restock_no VARCHAR(50) UNIQUE NOT NULL COMMENT '补货单号',
  point_id INT NOT NULL COMMENT '点位ID',
  device_id INT COMMENT '设备ID',
  type VARCHAR(20) NOT NULL COMMENT '类型:umbrella,charger',
  quantity INT NOT NULL COMMENT '补货数量',
  before_stock INT NOT NULL COMMENT '补货前库存',
  after_stock INT NOT NULL COMMENT '补货后库存',
  operator VARCHAR(50) NOT NULL COMMENT '操作人',
  images JSON COMMENT '补货图片',
  remark TEXT COMMENT '备注',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (point_id) REFERENCES point(id),
  FOREIGN KEY (device_id) REFERENCES device(id),
  INDEX idx_point(point_id),
  INDEX idx_type(type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='补货记录表';

-- 订单表
CREATE TABLE IF NOT EXISTS `order` (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_no VARCHAR(50) UNIQUE NOT NULL COMMENT '订单号',
  user_id VARCHAR(50) NOT NULL COMMENT '用户ID',
  device_id INT NOT NULL COMMENT '设备ID',
  point_id INT NOT NULL COMMENT '点位ID',
  type VARCHAR(20) NOT NULL COMMENT '类型:umbrella,charger',
  rent_time DATETIME NOT NULL COMMENT '租借时间',
  return_time DATETIME COMMENT '归还时间',
  duration INT DEFAULT 0 COMMENT '时长(分钟)',
  amount DECIMAL(10,2) DEFAULT 0 COMMENT '费用',
  status VARCHAR(20) DEFAULT 'renting' COMMENT '状态:renting,returned,overdue,lost',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (device_id) REFERENCES device(id),
  FOREIGN KEY (point_id) REFERENCES point(id),
  INDEX idx_device(device_id),
  INDEX idx_user(user_id),
  INDEX idx_status(status),
  INDEX idx_rent_time(rent_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='租借流水表';

-- 盘点表
CREATE TABLE IF NOT EXISTS inventory_record (
  id INT PRIMARY KEY AUTO_INCREMENT,
  inventory_no VARCHAR(50) UNIQUE NOT NULL COMMENT '盘点单号',
  device_id INT NOT NULL COMMENT '设备ID',
  point_id INT NOT NULL COMMENT '点位ID',
  loss_type VARCHAR(20) NOT NULL COMMENT '损耗类型:damage,lost,expired,other',
  reason TEXT COMMENT '损耗原因',
  handler VARCHAR(50) NOT NULL COMMENT '处理人',
  images JSON COMMENT '损耗图片',
  handle_method VARCHAR(20) COMMENT '处理方式:repair,replace,scrap',
  status VARCHAR(20) DEFAULT 'pending' COMMENT '状态:pending,completed',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (device_id) REFERENCES device(id),
  FOREIGN KEY (point_id) REFERENCES point(id),
  INDEX idx_device(device_id),
  INDEX idx_status(status),
  INDEX idx_loss_type(loss_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='损耗盘点表';

-- 用户表
CREATE TABLE IF NOT EXISTS user (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL COMMENT '用户名',
  password VARCHAR(255) NOT NULL COMMENT '密码',
  name VARCHAR(50) NOT NULL COMMENT '姓名',
  role VARCHAR(20) DEFAULT 'operator' COMMENT '角色:admin,supervisor,operator',
  phone VARCHAR(20) COMMENT '手机号',
  is_active TINYINT DEFAULT 1 COMMENT '是否启用',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- 初始化管理员账号 (密码: admin123)
INSERT INTO user (username, password, name, role, phone, is_active) VALUES
('admin', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '系统管理员', 'admin', '13800138000', 1);

-- 初始化区域数据
INSERT INTO region (name, parent_id, level, sort) VALUES
('华东区', 0, 1, 1),
('华南区', 0, 1, 2),
('华北区', 0, 1, 3),
('上海市', 1, 2, 1),
('杭州市', 1, 2, 2),
('广州市', 2, 2, 1),
('深圳市', 2, 2, 2),
('北京市', 3, 2, 1),
('浦东新区', 4, 3, 1),
('黄浦区', 4, 3, 2);

-- 初始化测试点位数据
INSERT INTO point (name, address, longitude, latitude, region_id, manager, phone, status) VALUES
('陆家嘴地铁站', '上海市浦东新区陆家嘴地铁站1号口', 121.5028, 31.2397, 9, '张三', '13800138001', 'active'),
('人民广场站', '上海市黄浦区人民广场地铁站5号口', 121.4737, 31.2304, 10, '李四', '13800138002', 'active'),
('杭州东站', '杭州市上城区杭州东站东广场', 120.2120, 30.2916, 5, '王五', '13800138003', 'active'),
('广州塔站', '广州市海珠区广州塔地铁站A出口', 113.3245, 23.1066, 7, '赵六', '13800138004', 'active'),
('深圳北站', '深圳市龙华区深圳北站西广场', 114.0258, 22.6059, 8, '钱七', '13800138005', 'active'),
('北京南站', '北京市丰台区北京南站北出口', 116.3773, 39.8651, 9, '孙八', '13800138006', 'active');

-- 初始化测试设备数据
INSERT INTO device (device_no, sn_code, type, point_id, capacity, current_stock, status, launch_time, rent_count) VALUES
('UMB001', 'SN20240001', 'umbrella', 1, 20, 15, 'online', '2024-01-01 00:00:00', 120),
('UMB002', 'SN20240002', 'umbrella', 1, 20, 18, 'online', '2024-01-02 00:00:00', 85),
('UMB003', 'SN20240003', 'umbrella', 2, 15, 10, 'online', '2024-01-03 00:00:00', 95),
('UMB004', 'SN20240004', 'umbrella', 3, 25, 20, 'online', '2024-01-04 00:00:00', 110),
('UMB005', 'SN20240005', 'umbrella', 4, 30, 25, 'online', '2024-01-05 00:00:00', 130),
('CHG001', 'SN20240006', 'charger', 1, 10, 8, 'online', '2024-01-06 00:00:00', 65),
('CHG002', 'SN20240007', 'charger', 2, 12, 10, 'online', '2024-01-07 00:00:00', 55),
('CHG003', 'SN20240008', 'charger', 3, 8, 5, 'fault', '2024-01-08 00:00:00', 45),
('CHG004', 'SN20240009', 'charger', 5, 15, 12, 'online', '2024-01-09 00:00:00', 78),
('CHG005', 'SN20240010', 'charger', 6, 20, 18, 'online', '2024-01-10 00:00:00', 92);

-- 初始化测试订单数据
INSERT INTO `order` (order_no, user_id, device_id, point_id, type, rent_time, return_time, duration, amount, status) VALUES
('DD20240601ABC123', 'USER001', 1, 1, 'umbrella', '2024-06-01 09:00:00', '2024-06-01 11:30:00', 150, 5.00, 'returned'),
('DD20240601DEF456', 'USER002', 6, 1, 'charger', '2024-06-01 10:00:00', '2024-06-01 14:00:00', 240, 8.00, 'returned'),
('DD20240602GHI789', 'USER003', 2, 1, 'umbrella', '2024-06-02 08:30:00', '2024-06-02 09:30:00', 60, 2.00, 'returned'),
('DD20240602JKL012', 'USER004', 3, 2, 'umbrella', '2024-06-02 13:00:00', '2024-06-02 16:00:00', 180, 6.00, 'returned'),
('DD20240603MNO345', 'USER005', 7, 2, 'charger', '2024-06-03 11:00:00', NULL, 0, 0.00, 'renting'),
('DD20240603PQR678', 'USER006', 4, 3, 'umbrella', '2024-06-03 14:30:00', '2024-06-03 17:00:00', 150, 5.00, 'returned'),
('DD20240604STU901', 'USER007', 5, 4, 'umbrella', '2024-06-04 09:00:00', '2024-06-04 12:00:00', 180, 6.00, 'returned'),
('DD20240604VWX234', 'USER008', 9, 5, 'charger', '2024-06-04 15:00:00', NULL, 0, 0.00, 'renting'),
('DD20240605YZA567', 'USER009', 10, 6, 'charger', '2024-06-05 10:00:00', '2024-06-05 13:00:00', 180, 6.00, 'returned'),
('DD20240605BCD890', 'USER010', 5, 4, 'umbrella', '2024-06-05 16:00:00', '2024-06-05 18:30:00', 150, 5.00, 'returned');

-- 初始化测试报修数据
INSERT INTO repair (repair_no, device_id, point_id, fault_type, description, priority, status, reporter, handler, report_time, resolve_time) VALUES
('BX20240601ABC12', 3, 2, '设备损坏', '雨伞机按键失灵', 'high', 'resolved', '张三', '李四', '2024-06-01 10:00:00', '2024-06-02 14:00:00'),
('BX20240602DEF34', 8, 3, '充电故障', '充电宝无法正常充电', 'urgent', 'processing', '王五', '赵六', '2024-06-02 15:00:00', NULL),
('BX20240603GHI56', 1, 1, '库存不足', '雨伞库存低于5', 'low', 'pending', '钱七', NULL, '2024-06-03 09:00:00', NULL);

-- 初始化测试补货数据
INSERT INTO restock (restock_no, point_id, device_id, type, quantity, before_stock, after_stock, operator, remark) VALUES
('BH20240601ABC12', 1, 1, 'umbrella', 10, 5, 15, '张三', '日常补货'),
('BH20240602DEF34', 1, 6, 'charger', 5, 3, 8, '李四', '补充充电宝'),
('BH20240603GHI56', 2, 3, 'umbrella', 8, 2, 10, '王五', '周末前补充');

-- 初始化测试盘点数据
INSERT INTO inventory_record (inventory_no, device_id, point_id, loss_type, reason, handler, handle_method, status) VALUES
('PD20240601ABC12', 3, 2, 'damage', '设备外壳破损', '李四', 'repair', 'completed'),
('PD20240602DEF34', 8, 3, 'lost', '充电宝丢失', '赵六', 'replace', 'completed'),
('PD20240603GHI56', 1, 1, 'other', '雨伞丢失3把', '钱七', 'scrap', 'pending');
