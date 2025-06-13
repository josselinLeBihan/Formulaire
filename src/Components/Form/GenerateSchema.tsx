/* eslint-disable @typescript-eslint/no-explicit-any */
import { z } from "zod";
import type { form, validation, input, inputPassword } from "../../Types/type";

type SchemaFields = Record<string, z.ZodType<any>>;
type ValidationData = Record<string, any>;

/**
 * Génère un schéma Zod dynamique basé sur la configuration des inputs du formulaire
 * @param formInputs - Configuration des champs du formulaire
 * @returns Schéma Zod généré
 */
const generateFormSchema = (formInputs: form["inputs"]) => {
  if (formInputs.length !== new Set(formInputs).size) {
    console.warn("Le formulaire en paramètre contient des champs en double.");
  }

  const schemaFields: SchemaFields = {};

  if (formInputs)
    formInputs.forEach((inputConfig) => {
      let fieldSchema = createBaseFieldSchema(inputConfig);

      // Application des validations personnalisées
      if (inputConfig.validations?.length) {
        fieldSchema = applyCustomValidations(
          fieldSchema,
          inputConfig.validations
        );
      }

      // Gestion des champs optionnels
      if (inputConfig.optionnal) {
        fieldSchema = fieldSchema.optional();
      }

      schemaFields[inputConfig.name] = fieldSchema;
    });

  const finalShemaField = applyPasswordConfirmationValidation(
    formInputs,
    schemaFields
  );

  //Verifie si le schéma contient deux champs de mot de passe

  const fieldNames = Object.keys(schemaFields);
  if (fieldNames.length !== new Set(fieldNames).size) {
    console.warn("Le schéma généré contient des champs en double.");
  }

  return finalShemaField;
};

/**
 * Crée le schéma de base selon le type d'input
 */
const createBaseFieldSchema = (inputConfig: input): z.ZodType<any> => {
  switch (inputConfig.type) {
    case "inputText":
      return createTextFieldSchema(inputConfig);
    case "inputSelect":
      return createSelectFieldSchema(inputConfig);
    case "inputTextarea":
      return createTextareaFieldSchema(inputConfig);
    case "inputPassword":
      return createPasswordFieldSchema(inputConfig);
    default:
      console.warn(`Type d'input non supporté: ${(inputConfig as any).type}`);
      return z.string();
  }
};

/**
 * Crée un schéma pour les champs de texte avec validation selon le type
 */
const createTextFieldSchema = (
  inputConfig: Extract<input, { type: "inputText" }>
): z.ZodString => {
  switch (inputConfig.typeInput) {
    case "email":
      return z.string().email({ message: "Format d'email invalide" });
    case "phone":
      return z.string().regex(PHONE_REGEX, {
        message: "Format de téléphone invalide",
      });
    case "text":
    default:
      return z.string();
  }
};

/**
 * Crée un schéma pour les champs de mot de passe
 */
const createPasswordFieldSchema = (
  inputConfig: Extract<input, { type: "inputPassword" }>
): z.ZodString => {
  return z.string().min(1, { message: "Le mot de passe est requis" });
};

/**
 * Crée un schéma pour les champs de sélection
 */
const createSelectFieldSchema = (
  inputConfig: Extract<input, { type: "inputSelect" }>
): z.ZodEnum<[string, ...string[]]> | z.ZodLiteral<string> => {
  if (!inputConfig.options?.length) {
    throw new ValidationError(
      `Le champ de sélection '${inputConfig.name}' doit avoir au moins une option`
    );
  }

  const optionValues = inputConfig.options.map((option) => option.value);
  const errorMessage = "Veuillez sélectionner une option valide";

  if (optionValues.length === 1) {
    return z.literal(optionValues[0], {
      errorMap: () => ({ message: errorMessage }),
    });
  }

  return z.enum(optionValues as [string, ...string[]], {
    errorMap: () => ({ message: errorMessage }),
  });
};

/**
 * Crée un schéma pour les champs textarea
 */
const createTextareaFieldSchema = (
  inputConfig: Extract<input, { type: "inputTextarea" }>
): z.ZodString => {
  return z.string();
};

/**
 * Applique les validations personnalisées à un schéma
 */
const applyCustomValidations = (
  baseSchema: z.ZodType<any>,
  validations: validation[]
): z.ZodType<any> => {
  return validations.reduce((currentSchema, validationRule) => {
    return applySingleValidation(currentSchema, validationRule);
  }, baseSchema);
};

/**
 * Applique une validation unique à un schéma
 */
const applySingleValidation = (
  schema: z.ZodType<any>,
  validationRule: validation
): z.ZodType<any> => {
  const stringSchema = extractStringSchema(schema);

  if (!stringSchema) {
    console.warn(
      `La validation '${validationRule.type}' ne peut être appliquée qu'aux champs de type string`
    );
    return schema;
  }

  return applyValidationByType(stringSchema, validationRule);
};

/**
 * Extrait le schéma string d'un schéma potentiellement optionnel
 */
const extractStringSchema = (schema: z.ZodType<any>): z.ZodString | null => {
  if (schema instanceof z.ZodString) {
    return schema;
  }

  if (
    schema instanceof z.ZodOptional &&
    schema._def.innerType instanceof z.ZodString
  ) {
    return schema._def.innerType;
  }

  return null;
};

/**
 * Applique la validation selon son type
 */
