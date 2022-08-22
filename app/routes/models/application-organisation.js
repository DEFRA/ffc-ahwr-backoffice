module.exports = (organisation) => {
  return [
    { key: { text: 'SBI number:' }, value: { text: organisation?.sbi } },
    { key: { text: 'Address:' }, value: { text: organisation?.address } },
    { key: { text: 'Email address:' }, value: { text: organisation?.email } }
  ]
}
