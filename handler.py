import json
import os
import random
import runpod
import urllib.request
import urllib.parse
from pathlib import Path

# ComfyUI imports
import sys
sys.path.append('/comfyui')
from nodes import NODE_CLASS_MAPPINGS

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

def update_workflow(workflow, prompt, image_path=None):
    """Update workflow with user inputs"""
    # Update the positive prompt (node 76)
    for node in workflow['nodes']:
        if node['id'] == 76:  # Positive prompt node
            node['widgets_values'][0] = prompt
        
        # Update image path if provided (node 78 - LoadImage)
        if node['id'] == 78 and image_path:
            # Just use the filename, ComfyUI will look in input folder
            node['widgets_values'][0] = os.path.basename(image_path)
        
        # Randomize seed (node 3 - KSampler)
        if node['id'] == 3:
            node['widgets_values'][0] = random.randint(0, 2**32 - 1)
    
    return workflow

def queue_prompt(workflow):
    """Execute the workflow using ComfyUI's execution system"""
    import execution
    import server
    
    # Create a simple prompt structure
    prompt = {"prompt": workflow}
    
    # Get the server instance
    server_instance = server.PromptServer.instance
    
    # Queue the prompt
    prompt_id = server_instance.queue_prompt(prompt)
    
    return prompt_id

def get_output_images(output_dir="/comfyui/output"):
    """Get the generated images from output directory"""
    output_path = Path(output_dir)
    images = list(output_path.glob("*.png")) + list(output_path.glob("*.jpg"))
    
    # Sort by modification time to get the latest
    images.sort(key=lambda x: x.stat().st_mtime, reverse=True)
    
    return images

def handler(event):
    """
    RunPod serverless handler function
    
    Expected input:
    {
        "input": {
            "prompt": "Your text prompt here",
            "image_url": "https://example.com/image.png" (optional)
        }
    }
    """
    try:
        # Get input from event
        job_input = event.get("input", {})
        prompt = job_input.get("prompt", os.environ.get("PROMPT", "Convert to 3D Pixar animation style"))
        image_url = job_input.get("image_url", None)
        
        print(f"Processing request with prompt: {prompt}")
        
        # Handle image input if provided
        image_path = None
        if image_url:
            print(f"Downloading image from: {image_url}")
            image_filename = f"input_{random.randint(0, 999999)}.png"
            image_path = f"/comfyui/input/{image_filename}"
            
            if not download_image(image_url, image_path):
                return {"error": "Failed to download input image"}
            
            print(f"Image saved to: {image_path}")
        else:
            # Use example image if no URL provided
            image_path = "/comfyui/input/example.png"
            if not os.path.exists(image_path):
                return {"error": "No input image provided and no example image found"}
        
        # Load and update workflow
        workflow = load_workflow()
        workflow = update_workflow(workflow, prompt, image_path)
        
        # Clear previous outputs
        output_dir = Path("/comfyui/output")
        for old_file in output_dir.glob("*.png"):
            old_file.unlink()
        
        print("Executing workflow...")
        
        # Execute workflow using ComfyUI's internal execution
        import execution
        import nodes
        
        # Process the workflow
        executor = execution.PromptExecutor(server=None)
        
        # Convert workflow to prompt format
        prompt_data = {}
        for node in workflow['nodes']:
            node_id = str(node['id'])
            prompt_data[node_id] = {
                "inputs": {},
                "class_type": node['type']
            }
            
            # Map inputs
            if 'inputs' in node:
                for inp in node['inputs']:
                    if 'link' in inp and inp['link'] is not None:
                        # Find the link
                        link_id = inp['link']
                        for link in workflow['links']:
                            if link[0] == link_id:
                                source_node = str(link[1])
                                source_output = link[2]
                                prompt_data[node_id]['inputs'][inp['name']] = [source_node, source_output]
                                break
            
            # Add widget values
            if 'widgets_values' in node:
                # Map widget values to inputs based on node type
                if node['type'] == 'KSampler':
                    widget_names = ['seed', 'steps', 'cfg', 'sampler_name', 'scheduler', 'denoise']
                    for i, name in enumerate(widget_names):
                        if i < len(node['widgets_values']):
                            prompt_data[node_id]['inputs'][name] = node['widgets_values'][i]
                elif node['type'] == 'TextEncodeQwenImageEdit':
                    prompt_data[node_id]['inputs']['prompt'] = node['widgets_values'][0]
                elif node['type'] == 'LoadImage':
                    prompt_data[node_id]['inputs']['image'] = node['widgets_values'][0]
        
        # Execute
        outputs = executor.execute(prompt_data, str(random.randint(0, 999999)))
        
        print("Workflow executed, collecting outputs...")
        
        # Get output images
        output_images = get_output_images()
        
        if not output_images:
            return {"error": "No output images generated"}
        
        # Return the path to the first (latest) image
        output_image_path = str(output_images[0])
        
        print(f"Generated image: {output_image_path}")
        
        # Read image as base64 for response
        import base64
        with open(output_image_path, 'rb') as img_file:
            img_data = base64.b64encode(img_file.read()).decode('utf-8')
        
        return {
            "status": "success",
            "image": img_data,
            "image_path": output_image_path
        }
        
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f"Error in handler: {error_trace}")
        return {"error": str(e), "trace": error_trace}

if __name__ == "__main__":
    print("Starting RunPod Serverless handler...")
    runpod.serverless.start({"handler": handler})