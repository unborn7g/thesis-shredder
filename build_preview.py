import re

with open('/home/user/thesis-shredder/public/index.html', 'r') as f:
    html = f.read()

with open('/home/user/thesis-shredder/public/styles.css', 'r') as f:
    css = f.read()

with open('/home/user/thesis-shredder/public/app.js', 'r') as f:
    js = f.read()

# Inline CSS
html = html.replace('<link rel="stylesheet" href="styles.css">', f'<style>\n{css}\n</style>')

# Inline JS
html = html.replace('<script src="app.js"></script>', f'<script>\n{js}\n</script>')

with open('/home/user/thesis-shredder/standalone-preview.html', 'w') as f:
    f.write(html)

print('Generated standalone-preview.html successfully. Size:', len(html))
