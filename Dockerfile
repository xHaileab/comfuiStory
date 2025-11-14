# Use the official RunPod base image (PyTorch 2.1.0)
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

# --- THIS IS THE FIX ---
# Install ComfyUI's requirements, but FORCE compatible numpy and transformers versions
RUN pip install --no-cache-dir \
    "numpy<2" \
    "transformers==4.36.2"

# Now install the rest of ComfyUI's requirements
RUN pip install --no-cache-dir -r requirements.txt

# Install RunPod-specific libraries
RUN pip install --no-cache-dir runpod requests
# --- END OF FIX ---

# Copy your workflow and handler
COPY workflow.json /comfyui/workflow_api.json
COPY handler.py /comfyui/handler.py

# Link to network volume (RunPod mounts at /runpod-volume)
RUN rm -rf /comfyui/models /comfyui/input && \
    ln -s /runpod-volume/models /comfyui/models && \
    ln -s /runpod-volume/input /comfyui/input && \
    mkdir -p /comfyui/output

# Set the entrypoint
CMD ["python", "-u", "/comfyui/handler.py"]