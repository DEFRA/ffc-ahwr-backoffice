Feature: As an internal user,
I want to search for applications by SBI number.
So that I can load the application quickly and respond to user inquiries.


Scenario: Search by SBI Number.
Given I am on the AHWR page "false"
When I enter the SBI number "108831093" the search bar
Then an application with the SBI number "108831093" should be displayed

