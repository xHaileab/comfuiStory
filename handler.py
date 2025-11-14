#!/usr/bin/env python3
import json
import os
import random
import runpod
import urllib.request
import base64
import sys
from pathlib import Path

# Add ComfyUI to path
sys.path.insert(0, '/comfyui')

def download_image(url, save_path):
    """Download image from URL to save_path"""
    try:
        print(f"Downloading image from: {url}")
        urllib.request.urlretrieve(url, save_path)
        print(f"Image saved to: {save_path}")
        return True
    except Exception as e:
        print(f"Error downloading image: {e}")
        return False

def load_workflow(workflow_path="/comfyui/workflow_api.json"):
    """Load the workflow JSON"""
    with open(workflow_path, 'r') as f:
        return json.load(f)

def update_workflow(workflow, prompt, image_filename="example.png"):
    """Update workflow with user inputs"""
    # Update the positive prompt (node 76)
    for node in workflow['nodes']:
        if node['id'] == 76:  # Positive prompt node
            node['widgets_values'][0] = prompt
            print(f"Updated prompt to: {prompt}")
        
        # Update image path (node 78 - LoadImage)
        if node['id'] == 78:
            node['widgets_values'][0] = image_filename
            print(f"Updated input image to: {image_filename}")
        
        # Randomize seed (node 3 - KSampler)
        if node['id'] == 3:
            new_seed = random.randint(0, 2**32 - 1)
            node['widgets_values'][0] = new_seed
            print(f"Set random seed: {new_seed}")
    
    return workflow

def execute_workflow(workflow):
    """Execute the ComfyUI workflow"""
    try:
        import execution
        import nodes
        
        # Convert workflow format to ComfyUI prompt format
        prompt = {}
        for node in workflow['nodes']:
            node_id = str(node['id'])
            node_inputs = {}
            
            # Process node inputs from links
            if 'inputs' in node:
                for inp in node['inputs']:
                    if 'link' in inp and inp['link'] is not None:
                        # Find the source of this link
                        for link in workflow['links']:
                            if link[0] == inp['link']:
                                source_node_id = str(link[1])
                                source_output_index = link[2]
                                node_inputs[inp['name']] = [source_node_id, source_output_index]
                                break
            
            # Add widget values as inputs
            if 'widgets_values' in node and len(node['widgets_values']) > 0:
                node_class = nodes.NODE_CLASS_MAPPINGS.get(node['type'])
                if node_class and hasattr(node_class, 'INPUT_TYPES'):
                    input_types = node_class.INPUT_TYPES()
                    required_inputs = input_types.get('required', {})
                    
                    # Map widget values to input names
                    widget_index = 0
                    for input_name, input_spec in required_inputs.items():
                        if input_name not in node_inputs:
                            if widget_index < len(node['widgets_values']):
                                node_inputs[input_name] = node['widgets_values'][widget_index]
                                widget_index += 1
            
            prompt[node_id] = {
                "inputs": node_inputs,
                "class_type": node['type']
            }
        
        # Execute the prompt
        print("Executing workflow...")
        prompt_id = str(random.randint(0, 999999))
        
        executor = execution.PromptExecutor(None)
        output = executor.execute(prompt, prompt_id, {}, [])
        
        print("Workflow execution completed")
        return True
        
    except Exception as e:
        print(f"Error executing workflow: {e}")
        import traceback
        traceback.print_exc()
        return False

def get_latest_output():
    """Get the most recent output image"""
    output_dir = Path("/comfyui/output")
    images = list(output_dir.glob("*.png")) + list(output_dir.glob("*.jpg"))
    
    if not images:
        return None
    
    # Sort by modification time, newest first
    images.sort(key=lambda x: x.stat().st_mtime, reverse=True)
    return images[0]

def handler(event):
    """
    RunPod serverless handler
    
    Input format:
    {
        "input": {
            "prompt": "Your text prompt",
            "image_url": "https://example.com/image.jpg" (optional)
        }
    }
    """
    try:
        print("=" * 60)
        print("Processing new request")
        print("=" * 60)
        
        # Get inputs
        job_input = event.get("input", {})
        prompt = job_input.get("prompt", os.environ.get("PROMPT", "Convert to 3D Pixar animation style"))
        image_url = job_input.get("image_url")
        
        print(f"Prompt: {prompt}")
        print(f"Image URL: {image_url}")
        
        # Handle input image
        if image_url:
            image_filename = f"input_{random.randint(100000, 999999)}.png"
            image_path = f"/comfyui/input/{image_filename}"
            
            if not download_image(image_url, image_path):
                return {"error": "Failed to download input image from URL"}
        else:
            # Use default example image
            image_filename = "example.png"
            image_path = f"/comfyui/input/{image_filename}"
            
            if not os.path.exists(image_path):
                return {"error": "No input image provided and no example.png found in /comfyui/input/"}
        
        # Clear old output files
        output_dir = Path("/comfyui/output")
        for old_file in output_dir.glob("*.png"):
            try:
                old_file.unlink()
            except:
                pass
        
        # Load and update workflow
        workflow = load_workflow()
        workflow = update_workflow(workflow, prompt, image_filename)
        
        # Execute workflow
        if not execute_workflow(workflow):
            return {"error": "Workflow execution failed"}
        
        # Get output image
        output_image = get_latest_output()
        if not output_image:
            return {"error": "No output image was generated"}
        
        print(f"Output image: {output_image}")
        
        # Read and encode image
        with open(output_image, 'rb') as f:
            image_data = base64.b64encode(f.read()).decode('utf-8')
        
        print("=" * 60)
        print("Request completed successfully")
        print("=" * 60)
        
        return {
            "status": "success",
            "image": image_data,
            "image_path": str(output_image)
        }
        
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print("=" * 60)
        print("ERROR:")
        print(error_trace)
        print("=" * 60)
        return {
            "error": str(e),
            "trace": error_trace
        }

if __name__ == "__main__":
    print("Starting RunPod Serverless Handler for ComfyUI Story")
    print("Waiting for requests...")
    runpod.serverless.start({"handler": handler})