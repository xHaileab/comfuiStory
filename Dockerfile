# Use the official base image (it has a working handler)
FROM runpod/worker-comfyui:latest-base

# Copy our custom path config to tell ComfyUI where our volume is
COPY extra_model_paths.yaml /comfyui/extra_model_paths.yaml

# Copy our workflow for the built-in handler to use
COPY workflow.json /comfyui/workflow.json