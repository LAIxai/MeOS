# v4.2.535: 俊克の見当付き BTRON 3種(96×96・左上の角に見当線・3つとも手の角が同じ (0,18))からカーソルを作る。
#   ★絵には手を加えない。やるのは2つだけ:
#     ① 見当線(左上の角から伸びる薄い線= 行0の x<8 と 列0の y<8 の半透明)を消す
#     ② 上に透明の行を2つ足す= 角を 18→20(4の倍数)へ。当たりは 24px 単位でしか書けない(96px では4画素刻み)ので、角を刻みに乗せる。
#        下にも2行足して 96×100(=24×25 の4倍ちょうど)。1x は 96 を 1/4 に縮めて作る。
#   当たりは3つとも (0,5)(= 96px の 20÷4)。
#   ★v4.2.536(実測 cursor_match.py: (0,5) と書くと実際の当たりは絵の約6.0(5.65/6.38/6.31・前の5.82)= 3つとも約1画素下)
#     → 当たりの数は変えず、絵を1画素(96pxで4行)下げる= 上に透明6行・下に2行(96×104)。角は24= 6.0
import os, base64, io
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__))
SRC = {'hand': 'BTRONポインタ2選択指-見当付き.png', 'palm': 'BTRONポインタ2移動手-見当付き.png', 'grip': 'BTRONポインタ2握り-見当付き.png'}
out = {}
for k, fn in SRC.items():
    a = Image.open(os.path.join(HERE, 'reg96', fn)).convert('RGBA')
    px = a.load()
    for x in range(8):
        if px[x, 0][3] <= 120: px[x, 0] = (0, 0, 0, 0)
    for y in range(8):
        if px[0, y][3] <= 120: px[0, y] = (0, 0, 0, 0)
    c4 = Image.new('RGBA', (96, 104), (0, 0, 0, 0)); c4.paste(a, (0, 6))
    c1 = c4.resize((24, 26), Image.LANCZOS)
    c4.save(os.path.join(HERE, 'meos_btron2_%s_4x.png' % k)); c1.save(os.path.join(HERE, 'meos_btron2_%s_1x.png' % k))
    def b64(im):
        bio = io.BytesIO(); im.save(bio, 'PNG'); return base64.b64encode(bio.getvalue()).decode()
    out[k] = (b64(c1), b64(c4))
    print(k, 'corner col0 first y (4x)=', [y for y in range(104) if c4.getpixel((0, y))[3] > 128][:1])
import json
json.dump(out, open(os.path.join(HERE, 'reg96_b64.json'), 'w'))
