window.onload = function () {
  ["#approveClaimForm", "#rejectClaimForm", "#withdrawForm"].forEach((form) =>
    preventDuplicateFormSubmission(document.querySelector(form)),
  );
};

function preventDuplicateFormSubmission(form) {
  if (form) {
    form.addEventListener("submit", function (e) {
      if (form.dataset.formSubmitted) {
        e.preventDefault();
      } else {
        form.dataset.formSubmitted = true;
      }
    });
  }
}
