import { z } from "zod";

export const configSchema = z.object({
  deviceTemplate: z.enum(['cipherlab95', 'newlandN7', 'plus995']),
  
  // Network & Host
  profileName: z.string().min(1, "Required").max(30).regex(/^[A-Za-z0-9_]+$/, "Alphanumeric and underscores only"),
  hostname: z.string().min(1, 'Required'),
  ibm5250Model: z.coerce.number().int().min(2).max(7),
  licenseKey: z.string().min(1, "Required"),
  e2kServer: z.string().min(1, "Required"),
  
  // Behavior
  autoConnect: z.boolean(),
  noAutoLock: z.boolean(),
  showKeyboard: z.coerce.number(),
  orientation: z.coerce.number(),
  cfgPassword: z.string().optional(),
  
  // Appearance
  fontSize: z.coerce.number().int().min(8).max(48),
  colorMagenta: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Must be a valid hex color code"),
  colorCyan: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Must be a valid hex color code"),
  colorBlue: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Must be a valid hex color code"),
  colorYellow: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Must be a valid hex color code"),
  colorWhite: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Must be a valid hex color code"),
  colorGreen: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Must be a valid hex color code"),
  colorRed: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Must be a valid hex color code"),
  scrColor: z.coerce.number(),
  stsColor: z.coerce.number(),
  
  // Hardware & Macros
  barcodeEnable: z.coerce.number(),
  barcodeDoAfter: z.coerce.number(),
  barcodeShow: z.boolean(),
  barcodeUseKeymap: z.boolean(),
  anyCmdResets: z.boolean().default(true),
  dpadLeftMacro: z.string().regex(/^([ -~]|\^\$[a-fA-F0-9]{2})*$/, "Only standard text and ^$Hex (e.g., ^$1b) format allowed.").optional(),
  dpadRightMacro: z.string().regex(/^([ -~]|\^\$[a-fA-F0-9]{2})*$/, "Only standard text and ^$Hex (e.g., ^$1b) format allowed.").optional(),

  // Security & Authentication
  userId: z.string().optional(),
  useSystemUser: z.boolean().default(false),
  askUserId: z.boolean().default(false),
  
  password: z.string().optional(),
  askPassword: z.boolean().default(true),
  
  enableAutoLogin: z.boolean().default(false),
  scriptName: z.string().optional(),
  scriptContent: z.string().optional(),
});

export type ConfigFormValues = z.infer<typeof configSchema>;
