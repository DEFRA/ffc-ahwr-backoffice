import { initAll } from 'govuk-frontend'
import './css/application.scss'
import './js/cookies'
import $ from 'jquery'
import moj from '@ministryofjustice/frontend'
initAll()
window.$ = $
moj.initAll()
