from fastapi import HTTPException
from PIL import Image, ImageDraw, ImageFont
from pathlib import Path
from datetime import datetime
import locale

# Se configura el locale a español para que los nombres de los meses salgan correctamente.
# Esto puede requerir que el locale 'es_ES.UTF-8' esté disponible en tu sistema operativo.
try:
    locale.setlocale(locale.LC_TIME, 'es_ES.UTF-8')
except locale.Error:
    try:
        locale.setlocale(locale.LC_TIME, 'Spanish_Spain.1252')
    except locale.Error:
        print("Advertencia: No se pudo establecer el locale a español. Los meses podrían aparecer en inglés.")


# Se construyen las rutas de forma robusta
try:
    BASE_DIR = Path(__file__).resolve().parent.parent
    TEMPLATE_IMAGE_PATH = BASE_DIR / "assets/hhhh.jpg"
    FONT_PATH = BASE_DIR / "assets/ARIAL.TTF"
except Exception as e:
    raise ImportError(f"No se pudieron construir las rutas base de los assets: {e}")

def draw_text_centered(draw, y, text, font, fill_color):
    """Función de ayuda para dibujar texto centrado horizontalmente."""
    img_width, _ = draw.im.size
    try:
        text_bbox = draw.textbbox((0, y), text, font=font)
        text_width = text_bbox[2] - text_bbox[0]
        x = (img_width - text_width) / 2
        draw.text((x, y), text, font=font, fill=fill_color)
    except Exception:
        text_width, _ = draw.textsize(text, font=font)
        x = (img_width - text_width) / 2
        draw.text((x, y), text, font=font, fill=fill_color)

def generate_raffle_image(ticket_data: dict):
    """
    Genera una imagen de comprobante de compra con todos los datos pertinentes,
    con el contenido centrado vertical y horizontalmente.
    """
    try:
        template = Image.open(TEMPLATE_IMAGE_PATH)
        img = template.copy().convert("RGBA")
    except FileNotFoundError:
        raise HTTPException(status_code=500, detail="Error Crítico: No se encontró la plantilla de imagen.")

    img_width, img_height = img.size
    overlay = Image.new("RGBA", img.size, (255, 255, 255, 0))
    draw = ImageDraw.Draw(overlay)

    # --- 1. Definición de Fuentes y Colores ---
    try:
        font_title = ImageFont.truetype(str(FONT_PATH), 60)
        font_subtitle = ImageFont.truetype(str(FONT_PATH), 35)
        font_main = ImageFont.truetype(str(FONT_PATH), 40)
        font_numbers = ImageFont.truetype(str(FONT_PATH), 45)
        font_small = ImageFont.truetype(str(FONT_PATH), 25)
    except IOError:
        # Fallback a fuentes por defecto si no se encuentra el archivo ARIAL.TTF
        font_title, font_subtitle, font_main, font_numbers, font_small = [ImageFont.load_default(s) for s in [60, 35, 40, 45, 25]]

    text_color = (0, 0, 0)

    # --- 2. Extracción y Formateo de TODOS los Datos ---
    raffle_name = ticket_data.get("raffle_name", "N/A")
    ticket_id = ticket_data.get("ticket_id", "N/A")
    buyer_name = ticket_data.get("buyer_name", "N/A")
    numbers_str = ", ".join(sorted(ticket_data.get("numbers", [])))
    
    # Se añade la fecha de compra que faltaba
    purchase_date_str = ticket_data.get("purchase_date", "Fecha no definida")
    
    draw_date_str = ticket_data.get("draw_date", "Fecha no definida")

    total_price = ticket_data.get("total_price", 0)
    price_str = f"${total_price:,.0f} COP" if total_price > 0 else "N/A"

    # --- 3. Lógica para Centrado Vertical ---

    # Se define todo el contenido que se va a dibujar
    content_lines = [
        ("¡Compra Exitosa!", font_title, 20),
        (f"Rifa: {raffle_name}", font_subtitle, 40),
        (f"Comprador: {buyer_name}", font_main, 15),
        (f"Fecha de Compra: {purchase_date_str}", font_main, 15),
        (f"Total Pagado: {price_str}", font_main, 40),
        ("Tus Números:", font_title, 20),
        (numbers_str, font_numbers, 40),
        (f"Fecha del Sorteo: {draw_date_str}", font_subtitle, 50),
        (f"ID de Transacción: {ticket_id}", font_small, 5),
        ("Conserva este comprobante. ¡Mucha suerte!", font_small, 0)
    ]

    # Se calcula la altura total del bloque de texto
    total_content_height = sum(font.getbbox(text)[3] - font.getbbox(text)[1] + spacing for text, font, spacing in content_lines)

    # Se calcula la posición 'y' inicial para centrar el bloque
    y = (img_height - total_content_height) / 2

    # --- 4. Dibujo del Fondo Blanco y los Textos ---

    # El fondo blanco se dibuja dinámicamente alrededor del contenido
    padding = 60
    box_y1 = y - padding
    box_y2 = y + total_content_height + padding
    box_xy = [60, box_y1, img_width - 60, box_y2]
    draw.rectangle(box_xy, fill=(255, 255, 255, 210)) # Fondo blanco con ligera transparencia

    # Se dibuja cada línea de texto, ahora perfectamente centrada
    for text, font, spacing in content_lines:
        line_height = font.getbbox(text)[3] - font.getbbox(text)[1]
        draw_text_centered(draw, y, text, font, text_color)
        y += line_height + spacing # Se incrementa 'y' para la siguiente línea

    # --- 5. Composición Final de la Imagen ---
    img_with_overlay = Image.alpha_composite(img, overlay)
    return img_with_overlay.convert("RGB")