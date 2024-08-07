const CommonActions = require('./common-actions')
const AGREEMENTS_HEADER_LINK='a[href="/agreements"]'
const CLAIM_HEADER_LINK='a[href="/claims"]'
//const APPLICATION_BUTTON='//a[text()="Applications"]'
const SEARCH_BUTTON='.search-button'
const SEARCH_TEXT='#searchText'
const VIEW_CLAIMS='//a[text()="View claims"]'
const VIEW_CLAIM='//a[text()="View claim"]'
const AUTHORISE_PAYMENT='#authorise-payment-button'
const AUTHORISE_PAYMENT_CHECKBOX1='#confirm'
const AUTHORISE_PAYMENT_CHECKBOX2='#confirm-2'
const CONFIRMANDCONTINUE='.govuk-button'
const BACK_BUTTON='.govuk-back-link'
const WITHDRAW='//a[text()="Withdraw"]'
const WITHDRAW_TRUE='[value="yes"]'
const WITHDRAW_FALSE='[value="no"]'
const RECCOMEND_TO_PAY='#btn-recommend-to-pay'
const RECCOMEND_TO_REJECT='#btn-recommend-to-reject'
const CLAIM_NOT_FOUND_EXPECTED='No claims found.'
const APPLICATION_NOT_FOUND_EXPECTED='No agreements found'
const APPLICATION_NOT_FOUND_ACTUAL='.govuk-error-message'
const CONFIRM_PAYMENT='//button[text()="Confirm and continue"]'
const SBI_SORT='[data-url="/applications/sort/SBI"]'
const APPLY_DATE_SORT='[data-url="/applications/sort/Apply date"]'
const STATUS_MERGE_SORT='[data-url="/applications/sort/Status"]'
const Email_Input='#i0116'
const Email_Pwd='[name="passwd"]'
const Next='#idSIButton9'
const BACK='.govuk-back-link'
const HISTORY_TAB='#tab_history'
const AGREEMENT_VIEW_DETAILS='//a[text()="View details"]'
const PAY='#authorise-payment-button'
class BackOfficePage extends CommonActions {
    async getHomePage() {
      const sleep = (waitTimeInMs) => new Promise(resolve => setTimeout(resolve, waitTimeInMs))
        await this.open()
        await sleep(10000)
      }
    async enterCRN(value){
          await this.sendKey(SEARCH_TEXT,value)
    }
    async clickOnApplicationButton() {
        await this.clickOn(APPLICATION_BUTTON)
      } 
    async emailCredentials()  {
      const sleep = (waitTimeInMs) => new Promise(resolve => setTimeout(resolve, waitTimeInMs))
      await sleep(10000)
      await this.sendKey(Email_Input,process.env.BACKOFFICE_USERNAME) 
      await this.clickOn(Next)
      await sleep(5000)
      await this.sendKey(Email_Pwd,process.env.BACKOFFICE_PASSWORD)
      await this.clickOn(Next)
      await sleep(5000)

    }
      
    async clickOnSearchButton() {
        await this.clickOn(SEARCH_BUTTON)
      } 
    async clickOnViewDetails() {
        await this.clickOn(VIEW_CLAIM)
      } 
      async clickOnViewClaims() {
        await this.clickOn(VIEW_CLAIMS)
      } 
    async clickOnAuthorisePayment() {
        await this.clickOn(AUTHORISE_PAYMENT)
      }
    async clickOnBackButton() {
        await this.clickOn(BACK_BUTTON)
      } 
    async clickOnWithDraw() {
        await this.clickOn(WITHDRAW)
      }
    async clickOnClaimTab() {
        await this.clickOn(CLAIM_HEADER_LINK)
      }
    async clickOnAgreementsTab() {
        await this.clickOn(AGREEMENTS_HEADER_LINK)
      }  
    async clickOnCheckbox() {
        await this.clickOn(AUTHORISE_PAYMENT_CHECKBOX1)
        await this.clickOn(AUTHORISE_PAYMENT_CHECKBOX2)
      }
    async clickOnConfirm() {
        await this.clickOn(CONFIRMANDCONTINUE)
      }
    async clickOnConfirmToWithdraw() {
        await this.clickOn(WITHDRAW_TRUE)
      }
    async clickOnConfirmNotToWithdraw() {
        await this.clickOn(WITHDRAW_FALSE)
      } 
    async recommendToPay(){
  await this.clickOn(RECCOMEND_TO_PAY)
      }
    async recommendToReject(){
  await this.clickOn(RECCOMEND_TO_REJECT)
      }
    async clickonPaymentConfirm(){
      await this.clickOn(PAY)
    } 
      
    async claimNotFound(){
      await this.elementToContainText(APPLICATION_NOT_FOUND_ACTUAL,CLAIM_NOT_FOUND_EXPECTED)
    }
    async agreementNotFound(){
      await this.elementToContainText(APPLICATION_NOT_FOUND_ACTUAL,APPLICATION_NOT_FOUND_EXPECTED)
    }

    async clickonBack(){
      await this.clickOn(BACK)
    } 

    async clickhistoryTab(){
      await this.clickOn(HISTORY_TAB)
    }

    async clickAgreementsViewDetailsTab(){
      await this.clickOn(AGREEMENT_VIEW_DETAILS)
    }
   

}
module.exports = BackOfficePage