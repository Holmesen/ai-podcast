-- AI播客采访应用 数据库结构
-- 适用于 Supabase PostgreSQL
-- 所有表以 podcast_ 为前缀

-- 启用必要的扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

----------------------------------------------------
-- 用户表
----------------------------------------------------
CREATE TABLE podcast_user (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,              -- 用户邮箱，唯一
    password_hash VARCHAR(255),                      -- 密码哈希（可选，支持社交登录时可为空）
    username VARCHAR(100) NOT NULL,                  -- 用户名
    display_name VARCHAR(100),                       -- 显示名称
    avatar_url TEXT,                                 -- 头像URL
    bio TEXT,                                        -- 个人简介
    preferences JSONB DEFAULT '{}'::JSONB,           -- 用户偏好设置（JSON格式）
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),   -- 创建时间
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),   -- 更新时间
    last_login_at TIMESTAMPTZ,                       -- 最后登录时间
    is_active BOOLEAN DEFAULT TRUE,                  -- 是否活跃
    is_verified BOOLEAN DEFAULT FALSE,               -- 是否已验证邮箱
    
    CONSTRAINT email_check CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

COMMENT ON TABLE podcast_user IS '用户表 - 存储所有注册用户信息';

----------------------------------------------------
-- AI 主持人表
----------------------------------------------------
CREATE TABLE podcast_host (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,                      -- 主持人名称
    style VARCHAR(100) NOT NULL,                     -- 主持风格
    avatar_url TEXT NOT NULL,                        -- 头像URL
    description TEXT NOT NULL,                       -- 主持人描述
    expertise TEXT[] DEFAULT '{}',                   -- 专长领域（数组）
    voice_id VARCHAR(100),                           -- 关联的语音ID
    personality_traits JSONB DEFAULT '{}'::JSONB,    -- 个性特点
    prompt_template TEXT,                            -- 系统提示模板
    is_featured BOOLEAN DEFAULT FALSE,               -- 是否为推荐主持人
    is_custom BOOLEAN DEFAULT FALSE,                 -- 是否为自定义主持人
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),   -- 创建时间
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()    -- 更新时间
);

COMMENT ON TABLE podcast_host IS 'AI主持人表 - 存储所有AI主持人信息与个性化配置';

----------------------------------------------------
-- 话题分类表
----------------------------------------------------
CREATE TABLE podcast_topic_category (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,                      -- 分类名称
    description TEXT,                                -- 分类描述
    icon_name VARCHAR(100),                          -- 图标名称
    color VARCHAR(50),                               -- 分类颜色
    display_order INT DEFAULT 0,                     -- 显示顺序
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),   -- 创建时间
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()    -- 更新时间
);

COMMENT ON TABLE podcast_topic_category IS '话题分类表 - 存储播客话题的分类信息';

----------------------------------------------------
-- 话题表
----------------------------------------------------
CREATE TABLE podcast_topic (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES podcast_topic_category(id), -- 分类ID
    title VARCHAR(200) NOT NULL,                     -- 话题标题
    description TEXT,                                -- 话题描述
    questions TEXT[] DEFAULT '{}',                   -- 建议问题列表
    keywords TEXT[] DEFAULT '{}',                    -- 关键词列表
    popularity_score FLOAT DEFAULT 0,                -- 热度评分
    background_image_url TEXT,                       -- 背景图片URL
    prompt_hints TEXT,                               -- 提示词建议
    is_featured BOOLEAN DEFAULT FALSE,               -- 是否为推荐话题
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),   -- 创建时间
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),   -- 更新时间
    
    CONSTRAINT title_min_length CHECK (LENGTH(title) >= 3)
);

COMMENT ON TABLE podcast_topic IS '话题表 - 存储所有可选播客话题';

----------------------------------------------------
-- 播客表
----------------------------------------------------
CREATE TABLE podcast (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES podcast_user(id) ON DELETE CASCADE, -- 用户ID
    host_id UUID NOT NULL REFERENCES podcast_host(id),  -- 主持人ID
    topic_id UUID REFERENCES podcast_topic(id),         -- 话题ID（可为空，支持自定义话题）
    title VARCHAR(200) NOT NULL,                     -- 播客标题
    description TEXT,                                -- 播客描述
    custom_topic VARCHAR(200),                       -- 自定义话题（当topic_id为空时）
    duration INTEGER DEFAULT 0,                      -- 时长（秒）
    publish_status VARCHAR(50) DEFAULT 'draft',      -- 发布状态：draft, published, private
    cover_image_url TEXT,                            -- 封面图片URL
    audio_url TEXT,                                  -- 音频文件URL
    tags TEXT[] DEFAULT '{}',                        -- 标签列表
    plays_count INTEGER DEFAULT 0,                   -- 播放次数
    favorites_count INTEGER DEFAULT 0,               -- 收藏次数
    is_downloadable BOOLEAN DEFAULT TRUE,            -- 是否可下载
    show_ai_attribution BOOLEAN DEFAULT TRUE,        -- 是否显示AI标识
    is_deleted BOOLEAN DEFAULT TRUE,                 -- 是否已删除标识
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),   -- 创建时间
    published_at TIMESTAMPTZ,                        -- 发布时间
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),   -- 更新时间
    deleted_at TIMESTAMPTZ,                          -- 删除时间
    
    CONSTRAINT status_check CHECK (publish_status IN ('draft', 'published', 'private'))
);

