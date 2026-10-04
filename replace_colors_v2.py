import os

replacements = {
    '--oxford-green: #164A3A': '--royal-plum: #48254B',
    '--oxford-green-deep: #0e3025': '--royal-plum-deep: #2e1730',
    '--oxford-green-light: #206c54': '--royal-plum-light: #6d3871',
    '--oxford-green-tint: #e6f0ed': '--royal-plum-tint: #f1e6f2',
    '--oxford-green-bright: #1c5d49': '--royal-plum-bright: #603164',
    
    '--ceremonial-gold: #B9832F': '--antique-brass: #AD8751',
    '--ceremonial-gold-light: #c89645': '--antique-brass-light: #be9a68',
    '--ceremonial-gold-bright: #d4a75a': '--antique-brass-bright: #cca978',
    '--ceremonial-gold-tint: #f6efe1': '--antique-brass-tint: #f8f2ea',
    
    '--ceremonial-gold-alt: #966b26': '--antique-brass-alt: #8b6d41',
    '--ceremonial-gold-alt-light: #a8782a': '--antique-brass-alt-light: #9e7b4a',
    '--ceremonial-gold-alt-tint: #f6efe1': '--antique-brass-alt-tint: #f8f2ea',
    
    '--ink-primary: #0e3025': '--ink-primary: #2e1730',
    '--ink-secondary: #1a4a38': '--ink-secondary: #48254b',
    '--ink-tertiary: #3a6c54': '--ink-tertiary: #6d3871',
    '--ink-muted: #7ca390': '--ink-muted: #9e81a3',
    
    '--canvas-base: #F3EBDD': '--canvas-base: #F6EEDF',
    '--canvas-surface: #fdfbf7': '--canvas-surface: #fdfcf9',
    '--canvas-subtle: #efe4d0': '--canvas-subtle: #f0e5d1',
    '--canvas-cream: #F3EBDD': '--canvas-cream: #F6EEDF',

    'rgba(22, 74, 58': 'rgba(72, 37, 75',
    'rgba(14, 48, 37': 'rgba(46, 23, 48',
    'rgba(32, 108, 84': 'rgba(109, 56, 113',
    
    'rgba(185, 131, 47': 'rgba(173, 135, 81',
    'rgba(200, 150, 69': 'rgba(190, 154, 104',

    'oxford-green': 'royal-plum',
    'ceremonial-gold': 'antique-brass',
    'parchment-ivory': 'ivory',

    'Oxford Green': 'Royal Plum',
    'Ceremonial Gold': 'Antique Brass',
    'Parchment Ivory': 'Ivory',

    '#164A3A': '#48254B',
    '#134032': '#3c1f3f',
    '#206c54': '#6d3871',
    '#0e3025': '#2e1730',
    '#F3EBDD': '#F6EEDF'
}

files = ['styles.css', 'index.html']

for f in files:
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
        
    for old, new in replacements.items():
        content = content.replace(old, new)
        
    with open(f, 'w', encoding='utf-8') as file:
        file.write(content)

print("Replacement complete.")
