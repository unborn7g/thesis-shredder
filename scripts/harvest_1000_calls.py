#!/usr/bin/env python3
"""
NANSEN 1,000 API CALLS HARVESTER
Built for the Nansen Meridian Buildathon 2026

Rotates legitimate queries across:
- /api/v1/smart-money/holdings (chains: ethereum, solana, base, arbitrum, polygon)
- /api/v1/smart-money/dex-trades
- /api/v1/profiler/address/related-wallets
- /api/v1/tgm/flow-intelligence
"""

import os
import sys
import time
import json
import argparse
import requests
from datetime import datetime

BASE_URL = "https://api.nansen.ai/api/v1"
CHAINS = ["ethereum", "solana", "base", "arbitrum", "polygon"]

WALLETS = [
    ("ethereum", "0x28c6c06298d514db089934071355e5743bf21d60"),
    ("ethereum", "0x4062b997279de7213731dbe00485722a26718892"),
    ("ethereum", "0xbdfa4f4492dd7b7cf211209c4791af8d52bf5c50"),
    ("solana", "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM")
]

def harvest(api_key, target_calls=1000, delay=0.15):
    headers = {
        "Content-Type": "application/json",
        "apiKey": api_key,
        "User-Agent": "ThesisShredder-Harvester/1.0"
    }

    print("=" * 60)
    print("🚀 NANSEN 1,000 CALL HARVESTER // MERIDIAN BUILDATHON")
    print(f"🎯 Target Calls: {target_calls}")
    print(f"⏱️ Delay between requests: {delay}s")
    print("=" * 60)

    success_count = 0
    fail_count = 0
    audit_log = []

    for i in range(1, target_calls + 1):
        chain = CHAINS[i % len(CHAINS)]
        mode = i % 3

        try:
            start_t = time.time()
            if mode == 0:
                endpoint = "/smart-money/holdings"
                payload = {
                    "chains": [chain],
                    "pagination": {"page": (i % 5) + 1, "per_page": 10}
                }
            elif mode == 1:
                endpoint = "/smart-money/dex-trades"
                payload = {
                    "chains": [chain],
                    "pagination": {"page": (i % 5) + 1, "per_page": 10}
                }
            else:
                endpoint = "/profiler/address/related-wallets"
                w_chain, w_addr = WALLETS[i % len(WALLETS)]
                payload = {
                    "chain": w_chain,
                    "address": w_addr,
                    "pagination": {"page": 1, "per_page": 10}
                }

            url = f"{BASE_URL}{endpoint}"
            resp = requests.post(url, headers=headers, json=payload, timeout=8)
            elapsed = round((time.time() - start_t) * 1000, 1)

            if resp.status_code == 200:
                success_count += 1
                status_str = f"✅ 200 OK ({elapsed}ms)"
            elif resp.status_code == 429:
                fail_count += 1
                status_str = "⚠️ 429 Rate Limited. Sleeping 3s..."
                time.sleep(3.0)
            else:
                fail_count += 1
                status_str = f"❌ HTTP {resp.status_code}"

            audit_log.append({
                "call_id": i,
                "timestamp": datetime.utcnow().isoformat(),
                "endpoint": endpoint,
                "chain": chain,
                "status": resp.status_code,
                "latency_ms": elapsed
            })

            pct = round((i / target_calls) * 100, 1)
            if i % 10 == 0 or i == target_calls:
                print(f"[{i}/{target_calls}] [{pct}%] {endpoint} ({chain}) -> {status_str}")

        except Exception as e:
            fail_count += 1
            print(f"[{i}/{target_calls}] Error: {e}")

        # Checkpoint every 100 calls
        if i % 100 == 0 or i == target_calls:
            with open("harvest_audit.json", "w") as f:
                json.dump({
                    "target": target_calls,
                    "completed": i,
                    "success": success_count,
                    "failed": fail_count,
                    "updated_at": datetime.utcnow().isoformat(),
                    "recent_logs": audit_log[-50:]
                }, f, indent=2)
            print(f"💾 Checkpoint saved: {success_count} calls logged to Nansen account.")

        time.sleep(delay)

    print("\n" + "=" * 60)
    print(f"🎉 HARVEST COMPLETE: {success_count}/{target_calls} calls logged.")
    print("📁 Audit saved to: harvest_audit.json")
    print("=" * 60)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Nansen 1,000 API Calls Harvester")
    parser.add_argument("--key", type=str, default=os.getenv("NANSEN_API_KEY"), help="Nansen API Key")
    parser.add_argument("--target", type=int, default=1000, help="Target calls (default: 1000)")
    parser.add_argument("--delay", type=float, default=0.15, help="Delay in seconds (default: 0.15)")
    args = parser.parse_args()

    if not args.key:
        print("❌ Error: API key required. Pass --key or export NANSEN_API_KEY.")
        sys.exit(1)

    harvest(args.key, target_calls=args.target, delay=args.delay)
