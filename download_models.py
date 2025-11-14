import os
import urllib.request
from pathlib import Path

# Model URLs - Replace these with actual URLs from Hugging Face or other sources
MODELS = {
    "unet": {
        "qwen_image_edit_fp8_e4m3fn.safetensors": "https://huggingface.co/Comfy-Org/qwen_image_models/resolve/main/qwen_image_edit_fp8_e4m3fn.safetensors"
    },
    "vae": {
        "qwen_image_vae.safetensors": "https://huggingface.co/Comfy-Org/qwen_image_models/resolve/main/qwen_image_vae.safetensors"
    },
    "clip": {
        "qwen_2.5_vl_7b_fp8_scaled.safetensors": "https://huggingface.co/Comfy-Org/qwen_image_models/resolve/main/qwen_2.5_vl_7b_fp8_scaled.safetensors"
    },
    "loras": {
        "Qwen-Image-Lightning-4steps-V1.0.safetensors": "https://huggingface.co/Comfy-Org/qwen_image_models/resolve/main/Qwen-Image-Lightning-4steps-V1.0.safetensors"
    }
}

def download_file(url, dest_path):
    """Download a file from URL to destination path with progress"""
    print(f"Downloading {os.path.basename(dest_path)}...")
    
    try:
        # Create directory if it doesn't exist
        os.makedirs(os.path.dirname(dest_path), exist_ok=True)
        
        # Check if file already exists
        if os.path.exists(dest_path):
            print(f"File already exists: {dest_path}")
            return True
        
        # Download with progress
        def reporthook(count, block_size, total_size):
            if total_size > 0:
                percent = int(count * block_size * 100 / total_size)
                print(f"\rProgress: {percent}%", end='')
        
        urllib.request.urlretrieve(url, dest_path, reporthook)
        print(f"\n✓ Downloaded: {os.path.basename(dest_path)}")
        return True
        
    except Exception as e:
        print(f"\n✗ Failed to download {url}: {e}")
        return False

def download_all_models():
    """Download all required models"""
    base_path = "/comfyui/models"
    
    success_count = 0
    total_count = 0
    
    for model_type, models in MODELS.items():
        model_dir = os.path.join(base_path, model_type)
        os.makedirs(model_dir, exist_ok=True)
        
        print(f"\n{'='*60}")
        print(f"Downloading {model_type.upper()} models...")
        print(f"{'='*60}")
        
        for filename, url in models.items():
            total_count += 1
            dest_path = os.path.join(model_dir, filename)
            
            if download_file(url, dest_path):
                success_count += 1
    
    # Download example input image
    print(f"\n{'='*60}")
    print("Downloading example input image...")
    print(f"{'='*60}")
    
    example_image_url = "https://raw.githubusercontent.com/comfyanonymous/ComfyUI_examples/master/2_img2img/input/example.png"
    example_dest = "/comfyui/input/example.png"
    
    os.makedirs("/comfyui/input", exist_ok=True)
    
    if download_file(example_image_url, example_dest):
        success_count += 1
        total_count += 1
    
    print(f"\n{'='*60}")
    print(f"Download Summary: {success_count}/{total_count} files successful")
    print(f"{'='*60}\n")
    
    if success_count < total_count:
        print("⚠ Warning: Some models failed to download. The workflow may not work correctly.")
        return False
    
    print("✓ All models downloaded successfully!")
    return True

if __name__ == "__main__":
    print("Starting model download process...")
    success = download_all_models()
    
    if not success:
        print("\n⚠ Please check the URLs and try again.")
        exit(1)
    
    print("\n✓ Model download complete! Your RunPod serverless endpoint is ready.")