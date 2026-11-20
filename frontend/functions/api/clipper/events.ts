import { handleClipEvent, type LiveEnv } from '../../../server/liveData';

/** `POST /api/clipper/events`: der Clipper meldet einen Clip (X-Api-Key). */
export const onRequestPost = ({ request, env }: { request: Request; env: LiveEnv }) =>
  handleClipEvent(request, env);
