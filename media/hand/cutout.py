# v4.2.85: 俊克が Affinity で描いた手を、そのままカーソルに使う。
#   ★絵には手を加えない(白い縁も塗りも足さない・俊克 pm00:34「あなたが白く塗らなくて良いんだよ」)。
#   ★やるのは1つだけ= 2x/4x を 1x のちょうど倍/4倍の大きさに揃える(足すのは下の透明の行だけ)。
import os
from PIL import Image
HERE=os.path.dirname(os.path.abspath(__file__))
a=Image.open(os.path.join(HERE,'source_24.png')).convert('RGBA')
for k,src in ((2,'source_48.png'),(4,'source_96.png')):
    s=Image.open(os.path.join(HERE,src)).convert('RGBA')
    c=Image.new('RGBA',(a.width*k,a.height*k),(0,0,0,0)); c.paste(s,(0,0))
    c.save(os.path.join(HERE,'meos_hand_%dx.png'%k)); print(k, s.size,'->',c.size)
a.save(os.path.join(HERE,'meos_hand_1x.png'))
# v4.2.144: macOS の3種(指差しver1・移動手・握り)も同じ道で揃える(源は source_mac*_24/96)。
# v4.2.142: 手の平(移動手)と握りも同じ= 1x と 4x を「4倍ちょうど」に揃える(足すのは下の透明の行だけ)。
#   握りは 24×23 / 96×94 で 4倍にならないので、1x を 24 行に(1行足す)・4x を 96 行に(2行足す)。
for name in ('palm', 'grip', 'macpalm', 'macgrip', 'mac'):
    a = Image.open(os.path.join(HERE, 'source_%s_24.png' % name)).convert('RGBA')
    b = Image.open(os.path.join(HERE, 'source_%s_96.png' % name)).convert('RGBA')
    w1 = max(a.width, (b.width + 3) // 4)
    h1 = max(a.height, (b.height + 3) // 4)
    c1 = Image.new('RGBA', (w1, h1), (0, 0, 0, 0)); c1.paste(a, (0, 0))
    c4 = Image.new('RGBA', (w1 * 4, h1 * 4), (0, 0, 0, 0)); c4.paste(b, (0, 0))
    c1.save(os.path.join(HERE, 'meos_%s_1x.png' % name)); c4.save(os.path.join(HERE, 'meos_%s_4x.png' % name))
    print(name, a.size, b.size, '->', c1.size, c4.size)
