#!/usr/bin/env python
"""
04 — LSL Live Demo
===================
Demonstrates the full real-time pipeline:
    1. Start mock LSL stream
    2. Connect via LSLStreamManager
    3. Run real-time inference loop
    4. Display decoded words with latency

Usage:
    conda activate mozart
    cd backend
    python notebooks/04_lsl_live_demo.py
"""

import sys
sys.path.insert(0, "..")

import asyncio
import time
import numpy as np
from app.services.lsl_stream import LSLStreamManager
from app.services.inference import InferenceEngine, VOCABULARY
from app.core.config import settings

DEMO_DURATION_S = 10  # Run for 10 seconds


async def main():
    print("=" * 60)
    print("LSL Live Inference Demo")
    print("=" * 60)

    # ── 1. Initialize stream manager (mock mode) ─────────────────────
    stream = LSLStreamManager(use_mock=True)
    connected = await stream.connect()
    print(f"\n✓ Stream connected: {connected}")

    # ── 2. Initialize inference engine ───────────────────────────────
    engine = InferenceEngine()
    await engine.initialize("supervised", device="auto")
    print(f"✓ InferenceEngine ready on {engine.device}")

    # ── 3. Start acquisition ─────────────────────────────────────────
    await stream.start_acquisition()
    print("✓ Acquisition started\n")

    # ── 4. Real-time inference loop ──────────────────────────────────
    print(f"{'#':>3} | {'Word':<15} | {'Conf':>6} | {'Infer ms':>9} | {'E2E ms':>8}")
    print("─" * 60)

    start = time.time()
    count = 0

    while time.time() - start < DEMO_DURATION_S:
        epoch = await stream.get_epoch()
        if epoch is None:
            continue

        count += 1
        result = await engine.predict(epoch)

        print(
            f"{count:3d} | "
            f"{result.decoded_word:<15} | "
            f"{result.confidence:>6.3f} | "
            f"{result.latency.inference_ms:>8.2f} | "
            f"{result.latency.end_to_end_ms:>7.2f}"
        )

    # ── 5. Summary ───────────────────────────────────────────────────
    elapsed = time.time() - start
    latency = engine.get_latency_stats()

    print("\n" + "─" * 60)
    print(f"✓ Processed {count} epochs in {elapsed:.1f}s")
    print(f"  Avg inference: {latency.inference_ms:.2f} ms")
    print(f"  Avg end-to-end: {latency.end_to_end_ms:.2f} ms")
    print(f"  Throughput: {count / elapsed:.1f} epochs/s")

    # ── 6. Cleanup ───────────────────────────────────────────────────
    await stream.stop()
    await engine.shutdown()
    print("\n✓ Cleanup complete")
    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(main())
