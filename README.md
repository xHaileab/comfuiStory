# ComfyUI Story - RunPod Serverless Template

A complete template for deploying a ComfyUI image editing workflow (Qwen Image Edit) as a scalable, serverless API on RunPod.

## Features

- 🎨 Qwen Image Edit model for AI-powered image transformation
- 🚀 Serverless deployment on RunPod
- 🔄 Automatic model downloading
- 📦 Docker containerized
- 🎯 Simple API interface

## Workflow Description

This workflow uses Qwen Image Edit models to transform images based on text prompts. The default prompt converts images to "3D Pixar animation style, in a white background, playing guitar".

### Workflow Components

- **Model**: Qwen Image Edit (FP8 quantized)
- **VAE**: Qwen Image VAE
- **CLIP**: Qwen 2.5 VL 7B (FP8 scaled)
- **LoRA**: Qwen Image Lightning 4-steps
- **Steps**: 4 (fast inference)
- **Sampler**: Euler with Simple scheduler

## Project Structure

```
.
├── Dockerfile              # Docker image definition
├── handler.py             # RunPod serverless handler
├── download_models.py     # Model download script
├── workflow.json          # ComfyUI workflow definition
├── hub.json              # RunPod hub configuration
├── tests.json            # Test configuration
└── README.md             # This file
```

## Quick Start

### 1. Deploy to RunPod

1. Fork this repository
2. Go to [RunPod Hub](https://console.runpod.io/hub)
3. Click "Deploy"
4. Select your repository
5. Wait for the build to complete

### 2. Test Your Endpoint

```python
import runpod
import base64

# Initialize the endpoint
endpoint = runpod.Endpoint("YOUR_ENDPOINT_ID")

# Run inference
result = endpoint.run({
    "input": {
        "prompt": "Convert to 3D Pixar animation style",
        "image_url": "https://example.com/your-image.jpg"
    }
})

# Save the output image
if result["status"] == "success":
    img_data = base64.b64decode(result["image"])
    with open("output.png", "wb") as f:
        f.write(img_data)
```

### 3. API Request Format

**Input:**
```json
{
  "input": {
    "prompt": "Your text prompt here",
    "image_url": "https://example.com/image.jpg"
  }
}
```

**Output:**
```json
{
  "status": "success",
  "image": "base64_encoded_image_data",
  "image_path": "/path/to/output.png"
}
```

## Environment Variables

You can set default values in `hub.json`:

- `PROMPT`: Default text prompt for image transformation

## GPU Requirements

- **Recommended**: NVIDIA RTX A4000 or better
- **VRAM**: At least 16GB
- **Container Disk**: 20GB

## Model Information

This template uses the Qwen Image Edit models:

- **qwen_image_edit_fp8_e4m3fn.safetensors** (~3.5GB)
- **qwen_image_vae.safetensors** (~200MB)
- **qwen_2.5_vl_7b_fp8_scaled.safetensors** (~7GB)
- **Qwen-Image-Lightning-4steps-V1.0.safetensors** (~500MB)

Total download size: ~11GB

## Customization

### Modify the Prompt

Edit the default prompt in `hub.json`:

```json
{
  "key": "PROMPT",
  "input": {
    "default": "Your custom prompt here"
  }
}
```

### Adjust Workflow Settings

Edit `workflow.json` to modify:
- Number of inference steps
- CFG scale
- Sampler type
- Image resolution

### Add Custom Models

1. Add model URLs to `download_models.py`
2. Update the workflow in `workflow.json`
3. Rebuild the Docker image

## Local Testing

Build and test locally:

```bash
# Build the Docker image
docker build -t comfyui-story .

# Run locally
docker run --gpus all -p 8000:8000 comfyui-story
```

## Troubleshooting

### Models not downloading
- Check the model URLs in `download_models.py`
- Ensure you have sufficient disk space (20GB+)
- Verify internet connectivity during build

### Out of memory errors
- Use a GPU with more VRAM
- Reduce image resolution in workflow
- Enable model offloading

### Slow inference
- Check GPU utilization
- Consider using Qwen Image Lightning for faster results
- Reduce number of steps (already at 4)

## License

No license specified. Check individual model licenses:
- Qwen models: Check [Hugging Face](https://huggingface.co/Comfy-Org/qwen_image_models)

## Support

For issues and questions:
- [RunPod Documentation](https://docs.runpod.io)
- [ComfyUI GitHub](https://github.com/comfyanonymous/ComfyUI)

## Badge

[![Deploy on RunPod](https://api.runpod.io/badge/xHaileab/comfuiStory)](https://console.runpod.io/hub/xHaileab/comfuiStory)