const applyValidationByType = (
  stringSchema: z.ZodString,
  validationRule: validation
): z.ZodString => {
  const {
    type: validationType,
    value: validationValue,
    message,
  } = validationRule;

  switch (validationType) {
    case "min":
      validateValueType(validationValue, "number", validationType);
      return stringSchema.min(validationValue as number, { message });

    case "max":
      validateValueType(validationValue, "number", validationType);
      return stringSchema.max(validationValue as number, { message });

    case "length":
      validateValueType(validationValue, "number", validationType);
      return stringSchema.length(validationValue as number, { message });

    case "regex":
      if (!(validationValue instanceof RegExp)) {
        throw new ValidationError(
          `Valeur invalide pour la validation '${validationType}': RegExp attendu`
        );
      }
      return stringSchema.regex(validationValue, { message });

    case "startWith":
      validateValueType(validationValue, "string", validationType);
      return stringSchema.startsWith(validationValue as string, { message });

    case "endWith":
      validateValueType(validationValue, "string", validationType);
      return stringSchema.endsWith(validationValue as string, { message });

    case "includes":
      validateValueType(validationValue, "string", validationType);
      return stringSchema.includes(validationValue as string, { message });

    case "uppercase":
      return stringSchema
        .transform((val) => val.toUpperCase())
        .pipe(z.string().regex(UPPERCASE_REGEX, { message }));

    case "lowercase":
      return stringSchema
        .transform((val) => val.toLowerCase())
        .pipe(z.string().regex(LOWERCASE_REGEX, { message }));

    default:
      throw new ValidationError(
        `Type de validation non supporté: ${validationType}`
      );
  }
};

/**
 * Applique la validation de confirmation de mot de passe si nécessaire
 */
const applyPasswordConfirmationValidation = (
  formInputs: input[],
  schemaFields: SchemaFields
): z.ZodType<any> => {
  const passwordFieldWithConfirmation =
    findPasswordFieldWithConfirmation(formInputs);

  if (!passwordFieldWithConfirmation) {
    return z.object(schemaFields);
  }

  const confirmationFieldName = `${passwordFieldWithConfirmation.name}Confirm`;

  // Ajout du champ de confirmation
  schemaFields[confirmationFieldName] = z.string({
    required_error: "La confirmation du mot de passe est requise",
  });

  return z.object(schemaFields).superRefine((formData, validationContext) => {
    const password = formData[passwordFieldWithConfirmation.name];
    const passwordConfirmation = formData[confirmationFieldName];

    if (password !== passwordConfirmation) {
      validationContext.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Les mots de passe ne correspondent pas",
        path: [confirmationFieldName],
      });
    }
  });
};

/**
 * Trouve le champ de mot de passe avec confirmation
 */
const findPasswordFieldWithConfirmation = (
  formInputs: input[]
): inputPassword | undefined => {
  return formInputs.find(
    (inputConfig): inputConfig is inputPassword =>
      inputConfig.type === "inputPassword" &&
      (inputConfig as inputPassword).confirmPassword === true
  );
};

/**
 * Valide le formulaire avec les données fournies
 * @param formInputs - Configuration des champs
 * @param formData - Données à valider
 * @returns Résultat de la validation
 */
const validateFormData = (
  formInputs: form["inputs"],
  formData: ValidationData
): FormValidationResult => {
  const schema = generateFormSchema(formInputs);

  try {
    const validatedData = schema.parse(formData);
    return createSuccessResult(validatedData);
  } catch (error) {
    return handleValidationError(error);
  }
};

/**
 * Crée un résultat de validation réussi
 */
const createSuccessResult = (validatedData: any): FormValidationResult => ({
  success: true,
  data: validatedData,
  errors: null,
});

/**
 * Gère les erreurs de validation
 */
const handleValidationError = (error: unknown): FormValidationResult => {
  if (error instanceof z.ZodError) {
    const formattedErrors = formatZodErrors(error);
    return {
      success: false,
      data: null,
      errors: formattedErrors,
    };
  }

  console.error("Erreur de validation inattendue:", error);
  return {
    success: false,
    data: null,
    errors: { general: "Erreur de validation inattendue" },
  };
};

/**
 * Formate les erreurs Zod en un objet plus lisible
 */
const formatZodErrors = (zodError: z.ZodError): Record<string, string> => {
  return zodError.errors.reduce((errorMap, currentError) => {
    const fieldName = currentError.path[0] as string;
    errorMap[fieldName] = currentError.message;
    return errorMap;
  }, {} as Record<string, string>);
};

// Utilitaires
/**
 * Valide le type d'une valeur
 */
const validateValueType = (
  value: any,
  expectedType: string,
  validationType: string
): void => {
  if (typeof value !== expectedType) {
    throw new ValidationError(
      `Valeur invalide pour la validation '${validationType}': ${expectedType} attendu, ${typeof value} reçu`
    );
  }
};

/**
 * Classe d'erreur personnalisée pour les validations
 */
class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

// Constantes
const PHONE_REGEX = /^[+]?[\d\s\-\(\)]+$/;
const UPPERCASE_REGEX = /^[A-Z\s]*$/;
const LOWERCASE_REGEX = /^[a-z\s]*$/;

// Types
export type GeneratedSchema = ReturnType<typeof generateFormSchema>;
export type ValidationResult<T extends form["inputs"]> = z.infer<
  ReturnType<typeof generateFormSchema>
>;
export interface FormValidationResult {
  success: boolean;
  data: any | null;
  errors: Record<string, string> | null;
}

// Exports principaux
export {
  generateFormSchema,
  validateFormData,
  applySingleValidation as applyValidation, // Maintien de la compatibilité
};
