from PIL import Image
import sys
def render(grid, out, z=16):
    h=len(grid); w=len(grid[0])
    im=Image.new('RGB',(w*z+z*2,h*z+z*2),(250,250,250))
    for y,row in enumerate(grid):
        for x,c in enumerate(row):
            col={'#':(0,0,0),'o':(255,255,255),'.':(200,215,230)}[c]
            for yy in range(z):
                for xx in range(z):
                    im.putpixel((z+x*z+xx,z+y*z+yy), col if (xx and yy) else (170,185,200))
    im.save(out)
