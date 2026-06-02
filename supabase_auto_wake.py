"""
supabase_auto_wake.py
=====================

Python 版 Supabase 自动唤醒模块，用于 FastAPI 后端。
检测 Supabase Free Plan 休眠并自动调用 Management API 唤醒。

用法：
    from supabase_auto_wake import ensure_db_awake
    ensure_db_awake(supabase, SUPABASE_URL)

环境变量（在 Render Dashboard → Environment 中设置）：
    SUPABASE_PROJECT_REF   - 项目引用 ID，从 Supabase Dashboard URL 获取
    SUPABASE_ACCESS_TOKEN  - 从 Supabase Dashboard → Account → Access Tokens 生成

如果不设置这两个变量，模块仅做日志记录，不会报错退出。
"""

import os
import time
import logging

import httpx

logger = logging.getLogger('treehole')

# Supabase Management API
MGMT_BASE = "https://api.supabase.com"
PROJECT_REF = os.environ.get("SUPABASE_PROJECT_REF", "")
ACCESS_TOKEN = os.environ.get("SUPABASE_ACCESS_TOKEN", "")

MAX_RETRIES = 3
WAIT_BETWEEN_MS = 10  # seconds
WAIT_AFTER_UNPAUSE_MS = 15  # seconds


def _extract_ref_from_url(url: str) -> str:
    """从 SUPABASE_URL 中猜测 project ref（URL 子域名部分）。"""
    # https://nzlnkgoipjhekrgzudgf.supabase.co → nzlnkgoipjhekrgzudgf
    if not url:
        return ""
    try:
        from urllib.parse import urlparse
        host = urlparse(url).hostname or ""
        return host.split(".")[0]
    except Exception:
        return ""


def _test_connection(supabase) -> bool:
    """尝试执行一个简单查询，检测数据库是否可用。"""
    try:
        supabase.table("users").select("id").limit(1).execute()
        return True
    except Exception as e:
        logger.warning(f"[auto-wake] 连接测试失败: {e}")
        return False


def _unpause_project(ref: str, token: str) -> bool:
    """调用 Supabase Management API 恢复项目。

    支持多个已知 endpoint，以防 API 版本变更。
    """
    endpoints = [
        f"/v1/projects/{ref}/restore",      # 旧版
        f"/v1/projects/{ref}/resume",        # 新版
    ]

    for path in endpoints:
        try:
            resp = httpx.post(
                f"{MGMT_BASE}{path}",
                headers={
                    "Authorization": f"Bearer {token}",
                    "Content-Type": "application/json",
                },
                timeout=15,
            )
            if resp.is_success:
                logger.info(f"[auto-wake] ✅ 唤醒成功 ({path})")
                return True
            elif resp.status_code == 404:
                # endpoint 不存在，试下一个
                continue
            elif resp.status_code == 409:
                # 409 Conflict: 项目可能已经醒着或正忙
                logger.info(f"[auto-wake] 项目状态冲突 (409)，可能已就绪")
                return True
            else:
                logger.warning(f"[auto-wake] ⚠️ 唤醒失败 {resp.status_code}: {resp.text[:200]}")
                return False
        except Exception as e:
            logger.warning(f"[auto-wake] ⚠️ 请求异常: {e}")
            continue

    logger.warning("[auto-wake] 所有唤醒 endpoint 均失败")
    return False


def ensure_db_awake(supabase, supabase_url: str = "") -> bool:
    """确保 Supabase 数据库可用。

    在 FastAPI 启动事件中调用：
        @app.on_event("startup")
        def startup():
            from supabase_auto_wake import ensure_db_awake
            ensure_db_awake(supabase, SUPABASE_URL)

    返回 True 表示就绪，False 表示无法连接。
    """
    # 第 1 步：先测一次，可能本来就醒着
    if _test_connection(supabase):
        logger.info("[auto-wake] ✅ 数据库已就绪")
        return True

    # 第 2 步：获取 project ref（环境变量 > URL 猜测）
    ref = PROJECT_REF or _extract_ref_from_url(supabase_url)
    token = ACCESS_TOKEN

    if not ref or not token:
        logger.warning(
            "[auto-wake] ⏭️ 未配置 SUPABASE_PROJECT_REF 或 SUPABASE_ACCESS_TOKEN，"
            "跳过自动唤醒。数据库可能已休眠。"
        )
        logger.warning("[auto-wake] 若需自动唤醒，请在 Render 环境变量中设置以上两项。")
        return False

    # 第 3 步：尝试唤醒
    logger.info(f"[auto-wake] 🌙 数据库可能已休眠，尝试唤醒 (project: {ref})...")
    _unpause_project(ref, token)

    # 第 4 步：等待并重试
    logger.info(f"[auto-wake] ⏳ 等待 {WAIT_AFTER_UNPAUSE_MS}s 让数据库就绪...")
    time.sleep(WAIT_AFTER_UNPAUSE_MS)

    for i in range(1, MAX_RETRIES + 1):
        if _test_connection(supabase):
            logger.info("[auto-wake] ✅ 数据库已唤醒并就绪")
            return True
        logger.info(f"[auto-wake] 🔄 第 {i}/{MAX_RETRIES} 次重试，{WAIT_BETWEEN_MS}s 后...")
        time.sleep(WAIT_BETWEEN_MS)

    logger.error("[auto-wake] ❌ 无法连接到数据库（唤醒后仍失败）")
    return False
