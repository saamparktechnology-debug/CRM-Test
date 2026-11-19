import * as React from "react"

export function useExpensesForm<T extends Record<string, any>>(initialValues: T) {
  const [values, setValues] = React.useState<T>(initialValues)
  const [isOpen, setIsOpen] = React.useState(false)
  return { values, setValues, isOpen, setIsOpen }
}
