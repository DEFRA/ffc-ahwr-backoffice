module.exports = (organisation) => {
  return [
    { key: { text: 'Business name:' }, value: { text: organisation?.name } },
    { key: { text: 'SBI number:' }, value: { text: organisation?.sbi } },
    { key: { text: 'Address:' }, value: { text: organisation?.address } },
    { key: { text: 'User Email address:' }, value: { text: organisation?.email } },
    { key: { text: 'Org Email address:' }, value: { text: organisation?.orgEmail } }
  ]
}
