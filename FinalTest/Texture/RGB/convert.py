try:
    import Image
except ImportError:
    from PIL import Image
    
im1 = Image.open('3.png')
im1 = im1.convert('RGB')
im1.save('3.png')
#print list(im1.getdata())
