# MeOS hand v3 — 24x24 bitmap line art (homage to the BTRON / Cho-Kanji selection finger; drawn from scratch)
import sys, json
from PIL import Image, ImageDraw
OUT=sys.argv[1]; N=24
B=set()
def px(*pts):
    for p in pts: B.add(p)
def seg(x0,y0,x1,y1):
    n=max(abs(x1-x0),abs(y1-y0))
    for i in range(n+1): B.add((round(x0+(x1-x0)*i/n), round(y0+(y1-y0)*i/n)))
# tip
seg(1,1,4,1); seg(1,1,1,4)
# finger upper edge
seg(5,2,10,7)
# finger lower edge (runs on into the palm)
seg(1,4,10,13)
# knuckle 1
px((10,6),(11,5),(12,4),(13,4),(14,5))
# knuckle 2
px((14,4),(15,3),(16,3),(17,4))
# knuckle 3
px((17,4),(18,3),(19,3),(20,3),(21,4))
# ticks between knuckles
seg(14,5,14,7); seg(17,5,17,6)
# right edge
seg(21,5,21,12); px((21,13))
# thumb
px((5,10),(4,11)); seg(4,12,4,14); px((5,15)); seg(6,16,16,16)
# cuff: band x+y in [34..37], x-y in [-9..9]
CUFF=set((x,y) for x in range(N) for y in range(N) if 32<=x+y<=36 and -9<=x-y<=9)
# region fill: flood outside from border through non-black, non-cuff
blk=B|CUFF
out=set(); st=[(0,0),(N-1,0),(0,N-1),(N-1,N-1)]
while st:
    p=st.pop()
    if p in out or p in blk: continue
    x,y=p
    if not(0<=x<N and 0<=y<N): continue
    out.add(p); st+= [(x+1,y),(x-1,y),(x,y+1),(x,y-1)]
g=[]
for y in range(N):
    r=''
    for x in range(N):
        p=(x,y)
        if p in CUFF: r+='#'
        elif p in B and (x+y)>=31 and -10<=x-y<=10: r+='o'   # white gap along the cuff
        elif p in B: r+='#'
        elif p not in out: r+='o'
        else: r+='.'
    g.append(r)
H=[list(r) for r in g]
for y in range(N):
    for x in range(N):
        if g[y][x]=='.' and any(0<=y+dy<N and 0<=x+dx<N and g[y+dy][x+dx]!='.' and g[y+dy][x+dx]=='#' for dy in (-1,0,1) for dx in (-1,0,1)): H[y][x]='o'
g=[''.join(r) for r in H]
print('\n'.join(g))
json.dump(g,open(OUT+'/h3grid.json','w'))
z=14; im=Image.new('RGB',(N*z*2+z*3,N*z+z*2),(30,30,30)); d=ImageDraw.Draw(im)
for y,row in enumerate(g):
    for x,ch in enumerate(row):
        for side,bg in ((0,(245,245,245)),(1,(37,37,38))):
            col={'#':(0,0,0),'o':(255,255,255),'.':bg}[ch]; ox=z+side*(N*z+z)
            d.rectangle([ox+x*z,z+y*z,ox+x*z+z-1,z+y*z+z-1],fill=col)
im.save(OUT+'/h3both.png')
