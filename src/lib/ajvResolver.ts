import Ajv from "ajv";
import addFormats from "ajv-formats";
import { zodToJsonSchema } from "zod-to-json-schema";
import { configSchema } from "./schema";
import { FieldValues, Resolver } from "react-hook-form";

/**
 * JIT Schema Validation Provider.
 * 
 * Implementazione: Utilizza Ajv per la compilazione JIT (Just In Time) dello schema Zod.
 * Rationale: Ajv garantisce performance superiori rispetto alla validazione Zod standard,
 * riducendo il carico sulla CPU durante la validazione di form complessi in tempo reale.
 */

const ajv = new Ajv({ 
  allErrors: true, 
  useDefaults: true,
  coerceTypes: true // Importante per gestire stringhe da input che dovrebbero essere numeri
});
addFormats(ajv);

// Compilazione del JSON Schema (eseguita una sola volta al caricamento del modulo).
const jsonSchema = zodToJsonSchema(configSchema);
const validate = ajv.compile(jsonSchema as any);

/**
 * Custom Resolver per react-hook-form che usa Ajv invece di Zod direttamente.
 */
export const ajvResolver: Resolver<FieldValues> = async (values) => {
  const isValid = validate(values);
  
  if (isValid) {
    return { values, errors: {} };
  }

  const errors: Record<string, any> = {};
  
  validate.errors?.forEach((err: any) => {
    // Mappiamo gli errori di Ajv nel formato atteso da react-hook-form
    const path = (err.instancePath?.substring(1).replace(/\//g, ".") || err.params?.missingProperty) as string;
    if (path) {
      errors[path] = {
        type: err.keyword,
        message: err.message || "Valore non valido"
      };
    }
  });

  return { values, errors } as any;
};
