import { SelectField } from './SelectField'

export type RelationOption = {
  value: string
  label: string
}

type RelationSelectFieldProps = {
  label: string
  name: string
  value: string
  options: RelationOption[]
  description?: string
  onChange: (value: string) => void
}

export function RelationSelectField({
  label,
  name,
  value,
  options,
  description,
  onChange,
}: RelationSelectFieldProps) {
  return (
    <SelectField
      label={label}
      name={name}
      value={value}
      options={[
        {
          value: '',
          label: 'Select…',
        },
        ...options,
      ]}
      description={description}
      onChange={(event) => onChange(event.target.value)}
    />
  )
}
