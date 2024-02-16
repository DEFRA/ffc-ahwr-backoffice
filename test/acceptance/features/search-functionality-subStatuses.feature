@smoke1
 Feature: Search-substatuses

Scenario Outline: 303780-ensure RECOMMENDED TO PAY Search work 
    Given the user is on the backoffice URL
    Then enter email credentials
    When clicks on application link
    When user enters the RECOMMENDED TO PAY
    Then search button is clicked
    # When I check the records in the 5th column of the table
    # Then each record should contain RECOMMENDED TO PAY
   
Scenario Outline: 303780-ensure RECOMMENDED TO REJECT Search work 
  
    When user enters the RECOMMENDED TO REJECT
    Then search button is clicked

Scenario Outline: 303780-ensure REJECT Search work 
    
    When user enters the REJECT
    Then search button is clicked

Scenario Outline: 303780-ensure WITH Search work 
    
    When user enters the WITH
    Then search button is clicked

Scenario Outline: 303780-ensure AGREED Search work 
    
    When user enters the AGREED
    Then search button is clicked

Scenario Outline: 303780-ensure NOT AGREED Search work 
    
    When user enters the NOT AGREED
    Then search button is clicked

Scenario Outline: 303780-ensure WITHDRAWN Search work 
   
    When user enters the WITHDRAWN
    Then search button is clicked


Scenario Outline: 303780-ensure READY TO PAY Search work 
   
    When user enters the READY TO PAY
    Then search button is clicked

Scenario Outline: 303780-ensure REJECTED Search work 
    
    When user enters the REJECTED
    Then search button is clicked

Scenario Outline: 303780-ensure IN CHECK Search work 
   
    When user enters the IN CHECK
    Then search button is clicked

Scenario Outline: 303780-ensure ON HOLD Search work 
    When user enters the ON HOLD
    Then search button is clicked


Scenario Outline: 303780-ensure RECOMMENDED Search work 
    When user enters the RECOMMENDED
    Then search button is clicked

Scenario Outline: 303780-ensure RECOMM Search work 
    When user enters the RECOMM
    Then search button is clicked