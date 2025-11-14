// src/githubClient.ts
import { Octokit } from '@octokit/rest';
import dotenv from 'dotenv';

dotenv.config();

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_OWNER = process.env.GITHUB_OWNER;
const GITHUB_REPO = process.env.GITHUB_REPO;
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || 'main';

let octokit: Octokit | null = null;

if (!GITHUB_TOKEN || !GITHUB_OWNER || !GITHUB_REPO) {
  console.warn(
    '[githubClient] GITHUB_TOKEN, GITHUB_OWNER ou GITHUB_REPO não configurados. ' +
      'Upload para GitHub e leitura ficarão desativados.'
  );
} else {
  octokit = new Octokit({ auth: GITHUB_TOKEN });
}

export async function saveComponentToGitHub(params: {
  githubPath: string;
  code: string;
  message?: string;
}) {
  if (!octokit) {
    console.warn(
      '[githubClient] Octokit não inicializado. Verifique variáveis GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO.'
    );
    return;
  }

  const { githubPath, code, message } = params;
  const contentBase64 = Buffer.from(code, 'utf-8').toString('base64');

  let sha: string | undefined;

  try {
    const { data } = await octokit.repos.getContent({
      owner: GITHUB_OWNER as string,
      repo: GITHUB_REPO as string,
      path: githubPath,
      ref: GITHUB_BRANCH,
    });

    if (!Array.isArray(data) && 'sha' in data) {
      sha = data.sha;
    }
  } catch (err: any) {
    if (err.status !== 404) {
      console.error('[githubClient] Erro ao buscar conteúdo existente:', err);
      throw err;
    }
  }

  await octokit.repos.createOrUpdateFileContents({
    owner: GITHUB_OWNER as string,
    repo: GITHUB_REPO as string,
    path: githubPath,
    message: message || `chore: generate component ${githubPath}`,
    content: contentBase64,
    branch: GITHUB_BRANCH,
    sha,
  });
}

// 🔽 NOVO: ler conteúdo de um arquivo do GitHub
export async function getFileFromGitHub(githubPath: string): Promise<string> {
  if (!octokit) {
    throw new Error(
      'Octokit não inicializado. Verifique GITHUB_TOKEN, GITHUB_OWNER e GITHUB_REPO.'
    );
  }

  const { data } = await octokit.repos.getContent({
    owner: GITHUB_OWNER as string,
    repo: GITHUB_REPO as string,
    path: githubPath,
    ref: GITHUB_BRANCH,
  });

  if (Array.isArray(data) || !('content' in data)) {
    throw new Error('Conteúdo inesperado ao ler arquivo do GitHub.');
  }

  const contentBase64 = data.content;
  const buff = Buffer.from(contentBase64, 'base64');
  return buff.toString('utf-8');
}
