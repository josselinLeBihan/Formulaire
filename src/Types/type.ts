/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ReactNode } from "react";

export interface form {
  title?: string;
  description?: string;
  inputs: input[];
  onSubmit: (data: FormData) => boolean;
  submitButton: {
    label: string;
    icon?: ReactNode;
    disable?: boolean;
  };
}

export type input = inputText | inputSelect | inputTextarea | inputPassword;

interface inputBase {
  name: string; //Nom du champ
  label: string; //Nom du champ afficher dans le formulaire
  placeholder?: string | number; //Placeholder du champ
  disable?: boolean; //Champ désactivé
  optionnal?: boolean; //Champ optionnel
  successMessage?: string; //Message du succès après la validation
  validations?: validation[]; //Liste des validations à appliquer
}

export interface validation {
  type:
    | "min"
    | "max"
    | "length"
    | "regex"
    | "startWith"
    | "endWith"
    | "includes"
    | "uppercase"
    | "lowercase";
  value: string | number | boolean | RegExp;
  message: string;
}

export interface inputText extends inputBase {
  type: "inputText";
  typeInput?: "text" | "email" | "phone";
  setValue?: string | number; // Valeur par défaut du champ
}

export interface inputSelect extends inputBase {
  type: "inputSelect";
  options: {
    label: string;
    value: string;
  }[];
  setValue?: string; // Valeur par défaut du champ
}

export interface inputTextarea extends inputBase {
  type: "inputTextarea";
  rows?: number;
  cols?: number;
  setValue?: string; // Valeur par défaut du champ
}

export interface inputPassword extends inputBase {
  type: "inputPassword";
  setValue: false;
  confirmPassword?: boolean; // Ajoute un champ de confirmation de mot de passe
}
