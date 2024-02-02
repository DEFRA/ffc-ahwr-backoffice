@smoke
 Feature: back office-substatuses

   Scenario Outline:  Enter Back office URl ,move onhold to incheck and move incheck to Recommended to Pay
    Given the user is on the backoffice URL
    Then enter email credentials
    When clicks on application link
    When user enters the <Agreement Number>
    Then search button is clicked
    Then click on view application
    Then click on move to incheck button
    Then validate the incheck text
    Then click Back
    Then validate the incheck text
    Then click on view application
    Then verify RecommendToPay button 
    Then verify RecommendToReject button
    When click on claim tab
    Then verify RecommendToPay button 
    Then verify RecommendToReject button
    When click on history tab
    Then verify RecommendToPay button 
    Then verify RecommendToReject button
    Then click on Recommend to Pay
    Then click on confirm and continue
    Then verify error message to select checkboxes
    Then select the checkboxes
    Then click on confirm and continue
    Then validate the Recommended to Pay text
    Then click Back
    Then validate the Recommended to Pay text

  Examples:
  |Agreement Number|  
  |AHWR-D998-1244|

   Scenario Outline:  Authorise to Recommended to Pay
    When user enters the <Agreement Number>
    Then search button is clicked
    Then click on view application
    Then click on confirm and continue for authorise
    Then verify error message to select checkboxes
    Then select the checkboxes
    Then click on confirm and continue for authorise
    Then validate the Ready to Pay text
    Then click Back
    Then validate the Ready to Pay text

  Examples:
  |Agreement Number|  
  |AHWR-4B20-D554|

Scenario Outline:  Enter Back office URl ,move onhold to incheck and move incheck to Recommended to Reject
    When user enters the <Agreement Number>
    Then search button is clicked
    Then click on view application
    Then click on move to incheck button
    Then click on Recommend to Reject
    Then click on confirm and continue
    Then verify error message to select checkboxes
    Then select the checkboxes
    Then click on confirm and continue
    Then validate the Recommended to Reject text
    Then click Back
    Then validate the Recommended to Reject text

  Examples:
  |Agreement Number|  
  |AHWR-E2E6-599E|

Scenario Outline: Reject Claim for Recommended to Reject
    When user enters the <Agreement Number>
    Then search button is clicked
    Then click on view application
    Then click on confirm and continue for reject claim
    Then verify error message to select checkboxes
    Then select the checkboxes
    Then click on confirm and continue for reject claim
    Then validate the Rejected text
    Then click Back
    Then validate the Rejected text

  Examples:
  |Agreement Number|  
  |AHWR-D890-7456|
