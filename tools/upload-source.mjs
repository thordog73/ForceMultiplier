#!/usr/bin/env node
// Upload source to an existing GitHub repository using the user's normal Git authentication.
// This script never creates credentials, changes access, or force-pushes history.
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repository = process.argv[2];
const fail = message => { console.error(message); process.exit(1); };
if (!repository) fail('Usage: node tools/upload-source.mjs https://github.com/YOUR-ACCOUNT/YOUR-REPOSITORY.git');
if (!/^https:\/\/github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+(?:\.git)?$/.test(repository)) {
  fail('Use the HTTPS URL of your existing GitHub repository, without credentials, query parameters, or fragments.');
}
if (!existsSync(path.join(root, 'package.json')) || !existsSync(path.join(root, 'www', 'index.html'))) {
  fail('Run this helper from the complete Force Multiplier source package.');
}
const git = (args, capture = false, allowFailure = false) => {
  const result = spawnSync('git', args, { cwd: root, encoding: 'utf8', stdio: capture ? 'pipe' : 'inherit', shell: false });
  if (result.error) fail('Git is required. Install Git from https://git-scm.com/ and use your normal GitHub sign-in.');
  if (result.status !== 0 && !allowFailure) fail('Git stopped. Resolve the message above and run the same command again. No force push was performed.');
  return result;
};
git(['--version']);
if (!existsSync(path.join(root, '.git'))) git(['init', '-b', 'main']);
const branch = git(['branch', '--show-current'], true).stdout.trim();
if (branch !== 'main') fail('This helper uploads the main branch. Switch to the intended main branch yourself before retrying.');
const current = git(['remote', 'get-url', 'origin'], true, true);
if (current.status === 0) {
  const canonical = value => value.trim().replace(/\.git$/, '').replace(/\/$/, '');
  if (canonical(current.stdout) !== canonical(repository)) fail('This folder already has a different origin. Use a fresh extracted folder or verify your Git remote yourself.');
} else {
  git(['remote', 'add', 'origin', repository]);
}
git(['add', '--all']);
const difference = git(['diff', '--cached', '--quiet'], true, true);
if (difference.status === 1) git(['commit', '-m', 'Prepare Force Multiplier 22 iPhone and iPad app']);
else if (difference.status !== 0) fail('Could not inspect staged changes. No push was attempted.');
git(['push', '-u', 'origin', 'main']);
console.log('Source uploaded. In Codemagic, select this repository and start the iOS simulator check workflow first.');
