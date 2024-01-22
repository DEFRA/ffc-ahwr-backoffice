module.exports = (recommend) => {
  if (recommend.displayRecommendToPayConfirmationForm) {
    return {
      header: 'Recommended to pay',
      checkBoxes: [
        {
          value: 'checkedAgainstChecklist',
          text: 'I have checked the claim against the verification checklist and it has passed. I recommend the payment is authorised.'
        },
        {
          value: 'sentChecklist',
          text: 'I have sent the verification checklist to the authoriser explaining why it\'s passed.'
        }
      ],
      errorMessage: recommend.errorMessage,
      formAction: '/recommend-to-pay'
    }
  }
  if (recommend.displayRecommendToRejectConfirmationForm) {
    return {
      header: 'Recommended to reject',
      checkBoxes: [
        {
          value: 'checkedAgainstChecklist',
          text: 'I have checked the claim against the verification checklist and it has not passed. I recommend the claim is rejected.'
        },
        {
          value: 'sentChecklist',
          text: 'I have sent the verification checklist to the authoriser explaining why it\'s failed.'
        }
      ],
      errorMessage: recommend.errorMessage,
      formAction: '/recommend-to-reject'
    }
  }
  return false
}
