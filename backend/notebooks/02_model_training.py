#!/usr/bin/env python
"""
02 — Model Training Demo
=========================
Demonstrates training all three decoder architectures on synthetic data.

Usage:
    conda activate mozart
    cd backend
    python notebooks/02_model_training.py
"""

import sys
sys.path.insert(0, "..")

import time
import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from app.services.models import build_model, EEGFormer, EEGMAE, DecisionTransformer
from app.services.pipeline import EEGPreprocessor, PreprocessConfig
from app.services.lsl_stream import MockEEGGenerator

# ── Config ────────────────────────────────────────────────────────────
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
N_CHANNELS = 64
N_CLASSES = 50
SEQ_LEN = 500
BATCH_SIZE = 16
N_EPOCHS_TRAIN = 30
N_SAMPLES = 256  # total training samples (synthetic)

print("=" * 60)
print("Model Training Demo")
print(f"Device: {DEVICE}")
print("=" * 60)


# ── 1. Generate synthetic dataset ────────────────────────────────────

def generate_synthetic_dataset(n_samples, n_channels, seq_len, n_classes):
    """Generate random EEG data with random labels (for architecture validation)."""
    X = torch.randn(n_samples, n_channels, seq_len)
    y = torch.randint(0, n_classes, (n_samples,))
    return X, y

X_train, y_train = generate_synthetic_dataset(N_SAMPLES, N_CHANNELS, SEQ_LEN, N_CLASSES)
X_val, y_val = generate_synthetic_dataset(64, N_CHANNELS, SEQ_LEN, N_CLASSES)
print(f"\n✓ Synthetic data: train={X_train.shape}, val={X_val.shape}")

train_dataset = torch.utils.data.TensorDataset(X_train, y_train)
val_dataset = torch.utils.data.TensorDataset(X_val, y_val)
train_loader = torch.utils.data.DataLoader(train_dataset, batch_size=BATCH_SIZE, shuffle=True)
val_loader = torch.utils.data.DataLoader(val_dataset, batch_size=BATCH_SIZE)


# ── 2. Training loop function ────────────────────────────────────────

def train_classifier(model, train_loader, val_loader, n_epochs, lr=1e-3):
    """Standard supervised training loop."""
    model = model.to(DEVICE)
    optimizer = optim.AdamW(model.parameters(), lr=lr, weight_decay=0.01)
    scheduler = optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=n_epochs)
    criterion = nn.CrossEntropyLoss()

    history = {"train_loss": [], "val_loss": [], "val_acc": []}

    for epoch in range(n_epochs):
        # Train
        model.train()
        total_loss = 0
        for X_batch, y_batch in train_loader:
            X_batch, y_batch = X_batch.to(DEVICE), y_batch.to(DEVICE)
            optimizer.zero_grad()
            logits = model(X_batch)
            loss = criterion(logits, y_batch)
            loss.backward()
            torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)
            optimizer.step()
            total_loss += loss.item()

        avg_train_loss = total_loss / len(train_loader)
        scheduler.step()

        # Validate
        model.eval()
        val_loss = 0
        correct = 0
        total = 0
        with torch.no_grad():
            for X_batch, y_batch in val_loader:
                X_batch, y_batch = X_batch.to(DEVICE), y_batch.to(DEVICE)
                logits = model(X_batch)
                val_loss += criterion(logits, y_batch).item()
                preds = logits.argmax(dim=-1)
                correct += (preds == y_batch).sum().item()
                total += y_batch.size(0)

        avg_val_loss = val_loss / len(val_loader)
        val_acc = correct / total

        history["train_loss"].append(avg_train_loss)
        history["val_loss"].append(avg_val_loss)
        history["val_acc"].append(val_acc)

        if (epoch + 1) % 5 == 0 or epoch == 0:
            print(f"  Epoch {epoch+1:3d}/{n_epochs} | "
                  f"Train Loss: {avg_train_loss:.4f} | "
                  f"Val Loss: {avg_val_loss:.4f} | "
                  f"Val Acc: {val_acc:.4f}")

    return history


# ── 3. Train EEGFormer ───────────────────────────────────────────────

print("\n" + "─" * 40)
print("Training EEGFormer (Supervised)")
print("─" * 40)

