/**
 * 上下文分析器
 * 用于细粒度检测风险，区分不同场景下的操作风险等级
 */

export interface ContextAnalysis {
  isReadOnly: boolean;           // 是否只读操作
  hasCondition: boolean;          // 是否有条件限制
  scope: 'all' | 'partial' | 'single';  // 影响范围
  targetEnvironment: string;      // 目标环境（test, staging, prod等）
  confidence: number;             // 分析置信度 (0-1)
}

/**
 * 分析 SQL 语句的上下文
 */
export function analyzeSQLContext(sql: string): ContextAnalysis {
  const sqlUpper = sql.toUpperCase().trim();

  // 1. 检测是否为只读操作
  const readOnlyKeywords = ['SELECT', 'SHOW', 'DESCRIBE', 'DESC', 'EXPLAIN', 'WITH'];
  const isReadOnly = readOnlyKeywords.some(keyword =>
    sqlUpper.startsWith(keyword)
  );

  // 2. 检测影响范围
  let scope: ContextAnalysis['scope'] = 'partial';

  if (isReadOnly) {
    scope = 'all';  // SELECT 可能查所有数据，但不改变数据
  } else {
    // 检测是否有 WHERE 条件
    const hasWhere = /\bWHERE\b/i.test(sql);

    // 检测是否有 LIMIT 限制
    const hasLimit = /\bLIMIT\s+(\d+|1)\b/i.test(sql);

    // 检测是否删除/更新所有数据
    const deleteUpdateAllPattern = /(DELETE|UPDATE)\s+FROM\s+\w+\s*;?\s*$/i;
    const isDeleteUpdateAll = deleteUpdateAllPattern.test(sql.trim());

    if (isDeleteUpdateAll) {
      scope = 'all';  // 删除/更新所有数据
    } else if (hasWhere || hasLimit) {
      scope = 'partial';  // 有条件限制
    } else {
      scope = 'all';  // 无条件的写操作，默认按最坏情况
    }
  }

  // 3. 检测目标环境
  const tableNameMatch = sql.match(/FROM\s+(\w+)|UPDATE\s+(\w+)|INTO\s+(\w+)/i);
  const tableName = tableNameMatch ? tableNameMatch[1] || tableNameMatch[2] || tableNameMatch[3] : '';
  const targetEnvironment = tableName.toLowerCase().includes('test')
    ? 'test'
    : tableName.toLowerCase().includes('staging')
    ? 'staging'
    : tableName.toLowerCase().includes('dev')
    ? 'dev'
    : 'prod';

  return {
    isReadOnly,
    hasCondition: /\bWHERE\b/i.test(sql),
    scope,
    targetEnvironment,
    confidence: 0.85
  };
}

/**
 * 分析 Shell 命令的上下文
 */
export function analyzeShellContext(command: string): ContextAnalysis {
  const cmdLower = command.toLowerCase().trim();

  // 1. 检测是否为只读操作
  const readOnlyCommands = ['ls', 'cat', 'grep', 'find', 'echo', 'pwd', 'whoami', 'ps'];
  const isReadOnly = readOnlyCommands.some(cmd =>
    cmdLower.startsWith(cmd) && /[\s\n]|$/.test(cmdLower.slice(cmd.length))
  );

  // 2. 检测影响范围
  let scope: ContextAnalysis['scope'] = 'partial';

  // 检测 -rf 或 -r 等危险标志
  const hasForceDelete = /rm\s+(-rf|-fr|-r)/i.test(command);
  const hasRecursive = /\s-(?!.*\br\b)[a-zA-Z]*r[a-zA-Z]*\b/.test(command);

  // 检测是否作用于根目录
  const affectsRoot = /rm\s+.*[\/]|rm\s+-rf\s+\//i.test(command);

  // 检测是否作用于特定目录
  const hasPathLimitation = /[\/\w]+$/.test(command.trim());

  if (hasForceDelete && !hasPathLimitation) {
    scope = 'all';
  } else if (hasForceDelete && hasPathLimitation) {
    scope = 'partial';
  } else if (affectsRoot) {
    scope = 'all';
  } else {
    scope = 'partial';
  }

  // 3. 检测目标环境
  const targetEnvironment = cmdLower.includes('/test/')
    ? 'test'
    : cmdLower.includes('/dev/')
    ? 'dev'
    : cmdLower.includes('prod')
    ? 'prod'
    : 'unknown';

  return {
    isReadOnly,
    hasCondition: false,  // Shell 命令通常没有"条件"概念
    scope,
    targetEnvironment,
    confidence: 0.75
  };
}

