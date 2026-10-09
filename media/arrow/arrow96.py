# v4.2.770: 俊克の見当付き 左右対称↖ポインタ45ver0(96×96・見当線と角(0,18)はBTRONの手と同じ)から↖を作る。
#   ★作り方は media/hand/reg96.py と同じ(絵には手を加えない): ①見当線(半透明)を消す ②上に透明6行・下に2行= 96×104・角は24
#   1x は 96 を 1/4 に縮めた 24×26。出す倍率は手と同じ 1.2x/4.8x・当たりも手と同じ (0,5)。
import os, base64, io, json
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__))
a = Image.open(os.path.join(HERE, 'reg96', '左右対称↖ポインタ45ver0.png')).convert('RGBA'); px = a.load()
for x in range(8):
    if px[x, 0][3] <= 120: px[x, 0] = (0, 0, 0, 0)
for y in range(8):
    if px[0, y][3] <= 120: px[0, y] = (0, 0, 0, 0)
# ★v4.2.771(俊克「赤×が少しズレている」): ライトでは×は黒い縁の先端に乗っていた。ダークでは黒い縁が地に溶けて**白い先端**(約2画素内側)が先端に見える
#   → 当たりを白い先端へ= 当たりを右へ1(=4.8画素)・絵を右へ3画素(差1.8)/絵を上へ2画素(上に透明4行・下に4行)。絵の形は触らない
# ★v4.2.772(俊克「まだ右斜めの線の中心からズレている」): 771のスクショで×の2本の線を当てはめた交点に対し、白い先端は右1・下1.5(770は右3・下2.5)→ 絵を左1・上2画素
# ★v4.2.773(俊克 バグ1「逆に離れた。赤×を左上へ」): 772は行き過ぎ= 先端が×の交点の左上へ約1.3(スクショ画素)。771の白い先端の測り(min x+y)は×の縁に混ざって誤っていた
#   → 772の拡大図で目で先端を読み直し、771と772の間= 絵を(3,3)(771より上1・772より右1下1)
c4 = Image.new('RGBA', (100, 104), (0, 0, 0, 0)); c4.paste(a, (3, 3))
c1 = c4.resize((25, 26), Image.LANCZOS)
c4.save(os.path.join(HERE, 'meos_arrow45v_4x.png')); c1.save(os.path.join(HERE, 'meos_arrow45v_1x.png'))
def b64(im):
    bio = io.BytesIO(); im.save(bio, 'PNG'); return base64.b64encode(bio.getvalue()).decode()
json.dump({'arrow': (b64(c1), b64(c4))}, open(os.path.join(HERE, 'arrow96_b64.json'), 'w'))
print('tip col3 first y (4x)=', [y for y in range(104) if c4.getpixel((3, y))[3] > 100][:1])
