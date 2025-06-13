import Form from "./Components/Form/Form";
import type { form } from "./Types/type";

function App() {
  const formProps: form = {
    title: "Mon formulaire",
    description: "Ceci est un exemple de formulaire",
    inputs: [
      {
        type: "inputText",
        name: "mail",
        label: "Votre adresse e-mail",
        placeholder: "mail@mail.fr",
        typeInput: "email",
        validations: [
          {
            type: "min",
            value: 3,
            message: "Le nom d'utilisateur doit contenir au moins 3 caractères",
          },
          {
            type: "max",
            value: 20,
            message: "Le nom d'utilisateur ne peut pas dépasser 20 caractères",
          },
        ],
      },
      {
        type: "inputPassword",
        name: "password",
        label: "mot de passe",
        setValue: false,
        confirmPassword: true,
        validations: [
          {
            type: "min",
            value: 8,
            message: "Le mot de passe doit contenir au moins 8 caractères",
          },
          {
            type: "regex",
            value: /[A-Z]/,
            message: "Le mot de passe doit contenir au moins une majuscule",
          },
          {
            type: "regex",
            value: /[a-z]/,
            message: "Le mot de passe doit contenir au moins une minuscule",
          },
          {
            type: "regex",
            value: /\d/,
            message: "Le mot de passe doit contenir au moins un chiffre",
          },
        ],
      },
      {
        type: "inputSelect",
        name: "role",
        label: "Rôle",
        options: [
          { label: "Administrateur", value: "admin" },
          { label: "Utilisateur", value: "user" },
        ],
        optionnal: false,
      },
      {
        type: "inputTextarea",
        name: "bio",
        setValue: "Johny",
        label: "Biographie",
        placeholder: "Parlez de vous...",
        rows: 4,
        optionnal: true,
      },
    ],
    onSubmit: (data) => {
      console.log("Form submitted:", data);
      return true; //Indique que le formulaire a été soumis avec succès
    },
    submitButton: {
      label: "Envoyer",
    },
  };

  return (
    <>
      <Form {...formProps} />
    </>
  );
}

export default App;
