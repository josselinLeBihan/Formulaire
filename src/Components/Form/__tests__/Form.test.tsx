/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Form from "../Form";
import { generateSchema } from "../GenerateSchema";
import type { form } from "../../../Types/type";

// Mock des dépendances
vi.mock("../GenerateSchema", () => ({
  generateSchema: vi.fn(),
}));

vi.mock("../Input/InputText", () => ({
  default: ({
    label,
    errorMessage,
    placeholder,
    typeInput,
    optionnal,
  }: any) => (
    <div data-testid={`input-${label}`}>
      <label>{label}</label>
      <input
        type={typeInput}
        placeholder={placeholder}
        required={!optionnal}
        data-testid={`input-field-${label}`}
      />
      {errorMessage && (
        <span data-testid={`error-${label}`}>{errorMessage}</span>
      )}
    </div>
  ),
}));

// Mock de react-hook-form
const mockRegister = vi.fn();
const mockHandleSubmit = vi.fn();
const mockSetValue = vi.fn();
const mockWatch = vi.fn();
const mockUseForm = vi.fn(() => ({
  register: mockRegister,
  handleSubmit: mockHandleSubmit,
  setValue: mockSetValue,
  watch: mockWatch,
  formState: { error: {} },
}));

vi.mock("react-hook-form", () => ({
  useForm: vi.fn(() => ({
    register: mockRegister,
    handleSubmit: mockHandleSubmit,
    setValue: mockSetValue,
    watch: mockWatch,
    formState: { error: {} },
  })),
}));

// Mock de zod et zodResolver
const mockZodResolver = vi.fn();
vi.mock("@hookform/resolvers/zod", () => ({
  zodResolver: vi.fn(),
}));

// Get the mocked generateSchema function
const mockedGenerateSchema = vi.mocked(generateSchema);

