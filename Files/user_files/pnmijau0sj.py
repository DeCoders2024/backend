from PIL import Image

image=Image.open("mypic.jpg")

info_dict = {
    "Filename": image.filename,
    "Image Size": image.size,
    "Image Height": image.height,
    "Image Width": image.width,
    "Image Format": image.format,
    "Image Mode": image.mode,
    "Image is Animated": getattr(image, "is_animated", False),
    "Frames in Image": getattr(image, "n_frames", 1),
}

for tag in info_dict:
    print(f"{tag} : {info_dict[tag]}")

