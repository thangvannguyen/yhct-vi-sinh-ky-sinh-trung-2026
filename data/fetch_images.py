"""Tải hình minh họa từ Wikimedia Commons và ghi nguồn + giấy phép.

    python3 data/fetch_images.py <lessonId> <tên-file>=File:<Tên trên Commons> [...]

Ảnh lưu ở public/images/lessons/<lessonId>/<tên-file>.<đuôi> (bản thu nhỏ ≤ 1400px),
nguồn ghi vào content/image-credits/<lessonId>.json — trang bài học tự hiện
"Ảnh: tác giả · giấy phép · Wikimedia Commons" dưới mỗi hình.
Chỉ dùng ảnh Public domain / CC BY / CC BY-SA (ảnh CDC trên Commons hầu hết là
Public domain). Ảnh PNG lớn nên đổi sang JPG: sips -s format jpeg in.png --out out.jpg
"""
import json, os, re, sys, urllib.parse, urllib.request
UA = {'User-Agent': 'vskst-study-site/1.0 (thagvip2@gmail.com)'}
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
lesson = sys.argv[1]
out = os.path.join(ROOT, 'public', 'images', 'lessons', lesson)
credits_path = os.path.join(ROOT, 'content', 'image-credits', lesson + '.json')
os.makedirs(out, exist_ok=True)
credits = json.load(open(credits_path)) if os.path.exists(credits_path) else {}
for arg in sys.argv[2:]:
    name, title = arg.split('=', 1)
    q = urllib.parse.urlencode({'action': 'query', 'titles': title, 'prop': 'imageinfo', 'iiprop': 'url|size|extmetadata',
        'iiurlwidth': 1400, 'iiextmetadatafilter': 'LicenseShortName|Artist|LicenseUrl', 'format': 'json'})
    d = json.load(urllib.request.urlopen(urllib.request.Request('https://commons.wikimedia.org/w/api.php?' + q, headers=UA)))
    p = next(iter(d['query']['pages'].values()))
    if 'imageinfo' not in p:
        print('MISSING', title); continue
    ii = p['imageinfo'][0]; m = ii['extmetadata']
    url = ii.get('thumburl') if ii['width'] > 1400 or title.lower().endswith(('.tif', '.tiff', '.gif')) else ii['url']
    url = url or ii['url']
    ext = os.path.splitext(urllib.parse.urlparse(url).path)[1].lower().replace('.jpeg', '.jpg')
    fn = name + ext
    data = urllib.request.urlopen(urllib.request.Request(url, headers=UA)).read()
    open(os.path.join(out, fn), 'wb').write(data)
    artist = re.sub(r'<[^>]+>', '', m.get('Artist', {}).get('value', '')).strip().split('\n')[0][:80]
    credits[fn] = {'title': title, 'page': ii['descriptionurl'], 'license': m.get('LicenseShortName', {}).get('value', ''), 'artist': artist}
    print(f'{fn:28} {len(data)//1024:5} KB  {credits[fn]["license"]} | {artist}')
json.dump(credits, open(credits_path, 'w'), ensure_ascii=False, indent=1)
