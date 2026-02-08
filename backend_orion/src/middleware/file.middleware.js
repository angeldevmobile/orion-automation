import multer from 'multer';
import path from 'path';
import fs from 'fs';
// Crear carpeta de uploads si no existe
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}
// Configurar storage de multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const projectId = typeof req.params.id === 'string' ? req.params.id : 'temp';
        const projectDir = path.join(uploadsDir, projectId);
        if (!fs.existsSync(projectDir)) {
            fs.mkdirSync(projectDir, { recursive: true });
        }
        cb(null, projectDir);
    },
    filename: (req, file, cb) => {
        // Mantener el nombre original del archivo
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const name = path.basename(file.originalname, ext);
        cb(null, `${name}-${uniqueSuffix}${ext}`);
    }
});
// Filtro de tipos de archivo permitidos
const fileFilter = (req, file, cb) => {
    const allowedExtensions = ['.js', '.ts', '.jsx', '.tsx', '.py', '.java', '.zip', '.md', '.txt', '.json', '.css', '.html'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedExtensions.includes(ext)) {
        cb(null, true);
    }
    else {
        cb(new Error(`Tipo de archivo no permitido: ${ext}`));
    }
};
export const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 100 * 1024 * 1024,
        files: 50
    }
});
//# sourceMappingURL=file.middleware.js.map