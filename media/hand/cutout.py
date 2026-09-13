import sys
from PIL import Image
def cutout(src, pad, halo, th, dst):
    im=Image.open(src).convert('RGB'); W,H=im.size
    bg=set(); st=[(x,y) for x in range(W) for y in (0,H-1)]+[(x,y) for y in range(H) for x in (0,W-1)]
    def light(p): return min(im.getpixel(p))>=th
    while st:
        p=st.pop()
        if p in bg: continue
        x,y=p
        if not(0<=x<W and 0<=y<H) or not light(p): continue
        bg.add(p); st+=[(x+1,y),(x-1,y),(x,y+1),(x,y-1)]
    CW,CH=W+pad*2,H+pad*2
    out=Image.new('RGBA',(CW,CH),(0,0,0,0))
    for y in range(H):
        for x in range(W):
            if (x,y) not in bg:
                r,g,b=im.getpixel((x,y)); out.putpixel((x+pad,y+pad),(r,g,b,255))
    ink=set((x+pad,y+pad) for y in range(H) for x in range(W) if (x,y) not in bg)
    for y in range(CH):
        for x in range(CW):
            if (x,y) in ink: continue
            if any((x+dx,y+dy) in ink for dy in range(-halo,halo+1) for dx in range(-halo,halo+1) if dx*dx+dy*dy<=halo*halo+halo):
                out.putpixel((x,y),(255,255,255,255))
    out.save(dst); return out.size
th=int(sys.argv[2]) if len(sys.argv)>2 else 248
D='/Volumes/T7_SSD2TB/Claude Code/MeOS/tmp/v4.2.78_1149/'
print(cutout(D+'BTRONポインタ24.png',1,1,th,sys.argv[1]+'/u24.png'))
print(cutout(D+'BTRONポインタ48.png',2,2,th,sys.argv[1]+'/u48.png'))
# preview on light / dark / magenta
for name,z in (('u24',16),('u48',8)):
    a=Image.open(sys.argv[1]+'/%s.png'%name); A=a.resize((a.width*z,a.height*z),Image.NEAREST)
    W=Image.new('RGB',(A.width*3+40,A.height+20),(60,60,60))
    for i,bgc in enumerate([(245,245,245),(37,37,38),(255,0,255)]):
        t=Image.new('RGB',A.size,bgc); t.paste(A,(0,0),A); W.paste(t,(10+i*(A.width+10),10))
    W.save(sys.argv[1]+'/%s_prev.png'%name)