/**
 * 分析 API 调用的上下文
 */
export function analyzeAPIContext(apiCall: string): ContextAnalysis {
  const apiLower = apiCall.toLowerCase();

  // 1. 检测是否为只读操作
  const readOnlyMethods = ['GET', 'HEAD', 'OPTIONS'];
  const isReadOnly = readOnlyMethods.some(method =>
    apiLower.includes(method.toLowerCase())
  );

  // 2. 检测影响范围
  let scope: ContextAnalysis['scope'] = 'partial';

  // 检测是否批量操作
  const isBatch = /batch|bulk|all|every/i.test(apiCall);
  // 检测是否有 ID 限制
  const hasIdLimit = /\/\d+|id\s*=\s*\d+/i.test(apiCall);

  if (isBatch && !hasIdLimit) {
    scope = 'all';
  } else if (hasIdLimit) {
    scope = 'single';
  } else {
    scope = 'partial';
  }

  // 3. 检测目标环境
  const targetEnvironment = apiLower.includes('test')
    ? 'test'
    : apiLower.includes('staging')
    ? 'staging'
    : apiLower.includes('dev')
    ? 'dev'
    : apiLower.includes('prod')
    ? 'prod'
    : 'unknown';

  return {
    isReadOnly,
    hasCondition: hasIdLimit,
    scope,
    targetEnvironment,
    confidence: 0.70
  };
}

/**
 * 自动检测输入类型并分析上下文
 */
export function analyzeContext(input: string, type: 'auto' | 'sql' | 'shell' | 'api' = 'auto'): ContextAnalysis {
  if (type === 'auto') {
    // 自动检测类型
    const inputTrimmed = input.trim();

    // 检测 SQL
    if (/^(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|TRUNCATE)/i.test(inputTrimmed)) {
      return analyzeSQLContext(input);
    }

    // 检测 Shell 命令
    if (/^(rm|cp|mv|chmod|chown|git|docker|kubectl)/i.test(inputTrimmed)) {
      return analyzeShellContext(input);
    }

    // 检测 API 调用
    if (/^(GET|POST|PUT|DELETE|PATCH)|https?:\/\//i.test(inputTrimmed)) {
      return analyzeAPIContext(input);
    }

    // 默认当作通用文本处理
    return {
      isReadOnly: false,
      hasCondition: false,
      scope: 'partial',
      targetEnvironment: 'unknown',
      confidence: 0.5
    };
  }

  // 根据指定类型分析
  switch (type) {
    case 'sql':
      return analyzeSQLContext(input);
    case 'shell':
      return analyzeShellContext(input);
    case 'api':
      return analyzeAPIContext(input);
    default:
      return {
        isReadOnly: false,
        hasCondition: false,
        scope: 'partial',
        targetEnvironment: 'unknown',
        confidence: 0.5
      };
  }
}

/**
 * 根据上下文调整风险等级
 */
export function adjustRiskByContext(
  originalLevel: 'critical' | 'high' | 'medium',
  context: ContextAnalysis
): 'critical' | 'high' | 'medium' | 'safe' {
  // 如果是只读操作，直接判定为安全
  if (context.isReadOnly) {
    return 'safe';
  }

  // 如果是测试环境，降低一级风险
  if (context.targetEnvironment === 'test' || context.targetEnvironment === 'dev') {
    if (originalLevel === 'critical') return 'high';
    if (originalLevel === 'high') return 'medium';
    if (originalLevel === 'medium') return 'safe';
  }

  // 根据影响范围调整
  if (context.scope === 'single') {
    // 只影响单条记录，降低风险
    if (originalLevel === 'critical') return 'high';
    if (originalLevel === 'high') return 'medium';
    if (originalLevel === 'medium') return 'safe';
  } else if (context.scope === 'all') {
    // 影响所有数据，保持或提升风险
    return originalLevel;
  }

  // partial 范围，保持原风险等级
  return originalLevel;
}

/**
 * 生成上下文说明
 */
export function generateContextDescription(context: ContextAnalysis): string {
  const parts: string[] = [];

  if (context.isReadOnly) {
    parts.push('只读操作');
  }

  if (context.hasCondition) {
    parts.push('有条件限制');
  }

  if (context.scope === 'all') {
    parts.push('影响所有数据');
  } else if (context.scope === 'single') {
    parts.push('影响单条记录');
  }

  if (context.targetEnvironment !== 'unknown') {
    parts.push(`目标环境：${context.targetEnvironment}`);
  }

  return parts.length > 0 ? parts.join('，') : '无特殊上下文信息';
}
