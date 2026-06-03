#!/usr/bin/env python
"""
03 — Offline Evaluation
========================
Loads trained weights, evaluates all three decoders side by side,
and computes accuracy, F1, and confusion matrices.

Usage:
    conda activate mozart
    cd backend
    python notebooks/03_offline_evaluation.py
"""

import sys
sys.path.insert(0, "..")

import numpy as np
import torch
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import (
    accuracy_score, f1_score, classification_report, confusion_matrix,
)
from app.services.models import build_model
from app.services.inference import VOCABULARY

# ── Config ────────────────────────────────────────────────────────────
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
N_CHANNELS = 64
N_CLASSES = 50
SEQ_LEN = 500
N_TEST = 200

print("=" * 60)
print("Offline Evaluation — All Decoders")
print(f"Device: {DEVICE}")
print("=" * 60)


# ── 1. Generate test data ────────────────────────────────────────────
X_test = torch.randn(N_TEST, N_CHANNELS, SEQ_LEN)
y_test = torch.randint(0, N_CLASSES, (N_TEST,))
print(f"\n✓ Test set: {X_test.shape}, {N_TEST} samples")

results = {}

for mode in ["supervised", "unsupervised", "rl"]:
    print(f"\n{'─' * 40}")
    print(f"Evaluating: {mode}")
    print("─" * 40)

    model = build_model(mode, N_CHANNELS, N_CLASSES, SEQ_LEN)

    # Try loading weights
    weight_path = f"../weights/{mode}_decoder.pt"
    try:
        model.load_weights(weight_path)
        print(f"  Loaded weights from {weight_path}")
    except FileNotFoundError:
        print(f"  No weights found — using random initialization")

    model = model.to(DEVICE).eval()

    # Run inference
    all_preds = []
    all_probs = []

    with torch.no_grad():
        for i in range(0, N_TEST, 32):
            batch = X_test[i:i+32].to(DEVICE)
            logits = model(batch)
            probs = torch.softmax(logits, dim=-1)
            preds = logits.argmax(dim=-1)
            all_preds.extend(preds.cpu().numpy())
            all_probs.extend(probs.cpu().numpy())

    all_preds = np.array(all_preds)
    y_true = y_test.numpy()

    # Metrics
    acc = accuracy_score(y_true, all_preds)
    f1 = f1_score(y_true, all_preds, average="macro", zero_division=0)

    results[mode] = {
        "accuracy": acc,
        "f1_macro": f1,
        "predictions": all_preds,
    }

    print(f"  Accuracy: {acc:.4f}")
    print(f"  F1 (macro): {f1:.4f}")

# ── 2. Comparison table ──────────────────────────────────────────────

print(f"\n{'=' * 60}")
print("Comparison Summary")
print("=" * 60)
print(f"{'Model':<25} {'Accuracy':>10} {'F1 (macro)':>12}")
print("─" * 50)
for mode, res in results.items():
    print(f"{mode:<25} {res['accuracy']:>10.4f} {res['f1_macro']:>12.4f}")

# ── 3. Plot confusion matrices ──────────────────────────────────────

fig, axes = plt.subplots(1, 3, figsize=(18, 5))
titles = {
    "supervised": "EEG-Former",
    "unsupervised": "EEG-MAE",
    "rl": "Decision Transformer",
}

for ax, (mode, res) in zip(axes, results.items()):
    cm = confusion_matrix(y_test.numpy(), res["predictions"], labels=range(N_CLASSES))
    # Normalize
    cm_norm = cm.astype(float) / (cm.sum(axis=1, keepdims=True) + 1e-8)
    sns.heatmap(cm_norm, ax=ax, cmap="Blues", vmin=0, vmax=0.2, cbar_kws={"shrink": 0.6})
    ax.set_title(f"{titles[mode]}\nAcc={res['accuracy']:.3f}, F1={res['f1_macro']:.3f}")
    ax.set_xlabel("Predicted")
    ax.set_ylabel("True")

plt.tight_layout()
plt.savefig("notebooks/fig_03_confusion_matrices.png", dpi=150)
plt.close()
print("\n✓ Saved: notebooks/fig_03_confusion_matrices.png")

print("\n" + "=" * 60)
print("Evaluation complete!")
print("NOTE: With random weights, accuracy ≈ 1/50 = 2%.")
print("Train on real data for meaningful results.")
print("=" * 60)
