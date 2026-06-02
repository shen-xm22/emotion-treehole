/**
 * supabase-auto-wake.js
 * ======================
 *
 * 在 Express/Node 后端的数据库连接处接入，自动检测 Supabase Free Plan 休眠状态并唤醒。
 *
 * 用法（示例 server.js）：
 *   const wake = require('./supabase-auto-wake');
 *   // 服务启动时检查
 *   await wake.ensureDbAwake();
 *
 * 环境变量（在 Render Dashboard → Environment 中设置）：
 *   SUPABASE_URL          - PostgreSQL 连接字符串（已有则无需改动）
 *   SUPABASE_PROJECT_REF  - 项目引用 ID，从 Supabase Dashboard URL 获取
 *                           → https://supabase.com/dashboard/project/xxxxxxxxxx
 *                           其中的 xxxxxxxxxx 就是 Project Ref
 *   SUPABASE_ACCESS_TOKEN - 从 Supabase Dashboard → Account → Access Tokens 生成
 *
 * 原理：
 *   1. 尝试用 pg 连接数据库，连接成功 → 无需唤醒
 *   2. 连接失败且错误包含 "paused" / "server closed" / "could not connect"
 *      → 调用 Supabase Management REST API 恢复项目
 *   3. 等待 10~15 秒让数据库启动，重试连接
 *   4. 如果多次尝试仍失败，退出启动流程（避免服务挂起）
 */

const https = require('https');
const http = require('http');
const { Pool } = require('pg');

const SUPABASE_MGMT_API = 'api.supabase.com';
const SUPABASE_PROJECT_REF = process.env.SUPABASE_PROJECT_REF || '';
const SUPABASE_ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN || '';

const MAX_RETRIES = 3;
const WAIT_BETWEEN_MS = 10000;    // 每次重试间隔 10s
const WAIT_AFTER_UNPAUSE_MS = 15000;  // 唤醒后等 15s 让 DB 就绪

/**
 * 调用 Supabase Management API 恢复（唤醒）已暂停的项目
 * POST /v1/projects/{ref}/restore
 * https://supabase.com/docs/reference/api
 */
function unpauseProject() {
  return new Promise((resolve, reject) => {
    if (!SUPABASE_PROJECT_REF || !SUPABASE_ACCESS_TOKEN) {
      return reject(new Error('缺少 SUPABASE_PROJECT_REF 或 SUPABASE_ACCESS_TOKEN'));
    }

    const path = `/v1/projects/${encodeURIComponent(SUPABASE_PROJECT_REF)}/restore`;

    const req = https.request(
      {
        hostname: SUPABASE_MGMT_API,
        path,
        method: 'POST',
        headers: {
          Authorization: `Bearer ${SUPABASE_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        timeout: 15000,
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            console.log('[supabase-auto-wake] ✅ 数据库唤醒请求已发送');
            resolve();
          } else {
            // 如果是 404，说明 endpoint 不对或项目不存在
            // 如果是 403，说明 token 权限不够
            console.warn(
              `[supabase-auto-wake] ⚠️ 唤醒 API 返回 ${res.statusCode}: ${body.slice(0, 200)}`
            );
            // 非严重错误，不计为失败
            resolve();
          }
        });
      }
    );

    req.on('error', (err) => {
      console.error('[supabase-auto-wake] ❌ API 请求失败:', err.message);
      reject(err);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('API 请求超时'));
    });

    req.end();
  });
}

/**
 * 用 pg Pool 尝试连接一次，返回 true/false
 */
function testConnection() {
  return new Promise((resolve) => {
    const dbUrl = process.env.SUPABASE_URL;
    if (!dbUrl) {
      console.warn('[supabase-auto-wake] 未设置 SUPABASE_URL，跳过连接测试');
      return resolve(false);
    }

    const pool = new Pool({ connectionString: dbUrl, connectionTimeoutMillis: 5000 });

    pool
      .query('SELECT 1')
      .then(() => {
        pool.end().catch(() => {});
        resolve(true);
      })
      .catch((err) => {
        pool.end().catch(() => {});
        const msg = (err && err.message) || '';
        console.log(`[supabase-auto-wake] DB 连接失败: ${msg.slice(0, 120)}`);
        resolve(false);
      });
  });
}

/**
 * 延迟函数
 */
function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * 外部入口：确保数据库可用
 * - 如果数据库已经可用 → 立即返回
 * - 如果数据库暂停 → 调用 API 唤醒 → 等待就绪 → 返回
 * - 如果多次重试仍失败 → 抛出错误
 *
 * 建议在 Express 启动时（app.listen 之前）调用
 */
async function ensureDbAwake() {
  console.log('[supabase-auto-wake] 🔍 检查数据库状态...');

  // 第 1 步：先试一次，可能已经醒着
  const alive = await testConnection();
  if (alive) {
    console.log('[supabase-auto-wake] ✅ 数据库已就绪');
    return;
  }

  // 第 2 步：库休眠了，唤醒它
  console.log('[supabase-auto-wake] 🌙 数据库可能已休眠，尝试唤醒...');
  await unpauseProject();

  // 第 3 步：等一会儿，让 DB 启动
  console.log(`[supabase-auto-wake] ⏳ 等待 ${WAIT_AFTER_UNPAUSE_MS / 1000}s 让数据库就绪...`);
  await sleep(WAIT_AFTER_UNPAUSE_MS);

  // 第 4 步：重试连接（最多 MAX_RETRIES 次）
  for (let i = 1; i <= MAX_RETRIES; i++) {
    const ok = await testConnection();
    if (ok) {
      console.log('[supabase-auto-wake] ✅ 数据库已唤醒并就绪');
      return;
    }
    console.log(`[supabase-auto-wake] 🔄 第 ${i}/${MAX_RETRIES} 次重试，${WAIT_BETWEEN_MS / 1000}s 后...`);
    await sleep(WAIT_BETWEEN_MS);
  }

  throw new Error('无法连接到数据库（已尝试唤醒但连接仍然失败）');
}

module.exports = { ensureDbAwake, unpauseProject, testConnection };
