-- ============================================
-- 首页相关表初始化脚本
-- 在 Ubuntu 上执行：psql "$DATABASE_URL" -f init_tables.sql
-- 或者：psql -h 127.0.0.1 -U postgres -d postgres -f init_tables.sql
-- ============================================

CREATE TABLE IF NOT EXISTS pets (
  id SERIAL PRIMARY KEY,
  name VARCHAR(64) NOT NULL,
  type VARCHAR(32) NOT NULL,
  breed VARCHAR(128) NOT NULL,
  age VARCHAR(32) NOT NULL,
  image TEXT NOT NULL DEFAULT '',
  tags JSONB NOT NULL DEFAULT '[]'::jsonb,
  status JSONB NOT NULL DEFAULT '{"text":"可领养","color":"green"}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS highlights (
  id SERIAL PRIMARY KEY,
  title VARCHAR(128) NOT NULL,
  description TEXT NOT NULL,
  icon VARCHAR(64) NOT NULL DEFAULT 'star',
  color VARCHAR(32) NOT NULL DEFAULT 'blue',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 只有 pets 表为空时才插入示例数据（不覆盖你已有的真实数据）
INSERT INTO pets (name, type, breed, age, image, tags, status)
SELECT * FROM (
  VALUES
    ('小白', 'dog',   '萨摩耶',     '2岁',   '', '[{"text":"温顺","color":"green"},{"text":"活泼","color":"yellow"}]'::jsonb,  '{"text":"可领养","color":"green"}'::jsonb),
    ('橘子', 'cat',   '中华田园猫', '1岁',   '', '[{"text":"粘人","color":"pink"},{"text":"贪吃","color":"orange"}]'::jsonb,   '{"text":"等待领养","color":"yellow"}'::jsonb),
    ('球球', 'rabbit','荷兰垂耳兔', '6个月', '', '[{"text":"安静","color":"blue"},{"text":"胆小","color":"purple"}]'::jsonb,   '{"text":"可领养","color":"green"}'::jsonb),
    ('豆豆', 'dog',   '柴犬',       '3岁',   '', '[{"text":"聪明","color":"blue"},{"text":"独立","color":"purple"}]'::jsonb,   '{"text":"已领养","color":"gray"}'::jsonb),
    ('咪咪', 'cat',   '英国短毛猫', '2岁',   '', '[{"text":"高冷","color":"purple"},{"text":"优雅","color":"pink"}]'::jsonb,   '{"text":"可领养","color":"green"}'::jsonb),
    ('毛毛', 'rabbit','道奇兔',     '1岁',   '', '[{"text":"活泼","color":"yellow"},{"text":"好奇","color":"orange"}]'::jsonb, '{"text":"等待领养","color":"yellow"}'::jsonb)
) AS t(name, type, breed, age, image, tags, status)
WHERE NOT EXISTS (SELECT 1 FROM pets);

-- 只有 highlights 表为空时才插入示例数据
INSERT INTO highlights (title, description, icon, color)
SELECT * FROM (
  VALUES
    ('领养须知', '了解领养前需要准备的事项和注意事项，给毛孩子一个温暖的家。', 'heart',     'pink'),
    ('宠物护理', '学习宠物日常护理知识，包括饮食、运动、健康检查等。',         'care',      'green'),
    ('训练技巧', '分享科学的宠物训练方法，建立你和宠物之间的默契。',           'star',      'yellow'),
    ('社区活动', '参与线下宠物聚会、公益活动，认识更多养宠朋友。',             'community', 'blue')
) AS t(title, description, icon, color)
WHERE NOT EXISTS (SELECT 1 FROM highlights);

-- 验证（执行完可以看一下输出）
SELECT 'pets count:', COUNT(*) FROM pets
UNION ALL
SELECT 'highlights count:', COUNT(*) FROM highlights;