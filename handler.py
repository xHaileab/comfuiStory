import os
import runpod
import time
import json
import random
import requests
import subprocess
import urllib.request
from pathlib import Path

# --- ComfyUI Server ---
COMFYUI_URL = "http://127.0.0.1:8188"
comfyui_process = None

def start_comfyui():
    """Starts the ComfyUI server as a subprocess."""
    global comfyui_process
    # --listen is important for 127.0.0.1
    # --port 8188 is the default
    cmd = ["python", "/comfyui/main.py", "--listen", "--port", "8188"]
    
    print("Starting ComfyUI server...")
    comfyui_process = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    
    # Wait for the server to be ready
    for _ in range(60):  # Increased timeout to 60 seconds
        try:
            requests.get(f"{COMFYUI_URL}/system_stats", timeout=2)
            print("✓ ComfyUI server is ready!")
            return
        except (requests.ConnectionError, requests.Timeout):
            time.sleep(1)
    
    print("✗ ComfyUI server failed to start.")
    # Print error logs
    if comfyui_process.stderr:
        stderr = comfyui_process.stderr.read()
        print(f"ComfyUI Error: {stderr}")
    raise RuntimeError("ComfyUI server failed to start")

def download_image(url, save_path):
    """Download image from URL to save_path"""
    try:
        urllib.request.urlretrieve(url, save_path)
        return True
    except Exception as e:
        print(f"Error downloading image: {e}")
        return False

def load_workflow(workflow_path="/comfyui/workflow_api.json"):
    """Load the workflow JSON"""
    with open(workflow_path, 'r') as f:
        return json.load(f)

def queue_prompt(workflow):
    """Queues a prompt to the ComfyUI server"""
    payload = {"prompt": workflow}
    try:
        res = requests.post(f"{COMFYUI_URL}/prompt", json=payload, timeout=10)
        res.raise_for_status()
        return res.json()
    except Exception as e:
        print(f"Error queueing prompt: {e}")
        return None

def get_history(prompt_id):
    """Gets the history for a given prompt ID"""
    try:
        res = requests.get(f"{COMFYUI_URL}/history/{prompt_id}", timeout=5)
        res.raise_for_status()
        return res.json()
    except Exception as e:
        print(f"Error getting history: {e}")
        return None

def get_latest_output_image():
    """Finds the most recent PNG file in the output directory"""
    output_dir = Path("/comfyui/output")
    files = list(output_dir.glob("*.png"))
    if not files:
        return None
    files.sort(key=lambda x: x.stat().st_mtime, reverse=True)
    return files[0]

# --- RunPod Handler ---
def handler(event):
    """RunPod serverless handler function"""
    try:
        # Get input from event
        job_input = event.get("input", {})
        prompt = job_input.get("prompt", os.environ.get("PROMPT", "Convert to 3D Pixar animation style"))
        image_url = job_input.get("image_url", None)
        
        print(f"Processing request with prompt: {prompt}")
        
        # --- Handle Image ---
        input_image_name = "example.png"  # Default
        if image_url:
            print(f"Downloading image from: {image_url}")
            input_image_name = f"input_{random.randint(0, 999999)}.png"
            image_path = f"/comfyui/input/{input_image_name}"
            
            if not download_image(image_url, image_path):
                return {"error": "Failed to download input image"}
            
            print(f"Image saved to: {image_path}")
        else:
            print("No image_url provided, using default 'example.png'")

        # --- Load & Update Workflow ---
        workflow = load_workflow()
        
        # Find nodes by ID and update them
        for node in workflow['nodes']:
            # Update positive prompt (Node 76)
            if node['id'] == 76:
                node['widgets_values'][0] = prompt
                print(f"Updated prompt in node 76")
            
            # Update image path (Node 78 - LoadImage)
            if node['id'] == 78:
                node['widgets_values'][0] = input_image_name
                print(f"Updated input image in node 78")
            
            # Randomize seed (Node 3 - KSampler)
            if node['id'] == 3:
                node['widgets_values'][0] = random.randint(0, 2**32 - 1)
                print(f"Updated seed in node 3")
        
        # --- Execute Workflow ---
        print("Queueing prompt...")
        prompt_data = queue_prompt(workflow)
        if not prompt_data or 'prompt_id' not in prompt_data:
            return {"error": "Failed to queue prompt"}
            
        prompt_id = prompt_data['prompt_id']
        
        # --- Wait for Output ---
        print(f"Waiting for prompt {prompt_id}...")
        max_wait = 300  # 5 minutes timeout
        start_time = time.time()
        
        while time.time() - start_time < max_wait:
            history = get_history(prompt_id)
            if history and prompt_id in history:
                if 'outputs' in history[prompt_id]:
                    print("✓ Workflow execution complete")
                    break
            time.sleep(1)  # Poll every second
        else:
            return {"error": "Workflow execution timed out"}
        
        # --- Get Image ---
        output_image_path = get_latest_output_image()
        if not output_image_path:
            return {"error": "No output image found"}
            
        print(f"Generated image: {output_image_path}")
        
        # Read image as base64
        import base64
        with open(output_image_path, 'rb') as img_file:
            img_data = base64.b64encode(img_file.read()).decode('utf-8')
        
        return {
            "status": "success",
            "image": img_data,
            "image_path": str(output_image_path)
        }
        
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f"Error in handler: {error_trace}")
        return {"error": str(e), "trace": error_trace}

# --- Main Execution ---
if __name__ == "__main__":
    # 1. Download models first
    print("=" * 60)
    print("Running model downloader...")
    print("=" * 60)
    
    import download_models
    if not download_models.download_all_models():
        print("✗ Model download failed. Some models may be missing.")
        print("  The endpoint will still start, but may fail on first request.")
    
    # 2. Start ComfyUI server in the background
    print("=" * 60)
    print("Starting ComfyUI server...")
    print("=" * 60)
    start_comfyui()
    
    # 3. Start RunPod handler
    print("=" * 60)
    print("Starting RunPod serverless handler...")
    print("=" * 60)
    runpod.serverless.start({"handler": handler})