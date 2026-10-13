"""Build local-only browser QA pages; never stage the generated public/.qa files.

Usage: python scripts/build-adventure-hud-qa.py --before-ref <pre-HUD commit>
Serve public/ on a disposable localhost port. Open /3d/.qa-pre-adventure.html
to create a real old save, then use its Updated game link. All probes run from
visible buttons in qa-adventure-hud-page.js. Do not use a real player origin.
"""
from pathlib import Path
import argparse
import subprocess

root = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser()
parser.add_argument('--before-ref', required=True)
args = parser.parse_args()
old = subprocess.check_output(['git', 'show', args.before_ref + ':public/3d/index.html'], cwd=root).decode('utf-8')
payload = (root / 'scripts/qa-adventure-hud-page.js').read_text(encoding='utf-8')
for name, source in [('pre-adventure', old), ('adventure', (root / 'public/3d/index.html').read_text(encoding='utf-8'))]:
    source = source.replace('<head>', '<head><base href="/3d/">', 1)
    source = source.replace('if(m && m[1]!==VERSION3D)', 'if(false && m && m[1]!==VERSION3D)')
    source = source.replace('</body>', '<script>' + payload + '</script></body>')
    (root / 'public/3d' / ('.qa-' + name + '.html')).write_text(source, encoding='utf-8')
