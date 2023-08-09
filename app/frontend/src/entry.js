import { initAll } from 'govuk-frontend'
import './css/application.scss'
import './js/cookies'
import './js/handleDuplicateFormSubmissions'
import $ from 'jquery'
import moj from '@ministryofjustice/frontend'
initAll()
window.$ = $
moj.initAll()
/* eslint-disable no-new */
function submitSort (dataUrl, sort) { // NOSONAR
  const xhr = new XMLHttpRequest() // eslint-disable-line
  xhr.open('GET', `${dataUrl}/${sort}`, true) // NOSONAR
  xhr.setRequestHeader('Content-Type', 'application/json') // NOSONAR
  xhr.send() // NOSONAR
}
document.querySelectorAll('th.govuk-table__header > button') // NOSONAR
  .forEach((button) => // NOSONAR
    button.addEventListener('click', function () { // NOSONAR
      submitSort(this.parentElement.getAttribute('data-url'), this.parentElement.getAttribute('aria-sort')) // NOSONAR
      window.location.reload() // NOSONAR
    })
  )
