import express from "express";
import fetch from "node-fetch";
import sharp from "sharp";
import fs from "fs";
import path from "path";

const app = express();
app.use(express.json());

/**
 * POST /resize
 * Body: { url: "https://tusitio.com/foto.jpg" }
 */
app.post("/resize", async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: "Falta la URL" });

    const response = await fetch(url);
    if (!response.ok) throw new Error(`No se pudo descargar: ${url}`);

    const buffer = await response.buffer();

    // Redimensionar con Sharp
    const resized = await sharp(buffer)
      .resize(1200, 1200, { fit: "contain", background: "white" })
      .jpeg({ quality: 90 })
      .toBuffer();

    // Guardar en disco con el mismo nombre
    const fileName = path.basename(url);
    const savePath = path.join("/app/images", fileName);

    fs.writeFileSync(savePath, resized);

    return res.json({
      success: true,
      url, // la URL original se mantiene
      saved: savePath,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});
