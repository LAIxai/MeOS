# v4.2.79: MeOS の手(BTRON/超漢字のポインタへのオマージュ・点は写さずに一から描いた)。
# 使い方: python3 make_hand.py <出力dir> 20 / 40 → grid20.json/grid40.json → PNG → extension.js の MEOS_HAND_CURSOR

import sys, math; sys.path.insert(0,sys.argv[1]); from render import render
from PIL import Image, ImageDraw
N=int(sys.argv[2]) if len(sys.argv)>2 else 20; S=16; U=N*S/21.2
def P(x,y): return ((x+0.6)*U, (y+0.6)*U)
hand=Image.new('L',(N*S,N*S),0); d=ImageDraw.Draw(hand)
# finger: thick polyline tip->base
tx,ty,bx,by,w=1.3,1.3,9.5,8.0,1.45
ang=math.atan2(by-ty,bx-tx); nx,ny=-math.sin(ang)*w, math.cos(ang)*w
d.polygon([P(tx+nx,ty+ny),P(tx-nx,ty-ny),P(bx-nx,by-ny),P(bx+nx,by+ny)], fill=255)
d.ellipse([P(tx-w,ty-w),P(tx+w,ty+w)], fill=255)
# fist
d.polygon([P(6.5,7.5),P(9,5.6),P(16.5,6),P(18.6,9),P(17.6,13.5),P(12.5,16),P(6.5,15.3),P(3.6,12.6),P(4.8,9.4)], fill=255)
for cx,cy,r in [(10.2,5.5,1.8),(13.3,5.0,1.8),(16.3,6.2,1.7)]:
    d.ellipse([P(cx-r,cy-r),P(cx+r,cy+r)], fill=255)
d.ellipse([P(2.6,9.3),P(7.2,13.6)], fill=255)   # thumb
# cuff
cuff=Image.new('L',(N*S,N*S),0); c=ImageDraw.Draw(cuff)
cx,cy,L,T=16.6,16.0,9.4,3.1
ux,uy=math.cos(math.radians(-45)),math.sin(math.radians(-45))   # along bar (up-right)
vx,vy=-uy,ux
pts=[(cx+ux*L/2+vx*T/2,cy+uy*L/2+vy*T/2),(cx-ux*L/2+vx*T/2,cy-uy*L/2+vy*T/2),(cx-ux*L/2-vx*T/2,cy-uy*L/2-vy*T/2),(cx+ux*L/2-vx*T/2,cy+uy*L/2-vy*T/2)]
c.polygon([P(*p) for p in pts], fill=255)
def small(im,th=128): return im.resize((N,N), Image.BOX)
hs=small(hand); cs=small(cuff)
H=[[hs.getpixel((x,y))>120 for x in range(N)] for y in range(N)]
C=[[cs.getpixel((x,y))>120 for x in range(N)] for y in range(N)]
# inner lines (knuckle gaps + thumb) in 20-unit coords
inner=set()
def line(x0,y0,x1,y1):
    n=40
    for i in range(n+1):
        x=x0+(x1-x0)*i/n; y=y0+(y1-y0)*i/n
        K=max(1,N//20)
        for a in range(K):
            for b in range(K): inner.add((int((x+0.6)*N/21.2)+a, int((y+0.6)*N/21.2)+b))
line(11.75,5.2,11.8,7.4); line(14.8,5.3,14.9,7.6)
line(5.6,9.6,8.2,12.2)
g=[]
K=max(1,N//20)
def near(M,x,y,k,val=True):
    return any(0<=y+dy<N and 0<=x+dx<N and M[y+dy][x+dx]==val for dy in range(-k,k+1) for dx in range(-k,k+1))
def nearBg(x,y,k):
    return any(not(0<=y+dy<N and 0<=x+dx<N) or (not H[y+dy][x+dx] and not C[y+dy][x+dx]) for dy in range(-k,k+1) for dx in range(-k,k+1) if abs(dx)+abs(dy)<=k)
for y in range(N):
    r=''
    for x in range(N):
        if C[y][x]: r+='#'
        elif H[y][x]:
            if nearBg(x,y,K): r+='#'
            elif near(C,x,y,K): r+='o'
            elif (x,y) in inner: r+='#'
            else: r+='o'
        elif any(0<=y+dy<N and 0<=x+dx<N and (H[y+dy][x+dx] or C[y+dy][x+dx]) for dy in range(-K,K+1) for dx in range(-K,K+1) if abs(dx)+abs(dy)<=K): r+='o'
        else: r+='.'
    g.append(r)
print('\n'.join(g))
render(g, sys.argv[1]+'/vec%d.png'%N, 280//N)

import json; json.dump(g, open(sys.argv[1]+'/grid%d.json'%N,'w'))
from PIL import Image as I2
z=280//N; im=I2.new('RGB',(N*z*2+z*3,N*z+z*2),(30,30,30))
for y,row in enumerate(g):
    for x,ch in enumerate(row):
        for side,bg in ((0,(245,245,245)),(1,(37,37,38))):
            col={'#':(0,0,0),'o':(255,255,255),'.':bg}[ch]
            ox=z+side*(N*z+z)
            for yy in range(z):
                for xx in range(z): im.putpixel((ox+x*z+xx,z+y*z+yy),col)
im.save(sys.argv[1]+'/both%d.png'%N)