COMMENT ON TABLE podcast IS '播客表 - 存储用户创建的所有播客信息';

----------------------------------------------------
-- 播客章节表
----------------------------------------------------
CREATE TABLE podcast_chapter (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    podcast_id UUID NOT NULL REFERENCES podcast(id) ON DELETE CASCADE, -- 播客ID
    title VARCHAR(200) NOT NULL,                     -- 章节标题
    start_time INTEGER NOT NULL,                     -- 开始时间（秒）
    end_time INTEGER NOT NULL,                       -- 结束时间（秒）
    summary TEXT,                                    -- 章节内容概要
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),   -- 创建时间
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),   -- 更新时间
    
    CONSTRAINT time_check CHECK (start_time < end_time),
    CONSTRAINT time_positive CHECK (start_time >= 0 AND end_time > 0)
);

COMMENT ON TABLE podcast_chapter IS '播客章节表 - 存储播客的章节划分信息';

----------------------------------------------------
-- 对话消息表
----------------------------------------------------
CREATE TABLE podcast_message (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    podcast_id UUID NOT NULL REFERENCES podcast(id) ON DELETE CASCADE, -- 播客ID
    speaker_type VARCHAR(50) NOT NULL,               -- 发言者类型：host, user
    content TEXT NOT NULL,                           -- 消息内容
    timestamp INTEGER NOT NULL,                      -- 时间戳（秒）
    audio_segment_url TEXT,                          -- 音频片段URL
    original_audio_url TEXT,                         -- 原始录音URL（用户发言时）
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),   -- 创建时间
    
    CONSTRAINT speaker_check CHECK (speaker_type IN ('host', 'user'))
);

COMMENT ON TABLE podcast_message IS '对话消息表 - 存储播客中的所有对话内容';

----------------------------------------------------
-- 内容总结表
----------------------------------------------------
CREATE TABLE podcast_summary (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    podcast_id UUID NOT NULL REFERENCES podcast(id) ON DELETE CASCADE, -- 播客ID
    key_points TEXT[] DEFAULT '{}',                  -- 主要观点
    notable_quotes TEXT[] DEFAULT '{}',              -- 精彩语录
    practical_tips TEXT[] DEFAULT '{}',              -- 实用建议
    follow_up_actions TEXT[] DEFAULT '{}',           -- 后续行动
    summary_text TEXT,                               -- 总结文本
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),   -- 创建时间
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()    -- 更新时间
);

COMMENT ON TABLE podcast_summary IS '内容总结表 - 存储播客的结构化内容总结';

----------------------------------------------------
-- 用户笔记表
----------------------------------------------------
CREATE TABLE podcast_note (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES podcast_user(id) ON DELETE CASCADE, -- 用户ID
    podcast_id UUID NOT NULL REFERENCES podcast(id) ON DELETE CASCADE, -- 播客ID
    content TEXT NOT NULL,                           -- 笔记内容
    timestamp INTEGER,                               -- 对应播客的时间点（秒）
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),   -- 创建时间
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()    -- 更新时间
);

COMMENT ON TABLE podcast_note IS '用户笔记表 - 存储用户在播客中添加的笔记';

----------------------------------------------------
-- 书签表
----------------------------------------------------
CREATE TABLE podcast_bookmark (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES podcast_user(id) ON DELETE CASCADE, -- 用户ID
    podcast_id UUID NOT NULL REFERENCES podcast(id) ON DELETE CASCADE, -- 播客ID
    timestamp INTEGER NOT NULL,                      -- 书签时间点（秒）
    title VARCHAR(200),                              -- 书签标题
    description TEXT,                                -- 书签描述
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),   -- 创建时间
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),   -- 更新时间
    
    CONSTRAINT bookmark_unique UNIQUE(user_id, podcast_id, timestamp)
);

COMMENT ON TABLE podcast_bookmark IS '书签表 - 存储用户在播客中添加的书签';

