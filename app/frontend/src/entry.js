import { initAll } from "govuk-frontend";
import "./css/application.scss";
import "./js/cookies.js";
import "./js/handleDuplicateFormSubmissions.js";
import $ from "jquery";
import moj from "@ministryofjustice/frontend";
initAll();
window.$ = $;
moj.initAll();
function submitSort(dataUrl, sort) {
  const xhr = new XMLHttpRequest();
  xhr.open("GET", `${dataUrl}/${sort}`, true);
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.send();
}
document.querySelectorAll("th.govuk-table__header > button").forEach((button) =>
  button.addEventListener("click", function () {
    submitSort(
      this.parentElement.getAttribute("data-url"),
      this.parentElement.getAttribute("aria-sort"),
    );
    window.location.reload();
  }),
);
