import { z } from "zod";

export interface ValidationRule {
  advice: string;
  ref: string;
  autoFix?: (val: string) => string;
}

export const validationMetadata: Record<string, ValidationRule> = {
  hostname: {
    advice: "Administrator's Note: Host addresses must be valid IPv4, IPv6, or RFC 1123 compliant domain names. Ensure the host is reachable from the device network segment.",
    ref: "Ref: Administrator's Guide Page 83"
  },
  ibm5250Model: {
    advice: "System Policy: Selecting the correct model ensures proper screen buffer allocation (Model 2: 24x80, Model 5: 27x132). Incorrect parity may lead to display truncation.",
    ref: "Ref: Administrator's Guide Page 15"
  },
  licenseKey: {
    advice: "Security Warning: License keys are non-transferable and tied to the workstation ID. Verify the checksum before deployment.",
    ref: "Ref: Administrator's Guide Page 42"
  },
  fontSize: {
    advice: "UI Optimization: Font sizes below 12px or above 36px may yield sub-optimal readability on standard ruggedized mobile displays.",
    ref: "Ref: Administrator's Guide Page 91"
  },
  scrColor: {
    advice: "Ergonomics: Use Index 0 (Black) for power savings on OLED displays or Index 7 (White) for high-contrast environments.",
    ref: "Ref: Administrator's Guide Page 104"
  },
  stsColor: {
    advice: "Status Visibility: The status line color should provide sufficient contrast against the background to ensure MW (Message Wait) indicators are visible.",
    ref: "Ref: Administrator's Guide Page 105"
  },
  profileName: {
    advice: "Organizational Standard: Profile names must be alphanumeric. Use naming conventions that allow for easy MDM distribution auditing.",
    ref: "Ref: Administrator's Guide Page 22"
  },
  dpadLeftMacro: {
    advice: "Synthesis Rule: Macros must use caret notation (e.g., ^M for Enter) for control characters. Literal 'ESC' strings will be rejected by the interpreter.",
    ref: "Ref: Administrator's Guide Page 204",
    autoFix: (val: string) => val.replace(/ESC/gi, "^[").replace(/ENTER/gi, "^M")
  },
  dpadRightMacro: {
    advice: "Synthesis Rule: Macros must use caret notation. Avoid mixing literal escape sequences with plain text without proper caret delimiters.",
    ref: "Ref: Administrator's Guide Page 204",
    autoFix: (val: string) => val.replace(/ESC/gi, "^[").replace(/ENTER/gi, "^M")
  }
};

export const configSchema = z.object({
  deviceTemplate: z.enum(['cipherlab95', 'newlandN7', 'plus995']),
  
  // Network & Host
  profileName: z.string().min(1, "Empty names are not permitted by system policy").max(30).regex(/^[A-Za-z0-9_]+$/, "Alphanumeric and underscores only as per Admin Guide Page 22"),
  hostname: z.string().min(1, 'Host identification is mandatory for session negotiation'),
  ibm5250Model: z.coerce.number().int().min(2).max(7),
  licenseKey: z.string().min(1, "License key required for enterprise activation"),
  e2kServer: z.string().min(1, "E2K Server endpoint must be specified for managed deployments"),
  
  // Behavior
  autoConnect: z.boolean(),
  noAutoLock: z.boolean(),
  showKeyboard: z.coerce.number(),
  orientation: z.coerce.number(),
  cfgPassword: z.string().optional(),
  
  // Appearance
  fontSize: z.coerce.number().int().min(8).max(48),
  colorMagenta: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color format"),
  colorCyan: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color format"),
  colorBlue: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color format"),
  colorYellow: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color format"),
  colorWhite: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color format"),
  colorGreen: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color format"),
  colorRed: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color format"),
  scrColor: z.coerce.number(),
  stsColor: z.coerce.number(),
  
  // Hardware & Macros
  barcodeEnable: z.coerce.number().min(0, "Invalid range").max(20, "Out of system bounds"),
  barcodeDoAfter: z.coerce.number().min(0).max(5),
  barcodeShow: z.boolean(),
  barcodeUseKeymap: z.boolean(),
  anyCmdResets: z.boolean().default(true),
  dpadLeftMacro: z.string().regex(/^([ -~]|\^\$[a-fA-F0-9]{2})*$/, "Macro syntax error: Use ^$Hex for control codes as per Page 204").optional(),
  dpadRightMacro: z.string().regex(/^([ -~]|\^\$[a-fA-F0-9]{2})*$/, "Macro syntax error: Use ^$Hex for control codes as per Page 204").optional(),

  // Security & Automation
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
