from PIL import Image

class ImageUtils():
    def modify_png(self,path):
        png = Image.open(path)
        png.load() # required for png.split()

        background = Image.new("RGB", png.size, (255, 255, 255))
        if len(png.split()) == 3:
            return
        background.paste(png, mask=png.split()[3]) # 3 is the alpha channel

        background.save(path, 'PNG', quality=80)

imgu = ImageUtils()
imgu.modify_png('3.png')
