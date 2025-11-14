// src/index.ts
import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';

import { GenerateComponentPayload } from './types';
import { generateReactComponentCode } from './componentGenerator';
import { getFileFromGitHub, saveComponentToGitHub } from './githubClient';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Component Generator API' });
});

app.post('/generate-component', async (req, res) => {
  try {
    const payload = req.body as GenerateComponentPayload;

    if (!payload.componentName || !payload.fields || !Array.isArray(payload.fields)) {
      return res.status(400).json({
        error: 'componentName e fields (array) são obrigatórios.',
      });
    }

    const code = generateReactComponentCode(payload);
    const fileName = `${payload.componentName}.tsx`;


    if (payload.githubPath) {
      await saveComponentToGitHub({
        githubPath: payload.githubPath,
        code,
        message:
          payload.commitMessage ||
          `chore: generate component ${payload.componentName}`,
      });
    }

    return res.status(201).json({
      message: 'Componente gerado com sucesso.',
      fileName,
      githubPath: payload.githubPath ?? null,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao gerar componente.' });
  }
});

app.get('/components/:componentName', async (req, res) => {
  try {
    const { componentName } = req.params;

    if (!componentName) {
      return res
        .status(400)
        .json({ error: 'componentName é obrigatório na URL.' });
    }

    // 1) ler schema pra descobrir o githubPath
    const schemaDir = path.join(process.cwd(), 'generated-schemas');
    const schemaPath = path.join(schemaDir, `${componentName}.json`);

    let schema: GenerateComponentPayload | null = null;

    try {
      const rawSchema = await fs.readFile(schemaPath, 'utf-8');
      schema = JSON.parse(rawSchema) as GenerateComponentPayload;
    } catch (err) {
      // se não tiver schema, não quebra: só loga e tenta usar local
      console.warn(
        `[components/:componentName] Schema não encontrado para ${componentName}. Tentando arquivo local...`
      );
    }

    // 2) se existir githubPath no schema, tenta pegar do GitHub
    if (schema?.githubPath) {
      try {
        const codeFromGitHub = await getFileFromGitHub(schema.githubPath);

        return res.json({
          componentName,
          source: 'github',
          githubPath: schema.githubPath,
          code: codeFromGitHub,
        });
      } catch (err) {
        console.error(
          `[components/:componentName] Erro ao buscar código do GitHub, caindo para arquivo local.`,
          err
        );
        // se der erro no GitHub, cai pro local como fallback
      }
    }

    // 3) fallback: ler o TSX local (se ainda existir)
    const outputDir = path.join(process.cwd(), 'generated-components');
    const filePath = path.join(outputDir, `${componentName}.tsx`);

    let code: string;
    try {
      code = await fs.readFile(filePath, 'utf-8');
    } catch (err) {
      return res.status(404).json({
        error: 'Componente não encontrado nem no GitHub nem localmente.',
        details: {
          expectedLocalPath: filePath,
          expectedSchemaPath: schemaPath,
        },
      });
    }

    return res.json({
      componentName,
      source: 'local',
      code,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao ler componente.' });
  }
});


app.listen(PORT, () => {
  console.log(`Server rodando em http://localhost:${PORT}`);
});
