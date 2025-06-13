import React from "react";
import type { inputTextarea } from "../../Types/type";

interface inputTextareaComposant extends inputTextarea {
  error: any; // Erreur de validation du champ
  success?: boolean; //Indique si le champ a été validée avec succès
  register: any; //Fonction de registre pour React Hook Form
}

const InputTextArea: React.FC<inputTextareaComposant> = ({
  name,
  label,
  error,
  success,
  placeholder,
  disable = false,
  optionnal,
  successMessage,
  rows = 4,
  cols = 50,
  register,
}) => {
  return (
    <div className='input-base'>
      <label className=''>
        {`${label} ${optionnal && `(Optionnel)`}`}
        <textarea
          cols={cols}
          rows={rows}
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

export default InputTextArea;
