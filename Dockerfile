FROM runpod/pytorch:2.1.0-py3.10-cuda11.8.0-devel-ubuntu22.04
WORKDIR /

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    wget \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Install ComfyUI
RUN git clone https://github.com/comfyanonymous/ComfyUI.git /comfyui
WORKDIR /comfyui

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install --no-cache-dir runpod requests

# Copy workflow and handler
COPY workflow.json /comfyui/workflow_api.json
COPY handler.py /comfyui/handler.py

# Link to network volume (RunPod mounts at /runpod-volume)
RUN rm -rf /comfyui/models /comfyui/input && \
    ln -s /runpod-volume/models /comfyui/models && \
    ln -s /runpod-volume/input /comfyui/input && \
    mkdir -p /comfyui/output

CMD ["python", "-u", "/comfyui/handler.py"]