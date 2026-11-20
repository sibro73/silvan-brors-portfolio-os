import { handleStatus, type LiveEnv } from '../../server/liveData';

/** `GET /api/status`: Live-Zahlen aus D1. */
export const onRequestGet = ({ env }: { env: LiveEnv }) => handleStatus(env);
