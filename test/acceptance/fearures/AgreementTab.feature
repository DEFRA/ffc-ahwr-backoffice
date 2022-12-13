Feature: As an internal user
I want to see the most recent information on the AHWR agreement page
So that I can be certain that the information on the AHWR agreement page is correct and up to date.



Scenario: Agreement page

Given I am on the agreement tab page.
When I scroll up and around the AHWR page
Then the page's title should be "AHWR agreement,"
And all other titles and content should display the correct information.




Scenario: Search by organization
Given I am on the AHWR page.
When I enter the name "Livsey's Farm" as the organisation in the search bar.
And press the search button
Then a list agreement should be displayed for the organisation.
