import { handleGetReport, handlePostReport, type LiveEnv } from '../../../server/liveData';

/** `GET /api/agents/report`: neuster Wochenbericht. */
export const onRequestGet = ({ env }: { env: LiveEnv }) => handleGetReport(env);

/** `POST /api/agents/report`: die Agents liefern den Bericht ab (X-Api-Key). */
export const onRequestPost = ({ request, env }: { request: Request; env: LiveEnv }) =>
  handlePostReport(request, env);
