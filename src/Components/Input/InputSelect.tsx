import React from "react";
import type { inputSelect } from "../../Types/type";

interface inputSelectComposant extends inputSelect {
  error: any; // Erreur de validation du champ
  success?: boolean; //Indique si le champ a été validée avec succès
  register: any; //Fonction de registre pour React Hook Form
}

const InputSelect: React.FC<inputSelectComposant> = ({
  label,
  name,
  error,
  success,
  successMessage,
  placeholder,
  disable = false,
  optionnal,
  register,
  options,
}) => {
  return (
    <div className='input-base'>
      <label className=''>
        {`${label} ${optionnal && `(Optionnel)`}`}
        <select
          className={error ? "border-custom-error" : "border-custom-100"}
          disabled={disable}
          {...register(name)}
          required={!optionnal}
        >
          {placeholder && (
            <option value='' disabled hidden>
              {placeholder}
            </option>
          )}
          {options &&
            options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          className=
          {error
            ? "border-custom-error"
            : success
            ? "border-custom-good"
            : "border-transparent"}
        </select>
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

export default InputSelect;
