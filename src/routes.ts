import express, { Request, Response } from 'express'
import multer from 'multer'
import path from 'path'
import { processCSV } from './csvProcesser'

const router = express.Router()
const upload = multer({ dest: path.join(__dirname, '../uploads')})

router.post('/upload', upload.single('file'), async (req: Request, res: Response): Promise<void> => {
    if (!req.file) {
        res.status(400).json({ message: 'please upload csv'})
        return
    }

    try {
        await processCSV(req.file.path)
        res.json({ message: 'completely upload and save' })
    } catch(error) {
        console.log(error)
        res.status(500).json({ message: 'failed uploading file'})
    }
})

export default router