eeg_former = build_model("supervised", N_CHANNELS, N_CLASSES, SEQ_LEN)
print(f"Parameters: {eeg_former.count_parameters():,}")
t0 = time.time()
history_former = train_classifier(eeg_former, train_loader, val_loader, N_EPOCHS_TRAIN)
print(f"Training time: {time.time() - t0:.1f}s")

# Save weights
eeg_former.save_weights("../weights/supervised_decoder.pt")


# ── 4. Train EEG-MAE (pretraining + fine-tuning) ────────────────────

print("\n" + "─" * 40)
print("Pretraining EEG-MAE (Self-Supervised)")
print("─" * 40)

eeg_mae = build_model("unsupervised", N_CHANNELS, N_CLASSES, SEQ_LEN)
print(f"Parameters: {eeg_mae.count_parameters():,}")

# Pretraining (reconstruction)
eeg_mae = eeg_mae.to(DEVICE)
optimizer = optim.AdamW(eeg_mae.parameters(), lr=1e-3, weight_decay=0.01)
mse_criterion = nn.MSELoss()

pretrain_losses = []
print("  Pretraining phase (reconstruction)...")
for epoch in range(15):
    eeg_mae.train()
    total_loss = 0
    for X_batch, _ in train_loader:
        X_batch = X_batch.to(DEVICE)
        optimizer.zero_grad()

        reconstruction, mask = eeg_mae.forward_pretrain(X_batch)

        # Build target patches
        B, C, T = X_batch.shape
        patch_size = eeg_mae.patch_size
        n_patches = eeg_mae.n_patches
        target_patches = X_batch.unfold(2, patch_size, 12)  # stride=12
        target_patches = target_patches.permute(0, 2, 1, 3).contiguous()
        target_patches = target_patches.view(B, n_patches, C * patch_size)

        loss = mse_criterion(reconstruction, target_patches)
        loss.backward()
        optimizer.step()
        total_loss += loss.item()

    avg_loss = total_loss / len(train_loader)
    pretrain_losses.append(avg_loss)
    if (epoch + 1) % 5 == 0:
        print(f"  Epoch {epoch+1:3d}/15 | Recon Loss: {avg_loss:.4f}")

# Fine-tuning (classification)
print("  Fine-tuning phase (classification)...")
history_mae = train_classifier(eeg_mae, train_loader, val_loader, N_EPOCHS_TRAIN, lr=5e-4)

eeg_mae.save_weights("../weights/unsupervised_decoder.pt")


# ── 5. Train Decision Transformer ───────────────────────────────────

print("\n" + "─" * 40)
print("Training Decision Transformer (RL)")
print("─" * 40)

dt = build_model("rl", N_CHANNELS, N_CLASSES, SEQ_LEN)
print(f"Parameters: {dt.count_parameters():,}")
t0 = time.time()
history_dt = train_classifier(dt, train_loader, val_loader, N_EPOCHS_TRAIN)
print(f"Training time: {time.time() - t0:.1f}s")

dt.save_weights("../weights/rl_decoder.pt")


# ── 6. Plot training curves ─────────────────────────────────────────

fig, axes = plt.subplots(1, 3, figsize=(15, 4))

for ax, history, title in zip(
    axes,
    [history_former, history_mae, history_dt],
    ["EEG-Former", "EEG-MAE", "Decision Transformer"],
):
    ax.plot(history["train_loss"], label="Train Loss", color="steelblue")
    ax.plot(history["val_loss"], label="Val Loss", color="coral")
    ax2 = ax.twinx()
    ax2.plot(history["val_acc"], label="Val Acc", color="seagreen", linestyle="--")
    ax.set_xlabel("Epoch")
    ax.set_ylabel("Loss")
    ax2.set_ylabel("Accuracy")
    ax.set_title(title)
    ax.legend(loc="upper left")
    ax2.legend(loc="upper right")

plt.tight_layout()
plt.savefig("notebooks/fig_02_training_curves.png", dpi=150)
plt.close()
print("\n✓ Saved figure: notebooks/fig_02_training_curves.png")

print("\n" + "=" * 60)
print("Training complete! Weights saved to backend/weights/")
print("=" * 60)
