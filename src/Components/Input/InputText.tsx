import React from "react";
import type { inputText } from "../../Types/type";

interface inputTextComposant extends inputText {
  error: any; // Erreur de validation du champ
  success?: boolean; //Indique si le champ a été validée avec succès
  register: any; //Fonction de registre pour React Hook Form
}

const InputText: React.FC<inputTextComposant> = ({
  name,
  label,
  error,
  success,
  placeholder,
  disable = false,
  optionnal,
  successMessage,
  register,
  type = "text",
}) => {
  return (
    <div className='input-base'>
      <label className='' htmlFor={name}>
        {label}
        {optionnal && (
          <span className='text-gray-400 font-normal'> (Optionnel)</span>
        )}
        <input
          type={type}
          disabled={disable}
          placeholder={placeholder}
          {...register(name)}
          required={!optionnal}
          className={
            error
              ? "border-custom-error"
              : success
              ? "border-custom-good"
              : "border-transparent"
          }
        />
      </label>
      {error && (
        <p
          aria-description='Erreur: '
          className='text-custom-error text-sm mb-1'
        >
          {error.message}
        </p>
      )}
      {success && successMessage && (
        <p className='text-custom-good text-sm mt-1'>{successMessage}</p>
      )}
    </div>
  );
};

export default InputText;
