# AI 播客应用数据库结构

本文档详细介绍了 AI 播客应用的数据库结构设计，使用 Supabase 的 PostgreSQL 实现。

## 设计原则

- **表前缀**：所有表名以`podcast_`为前缀，便于识别和管理
- **字段类型**：根据数据性质选择适当类型，避免冗余和浪费
- **关系设计**：使用引用完整性约束（外键）确保数据一致性
- **可扩展性**：采用 JSONB 字段存储可变配置，提高灵活性
- **中文注释**：所有表和字段都包含中文注释，便于理解和维护
- **索引优化**：为常用查询创建索引，提高检索性能

## 核心表结构

### 用户相关

- `podcast_user`：存储用户账户信息
- `podcast_note`：用户在播客中添加的笔记
- `podcast_bookmark`：用户添加的播客书签
- `podcast_favorite`：用户收藏的播客
- `podcast_play_history`：用户播放历史记录

### 内容相关

- `podcast_host`：AI 主持人配置信息
- `podcast_topic_category`：话题分类
- `podcast_topic`：播客话题库
- `podcast`：用户创建的播客
- `podcast_chapter`：播客章节划分
- `podcast_message`：播客对话内容
- `podcast_summary`：播客内容总结

### 互动相关

- `podcast_share`：播客分享记录
- `podcast_system_setting`：系统全局配置

## 关键关系

1. **用户与播客**：一对多关系，一个用户可创建多个播客
2. **主持人与播客**：一对多关系，一个 AI 主持人可用于多个播客
3. **话题与播客**：一对多关系，一个话题可用于多个播客
4. **播客与消息**：一对多关系，一个播客包含多条对话消息
5. **播客与章节**：一对多关系，一个播客划分为多个章节
6. **用户与播放历史/收藏/笔记/书签**：一对多关系，用户可有多个相关记录

## 数据库扩展

数据库利用 PostgreSQL 的扩展功能：

- `uuid-ossp`：生成 UUID 主键
- `pgcrypto`：加密功能（密码哈希等）

## 重要设计考量

1. **唯一约束**：在关键字段上设置唯一约束，避免重复数据
2. **级联删除**：用户删除和播客删除时，相关记录自动清理
3. **状态管理**：使用 CHECK 约束验证状态字段，保证数据有效性
4. **时间戳**：所有表都有创建时间，需要的表都有更新时间
5. **自动更新**：通过触发器自动更新`updated_at`字段

## 如何使用

### 初始化数据库

1. 在 Supabase 项目中，进入 SQL 编辑器
2. 复制并执行`schema.sql`文件内容
3. 检查是否所有表和索引都创建成功

### 常见查询示例

**获取用户创建的所有播客**：

```sql
SELECT p.* FROM podcast p
WHERE p.user_id = '用户UUID'
ORDER BY p.created_at DESC;
```

**获取热门播客**：

```sql
SELECT p.*, COUNT(ph.id) as play_count
FROM podcast p
LEFT JOIN podcast_play_history ph ON p.id = ph.podcast_id
WHERE p.publish_status = 'published'
GROUP BY p.id
ORDER BY play_count DESC
LIMIT 10;
```

**获取播客及其章节**：

```sql
SELECT p.*, json_agg(pc.*) as chapters
FROM podcast p
LEFT JOIN podcast_chapter pc ON p.id = pc.podcast_id
WHERE p.id = '播客UUID'
GROUP BY p.id;
```

## 索引说明

数据库包含多个索引以优化查询性能：

- 所有外键字段索引，提高关联查询速度
- 用户 ID 索引，优化按用户过滤的查询
- 播客 ID 索引，优化播客相关的查询

## 注意事项

1. 在生产环境部署前，建议配置适当的访问权限和行级安全策略
2. 对于大规模应用，考虑定期优化和监控数据库性能
3. 针对用户生成内容，建议实现适当的内容过滤和审核机制
