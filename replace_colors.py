import os

replacements = {
    '--royal-sapphire: #1e3a8a': '--oxford-green: #164A3A',
    '--royal-sapphire-deep: #172554': '--oxford-green-deep: #0e3025',
    '--royal-sapphire-light: #2563eb': '--oxford-green-light: #206c54',
    '--royal-sapphire-tint: #dbeafe': '--oxford-green-tint: #e6f0ed',
    '--royal-cobalt: #1d4ed8': '--oxford-green-bright: #1c5d49',
    
    '--regal-amber: #d97706': '--ceremonial-gold: #B9832F',
    '--regal-amber-light: #f59e0b': '--ceremonial-gold-light: #c89645',
    '--regal-amber-gold: #fbbf24': '--ceremonial-gold-bright: #d4a75a',
    '--regal-amber-tint: #fef3c7': '--ceremonial-gold-tint: #f6efe1',
    
    '--vitality-emerald: #059669': '--ceremonial-gold-alt: #966b26',
    '--vitality-emerald-light: #10b981': '--ceremonial-gold-alt-light: #a8782a',
    '--vitality-emerald-tint: #ecfdf5': '--ceremonial-gold-alt-tint: #f6efe1',
    
    '--ink-primary: #1e2d5a': '--ink-primary: #0e3025',
    '--ink-secondary: #3b4f7a': '--ink-secondary: #1a4a38',
    '--ink-tertiary: #6478a8': '--ink-tertiary: #3a6c54',
    '--ink-muted: #8fa3c4': '--ink-muted: #7ca390',
    
    '--canvas-base: #f8fafc': '--canvas-base: #F3EBDD',
    '--canvas-surface: #ffffff': '--canvas-surface: #fdfbf7',
    '--canvas-subtle: #f1f5f9': '--canvas-subtle: #efe4d0',
    '--canvas-cream: #faf7f0': '--canvas-cream: #F3EBDD',

    'rgba(30, 58, 138': 'rgba(22, 74, 58',
    'rgba(23, 37, 84': 'rgba(14, 48, 37',
    'rgba(37, 99, 235': 'rgba(32, 108, 84',
    
    'rgba(217, 119, 6': 'rgba(185, 131, 47',
    'rgba(245, 158, 11': 'rgba(200, 150, 69',
    
    'rgba(16, 185, 129': 'rgba(185, 131, 47',

    'sapphire': 'oxford-green',
    'amber': 'ceremonial-gold',
    'emerald': 'ceremonial-gold',
    'pearl': 'parchment-ivory',

    'Sapphire': 'Oxford Green',
    'Amber': 'Ceremonial Gold',
    'Emerald': 'Ceremonial Gold',
    'Pearl': 'Parchment Ivory',
    
    'royal-oxford-green': 'oxford-green',
    'regal-ceremonial-gold': 'ceremonial-gold',
    'vitality-ceremonial-gold': 'ceremonial-gold-alt',

    '#1e3a8a': '#164A3A',
    '#1e40af': '#134032',
    '#2563eb': '#206c54',
    '#172554': '#0e3025',
    '#f8fafc': '#F3EBDD',
    'text-ceremonial-gold-300': 'text-ceremonial-gold',
    'text-ceremonial-gold-500': 'text-ceremonial-gold'
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
