FROM runpod/pytorch:2.2.1-py3.10-cuda12.1.1-devel-ubuntu22.04

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

# Copy files
COPY workflow.json /comfyui/workflow_api.json
COPY handler.py /comfyui/handler.py
COPY download_models.py /comfyui/download_models.py

# Download models during build
RUN python /comfyui/download_models.py || echo "Model download failed, will retry at runtime"

# Expose port (optional, for local testing)
EXPOSE 8000

# Set the entrypoint
CMD ["python", "-u", "/comfyui/handler.py"]