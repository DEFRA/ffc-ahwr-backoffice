module.exports = (recommend) => {
  let response = {} // Initialize as an empty object

  if (recommend.displayRecommendToPayConfirmationForm) {
    response = {
      header: 'Recommend to pay',
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
  } else if (recommend.displayRecommendToRejectConfirmationForm) {
    response = {
      header: 'Recommend to reject',
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

  // Return the response object, which will be empty if none of the conditions are met
  return response
}
