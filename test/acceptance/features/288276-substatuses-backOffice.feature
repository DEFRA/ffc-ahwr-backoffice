@smoketest
 Feature: back office-substatuses

   Scenario Outline:  US-288276-Enter Back office URl , move onhold to incheck 
    Given the user is on the backoffice URL
    Then enter email credentials
    When clicks on application link
    When user enters the <Agreement Number>
    Then search button is clicked
    Then click on view application
    When click on claim tab
    Then verify and click move claim to incheck button
    Then click on confirm and continue for incheck
    Then verify error message to select checkboxes
    Then select the checkboxes
    Then click on confirm and continue for incheck
    Then validate the incheck text
    When click on history tab
    Then verify details available
    Then click Back
    Then validate the incheck text

  Examples:
  |Agreement Number|  
  |AHWR-812C-0FB8|

    Scenario Outline: Move incheck to Recommended to Pay
    When user enters the <Agreement Number>
    Then search button is clicked
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
    Then click on confirm and continue for recommend
    Then verify error message to select checkboxes
    Then select the checkboxes
    Then click on confirm and continue for recommend
    Then validate the Recommended to Pay text
    When click on history tab
    Then verify details available
    Then click Back
    Then validate the Recommended to Pay text

  Examples:
  |Agreement Number|  
  |AHWR-812C-0FB8|

   Scenario Outline:  Authorise to Recommended to Pay
    Given the user is on the backoffice URL
    Then enter email credentials
    When clicks on application link
    When user enters the <Agreement Number>
    Then search button is clicked
    Then click on view application
    Then click on confirm and continue for authorise
    Then verify error message to select checkboxes
    Then select the checkboxes
    Then click on confirm and continue for authorise
    Then validate the Ready to Pay text
    When click on history tab
    Then verify details available
    Then click Back
    Then validate the Ready to Pay text

  Examples:
  |Agreement Number|  
  |AHWR-5589-829E|

Scenario Outline:  Move incheck to Recommended to Reject
    When user enters the <Agreement Number>
    Then search button is clicked
    Then click on view application
    Then click on Recommend to Reject
    Then click on confirm and continue for recommend
    Then verify error message to select checkboxes
    Then select the checkboxes 
    Then click on confirm and continue for recommend
    Then validate the Recommended to Reject text
    When click on history tab
    Then verify details available
    Then click Back
    Then validate the Recommended to Reject text

  Examples:
  |Agreement Number|  
  |AHWR-D33D-1B96|

Scenario Outline: Reject Claim for Recommended to Reject
    When user enters the <Agreement Number>
    Then search button is clicked
    Then click on view application
    Then click on confirm and continue for reject claim
    Then verify error message to select checkboxes
    Then select the checkboxes
    Then click on confirm and continue for reject claim
    Then validate the Rejected text
    When click on history tab
    Then verify details available
    Then click Back
    Then validate the Rejected text

  Examples:
  |Agreement Number|  
  |AHWR-A66D-5CEC|
