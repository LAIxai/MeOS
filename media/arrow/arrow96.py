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
c4 = Image.new('RGBA', (96, 104), (0, 0, 0, 0)); c4.paste(a, (0, 6))
c1 = c4.resize((24, 26), Image.LANCZOS)
c4.save(os.path.join(HERE, 'meos_arrow45v_4x.png')); c1.save(os.path.join(HERE, 'meos_arrow45v_1x.png'))
def b64(im):
    bio = io.BytesIO(); im.save(bio, 'PNG'); return base64.b64encode(bio.getvalue()).decode()
json.dump({'arrow': (b64(c1), b64(c4))}, open(os.path.join(HERE, 'arrow96_b64.json'), 'w'))
print('tip col0 first y (4x)=', [y for y in range(104) if c4.getpixel((0, y))[3] > 100][:1])
