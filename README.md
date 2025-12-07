# metaAPIPauMorillas


Este proyecto es una herramienta en Node.js para subir **offline conversions** desde un CSV a la API de Meta (Meta Conversions API / Pixel).

Cada fila del CSV representa una compra realizada en tienda física, y el script se encarga de:

1. Leer el CSV desde una URL.
2. Normalizar y hashear los datos sensibles (emails, teléfonos, nombres, códigos postales, etc.).
3. Mapear cada fila a un evento que Meta entiende.
4. Enviar los eventos en batches a la API del Pixel.

---


## ⚙️ Instalación

1. Clonar el repositorio:

git clone https://github.com/rekloyd/metaAPIPauMorillas.git
cd meta-offline-conversions

Crea un .env con tus  datos de acceso y URL

PIXEL_ID=TU_PIXEL_ID
ACCESS_TOKEN=TU_ACCESS_TOKEN
CSV_URL=URL_DE_TU_CSV
BATCH_SIZE=50

usa npm install para instalar todas las dependencias necesarias