----------------------------------------------------
-- 用户播客收藏表
----------------------------------------------------
CREATE TABLE podcast_favorite (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES podcast_user(id) ON DELETE CASCADE, -- 用户ID
    podcast_id UUID NOT NULL REFERENCES podcast(id) ON DELETE CASCADE, -- 播客ID
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),   -- 创建时间
    
    CONSTRAINT favorite_unique UNIQUE(user_id, podcast_id)
);

COMMENT ON TABLE podcast_favorite IS '收藏表 - 存储用户收藏的播客';

----------------------------------------------------
-- 分享记录表
----------------------------------------------------
CREATE TABLE podcast_share (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    podcast_id UUID NOT NULL REFERENCES podcast(id) ON DELETE CASCADE, -- 播客ID
    user_id UUID NOT NULL REFERENCES podcast_user(id) ON DELETE CASCADE, -- 分享用户ID
    share_type VARCHAR(50) NOT NULL,                 -- 分享类型：wechat, weibo, qq, link
    shared_url VARCHAR(255),                         -- 分享链接
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),   -- 创建时间
    
    CONSTRAINT share_type_check CHECK (share_type IN ('wechat', 'weibo', 'qq', 'link'))
);

COMMENT ON TABLE podcast_share IS '分享记录表 - 存储用户分享播客的记录';

----------------------------------------------------
-- 播放记录表
----------------------------------------------------
CREATE TABLE podcast_play_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES podcast_user(id) ON DELETE CASCADE, -- 用户ID
    podcast_id UUID NOT NULL REFERENCES podcast(id) ON DELETE CASCADE, -- 播客ID
    last_position INTEGER DEFAULT 0,                 -- 上次播放位置（秒）
    is_completed BOOLEAN DEFAULT FALSE,              -- 是否已完成播放
    play_count INTEGER DEFAULT 1,                    -- 播放次数
    first_played_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), -- 首次播放时间
    last_played_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), -- 最后播放时间
    
    CONSTRAINT play_history_unique UNIQUE(user_id, podcast_id)
);

COMMENT ON TABLE podcast_play_history IS '播放记录表 - 存储用户播放播客的历史记录';

----------------------------------------------------
-- 系统设置表
----------------------------------------------------
CREATE TABLE podcast_system_setting (
    id VARCHAR(100) PRIMARY KEY,                     -- 设置键名
    value JSONB NOT NULL,                            -- 设置值（JSON格式）
    description TEXT,                                -- 设置描述
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),   -- 创建时间
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()    -- 更新时间
);

COMMENT ON TABLE podcast_system_setting IS '系统设置表 - 存储全局系统配置';

-- 触发器：自动更新updated_at字段
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 为所有需要自动更新updated_at的表创建触发器
DO $$
DECLARE
    tables TEXT[] := ARRAY['podcast_user', 'podcast_host', 'podcast_topic_category', 'podcast_topic', 
                           'podcast', 'podcast_chapter', 'podcast_summary', 
                           'podcast_note', 'podcast_bookmark', 'podcast_system_setting'];
    t TEXT;
BEGIN
    FOREACH t IN ARRAY tables
    LOOP
        EXECUTE format('
            CREATE TRIGGER update_%s_modtime
            BEFORE UPDATE ON %s
            FOR EACH ROW
            EXECUTE FUNCTION update_modified_column();
        ', t, t);
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_podcast_user_id ON podcast(user_id);
CREATE INDEX IF NOT EXISTS idx_podcast_host_id ON podcast(host_id);
CREATE INDEX IF NOT EXISTS idx_podcast_topic_id ON podcast(topic_id);
CREATE INDEX IF NOT EXISTS idx_message_podcast_id ON podcast_message(podcast_id);
CREATE INDEX IF NOT EXISTS idx_chapter_podcast_id ON podcast_chapter(podcast_id);
CREATE INDEX IF NOT EXISTS idx_note_user_id ON podcast_note(user_id);
CREATE INDEX IF NOT EXISTS idx_note_podcast_id ON podcast_note(podcast_id);
CREATE INDEX IF NOT EXISTS idx_bookmark_user_id ON podcast_bookmark(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmark_podcast_id ON podcast_bookmark(podcast_id);
CREATE INDEX IF NOT EXISTS idx_favorite_user_id ON podcast_favorite(user_id);
CREATE INDEX IF NOT EXISTS idx_favorite_podcast_id ON podcast_favorite(podcast_id);
CREATE INDEX IF NOT EXISTS idx_play_history_user_id ON podcast_play_history(user_id);
CREATE INDEX IF NOT EXISTS idx_play_history_podcast_id ON podcast_play_history(podcast_id);
CREATE INDEX IF NOT EXISTS idx_share_podcast_id ON podcast_share(podcast_id); 
CREATE INDEX IF NOT EXISTS idx_podcast_is_deleted ON podcast(is_deleted);