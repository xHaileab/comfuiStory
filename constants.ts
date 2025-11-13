
import type { Workflow } from './types';

export const WORKFLOW_DATA: Workflow = {
  "id": "91f6bbe2-ed41-4fd6-bac7-71d5b5864ecb",
  "revision": 0,
  "last_node_id": 100,
  "last_link_id": 186,
  "nodes": [
    {
      "id": 97,
      "type": "MarkdownNote",
      "pos": [
        550,
        780
      ],
      "size": [
        300,
        190
      ],
      "flags": {},
      "order": 0,
      "mode": 0,
      "inputs": [],
      "outputs": [],
      "title": "KSampler settings",
      "properties": {
        "widget_ue_connectable": {}
      },
      "widgets_values": [
        "You can test and find the best setting by yourself. The following table is for reference.\n\n| Model            | Steps | CFG |\n|---------------------|---------------|---------------|\n| Offical             | 50               | 4.0               \n| fp8_e4m3fn             | 20                | 2.5               |\n| fp8_e4m3fn + 4steps LoRA    | 4               | 1.0               |\n"
      ],
      "color": "#432",
      "bgcolor": "#653"
    },
    {
      "id": 8,
      "type": "VAEDecode",
      "pos": [
        938.8890991210938,
        249.7776641845703
      ],
      "size": [
        210,
        46
      ],
      "flags": {
        "collapsed": false
      },
      "order": 14,
      "mode": 0,
      "inputs": [
        {
          "label": "samples",
          "name": "samples",
          "type": "LATENT",
          "link": 128
        },
        {
          "label": "vae",
          "name": "vae",
          "type": "VAE",
          "link": 76
        }
      ],
      "outputs": [
        {
          "label": "IMAGE",
          "name": "IMAGE",
          "type": "IMAGE",
          "slot_index": 0,
          "links": [
            110
          ]
        }
      ],
      "properties": {
        "Node name for S&R": "VAEDecode"
      },
      "widgets_values": []
    },
    {
      "id": 60,
      "type": "SaveImage",
      "pos": [
        1317.778076171875,
        252.22218322753906
      ],
      "size": [
        580,
        650
      ],
      "flags": {},
      "order": 15,
      "mode": 0,
      "inputs": [
        {
          "label": "images",
          "name": "images",
          "type": "IMAGE",
          "link": 110
        },
        {
          "label": "filename_prefix",
          "name": "filename_prefix",
          "type": "STRING",
          // @google/genai FIX: Added missing link property to conform to WorkflowNodeInput type.
          "link": null,
          "widget": {
            "name": "filename_prefix"
          }
        }
      ],
      "outputs": [],
      "properties": {
        "Node name for S&R": "SaveImage"
      },
      "widgets_values": [
        "ComfyUI"
      ]
    },
    {
      "id": 93,
      "type": "ImageScaleToTotalPixels",
      "pos": [
        -297.8948974609375,
        510.6866149902344
      ],
      "size": [
        270,
        82
      ],
      "flags": {},
      "order": 7,
      "mode": 0,
      "inputs": [
        {
          "label": "image",
          "name": "image",
          "type": "IMAGE",
          "link": 177
        },
        {
          "label": "upscale_method",
          "name": "upscale_method",
          "type": "COMBO",
          // @google/genai FIX: Added missing link property to conform to WorkflowNodeInput type.
          "link": null,
          "widget": {
            "name": "upscale_method"
          }
        },
        {
          "label": "megapixels",
          "name": "megapixels",
          "type": "FLOAT",
          // @google/genai FIX: Added missing link property to conform to WorkflowNodeInput type.
          "link": null,
          "widget": {
            "name": "megapixels"
          }
        }
      ],
      "outputs": [
        {
          "label": "IMAGE",
          "name": "IMAGE",
          "type": "IMAGE",
          "links": [
            178,
            179,
            180
          ]
        }
      ],
      "properties": {
        "Node name for S&R": "ImageScaleToTotalPixels"
      },
      "widgets_values": [
        "lanczos",
        1
      ]
    },
    {
      "id": 99,
      "type": "MarkdownNote",
      "pos": [
        -1219.26220703125,
        96.04396057128906
      ],
      "size": [
        540,
        550
      ],
      "flags": {},
      "order": 1,
      "mode": 0,
      "inputs": [],
      "outputs": [],
      "title": "Model links",
      "properties": {},
      "widgets_values": [
        "[Tutorial](https://docs.comfy.org/tutorials/image/qwen/qwen-image-edit) | [教程](https://docs.comfy.org/zh-CN/tutorials/image/qwen/qwen-image-edit)\n\n\n## Model links\n\nYou can find all the models on [Comfy-Org/Qwen-Image_ComfyUI](https://huggingface.co/Comfy-Org/Qwen-Image_ComfyUI/tree/main) and  [Comfy-Org/Qwen-Image-Edit_ComfyUI](https://huggingface.co/Comfy-Org/Qwen-Image-Edit_ComfyUI) \n\n**Diffusion model**\n\n- [qwen_image_edit_fp8_e4m3fn.safetensors](https://huggingface.co/Comfy-Org/Qwen-Image-Edit_ComfyUI/resolve/main/split_files/diffusion_models/qwen_image_edit_fp8_e4m3fn.safetensors)\n\n**LoRA**\n\n- [Qwen-Image-Lightning-4steps-V1.0.safetensors](https://huggingface.co/lightx2v/Qwen-Image-Lightning/resolve/main/Qwen-Image-Lightning-4steps-V1.0.safetensors)\n\n**Text encoder**\n\n- [qwen_2.5_vl_7b_fp8_scaled.safetensors](https://huggingface.co/Comfy-Org/Qwen-Image_ComfyUI/resolve/main/split_files/text_encoders/qwen_2.5_vl_7b_fp8_scaled.safetensors)\n\n**VAE**\n\n- [qwen_image_vae.safetensors](https://huggingface.co/Comfy-Org/Qwen-Image_ComfyUI/resolve/main/split_files/vae/qwen_image_vae.safetensors)\n\nModel Storage Location\n\n```\n📂 ComfyUI/\n├── 📂 models/\n│   ├── 📂 diffusion_models/\n│   │   └── qwen_image_edit_fp8_e4m3fn.safetensors\n│   ├── 📂 loras/\n│   │   └── Qwen-Image-Lightning-4steps-V1.0.safetensors\n│   ├── 📂 vae/\n│   │   └── qwen_image_vae.safetensors\n│   └── 📂 text_encoders/\n│       └── qwen_2.5_vl_7b_fp8_scaled.safetensors\n```\n"
      ],
      "color": "#432",
      "bgcolor": "#653"
    },
    {
      "id": 38,
      "type": "CLIPLoader",
      "pos": [
        -527.29541015625,
        138.3878631591797
      ],
      "size": [
        330,
        110
      ],
      "flags": {},
      "order": 2,
      "mode": 0,
      "inputs": [
        {
          "name": "clip_name",
          "type": "COMBO",
          // @google/genai FIX: Added missing link property to conform to WorkflowNodeInput type.
          "link": null,
          "widget": {
            "name": "clip_name"
          }
        },
        {
          "name": "type",
          "type": "COMBO",
          // @google/genai FIX: Added missing link property to conform to WorkflowNodeInput type.
          "link": null,
          "widget": {
            "name": "type"
          }
        },
        {
          "name": "device",
          "type": "COMBO",
          // @google/genai FIX: Added missing link property to conform to WorkflowNodeInput type.
          "link": null,
          "widget": {
            "name": "device"
          }
        }
      ],
      "outputs": [
        {
          "name": "CLIP",
          "type": "CLIP",
          "links": [
            131,
            132
          ]
        }
      ],
      "properties": {
        "Node name for S&R": "CLIPLoader"
      },
      "widgets_values": [
        "qwen_2.5_vl_7b_fp8_scaled.safetensors",
        "qwen_image",
        "default"
      ]
    },
    {
      "id": 88,
      "type": "VAEEncode",
      "pos": [
        258.7825622558594,
        612.3526000976562
      ],
      "size": [
        140,
        46
      ],
      "flags": {},
      "order": 9,
      "mode": 0,
      "inputs": [
        {
          "name": "pixels",
          "type": "IMAGE",
          "link": 178
        },
        {
          "name": "vae",
          "type": "VAE",
          "link": 168
        }
      ],
      "outputs": [
        {
          "name": "LATENT",
          "type": "LATENT",
          "links": [
            170
          ]
        }
      ],
      "properties": {
        "Node name for S&R": "VAEEncode"
      },
      "widgets_values": []
    },
    {
      "id": 3,
      "type": "KSampler",
      "pos": [
        550,
        240
      ],
      "size": [
        300,
        474
      ],
      "flags": {},
      "order": 13,
      "mode": 0,
      "inputs": [
        {
          "name": "model",
          "type": "MODEL",
          "link": 186
        },
        {
          "name": "positive",
          "type": "CONDITIONING",
          "link": 164
        },
        {
          "name": "negative",
          "type": "CONDITIONING",
          "link": 163
        },
        {
          "name": "latent_image",
          "type": "LATENT",
          "link": 170
        },
        {
          "name": "seed",
          "type": "INT",
          // @google/genai FIX: Added missing link property to conform to WorkflowNodeInput type.
          "link": null,
          "widget": {
            "name": "seed"
          }
        },
        {
          "name": "steps",
          "type": "INT",
          // @google/genai FIX: Added missing link property to conform to WorkflowNodeInput type.
          "link": null,
          "widget": {
            "name": "steps"
          }
        },
        {
          "name": "cfg",
          "type": "FLOAT",
          // @google/genai FIX: Added missing link property to conform to WorkflowNodeInput type.
          "link": null,
          "widget": {
            "name": "cfg"
          }
        },
        {
          "name": "sampler_name",
          "type": "COMBO",
          // @google/genai FIX: Added missing link property to conform to WorkflowNodeInput type.
          "link": null,
          "widget": {
            "name": "sampler_name"
          }
        },
        {
          "name": "scheduler",
          "type": "COMBO",
          // @google/genai FIX: Added missing link property to conform to WorkflowNodeInput type.
          "link": null,
          "widget": {
            "name": "scheduler"
          }
        },
        {
          "name": "denoise",
          "type": "FLOAT",
          // @google/genai FIX: Added missing link property to conform to WorkflowNodeInput type.
          "link": null,
          "widget": {
            "name": "denoise"
          }
        }
      ],
      "outputs": [
        {
          "name": "LATENT",
          "type": "LATENT",
          "links": [
            128
          ]
        }
      ],
      "properties": {
        "Node name for S&R": "KSampler"
      },
      "widgets_values": [
        227667627020742,
        "randomize",
        4,
        1,
        "euler",
        "simple",
        1
      ]
    },
    {
      "id": 75,
      "type": "CFGNorm",
      "pos": [
        98.14743041992188,
        -50.20708465576172
      ],
      "size": [
        290,
        60
      ],
      "flags": {},
      "order": 12,
      "mode": 0,
      "inputs": [
        {
          "name": "model",
          "type": "MODEL",
          "link": 141
        },
        {
          "name": "strength",
          "type": "FLOAT",
          // @google/genai FIX: Added missing link property to conform to WorkflowNodeInput type.
          "link": null,
          "widget": {
            "name": "strength"
          }
        }
      ],
      "outputs": [
        {
          "name": "patched_model",
          "type": "MODEL",
          "links": [
            186
          ]
        }
      ],
      "properties": {
        "Node name for S&R": "CFGNorm"
      },
      "widgets_values": [
        1
      ]
    },
    {
      "id": 66,
      "type": "ModelSamplingAuraFlow",
      "pos": [
        -257.0379333496094,
        -59.40827941894531
      ],
      "size": [
        290,
        60
      ],
      "flags": {},
      "order": 8,
      "mode": 0,
      "inputs": [
        {
          "name": "model",
          "type": "MODEL",
          "link": 185
        },
        {
          "name": "shift",
          "type": "FLOAT",
          // @google/genai FIX: Added missing link property to conform to WorkflowNodeInput type.
          "link": null,
          "widget": {
            "name": "shift"
          }
        }
      ],
      "outputs": [
        {
          "name": "MODEL",
          "type": "MODEL",
          "links": [
            141
          ]
        }
      ],
      "properties": {
        "Node name for S&R": "ModelSamplingAuraFlow"
      },
      "widgets_values": [
        3
      ]
    },
    {
      "id": 89,
      "type": "LoraLoaderModelOnly",
      "pos": [
        -619.3862915039062,
        -70.28253173828125
      ],
      "size": [
        270,
        82
      ],
      "flags": {},
      "order": 6,
      "mode": 0,
      "inputs": [
        {
          "name": "model",
          "type": "MODEL",
          "link": 184
        },
        {
          "name": "lora_name",
          "type": "COMBO",
          // @google/genai FIX: Added missing link property to conform to WorkflowNodeInput type.
          "link": null,
          "widget": {
            "name": "lora_name"
          }
        },
        {
          "name": "strength_model",
          "type": "FLOAT",
          // @google/genai FIX: Added missing link property to conform to WorkflowNodeInput type.
          "link": null,
          "widget": {
            "name": "strength_model"
          }
        }
      ],
      "outputs": [
        {
          "name": "MODEL",
          "type": "MODEL",
          "links": [
            185
          ]
        }
      ],
      "properties": {
        "Node name for S&R": "LoraLoaderModelOnly"
      },
      "widgets_values": [
        "Qwen-Image-Lightning-4steps-V1.0.safetensors",
        1
      ]
    },
    {
      "id": 37,
      "type": "UNETLoader",
      "pos": [
        -1056.9476318359375,
        -70.28253173828125
      ],
      "size": [
        330,
        90
      ],
      "flags": {},
      "order": 3,
      "mode": 0,
      "inputs": [
        {
          "name": "unet_name",
          "type": "COMBO",
          // @google/genai FIX: Added missing link property to conform to WorkflowNodeInput type.
          "link": null,
          "widget": {
            "name": "unet_name"
          }
        },
        {
          "name": "weight_dtype",
          "type": "COMBO",
          // @google/genai FIX: Added missing link property to conform to WorkflowNodeInput type.
          "link": null,
          "widget": {
            "name": "weight_dtype"
          }
        }
      ],
      "outputs": [
        {
          "name": "MODEL",
          "type": "MODEL",
          "links": [
            184
          ]
        }
      ],
      "properties": {
        "Node name for S&R": "UNETLoader"
      },
      "widgets_values": [
        "qwen_image_edit_fp8_e4m3fn.safetensors",
        "default"
      ]
    },
    {
      "id": 39,
      "type": "VAELoader",
      "pos": [
        -521.22412109375,
        322.6728820800781
      ],
      "size": [
        330,
        60
      ],
      "flags": {},
      "order": 4,
      "mode": 0,
      "inputs": [
        {
          "name": "vae_name",
          "type": "COMBO",
          // @google/genai FIX: Added missing link property to conform to WorkflowNodeInput type.
          "link": null,
          "widget": {
            "name": "vae_name"
          }
        }
      ],
      "outputs": [
        {
          "name": "VAE",
          "type": "VAE",
          "links": [
            76,
            161,
            162,
            168
          ]
        }
      ],
      "properties": {
        "Node name for S&R": "VAELoader"
      },
      "widgets_values": [
        "qwen_image_vae.safetensors"
      ]
    },
    {
      "id": 78,
      "type": "LoadImage",
      "pos": [
        -640.4326782226562,
        507.03704833984375
      ],
      "size": [
        274.080078125,
        314.0000305175781
      ],
      "flags": {},
      "order": 5,
      "mode": 0,
      "inputs": [
        {
          "name": "image",
          "type": "COMBO",
          // @google/genai FIX: Added missing link property to conform to WorkflowNodeInput type.
          "link": null,
          "widget": {
            "name": "image"
          }
        },
        {
          "name": "upload",
          "type": "IMAGEUPLOAD",
          // @google/genai FIX: Added missing link property to conform to WorkflowNodeInput type.
          "link": null,
          "widget": {
            "name": "upload"
          }
        }
      ],
      "outputs": [
        {
          "name": "IMAGE",
          "type": "IMAGE",
          "links": [
            177
          ]
        },
        {
          "name": "MASK",
          "type": "MASK",
          "links": null
        }
      ],
      "properties": {
        "Node name for S&R": "LoadImage"
      },
      "widgets_values": [
        "example.png",
        "image"
      ]
    },
    {
      "id": 77,
      "type": "TextEncodeQwenImageEdit",
      "pos": [
        42.860313415527344,
        346.8766784667969
      ],
      "size": [
        360,
        150
      ],
      "flags": {},
      "order": 11,
      "mode": 0,
      "inputs": [
        {
          "name": "clip",
          "type": "CLIP",
          "link": 132
        },
        {
          "name": "vae",
          "type": "VAE",
          "link": 161
        },
        {
          "name": "image",
          "type": "IMAGE",
          "link": 180
        },
        {
          "name": "prompt",
          "type": "STRING",
          // @google/genai FIX: Added missing link property to conform to WorkflowNodeInput type.
          "link": null,
          "widget": {
            "name": "prompt"
          }
        }
      ],
      "outputs": [
        {
          "name": "CONDITIONING",
          "type": "CONDITIONING",
          "links": [
            163
          ]
        }
      ],
      "properties": {
        "Node name for S&R": "TextEncodeQwenImageEdit"
      },
      "widgets_values": [
        ""
      ],
      "color": "#223",
      "bgcolor": "#335"
    },
    {
      "id": 76,
      "type": "TextEncodeQwenImageEdit",
      "pos": [
        42.860313415527344,
        146.87673950195312
      ],
      "size": [
        360,
        150
      ],
      "flags": {},
      "order": 10,
      "mode": 0,
      "inputs": [
        {
          "name": "clip",
          "type": "CLIP",
          "link": 131
        },
        {
          "name": "vae",
          "type": "VAE",
          "link": 162
        },
        {
          "name": "image",
          "type": "IMAGE",
          "link": 179
        },
        {
          "name": "prompt",
          "type": "STRING",
          // @google/genai FIX: Added missing link property to conform to WorkflowNodeInput type.
          "link": null,
          "widget": {
            "name": "prompt"
          }
        }
      ],
      "outputs": [
        {
          "name": "CONDITIONING",
          "type": "CONDITIONING",
          "links": [
            164
          ]
        }
      ],
      "properties": {
        "Node name for S&R": "TextEncodeQwenImageEdit"
      },
      "widgets_values": [
        "Convert to 3D Pixar animation style, in a white background, playing guitar"
      ],
      "color": "#232",
      "bgcolor": "#353"
    }
  ],
  "links": [
    [
      76,
      39,
      0,
      8,
      1,
      "VAE"
    ],
    [
      110,
      8,
      0,
      60,
      0,
      "IMAGE"
    ],
    [
      128,
      3,
      0,
      8,
      0,
      "LATENT"
    ],
    [
      131,
      38,
      0,
      76,
      0,
      "CLIP"
    ],
    [
      132,
      38,
      0,
      77,
      0,
      "CLIP"
    ],
    [
      141,
      66,
      0,
      75,
      0,
      "MODEL"
    ],
    [
      161,
      39,
      0,
      77,
      1,
      "VAE"
    ],
    [
      162,
      39,
      0,
      76,
      1,
      "VAE"
    ],
    [
      163,
      77,
      0,
      3,
      2,
      "CONDITIONING"
    ],
    [
      164,
      76,
      0,
      3,
      1,
      "CONDITIONING"
    ],
    [
      168,
      39,
      0,
      88,
      1,
      "VAE"
    ],
    [
      170,
      88,
      0,
      3,
      3,
      "LATENT"
    ],
    [
      177,
      78,
      0,
      93,
      0,
      "IMAGE"
    ],
    [
      178,
      93,
      0,
      88,
      0,
      "IMAGE"
    ],
    [
      179,
      93,
      0,
      76,
      2,
      "IMAGE"
    ],
    [
      180,
      93,
      0,
      77,
      2,
      "IMAGE"
    ],
    [
      184,
      37,
      0,
      89,
      0,
      "MODEL"
    ],
    [
      185,
      89,
      0,
      66,
      0,
      "MODEL"
    ],
    [
      186,
      75,
      0,
      3,
      0,
      "MODEL"
    ]
  ],
  "groups": [],
  "config": {},
  "extra": {},
  "version": 0.4
};
