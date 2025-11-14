"""
Alternative handler filename - RunPod sometimes looks for rp_handler.py
Place this in the root of your repository
"""
import sys
sys.path.insert(0, '/comfyui')

# Import the handler from the main handler file
from handler import handler

# This exposes the handler function for RunPod
__all__ = ['handler']