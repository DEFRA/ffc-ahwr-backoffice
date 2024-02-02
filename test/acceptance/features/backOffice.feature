@smoke1
 Feature: back office 

   Scenario Outline:  Enter Back office URl Then Recommended to Pay

    Given the user is on the backoffice URL
    Then enter email credentials
    When clicks on application link
    When user enters the <Agreement Number>
    Then search button is clicked
    Then click on view application 
    Then click on Recommend to Pay
    Then select the checkboxes
    #Then confirm payment
    Then click Back
  Examples:
  |Agreement Number|  
  |AHWR-1EA0-57B2|

   Scenario Outline:  Enter Back office URl Then Recommended to Reject

    When user enters the <Agreement Number>
    Then search button is clicked
    Then click on view application 
    Then click on Recommend to Reject
    Then select the checkboxes
    Then click Back
    # Then confirm payment

  Examples:
  |Agreement Number|  
  |AHWR-1EA0-57B2|

   Scenario Outline:  Enter invalid application number Then verify 
    Given the user is on the backoffice URL
    Then enter email credentials
    When clicks on application link
    When user enters the <Agreement Number>
    Then search button is clicked
    Then verify error message
    Then click Back

  Examples:
  |Agreement Number|  
  |AHWR-62A1-5A0A11|

Scenario Outline:   Enter Back office URl Then doesn't withdraw the claim

    When clicks on application link
    When user enters the <Agreement Number>
    When search button is clicked
    Then click on view application 
    When click withdraw
    Then confirm not to withdraw
    Then click Back
  
  Examples:
  |Agreement Number|  
  |AHWR-B00E-B781|


Scenario Outline:  Enter Back office URl Then withdraw the claim

    When user enters the <Agreement Number>
    When search button is clicked
    Then click on view application 
    When click withdraw
    # Then confirm withdraw
    Then click Back
  
  Examples:
  |Agreement Number|  
  |AHWR-B00E-B781|

  Scenario Outline:  Enter Back office URl Then Recommended to Pay

    When user enters the <Agreement Number>
    Then search button is clicked
    Then click on view application 
    Then click on Recommend to Pay
    Then select the checkboxes
    Then click Back
    #Then confirm payment

  Examples:
  |Agreement Number|  
  |106518248|

  Scenario Outline:  Enter Back office URl Then Recommended to Reject

    When user enters the <Agreement Number>
    Then search button is clicked
    Then click on view application 
    Then click on Recommend to Reject
    Then select the checkboxes
    Then click Back
    #Then confirm payment

  Examples:
  |Agreement Number|  
  |106518248|

  Scenario Outline:  Enter invalid application number Then verify 

    When user enters the <Agreement Number>
    Then search button is clicked
    Then verify error message

  Examples:
  |Agreement Number|  
  |106609259233|

  Scenario Outline:   Enter Back office URl Then doesn't withdraw the claim

    When user enters the <Agreement Number>
    When search button is clicked
    Then click on view application 
    When click withdraw
    # Then confirm not to withdraw
  
  Examples:
  |Agreement Number|  
  |106609259|


 Scenario Outline:  Enter Back office URl Then withdraw the claim

    When clicks on application link
    When user enters the <Agreement Number>
    When search button is clicked
    Then click on view application 
    When click withdraw
   # Then confirm withdraw
  
  Examples:
  |Agreement Number|  
  |106609259|