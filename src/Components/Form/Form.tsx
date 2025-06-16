import React, { useEffect, useState } from "react"
import type { form } from "../../Types/type"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import InputText from "../Input/InputText"
import InputTextArea from "../Input/InputTextArea"
import InputSelect from "../Input/InputSelect"
import { generateFormSchema, type GeneratedSchema } from "./GenerateSchema"
import InputPassword from "../Input/InputPassword"

const Form: React.FC<form> = ({
  title = "Form",
  onSubmit,
  description,
  inputs,
  submitButton: { label = "Submit" },
}) => {
  const schema: GeneratedSchema = generateFormSchema(inputs)

  const [isSuccessfullySubmitted, setIsSuccessfullySubmitted] =
    useState<boolean>(false)

  const {
    setValue,
    register,
    handleSubmit,
    formState: { errors, isValid, isDirty, isSubmitting, touchedFields },
  } = useForm({ resolver: zodResolver(schema), mode: "onChange" })

  const handleFormSubmit = async (data: Record<string, unknown>) => {
    const formData = new FormData()
    formData.append("formData", JSON.stringify(data))
    console.log("Form submitted with data:", data)
    const result: boolean = onSubmit(formData)
    if (result) {
      setIsSuccessfullySubmitted(result)
    }
  }

  useEffect(() => {
    inputs.forEach((input) => {
      if (input.setValue) {
        setValue(input.name, input.setValue)
      }
    })
  }, [inputs, setValue])

  const createInput = (input: form["inputs"][number], index: number) => {
    switch (input.type) {
      case "inputText": {
        const elements = [
          <InputText
            key={index}
            name={input.name}
            type={input.type}
            typeInput={input.typeInput || "text"}
            label={input.label}
            error={errors[input.name]}
            success={touchedFields[input.name] && !errors[input.name]}
            successMessage={input?.successMessage}
            optionnal={input.optionnal || false}
            placeholder={input.placeholder}
            register={register}
            disable={input.disable || false}
          />,
        ]
        if (input.confirm) {
          elements.push(
            <InputText
              key={`${index}Confirm`}
              name={`${input.name}Confirm`}
              type={input.type}
              label={"Confirmer " + input.label}
              error={errors[`${input.name}Confirm`]}
              success={touchedFields[input.name] && !errors[input.name]}
              successMessage={input?.successMessage}
              optionnal={input.optionnal || false}
              placeholder={input.placeholder}
              register={register}
              disable={input.disable || false}
            />
          )
        }
        return elements
      }
      case "inputTextarea": {
        const elements = [
          <InputTextArea
            key={index}
            name={input.name}
            type={input.type}
            label={input.label}
            error={errors[input.name]}
            success={touchedFields[input.name] && !errors[input.name]}
            successMessage={input?.successMessage}
            optionnal={input.optionnal || false}
            placeholder={input.placeholder}
            register={register}
            disable={input.disable || false}
          />,
        ]
        if (input.confirm) {
          elements.push(
            <InputTextArea
              key={`${index}Confirm`}
              name={`${input.name}Confirm`}
              type={input.type}
              label={"Confirmer " + input.label}
              error={errors[`${input.name}Confirm`]}
              success={touchedFields[input.name] && !errors[input.name]}
              successMessage={input?.successMessage}
              optionnal={input.optionnal || false}
              placeholder={input.placeholder}
              register={register}
              disable={input.disable || false}
            />
          )
        }
        return elements
      }
      case "inputSelect": {
        const elements = [
          <InputSelect
            key={index}
            name={input.name}
            type={input.type}
            label={input.label}
            options={input.options}
            error={errors[input.name]}
            success={touchedFields[input.name] && !errors[input.name]}
            successMessage={input?.successMessage}
            optionnal={input.optionnal || false}
            placeholder={input.placeholder}
            register={register}
            disable={input.disable || false}
          />,
        ]
        if (input.confirm) {
          elements.push(
            <InputSelect
              key={`${index}Confirm`}
              name={`${input.name}Confirm`}
              type={input.type}
              label={"Confirmer " + input.label}
              options={input.options}
              error={errors[`${input.name}Confirm`]}
              success={touchedFields[input.name] && !errors[input.name]}
              successMessage={input?.successMessage}
              optionnal={input.optionnal || false}
              placeholder={input.placeholder}
              register={register}
              disable={input.disable || false}
            />
          )
        }
        return elements
      }
      case "inputPassword": {
        const elements = [
          <InputPassword
            key={index}
            name={input.name}
            type={input.type}
            label={input.label}
            error={errors[input.name]}
            success={touchedFields[input.name] && !errors[input.name]}
            successMessage={input?.successMessage}
            optionnal={input.optionnal || false}
            placeholder={input.placeholder}
            register={register}
            disable={input.disable || false}
            setValue={false}
          />,
        ]
        if (input.confirm) {
          elements.push(
            <InputPassword
              key={`${index}Confirm`}
              name={`${input.name}Confirm`}
              type={input.type}
              label={"Confirmer " + input.label}
              error={errors[`${input.name}Confirm`]}
              success={touchedFields[input.name] && !errors[input.name]}
              successMessage={input?.successMessage}
              optionnal={input.optionnal || false}
              placeholder={input.placeholder}
              register={register}
              disable={input.disable || false}
              setValue={false}
            />
          )
        }
        return elements
      }
      // Ajouter plus de type d'input si nécessaire

      default:
        return null
    }
  }

  return (
    <div className="flex flex-col items-center justify-center p-4 ">
      <form
        onSubmit={handleSubmit(handleFormSubmit)}
        className="flex flex-col gap-4"
      >
        <h1 className="text-2xl">{title}</h1>
        {description && <p>{description}</p>}
        {isSubmitting && (
          <div className="text-custom-good">Envoie du formulaire...</div>
        )}
        {isSuccessfullySubmitted && (
          <div className="text-custom-good">Envoie du formulaire réussi</div>
        )}

        {inputs.map((input, index) => {
          return createInput(input, index)
        })}
        <button
          className="btn-base"
          type="submit"
          disabled={!isDirty || !isValid || isSubmitting}
          aria-label={label}
        >
          {label}
        </button>
      </form>
    </div>
  )
}

export default Form
