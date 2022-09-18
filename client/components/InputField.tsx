import { useField } from "formik";
import { InputHTMLAttributes } from "react";

type InputFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  name: string;
  label: string;
  placeholder: string;
};

const InputField = ({ label, ...props }: InputFieldProps) => {
  const [field, { error }] = useField(props);
  return (
    <>
      <label htmlFor={field.name} className="mb-3 block">
        {label}
      </label>
      <input
        className="mb-3 rounded-md border border-gray-500 px-3 py-2"
        {...field}
        {...props}
        id={field.name}
      />
      {error && <div>{error}</div>}
    </>
  );
};

export default InputField;
