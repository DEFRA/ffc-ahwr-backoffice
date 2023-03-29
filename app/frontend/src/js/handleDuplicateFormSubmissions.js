window.onload = function () {
  const submitForm = document.querySelector('#submitForm')
  preventDuplicateFormSubmission(submitForm)
}

function preventDuplicateFormSubmission (form) {
  if (form) {
    form.addEventListener('submit', function (e) {
      if (form.dataset.formSubmitted) {
        e.preventDefault()
      } else {
        form.dataset.formSubmitted = true
      }
    })
  }
}
