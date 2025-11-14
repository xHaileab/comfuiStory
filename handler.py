import os
import runpod
import time
import json
import random
import requests
import subprocess
import urllib.request
from pathlib import Path

COMFYUI_URL = "http://127.0.0.1:8188"
comfyui_process = None

def start_comfyui():
    """Starts ComfyUI server"""
    global comfyui_process
    cmd = ["python", "/comfyui/main.py", "--listen", "--port", "8188"]
    print("Starting ComfyUI server...")
    comfyui_process = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    
    for _ in range(60):
        try:
            requests.get(f"{COMFYUI_URL}/system_stats", timeout=2)
            print("✓ ComfyUI server is ready!")
            return
        except (requests.ConnectionError, requests.Timeout):
            time.sleep(1)
    
    print("✗ ComfyUI server failed to start.")
    if comfyui_process.stderr:
        stderr = comfyui_process.stderr.read()
        print(f"ComfyUI Error: {stderr}")
    raise RuntimeError("ComfyUI server failed to start")

def download_image(url, save_path):
    """Download user-provided image URLs only"""
    try:
        urllib.request.urlretrieve(url, save_path)
        return True
    except Exception as e:
        print(f"Error downloading image: {e}")
        return False

def load_workflow(workflow_path="/comfyui/workflow_api.json"):
    with open(workflow_path, 'r') as f:
        return json.load(f)

def queue_prompt(workflow):
    payload = {"prompt": workflow}
    try:
        res = requests.post(f"{COMFYUI_URL}/prompt", json=payload, timeout=10)
        res.raise_for_status()
        return res.json()
    except Exception as e:
        print(f"Error queueing prompt: {e}")
        return None

def get_history(prompt_id):
    try:
        res = requests.get(f"{COMFYUI_URL}/history/{prompt_id}", timeout=5)
        res.raise_for_status()
        return res.json()
    except Exception as e:
        print(f"Error getting history: {e}")
        return None

def get_latest_output_image():
    output_dir = Path("/comfyui/output")
    files = list(output_dir.glob("*.png"))
    if not files: return None
    files.sort(key=lambda x: x.stat().st_mtime, reverse=True)
    return files[0]

def handler(event):
    """RunPod serverless handler"""
    try:
        job_input = event.get("input", {})
        prompt = job_input.get("prompt", os.environ.get("PROMPT", "Convert to 3D Pixar animation style"))
        image_url = job_input.get("image_url", None)
        
        print(f"Processing request with prompt: {prompt}")
        
        input_image_name = "example.png"
        if image_url:
            print(f"Downloading image from: {image_url}")
            input_image_name = f"input_{random.randint(0, 999999)}.png"
            image_path = f"/comfyui/input/{input_image_name}"
            
            if not download_image(image_url, image_path):
                return {"error": "Failed to download input image"}
            print(f"Image saved to: {image_path}")
        else:
            print("No image_url provided, using default 'example.png'")

        workflow = load_workflow()
        
        for node in workflow['nodes']:
            if node['id'] == 76:
                node['widgets_values'][0] = prompt
            if node['id'] == 78:
                node['widgets_values'][0] = input_image_name
            if node['id'] == 3:
                node['widgets_values'][0] = random.randint(0, 2**32 - 1)
        
        print("Queueing prompt...")
        prompt_data = queue_prompt(workflow)
        if not prompt_data or 'prompt_id' not in prompt_data:
            return {"error": "Failed to queue prompt"}
            
        prompt_id = prompt_data['prompt_id']
        print(f"Waiting for prompt {prompt_id}...")
        
        max_wait = 300
        start_time = time.time()
        
        while time.time() - start_time < max_wait:
            history = get_history(prompt_id)
            if history and prompt_id in history:
                if 'outputs' in history[prompt_id]:
                    print("✓ Workflow execution complete")
                    break
            time.sleep(1)
        else:
            return {"error": "Workflow execution timed out"}
        
        output_image_path = get_latest_output_image()
        if not output_image_path:
            return {"error": "No output image found"}
            
        print(f"Generated image: {output_image_path}")
        
        import base64
        with open(output_image_path, 'rb') as img_file:
            img_data = base64.b64encode(img_file.read()).decode('utf-8')
        
        return {"status": "success", "image": img_data}
        
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f"Error in handler: {error_trace}")
        return {"error": str(e), "trace": error_trace}

if __name__ == "__main__":
    print("=" * 60)
    print("Verifying network volume...")
    print("--- /comfyui/models ---")
    os.system("ls -lah /comfyui/models")
    print("--- /comfyui/input ---")
    os.system("ls -lah /comfyui/input")
    print("=" * 60)
    
    start_comfyui()
    
    print("Starting RunPod serverless handler...")
    runpod.serverless.start({"handler": handler})