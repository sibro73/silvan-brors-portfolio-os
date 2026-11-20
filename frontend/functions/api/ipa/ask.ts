import { type Ai, handleAsk } from '../../../server/ipaAgent';

interface Env {
  /** Workers-AI-Binding aus `wrangler.toml`. */
  AI?: Ai;
}

/** Cloudflare Pages Function: `POST /api/ipa/ask` auf silvanbrors.ch. */
export const onRequestPost = ({ request, env }: { request: Request; env: Env }) =>
  handleAsk(request, env.AI);
