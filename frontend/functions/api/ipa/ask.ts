import { type Env, handleAsk } from '../../../server/ipaAgent';

/** Cloudflare Pages Function: `POST /api/ipa/ask` auf silvanbrors.ch. */
export const onRequestPost = ({ request, env }: { request: Request; env: Env }) =>
  handleAsk(request, env);
