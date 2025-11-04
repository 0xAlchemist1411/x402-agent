import express, { Request, Response } from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { PrismaClient } from '@prisma/client';

const app = express();
const port = process.env.PORT || 3000;
const prisma = new PrismaClient();


const upload = multer({ dest: 'uploads/' });

const USDC_DEVNET_MINT = '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERPYZJDncDU';
const COINBASE_X402_VERIFY_URL = 'https://x402.org/facilitator/verify';
const COINBASE_X402_SETTLE_URL = 'https://x402.org/facilitator/settle';
const PAY_TO_TOKEN_ACCOUNT = '4eAXYnAEEL1tTY1fWgeXWx3xSDHFmYDtDSn4mDyq2Apq';

app.use(express.json());


app.post('/upload', upload.single('file'), async (req: Request, res: Response) => {
  try {
    const { file } = req;
    const price = parseFloat(req.body.price || '0.01');

    if (!file || isNaN(price)) {
      return res.status(400).json({ error: 'Invalid file or price' });
    }

    const saved = await prisma.file.create({
      data: {
        filename: file.originalname,
        path: file.path,
        mime: file.mimetype,
        price
      }
    });

    res.json({ id: saved.id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

app.get('/files/:id', async (req: Request, res: Response) => {
  try {
    const fileId = parseInt(req.params.id);
    const file = await prisma.file.findUnique({ where: { id: fileId } });
    if (!file) return res.status(404).json({ error: 'File not found' });

    const requirement = {
      x402Version: 1,
      accepts: [
        {
          scheme: 'exact',
          network: 'solana-devnet',
          maxAmountRequired: (file.price * 1e6).toFixed(0),
          resource: `/files/${file.id}`,
          description: `Access to ${file.filename}`,
          mimeType: file.mime,
          payTo: PAY_TO_TOKEN_ACCOUNT,
          asset: USDC_DEVNET_MINT,
          extra: null
        }
      ]
    };

    const paymentHeader = req.header('X-PAYMENT');

    if (!paymentHeader) {
      return res.status(402).json(requirement);
    }

    const paymentPayload = JSON.parse(Buffer.from(paymentHeader, 'base64').toString());

    const verifyRes = await axios.post<{ isValid: boolean }>(COINBASE_X402_VERIFY_URL, {
      x402Version: 1,
      paymentPayload,
      paymentRequirements: requirement
    });

    if (!verifyRes.data.isValid) {
      return res.status(402).json({ error: 'Payment not valid' });
    }

    await axios.post(COINBASE_X402_SETTLE_URL, {
      x402Version: 1,
      paymentPayload,
      paymentRequirements: requirement
    });

    res.setHeader('Content-Type', file.mime);
    const fileStream = fs.createReadStream(path.resolve(file.path));
    fileStream.pipe(res);
  } catch (err) {
    res.status(500).json({ error: 'Failed to process payment or serve file' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
