import os
from PIL import Image, ImageDraw

def create_adaptive_foreground(src_img, size):
    # size is canvas size in pixels (e.g., 432 for xxxhdpi)
    canvas = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    # Safe zone is roughly 65% of the canvas size
    target_inner_size = int(size * 0.65)
    
    # Scale src_img keeping aspect ratio
    src_w, src_h = src_img.size
    ratio = min(target_inner_size / src_w, target_inner_size / src_h)
    new_w = int(src_w * ratio)
    new_h = int(src_h * ratio)
    
    resized = src_img.resize((new_w, new_h), Image.Resampling.LANCZOS)
    
    # Paste centered
    offset_x = (size - new_w) // 2
    offset_y = (size - new_h) // 2
    canvas.paste(resized, (offset_x, offset_y), resized)
    return canvas

def create_legacy_icon(src_img, size, round_mask=False):
    # Background color #121614
    bg_color = (18, 22, 20, 255)
    
    if round_mask:
        # Transparent base with circular colored background
        base = Image.new('RGBA', (size, size), (0, 0, 0, 0))
        mask = Image.new('L', (size, size), 0)
        draw_mask = ImageDraw.Draw(mask)
        draw_mask.ellipse((1, 1, size - 2, size - 2), fill=255)
        
        bg_circle = Image.new('RGBA', (size, size), bg_color)
        base.paste(bg_circle, (0, 0), mask)
    else:
        # Rounded rectangle or square
        base = Image.new('RGBA', (size, size), bg_color)
    
    # Scale logo to ~70% of size
    target_inner = int(size * 0.70)
    src_w, src_h = src_img.size
    ratio = min(target_inner / src_w, target_inner / src_h)
    new_w = int(src_w * ratio)
    new_h = int(src_h * ratio)
    
    resized = src_img.resize((new_w, new_h), Image.Resampling.LANCZOS)
    offset_x = (size - new_w) // 2
    offset_y = (size - new_h) // 2
    
    if round_mask:
        temp_logo = Image.new('RGBA', (size, size), (0, 0, 0, 0))
        temp_logo.paste(resized, (offset_x, offset_y), resized)
        base.paste(temp_logo, (0, 0), mask)
    else:
        base.paste(resized, (offset_x, offset_y), resized)
        
    return base

def main():
    logo_path = 'assets/images/logo.png'
    if not os.path.exists(logo_path):
        print(f"Error: {logo_path} not found")
        return
        
    logo = Image.open(logo_path).convert('RGBA')
    print(f"Loaded logo: {logo_path}, size={logo.size}")
    
    # Mipmap densities and sizes
    # (density_name, legacy_size, adaptive_fg_size)
    densities = [
        ('mipmap-mdpi', 48, 108),
        ('mipmap-hdpi', 72, 162),
        ('mipmap-xhdpi', 96, 216),
        ('mipmap-xxhdpi', 144, 324),
        ('mipmap-xxxhdpi', 192, 432),
    ]
    
    base_res = 'android/app/src/main/res'
    
    for density, legacy_sz, fg_sz in densities:
        out_dir = os.path.join(base_res, density)
        os.makedirs(out_dir, exist_ok=True)
        
        # 1. Adaptive foreground
        fg = create_adaptive_foreground(logo, fg_sz)
        fg.save(os.path.join(out_dir, 'ic_launcher_foreground.webp'), 'WEBP', quality=95)
        fg.save(os.path.join(out_dir, 'ic_launcher_foreground.png'), 'PNG')
        
        # 2. Legacy square/squircle
        sq = create_legacy_icon(logo, legacy_sz, round_mask=False)
        sq.save(os.path.join(out_dir, 'ic_launcher.webp'), 'WEBP', quality=95)
        sq.save(os.path.join(out_dir, 'ic_launcher.png'), 'PNG')
        
        # 3. Legacy round
        rd = create_legacy_icon(logo, legacy_sz, round_mask=True)
        rd.save(os.path.join(out_dir, 'ic_launcher_round.webp'), 'WEBP', quality=95)
        rd.save(os.path.join(out_dir, 'ic_launcher_round.png'), 'PNG')
        
        print(f"Updated {density}: legacy={legacy_sz}px, fg={fg_sz}px")
        
    # Also update splashscreen drawables
    splash_densities = [
        ('drawable-mdpi', 150),
        ('drawable-hdpi', 225),
        ('drawable-xhdpi', 300),
        ('drawable-xxhdpi', 450),
        ('drawable-xxxhdpi', 600),
    ]
    for d_name, sp_sz in splash_densities:
        sp_dir = os.path.join(base_res, d_name)
        os.makedirs(sp_dir, exist_ok=True)
        # resize logo
        src_w, src_h = logo.size
        ratio = min(sp_sz / src_w, sp_sz / src_h)
        sp_img = logo.resize((int(src_w * ratio), int(src_h * ratio)), Image.Resampling.LANCZOS)
        sp_img.save(os.path.join(sp_dir, 'splashscreen_logo.png'), 'PNG')
        print(f"Updated {d_name} splashscreen_logo.png")

if __name__ == '__main__':
    main()

