import os
import base64
from PIL import Image

# Folder gambar
IMAGE_FOLDER = "images"

# Ekstensi yang didukung
extensions = (".jpg", ".jpeg", ".png", ".webp")

for filename in os.listdir(IMAGE_FOLDER):
    if filename.lower().endswith(extensions):
        filepath = os.path.join(IMAGE_FOLDER, filename)

        # Baca ukuran gambar
        with Image.open(filepath) as img:
            width, height = img.size

        # Encode gambar ke Base64
        with open(filepath, "rb") as f:
            encoded = base64.b64encode(f.read()).decode("utf-8")

        ext = os.path.splitext(filename)[1].lower()

        if ext in [".jpg", ".jpeg"]:
            mime = "image/jpeg"
        elif ext == ".png":
            mime = "image/png"
        elif ext == ".webp":
            mime = "image/webp"
        else:
            mime = "image/jpeg"

        svg_content = f'''<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg"
     width="{width}"
     height="{height}"
     viewBox="0 0 {width} {height}">
    <image
        width="{width}"
        height="{height}"
        href="data:{mime};base64,{encoded}" />
</svg>
'''

        svg_name = os.path.splitext(filename)[0] + ".svg"
        svg_path = os.path.join(IMAGE_FOLDER, svg_name)

        with open(svg_path, "w", encoding="utf-8") as svg_file:
            svg_file.write(svg_content)

        print(f"✔ {filename} -> {svg_name}")

print("\nSelesai!")