describe("Form Component", () => {
  const mockOnSubmit = vi.fn();
  const mockSchema = { parse: vi.fn() };

  const defaultProps: form = {
    title: "Test Form",
    onSubmit: mockOnSubmit,
    description: "Test description",
    inputs: [
      {
        type: "inputText",
        typeInput: "text",
        label: "username",
        errorMessage: "",
        placeholder: "Enter username",
        optionnal: false,
      },
      {
        type: "inputText",
        typeInput: "email",
        label: "email",
        errorMessage: "",
        placeholder: "Enter email",
        optionnal: true,
      },
    ],
    submitButton: {
      label: "Submit Form",
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Configure generateSchema mock
    mockedGenerateSchema.mockReturnValue(mockSchema);

    // Configure zodResolver mock
    const { zodResolver } = require("@hookform/resolvers/zod");
    (zodResolver as any).mockReturnValue(mockZodResolver);

    mockHandleSubmit.mockImplementation((fn) => (e: any) => {
      e.preventDefault();
      fn({ username: "testuser", email: "test@example.com" });
    });
  });

  describe("Rendu du composant", () => {
    it("devrait rendre le titre du formulaire", () => {
      render(<Form {...defaultProps} />);

      expect(screen.getByText("Test Form")).toBeInTheDocument();
    });

    it("devrait rendre la description si elle est fournie", () => {
      render(<Form {...defaultProps} />);

      expect(screen.getByText("Test description")).toBeInTheDocument();
    });

    it("ne devrait pas rendre la description si elle n'est pas fournie", () => {
      const propsWithoutDescription = { ...defaultProps };
      delete propsWithoutDescription.description;

      render(<Form {...propsWithoutDescription} />);

      expect(screen.queryByText("Test description")).not.toBeInTheDocument();
    });

    it("devrait utiliser le titre par défaut si aucun titre n'est fourni", () => {
      const propsWithoutTitle = { ...defaultProps };
      delete propsWithoutTitle.title;

      render(<Form {...propsWithoutTitle} />);

      expect(screen.getByText("Form")).toBeInTheDocument();
    });

    it("devrait utiliser le label par défaut pour le bouton submit", () => {
      const propsWithoutLabel = {
        ...defaultProps,
        submitButton: { label: "" },
      };

      render(<Form {...propsWithoutLabel} />);

      expect(screen.getByText("Submit")).toBeInTheDocument();
    });

    it("devrait rendre le label personnalisé du bouton submit", () => {
      render(<Form {...defaultProps} />);

      expect(screen.getByText("Submit Form")).toBeInTheDocument();
    });
  });

  describe("Rendu des inputs", () => {
    it("devrait rendre tous les inputs de type inputText", () => {
      render(<Form {...defaultProps} />);

      expect(screen.getByTestId("input-username")).toBeInTheDocument();
      expect(screen.getByTestId("input-email")).toBeInTheDocument();
    });

    it("devrait passer les bonnes props aux composants InputText", () => {
      render(<Form {...defaultProps} />);

      const usernameInput = screen.getByTestId("input-field-username");
      const emailInput = screen.getByTestId("input-field-email");

      expect(usernameInput).toHaveAttribute("type", "text");
      expect(usernameInput).toHaveAttribute("placeholder", "Enter username");
      expect(usernameInput).toHaveAttribute("required");

      expect(emailInput).toHaveAttribute("type", "email");
      expect(emailInput).toHaveAttribute("placeholder", "Enter email");
      expect(emailInput).not.toHaveAttribute("required");
    });

    it("ne devrait pas rendre les inputs qui ne sont pas de type inputText", () => {
      // Add an input with an unsupported type, but cast it as 'input' to satisfy TypeScript
      const propsWithDifferentInputType = {
        ...defaultProps,
        inputs: [
          ...defaultProps.inputs,
          {
            type: "checkbox",
            label: "agree",
            errorMessage: "",
            optionnal: false,
          } as any,
        ],
      };

      render(<Form {...propsWithDifferentInputType} />);

      expect(screen.queryByTestId("input-agree")).not.toBeInTheDocument();
    });
  });

  describe("Génération du schéma", () => {
    it("devrait appeler generateSchema avec les inputs", () => {
      render(<Form {...defaultProps} />);

      expect(mockedGenerateSchema).toHaveBeenCalledWith(defaultProps.inputs);
    });

    it("devrait utiliser le schéma généré avec zodResolver", () => {
      render(<Form {...defaultProps} />);

      expect(mockZodResolver).toHaveBeenCalledWith(mockSchema);
    });
  });

  describe("Gestion des erreurs", () => {
    it("devrait afficher les messages d'erreur", () => {
      mockUseForm.mockReturnValue({
        register: mockRegister,
        handleSubmit: mockHandleSubmit,
        setValue: mockSetValue,
        watch: mockWatch,
        formState: {
          error: {
            username: { message: "Username is required" },
            email: { message: "Invalid email format" },
          },
        },
      });

      render(<Form {...defaultProps} />);

      expect(screen.getByTestId("error-username")).toHaveTextContent(
        "Username is required"
      );
      expect(screen.getByTestId("error-email")).toHaveTextContent(
        "Invalid email format"
      );
    });

    it("ne devrait pas afficher d'erreur si aucune erreur n'existe", () => {
      render(<Form {...defaultProps} />);

      expect(screen.queryByTestId("error-username")).not.toBeInTheDocument();
      expect(screen.queryByTestId("error-email")).not.toBeInTheDocument();
    });
  });

  describe("Soumission du formulaire", () => {
    it("devrait appeler onSubmit avec les données du formulaire", async () => {
      render(<Form {...defaultProps} />);

      const submitButton = screen.getByText("Submit Form");
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled();
      });

      const formDataArg = mockOnSubmit.mock.calls[0][0];
      expect(formDataArg).toBeInstanceOf(FormData);

      // Vérifier que les données sont correctement sérialisées
      const formDataString = formDataArg.get("formData");
      const parsedData = JSON.parse(formDataString);
      expect(parsedData).toEqual({
        username: "testuser",
        email: "test@example.com",
      });
    });

    it("devrait créer un FormData avec les données sérialisées en JSON", async () => {
      render(<Form {...defaultProps} />);

      const submitButton = screen.getByText("Submit Form");
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled();
      });

      const formDataArg = mockOnSubmit.mock.calls[0][0];
      expect(formDataArg.get("formData")).toBe(
        JSON.stringify({ username: "testuser", email: "test@example.com" })
      );
    });
  });

  describe("Cas limites", () => {
    it("devrait gérer un tableau d'inputs vide", () => {
      const propsWithEmptyInputs = {
        ...defaultProps,
        inputs: [],
      };

      render(<Form {...propsWithEmptyInputs} />);

      expect(screen.getByText("Test Form")).toBeInTheDocument();
      expect(screen.getByText("Submit Form")).toBeInTheDocument();
    });

    it("devrait gérer les inputs sans typeInput (utiliser text par défaut)", () => {
      const propsWithoutTypeInput = {
        ...defaultProps,
        inputs: [
          {
            type: "inputText",
            label: "test",
            placeholder: "Test placeholder",
            optionnal: false,
            errorMessage: "",
            typeInput: undefined,
          } as import("../../../Types/type").inputText,
        ],
      };

      render(<Form {...propsWithoutTypeInput} />);

      const input = screen.getByTestId("input-field-test");
      expect(input).toHaveAttribute("type", "text");
    });
  });
});
