-- AI播客应用 - 种子数据
-- 用于初始化数据库中的基本数据

-- 默认AI主持人数据
INSERT INTO podcast_host (id, name, style, avatar_url, description, expertise, is_featured, personality_traits) VALUES
(
    '9e8c744c-4b8b-4c1c-a685-b398e54d3b4a',
    'Michael',
    '深度思考型主持人',
    'https://images.unsplash.com/photo-1568602471122-7832951cc4c5',
    '专注于深入探讨话题，善于提出深刻问题，引导嘉宾进行思考和分析',
    ARRAY['科技', '哲学', '社会科学'],
    TRUE,
    '{"traits": ["思考深入", "逻辑清晰", "善于倾听"], "communication_style": "深度探究"}'::JSONB
),
(
    'c4b8d3e2-7f6a-49d1-b5c0-a3e9f1d27b8c',
    'Sarah',
    '灵活友好型主持人',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956',
    '擅长创造轻松友好的谈话氛围，让嘉宾自然分享，适合创意和艺术话题',
    ARRAY['心理学', '艺术', '文化'],
    TRUE,
    '{"traits": ["亲和力强", "思维灵活", "善于共情"], "communication_style": "轻松友好"}'::JSONB
),
(
    'd7e6f5d4-c3b2-a1d0-9e8f-7c6b5a4d3e2f',
    'Alex',
    '商业分析型主持人',
    'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7',
    '专注于商业和创业话题，擅长解析案例和趋势，提供实用见解和建议',
    ARRAY['创业', '金融', '商业策略'],
    FALSE,
    '{"traits": ["分析能力强", "结构化思维", "实用导向"], "communication_style": "精准分析"}'::JSONB
),
(
    'b5a4d3c2-e1f0-9d8c-7b6a-5e4d3c2b1a0f',
    'Emma',
    '教育引导型主持人',
    'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e',
    '专注于教育和自我提升话题，善于提供系统化的思路和学习方法',
    ARRAY['教育', '自我成长', '学习方法'],
    FALSE,
    '{"traits": ["条理清晰", "鼓励性", "耐心"], "communication_style": "引导式教学"}'::JSONB
);

-- 话题分类数据
INSERT INTO podcast_topic_category (id, name, description, icon_name, color, display_order) VALUES
(
    'a1b2c3d4-e5f6-7890-a1b2-c3d4e5f67890',
    '创意与艺术',
    '探索创意思维、艺术创作与文化表达的话题',
    'palette',
    '#FF6B6B',
    1
),
(
    'b2c3d4e5-f6a7-8901-b2c3-d4e5f6a78901',
    '科技与创新',
    '讨论前沿科技、创新趋势与数字化转型',
    'science',
    '#4ECDC4',
    2
),
(
    'c3d4e5f6-a7b8-9012-c3d4-e5f6a7b89012',
    '商业与创业',
    '分享商业洞察、创业经验与职业发展策略',
    'business',
    '#FFD166',
    3
),
(
    'd4e5f6a7-b8c9-0123-d4e5-f6a7b8c90123',
    '心理与成长',
    '探讨心理健康、个人成长与自我提升方法',
    'psychology',
    '#6A0572',
    4
),
(
    'e5f6a7b8-c9d0-1234-e5f6-a7b8c9d01234',
    '健康与生活',
    '关注健康生活、营养饮食与生活方式优化',
    'favorite',
    '#1A936F',
    5
);

-- 热门话题数据
INSERT INTO podcast_topic (id, category_id, title, description, keywords, popularity_score, is_featured) VALUES
(
    'f6a7b8c9-d0e1-2345-f6a7-b8c9d0e12345',
    'a1b2c3d4-e5f6-7890-a1b2-c3d4e5f67890',
    '创意思维方法与实践',
    '探讨跨领域学习如何促进创新思维，以及环境因素对创造力的影响。包含实用的创意激发技巧和实践方法。',
    ARRAY['创意思维', '跨领域学习', '创造力', '思维方法'],
    9.8,
    TRUE
),
(
    'a7b8c9d0-e1f2-3456-a7b8-c9d0e1f23456',
    'b2c3d4e5-f6a7-8901-b2c3-d4e5f6a78901',
    'AI技术发展与未来展望',
    '讨论人工智能的最新发展趋势，探索AI在各行业的应用前景与可能带来的变革。',
    ARRAY['人工智能', 'AI应用', '技术趋势', '未来展望'],
    9.5,
    TRUE
),
(
    'b8c9d0e1-f2a3-4567-b8c9-d0e1f2a34567',
    'c3d4e5f6-a7b8-9012-c3d4-e5f6a7b89012',
    '创业者的心态与韧性',
    '分享成功创业者如何培养积极心态、应对挑战和保持韧性的经验与方法。',
    ARRAY['创业心态', '韧性', '挑战应对', '成功心理'],
    8.9,
    TRUE
),
(
    'c9d0e1f2-a3b4-5678-c9d0-e1f2a3b45678',
    'd4e5f6a7-b8c9-0123-d4e5-f6a7b8c90123',
    '高效学习方法与知识管理',
    '探讨现代环境下的高效学习策略、记忆技巧与个人知识管理系统构建方法。',
    ARRAY['学习方法', '知识管理', '记忆技巧', '效率提升'],
    8.7,
    FALSE
),
(
    'd0e1f2a3-b4c5-6789-d0e1-f2a3b4c56789',
    'e5f6a7b8-c9d0-1234-e5f6-a7b8c9d01234',
    '压力管理与情绪调节',
    '分享科学有效的压力管理策略、情绪调节技巧，以及构建健康心理状态的方法。',
    ARRAY['压力管理', '情绪调节', '心理健康', '冥想'],
    8.5,
    FALSE
);

-- 系统设置数据
INSERT INTO podcast_system_setting (id, value, description) VALUES
(
    'default_podcast_settings',
    '{
        "default_visibility": "public",
        "allow_download": true,
        "show_ai_attribution": true,
        "max_duration_minutes": 60,
        "default_tags": ["AI辅助创建"]
    }'::JSONB,
    '默认播客设置'
),
(
    'user_limits',
    '{
        "max_podcasts_free_tier": 5,
        "max_duration_free_tier": 30,
        "max_podcasts_pro_tier": 50,
        "max_duration_pro_tier": 120
    }'::JSONB,
    '用户限制配置'
),
(
    'recommendation_weights',
    '{
        "recency": 0.4,
        "popularity": 0.3,
        "user_interests": 0.3
    }'::JSONB,
    '推荐算法权重'
); 