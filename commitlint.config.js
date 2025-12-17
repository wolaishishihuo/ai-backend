'use strict';

/**
 * Git 提交规范配置
 *
 * 提交格式: <type>(<scope>): <subject>
 *
 * type 类型说明:
 *   feat     - 新功能
 *   fix      - 修复 bug
 *   docs     - 文档变更
 *   style    - 代码格式（不影响功能，如空格、分号等）
 *   refactor - 重构（既不是新增功能，也不是修复 bug）
 *   perf     - 性能优化
 *   test     - 添加或修改测试
 *   chore    - 构建过程或辅助工具的变动
 *   revert   - 回滚提交
 *   build    - 构建系统或外部依赖项的更改
 *   ci       - CI 配置文件和脚本的更改
 *
 * scope 作用域（可选）:
 *   模块名称，如 auth, user, prisma, redis 等
 *
 * subject 描述:
 *   简短描述，不超过 72 个字符
 *
 * 示例:
 *   feat(user): 添加用户登录功能
 *   fix(auth): 修复 token 过期问题
 *   docs: 更新 README 文档
 *   refactor(prisma): 重构数据库查询逻辑
 */

module.exports = {
  extends: ['@commitlint/config-angular'],
  rules: {
    // type 类型定义
    'type-enum': [
      2,
      'always',
      [
        'feat', // 新功能
        'fix', // 修复 bug
        'docs', // 文档变更
        'style', // 代码格式
        'refactor', // 重构
        'perf', // 性能优化
        'test', // 测试
        'chore', // 构建/工具
        'revert', // 回滚
        'build', // 构建系统
        'ci' // CI 配置
      ]
    ],
    // 标题最大长度 200 字符
    'header-max-length': [2, 'always', 200]
  }
};
