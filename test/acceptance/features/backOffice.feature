@smoke1
 Feature: back office 

   Scenario Outline:  Enter Back office URl Then Recommended to Pay
   Given the user is on the backoffice URL
   Then enter email credentials
    When clicks on application link
    When user enters the <CRN number>
    Then search button is clicked
    Then click on view application 
    Then Recomment to Pay
    Then select the checkboxes
   # Then confirm payment
    Then Click Back
  Examples:
  |CRN number|  
  |AHWR-1EA0-57B2|

   Scenario Outline:  Enter Back office URl Then Recommended to Reject
 
   
    When user enters the <CRN number>
    Then search button is clicked
    Then click on view application 
    Then Recomment to Reject
    Then select the checkboxes
     Then Click Back
    # Then confirm payment

  Examples:
  |CRN number|  
  |AHWR-1EA0-57B2|

   Scenario Outline:  Enter invalid application number Then verify 

    
    When user enters the <CRN number>
    Then search button is clicked
    Then verify error message
     Then Click Back

  Examples:
  |CRN number|  
  |AHWR-62A1-5A0A11|

Scenario Outline:   Enter Back office URl Then doesn't withdraw the claim
    
    When clicks on application link
    When user enters the <CRN number>
    When search button is clicked
    Then click on view application 
    When click withdraw
   Then confirm not to withdraw
    Then Click Back
  
   Examples:
  |CRN number|  
  |AHWR-B00E-B781|


Scenario Outline:  Enter Back office URl Then withdraw the claim
      
    When user enters the <CRN number>
    When search button is clicked
    Then click on view application 
    When click withdraw
  # Then confirm withdraw
    Then Click Back
  

   Examples:
  |CRN number|  
  |AHWR-B00E-B781|

   Scenario Outline:  Enter Back office URl Then Recommended to Pay
   
    
    When user enters the <CRN number>
    Then search button is clicked
    Then click on view application 
    Then Recomment to Pay
    Then select the checkboxes
    Then Click Back
   #Then confirm payment

  Examples:
  |CRN number|  
  |106518248|

   Scenario Outline:  Enter Back office URl Then Recommended to Reject
       
    When user enters the <CRN number>
    Then search button is clicked
    Then click on view application 
    Then Recomment to Reject
    Then select the checkboxes
    Then Click Back
   # Then confirm payment

  Examples:
  |CRN number|  
  |106518248|

  Scenario Outline:  Enter invalid application number Then verify 

    
    When user enters the <CRN number>
    Then search button is clicked
    Then verify error message

  Examples:
  |CRN number|  
  |106609259233|

  Scenario Outline:   Enter Back office URl Then doesn't withdraw the claim
   
    When user enters the <CRN number>
    When search button is clicked
    Then click on view application 
    When click withdraw
  # Then confirm not to withdraw
  
   Examples:
  |CRN number|  
  |106609259|


Scenario Outline:  Enter Back office URl Then withdraw the claim
    
    When clicks on application link
    When user enters the <CRN number>
    When search button is clicked
    Then click on view application 
    When click withdraw
   # Then confirm withdraw
  

   Examples:
  |CRN number|  
  |106609259|