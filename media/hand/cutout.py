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
