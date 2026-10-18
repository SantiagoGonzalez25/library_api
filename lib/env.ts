import { z } from "zod";
import { ApiError } from "./errors";

const envSchema = z.object({
  FIREBASE_PROJECT_ID: z.string().min(1),
  FIREBASE_CLIENT_EMAIL: z.string().min(1),
  FIREBASE_PRIVATE_KEY: z.string().min(1),
  /** "Web API Key" de la configuración del proyecto Firebase (para Auth REST). */
  FIREBASE_WEB_API_KEY: z.string().min(1),
});

export type Env = z.infer<typeof envSchema>;

let cached: Env | null = null;

/**
 * Quita comillas envolventes y espacios sobrantes de un valor de entorno.
 * En plataformas como Vercel es muy común pegar el valor copiando la línea completa
 * del .env (con las comillas dobles incluidas), lo que rompe la clave privada con
 * "Failed to parse private key: DECODER routines::unsupported".
 */
function unquote(value: string): string {
  const trimmed = value.trim();
  const isQuoted =
    trimmed.length >= 2 &&
    ((trimmed.startsWith('"') && trimmed.endsWith('"')) ||
      (trimmed.startsWith("'") && trimmed.endsWith("'")));
  return isQuoted ? trimmed.slice(1, -1) : trimmed;
}

/** Se valida de forma perezosa para que `next build` no exija secretos. */
export function getEnv(): Env {
  if (cached) return cached;
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const missing = parsed.error.issues.map((i) => i.path.join("."));
    throw new ApiError(
      500,
      "CONFIG_ERROR",
      `Faltan variables de entorno: ${missing.join(", ")}. Revisa .env`,
    );
  }
  cached = {
    FIREBASE_PROJECT_ID: unquote(parsed.data.FIREBASE_PROJECT_ID),
    FIREBASE_CLIENT_EMAIL: unquote(parsed.data.FIREBASE_CLIENT_EMAIL),
    FIREBASE_WEB_API_KEY: unquote(parsed.data.FIREBASE_WEB_API_KEY),
    // En .env los saltos de línea de la llave privada llegan escapados como \n
    FIREBASE_PRIVATE_KEY: unquote(parsed.data.FIREBASE_PRIVATE_KEY).replace(/\\n/g, "\n"),
  };
  return cached;
}
