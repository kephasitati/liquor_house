/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_MEDUSA_URL?: string;
  readonly PUBLIC_MEDUSA_KEY_LIQUORHOUSE?: string;
  readonly PUBLIC_MEDUSA_REGION_ID?: string;
  readonly PUBLIC_SITE_URL?: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
