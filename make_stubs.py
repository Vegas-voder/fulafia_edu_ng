import os, sys
base = r'C:\Users\user\Desktop\fulafia_edu_ng\templates'
os.makedirs(base, exist_ok=True)
pages = [('faculty','Faculty'),('department','Department'),('directorate','Directorate'),('unit','Unit'),('centre','Centre')]
t = open(r'C:\Users\user\Desktop\fulafia_edu_ng\make_stubs.py').read()
for slug, title in pages:
    html = '<html><body><h1>' + title + '</h1><a href=../index.html>Back</a></body></html>'
    with open(os.path.join(base, slug+'.html'),'w') as f:
        f.write(html)
    sys.stdout.write('OK: ' + slug + '\n')
sys.stdout.write('DONE\n')
