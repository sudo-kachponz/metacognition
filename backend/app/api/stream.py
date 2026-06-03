"""
WebSocket streaming endpoint for real-time EEG data and inference.

Endpoint:
    WS /api/v1/stream/eeg — Push EEG frames + decoded words to frontend
"""

from __future__ import annotations

import asyncio
import json
import logging
import time

import numpy as np
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.core.config import settings
from app.models.schemas import EEGFrame
from app.services.inference import inference_engine
from app.services.lsl_stream import lsl_manager

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/stream", tags=["Streaming"])


@router.websocket("/eeg")
async def eeg_stream(ws: WebSocket) -> None:
    """
    WebSocket endpoint for real-time EEG streaming.

    Pushes two types of messages:
        1. 'eeg_frame'  — raw EEG data for visualization
        2. 'prediction' — decoded word + confidence + latency

    Client can send JSON messages to control the stream:
        {"action": "start"}
        {"action": "stop"}
        {"action": "switch_decoder", "mode": "supervised"|"unsupervised"|"rl"}
    """
    await ws.accept()
    logger.info("WebSocket client connected")

    streaming = False

    try:
        # Connect to LSL stream
        if not lsl_manager.is_connected():
            connected = await lsl_manager.connect()
            if not connected:
                await ws.send_json({"type": "error", "message": "Failed to connect to EEG stream"})
                await ws.close()
                return

        # Initialize inference engine if not ready
        if not inference_engine.is_initialized:
            await inference_engine.initialize(settings.DEFAULT_DECODER_MODE, settings.DEVICE)

        await ws.send_json({
            "type": "status",
            "message": "Connected",
            "decoder": inference_engine.current_mode,
            "device": str(inference_engine.device),
        })

        # Dual task: listen for client commands + push data
        async def push_data() -> None:
            nonlocal streaming
            frame_count = 0

            while True:
                if not streaming:
                    await asyncio.sleep(0.1)
                    continue

                epoch = await lsl_manager.get_epoch()
                if epoch is None:
                    continue

                frame_count += 1

                # Send EEG frame (downsample for visualization: every 5th sample)
                viz_step = 5
                viz_data = epoch[:, ::viz_step].tolist()
                eeg_frame = EEGFrame(
                    timestamp=time.time(),
                    data=viz_data,
                )
                await ws.send_json({
                    "type": "eeg_frame",
                    "payload": eeg_frame.model_dump(by_alias=True),
                })

                # Run inference on every epoch
                try:
                    result = await inference_engine.predict(epoch)
                    await ws.send_json({
                        "type": "prediction",
                        "payload": result.model_dump(by_alias=True),
                    })
                except Exception as e:
                    logger.error("Inference error: %s", e)
                    await ws.send_json({
                        "type": "error",
                        "message": f"Inference error: {e}",
                    })

        async def receive_commands() -> None:
            nonlocal streaming

            while True:
                try:
                    raw = await ws.receive_text()
                    msg = json.loads(raw)
                    action = msg.get("action", "")

                    if action == "start":
                        if not streaming:
                            await lsl_manager.start_acquisition()
                            streaming = True
                            await ws.send_json({"type": "status", "message": "Streaming started"})
                            logger.info("Streaming started")

                    elif action == "stop":
                        streaming = False
                        await lsl_manager.stop()
                        await ws.send_json({"type": "status", "message": "Streaming stopped"})
                        logger.info("Streaming stopped")

                    elif action == "switch_decoder":
                        new_mode = msg.get("mode", "supervised")
                        await inference_engine.switch_decoder(new_mode)
                        await ws.send_json({
                            "type": "status",
                            "message": f"Switched to {new_mode}",
                            "decoder": new_mode,
                        })

                    else:
                        await ws.send_json({"type": "error", "message": f"Unknown action: {action}"})

                except WebSocketDisconnect:
                    raise
                except json.JSONDecodeError:
                    await ws.send_json({"type": "error", "message": "Invalid JSON"})
                except Exception as e:
                    logger.error("Command error: %s", e)

        # Run both tasks concurrently
        push_task = asyncio.create_task(push_data())
        receive_task = asyncio.create_task(receive_commands())

        try:
            await asyncio.gather(push_task, receive_task)
        except WebSocketDisconnect:
            push_task.cancel()
            receive_task.cancel()

    except WebSocketDisconnect:
        logger.info("WebSocket client disconnected")
    except Exception as e:
        logger.error("WebSocket error: %s", e)
    finally:
        if streaming:
            await lsl_manager.stop()
        logger.info("WebSocket connection closed")
