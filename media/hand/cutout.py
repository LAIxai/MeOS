# v4.2.82: 俊克が Affinity で描いた手(透明で書き出した物)を、カーソル用に整える。
#   ★手の中は透明のまま(下の字が透けて読める)。線の両側に白い縁を付ける= 暗い画面でも線が沈まない。
#   ★余白 1px/2px(指先と袖が絵の端に接しているので、縁の場所を空ける)。2x は 1x のちょうど倍に揃える。
# 使い方: python3 cutout.py  → meos_hand_1x.png / meos_hand_2x.png → extension.js の MEOS_HAND_CURSOR
import os
from PIL import Image
HERE=os.path.dirname(os.path.abspath(__file__))
def clear(src,pad,halo):
    im=Image.open(src).convert('RGBA'); W,H=im.size
    CW,CH=W+pad*2,H+pad*2
    ink=set((x+pad,y+pad) for y in range(H) for x in range(W) if im.getpixel((x,y))[3]>=128)
    base=Image.new('RGBA',(CW,CH),(0,0,0,0))
    for y in range(CH):
        for x in range(CW):
            if any((x+dx,y+dy) in ink for dy in range(-halo,halo+1) for dx in range(-halo,halo+1) if dx*dx+dy*dy<=halo*halo):
                base.putpixel((x,y),(255,255,255,255))
    top=Image.new('RGBA',(CW,CH),(0,0,0,0)); top.paste(im,(pad,pad))
    base.alpha_composite(top); return base
a=clear(os.path.join(HERE,'source_24.png'),1,1)
b0=clear(os.path.join(HERE,'source_48.png'),2,2)
b=Image.new('RGBA',(a.width*2,a.height*2),(0,0,0,0)); b.paste(b0,(0,0))
a.save(os.path.join(HERE,'meos_hand_1x.png')); b.save(os.path.join(HERE,'meos_hand_2x.png'))
print(a.size,b.size)
