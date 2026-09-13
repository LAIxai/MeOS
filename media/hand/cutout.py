# v4.2.84: 俊克が Affinity で描いた手を、そのままカーソルに使う。
#   ★絵には手を加えない(白い縁も塗りも足さない・俊克 pm00:34「あなたが白く塗らなくて良いんだよ」)。
#   ★やるのは1つだけ= 2x を 1x のちょうど倍の大きさに揃える(48×39 → 48×40・足すのは透明の1行)。
import os
from PIL import Image
HERE=os.path.dirname(os.path.abspath(__file__))
a=Image.open(os.path.join(HERE,'source_24.png')).convert('RGBA')
b0=Image.open(os.path.join(HERE,'source_48.png')).convert('RGBA')
b=Image.new('RGBA',(a.width*2,a.height*2),(0,0,0,0)); b.paste(b0,(0,0))
a.save(os.path.join(HERE,'meos_hand_1x.png')); b.save(os.path.join(HERE,'meos_hand_2x.png'))
print(a.size,b.size)
