import { useField } from "formik";
import { InputHTMLAttributes } from "react";

type InputFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  name: string;
  label: string;
  placeholder: string;
};

const InputField = ({ label, ...props }: InputFieldProps) => {
  const [field, { error }] = useField(props);
  const { placeholder } = props;
  return (
    <>
      <label htmlFor={field.name} className="block mb-3">
        {label}
      </label>
      <input
        className="mb-3 border border-gray-500 px-3 py-2 rounded-md"
        {...field}
        id={field.name}
        placeholder={placeholder}
      />
      {error && <div>{error}</div>}
    </>
  );
};

export default InputField;
