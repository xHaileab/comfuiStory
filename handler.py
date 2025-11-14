# A dummy handler.py to allow the build system to pass.
# The 'runpod/worker-comfyui' base image has its own handler
# and will NOT use this code.

def handler(job):
    return {"error": "This dummy handler should not be called."}

if __name__ == "__main__":
    print("This is a dummy handler file for the build system.")