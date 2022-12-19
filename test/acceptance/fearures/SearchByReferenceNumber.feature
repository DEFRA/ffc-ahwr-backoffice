Feature: As an internal user,
I want to search for applications using application reference numbers.
So that I can quickly load the application and respond to user inquiries.





Scenario: Search by Reference Number.
Given I am on the application page.
When I type in an application <reference number> in the search bar,
And I clicked the enter button or magnifying glass .
Then an application with the <reference number> should be displayed.

Scenario: Enter Invalid Reference Number.
Given I am on the application page.
When I type in an invalid application reference number in the search bar,
And I clicked the enter button or magnifying glass.
Then A error message should be displayed “Invalid search. its should be application reference or status or sbi number”
