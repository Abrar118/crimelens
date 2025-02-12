from transformers import pipeline
import sys
import json
from PIL import Image
import requests
from io import BytesIO

# Load the model
pipe = pipeline('image-classification', model="prithivMLmods/Deep-Fake-Detector-Model")

# Get the image URL passed as argument
image_url = sys.argv[1]

# If the image is from URL, fetch it using requests
if image_url.startswith('http'):
    response = requests.get(image_url)
    image = Image.open(BytesIO(response.content))
else:
    image = Image.open(image_url)

# Predict on the image
result = pipe(image)

# Output the result as JSON
print(json.dumps(result))
