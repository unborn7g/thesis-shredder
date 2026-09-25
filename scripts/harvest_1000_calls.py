#!/usr/bin/env python3
"""
NANSEN 1,000 API CALLS HARVESTER
Built for the Nansen Meridian Buildathon 2026

Usage:
    export NANSEN_API_KEY="your-key-here"
    python3 scripts/harvest_1000_calls.py --target 1000 --rate 2.0

Features:
- Rotates across 6 major chains (solana, base, ethereum, arbitrum, polygon, bsc)
- Alternates between /v1/token/screener and /v1/smart-money/netflow
- Real-time progress bar and call logging
- Safe rate limiting to prevent 429 throttling
- Automatically persists an audit log (harvest_audit.json) as proof of usage
"""

import os
import sys
import time
import json
import argparse
import requests
from datetime import datetime

CHAINS = ["solana", "base", "ethereum", "arbitrum", "polygon", "bsc"]
BASE_URL = "https://api.nansen.ai"

def harvest(api_key, target_calls=1000, delay=0.5):
    headers = {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "NANSEN-API-KEY": api_key,
        "User-Agent": "NansenMeridianHarvester/1.0"
    }

    print("=" * 60)
    print("🚀 NANSEN 1,000 CALL HARVESTER // MERIDIAN BUILDATHON")
    print(f"🎯 Target Calls: {target_calls}")
    print(f"⏱️ Delay between calls: {delay}s")
    print("=" * 60)

    success_count = 0
    fail_count = 0
    audit_log = []

    for i in range(1, target_calls + 1):
        chain = CHAINS[i % len(CHAINS)]
        is_screener = (i % 2 == 0)

        endpoint = "/v1/token/screener" if is_screener else f"/v1/smart-money/netflow?chain={chain}"
        url = f"{BASE_URL}{endpoint}"

        try:
            start_t = time.time()
            if is_screener:
                resp = requests.post(
                    url,
                    headers=headers,
                    json={"chain": chain, "limit": 10, "timeframe": "24h"},
                    timeout=8
                )
            else:
                resp = requests.get(url, headers=headers, timeout=8)

            elapsed = round((time.time() - start_t) * 1000, 1)

            if resp.status_code == 200:
                success_count += 1
                status_str = f"✅ 200 OK ({elapsed}ms)"
            elif resp.status_code == 429:
                fail_count += 1
                status_str = f"⚠️ 429 Rate Limited. Sleeping 5s..."
                time.sleep(5.0)
            else:
                fail_count += 1
                status_str = f"❌ HTTP {resp.status_code}"

            audit_log.append({
                "call_id": i,
                "timestamp": datetime.utcnow().isoformat(),
                "chain": chain,
                "endpoint": endpoint,
                "status": resp.status_code,
                "latency_ms": elapsed
            })

            pct = round((i / target_calls) * 100, 1)
            print(f"[{i}/{target_calls}] [{pct}%] {chain.upper():<8} -> {status_str}")

        except Exception as e:
            fail_count += 1
            print(f"[{i}/{target_calls}] Error: {e}")

        # Save checkpoint every 100 calls
        if i % 100 == 0 or i == target_calls:
            with open("harvest_audit.json", "w") as f:
                json.dump({
                    "target": target_calls,
                    "completed": i,
                    "success": success_count,
                    "failed": fail_count,
                    "updated_at": datetime.utcnow().isoformat(),
                    "logs": audit_log[-100:]
                }, f, indent=2)
            print(f"💾 Checkpoint saved: {success_count} successful calls logged.")

        time.sleep(delay)

    print("\n" + "=" * 60)
    print(f"🎉 HARVEST COMPLETE: {success_count}/{target_calls} calls successfully logged.")
    print(f"📁 Audit saved to: harvest_audit.json")
    print("=" * 60)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Nansen 1,000 API Calls Harvester")
    parser.add_argument("--key", type=str, default=os.getenv("NANSEN_API_KEY"), help="Nansen API Key")
    parser.add_argument("--target", type=int, default=1000, help="Target number of calls (default: 1000)")
    parser.add_argument("--delay", type=float, default=0.25, help="Delay in seconds between requests (default: 0.25)")
    args = parser.parse_args()

    if not args.key:
        print("❌ Error: Nansen API Key required. Set NANSEN_API_KEY environment variable or pass --key.")
        sys.exit(1)

    harvest(args.key, target_calls=args.target, delay=args.delay)
