FROM runpod/pytorch:2.1.0-py3.10-cuda11.8.0-devel-ubuntu22.04

# Set working directory
WORKDIR /

# Update and install dependencies
RUN apt-get update && apt-get install -y \
    git \
    wget \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Install ComfyUI
RUN git clone https://github.com/comfyanonymous/ComfyUI.git /comfyui
WORKDIR /comfyui

# Install ComfyUI requirements
RUN pip install --no-cache-dir -r requirements.txt

# Install additional required packages
RUN pip install --no-cache-dir runpod requests

# Create directories for models
RUN mkdir -p /comfyui/models/unet \
    /comfyui/models/vae \
    /comfyui/models/clip \
    /comfyui/models/loras \
    /comfyui/input \
    /comfyui/output

# Copy workflow and handler
COPY workflow.json /comfyui/workflow_api.json
COPY handler.py /comfyui/handler.py
COPY download_models.py /comfyui/download_models.py

# DO NOT download models here - this will timeout the build
# Models will be downloaded on first startup by the handler

# Set the entrypoint
CMD ["python", "-u", "/comfyui/handler.py"]