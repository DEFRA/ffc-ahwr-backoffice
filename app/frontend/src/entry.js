import { initAll } from 'govuk-frontend'
import './css/application.scss'
import './js/cookies'
import $ from 'jquery'
import moj from '@ministryofjustice/frontend'
initAll()
window.$ = $
moj.initAll()
/* eslint-disable no-new */
new moj.FilterToggleButton({ // NOSONAR
  bigModeMediaQuery: '(min-width: 48.063em)',
  startHidden: true,
  toggleButton: {
    container: $('.moj-action-bar__filter'),
    showText: 'Show filter',
    hideText: 'Hide filter',
    classes: 'govuk-button--secondary'
  },
  closeButton: {
    container: $('.moj-filter__header-action'),
    text: 'Close'
  },
  filter: {
    container: $('.moj-filter')
  }
})
function submitSort (dataUrl, sort) {
  const xhr = new XMLHttpRequest() // eslint-disable-line
  xhr.open('GET', `${dataUrl}/${sort}`, true)
  xhr.setRequestHeader('Content-Type', 'application/json')
  xhr.send()
}
document.querySelectorAll('th.govuk-table__header > button')
  .forEach((button) =>
    button.addEventListener('click', function () {
      submitSort(this.parentElement.getAttribute('data-url'), this.parentElement.getAttribute('aria-sort'))
      window.location.reload()
    })
  )
