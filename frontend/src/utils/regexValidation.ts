export function checkData(
  value: string,
  regex: RegExp,
  type: string,
  setValidData: (valid: boolean) => void,
  setBorderStyle: (style: React.CSSProperties) => void
): boolean {
  if (value == '') {
    setValidData(false)
    setNeutralBorderColor(type, setBorderStyle)
    return false
  }
  const isValid = regex.test(value)
  if (!isValid) {
    setValidData(false)
    setBorderStyle({ border: '2px solid rgb(226, 68, 56)' })
    return false
  } else {
    setValidData(true)
    setNeutralBorderColor(type, setBorderStyle)
    return true
  }
}

function setNeutralBorderColor(type: string, setBorderStyle: (style: React.CSSProperties) => void) {
  if (type == 'give_access' || type == 'employee') {
    setBorderStyle({ border: '1px solid #dddddd' })
  } else {
    setBorderStyle({ border: '2px solid #4A90E2' })
  }
}
