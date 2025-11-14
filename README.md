# ComfyUI Story - RunPod Serverless Template

A complete template for deploying a ComfyUI image editing workflow (Qwen Image Edit) as a scalable, serverless API on RunPod.

## 🚀 Quick Start - Deployment Checklist

### ✅ Step 1: Repository Setup
Make sure your GitHub repository (`xHaileab/comfuiStory`) contains these files in the **root directory**:

- [x] `Dockerfile`
- [x] `handler.py`
- [x] `download_models.py`
- [x] `workflow.json`
- [x] `hub.json`
- [x] `tests.json`
- [x] `README.md`

### ✅ Step 2: Commit and Push
```bash
git add .
git commit -m "Ready for RunPod deployment"
git push origin main
```

### ✅ Step 3: Create a GitHub Release (CRITICAL!)
**Just pushing code does NOT trigger a build on RunPod!**

1. Go to your repository on GitHub: `https://github.com/xHaileab/comfuiStory`
2. Click **"Releases"** on the right sidebar
3. Click **"Create a new release"**
4. Click **"Choose a tag"** and type `v1.0.0` (or any version)
5. Set the release title: `Initial Release`
6. Click **"Publish release"**

This tells RunPod to pull your code and start building!

### ✅ Step 4: Deploy on RunPod
1. Go to [RunPod Console](https://console.runpod.io)
2. Navigate to **Serverless** → **New Endpoint**
3. Under **Custom Source**, select **GitHub Repository**
4. Connect your GitHub account if not already connected
5. Select your repository: `xHaileab/comfuiStory`
6. Select branch: `main`
7. Click **Next**
8. Configure endpoint settings (already set in `hub.json`):
   - **GPU**: NVIDIA RTX A4000
   - **Container Disk**: 20GB
   - **Workers**: Start with 1 min, 3 max
9. Click **Deploy Endpoint**

### ✅ Step 5: Wait for Build
- The build will take **10-15 minutes** (ComfyUI installation)
- Watch the **Logs** tab for progress
- Models download on **first startup** (not during build)
- First request may take **2-5 minutes** while models download

## 📋 Important Files Explained

### `hub.json` - RunPod Configuration
- **CRITICAL**: Specifies GPU requirements (`NVIDIA RTX A4000`)
- Sets container disk size (20GB)
- Defines environment variables (default prompt)

### `Dockerfile` - Container Setup
- Installs ComfyUI and dependencies
- Does **NOT** download models (would timeout build)
- Models download on first startup instead

### `handler.py` - Core Logic
- Downloads models on first startup
- Starts ComfyUI server in background
- Processes API requests via HTTP to ComfyUI
- Returns base64-encoded images

### `download_models.py` - Model Manager
- Downloads ~11GB of models from Hugging Face
- Qwen Image Edit, VAE, CLIP, and Lightning LoRA
- Runs automatically on first handler startup

## 🧪 Testing Your Endpoint

### Using RunPod Console
1. Go to your endpoint's **Requests** tab
2. Use this test input:
```json
{
  "input": {
    "prompt": "Convert to 3D Pixar animation style",
    "image_url": "https://example.com/your-image.jpg"
  }
}
```
3. Click **Run**
4. Wait for the result (base64 image)

### Using Python SDK
```python
import runpod
import base64

# Initialize endpoint
endpoint = runpod.Endpoint("YOUR_ENDPOINT_ID")

# Send request
result = endpoint.run({
    "input": {
        "prompt": "Convert to 3D Pixar animation style, white background",
        "image_url": "https://example.com/image.jpg"
    }
})

# Save output
if result["status"] == "success":
    img_data = base64.b64decode(result["image"])
    with open("output.png", "wb") as f:
        f.write(img_data)
```

### Using cURL
```bash
curl -X POST https://api.runpod.ai/v2/YOUR_ENDPOINT_ID/run \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{
    "input": {
      "prompt": "Convert to 3D Pixar animation style",
      "image_url": "https://example.com/image.jpg"
    }
  }'
```

## 🔧 How It Works

### Architecture
```
RunPod Request → Handler.py → ComfyUI Server (127.0.0.1:8188) → Image Generation → Base64 Response
                     ↓
            Download Models (First Run Only)
```

### Workflow Process
1. **Handler receives request** with prompt and optional image URL
2. **Downloads input image** if URL provided, else uses `example.png`
3. **Updates workflow JSON** with prompt, image, and random seed
4. **Queues prompt** to ComfyUI server via HTTP POST
5. **Polls for completion** checking `/history/{prompt_id}`
6. **Retrieves output image** from `/comfyui/output/`
7. **Returns base64-encoded** image in response

### Model Information
- **qwen_image_edit_fp8_e4m3fn.safetensors** (~3.5GB) - Main UNET model
- **qwen_image_vae.safetensors** (~200MB) - VAE for encoding/decoding
- **qwen_2.5_vl_7b_fp8_scaled.safetensors** (~7GB) - CLIP for text encoding
- **Qwen-Image-Lightning-4steps-V1.0.safetensors** (~500MB) - Fast inference LoRA

**Total:** ~11GB downloaded on first startup

## 🐛 Troubleshooting

### Build Fails / Times Out
**Problem:** Build gets stuck or fails during model download.
**Solution:** Models are downloaded on **first startup**, not during build. Make sure your Dockerfile does **not** have `RUN python /comfyui/download_models.py`.

### "Handler not found" Error
**Problem:** RunPod can't find the handler function.
**Solution:** 
- Handler file must be named `handler.py`
- Handler function must be named `handler(event)`
- Must have `runpod.serverless.start({"handler": handler})` at the bottom

### First Request Takes Forever
**Problem:** First request takes 2-5 minutes.
**Solution:** This is **normal**. Models are downloading (~11GB). Subsequent requests will be fast (4-10 seconds).

### Out of Memory / GPU Error
**Problem:** Worker crashes with CUDA OOM or GPU errors.
**Solution:** 
- Use **NVIDIA RTX A4000** (16GB VRAM) or better
- Check `hub.json` has `"gpuIds": "NVIDIA RTX A4000"`
- Don't use smaller GPUs like RTX 4000

### No Output Image Generated
**Problem:** Request completes but no image returned.
**Solution:**
- Check ComfyUI server logs in RunPod console
- Verify input image downloaded correctly
- Check workflow nodes are properly connected

### Release Doesn't Trigger Build
**Problem:** Created release but RunPod doesn't build.
**Solution:**
- Make sure you created a **GitHub Release**, not just a tag
- Check RunPod has permissions to access your repository
- Try disconnecting and reconnecting GitHub in RunPod settings

## 💡 Optimization Tips

### Cost Optimization
- Set **Min Workers: 0** to avoid idle costs
- Set **Max Workers: 3** for moderate traffic
- Use **Flex Workers** (15% cheaper) for non-time-sensitive requests

### Performance Optimization
- Use **Reserved Workers** (always-on) for zero cold starts
- Attach a **Network Volume** to cache models across workers
- Enable **GPU Type Priority** to try cheaper GPUs first

### Scaling Strategy
- Start small: 0 min, 1 max workers
- Monitor queue times in RunPod dashboard
- Increase max workers if queue grows
- Add reserved workers if cold starts are an issue

## 📚 Additional Resources

- [RunPod Serverless Documentation](https://docs.runpod.io/serverless/overview)
- [ComfyUI GitHub](https://github.com/comfyanonymous/ComfyUI)
- [Qwen Image Models](https://huggingface.co/Comfy-Org/qwen_image_models)
- [RunPod Discord Community](https://discord.gg/runpod)

## 🔒 Security Notes

- Never commit API keys to your repository
- Use RunPod's environment variables for secrets
- Image URLs should be from trusted sources only
- Consider adding input validation for production use

## 📝 License

No license specified. Check individual model licenses:
- [Qwen Models License](https://huggingface.co/Comfy-Org/qwen_image_models)

## 🆘 Support

- **RunPod Issues**: [help@runpod.io](mailto:help@runpod.io)
- **GitHub Issues**: [Create an issue](https://github.com/xHaileab/comfuiStory/issues)
- **Discord**: [RunPod Community](https://discord.gg/runpod)

---

## 🎯 Next Steps After Deployment

1. ✅ Test with the default example prompt
2. ✅ Try with your own image URLs
3. ✅ Experiment with different prompts
4. ✅ Monitor costs in RunPod dashboard
5. ✅ Scale workers based on your traffic
6. ✅ Consider adding a frontend application
7. ✅ Set up monitoring and alerts

**Happy deploying! 🚀**