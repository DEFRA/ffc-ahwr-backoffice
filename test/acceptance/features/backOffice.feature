@smoke1
 Feature: back office 

   Scenario Outline:  Enter Back office URl Then Recommend to Pay
   Given the user is on the backoffice URL
   Then enter email credentials
    Then clicked on Claims tab
    When user enters the <claim number>
    Then search button is clicked
    Then click on view claim 
    Then check if History is present
    Then Recomment to Pay
    Then select the checkboxes
   # Then confirm payment
    Then Click Back
  Examples:
  |Claim number|  
  |FUDC-7E7A-12B4|

   Scenario Outline:  Enter Back office URl Then Recommend to Reject
 
   
    When user enters the <Claim number>
    Then search button is clicked
    Then click on view claim 
    Then Recomment to Reject
    Then select the checkboxes
    Then Click Back
  # Then confirm payment
    #Then Click Back

  Examples:
  |Claim numberr|  
  |FUDC-7E7A-12B4|

   Scenario Outline:  Enter invalid application number Then verify 

    
    When user enters the <Invalid number>
    Then search button is clicked
    Then verify error message in claims tab
     #Then Click Back

  Examples:
  |Invalid number|  
  |AHWR-62A1-5A0A11|


  Scenario Outline:  Enter Back office URl Then Recommend to Pay
   
    Then clicked on Agreements tab
    When user enters the <Agreement number>
    Then search button is clicked
    Then click on view claims 
    Then click om Agreements View Details Tab
    Then Recomment to Pay
    Then select the checkboxes
    Then Click Back
#   Then confirm payment

  Examples:
  |Agreement number|  
  |IAHW-F94E-8EBF|

   Scenario Outline:  Enter Back office URl Then Recommend to Reject

    Then clicked on Agreements tab
    When user enters the <Agreement number>
    Then search button is clicked
    Then click on view claims 
    Then click om Agreements View Details Tab
    Then Recomment to Reject
    Then select the checkboxes
    Then Click Back
#    # Then confirm payment

  Examples:
  |Agreement number|  
  |IAHW-F94E-8EBF|

 Scenario Outline:  Enter invalid application number Then verify 

    Then clicked on Agreements tab
    When user enters the <Agreement number>
    Then search button is clicked
    Then verify error message in agreements tab
     #Then Click Back

  Examples:
  |Agreement number|  
  |AHWR-62A1-5A0A11|


   Scenario Outline:  Enter Back office URl and confirm payment
 
    Then clicked on Claims tab
    When user enters the <claim number>
    Then search button is clicked
    Then click on view claim 
    Then confirm payment
    #Then Click Back

  Examples:
  |claim number|  
  |FUDC-92E6-3856|

