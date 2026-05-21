# 📁 Carpeta de Recursos (Logos y Sello) - Fyis Catálogo

¡Hola, **Fyis**! Esta es la carpeta dedicada para que guardes todos tus logotipos de plataformas y tu sello personal. El sistema cargará automáticamente tus imágenes si las colocas en el lugar correcto o a través del Panel de Control de Administración.

## 🌟 Cómo colocar tus imágenes:

### 1. Tu Sello / Logotipo de la Marca (Sello de Fyis)
*   **Nombre de archivo recomendado:** `logo.png`
*   **Ubicación:** Coloca tu logotipo principal de la marca en la raíz de la carpeta `public/` (reemplazando el archivo `public/logo.png` existente).
*   **Efecto:** Cambiará automáticamente el logotipo grande que aparece en la cabecera (Hero Section) del catálogo, el ícono de la pestaña de administración, y la barra de navegación del administrador.

### 2. Logotipos de Plataformas Individuales
Puedes subir los logotipos personalizados de cada plataforma (Netflix, Disney, etc.) de dos formas sencillas:

*   **Opción A: A través de la Interfaz del Administrador (¡Recomendada!)**
    1. Ve a tu panel de administración en `/admin` (Contraseña: `fyis`).
    2. En el producto que desees modificar (por ejemplo, Netflix), presiona **"Editar"** o crea un nuevo producto.
    3. Verás un campo para subir una imagen. Selecciona tu logotipo local y guarda.
    4. El sistema guardará la imagen en `public/uploads/` de forma segura y se renderizará automáticamente en vez de usar el logotipo predeterminado.

*   **Opción B: Colocación manual**
    Si deseas subir tus imágenes directamente por archivos o guardarlas aquí como respaldo:
    *   Crea una carpeta aquí en `public/assets/logos/` y guarda tus imágenes.
    *   Para usarlas, puedes subirlas en el Panel de Administración o apuntar el campo de la base de datos a su ruta.

---

### 🎨 Recomendaciones de Diseño de Imágenes
Para mantener la apariencia premium de **Fyis Catálogo**:
- **Formato:** Se recomienda usar formato `.png` con fondo transparente o archivos `.svg` de alta calidad.
- **Forma:** Si usas imágenes cuadradas o circulares para las plataformas, el catálogo las centrará y recortará de forma responsiva con bordes redondeados y un efecto de brillo de su color respectivo.
- **Tamaño:** Para logos de plataformas, un tamaño de `512x512px` es perfecto. Para tu sello principal, `1024x1024px` dará la máxima definición en pantallas Retina.
